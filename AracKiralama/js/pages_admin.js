// ========== ADMİN DASHBOARD ==========
function renderAdminDashboard() {
  const totalRev = DB.reservations.reduce((s,r)=>s+(r.paymentStatus==='Paid'?(parseFloat(r.totalAmount)||0):0),0);
  const activeRes = DB.reservations.filter(r=>r.status==='Active').length;
  const availVeh = DB.vehicles.filter(v=>v.status==='Available').length;

  // Aylık gelir mini grafik (Son 6 ay dinamik)
  const monthly = {};
  DB.reservations.filter(r => r.paymentStatus === 'Paid').forEach(r => {
    const mo = r.startDate?.slice(0,7);
    if (mo) monthly[mo] = (monthly[mo] || 0) + r.totalAmount;
  });
  
  const sortedMonths = Object.keys(monthly).sort().slice(-6);
  const months = sortedMonths.length > 0 ? sortedMonths.map(m => m.split('-')[1] + '/' + m.split('-')[0].slice(2)) : ['Veri Yok'];
  const vals = sortedMonths.length > 0 ? sortedMonths.map(m => monthly[m]) : [0];

  const maxVal = Math.max(...vals, 1);
  const bars = months.map((m,i)=>`<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;">
    <div style="width:100%;background:rgba(37,99,235,0.4);border-radius:4px 4px 0 0;height:${Math.round((vals[i]/maxVal)*80)}px;transition:all .3s;" onmouseover="this.style.background='#2563eb'" onmouseout="this.style.background='rgba(37,99,235,0.4)'" title="${formatMoney(vals[i])}"></div>
    <div style="font-size:9px;color:var(--text-muted)">${m}</div>
  </div>`).join('');

  const content=`
    <div class="stats">
      <div class="stat"><div class="stat-ico si-blue">${navIcon('car')}</div><div><div class="stat-val">${DB.vehicles.length}</div><div class="stat-lbl">Toplam Araç</div></div></div>
      <div class="stat"><div class="stat-ico si-green">${navIcon('list')}</div><div><div class="stat-val">${availVeh}</div><div class="stat-lbl">Müsait Araç</div></div></div>
      <div class="stat"><div class="stat-ico si-yellow">${navIcon('chart')}</div><div><div class="stat-val">${activeRes}</div><div class="stat-lbl">Aktif Rezervasyon</div></div></div>
      <div class="stat"><div class="stat-ico si-purple">${navIcon('user')}</div><div><div class="stat-val">${DB.customers.length}</div><div class="stat-lbl">Müşteri</div></div></div>
      <div class="stat"><div class="stat-ico si-cyan">${navIcon('pay')}</div><div><div class="stat-val">${formatMoney(totalRev)}</div><div class="stat-lbl">Toplam Gelir</div></div></div>
      <div class="stat"><div class="stat-ico si-blue">${navIcon('branch')}</div><div><div class="stat-val">${DB.branches.length}</div><div class="stat-lbl">Şube</div></div></div>
    </div>
    <div style="display:grid;grid-template-columns:2fr 1fr;gap:20px;">
      <div class="card">
        <div class="card-header"><div class="card-title">Aylık Gelir</div></div>
        <div style="display:flex;align-items:flex-end;gap:6px;height:100px;padding:8px;">${bars}</div>
      </div>
      <div class="card">
        <div class="card-header"><div class="card-title">Araç Durumları</div></div>
        ${['Available','Rented','Maintenance'].map(s=>{
          const cnt=DB.vehicles.filter(v=>v.status===s).length;
          const pct=Math.round(cnt/DB.vehicles.length*100);
          return `<div style="margin-bottom:12px;">
            <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px;"><span>${s}</span><span>${cnt}</span></div>
            <div style="background:var(--dark3);border-radius:4px;height:8px;"><div style="background:var(--primary);width:${pct}%;height:100%;border-radius:4px;transition:width .5s;"></div></div>
          </div>`;
        }).join('')}
      </div>
    </div>`;
  return appLayout('Yönetici Paneli', content, 'Filo ve operasyon özeti');
}

// ========== ADMİN ARAÇLAR ==========
function renderAdminVehicles(){
  const rows=DB.vehicles.map(v=>{
    const b=getBranchById(v.branchId);
    return `<tr>
      <td><div class="table-vehicle">${vehicleThumb(v, 'sm')}<div><strong>${v.brand} ${v.model}</strong><br><span class="text-muted">${v.trim || ''}</span></div></div></td>
      <td>${v.plate}</td>
      <td>${v.year}</td>
      <td>${statusBadge(v.category)}</td>
      <td>${statusBadge(v.status)}</td>
      <td>${formatMoney(v.dailyRate)}</td>
      <td>${b?.name||'-'}</td>
      <td>
        <button class="btn btn-ghost btn-sm" onclick="openEditVehicle(${v.id})">Düzenle</button>
        <button class="btn btn-danger btn-sm" onclick="deleteVehicle(${v.id})">Sil</button>
      </td>
    </tr>`;
  }).join('');
  const content=`<div class="card">
    <div class="card-header"><div class="card-title">Araç Yönetimi</div><button class="btn btn-primary btn-sm" onclick="openAddVehicle()">+ Araç Ekle</button></div>
    <div class="table-wrap"><table><thead><tr><th>Araç</th><th>Plaka</th><th>Yıl</th><th>Kategori</th><th>Durum</th><th>Günlük</th><th>Şube</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>
  </div>${vehicleFormModal()}`;
  return appLayout('Araç Yönetimi', content);
}

