// ============================================================
// VEHICLE ROUTES
// ============================================================
const router = require('express').Router();
const pool   = require('../db');

const SEL = `
  SELECT id, plate, brand, model, year, category,
         daily_rate AS "dailyRate", status,
         branch_id  AS "branchId", km,
         fuel_type  AS "fuelType", seats
  FROM vehicles
`;

// GET /api/vehicles
router.get('/', async (req, res) => {
  try {
    const r = await pool.query(SEL + ' ORDER BY id');
    res.json(r.rows);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Sunucu hatası.' }); }
});

// GET /api/vehicles/available?startDate=&endDate=&branchId=&category=
router.get('/available', async (req, res) => {
  const { startDate, endDate, branchId, category } = req.query;
  if (!startDate || !endDate)
    return res.status(400).json({ error: 'startDate ve endDate gerekli.' });

  try {
    const params = [startDate, endDate];
    let idx = 3;
    let where = `
      WHERE status != 'Maintenance'
      AND id NOT IN (
        SELECT vehicle_id FROM reservations
        WHERE status NOT IN ('Cancelled','Completed')
          AND NOT (end_date <= $1 OR start_date >= $2)
      )
    `;
    if (branchId)                   { where += ` AND branch_id=$${idx}`; params.push(branchId); idx++; }
    if (category && category !== 'all') { where += ` AND category=$${idx}`;  params.push(category); }

    const r = await pool.query(SEL + where + ' ORDER BY daily_rate', params);
    res.json(r.rows);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Sunucu hatası.' }); }
});

// POST /api/vehicles
router.post('/', async (req, res) => {
  const { plate, brand, model, year, category, dailyRate, branchId, km, fuelType, seats } = req.body;
  if (!plate || !brand || !model || !year || !category || !dailyRate)
    return res.status(400).json({ error: 'Zorunlu alanlar eksik.' });
  try {
    const r = await pool.query(
      `INSERT INTO vehicles (plate,brand,model,year,category,daily_rate,status,branch_id,km,fuel_type,seats)
       VALUES ($1,$2,$3,$4,$5,$6,'Available',$7,$8,$9,$10)
       RETURNING id,plate,brand,model,year,category,
                 daily_rate AS "dailyRate",status,branch_id AS "branchId",
                 km,fuel_type AS "fuelType",seats`,
      [plate, brand, model, year, category, dailyRate, branchId, km || 0, fuelType || 'Benzin', seats || 5]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'Bu plaka zaten kayıtlı.' });
    console.error(e); res.status(500).json({ error: 'Sunucu hatası.' });
  }
});

// PUT /api/vehicles/:id
router.put('/:id', async (req, res) => {
  const { brand, model, plate, year, category, dailyRate, status, branchId, km, fuelType } = req.body;
  try {
    const r = await pool.query(
      `UPDATE vehicles
       SET brand=$1,model=$2,plate=$3,year=$4,category=$5,
           daily_rate=$6,status=$7,branch_id=$8,km=$9,fuel_type=$10
       WHERE id=$11
       RETURNING id,plate,brand,model,year,category,
                 daily_rate AS "dailyRate",status,branch_id AS "branchId",
                 km,fuel_type AS "fuelType",seats`,
      [brand, model, plate, year, category, dailyRate, status || 'Available', branchId, km, fuelType, req.params.id]
    );
    if (!r.rows[0]) return res.status(404).json({ error: 'Araç bulunamadı.' });
    res.json(r.rows[0]);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Sunucu hatası.' }); }
});

// PATCH /api/vehicles/:id/status
router.patch('/:id/status', async (req, res) => {
  const { status } = req.body;
  const valid = ['Available','Rented','Maintenance'];
  if (!valid.includes(status))
    return res.status(400).json({ error: 'Geçersiz durum.' });

  try {
    const check = await pool.query('SELECT status FROM vehicles WHERE id=$1', [req.params.id]);
    if (check.rows[0]?.status === 'Rented')
      return res.status(400).json({ error: 'Kiradaki araç durumu değiştirilemez.' });

    const r = await pool.query(
      'UPDATE vehicles SET status=$1 WHERE id=$2 RETURNING id, status',
      [status, req.params.id]
    );
    res.json(r.rows[0]);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Sunucu hatası.' }); }
});

// DELETE /api/vehicles/:id
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM vehicles WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Sunucu hatası.' }); }
});

module.exports = router;
