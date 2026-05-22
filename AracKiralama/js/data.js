// ========== VERİTABANI — BAŞLANGIÇ VERİSİ (SEED) ==========

const SEED_DATA = {
  customers: [
    { id: 1, nationalId: "12345678901", licenseNo: "06AB1234", firstName: "Ahmet",   lastName: "Yılmaz", email: "ahmet@mail.com",  phone: "05321112233", passwordHash: "123456", createdAt: "2025-01-10" },
    { id: 2, nationalId: "98765432109", licenseNo: "34CD5678", firstName: "Ayşe",    lastName: "Kaya",   email: "ayse@mail.com",   phone: "05439998877", passwordHash: "123456", createdAt: "2025-02-15" },
    { id: 3, nationalId: "11122233344", licenseNo: "35EF9012", firstName: "Mustafa", lastName: "Öztürk", email: "mustafa@mail.com",phone: "05551234567", passwordHash: "123456", createdAt: "2025-03-01" },
    { id: 4, nationalId: "55566677788", licenseNo: "01GH3456", firstName: "Zeynep",  lastName: "Arslan", email: "zeynep@mail.com", phone: "05367654321", passwordHash: "123456", createdAt: "2025-03-20" }
  ],

  employees: [
    { id: 1, firstName: "Mehmet", lastName: "Demir",  email: "mehmet@arackiralama.com", role: "Employee", passwordHash: "emp123",   branchId: 1 },
    { id: 2, firstName: "Fatma",  lastName: "Çelik",  email: "fatma@arackiralama.com",  role: "Employee", passwordHash: "emp123",   branchId: 2 },
    { id: 3, firstName: "Ali",    lastName: "Şahin",  email: "ali@arackiralama.com",    role: "Employee", passwordHash: "emp123",   branchId: 3 },
    { id: 4, firstName: "Admin",  lastName: "User",   email: "admin@arackiralama.com",  role: "Admin",    passwordHash: "admin123", branchId: null }
  ],

  branches: [
    { id: 1, name: "İstanbul Merkez Şube", city: "İstanbul", address: "Atatürk Cad. No:1, Şişli",        phone: "02121234567" },
    { id: 2, name: "Ankara Kızılay Şube",  city: "Ankara",   address: "Kızılay Meydan No:5, Çankaya",    phone: "03121234567" },
    { id: 3, name: "İzmir Alsancak Şube",  city: "İzmir",    address: "Alsancak Kordon No:12, Konak",    phone: "02321234567" },
    { id: 4, name: "Bursa Merkez Şube",    city: "Bursa",    address: "Cumhuriyet Cad. No:8, Nilüfer",   phone: "02241234567" }
  ],

  vehicles: [
    { id: 1,  plate: "34ABC123", brand: "Renault",    model: "Clio",      year: 2022, category: "Economy", dailyRate: 750,  status: "Available",   branchId: 1, km: 45000, fuelType: "Benzin", seats: 5 },
    { id: 2,  plate: "34XYZ456", brand: "Volkswagen", model: "Passat",    year: 2023, category: "Comfort", dailyRate: 1200, status: "Available",   branchId: 1, km: 22000, fuelType: "Dizel",  seats: 5 },
    { id: 3,  plate: "06DEF789", brand: "Toyota",     model: "RAV4",      year: 2023, category: "SUV",     dailyRate: 1800, status: "Rented",      branchId: 2, km: 15000, fuelType: "Hibrit", seats: 5 },
    { id: 4,  plate: "06GHI012", brand: "BMW",        model: "5 Serisi",  year: 2024, category: "Premium", dailyRate: 3500, status: "Available",   branchId: 2, km: 8000,  fuelType: "Benzin", seats: 5 },
    { id: 5,  plate: "35JKL345", brand: "Ford",       model: "Focus",     year: 2022, category: "Economy", dailyRate: 800,  status: "Maintenance", branchId: 3, km: 60000, fuelType: "Benzin", seats: 5 },
    { id: 6,  plate: "35MNO678", brand: "Mercedes",   model: "E200",      year: 2024, category: "Premium", dailyRate: 4200, status: "Available",   branchId: 3, km: 5000,  fuelType: "Benzin", seats: 5 },
    { id: 7,  plate: "34PQR901", brand: "Hyundai",    model: "Tucson",    year: 2023, category: "SUV",     dailyRate: 1650, status: "Available",   branchId: 1, km: 18000, fuelType: "Dizel",  seats: 5 },
    { id: 8,  plate: "06STU234", brand: "Skoda",      model: "Octavia",   year: 2022, category: "Comfort", dailyRate: 1100, status: "Available",   branchId: 2, km: 35000, fuelType: "Dizel",  seats: 5 },
    { id: 9,  plate: "16VWX567", brand: "Fiat",       model: "Egea",      year: 2023, category: "Economy", dailyRate: 700,  status: "Available",   branchId: 4, km: 28000, fuelType: "Benzin", seats: 5 },
    { id: 10, plate: "16YZA890", brand: "Audi",       model: "A6",        year: 2024, category: "Premium", dailyRate: 4800, status: "Available",   branchId: 4, km: 3000,  fuelType: "Dizel",  seats: 5 }
  ],

  reservations: [
    { id: 1, customerId: 1, vehicleId: 3, startDate: "2025-05-10", endDate: "2025-05-15", totalAmount: 9000, status: "Completed", paymentStatus: "Paid", pickupBranchId: 2, returnBranchId: 2, returnKm: 15800, fuelLevel: 70, createdAt: "2025-05-08" },
    { id: 2, customerId: 2, vehicleId: 1, startDate: "2025-05-18", endDate: "2025-05-20", totalAmount: 1500, status: "Active",    paymentStatus: "Paid", pickupBranchId: 1, returnBranchId: 1, returnKm: null,  fuelLevel: null, createdAt: "2025-05-17" },
    { id: 3, customerId: 3, vehicleId: 2, startDate: "2025-04-01", endDate: "2025-04-05", totalAmount: 4800, status: "Completed", paymentStatus: "Paid", pickupBranchId: 1, returnBranchId: 1, returnKm: 22500, fuelLevel: 90, createdAt: "2025-03-30" },
    { id: 4, customerId: 4, vehicleId: 4, startDate: "2025-05-01", endDate: "2025-05-03", totalAmount: 7000, status: "Completed", paymentStatus: "Paid", pickupBranchId: 2, returnBranchId: 2, returnKm: 8200,  fuelLevel: 85, createdAt: "2025-04-29" }
  ],

  payments: [
    { id: 1, reservationId: 1, transactionId: "TXN20250510001", paymentDate: "2025-05-08", amount: 9000 },
    { id: 2, reservationId: 2, transactionId: "TXN20250517002", paymentDate: "2025-05-17", amount: 1500 },
    { id: 3, reservationId: 3, transactionId: "TXN20250330003", paymentDate: "2025-03-30", amount: 4800 },
    { id: 4, reservationId: 4, transactionId: "TXN20250429004", paymentDate: "2025-04-29", amount: 7000 }
  ],

  damageReports: [
    { id: 1, reservationId: 1, employeeId: 2, description: "Ön tampon sağ köşede küçük çizik", extraCharge: 500, createdAt: "2025-05-15" },
    { id: 2, reservationId: 3, employeeId: 1, description: "Sol arka kapı boyasında soyulma",   extraCharge: 800, createdAt: "2025-04-05" }
  ],

  notifications: [
    { id: 1, customerId: 1, reservationId: 1, type: "Email", subject: "Rezervasyonunuz Tamamlandı", body: "RAV4 aracınız başarıyla iade alındı.", status: "Sent", createdAt: "2025-05-15T10:00:00Z" },
    { id: 2, customerId: 2, reservationId: 2, type: "Email", subject: "Rezervasyonunuz Onaylandı",  body: "Clio aracınız 18 Mayıs'ta hazır olacak.", status: "Sent", createdAt: "2025-05-17T08:00:00Z" }
  ],

  nextCustomerId:     5,
  nextReservationId:  5,
  nextPaymentId:      5,
  nextDamageReportId: 3,
  nextNotificationId: 3
};