function vehicleFormModal(){
  const branchOpts=DB.branches.map(b=>`<option value="${b.id}">${b.name}</option>`).join('');
  return `<div class="modal-overlay" id="vehicleModal">
    <div class="modal">
      <div class="modal-header"><div class="modal-title" id="vehicleModalTitle">Araç Ekle</div><button class="modal-close" onclick="closeModal('vehicleModal')">✕</button></div>
      <div class="modal-body">
        <div id="vehicleFormAlert"></div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Marka</label><input class="form-control" id="vBrand"/></div>
          <div class="form-group"><label class="form-label">Model</label><input class="form-control" id="vModel"/></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Plaka</label><input class="form-control" id="vPlate"/></div>
          <div class="form-group"><label class="form-label">Yıl</label><input class="form-control" type="number" id="vYear" value="2024"/></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Kategori</label><select class="form-control" id="vCat"><option>Economy</option><option>Comfort</option><option>SUV</option><option>Premium</option></select></div>
          <div class="form-group"><label class="form-label">Yakıt</label><select class="form-control" id="vFuel"><option>Benzin</option><option>Dizel</option><option>Hibrit</option><option>Elektrik</option></select></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Günlük Ücret (₺)</label><input class="form-control" type="number" id="vRate"/></div>
          <div class="form-group"><label class="form-label">KM</label><input class="form-control" type="number" id="vKm" value="0"/></div>
        </div>
        <div class="form-group"><label class="form-label">Şube</label><select class="form-control" id="vBranch">${branchOpts}</select></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="closeModal('vehicleModal')">İptal</button>
        <button class="btn btn-primary" onclick="saveVehicle()">Kaydet</button>
      </div>
    </div>
  </div>`;
}

let editingVehicleId=null;
function openAddVehicle(){editingVehicleId=null;document.getElementById('vehicleModalTitle').textContent='Araç Ekle';['vBrand','vModel','vPlate','vRate'].forEach(id=>document.getElementById(id).value='');openModal('vehicleModal');}

function openEditVehicle(id){
  editingVehicleId=id;
  const v=getVehicleById(id);
  document.getElementById('vehicleModalTitle').textContent='Araç Düzenle';
  document.getElementById('vBrand').value=v.brand;
  document.getElementById('vModel').value=v.model;
  document.getElementById('vPlate').value=v.plate;
  document.getElementById('vYear').value=v.year;
  document.getElementById('vCat').value=v.category;
  document.getElementById('vFuel').value=v.fuelType;
  document.getElementById('vRate').value=v.dailyRate;
  document.getElementById('vKm').value=v.km;
  document.getElementById('vBranch').value=v.branchId;
  openModal('vehicleModal');
}

async function saveVehicle() {
  const brand = document.getElementById('vBrand').value.trim();
  const model = document.getElementById('vModel').value.trim();
  const plate = document.getElementById('vPlate').value.trim();
  const year  = parseInt(document.getElementById('vYear').value);
  const cat   = document.getElementById('vCat').value;
  const fuel  = document.getElementById('vFuel').value;
  const rate  = parseInt(document.getElementById('vRate').value);
  const km    = parseInt(document.getElementById('vKm').value || 0);
  const branchId = parseInt(document.getElementById('vBranch').value);
  if (!brand||!model||!plate||!rate) { showAlert('vehicleFormAlert','Zorunlu alanları doldurun.','danger'); return; }
  const btn = document.querySelector('#vehicleModal .btn-primary');
  if (btn) btn.disabled = true;
  try {
    if (editingVehicleId) {
      await apiUpdateVehicle(editingVehicleId, { brand, model, plate, year, category: cat, fuelType: fuel, dailyRate: rate, km, branchId, status: getVehicleById(editingVehicleId)?.status || 'Available' });
    } else {
      await apiAddVehicle({ brand, model, plate, year, category: cat, fuelType: fuel, dailyRate: rate, km, branchId });
    }
    closeModal('vehicleModal'); showPage('adminVehicles');
  } catch (e) {
    showAlert('vehicleFormAlert', e.error || 'Kayıt başarısız.', 'danger');
    if (btn) btn.disabled = false;
  }
}

async function deleteVehicle(id) {
  if (!confirm('Aracı silmek istediğinize emin misiniz?')) return;
  try { await apiDeleteVehicle(id); showPage('adminVehicles'); }
  catch (e) { alert(e.error || 'Silme başarısız.'); }
}

