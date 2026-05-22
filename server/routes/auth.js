// ============================================================
// AUTH ROUTES — Giriş, Kayıt, Şifremi Unuttum
// ============================================================
const router = require('express').Router();
const pool   = require('../db');

// ---- Giriş ----
router.post('/login', async (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role)
    return res.status(400).json({ error: 'E-posta, şifre ve rol gerekli.' });

  try {
    if (role === 'Customer') {
      // Hesap kilitleme kontrolü
      const lockQ = await pool.query(
        'SELECT locked_until FROM customers WHERE LOWER(email)=$1',
        [email.toLowerCase()]
      );
      if (lockQ.rows[0]?.locked_until) {
        const lockedUntil = new Date(lockQ.rows[0].locked_until);
        if (lockedUntil > new Date()) {
          const mins = Math.ceil((lockedUntil - new Date()) / 60000);
          return res.status(429).json({ error: `Hesap kilitlendi. ${mins} dakika sonra deneyin.` });
        }
      }

      // Kimlik doğrulama
      const result = await pool.query(
        `SELECT id, national_id AS "nationalId", license_no AS "licenseNo",
                first_name AS "firstName", last_name AS "lastName",
                email, phone, created_at AS "createdAt"
         FROM customers
         WHERE LOWER(email)=$1 AND password_hash = crypt($2, password_hash)`,
        [email.toLowerCase(), password]
      );

      if (!result.rows[0]) {
        // Başarısız giriş sayacı
        await pool.query(
          `UPDATE customers
           SET failed_attempts = COALESCE(failed_attempts,0) + 1,
               locked_until = CASE
                 WHEN COALESCE(failed_attempts,0) + 1 >= 5
                 THEN NOW() + INTERVAL '15 minutes'
                 ELSE locked_until
               END
           WHERE LOWER(email)=$1`,
          [email.toLowerCase()]
        );
        return res.status(401).json({ error: 'E-posta veya şifre hatalı.' });
      }

      // Başarılı — sayacı sıfırla
      await pool.query(
        'UPDATE customers SET failed_attempts=0, locked_until=NULL WHERE id=$1',
        [result.rows[0].id]
      );

      return res.json({ user: result.rows[0], role: 'Customer' });

    } else {
      // Personel / Admin girişi
      const result = await pool.query(
        `SELECT id, first_name AS "firstName", last_name AS "lastName",
                email, role, branch_id AS "branchId"
         FROM employees
         WHERE LOWER(email)=$1 AND password_hash = crypt($2, password_hash)`,
        [email.toLowerCase(), password]
      );

      if (!result.rows[0])
        return res.status(401).json({ error: 'E-posta veya şifre hatalı.' });

      const emp = result.rows[0];
      if (role === 'Admin' && emp.role !== 'Admin')
        return res.status(401).json({ error: 'Yönetici yetkisi gerekli.' });
      if (role === 'Employee' && emp.role === 'Admin')
        return res.status(401).json({ error: 'Admin hesabı için Yönetici sekmesini kullanın.' });

      return res.json({ user: emp, role: emp.role });
    }
  } catch (e) {
    console.error('/auth/login hata:', e);
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
});

// ---- Kayıt ----
router.post('/register', async (req, res) => {
  const { firstName, lastName, nationalId, licenseNo, email, phone, password } = req.body;

  if (!firstName || !lastName || !nationalId || !licenseNo || !email || !phone || !password)
    return res.status(400).json({ error: 'Tüm alanlar zorunludur.' });
  if (nationalId.length !== 11)
    return res.status(400).json({ error: 'TC No 11 haneli olmalı.' });
  if (password.length < 6)
    return res.status(400).json({ error: 'Şifre en az 6 karakter.' });

  try {
    const exists = await pool.query(
      'SELECT id FROM customers WHERE LOWER(email)=$1', [email.toLowerCase()]
    );
    if (exists.rows[0])
      return res.status(409).json({ error: 'Bu e-posta zaten kayıtlı.' });

    const result = await pool.query(
      `INSERT INTO customers
         (national_id, license_no, first_name, last_name, email, phone, password_hash)
       VALUES ($1,$2,$3,$4,$5,$6, crypt($7, gen_salt('bf',10)))
       RETURNING id, first_name AS "firstName", last_name AS "lastName",
                 email, phone, national_id AS "nationalId",
                 license_no AS "licenseNo", created_at AS "createdAt"`,
      [nationalId, licenseNo, firstName, lastName, email.toLowerCase(), phone, password]
    );
    res.status(201).json(result.rows[0]);
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'Bu bilgilerle kayıt mevcut.' });
    console.error('/auth/register hata:', e);
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
});

// ---- Şifremi Unuttum / Sıfırla ----
router.post('/forgot-password', async (req, res) => {
  const { email, newPassword } = req.body;
  if (!email) return res.status(400).json({ error: 'E-posta gerekli.' });

  try {
    const exists = await pool.query(
      'SELECT id FROM customers WHERE LOWER(email)=$1', [email.toLowerCase()]
    );
    if (!exists.rows[0])
      return res.status(404).json({ error: 'Bu e-posta ile kayıtlı hesap bulunamadı.' });

    if (newPassword) {
      if (newPassword.length < 6)
        return res.status(400).json({ error: 'Şifre en az 6 karakter olmalı.' });

      await pool.query(
        `UPDATE customers
         SET password_hash = crypt($1, gen_salt('bf',10)),
             failed_attempts = 0, locked_until = NULL
         WHERE LOWER(email)=$2`,
        [newPassword, email.toLowerCase()]
      );
      return res.json({ success: true, message: 'Şifre başarıyla güncellendi.' });
    }

    // Sadece e-posta kontrolü (simüle link gönderimi)
    res.json({ success: true, message: 'Şifre sıfırlama doğrulaması tamamlandı.' });
  } catch (e) {
    console.error('/auth/forgot-password hata:', e);
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
});

module.exports = router;
