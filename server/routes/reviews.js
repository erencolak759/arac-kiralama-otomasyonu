// ============================================================
// Araç Yorumları (Reviews) API Route'ları
// ============================================================
const express = require('express');
const router  = express.Router();
const db      = require('../db');

// GET /api/reviews?vehicleId=X — Araç yorumlarını getir
router.get('/', async (req, res) => {
  try {
    const { vehicleId } = req.query;
    let q = 'SELECT * FROM reviews ORDER BY created_at DESC';
    let params = [];
    if (vehicleId) {
      q = 'SELECT * FROM reviews WHERE vehicle_id = $1 ORDER BY created_at DESC';
      params = [vehicleId];
    }
    const { rows } = await db.query(q, params);
    res.json(rows.map(r => ({
      id:         r.id,
      vehicleId:  r.vehicle_id,
      customerId: r.customer_id,
      authorName: r.author_name,
      rating:     r.rating,
      comment:    r.comment,
      createdAt:  r.created_at
    })));
  } catch (e) {
    console.error('reviews GET error:', e.message);
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
});

// POST /api/reviews — Yeni yorum ekle
router.post('/', async (req, res) => {
  const { vehicleId, customerId, authorName, rating, comment } = req.body;
  if (!vehicleId || !rating || !comment) {
    return res.status(400).json({ error: 'vehicleId, rating ve comment zorunludur.' });
  }
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Puan 1-5 arasında olmalıdır.' });
  }
  try {
    const { rows } = await db.query(
      `INSERT INTO reviews (vehicle_id, customer_id, author_name, rating, comment)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [vehicleId, customerId || null, authorName || 'Anonim', rating, comment]
    );
    const r = rows[0];
    res.status(201).json({
      id:         r.id,
      vehicleId:  r.vehicle_id,
      customerId: r.customer_id,
      authorName: r.author_name,
      rating:     r.rating,
      comment:    r.comment,
      createdAt:  r.created_at
    });
  } catch (e) {
    console.error('reviews POST error:', e.message);
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
});

module.exports = router;