function renderAdminBranches() {
  const branchModalId = 'branchModal';
  const cards = DB.branches.map(b => {
    const vCnt = DB.vehicles.filter(v => v.branchId === b.id).length;
    const eCnt = DB.employees.filter(e => e.branchId === b.id).length;
    return `<div class="card">
      <div class="branch-card-icon">${navIcon('branch')}</div>
      <div style="font-size:16px;font-weight:700;margin-bottom:4px;">${b.name}</div>
      <div class="text-muted" style="font-size:13px;margin-bottom:12px;">${b.address}<br>${b.city}</div>
      <div style="display:flex;gap:8px;margin-bottom:12px;">
        <span class="badge badge-primary">${vCnt} Araç</span>
        <span class="badge badge-success">${eCnt} Personel</span>
      </div>
      <div class="text-muted" style="font-size:13px;margin-bottom:14px;">${b.phone}</div>
      <div style="display:flex;gap:8px;">
        <button class="btn btn-ghost btn-sm" onclick="openEditBranch(${b.id})">Düzenle</button>
        <button class="btn btn-danger btn-sm" onclick="deleteBranch(${b.id})">Sil</button>
      </div>
    </div>`;
  }).join('');
  const content = `
    <div style="display:flex;justify-content:flex-end;margin-bottom:20px;">
      <button class="btn btn-primary" onclick="openAddBranch()">+ Şube Ekle</button>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px;">${cards}</div>
    <div class="modal-overlay" id="branchModal">
      <div class="modal">
        <div class="modal-header"><div class="modal-title" id="branchModalTitle">Şube</div><button class="modal-close" onclick="closeModal('branchModal')">✕</button></div>
        <div class="modal-body">
          <div id="branchAlert"></div>
          <div class="form-group"><label class="form-label">Şube Adı</label><input class="form-control" id="bName"/></div>
          <div class="form-row">
            <div class="form-group"><label class="form-label">Şehir</label><input class="form-control" id="bCity"/></div>
            <div class="form-group"><label class="form-label">Telefon</label><input class="form-control" id="bPhone"/></div>
          </div>
          <div class="form-group"><label class="form-label">Adres</label><input class="form-control" id="bAddr"/></div>
        </div>
        <div class="modal-footer"><button class="btn btn-ghost" onclick="closeModal('branchModal')">İptal</button><button class="btn btn-primary" onclick="saveBranch()">Kaydet</button></div>
      </div>
    </div>`;
  return appLayout('Şube Yönetimi', content);
}

let _editingBranchId = null;
function openAddBranch() {
  _editingBranchId = null;
  document.getElementById('branchModalTitle').textContent = 'Şube Ekle';
  ['bName','bCity','bPhone','bAddr'].forEach(id => document.getElementById(id).value = '');
  openModal('branchModal');
}
function openEditBranch(id) {
  _editingBranchId = id;
  const b = DB.branches.find(x => x.id === id);
  document.getElementById('branchModalTitle').textContent = 'Şubeyi Düzenle';
  document.getElementById('bName').value  = b.name;
  document.getElementById('bCity').value  = b.city;
  document.getElementById('bPhone').value = b.phone;
  document.getElementById('bAddr').value  = b.address;
  openModal('branchModal');
}
async function saveBranch() {
  const name = document.getElementById('bName').value.trim();
  const city = document.getElementById('bCity').value.trim();
  const phone = document.getElementById('bPhone').value.trim();
  const addr = document.getElementById('bAddr').value.trim();
  if (!name||!city||!phone||!addr) { showAlert('branchAlert','Tüm alanlar zorunludur.','danger'); return; }
  try {
    if (_editingBranchId) { await apiUpdateBranch(_editingBranchId, { name, city, phone, address: addr }); }
    else { await apiAddBranch({ name, city, phone, address: addr }); }
    closeModal('branchModal'); showPage('adminBranches');
  } catch (e) { showAlert('branchAlert', e.error || 'Kayıt başarısız.', 'danger'); }
}
async function deleteBranch(id) {
  if (!confirm('Şubeyi silmek istediğinize emin misiniz?')) return;
  try { await apiDeleteBranch(id); showPage('adminBranches'); }
  catch (e) { alert(e.error || 'Silme başarısız.'); }
}

