// ============================================================
// RESERVATION ROUTES
// ============================================================
const router = require('express').Router();
const pool   = require('../db');

const SEL = `
  SELECT id, customer_id AS "customerId", vehicle_id AS "vehicleId",
         start_date AS "startDate", end_date AS "endDate",
         total_amount AS "totalAmount", status, payment_status AS "paymentStatus",
         pickup_branch_id AS "pickupBranchId", return_branch_id AS "returnBranchId",
         return_km AS "returnKm", fuel_level AS "fuelLevel",
         created_at AS "createdAt"
  FROM reservations
`;

// GET /api/reservations
router.get('/', async (req, res) => {
  try {
    const r = await pool.query(SEL + ' ORDER BY id DESC');
    res.json(r.rows);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Sunucu hatası.' }); }
});

// POST /api/reservations
router.post('/', async (req, res) => {
  const {
    customerId, vehicleId, startDate, endDate, totalAmount,
    pickupBranchId, returnBranchId, extras
  } = req.body;

  if (!customerId || !vehicleId || !startDate || !endDate || !totalAmount)
    return res.status(400).json({ error: 'Zorunlu alanlar eksik.' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const r = await client.query(
      `INSERT INTO reservations
         (customer_id,vehicle_id,start_date,end_date,total_amount,
          status,payment_status,pickup_branch_id,return_branch_id)
       VALUES ($1,$2,$3,$4,$5,'Active','Paid',$6,$7)
       RETURNING id, customer_id AS "customerId", vehicle_id AS "vehicleId",
                 start_date AS "startDate", end_date AS "endDate",
                 total_amount AS "totalAmount", status, payment_status AS "paymentStatus",
                 pickup_branch_id AS "pickupBranchId", return_branch_id AS "returnBranchId",
                 created_at AS "createdAt"`,
      [customerId, vehicleId, startDate, endDate, totalAmount, pickupBranchId, returnBranchId]
    );
    const res_id = r.rows[0].id;

    // Ek hizmetleri kaydet
    if (extras && extras.length > 0) {
      for (const ex of extras) {
        await client.query(
          'INSERT INTO reservation_extras (reservation_id, service_name, price) VALUES ($1,$2,$3)',
          [res_id, ex.serviceName, ex.price]
        );
      }
    }

    // Aracı 'Rented' yap
    await client.query('UPDATE vehicles SET status=$1 WHERE id=$2', ['Rented', vehicleId]);

    await client.query('COMMIT');
    res.status(201).json(r.rows[0]);
  } catch (e) {
    await client.query('ROLLBACK');
    console.error(e); res.status(500).json({ error: 'Rezervasyon oluşturulamadı.' });
  } finally {
    client.release();
  }
});

// PUT /api/reservations/:id/cancel
router.put('/:id/cancel', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const r = await client.query(
      `UPDATE reservations SET status='Cancelled' WHERE id=$1
       RETURNING vehicle_id AS "vehicleId"`,
      [req.params.id]
    );
    if (!r.rows[0]) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Rezervasyon bulunamadı.' }); }
    await client.query(`UPDATE vehicles SET status='Available' WHERE id=$1 AND status='Rented'`, [r.rows[0].vehicleId]);
    await client.query('COMMIT');
    res.json({ success: true });
  } catch (e) {
    await client.query('ROLLBACK');
    console.error(e); res.status(500).json({ error: 'Sunucu hatası.' });
  } finally { client.release(); }
});

// PUT /api/reservations/:id/return
router.put('/:id/return', async (req, res) => {
  const { returnKm, fuelLevel, vehicleStatus, lateCharge } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Gecikme ücreti varsa toplama ekle ve ödeme durumunu Pending yap
    const updateTotal = lateCharge && lateCharge > 0
      ? ', total_amount = total_amount + $4, payment_status = \'Pending\''
      : '';
    const params = [returnKm, fuelLevel || 80, req.params.id];
    if (lateCharge) params.push(lateCharge);

    const r = await client.query(
      `UPDATE reservations
       SET status='Completed', return_km=$1, fuel_level=$2 ${updateTotal}
       WHERE id=$3
       RETURNING vehicle_id AS "vehicleId", total_amount AS "totalAmount"`,
      params
    );
    if (!r.rows[0]) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Rezervasyon bulunamadı.' }); }

    // Araç durumunu güncelle (Available veya Maintenance)
    const newStatus = vehicleStatus || 'Available';
    await client.query(
      'UPDATE vehicles SET status=$1, km=$2 WHERE id=$3',
      [newStatus, returnKm, r.rows[0].vehicleId]
    );

    await client.query('COMMIT');
    res.json({ success: true, totalAmount: r.rows[0].totalAmount });
  } catch (e) {
    await client.query('ROLLBACK');
    console.error(e); res.status(500).json({ error: 'İade işlemi başarısız.' });
  } finally { client.release(); }
});

module.exports = router;
