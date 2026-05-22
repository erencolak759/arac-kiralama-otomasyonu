// ============================================================
// EMPLOYEE PAGES
// ============================================================

function renderEmpDashboard() {
  const bRes = getReservationsByBranch(currentUser.branchId);
  const today = new Date().toISOString().split('T')[0];
  const bVeh  = DB.vehicles.filter(v=>v.branchId===currentUser.branchId);
  const branch= getBranchById(currentUser.branchId);

  const recentRows = bRes.slice(-5).reverse().map(r=>{
    const c=getCustomerById(r.customerId), v=getVehicleById(r.vehicleId);
    return `<tr>
      <td><span style="font-family:monospace;font-size:12px;color:var(--text2)">#${r.id}</span></td>
      <td>${c?c.firstName+' '+c.lastName:'—'}</td>
      <td>${v?v.brand+' '+v.model:'—'}</td>
      <td>${formatDate(r.startDate)} → ${formatDate(r.endDate)}</td>
      <td>${statusBadge(r.status)}</td>
      <td>${r.status==='Active'?`<button class="btn btn-success btn-sm" onclick="showPage('empReservations')">İade Al</button>`:''}</td>
    </tr>`;
  }).join('')||`<tr><td colspan="6"><div class="empty"><div class="empty-ico">≡</div><h3>İşlem yok</h3></div></td></tr>`;

  const content=`
    <div class="alert alert-info" style="margin-bottom:20px">Aktif şube: <strong>${branch?.name}</strong></div>
    <div class="stats">
      <div class="stat"><div class="stat-ico si-blue">◻</div><div><div class="stat-val">${bVeh.length}</div><div class="stat-lbl">Şube Araçları</div></div></div>
      <div class="stat"><div class="stat-ico si-green">●</div><div><div class="stat-val">${bVeh.filter(v=>v.status==='Available').length}</div><div class="stat-lbl">Müsait</div></div></div>
      <div class="stat"><div class="stat-ico si-yellow">▷</div><div><div class="stat-val">${bRes.filter(r=>r.status==='Active').length}</div><div class="stat-lbl">Aktif Kiralama</div></div></div>
      <div class="stat"><div class="stat-ico si-red">📅</div><div><div class="stat-val">${bRes.filter(r=>r.startDate===today).length}</div><div class="stat-lbl">Bugün Teslimat</div></div></div>
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title">Son İşlemler</div><button class="btn btn-ghost btn-sm" onclick="showPage('empReservations')">Tümü →</button></div>
      <div class="tbl-wrap"><table><thead><tr><th>ID</th><th>Müşteri</th><th>Araç</th><th>Tarih</th><th>Durum</th><th></th></tr></thead><tbody>${recentRows}</tbody></table></div>
    </div>`;
  return layout(`Merhaba, ${currentUser.firstName}`, 'Personel Paneli', content);
}

function renderEmpReservations() {
  const bRes = getReservationsByBranch(currentUser.branchId).reverse();
  const rows = bRes.map(r=>{
    const c=getCustomerById(r.customerId), v=getVehicleById(r.vehicleId);
    return `<tr>
      <td><span style="font-family:monospace;font-size:12px;color:var(--text2)">#${r.id}</span></td>
      <td>${c?c.firstName+' '+c.lastName:'—'}<br><span style="font-size:11px;color:var(--text2)">${c?.phone||''}</span></td>
      <td>${v?`<strong>${v.brand} ${v.model}</strong><br><span class="text-muted">${v.plate}</span>`:'—'}</td>
      <td>${formatDate(r.startDate)}</td><td>${formatDate(r.endDate)}</td>
      <td>${statusBadge(r.status)}</td>
      <td><strong>${formatMoney(r.totalAmount)}</strong></td>
      <td style="display:flex; flex-direction:row; gap:8px;">
        ${r.status==='Active'?`<button class="btn btn-success btn-sm" style="padding:6px 12px; font-weight:700;" onclick="openReturnModal(${r.id})">✅ İade Al</button>`:''}
        ${r.status==='Active'?`<button class="btn btn-warning btn-sm" style="padding:6px 12px;" onclick="openDmgModal(${r.id})">⚠️ Hasar</button>`:''}
        ${r.status==='Completed'?`<span style="padding:6px 12px; font-weight:700; color:var(--success); background:#dcfce7; border-radius:6px;">✔️ İade Alındı</span>`:''}
      </td>
    </tr>`;
  }).join('')||`<tr><td colspan="8"><div class="empty"><div class="empty-ico">≡</div><h3>Rezervasyon yok</h3></div></td></tr>`;
  const content=`<div class="card">
    <div class="card-header"><div class="card-title">Şube Rezervasyonları</div></div>
    <div class="tbl-wrap"><table><thead><tr><th>ID</th><th>Müşteri</th><th>Araç</th><th>Alış</th><th>İade</th><th>Durum</th><th>Tutar</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>
  </div>${_returnModal()}${_dmgModal()}`;
  return layout('Rezervasyonlar','',content);
}