// ========== CANLI VERİTABANI ==========
const DB = JSON.parse(JSON.stringify(SEED_DATA)); // derin kopya

// ========== KAYDET / YÜKLE ==========
function saveDB() {
  try {
    localStorage.setItem('aracKiralamaDB_v3', JSON.stringify(DB));
    localStorage.removeItem('aracKiralamaDB_v2');
  } catch(e) {
    console.warn('localStorage yazılamadı:', e);
  }
}

function loadDB() {
  try {
    let saved = localStorage.getItem('aracKiralamaDB_v3');
    if (!saved) saved = localStorage.getItem('aracKiralamaDB_v2');
    if (saved) {
      const parsed = JSON.parse(saved);
      Object.keys(parsed).forEach(k => { DB[k] = parsed[k]; });
      migrateDB();
    } else {
      migrateDB();
    }
  } catch(e) {
    console.warn('localStorage okunamadı, seed data kullanılıyor.');
  }
}

function migrateDB() {
  const seedAdmin = SEED_DATA.employees.find(e => e.role === 'Admin');
  if (seedAdmin && !DB.employees.some(e => e.email === seedAdmin.email)) {
    DB.employees.push(JSON.parse(JSON.stringify(seedAdmin)));
  }
  DB.employees.forEach(e => {
    if (e.role === 'Admin' && e.email === 'admin@arackiralama.com' && !e.passwordHash) {
      e.passwordHash = 'admin123';
    }
  });
  ['nextCustomerId', 'nextReservationId', 'nextPaymentId', 'nextDamageReportId', 'nextNotificationId'].forEach(k => {
    if (DB[k] == null) DB[k] = SEED_DATA[k];
  });
  if (typeof mergeVehiclesFromSeed === 'function') mergeVehiclesFromSeed();
  else if (typeof applyCatalogToAllVehicles === 'function') applyCatalogToAllVehicles();
  saveDB();
}

