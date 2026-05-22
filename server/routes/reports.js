// ============================================================
// REPORTS ROUTES
// ============================================================
const router = require('express').Router();
const pool   = require('../db');

// GET /api/reports
router.get('/', async (req, res) => {
  try {
    const [branchReport, catReport, monthlyReport, damageReport] = await Promise.all([
      // Şube bazlı gelir raporu
      pool.query(`
        SELECT b.id, b.name, b.city,
               COUNT(r.id) AS "reservationCount",
               COALESCE(SUM(r.total_amount) FILTER (WHERE r.payment_status='Paid'), 0) AS income
        FROM branches b
        LEFT JOIN vehicles v ON v.branch_id = b.id
        LEFT JOIN reservations r ON r.vehicle_id = v.id
        GROUP BY b.id, b.name, b.city
        ORDER BY income DESC
      `),
      // Kategori dağılımı
      pool.query(`
        SELECT category, COUNT(*) AS count,
               ROUND(COUNT(*)*100.0 / SUM(COUNT(*)) OVER (), 1) AS pct
        FROM vehicles GROUP BY category
      `),
      // Aylık gelir (son 6 ay)
      pool.query(`
        SELECT TO_CHAR(created_at, 'YYYY-MM') AS month,
               SUM(total_amount) AS income,
               COUNT(*) AS count
        FROM reservations
        WHERE payment_status='Paid'
          AND created_at >= CURRENT_DATE - INTERVAL '6 months'
        GROUP BY month ORDER BY month
      `),
      // Hasar özeti
      pool.query(`
        SELECT COUNT(*) AS total,
               COALESCE(SUM(extra_charge),0) AS total_charge
        FROM damage_reports
      `)
    ]);

    res.json({
      byBranch:  branchReport.rows,
      byCategory: catReport.rows,
      monthly:   monthlyReport.rows,
      damage:    damageReport.rows[0]
    });
  } catch (e) {
    console.error(e); res.status(500).json({ error: 'Sunucu hatası.' });
  }
});

module.exports = router;
