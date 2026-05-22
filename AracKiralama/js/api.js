// ============================================================
// API.JS — Backend ile İletişim Katmanı
// localStorage yerine PostgreSQL + Node.js kullanır
//
// Bu dosya data.js'den ÖNCE yüklenir (index.html'de sıralama)
// saveDB / loadDB / migrateDB override edilir
// ============================================================

// ---- Override: localStorage işlemleri devre dışı ----
// (vehicle-catalog.js loadDB() çağırmadan önce bu override çalışır)
window.saveDB    = function () { /* API otomatik kaydeder — no-op */ };
window.loadDB    = function () { /* initApp'te loadDataFromServer() çağrılır — no-op */ };
window.migrateDB = function () { /* no-op */ };
window.resetDB   = function () {
  if (!confirm('Tüm veritabanı verisi sıfırlanacak. Emin misiniz?')) return;
  apiFetch('/vehicles').then(() => location.reload()).catch(() => alert('Sunucu yanıt vermedi.'));
};

// ---- Yardımcı: Fetch Wrapper ----
async function apiFetch(path, opts = {}) {
  const config = {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  };
  // body zaten string ise tekrar serialize etme
  if (opts.body != null && typeof opts.body !== 'string') {
    config.body = JSON.stringify(opts.body);
  }
  const res  = await fetch('/api' + path, config);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw data;
  return data;
}

// ---- Tüm Veriyi Sunucudan Yükle ----
async function loadDataFromServer() {
  const [
    vehicles, reservations, customers, employees,
    branches, payments, damageReports, notifications, campaigns, reviews
  ] = await Promise.all([
    apiFetch('/vehicles'),
    apiFetch('/reservations'),
    apiFetch('/customers'),
    apiFetch('/employees'),
    apiFetch('/branches'),
    apiFetch('/payments'),
    apiFetch('/damage'),
    apiFetch('/notifications'),
    apiFetch('/campaigns'),
    apiFetch('/reviews'),
  ]);

  DB.vehicles      = vehicles.map(v => ({ ...v, dailyRate: parseFloat(v.dailyRate) || 0 }));
  DB.reservations  = reservations.map(r => ({ ...r, totalAmount: parseFloat(r.totalAmount) || 0 }));
  DB.customers     = customers;
  DB.employees     = employees;
  DB.branches      = branches;
  DB.payments      = payments.map(p => ({ ...p, amount: parseFloat(p.amount) || 0 }));
  DB.damageReports = damageReports.map(d => ({ ...d, extraCharge: parseFloat(d.extraCharge) || 0 }));
  DB.notifications = notifications;
  DB.campaigns     = campaigns.map(c => ({ ...c, discountPercent: parseFloat(c.discountPercent) || 0 }));
  DB.reviews       = reviews;

  // Araçları katalog verileriyle zenginleştir
  if (typeof enrichVehicleCatalog === 'function') {
    DB.vehicles.forEach(v => enrichVehicleCatalog(v));
  }

  // Uyumluluk için next ID'leri hesapla
  const maxId = (arr) => (arr.length ? Math.max(...arr.map(x => x.id)) + 1 : 1);
  DB.nextCustomerId     = maxId(customers);
  DB.nextReservationId  = maxId(reservations);
  DB.nextPaymentId      = maxId(payments);
  DB.nextDamageReportId = maxId(damageReports);
  DB.nextNotificationId = maxId(notifications);
}

// ---- Son oluşturulan rezervasyon (fatura ekranı için) ----
window._lastCreatedReservation = null;

// ============================================================
// AUTH API
// ============================================================
async function apiLogin(email, password, role) {
  return apiFetch('/auth/login', { method: 'POST', body: { email, password, role } });
}
async function apiRegister(data) {
  return apiFetch('/auth/register', { method: 'POST', body: data });
}
async function apiForgotPassword(email, newPassword) {
  return apiFetch('/auth/forgot-password', { method: 'POST', body: { email, newPassword } });
}

// ============================================================
// VEHICLE API
// ============================================================
async function apiAddVehicle(data) {
  const v = await apiFetch('/vehicles', { method: 'POST', body: data });
  if (typeof enrichVehicleCatalog === 'function') enrichVehicleCatalog(v);
  DB.vehicles.push(v);
  return v;
}
async function apiUpdateVehicle(id, data) {
  const v = await apiFetch('/vehicles/' + id, { method: 'PUT', body: data });
  if (typeof enrichVehicleCatalog === 'function') enrichVehicleCatalog(v);
  const idx = DB.vehicles.findIndex(x => x.id === id);
  if (idx >= 0) DB.vehicles[idx] = v;
  return v;
}
async function apiDeleteVehicle(id) {
  await apiFetch('/vehicles/' + id, { method: 'DELETE' });
  const idx = DB.vehicles.findIndex(x => x.id === id);
  if (idx >= 0) DB.vehicles.splice(idx, 1);
}
async function apiUpdateVehicleStatus(id, status) {
  const v = await apiFetch('/vehicles/' + id + '/status', { method: 'PATCH', body: { status } });
  const local = DB.vehicles.find(x => x.id === id);
  if (local) local.status = status;
  return v;
}

