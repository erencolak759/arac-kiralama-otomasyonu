// ============================================================
// DriveFleet — Express API Sunucusu
// ============================================================
const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3001;

// ---- Middleware ----
app.use(cors());
app.use(express.json());

// ---- Statik Frontend Dosyaları ----
app.use(express.static(path.join(__dirname, '../AracKiralama')));

// ---- API Route'ları ----
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/vehicles',      require('./routes/vehicles'));
app.use('/api/reservations',  require('./routes/reservations'));
app.use('/api/customers',     require('./routes/customers'));
app.use('/api/employees',     require('./routes/employees'));
app.use('/api/branches',      require('./routes/branches'));
app.use('/api/payments',      require('./routes/payments'));
app.use('/api/damage',        require('./routes/damage'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/reports',       require('./routes/reports'));
app.use('/api/campaigns',     require('./routes/campaigns'));
app.use('/api/reviews',       require('./routes/reviews'));

// ---- SPA Fallback ----
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../AracKiralama/index.html'));
});

// ---- Başlat ----
app.listen(PORT, () => {
  console.log('');
  console.log('  ╔══════════════════════════════════════╗');
  console.log('  ║   DriveFleet API Sunucusu Çalışıyor  ║');
  console.log(`  ║   http://localhost:${PORT}              ║`);
  console.log('  ╚══════════════════════════════════════╝');
  console.log('');
});
