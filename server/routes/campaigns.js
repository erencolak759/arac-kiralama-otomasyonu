// ============================================================
// CAMPAIGN ROUTES
// ============================================================
const router = require('express').Router();
const pool   = require('../db');

// GET /api/campaigns
router.get('/', async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT id, title, description, tag, color,
              discount_percent AS "discountPercent",
              category, is_active AS "isActive", created_at AS "createdAt"
       FROM campaigns ORDER BY id`
    );
    res.json(r.rows);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Sunucu hatası.' }); }
});

// POST /api/campaigns
router.post('/', async (req, res) => {
  const { title, description, tag, color, discountPercent, category, isActive } = req.body;
  if (!title) return res.status(400).json({ error: 'Kampanya başlığı gerekli.' });
  try {
    const r = await pool.query(
      `INSERT INTO campaigns (title,description,tag,color,discount_percent,category,is_active)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING id,title,description,tag,color,
                 discount_percent AS "discountPercent",
                 category,is_active AS "isActive",created_at AS "createdAt"`,
      [title, description, tag || 'Kampanya', color || 'c1', discountPercent || 0, category || null, isActive !== false]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Sunucu hatası.' }); }
});

// PUT /api/campaigns/:id
router.put('/:id', async (req, res) => {
  const { title, description, tag, color, discountPercent, category, isActive } = req.body;
  try {
    const r = await pool.query(
      `UPDATE campaigns
       SET title=$1,description=$2,tag=$3,color=$4,discount_percent=$5,category=$6,is_active=$7
       WHERE id=$8
       RETURNING id,title,description,tag,color,
                 discount_percent AS "discountPercent",
                 category,is_active AS "isActive"`,
      [title, description, tag, color, discountPercent, category || null, isActive, req.params.id]
    );
    if (!r.rows[0]) return res.status(404).json({ error: 'Kampanya bulunamadı.' });
    res.json(r.rows[0]);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Sunucu hatası.' }); }
});

// DELETE /api/campaigns/:id
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM campaigns WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Sunucu hatası.' }); }
});

module.exports = router;