function resetDB() {
  if (!confirm('Tüm veriler sıfırlanacak ve başlangıç verilerine dönülecek. Emin misiniz?')) return;
  localStorage.removeItem('aracKiralamaDB_v2');
  localStorage.removeItem('aracKiralamaDB_v3');
  Object.keys(SEED_DATA).forEach(k => { DB[k] = JSON.parse(JSON.stringify(SEED_DATA[k])); });
  if (typeof mergeVehiclesFromSeed === 'function') mergeVehiclesFromSeed();
  saveDB();
  alert('Veritabanı sıfırlandı!');
  location.reload();
}

// ========== CSV EXPORT ==========
function exportCSV(tableName) {
  const data = DB[tableName];
  if (!data || !data.length) { alert('Dışa aktarılacak veri yok.'); return; }
  const headers = Object.keys(data[0]);
  const rows = data.map(row => headers.map(h => `"${String(row[h]??'').replace(/"/g,'""')}"`).join(','));
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `${tableName}_${new Date().toISOString().split('T')[0]}.csv`;
  a.click(); URL.revokeObjectURL(url);
}

// ========== SORGU YARDIMCILARI ==========
function getVehicleById(id) {
  const v = DB.vehicles.find(x => x.id === parseInt(id));
  return v && typeof enrichVehicleCatalog === 'function' ? enrichVehicleCatalog(v) : v;
}
function getBranchById(id)      { return DB.branches.find(b => b.id === parseInt(id)); }
function getCustomerById(id)    { return DB.customers.find(c => c.id === parseInt(id)); }
function getReservationById(id) { return DB.reservations.find(r => r.id === parseInt(id)); }
function getEmployeeById(id)    { return DB.employees.find(e => e.id === parseInt(id)); }

function getAvailableVehicles(startDate, endDate, branchId, category) {
  const conflicting = DB.reservations
    .filter(r => r.status !== 'Cancelled' && r.status !== 'Completed')
    .filter(r => !(endDate <= r.startDate || startDate >= r.endDate))
    .map(r => r.vehicleId);
  return DB.vehicles.filter(v => {
    if (v.status === 'Maintenance') return false;
    if (conflicting.includes(v.id)) return false;
    if (branchId && v.branchId !== parseInt(branchId)) return false;
    if (category && category !== 'all' && v.category !== category) return false;
    return true;
  });
}

function getReservationsByCustomer(customerId) {
  return DB.reservations.filter(r => r.customerId === customerId);
}

function getReservationsByBranch(branchId) {
  return DB.reservations.filter(r => {
    const v = getVehicleById(r.vehicleId);
    return v && v.branchId === branchId;
  });
}

// ========== FORMAT YARDIMCILARI ==========
function calcDays(start, end) {
  const s = new Date(start), e = new Date(end);
  return Math.max(1, Math.ceil((e - s) / (1000 * 60 * 60 * 24)));
}

function formatMoney(amount) {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount || 0);
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('tr-TR');
}

// ========== BİLDİRİM ==========
function addNotification(customerId, reservationId, type, subject, body) {
  DB.notifications.push({
    id: DB.nextNotificationId++,
    customerId, reservationId, type, subject, body,
    status: 'Sent',
    createdAt: new Date().toISOString()
  });
  saveDB();
}

// ========== VERİTABANI BİLGİSİ ==========
function getDBStats() {
  return {
    customers:     DB.customers.length,
    employees:     DB.employees.length,
    branches:      DB.branches.length,
    vehicles:      DB.vehicles.length,
    reservations:  DB.reservations.length,
    payments:      DB.payments.length,
    damageReports: DB.damageReports.length,
    notifications: DB.notifications.length,
    storageUsed:   (JSON.stringify(DB).length / 1024).toFixed(1) + ' KB'
  };
}

// loadDB() — vehicle-catalog.js yüklendikten sonra çağrılır