function _returnModal() {
  return `<div class="modal-overlay" id="retModal">
    <div class="modal">
      <div class="modal-header"><div class="modal-title">Araç İade İşlemi</div><button class="modal-close" onclick="closeModal('retModal')">✕</button></div>
      <div class="modal-body">
        <div id="retInfo" style="margin-bottom:14px"></div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">İade KM</label><input class="form-control" type="number" id="retKm" placeholder="Güncel kilometre"/></div>
          <div class="form-group"><label class="form-label">Yakıt Seviyesi (%)</label><input class="form-control" type="number" id="retFuel" min="0" max="100" value="80"/></div>
        </div>
        <div class="form-group">
          <label class="form-label">Araç Durumu</label>
          <select class="form-control" id="retVehStatus">
            <option value="Available">Müsait</option>
            <option value="Maintenance">Bakıma Al</option>
          </select>
        </div>
        <div class="form-group"><label class="form-label">Notlar</label><textarea class="form-control" id="retNote" rows="2" placeholder="Varsa notlar..."></textarea></div>
        <div id="retAlert"></div>
      </div>
      <div class="modal-footer"><button class="btn btn-ghost" onclick="closeModal('retModal')">İptal</button><button class="btn btn-success" onclick="completeReturn()">İadeyi Tamamla</button></div>
    </div>
  </div>`;
}

let _retResId = null;
function openReturnModal(id) {
  _retResId = id;
  const r = getReservationById(id), v = getVehicleById(r.vehicleId), c = getCustomerById(r.customerId);
  const today = new Date().toISOString().split('T')[0];
  let lateFeeHtml = '';
  if (today > r.endDate) {
    const lateDays  = calcDays(r.endDate, today);
    const lateCharge = lateDays * (v?.dailyRate || 0) * 1.5;
    lateFeeHtml = `<div class="alert" style="background:#fef2f2;border:1px solid #fecaca;color:#991b1b;border-radius:8px;padding:10px 14px;margin-top:10px;font-size:13px;">
      ⚠️ <strong>Geç iade!</strong> ${lateDays} gün gecikme — Ek ücret: <strong>${formatMoney(lateCharge)}</strong> (%150 oran)</div>`;
  }
  document.getElementById('retInfo').innerHTML = `<div class="sum-box">
    <div class="d-row"><span class="d-key">Müşteri</span><span class="d-val">${c?.firstName} ${c?.lastName}</span></div>
    <div class="d-row"><span class="d-key">Araç</span><span class="d-val">${v?.brand} ${v?.model} (${v?.plate})</span></div>
    <div class="d-row"><span class="d-key">Planlanan İade</span><span class="d-val">${formatDate(r.endDate)}</span></div>
    <div class="d-row"><span class="d-key">Tutar</span><span class="d-val">${formatMoney(r.totalAmount)}</span></div>
  </div>${lateFeeHtml}`;
  openModal('retModal');
}