// ========== ADMİN PERSONEL ==========
function renderAdminEmployees(){
  const rows=DB.employees.map(e=>{
    const b=getBranchById(e.branchId);
    return `<tr>
      <td><strong>${e.firstName} ${e.lastName}</strong></td>
      <td>${e.email}</td>
      <td>${statusBadge(e.role)}</td>
      <td>${b?.name||'–'}</td>
      <td><button class="btn btn-danger btn-sm" onclick="deleteEmployee(${e.id})">Sil</button></td>
    </tr>`;
  }).join('');
  const branchOpts=DB.branches.map(b=>`<option value="${b.id}">${b.name}</option>`).join('');
  const content=`<div class="card">
    <div class="card-header"><div class="card-title">👨‍💼 Personel</div><button class="btn btn-primary btn-sm" onclick="openModal('empAddModal')">+ Personel Ekle</button></div>
    <div class="table-wrap"><table><thead><tr><th>Ad Soyad</th><th>E-posta</th><th>Rol</th><th>Şube</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>
  </div>
  <div class="modal-overlay" id="empAddModal">
    <div class="modal">
      <div class="modal-header"><div class="modal-title">👨‍💼 Personel Ekle</div><button class="modal-close" onclick="closeModal('empAddModal')">✕</button></div>
      <div class="modal-body">
        <div id="empAddAlert"></div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Ad</label><input class="form-control" id="empFirst"/></div>
          <div class="form-group"><label class="form-label">Soyad</label><input class="form-control" id="empLast"/></div>
        </div>
        <div class="form-group"><label class="form-label">E-posta</label><input class="form-control" type="email" id="empEmail"/></div>
        <div class="form-group"><label class="form-label">Şifre</label><input class="form-control" type="password" id="empPw"/></div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Rol</label><select class="form-control" id="empRole"><option value="Employee">Personel</option><option value="Admin">Admin</option></select></div>
          <div class="form-group"><label class="form-label">Şube</label><select class="form-control" id="empBranch">${branchOpts}</select></div>
        </div>
      </div>
      <div class="modal-footer"><button class="btn btn-ghost" onclick="closeModal('empAddModal')">İptal</button><button class="btn btn-primary" onclick="addEmployee()">Ekle</button></div>
    </div>
  </div>`;
  return appLayout('Personel Yönetimi', content);
}

async function addEmployee() {
  const first    = document.getElementById('empFirst').value.trim();
  const last     = document.getElementById('empLast').value.trim();
  const email    = document.getElementById('empEmail').value.trim();
  const pw       = document.getElementById('empPw').value;
  const role     = document.getElementById('empRole').value;
  const branchId = parseInt(document.getElementById('empBranch').value);
  if (!first||!last||!email||!pw) { showAlert('empAddAlert', 'Tüm alanları doldurun.', 'danger'); return; }
  try {
    await apiAddEmployee({ firstName: first, lastName: last, email, password: pw, role, branchId });
    closeModal('empAddModal'); showPage('adminEmployees');
  } catch (e) { showAlert('empAddAlert', e.error || 'Kayıt başarısız.', 'danger'); }
}

async function deleteEmployee(id) {
  if (!confirm('Personeli silmek istediğinize emin misiniz?')) return;
  try { await apiDeleteEmployee(id); showPage('adminEmployees'); }
  catch (e) { alert(e.error || 'Silme başarısız.'); }
}

// ========== ADMİN MÜŞTERİLER ==========
function renderAdminCustomers(){
  const rows=DB.customers.map(c=>{
    const cnt=DB.reservations.filter(r=>r.customerId===c.id).length;
    const spent=DB.reservations.filter(r=>r.customerId===c.id&&r.paymentStatus==='Paid').reduce((s,r)=>s+(parseFloat(r.totalAmount)||0),0);
    return `<tr>
      <td><strong>${c.firstName} ${c.lastName}</strong></td>
      <td>${c.nationalId}</td>
      <td>${c.email}</td>
      <td>${c.phone}</td>
      <td><span class="badge badge-primary">${cnt}</span></td>
      <td>${formatMoney(spent)}</td>
      <td>${formatDate(c.createdAt)}</td>
    </tr>`;
  }).join('');
  const content=`<div class="card">
    <div class="card-header"><div class="card-title">Müşteri Yönetimi</div><div style="color:var(--text-muted);font-size:13px;">${DB.customers.length} kayıtlı müşteri</div></div>
    <div class="table-wrap"><table><thead><tr><th>Ad Soyad</th><th>TC No</th><th>E-posta</th><th>Telefon</th><th>Rezervasyon</th><th>Toplam Harcama</th><th>Kayıt</th></tr></thead><tbody>${rows}</tbody></table></div>
  </div>`;
  return appLayout('Müşteri Yönetimi', content);
}

// ========== ADMİN REZERVASYONLAR ==========
function renderAdminReservations(){
  const rows=DB.reservations.slice().reverse().map(r=>{
    const c=getCustomerById(r.customerId);
    const v=getVehicleById(r.vehicleId);
    return `<tr>
      <td><strong>#${r.id}</strong></td>
      <td>${c?c.firstName+' '+c.lastName:'-'}</td>
      <td>${v?v.brand+' '+v.model:'-'}</td>
      <td>${formatDate(r.startDate)}</td>
      <td>${formatDate(r.endDate)}</td>
      <td>${statusBadge(r.status)}</td>
      <td>${statusBadge(r.paymentStatus)}</td>
      <td>${formatMoney(r.totalAmount)}</td>
      <td>${r.status==='Active'?`<button class="btn btn-danger btn-sm" onclick="adminCancelRes(${r.id})">İptal</button>`:''}</td>
    </tr>`;
  }).join('');
  const content=`<div class="card">
    <div class="card-header"><div class="card-title">Tüm Rezervasyonlar</div></div>
    <div class="table-wrap"><table><thead><tr><th>ID</th><th>Müşteri</th><th>Araç</th><th>Alış</th><th>İade</th><th>Durum</th><th>Ödeme</th><th>Tutar</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>
  </div>`;
  return appLayout('Rezervasyon Yönetimi', content);
}