// ============================================================
// RESERVATION API
// ============================================================
async function apiCreateReservation(data) {
  const r = await apiFetch('/reservations', { method: 'POST', body: data });
  r.totalAmount = parseFloat(r.totalAmount) || 0;
  DB.reservations.push(r);
  DB.nextReservationId = r.id + 1;
  window._lastCreatedReservation = r;
  const v = DB.vehicles.find(x => x.id === r.vehicleId);
  if (v) v.status = 'Rented';
  return r;
}
async function apiCancelReservation(id) {
  await apiFetch('/reservations/' + id + '/cancel', { method: 'PUT' });
  const r = DB.reservations.find(x => x.id === id);
  if (r) {
    r.status = 'Cancelled';
    const v = DB.vehicles.find(x => x.id === r.vehicleId);
    if (v && v.status === 'Rented') v.status = 'Available';
  }
}
async function apiReturnReservation(id, data) {
  const updated = await apiFetch('/reservations/' + id + '/return', { method: 'PUT', body: data });
  const r = DB.reservations.find(x => x.id === id);
  if (r) {
    r.status    = 'Completed';
    r.returnKm  = data.returnKm;
    r.fuelLevel = data.fuelLevel;
    if (data.lateCharge) {
      r.totalAmount = parseFloat(updated.totalAmount) || r.totalAmount;
      r.paymentStatus = 'Pending';
    }
  }
  const v = DB.vehicles.find(x => x.id === r?.vehicleId);
  if (v) {
    v.status = data.vehicleStatus || 'Available';
    if (data.returnKm) v.km = data.returnKm;
  }
  return updated;
}

// ============================================================
// PAYMENT API
// ============================================================
async function apiCreatePayment(data) {
  const p = await apiFetch('/payments', { method: 'POST', body: data });
  DB.payments.push(p);
  DB.nextPaymentId = p.id + 1;
  return p;
}

// ============================================================
// DAMAGE API
// ============================================================
async function apiAddDamageReport(data) {
  const d = await apiFetch('/damage', { method: 'POST', body: data });
  DB.damageReports.push(d);
  DB.nextDamageReportId = d.id + 1;
  return d;
}

// ============================================================
// NOTIFICATION API
// ============================================================
async function apiAddNotificationRemote(customerId, reservationId, type, subject, body) {
  const n = await apiFetch('/notifications', {
    method: 'POST',
    body: { customerId, reservationId, type, subject, body }
  });
  DB.notifications.push(n);
  DB.nextNotificationId = n.id + 1;
  return n;
}
async function apiMarkNotificationRead(id) {
  await apiFetch('/notifications/' + id + '/read', { method: 'PUT' });
  const n = DB.notifications.find(x => x.id === id);
  if (n) n.status = 'Read';
}
// Override global addNotification
window.addNotification = function (customerId, reservationId, type, subject, body) {
  apiAddNotificationRemote(customerId, reservationId, type, subject, body).catch(console.error);
};

// ============================================================
// EMPLOYEE API
// ============================================================
async function apiAddEmployee(data) {
  const e = await apiFetch('/employees', { method: 'POST', body: data });
  DB.employees.push(e);
  return e;
}
async function apiDeleteEmployee(id) {
  await apiFetch('/employees/' + id, { method: 'DELETE' });
  const idx = DB.employees.findIndex(x => x.id === id);
  if (idx >= 0) DB.employees.splice(idx, 1);
}

// ============================================================
// BRANCH API
// ============================================================
async function apiAddBranch(data) {
  const b = await apiFetch('/branches', { method: 'POST', body: data });
  DB.branches.push(b);
  return b;
}
async function apiUpdateBranch(id, data) {
  const b = await apiFetch('/branches/' + id, { method: 'PUT', body: data });
  const idx = DB.branches.findIndex(x => x.id === id);
  if (idx >= 0) DB.branches[idx] = b;
  return b;
}
async function apiDeleteBranch(id) {
  await apiFetch('/branches/' + id, { method: 'DELETE' });
  const idx = DB.branches.findIndex(x => x.id === id);
  if (idx >= 0) DB.branches.splice(idx, 1);
}

// ============================================================
// CUSTOMER API
// ============================================================
async function apiUpdateCustomer(id, data) {
  const c = await apiFetch('/customers/' + id, { method: 'PUT', body: data });
  const idx = DB.customers.findIndex(x => x.id === id);
  if (idx >= 0) DB.customers[idx] = { ...DB.customers[idx], ...c };
  return c;
}
async function apiUpdateCustomerPassword(id, oldPassword, newPassword) {
  return apiFetch('/customers/' + id + '/password', {
    method: 'PUT', body: { oldPassword, newPassword }
  });
}

// ============================================================
// CAMPAIGN API
// ============================================================
async function apiAddCampaign(data) {
  const c = await apiFetch('/campaigns', { method: 'POST', body: data });
  if (!DB.campaigns) DB.campaigns = [];
  DB.campaigns.push(c);
  return c;
}
async function apiUpdateCampaign(id, data) {
  const c = await apiFetch('/campaigns/' + id, { method: 'PUT', body: data });
  const idx = DB.campaigns.findIndex(x => x.id === id);
  if (idx >= 0) DB.campaigns[idx] = c;
  return c;
}
async function apiDeleteCampaign(id) {
  await apiFetch('/campaigns/' + id, { method: 'DELETE' });
  const idx = DB.campaigns.findIndex(x => x.id === id);
  if (idx >= 0) DB.campaigns.splice(idx, 1);
}