async function completeReturn() {
  const km      = document.getElementById('retKm').value;
  const fuel    = document.getElementById('retFuel').value;
  const vehSt   = document.getElementById('retVehStatus')?.value || 'Available';
  if (!km) { showAlert('retAlert', 'KM değeri giriniz.', 'danger'); return; }

  const r       = getReservationById(_retResId);
  const v       = getVehicleById(r.vehicleId);
  const today   = new Date().toISOString().split('T')[0];
  let lateCharge = 0;
  if (today > r.endDate) {
    lateCharge = calcDays(r.endDate, today) * (v?.dailyRate || 0) * 1.5;
  }

  const btn = document.querySelector('#retModal .btn-success');
  if (btn) { btn.disabled = true; btn.textContent = 'İşleniyor...'; }

  try {
    await apiReturnReservation(_retResId, {
      returnKm: parseInt(km), fuelLevel: parseInt(fuel),
      vehicleStatus: vehSt, lateCharge
    });
    addNotification(r.customerId, r.id, 'Email', 'Araç İadeniz Alındı', 'Araç başarıyla iade alındı. Teşekkürler!');
    closeModal('retModal');
    showPage('empReservations');
  } catch (e) {
    showAlert('retAlert', e.error || 'İade başarısız.', 'danger');
    if (btn) { btn.disabled = false; btn.textContent = 'İadeyi Tamamla'; }
  }
}

function _dmgModal() {
  return `<div class="modal-overlay" id="dmgModal">
    <div class="modal">
      <div class="modal-header"><div class="modal-title">Hasar Raporu Oluştur</div><button class="modal-close" onclick="closeModal('dmgModal')">✕</button></div>
      <div class="modal-body">
        <div class="form-group"><label class="form-label">Hasar Açıklaması</label><textarea class="form-control" id="dmgDesc" rows="3" placeholder="Hasarı detaylı açıklayın..."></textarea></div>
        <div class="form-group"><label class="form-label">Ekstra Ücret (₺)</label><input class="form-control" type="number" id="dmgCharge" value="0" min="0"/></div>
        <div class="form-group">
          <label class="form-label">📸 Hasar Fotoğrafı (opsiyonel)</label>
          <input class="form-control" type="file" id="dmgPhoto" accept="image/*" onchange="previewDmgPhoto(this)" style="padding:6px;"/>
          <div id="dmgPhotoPreview" style="margin-top:10px;display:none;">
            <img id="dmgPhotoImg" src="" alt="Hasar fotoğrafı" style="max-width:100%;max-height:200px;border-radius:10px;border:1px solid var(--border);object-fit:cover;"/>
            <div style="font-size:11px;color:var(--text2);margin-top:4px;">✅ Fotoğraf yüklendi</div>
          </div>
        </div>
        <div id="dmgAlert"></div>
      </div>
      <div class="modal-footer"><button class="btn btn-ghost" onclick="closeModal('dmgModal')">İptal</button><button class="btn btn-danger" onclick="saveDmg()">Raporu Kaydet</button></div>
    </div>
  </div>`;
}

let _dmgResId = null;
function openDmgModal(id) { _dmgResId = id; openModal('dmgModal'); }

function previewDmgPhoto(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const prev = document.getElementById('dmgPhotoPreview');
    const img  = document.getElementById('dmgPhotoImg');
    if (prev && img) { img.src = e.target.result; prev.style.display = 'block'; }
  };
  reader.readAsDataURL(file);
}

async function saveDmg() {
  const desc   = document.getElementById('dmgDesc').value.trim();
  const charge = parseFloat(document.getElementById('dmgCharge').value || 0);
  if (!desc) { showAlert('dmgAlert', 'Açıklama gerekli.', 'danger'); return; }
  // Fotoğraf Base64 al
  const photoEl = document.getElementById('dmgPhotoImg');
  const photoData = (photoEl && photoEl.src && photoEl.src.startsWith('data:')) ? photoEl.src : null;
  try {
    await apiAddDamageReport({ reservationId: _dmgResId, employeeId: currentUser.id, description: desc, extraCharge: charge, photoData });
    closeModal('dmgModal');
    showPage('empDamage');
  } catch (e) { showAlert('dmgAlert', e.error || 'Kayıt başarısız.', 'danger'); }
}


