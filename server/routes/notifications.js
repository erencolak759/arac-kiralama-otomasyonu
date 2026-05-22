// ============================================================
// NOTIFICATION ROUTES
// ============================================================
const router = require('express').Router();
const pool   = require('../db');

// GET /api/notifications
router.get('/', async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT id, customer_id AS "customerId", reservation_id AS "reservationId",
              type, subject, body, status, created_at AS "createdAt"
       FROM notifications ORDER BY id DESC`
    );
    res.json(r.rows);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Sunucu hatası.' }); }
});

// POST /api/notifications
router.post('/', async (req, res) => {
  const { customerId, reservationId, type, subject, body } = req.body;
  if (!customerId) return res.status(400).json({ error: 'customerId gerekli.' });
  try {
    const r = await pool.query(
      `INSERT INTO notifications (customer_id, reservation_id, type, subject, body)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING id, customer_id AS "customerId", reservation_id AS "reservationId",
                 type, subject, body, status, created_at AS "createdAt"`,
      [customerId, reservationId || null, type || 'Email', subject, body]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Sunucu hatası.' }); }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', async (req, res) => {
  try {
    await pool.query("UPDATE notifications SET status='Read' WHERE id=$1", [req.params.id]);
    res.json({ success: true });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Sunucu hatası.' }); }
});

module.exports = router;