async function adminCancelRes(id) {
  if (!confirm('Rezervasyonu iptal et?')) return;
  try { await apiCancelReservation(id); showPage('adminReservations'); }
  catch (e) { alert(e.error || 'İptal başarısız.'); }
}

// ========== ADMİN ÖDEMELER ==========
function renderAdminPayments(){
  const total=DB.payments.reduce((s,p)=>s+(parseFloat(p.amount)||0),0);
  const rows=DB.payments.slice().reverse().map(p=>{
    const r=getReservationById(p.reservationId);
    const c=r?getCustomerById(r.customerId):null;
    return `<tr>
      <td><strong>${p.transactionId}</strong></td>
      <td>${c?c.firstName+' '+c.lastName:'-'}</td>
      <td>#${p.reservationId}</td>
      <td>${formatDate(p.paymentDate)}</td>
      <td><span style="font-weight:700;color:var(--success)">${formatMoney(p.amount)}</span></td>
    </tr>`;
  }).join('');
  const content=`
    <div class="stats-grid" style="grid-template-columns:repeat(3,1fr);margin-bottom:20px;">
      <div class="stat-card"><div class="stat-icon green">💰</div><div><div class="stat-value">${formatMoney(total)}</div><div class="stat-label">Toplam Tahsilat</div></div></div>
      <div class="stat-card"><div class="stat-icon blue">📄</div><div><div class="stat-value">${DB.payments.length}</div><div class="stat-label">İşlem Sayısı</div></div></div>
      <div class="stat-card"><div class="stat-icon amber">📊</div><div><div class="stat-value">${DB.payments.length?formatMoney(total/DB.payments.length):'-'}</div><div class="stat-label">Ortalama İşlem</div></div></div>
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title">💰 Ödeme Kayıtları</div></div>
      <div class="table-wrap"><table><thead><tr><th>İşlem ID</th><th>Müşteri</th><th>Rezervasyon</th><th>Tarih</th><th>Tutar</th></tr></thead><tbody>${rows}</tbody></table></div>
    </div>`;
  return appLayout('Ödeme Yönetimi', content);
}

// ========== ADMİN RAPORLAR ==========
function renderAdminReports(dateFrom, dateTo) {
  const today      = new Date().toISOString().split('T')[0];
  const firstOfMon = today.slice(0,8) + '01';
  const df = dateFrom || firstOfMon;
  const dt = dateTo   || today;

  // Tarih filtreli rezervasyonlar
  const filtered = DB.reservations.filter(r => r.startDate >= df && r.startDate <= dt);
  const paid     = filtered.filter(r => r.paymentStatus === 'Paid');
  const totalRev = paid.reduce((s,r) => s + (parseFloat(r.totalAmount)||0), 0);

  // Şube bazlı
  const byBranch = DB.branches.map(b => {
    const bRes    = filtered.filter(r => { const v = getVehicleById(r.vehicleId); return v && v.branchId === b.id; });
    const bIncome = bRes.filter(r => r.paymentStatus === 'Paid').reduce((s,r) => s + r.totalAmount, 0);
    return { name: b.name, city: b.city, res: bRes.length, income: bIncome };
  });

  // Aylık gelir (son 6 ay)
  const monthly = {};
  DB.reservations.filter(r => r.paymentStatus === 'Paid').forEach(r => {
    const mo = r.startDate?.slice(0,7);
    if (mo) monthly[mo] = (monthly[mo] || 0) + r.totalAmount;
  });
  const monthlyRows = Object.entries(monthly).sort().slice(-6).map(([mo, inc]) =>
    `<tr><td>${mo}</td><td>${formatMoney(inc)}</td></tr>`
  ).join('') || '<tr><td colspan="2">Veri yok</td></tr>';

  const byCat    = DB.vehicles.reduce((acc,v) => { acc[v.category]=(acc[v.category]||0)+1; return acc; }, {});
  const branchRows = byBranch.map(b =>
    `<tr><td><strong>${b.name}</strong></td><td>${b.city}</td><td>${b.res}</td><td>${formatMoney(b.income)}</td></tr>`
  ).join('');
  const catRows = Object.entries(byCat).map(([cat,cnt]) =>
    `<tr><td>${statusBadge(cat)}</td><td>${cnt}</td><td>${Math.round(cnt/DB.vehicles.length*100)}%</td></tr>`
  ).join('');

  const content = `
    <!-- Tarih Filtresi -->
    <div class="card" style="margin-bottom:20px;">
      <div class="card-header"><div class="card-title">📅 Tarih Aralığı Filtresi</div></div>
      <div style="display:flex;gap:12px;align-items:flex-end;flex-wrap:wrap;padding:0 4px 4px;">
        <div class="form-group" style="margin:0;flex:1;min-width:140px;">
          <label class="form-label">Başlangıç</label>
          <input class="form-control" type="date" id="rpFrom" value="${df}"/>
        </div>
        <div class="form-group" style="margin:0;flex:1;min-width:140px;">
          <label class="form-label">Bitiş</label>
          <input class="form-control" type="date" id="rpTo" value="${dt}"/>
        </div>
        <button class="btn btn-primary" onclick="filterReports()">Filtrele</button>
        <button class="btn btn-ghost" onclick="renderAdminReports();showPage('adminReports')">Sıfırla</button>
      </div>
    </div>

    <!-- Özet Kartlar -->
    <div class="stats-grid" style="grid-template-columns:repeat(3,1fr);margin-bottom:20px;">
      <div class="stat-card"><div class="stat-icon green">💰</div><div><div class="stat-value">${formatMoney(totalRev)}</div><div class="stat-label">Dönem Geliri</div></div></div>
      <div class="stat-card"><div class="stat-icon blue">📋</div><div><div class="stat-value">${filtered.length}</div><div class="stat-label">Rezervasyon</div></div></div>
      <div class="stat-card"><div class="stat-icon amber">💳</div><div><div class="stat-value">${paid.length}</div><div class="stat-label">Ödenen</div></div></div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
      <div class="card">
        <div class="card-header"><div class="card-title">🏢 Şube Bazlı Rapor</div></div>
        <div class="table-wrap"><table><thead><tr><th>Şube</th><th>Şehir</th><th>Rezervasyon</th><th>Gelir</th></tr></thead><tbody>${branchRows}</tbody></table></div>
      </div>
      <div class="card">
        <div class="card-header"><div class="card-title">📈 Aylık Gelir (Son 6 Ay)</div></div>
        <div class="table-wrap"><table><thead><tr><th>Ay</th><th>Gelir</th></tr></thead><tbody>${monthlyRows}</tbody></table></div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:20px;">
      <div class="card">
        <div class="card-header"><div class="card-title">🚗 Kategori Dağılımı</div></div>
        <div class="table-wrap"><table><thead><tr><th>Kategori</th><th>Araç</th><th>Oran</th></tr></thead><tbody>${catRows}</tbody></table></div>
      </div>
      <div class="card">
        <div class="card-header"><div class="card-title">⚠️ Hasar Özeti</div></div>
        <div style="display:flex;gap:16px;padding:8px 0;">
          <div class="stat-card" style="flex:1"><div class="stat-icon red">⚠️</div><div><div class="stat-value">${DB.damageReports.length}</div><div class="stat-label">Toplam Hasar</div></div></div>
          <div class="stat-card" style="flex:1"><div class="stat-icon amber">💵</div><div><div class="stat-value">${formatMoney(DB.damageReports.reduce((s,d)=>s+(parseFloat(d.extraCharge)||0),0))}</div><div class="stat-label">Hasar Tahsilatı</div></div></div>
        </div>
      </div>
    </div>`;
  return appLayout('Raporlar', content);
}

