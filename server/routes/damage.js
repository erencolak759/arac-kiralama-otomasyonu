// ============================================================
// DAMAGE REPORT ROUTES
// ============================================================
const router = require('express').Router();
const pool   = require('../db');

// GET /api/damage
router.get('/', async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT id, reservation_id AS "reservationId", employee_id AS "employeeId",
              description, extra_charge AS "extraCharge",
              created_at AS "createdAt"
       FROM damage_reports ORDER BY id DESC`
    );
    res.json(r.rows);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Sunucu hatası.' }); }
});

// POST /api/damage
router.post('/', async (req, res) => {
  const { reservationId, employeeId, description, extraCharge } = req.body;
  if (!reservationId || !description)
    return res.status(400).json({ error: 'Rezervasyon ID ve açıklama gerekli.' });
  try {
    const r = await pool.query(
      `INSERT INTO damage_reports (reservation_id, employee_id, description, extra_charge)
       VALUES ($1,$2,$3,$4)
       RETURNING id, reservation_id AS "reservationId", employee_id AS "employeeId",
                 description, extra_charge AS "extraCharge", created_at AS "createdAt"`,
      [reservationId, employeeId, description, extraCharge || 0]
    );
    // Ek ücret varsa rezervasyon toplamına ekle
    if (extraCharge && extraCharge > 0) {
      await pool.query(
        'UPDATE reservations SET total_amount = total_amount + $1 WHERE id=$2',
        [extraCharge, reservationId]
      );
    }
    res.status(201).json(r.rows[0]);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Sunucu hatası.' }); }
});

module.exports = router;
