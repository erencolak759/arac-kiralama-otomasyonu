// ============================================================
// PostgreSQL Bağlantı Havuzu
// ============================================================
const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '5433'),
  database: process.env.DB_NAME     || 'arac_kiralama',
  user:     process.env.DB_USER     || 'drivefleet',
  password: process.env.DB_PASSWORD || 'drivefleet123',
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('PostgreSQL bağlantı hatası:', err.message);
});

module.exports = pool;