function filterReports() {
  const df = document.getElementById('rpFrom')?.value;
  const dt = document.getElementById('rpTo')?.value;
  document.getElementById('app').innerHTML = renderAdminReports(df, dt);
}



// ========== ADMİN VERİTABANI YÖNETİMİ ==========
function renderAdminDatabase() {
  const stats = getDBStats();
  const tables = [
    { key: 'customers',    label: '👥 Müşteriler',      count: DB.customers.length },
    { key: 'employees',    label: '👨‍💼 Personel',        count: DB.employees.length },
    { key: 'branches',     label: '🏢 Şubeler',          count: DB.branches.length },
    { key: 'vehicles',     label: '🚗 Araçlar',          count: DB.vehicles.length },
    { key: 'reservations', label: '📋 Rezervasyonlar',   count: DB.reservations.length },
    { key: 'payments',     label: '💰 Ödemeler',         count: DB.payments.length },
    { key: 'damageReports',label: '⚠️ Hasar Raporları',  count: DB.damageReports.length },
    { key: 'notifications',label: '🔔 Bildirimler',      count: DB.notifications.length }
  ];

  const tableRows = tables.map(t => `<tr>
    <td><strong>${t.label}</strong></td>
    <td><span class="badge badge-primary">${t.count} kayıt</span></td>
    <td><button class="btn btn-ghost btn-sm" onclick="exportCSV('${t.key}')">⬇️ CSV İndir</button></td>
  </tr>`).join('');

  const schemaItems = [
    {name:'customers',    fields:['id','nationalId','licenseNo','firstName','lastName','email','phone','createdAt']},
    {name:'employees',    fields:['id','firstName','lastName','email','role','branchId']},
    {name:'branches',     fields:['id','name','city','address','phone']},
    {name:'vehicles',     fields:['id','plate','brand','model','trim','year','category','engine','powerHp','transmission','fuelType','bodyType','luggageLiters','imageUrl','features']},
    {name:'reservations', fields:['id','customerId','vehicleId','startDate','endDate','totalAmount','status','paymentStatus','pickupBranchId','returnBranchId']},
    {name:'payments',     fields:['id','reservationId','transactionId','paymentDate','amount']},
    {name:'damageReports',fields:['id','reservationId','employeeId','description','extraCharge','createdAt']},
    {name:'notifications',fields:['id','customerId','reservationId','type','subject','body','status','createdAt']}
  ];

  const content = `
    <div class="stats-grid" style="grid-template-columns:repeat(4,1fr);margin-bottom:24px;">
      <div class="stat-card"><div class="stat-icon blue">🗄️</div><div><div class="stat-value">${tables.reduce((a,t)=>a+t.count,0)}</div><div class="stat-label">Toplam Kayıt</div></div></div>
      <div class="stat-card"><div class="stat-icon green">💾</div><div><div class="stat-value">${stats.storageUsed}</div><div class="stat-label">Depolama</div></div></div>
      <div class="stat-card"><div class="stat-icon amber">📊</div><div><div class="stat-value">${tables.length}</div><div class="stat-label">Tablo Sayısı</div></div></div>
      <div class="stat-card"><div class="stat-icon purple">🔑</div><div><div class="stat-value">localStorage</div><div class="stat-label">Depolama Tipi</div></div></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;">
      <div class="card">
        <div class="card-header"><div class="card-title">🗄️ Tablolar</div><button class="btn btn-success btn-sm" onclick="exportAllCSV()">⬇️ Tümünü İndir</button></div>
        <div class="table-wrap"><table><thead><tr><th>Tablo</th><th>Kayıt</th><th>CSV</th></tr></thead><tbody>${tableRows}</tbody></table></div>
      </div>
      <div class="card">
        <div class="card-header"><div class="card-title">⚙️ DB İşlemleri</div></div>
        <div style="display:flex;flex-direction:column;gap:12px;">
          <div style="padding:14px;background:var(--glass);border-radius:var(--radius);border:1px solid var(--border);">
            <div style="font-weight:600;margin-bottom:4px;">💾 Kaydet</div>
            <div style="font-size:12px;color:var(--text-muted);margin-bottom:8px;">Değişiklikleri tarayıcı belleğine kaydet.</div>
            <button class="btn btn-primary btn-sm" onclick="saveDB();showAlert('dbAlert','Kaydedildi!','success')">💾 Kaydet</button>
          </div>
          <div style="padding:14px;background:var(--glass);border-radius:var(--radius);border:1px solid var(--border);">
            <div style="font-weight:600;margin-bottom:4px;">📤 JSON Export</div>
            <div style="font-size:12px;color:var(--text-muted);margin-bottom:8px;">Tüm DB'yi JSON olarak indir.</div>
            <button class="btn btn-ghost btn-sm" onclick="exportJSON()">📤 JSON İndir</button>
          </div>
          <div style="padding:14px;background:rgba(239,68,68,0.08);border-radius:var(--radius);border:1px solid rgba(239,68,68,0.2);">
            <div style="font-weight:600;margin-bottom:4px;color:#fca5a5;">🔄 Sıfırla</div>
            <div style="font-size:12px;color:var(--text-muted);margin-bottom:8px;">Başlangıç verilerine dön!</div>
            <button class="btn btn-danger btn-sm" onclick="resetDB()">⚠️ Sıfırla</button>
          </div>
          <div id="dbAlert"></div>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title">📋 Veritabanı Şeması</div></div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;font-size:12px;">
        ${schemaItems.map(t=>`<div style="background:var(--glass);border:1px solid var(--border);border-radius:var(--radius);padding:10px;">
          <div style="font-weight:700;color:var(--primary);margin-bottom:8px;font-size:11px;">📁 ${t.name}</div>
          ${t.fields.map(f=>`<div style="color:var(--text-muted);padding:2px 0;border-bottom:1px solid rgba(255,255,255,0.04);">${f}</div>`).join('')}
        </div>`).join('')}
      </div>
    </div>`;
  return appLayout('Veritabanı Yönetimi', content, 'localStorage tabanlı kalıcı veri depolama');
}

