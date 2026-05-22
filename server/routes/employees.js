// ============================================================
// EMPLOYEE ROUTES
// ============================================================
const router = require('express').Router();
const pool   = require('../db');

const SEL = `
  SELECT id, first_name AS "firstName", last_name AS "lastName",
         email, role, branch_id AS "branchId"
  FROM employees
`;

// GET /api/employees
router.get('/', async (req, res) => {
  try {
    const r = await pool.query(SEL + ' ORDER BY id');
    res.json(r.rows);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Sunucu hatası.' }); }
});

// POST /api/employees
router.post('/', async (req, res) => {
  const { firstName, lastName, email, password, role, branchId } = req.body;
  if (!firstName || !lastName || !email || !password || !role)
    return res.status(400).json({ error: 'Tüm alanlar zorunludur.' });
  try {
    const r = await pool.query(
      `INSERT INTO employees (first_name, last_name, email, role, password_hash, branch_id)
       VALUES ($1,$2,$3,$4, crypt($5, gen_salt('bf',10)), $6)
       RETURNING id, first_name AS "firstName", last_name AS "lastName",
                 email, role, branch_id AS "branchId"`,
      [firstName, lastName, email.toLowerCase(), role, password, branchId || null]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'Bu e-posta zaten kayıtlı.' });
    console.error(e); res.status(500).json({ error: 'Sunucu hatası.' });
  }
});

// DELETE /api/employees/:id
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM employees WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Sunucu hatası.' }); }
});

module.exports = router;
