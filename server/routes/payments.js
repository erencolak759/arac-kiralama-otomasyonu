// ============================================================
// PAYMENT ROUTES
// ============================================================
const router = require('express').Router();
const pool   = require('../db');

// GET /api/payments
router.get('/', async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT id, reservation_id AS "reservationId", transaction_id AS "transactionId",
              payment_date AS "paymentDate", amount
       FROM payments ORDER BY id DESC`
    );
    res.json(r.rows);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Sunucu hatası.' }); }
});

// POST /api/payments
router.post('/', async (req, res) => {
  const { reservationId, transactionId, amount } = req.body;
  if (!reservationId || !amount)
    return res.status(400).json({ error: 'Zorunlu alanlar eksik.' });
  try {
    const txnId = transactionId || 'TXN' + Date.now();
    const r = await pool.query(
      `INSERT INTO payments (reservation_id, transaction_id, amount)
       VALUES ($1,$2,$3)
       RETURNING id, reservation_id AS "reservationId",
                 transaction_id AS "transactionId",
                 payment_date AS "paymentDate", amount`,
      [reservationId, txnId, amount]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Sunucu hatası.' }); }
});

module.exports = router;