function renderEmpVehicles(){
  const vehs=DB.vehicles.filter(v=>v.branchId===currentUser.branchId);
  const cards=vehs.map(v=>`<div class="v-card v-card-static">
    ${vehicleThumb(v)}
    ${vehicleTitleHtml(v)}
    <div class="v-plate">${v.plate} · ${v.year}</div>
    <div class="v-badges">${statusBadge(v.status)} ${statusBadge(v.category)}</div>
    ${vehicleSpecsHtml(v, true)}
    <div style="margin-top:12px">
      <label class="form-label">Durum Güncelle</label>
      <select class="form-control" style="font-size:12px" onchange="updVehStatus(${v.id},this.value)">
        ${['Available','Maintenance'].map(s=>`<option value="${s}"${v.status===s?' selected':''}>${s==='Available'?'Müsait':'Bakımda'}</option>`).join('')}
      </select>
    </div>
  </div>`).join('')||`<div class="empty"><div class="empty-ico">◻</div><h3>Araç bulunamadı</h3></div>`;
  const content=`<div class="vehicle-grid">${cards}</div>`;
  return layout('Araçlar','',content);
}

async function updVehStatus(id, status) {
  const v = getVehicleById(id);
  if (v?.status === 'Rented') { alert('Kiradaki araç durumu değiştirilemez.'); return; }
  try {
    await apiUpdateVehicleStatus(id, status);
  } catch (e) { alert(e.error || 'Güncelleme başarısız.'); }
}

function renderEmpCustomers(){
  const rows=DB.customers.map(c=>{
    const cnt=DB.reservations.filter(r=>r.customerId===c.id).length;
    return `<tr>
      <td><strong>${c.firstName} ${c.lastName}</strong></td>
      <td style="font-family:monospace;font-size:12px">${c.nationalId}</td>
      <td style="font-family:monospace;font-size:12px">${c.licenseNo}</td>
      <td>${c.email}</td><td>${c.phone}</td>
      <td><span class="badge b-blue">${cnt} rezervasyon</span></td>
    </tr>`;
  }).join('');
  const content=`<div class="card">
    <div class="card-header"><div class="card-title">Müşteri Listesi</div><div class="card-sub">${DB.customers.length} kayıtlı müşteri</div></div>
    <div class="tbl-wrap"><table><thead><tr><th>Ad Soyad</th><th>TC No</th><th>Ehliyet</th><th>E-posta</th><th>Telefon</th><th>İstatistik</th></tr></thead><tbody>${rows}</tbody></table></div>
  </div>`;
  return layout('Müşteriler','',content);
}

function renderEmpDamage(){
  const rows=DB.damageReports.map(d=>{
    const r=getReservationById(d.reservationId);
    const c=r?getCustomerById(r.customerId):null;
    const v=r?getVehicleById(r.vehicleId):null;
    const emp=getEmployeeById(d.employeeId);
    return `<tr>
      <td><span style="font-family:monospace;font-size:12px;color:var(--text2)">#${d.id}</span></td>
      <td>${c?c.firstName+' '+c.lastName:'—'}</td>
      <td>${v?v.brand+' '+v.model:'—'}</td>
      <td style="max-width:250px;font-size:12px">${d.description}</td>
      <td>${d.extraCharge>0?`<span class="badge b-red">+${formatMoney(d.extraCharge)}</span>`:'—'}</td>
      <td>${emp?emp.firstName+' '+emp.lastName:'—'}</td>
      <td>${formatDate(d.createdAt)}</td>
    </tr>`;
  }).join('')||`<tr><td colspan="7"><div class="empty"><div class="empty-ico">⚠</div><h3>Hasar raporu yok</h3></div></td></tr>`;
  const content=`<div class="card">
    <div class="card-header"><div class="card-title">Hasar Raporları</div></div>
    <div class="tbl-wrap"><table><thead><tr><th>ID</th><th>Müşteri</th><th>Araç</th><th>Açıklama</th><th>Ek Ücret</th><th>Yetkili</th><th>Tarih</th></tr></thead><tbody>${rows}</tbody></table></div>
  </div>`;
  return layout('Hasar Raporları','',content);
}
