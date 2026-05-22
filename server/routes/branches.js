// ============================================================
// BRANCH ROUTES
// ============================================================
const router = require('express').Router();
const pool   = require('../db');

// GET /api/branches
router.get('/', async (req, res) => {
  try {
    const r = await pool.query('SELECT id, name, city, address, phone FROM branches ORDER BY id');
    res.json(r.rows);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Sunucu hatası.' }); }
});

// POST /api/branches
router.post('/', async (req, res) => {
  const { name, city, address, phone } = req.body;
  if (!name || !city || !address || !phone)
    return res.status(400).json({ error: 'Tüm alanlar zorunludur.' });
  try {
    const r = await pool.query(
      'INSERT INTO branches (name,city,address,phone) VALUES ($1,$2,$3,$4) RETURNING *',
      [name, city, address, phone]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Sunucu hatası.' }); }
});

// PUT /api/branches/:id
router.put('/:id', async (req, res) => {
  const { name, city, address, phone } = req.body;
  try {
    const r = await pool.query(
      'UPDATE branches SET name=$1,city=$2,address=$3,phone=$4 WHERE id=$5 RETURNING *',
      [name, city, address, phone, req.params.id]
    );
    if (!r.rows[0]) return res.status(404).json({ error: 'Şube bulunamadı.' });
    res.json(r.rows[0]);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Sunucu hatası.' }); }
});

// DELETE /api/branches/:id
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM branches WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Sunucu hatası.' }); }
});

module.exports = router;
