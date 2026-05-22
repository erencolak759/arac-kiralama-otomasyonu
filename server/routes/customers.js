// ============================================================
// CUSTOMER ROUTES
// ============================================================
const router = require('express').Router();
const pool   = require('../db');

const SEL = `
  SELECT id, national_id AS "nationalId", license_no AS "licenseNo",
         first_name AS "firstName", last_name AS "lastName",
         email, phone, created_at AS "createdAt"
  FROM customers
`;

// GET /api/customers
router.get('/', async (req, res) => {
  try {
    const r = await pool.query(SEL + ' ORDER BY id');
    res.json(r.rows);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Sunucu hatası.' }); }
});

// PUT /api/customers/:id — Profil güncelle
router.put('/:id', async (req, res) => {
  const { firstName, lastName, licenseNo, email, phone } = req.body;
  try {
    const r = await pool.query(
      `UPDATE customers
       SET first_name=$1, last_name=$2, license_no=$3, email=$4, phone=$5
       WHERE id=$6
       RETURNING id, first_name AS "firstName", last_name AS "lastName",
                 license_no AS "licenseNo", email, phone`,
      [firstName, lastName, licenseNo, email, phone, req.params.id]
    );
    if (!r.rows[0]) return res.status(404).json({ error: 'Müşteri bulunamadı.' });
    res.json(r.rows[0]);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Sunucu hatası.' }); }
});

// PUT /api/customers/:id/password — Şifre güncelle
router.put('/:id/password', async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword)
    return res.status(400).json({ error: 'Eski ve yeni şifre gerekli.' });
  if (newPassword.length < 6)
    return res.status(400).json({ error: 'Şifre en az 6 karakter.' });
  try {
    const check = await pool.query(
      'SELECT id FROM customers WHERE id=$1 AND password_hash=crypt($2, password_hash)',
      [req.params.id, oldPassword]
    );
    if (!check.rows[0])
      return res.status(401).json({ error: 'Mevcut şifre hatalı.' });

    await pool.query(
      `UPDATE customers SET password_hash=crypt($1, gen_salt('bf',10)) WHERE id=$2`,
      [newPassword, req.params.id]
    );
    res.json({ success: true });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Sunucu hatası.' }); }
});

module.exports = router;