function exportAllCSV() {
  ['customers','employees','branches','vehicles','reservations','payments','damageReports','notifications']
    .forEach((t,i) => setTimeout(() => exportCSV(t), i * 400));
}

function exportJSON() {
  const blob = new Blob([JSON.stringify(DB, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `arac_kiralama_db_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// ========== ADMİN KAMPANYALAR ==========
function renderAdminCampaigns() {
  const camps = DB.campaigns || [];
  const colors = ['c1','c2','c3','c4'];
  const tags   = ['Kampanya','Yeni','Popüler','Ekonomi','Sezon','Kurumsal'];

  const cards = camps.map(c => `
    <div class="carousel-slide campaign-slide campaign-${c.color}" style="min-width:260px;position:relative;">
      <span class="campaign-tag">${c.tag || 'Kampanya'}</span>
      <h3>${c.title}</h3>
      <p>${c.description || ''}</p>
      ${c.discountPercent ? `<div style="font-size:20px;font-weight:900;color:#fff;margin:8px 0">%${c.discountPercent} İndirim</div>` : ''}
      ${c.category ? `<div style="font-size:11px;opacity:0.7;margin-bottom:8px;">Kategori: ${c.category}</div>` : ''}
      <div style="display:flex;gap:6px;margin-top:auto;">
        <button class="btn btn-ghost btn-sm" onclick="openEditCampaign(${c.id})" style="background:rgba(255,255,255,0.2);color:#fff;border:1px solid rgba(255,255,255,0.3)">Düzenle</button>
        <button class="btn btn-danger btn-sm" onclick="deleteCampaign(${c.id})">Sil</button>
      </div>
    </div>`).join('') || '<div class="empty"><div class="empty-ico">📢</div><h3>Kampanya yok</h3></div>';

  const catOpts = ['Economy','Comfort','SUV','Premium'].map(c => `<option value="${c}">${c}</option>`).join('');
  const colorOpts = colors.map(c => `<option value="${c}">${c.toUpperCase()}</option>`).join('');
  const tagOpts = tags.map(t => `<option value="${t}">${t}</option>`).join('');

  const content = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
      <div>
        <div style="font-size:20px;font-weight:800">📢 Kampanya Yönetimi</div>
        <div style="font-size:13px;color:var(--text2);margin-top:2px">${camps.length} aktif kampanya</div>
      </div>
      <button class="btn btn-primary" onclick="openAddCampaign()">+ Kampanya Ekle</button>
    </div>
    <div style="display:flex;gap:16px;flex-wrap:wrap;padding-bottom:16px;">${cards}</div>

    <div class="modal-overlay" id="campModal">
      <div class="modal">
        <div class="modal-header">
          <div class="modal-title" id="campModalTitle">Kampanya Ekle</div>
          <button class="modal-close" onclick="closeModal('campModal')">✕</button>
        </div>
        <div class="modal-body">
          <div id="campAlert"></div>
          <div class="form-group"><label class="form-label">Başlık</label><input class="form-control" id="cmpTitle" placeholder="Kampanya başlığı"/></div>
          <div class="form-group"><label class="form-label">Açıklama</label><textarea class="form-control" id="cmpDesc" rows="2" placeholder="Kampanya açıklaması"></textarea></div>
          <div class="form-row">
            <div class="form-group"><label class="form-label">Etiket</label><select class="form-control" id="cmpTag">${tagOpts}</select></div>
            <div class="form-group"><label class="form-label">Renk Teması</label><select class="form-control" id="cmpColor">${colorOpts}</select></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label class="form-label">İndirim (%)</label><input class="form-control" type="number" id="cmpDiscount" min="0" max="100" value="10"/></div>
            <div class="form-group"><label class="form-label">Kategori (opsiyonel)</label><select class="form-control" id="cmpCat"><option value="">Tümü</option>${catOpts}</select></div>
          </div>
          <div class="form-group">
            <label class="form-label" style="display:flex;align-items:center;gap:8px;">
              <input type="checkbox" id="cmpActive" checked> Aktif
            </label>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" onclick="closeModal('campModal')">İptal</button>
          <button class="btn btn-primary" onclick="saveCampaign()">Kaydet</button>
        </div>
      </div>
    </div>`;

  return appLayout('Kampanya Yönetimi', content);
}

let _editingCampId = null;
function openAddCampaign() {
  _editingCampId = null;
  document.getElementById('campModalTitle').textContent = 'Kampanya Ekle';
  document.getElementById('cmpTitle').value = '';
  document.getElementById('cmpDesc').value  = '';
  document.getElementById('cmpDiscount').value = '10';
  document.getElementById('cmpCat').value   = '';
  document.getElementById('cmpActive').checked = true;
  openModal('campModal');
}
function openEditCampaign(id) {
  _editingCampId = id;
  const c = (DB.campaigns || []).find(x => x.id === id);
  if (!c) return;
  document.getElementById('campModalTitle').textContent = 'Kampanyayı Düzenle';
  document.getElementById('cmpTitle').value   = c.title;
  document.getElementById('cmpDesc').value    = c.description || '';
  document.getElementById('cmpTag').value     = c.tag || 'Kampanya';
  document.getElementById('cmpColor').value   = c.color || 'c1';
  document.getElementById('cmpDiscount').value = c.discountPercent || 0;
  document.getElementById('cmpCat').value     = c.category || '';
  document.getElementById('cmpActive').checked = c.isActive !== false;
  openModal('campModal');
}
async function saveCampaign() {
  const title          = document.getElementById('cmpTitle').value.trim();
  const description    = document.getElementById('cmpDesc').value.trim();
  const tag            = document.getElementById('cmpTag').value;
  const color          = document.getElementById('cmpColor').value;
  const discountPercent = parseInt(document.getElementById('cmpDiscount').value || 0);
  const category       = document.getElementById('cmpCat').value || null;
  const isActive       = document.getElementById('cmpActive').checked;
  if (!title) { showAlert('campAlert','Başlık gerekli.','danger'); return; }
  try {
    if (_editingCampId) {
      await apiUpdateCampaign(_editingCampId, { title, description, tag, color, discountPercent, category, isActive });
    } else {
      await apiAddCampaign({ title, description, tag, color, discountPercent, category, isActive });
    }
    closeModal('campModal');
    showPage('adminCampaigns');
  } catch (e) { showAlert('campAlert', e.error || 'Kayıt başarısız.', 'danger'); }
}
async function deleteCampaign(id) {
  if (!confirm('Kampanyayı silmek istediğinize emin misiniz?')) return;
  try { await apiDeleteCampaign(id); showPage('adminCampaigns'); }
  catch (e) { alert(e.error || 'Silme başarısız.'); }
}

