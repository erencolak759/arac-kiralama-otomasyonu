// ============================================================
// CUSTOMER PAGES
// ============================================================

function getLoyaltyTier(spent) {
  if (spent >= 15000) {
    return { name: 'Platinum VIP', discount: 0.15, color: '#e5e7eb', bg: 'linear-gradient(135deg, #1f2937, #111827)', border: 'rgba(255,255,255,0.2)', text: '#ffffff', next: null, nextAmount: 0 };
  } else if (spent >= 5000) {
    return { name: 'Gold Club', discount: 0.10, color: '#f59e0b', bg: 'linear-gradient(135deg, #d97706, #78350f)', border: 'rgba(245,158,11,0.2)', text: '#ffffff', next: 'Platinum VIP', nextAmount: 15000 - spent };
  } else if (spent >= 1500) {
    return { name: 'Silver Member', discount: 0.05, color: '#94a3b8', bg: 'linear-gradient(135deg, #475569, #1e293b)', border: 'rgba(148,163,184,0.2)', text: '#ffffff', next: 'Gold Club', nextAmount: 5000 - spent };
  } else {
    return { name: 'Classic Member', discount: 0.00, color: '#b91c1c', bg: 'linear-gradient(135deg, #1e293b, #0f172a)', border: 'rgba(200,16,46,0.1)', text: '#94a3b8', next: 'Silver Member', nextAmount: 1500 - spent };
  }
}

function renderCustomerDashboard() {
  const myRes = DB.reservations.filter(r => r.customerId === currentUser.id);
  const active = myRes.filter(r => r.status === 'Active').length;
  const done   = myRes.filter(r => r.status === 'Completed').length;
  const spent  = myRes.filter(r => r.paymentStatus === 'Paid').reduce((s,r)=>s+r.totalAmount,0);
  const avail  = DB.vehicles.filter(v => v.status === 'Available').length;
  const tier   = getLoyaltyTier(spent);

  const recentRows = myRes.slice(-4).reverse().map(r => {
    const v = getVehicleById(r.vehicleId);
    return `<tr>
      <td><span style="font-family:monospace;font-size:12px;color:var(--text2)">#${r.id}</span></td>
      <td><strong>${v ? v.brand+' '+v.model : '—'}</strong></td>
      <td>${formatDate(r.startDate)} → ${formatDate(r.endDate)}</td>
      <td>${statusBadge(r.status)}</td>
      <td style="font-weight:700">${formatMoney(r.totalAmount)}</td>
    </tr>`;
  }).join('') || `<tr><td colspan="5"><div class="empty"><div class="empty-ico">📋</div><h3>Henüz rezervasyon yok</h3></div></td></tr>`;

  const featured = DB.vehicles.filter(v => v.status === 'Available').slice(0, 8);
  const premium = DB.vehicles.filter(v => v.category === 'Premium' && v.status === 'Available');

  const content = customerPageWrap(`
    <section class="site-hero">
      <div class="site-hero-bg"></div>
      <div class="site-hero-inner">
        <h1>Merhaba ${currentUser.firstName}, yolculuğunuza araç seçin</h1>
        <p>Alış ve iade bilgilerinizi girin; müsait filoyu anında listeleyin.</p>
        ${bookingWidgetHtml({ btnLabel: 'Müsait Araçları Göster', onResults: false })}
      </div>
    </section>
    ${promoStripHtml()}
    ${featuredFleetCarouselHtml(featured, 'Öne çıkan araçlar', `${avail} müsait araç — kaydırarak inceleyin`)}
    ${campaignsCarouselHtml()}
    ${featuredFleetCarouselHtml(premium.length ? premium : featured.slice(0, 4), 'Premium & SUV', 'Konforlu segmentte öne çıkan modeller')}
    ${whyUsCarouselHtml()}
    <section class="section-block section-inset">
      
      <!-- VIP SADAKAT KARTI -->
      <div class="vip-loyalty-card" style="background:${tier.bg}; border:1px solid ${tier.border}; color:${tier.text}; padding:26px 30px; border-radius:20px; margin-bottom:32px; position:relative; overflow:hidden; box-shadow:0 12px 35px rgba(0,0,0,0.18)">
        <div style="position:absolute; right:-25px; top:-25px; font-size:140px; opacity:0.07; font-weight:900; pointer-events:none; transform:rotate(-15deg); font-family:'Plus Jakarta Sans',sans-serif;">VIP</div>
        <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:16px;">
          <div>
            <span style="font-size:10px; text-transform:uppercase; letter-spacing:3px; font-weight:800; opacity:0.75; display:block; margin-bottom:8px;">DriveFleet Privilege Club</span>
            <h2 style="font-size:30px; font-weight:900; margin:0; letter-spacing:-0.5px; color:${tier.color}; display:flex; align-items:center; gap:10px;">
              ${tier.name}
              <span style="font-size:12px; background:rgba(255,255,255,0.15); border:1px solid rgba(255,255,255,0.25); padding:3px 10px; border-radius:999px; color:#fff; font-weight:600;">ÜYE</span>
            </h2>
            <p style="font-size:13px; margin:8px 0 0 0; opacity:0.85">Sistemdeki kiralama harcamalarınızla anında özel indirim oranları kazanın.</p>
          </div>
          <div style="text-align:right;">
            <span style="font-size:10px; text-transform:uppercase; letter-spacing:1.5px; display:block; opacity:0.75; margin-bottom:4px;">KAZANILAN İNDİRİM</span>
            <span style="font-size:36px; font-weight:900; color:${tier.color}; text-shadow: 0 2px 10px rgba(0,0,0,0.2)">%${tier.discount * 100} İndirim</span>
          </div>
        </div>
        
        <div style="margin-top:28px; background: rgba(0,0,0,0.15); padding: 16px 20px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.06);">
          <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:8px; opacity:0.95;">
            <span>Toplam VIP Harcama: <strong style="color:${tier.color}; font-size:14px; font-weight:800;">${formatMoney(spent)}</strong></span>
            ${tier.next ? `<span>Bir sonraki seviye (<strong>${tier.next}</strong>) için <strong>${formatMoney(tier.nextAmount)}</strong> daha harcayın</span>` : `<span>Tebrikler! En yüksek VIP statüsündesiniz. 👑</span>`}
          </div>
          ${tier.next ? `
          <div style="width:100%; height:8px; background:rgba(255,255,255,0.12); border-radius:4px; overflow:hidden;">
            <div style="width:${Math.min(100, (spent / (spent + tier.nextAmount)) * 100)}%; height:100%; background:${tier.color}; border-radius:4px; box-shadow: 0 0 8px ${tier.color}; transition: width 0.5s ease-in-out;"></div>
          </div>` : ''}
        </div>
      </div>

      <div class="stats stats-inline">
        <div class="stat"><div class="stat-ico si-green">${navIcon('list')}</div><div><div class="stat-val">${active}</div><div class="stat-lbl">Aktif kiralama</div></div></div>
        <div class="stat"><div class="stat-ico si-yellow">${navIcon('chart')}</div><div><div class="stat-val">${done}</div><div class="stat-lbl">Tamamlanan</div></div></div>
        <div class="stat"><div class="stat-ico si-purple">${navIcon('pay')}</div><div><div class="stat-val">${formatMoney(spent)}</div><div class="stat-lbl">Toplam harcama</div></div></div>
      </div>
      <div class="card">
        <div class="card-header">
          <div><div class="card-title">Son rezervasyonlarınız</div><div class="card-sub">Hızlı erişim</div></div>
          <button class="btn btn-ghost btn-sm" onclick="showPage('myReservations')">Tümü</button>
        </div>
        <div class="tbl-wrap"><table><thead><tr><th>ID</th><th>Araç</th><th>Tarih</th><th>Durum</th><th>Tutar</th></tr></thead>
        <tbody>${recentRows}</tbody></table></div>
      </div>
    </section>
  `);
  return layout('Ana Sayfa', 'Araç kiralama ve filo', content, { wide: true });
}

// --- ARAÇ ARAMA ---
let srchResults = [], selVehicle = null, bkStep = 1, bkStart = '', bkEnd = '';

function renderVehicleSearch() {
  const content = customerPageWrap(`
    <section class="search-hero-bar">
      ${bookingWidgetHtml({ useSearchIds: true, showCategory: true, onResults: true, btnLabel: 'Ara' })}
    </section>
    <section class="section-block section-inset">
      <input type="hidden" id="sCat" value="all"/>
      <div class="category-scroll">
        <button type="button" class="cat-pill active" data-cat="all" onclick="filterCatPill(this)">Tümü</button>
        <button type="button" class="cat-pill" data-cat="Economy" onclick="filterCatPill(this)">Ekonomi</button>
        <button type="button" class="cat-pill" data-cat="Comfort" onclick="filterCatPill(this)">Konfor</button>
        <button type="button" class="cat-pill" data-cat="SUV" onclick="filterCatPill(this)">SUV</button>
        <button type="button" class="cat-pill" data-cat="Premium" onclick="filterCatPill(this)">Premium</button>
      </div>
    </section>
    <div id="srchOut"></div>
    <div class="modal-overlay" id="bkModal"><div class="modal modal-lg"><div id="bkContent"></div></div></div>
  `);
  return layout('Araç Kirala', 'Tarih ve lokasyon seçin', content, { wide: true });
}

function filterCatPill(btn) {
  document.querySelectorAll('.cat-pill').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const cat = btn.dataset.cat;
  const sel = document.getElementById('sCat');
  if (sel) sel.value = cat;
  if (document.getElementById('srchOut')?.innerHTML) doSearch();
}

function doSearch() {
  bkStart = document.getElementById('sStart').value;
  bkEnd   = document.getElementById('sEnd').value;
  const br  = document.getElementById('sBranch').value;
  const cat = document.getElementById('sCat').value;
  if (!bkStart||!bkEnd||bkStart>=bkEnd) { alert('Geçerli tarih aralığı seçin.'); return; }
  srchResults = getAvailableVehicles(bkStart, bkEnd, br||null, cat);
  const days = calcDays(bkStart, bkEnd);
  const out = document.getElementById('srchOut');
  if (!srchResults.length) {
    out.innerHTML = `<div class="empty"><div class="empty-ico">🚗</div><h3>Uygun araç bulunamadı</h3><p>Farklı tarih veya şube deneyin</p></div>`;
    return;
  }
  const slides = srchResults.map(v => fleetCarouselCard(v, `openBkFromSearch(${v.id})`)).join('');
  out.innerHTML = `
    <p class="results-count">${srchResults.length} araç bulundu · ${days} gün</p>
    ${carouselSection('searchResultsCarousel', 'Müsait araçlar', 'Kaydırarak karşılaştırın', slides)}
    <section class="section-block section-inset">
      <h3 class="section-title-sm">Liste görünümü</h3>
      <div class="vehicle-grid">${srchResults.map(v => vCard(v, days)).join('')}</div>
    </section>`;
  requestAnimationFrame(() => initCarousels());
}

function getBestDiscount(v, spent) {
  const tier = getLoyaltyTier(spent);
  let bestPct = tier.discount;
  let label = tier.discount > 0 ? `VIP %${Math.round(tier.discount*100)}` : '';
  let color = tier.color || 'var(--accent)';

  const activeCamps = (DB.campaigns || []).filter(c => c.isActive && (!c.category || c.category === v.category));
  for (const c of activeCamps) {
    const pct = (c.discountPercent || 0) / 100;
    if (pct > bestPct) {
      bestPct = pct;
      label = `🔥 ${c.title} %${c.discountPercent}`;
      color = c.color ? `var(--${c.color})` : '#ef4444';
    }
  }
  return { pct: bestPct, label, color };
}

function openBkFromSearch(vid) {
  bkStart = document.getElementById('sStart')?.value || bkStart;
  bkEnd = document.getElementById('sEnd')?.value || bkEnd;
  openBk(vid);
}

function vCard(v, days) {
  const b = getBranchById(v.branchId);
  enrichVehicleCatalog(v);
  
  // VIP Loyalty and Campaign calculations
  const myRes = DB.reservations.filter(r => r.customerId === currentUser.id);
  const spent = myRes.filter(r => r.paymentStatus === 'Paid').reduce((s,r)=>s+r.totalAmount,0);
  
  const bestDiscount = getBestDiscount(v, spent);
  const discountedRate = v.dailyRate * (1 - bestDiscount.pct);
  
  const discountBadge = bestDiscount.pct > 0 
    ? `<span style="background:${bestDiscount.color}; color:#fff; font-size:10px; font-weight:800; padding:2px 8px; border-radius:4px; margin-left:8px; display:inline-block; vertical-align:middle; text-shadow:0 1px 2px rgba(0,0,0,0.2);">${bestDiscount.label}</span>` 
    : '';

  const rateHtml = bestDiscount.pct > 0 
    ? `<div style="display:flex; align-items:center; gap:6px;">
         <span style="font-size:11px; text-decoration:line-through; color:var(--text3);">${formatMoney(v.dailyRate)}</span>
         <span class="v-price" style="color:var(--accent); font-weight:800;">${formatMoney(discountedRate)}</span>
       </div>`
    : `<div class="v-price">${formatMoney(v.dailyRate)}</div>`;

  const totalHtml = bestDiscount.pct > 0
    ? `<div>
         <div style="font-size:11px; text-decoration:line-through; color:var(--text3);">${formatMoney(v.dailyRate*days)}</div>
         <div class="v-total" style="color:var(--accent); font-weight:900;">${formatMoney(discountedRate*days)}</div>
       </div>`
    : `<div class="v-total">${formatMoney(v.dailyRate*days)}</div>`;

  return `<div class="v-card" onclick="openBk(${v.id})" style="cursor:pointer;">
    ${vehicleThumb(v)}
    <div style="padding:16px;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        ${vehicleTitleHtml(v)}
        ${discountBadge}
      </div>
      <div class="v-plate" style="margin-top:4px;">${v.plate} · ${v.year} · ${b?.city || '—'}</div>
      ${vehicleSpecsHtml(v, true)}
      ${vehicleFeaturesHtml(v, 2)}
      <div class="v-foot" style="margin-top:12px; border-top:1px solid #f1f3f5; padding-top:12px; display:flex; justify-content:space-between; align-items:flex-end;">
        <div><div class="v-price-lbl" style="margin-bottom:2px">Günlük Tutar</div>${rateHtml}</div>
        <div style="text-align:right"><div class="v-price-lbl" style="margin-bottom:2px">${days} Gün Toplam</div>${totalHtml}</div>
      </div>
    </div>
  </div>`;
}

function openBk(vid) {
  selVehicle = getVehicleById(vid);
  bkStep = 1;
  openModal('bkModal');
  renderBk();
}

function renderBk() {
  const v = selVehicle;
  const days = calcDays(bkStart, bkEnd);
  
  // VIP Loyalty and Campaign calculations
  const myRes = DB.reservations.filter(r => r.customerId === currentUser.id);
  const spent = myRes.filter(r => r.paymentStatus === 'Paid').reduce((s,r)=>s+r.totalAmount,0);
  const tier = getLoyaltyTier(spent);
  const bestDiscount = getBestDiscount(v, spent);
  const baseTotal = v.dailyRate * days;
  const discountAmount = baseTotal * bestDiscount.pct;
  const finalTotal = baseTotal - discountAmount;

  const b = getBranchById(v.branchId);
  const brOpts = DB.branches.map(br=>`<option value="${br.id}"${br.id===v.branchId?' selected':''}>${br.name}</option>`).join('');
  const stepLabels = ['Araç','Rezervasyon','Ödeme','Onay'];
  const stepsHtml = `<div class="steps-bar">${stepLabels.map((s,i)=>`
    <div class="step-item ${bkStep>i+1?'done':bkStep===i+1?'active':''}">
      <div class="step-num">${bkStep>i+1?'✓':i+1}</div>
      <div class="step-lbl">${s}</div>
    </div>${i<3?`<div class="step-line ${bkStep>i+2?'done':''}"></div>`:''}`).join('')}</div>`;

  let body = '';
  if (bkStep === 1) {
    body = `
      <div class="modal-header"><div class="modal-title">Araç Detayı</div><button class="modal-close" onclick="closeModal('bkModal')">✕</button></div>
      ${stepsHtml}
      <div class="modal-body vehicle-detail-modal">
        ${vehicleThumb(v, 'lg')}
        <div class="vehicle-detail-head">
          ${vehicleTitleHtml(v)}
          <div class="vehicle-detail-badges">${statusBadge(v.category)} ${statusBadge(v.status)}</div>
        </div>
        ${vehicleSpecsHtml(v)}
        <div class="vehicle-detail-section">
          <div class="vehicle-detail-section-title">Donanım & güvenlik</div>
          ${vehicleFeaturesHtml(v)}
        </div>
        <div class="d-row"><span class="d-key">Plaka</span><span class="d-val" style="font-family:monospace">${v.plate}</span></div>
        <div class="d-row"><span class="d-key">Şube</span><span class="d-val">${b?.name}</span></div>
        <div class="d-row">
          <span class="d-key">Günlük ücret</span>
          <span class="d-val">
            ${tier.discount > 0 ? `<span style="text-decoration:line-through;color:var(--text3);font-size:12px;margin-right:6px;">${formatMoney(v.dailyRate)}</span>` : ''}
            <span style="color:var(--accent);font-weight:700">${formatMoney(v.dailyRate * (1 - tier.discount))}</span>
          </div>
        </div>

        <!-- KULLANICI YORUMLARI — SRS §3.2.2 -->
        <div class="vehicle-detail-section" style="margin-top:18px;">
          <div class="vehicle-detail-section-title">⭐ Kullanıcı Yorumları</div>
          
          <div style="background:var(--glass);border:1px solid var(--border);border-radius:12px;padding:14px;margin-bottom:14px;">
            <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:8px;">Yorum Yap</div>
            <div style="display:flex;gap:6px;margin-bottom:10px;" id="starPicker">
              ${[1,2,3,4,5].map(i=>`<span data-r="${i}" onclick="pickStar(${i})" style="font-size:22px;cursor:pointer;filter:grayscale(1);transition:filter .15s;" class="star-pick">★</span>`).join('')}
            </div>
            <textarea id="reviewText" class="form-control" rows="2" placeholder="Bu araç hakkında deneyiminizi paylaşın..." style="font-size:13px;resize:none;"></textarea>
            <div id="reviewAlert" style="margin-top:6px;"></div>
            <button class="btn btn-primary btn-sm" style="margin-top:8px;width:100%;" onclick="submitReview(${v.id})">Yorumu Gönder</button>
          </div>

          <div id="reviewsList" style="max-height:260px;overflow-y:auto;padding-right:6px;">${renderVehicleReviews(v.id)}</div>
        </div>
      </div>
      <div class="modal-footer"><button class="btn btn-ghost" onclick="closeModal('bkModal')">İptal</button><button class="btn btn-primary" onclick="bkStep=2;renderBk()">Devam →</button></div>`;

  } else if (bkStep === 2) {
    body = `
      <div class="modal-header"><div class="modal-title">Rezervasyon Bilgileri</div><button class="modal-close" onclick="closeModal('bkModal')">✕</button></div>
      ${stepsHtml}
      <div class="modal-body">
        <div class="form-row">
          <div class="form-group"><label class="form-label">Alış Tarihi</label><input class="form-control" type="date" id="bS" value="${bkStart}"/></div>
          <div class="form-group"><label class="form-label">İade Tarihi</label><input class="form-control" type="date" id="bE" value="${bkEnd}"/></div>
        </div>
        <div class="form-group"><label class="form-label">Alış Şubesi</label><select class="form-control" id="bPick">${brOpts}</select></div>
        <div class="form-group"><label class="form-label">İade Şubesi</label><select class="form-control" id="bRet">${brOpts}</select></div>

        <!-- EK HİZMETLER -->
        <div style="margin:14px 0 6px;font-weight:700;font-size:13px;color:var(--text)">➕ Ek Hizmetler</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px;">
          ${[
            { id:'exKasko',  name:'Tam Kasko',        icon:'🛡️', daily:200 },
            { id:'exChild',  name:'Çocuk Koltuğu',    icon:'👶', daily:50  },
            { id:'exDriver', name:'Ek Sürücü',         icon:'🧑‍✈️', daily:100 },
            { id:'exGps',    name:'GPS Navigasyon',    icon:'📡', daily:30  },
          ].map(s=>`
            <label style="display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--border);border-radius:10px;cursor:pointer;background:var(--glass);font-size:13px;user-select:none;" onclick="recalcExtras(${days})">
              <input type="checkbox" id="${s.id}" style="accent-color:var(--accent);width:15px;height:15px;">
              <span>${s.icon} ${s.name}</span>
              <span style="margin-left:auto;font-weight:700;color:var(--accent)">+${s.daily*days}₺</span>
            </label>`).join('')}
        </div>

        <div class="sum-box" id="step2Summary">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span class="sum-lbl">Kiralama Bedeli (${days} gün × ${formatMoney(selVehicle.dailyRate)})</span>
            <span style="font-weight:600;">${formatMoney(baseTotal)}</span>
          </div>
          ${bestDiscount.pct > 0 ? `
          <div style="display:flex;justify-content:space-between;align-items:center;color:var(--green);font-size:12px;margin:4px 0;">
            <span>${bestDiscount.label} İndirimi (-%${Math.round(bestDiscount.pct*100)})</span>
            <span>-${formatMoney(discountAmount)}</span>
          </div>` : ''}
          <div id="extrasLine" style="display:none;justify-content:space-between;align-items:center;color:var(--accent);font-size:13px;margin:4px 0;">
            <span>Ek Hizmetler</span><span id="extrasAmt">+0₺</span>
          </div>
          <div style="border-top:1px solid rgba(0,0,0,0.06);margin-top:10px;padding-top:10px;display:flex;justify-content:space-between;align-items:center;">
            <span class="sum-lbl" style="font-weight:800;color:var(--text);">Net Toplam</span>
            <span class="sum-total" id="step2Total" data-base="${finalTotal}">${formatMoney(finalTotal)}</span>
          </div>
        </div>
      </div>
      <div class="modal-footer"><button class="btn btn-ghost" onclick="bkStep=1;renderBk()">← Geri</button><button class="btn btn-primary" onclick="toPayment()">Ödemeye Geç →</button></div>`;

  } else if (bkStep === 3) {
    body = `
      <div class="modal-header"><div class="modal-title">Ödeme</div><button class="modal-close" onclick="closeModal('bkModal')">✕</button></div>
      ${stepsHtml}
      <div class="modal-body">
        <div class="sum-box">
          <div style="display:flex;justify-content:space-between;align-items:center;font-size:13px;opacity:0.8;">
            <span>Kiralama Bedeli</span>
            <span>${formatMoney(baseTotal)}</span>
          </div>
          ${bestDiscount.pct > 0 ? `
          <div style="display:flex;justify-content:space-between;align-items:center;color:var(--green);font-size:12px;margin:4px 0;">
            <span>${bestDiscount.label} İndirimi (-%${Math.round(bestDiscount.pct*100)})</span>
            <span>-${formatMoney(discountAmount)}</span>
          </div>` : ''}
          <div style="border-top:1px solid rgba(0,0,0,0.06);margin-top:8px;padding-top:8px;display:flex;justify-content:space-between;align-items:center;">
            <span class="sum-lbl" style="font-weight:800;color:var(--text);">Ödenecek Tutar</span>
            <span class="sum-total" style="font-size:22px;">${formatMoney(finalTotal)}</span>
          </div>
        </div>
        <div class="form-group"><label class="form-label">Kart Üzerindeki İsim</label><input class="form-control" id="cName" placeholder="AD SOYAD"/></div>
        <div class="form-group"><label class="form-label">Kart Numarası</label><input class="form-control" id="cNo" placeholder="**** **** **** ****" maxlength="19" oninput="fmtCard(this)"/></div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Son Kullanma</label><input class="form-control" id="cExp" placeholder="AA/YY" maxlength="5"/></div>
          <div class="form-group"><label class="form-label">CVV</label><input class="form-control" type="password" id="cCvv" placeholder="•••" maxlength="3"/></div>
        </div>
        <!-- Ödeme yöntemi seçimi -->
        <div class="form-group" style="margin-top:4px;">
          <label class="form-label">Ödeme Yöntemi</label>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <label style="display:flex;align-items:center;gap:6px;padding:8px 14px;border:1px solid var(--border);border-radius:8px;cursor:pointer;font-size:13px;background:var(--glass)"><input type="radio" name="payMethod" value="credit" checked> 💳 Kredi Kartı</label>
            <label style="display:flex;align-items:center;gap:6px;padding:8px 14px;border:1px solid var(--border);border-radius:8px;cursor:pointer;font-size:13px;background:var(--glass)"><input type="radio" name="payMethod" value="debit"> 🏦 Banka Kartı</label>
            <label style="display:flex;align-items:center;gap:6px;padding:8px 14px;border:1px solid var(--border);border-radius:8px;cursor:pointer;font-size:13px;background:var(--glass)"><input type="radio" name="payMethod" value="cash"> 💵 Nakit</label>
          </div>
        </div>
        <div id="payErr"></div>
      </div>
      <div class="modal-footer"><button class="btn btn-ghost" onclick="bkStep=2;renderBk()">← Geri</button><button class="btn btn-primary" onclick="launch3DSecure()">Ödemeyi Onayla →</button></div>

      <!-- 3D Secure Modal -->
      <div id="secureOverlay" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.65);z-index:9999;align-items:center;justify-content:center;">
        <div style="background:white;border-radius:16px;padding:36px;max-width:380px;width:92%;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.3);">
          <div style="font-size:40px;margin-bottom:12px;">🏦</div>
          <div style="font-size:16px;font-weight:800;margin-bottom:4px;color:#1e293b;">Banka Güvenlik Doğrulaması</div>
          <div style="font-size:12px;color:#64748b;margin-bottom:20px;">3D Secure — Kimliğinizi doğrulayın</div>
          <div style="background:#f1f5f9;border-radius:10px;padding:16px;margin-bottom:16px;font-size:13px;color:#374151;text-align:left;">
            <div style="margin-bottom:6px">📱 <strong>+90 532 *** ** 33</strong> numarasına SMS gönderildi</div>
            <div style="font-size:11px;color:#6b7280;">SMS kodu 3 dakika geçerlidir</div>
          </div>
          <input type="text" id="smsCode" maxlength="6" placeholder="6 haneli kodu girin"
            style="width:100%;text-align:center;font-size:22px;letter-spacing:10px;padding:12px;border:2px solid #e2e8f0;border-radius:10px;outline:none;font-family:monospace;margin-bottom:16px;"/>
          <div id="secureErr" style="color:#ef4444;font-size:12px;margin-bottom:10px;"></div>
          <button class="btn btn-primary" style="width:100%" onclick="verify3DSecure()">Doğrula ve Öde</button>
          <div style="font-size:11px;color:#94a3b8;margin-top:12px">Demo: herhangi 6 rakam girebilirsiniz</div>
        </div>
      </div>`;

  } else {
    const resObj = window._lastCreatedReservation || {};
    const resId  = resObj.id || '?';
    
    // Gelişmiş Premium Fatura Arayüzü
    body = `
      <div class="modal-header">
        <div class="modal-title">Ödeme & Rezervasyon Başarılı</div>
        <button class="modal-close" onclick="closeModal('bkModal')">✕</button>
      </div>
      ${stepsHtml}
      <div class="modal-body" style="background:#f8f9fb;padding:24px;">
        
        <!-- Premium Fatura Tasarımı -->
        <div class="invoice-box" id="printInvoice" style="background:white;border-radius:14px;padding:32px;box-shadow:0 4px 20px rgba(0,0,0,0.04);border:1px solid #eef0f4;position:relative;">
          
          <!-- Fatura Başlığı -->
          <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px dashed #e2e8f0;padding-bottom:20px;margin-bottom:24px;">
            <div>
              <div style="font-size:20px;font-weight:900;color:var(--sidebar);display:flex;align-items:center;gap:6px;">
                <span style="background:var(--accent);color:white;width:28px;height:28px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:14px;">🚗</span>
                DriveFleet
              </div>
              <div style="font-size:11px;color:var(--text3);margin-top:4px;">Elektronik Kiralama Faturası</div>
            </div>
            <div style="text-align:right;">
              <span style="font-size:10px;background:#def7ec;color:#03543f;font-weight:700;padding:4px 10px;border-radius:999px;display:inline-block;margin-bottom:6px;">ÖDENDİ</span>
              <div style="font-family:monospace;font-size:13px;font-weight:700;color:var(--text2)">#RES-${resId}</div>
            </div>
          </div>
          
          <!-- Müşteri & Şube Detayları -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;font-size:12px;margin-bottom:24px;color:var(--text2);">
            <div>
              <strong style="color:var(--text);display:block;margin-bottom:4px;">MÜŞTERİ</strong>
              ${currentUser.firstName} ${currentUser.lastName}<br>
              ${currentUser.email}<br>
              VIP Durumu: <span style="font-weight:700;color:${tier.color}">${tier.name}</span>
            </div>
            <div>
              <strong style="color:var(--text);display:block;margin-bottom:4px;">KİRALAMA DETAYI</strong>
              Araç: <strong>${v.brand} ${v.model}</strong> (${v.plate})<br>
              Alış Şubesi: ${getBranchById(resObj.pickupBranchId)?.name || b?.name}<br>
              Süre: ${days} gün (${formatDate(bkStart)} - ${formatDate(bkEnd)})
            </div>
          </div>
          
          <!-- Hesap Özeti Tablosu -->
          <div style="border-top:1px solid #f1f3f5;border-bottom:1px solid #f1f3f5;padding:14px 0;margin-bottom:24px;font-size:13px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
              <span>Günlük Bedel (${days} Gün × ${formatMoney(v.dailyRate)})</span>
              <span style="font-weight:600;">${formatMoney(baseTotal)}</span>
            </div>
            ${bestDiscount.pct > 0 ? `
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;color:var(--green);">
              <span>${bestDiscount.label} (-%${Math.round(bestDiscount.pct*100)})</span>
              <span>-${formatMoney(discountAmount)}</span>
            </div>` : ''}
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;opacity:0.8;font-size:12px;">
              <span>KDV (%20)</span>
              <span>Dahildir</span>
            </div>
            <div style="display:flex;justify-content:space-between;margin-top:14px;padding-top:14px;border-top:1px dashed #e2e8f0;font-size:16px;font-weight:900;color:var(--sidebar);">
              <span>GENEL TOPLAM</span>
              <span style="color:var(--accent);font-size:18px;">${formatMoney(finalTotal)}</span>
            </div>
          </div>
          
          <!-- QR Kod ve Alt Bilgi -->
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div style="font-size:11px;color:var(--text3);max-width:240px;line-height:1.4;">
              * Bu belge DriveFleet Kiralama Otomasyonu tarafından dijital olarak düzenlenmiştir. Teslimat anında barkod ile sorgulanabilir.
            </div>
            <!-- Dinamik CSS QR Kod simülasyonu -->
            <div style="width:70px;height:70px;border:1px solid #e2e8f0;padding:4px;border-radius:6px;background:white;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.03);">
              <div style="width:100%;height:100%;background:repeating-conic-gradient(from 0deg,#000 0deg 90deg,#fff 0deg 180deg) 0 0/14px 14px;filter:contrast(150%);"></div>
            </div>
          </div>
          
        </div>
      </div>
      <div class="modal-footer" style="background:white;display:flex;gap:8px;flex-wrap:wrap;">
        <button class="btn btn-ghost" onclick="printContract()" style="gap:6px;">📄 Sözleşme Yazdır</button>
        <button class="btn btn-ghost" onclick="window.print()" style="gap:6px;">🖨️ Fatura PDF</button>
        <button class="btn btn-primary" onclick="closeModal('bkModal');showPage('myReservations')">Rezervasyonlarıma Git →</button>
      </div>

      <!-- Dijital Sözleşme -->
      <div id="contractSection" style="display:none;padding:24px;background:#f8f9fb;border-top:1px solid var(--border);">
        <div id="contractBody" style="background:white;border-radius:12px;padding:28px;font-size:12px;line-height:1.7;color:#374151;border:1px solid #e2e8f0;max-height:280px;overflow-y:auto;margin-bottom:16px;">
          <div style="text-align:center;margin-bottom:16px;">
            <div style="font-size:16px;font-weight:800;color:#1e293b">ARAÇ KİRALAMA SÖZLEŞMESİ</div>
            <div style="font-size:11px;color:#64748b">DriveFleet Araç Kiralama Otomasyonu — Dijital Sözleşme</div>
          </div>
          <p><strong>Sözleşme No:</strong> #RES-${resId} &nbsp; <strong>Tarih:</strong> ${new Date().toLocaleDateString('tr-TR')}</p>
          <p><strong>KİRALAYAN (Kiralama Şirketi):</strong> DriveFleet A.Ş. — Tüm Türkiye Şubeleri</p>
          <p><strong>KİRACI:</strong> ${currentUser.firstName} ${currentUser.lastName} (E-posta: ${currentUser.email})</p>
          <p><strong>ARAÇ:</strong> ${v.brand} ${v.model} — ${v.plate} — ${v.year} Model</p>
          <p><strong>KİRALAMA DÖNEMİ:</strong> ${formatDate(bkStart)} → ${formatDate(bkEnd)} (${days} Gün)</p>
          <p><strong>TOPLAM BEDEL:</strong> ${formatMoney(finalTotal)} (KDV Dahil)</p>
          <hr style="border:none;border-top:1px dashed #e2e8f0;margin:12px 0"/>
          <p><strong>Madde 1 — Teslim ve İade:</strong> Kiracı, aracı sözleşmede belirtilen tarih ve saatte teslim almakla ve iade etmekle yükümlüdür. Geç iade durumunda günlük kiralama bedelinin %150'si oranında ek ücret uygulanır.</p>
          <p><strong>Madde 2 — Hasar Sorumluluğu:</strong> Kiracı, kiralama süresi içinde araçta meydana gelen hasarlardan sorumludur. Seçilen sigorta paketi dışındaki hasarlar kiracı tarafından karşılanır.</p>
          <p><strong>Madde 3 — Yakıt:</strong> Araç dolu yakıt ile teslim edilecek; dolu yakıt ile iade edilecektir. Eksik yakıt bedeli iade anında tahsil edilir.</p>
          <p><strong>Madde 4 — Trafik Cezaları:</strong> Kiralama süresi içindeki tüm trafik cezaları kiracıya aittir.</p>
          <p><strong>Madde 5 — İptal Politikası:</strong> Kiralama başlamadan 24 saat önce yapılan iptallerde tam iade yapılır. Daha kısa sürelerde %50 iade uygulanır.</p>
          <p><strong>Madde 6 — Uyuşmazlık:</strong> Bu sözleşmeden doğan anlaşmazlıklarda Türkiye Cumhuriyeti mahkemeleri ve icra daireleri yetkilidir.</p>
          <hr style="border:none;border-top:1px dashed #e2e8f0;margin:12px 0"/>
          <p style="font-size:11px;color:#94a3b8;">Bu sözleşme elektronik ortamda düzenlenmiş olup 5070 sayılı Elektronik İmza Kanunu kapsamında geçerlidir.</p>
        </div>
        <label style="display:flex;align-items:center;gap:10px;cursor:pointer;font-size:13px;font-weight:600;color:#1e293b;padding:14px;background:#f0fdf4;border-radius:10px;border:1px solid #bbf7d0;">
          <input type="checkbox" id="contractSign" style="width:18px;height:18px;accent-color:#22c55e;" onchange="toggleContractSubmit()">
          ✅ Kiralama sözleşmesini okudum, anladım ve dijital olarak imzalıyorum.
        </label>
        <div id="contractSignedBadge" style="display:none;margin-top:10px;text-align:center;padding:10px;background:#dcfce7;border-radius:8px;color:#166534;font-weight:700;font-size:13px;">
          ✅ Sözleşme Dijital Olarak İmzalandı — ${currentUser.firstName} ${currentUser.lastName} — ${new Date().toLocaleString('tr-TR')}
        </div>
      </div>`;

  }
  document.getElementById('bkContent').innerHTML = body;
}

// Ek hizmet seçildiğinde toplam güncelle
// ───── Araç Yorumları — SRS §3.2.2 ─────
let _selectedRating = 0;

function renderVehicleReviews(vehicleId) {
  const reviews = (DB.reviews || []).filter(r => r.vehicleId === vehicleId);
  if (!reviews.length) {
    return `<div style="text-align:center;padding:14px;color:var(--text2);font-size:13px;">Henüz yorum yapılmamış. İlk yorumu sen yap!</div>`;
  }
  const avg = (reviews.reduce((s,r) => s + r.rating, 0) / reviews.length).toFixed(1);
  const stars = (n) => '★'.repeat(Math.round(n)) + '☆'.repeat(5 - Math.round(n));
  return `
    <div style="display:flex;align-items:center;gap:10px;padding:10px 0 14px;border-bottom:1px solid var(--border);margin-bottom:12px;">
      <div style="font-size:32px;font-weight:900;color:var(--accent);">${avg}</div>
      <div>
        <div style="color:#f59e0b;font-size:18px;letter-spacing:2px;">${stars(avg)}</div>
        <div style="font-size:11px;color:var(--text2);">${reviews.length} yorum</div>
      </div>
    </div>
    ${reviews.slice(-5).reverse().map(r => `
      <div style="padding:10px 0;border-bottom:1px solid var(--border);">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
          <div style="font-weight:700;font-size:13px;">${r.authorName || 'Anonim'}</div>
          <div style="color:#f59e0b;font-size:14px;">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</div>
        </div>
        <div style="font-size:13px;color:var(--text2);line-height:1.5;">${r.comment}</div>
        <div style="font-size:11px;color:var(--text3);margin-top:4px;">${new Date(r.createdAt).toLocaleDateString('tr-TR')}</div>
      </div>`).join('')}`;
}

function pickStar(n) {
  _selectedRating = n;
  document.querySelectorAll('.star-pick').forEach((s, i) => {
    s.style.filter = i < n ? 'none' : 'grayscale(1)';
    s.style.color  = i < n ? '#f59e0b' : '';
  });
}

async function submitReview(vehicleId) {
  const comment = document.getElementById('reviewText')?.value?.trim();
  const alertEl = document.getElementById('reviewAlert');
  if (!_selectedRating) { if(alertEl) alertEl.innerHTML=`<div style="color:#ef4444;font-size:12px;">Lütfen puan seçin.</div>`; return; }
  if (!comment) { if(alertEl) alertEl.innerHTML=`<div style="color:#ef4444;font-size:12px;">Yorum boş olamaz.</div>`; return; }
  const review = {
    vehicleId,
    customerId:  currentUser.id,
    authorName:  `${currentUser.firstName} ${currentUser.lastName}`,
    rating:      _selectedRating,
    comment,
    createdAt:   new Date().toISOString()
  };
  try {
    const saved = await apiFetch('/reviews', { method: 'POST', body: JSON.stringify(review) });
    if (!DB.reviews) DB.reviews = [];
    DB.reviews.push(saved);
    // Listeyi güncelle
    const listEl = document.getElementById('reviewsList');
    if (listEl) listEl.innerHTML = renderVehicleReviews(vehicleId);
    document.getElementById('reviewText').value = '';
    _selectedRating = 0;
    pickStar(0);
    if (alertEl) alertEl.innerHTML = `<div style="color:#22c55e;font-size:12px;">✅ Yorumunuz eklendi!</div>`;
  } catch(e) {
    if (alertEl) alertEl.innerHTML = `<div style="color:#ef4444;font-size:12px;">${e.error || 'Yorum gönderilemedi.'}</div>`;
  }
}

// ─────────────────────────────────────────────────────
function recalcExtras(days) {

  // setTimeout 0: checkbox DOM güncellemesini bekle
  setTimeout(() => {
    const services = [
      { id: 'exKasko',  daily: 200 },
      { id: 'exChild',  daily: 50  },
      { id: 'exDriver', daily: 100 },
      { id: 'exGps',    daily: 30  },
    ];
    const extrasTotal = services.reduce((sum, s) => {
      return sum + (document.getElementById(s.id)?.checked ? s.daily * days : 0);
    }, 0);

    const extLine = document.getElementById('extrasLine');
    const extAmt  = document.getElementById('extrasAmt');
    const totEl   = document.getElementById('step2Total');
    if (!totEl) return;

    // Base + VIP indirim (data-* özniteliğinden)
    const base = parseFloat(totEl.dataset.base || totEl.textContent.replace(/[^\d]/g,''));
    if (extLine) extLine.style.display = extrasTotal > 0 ? 'flex' : 'none';
    if (extAmt)  extAmt.textContent = '+' + extrasTotal.toLocaleString('tr-TR') + '₺';
    if (totEl)   totEl.innerHTML  = formatMoney(base + extrasTotal);
  }, 0);
}

function fmtCard(el) { let v=el.value.replace(/\D/g,'').slice(0,16); el.value=v.replace(/(\d{4})(?=\d)/g,'$1 '); }


// ───── 3D Secure Simülasyonu ─────
let _payFailCount = 0;
function launch3DSecure() {
  const name = document.getElementById('cName')?.value?.trim();
  const no   = document.getElementById('cNo')?.value?.trim();
  const exp  = document.getElementById('cExp')?.value?.trim();
  const cvv  = document.getElementById('cCvv')?.value?.trim();
  const meth = document.querySelector('input[name="payMethod"]:checked')?.value || 'credit';
  if (meth !== 'cash') {
    if (!name||!no||!exp||!cvv) { showAlert('payErr','Kart bilgilerini doldurun.','danger'); return; }
    if (no.replace(/\s/g,'').length < 16) { showAlert('payErr','Geçersiz kart numarası.','danger'); return; }
  }
  // Kart bilgisi uygunsa 3D Secure göster
  const overlay = document.getElementById('secureOverlay');
  if (overlay) { overlay.style.display = 'flex'; document.getElementById('smsCode').focus(); }
}

function verify3DSecure() {
  const code = document.getElementById('smsCode')?.value?.trim();
  if (!code || code.length < 6) {
    document.getElementById('secureErr').textContent = '6 haneli kodu eksiksiz girin.';
    return;
  }
  // Demo: her 6 rakam kabul edilir; gerçek sistemde banka API çağrısı
  document.getElementById('secureOverlay').style.display = 'none';
  completePay();
}

// ───── Sözleşme ─────
function printContract() {
  const section = document.getElementById('contractSection');
  if (section) {
    section.style.display = 'block';
    section.scrollIntoView({ behavior: 'smooth' });
  }
}

function toggleContractSubmit() {
  const cb    = document.getElementById('contractSign');
  const badge = document.getElementById('contractSignedBadge');
  if (cb && badge) badge.style.display = cb.checked ? 'block' : 'none';
}


function toPayment() {
  bkStart = document.getElementById('bS').value;
  bkEnd   = document.getElementById('bE').value;
  if (!bkStart||!bkEnd||bkStart>=bkEnd) { alert('Geçerli tarih seçin.'); return; }
  bkStep = 3; renderBk();
}

// Ek hizmetleri al
function getSelectedExtras(days) {
  const services = [
    { id: 'exKasko',  name: 'Tam Kasko',       dailyPrice: 200 },
    { id: 'exChild',  name: 'Çocuk Koltuğu',    dailyPrice:  50 },
    { id: 'exDriver', name: 'Ek Sürücü',        dailyPrice: 100 },
    { id: 'exGps',    name: 'GPS Navigasyon',   dailyPrice:  30 },
  ];
  return services
    .filter(s => document.getElementById(s.id)?.checked)
    .map(s => ({ serviceName: s.name, price: s.dailyPrice * days }));
}

async function completePay() {
  const name = document.getElementById('cName').value.trim();
  const no   = document.getElementById('cNo').value.replace(/\s/g,'');
  const exp  = document.getElementById('cExp').value.trim();
  const cvv  = document.getElementById('cCvv').value.trim();
  if (!name||no.length<16||!exp||cvv.length<3) { showAlert('payErr','Kart bilgilerini eksiksiz doldurun.','danger'); return; }

  const days         = calcDays(bkStart, bkEnd);
  const myRes        = DB.reservations.filter(r => r.customerId === currentUser.id);
  const spent        = myRes.filter(r => r.paymentStatus === 'Paid').reduce((s,r)=>s+r.totalAmount,0);
  const bestDiscount = getBestDiscount(selVehicle, spent);
  const baseTotal    = selVehicle.dailyRate * days;
  const extras       = getSelectedExtras(days);
  const extrasTotal  = extras.reduce((s,e)=>s+e.price,0);
  const finalTotal   = (baseTotal * (1 - bestDiscount.pct)) + extrasTotal;
  const pickId = parseInt(document.getElementById('bPick')?.value || selVehicle.branchId);
  const retId  = parseInt(document.getElementById('bRet')?.value  || selVehicle.branchId);

  const btn = document.querySelector('#bkContent .btn-primary');
  if (btn) { btn.disabled = true; btn.textContent = 'İşleniyor...'; }

  try {
    const res = await apiCreateReservation({
      customerId: currentUser.id, vehicleId: selVehicle.id,
      startDate: bkStart, endDate: bkEnd,
      totalAmount: finalTotal, pickupBranchId: pickId, returnBranchId: retId, extras
    });
    window._lastCreatedReservation = res;
    await apiCreatePayment({ reservationId: res.id, transactionId: 'TXN' + Date.now(), amount: finalTotal });
    addNotification(currentUser.id, res.id, 'Email', 'Rezervasyon Onaylandı', `${selVehicle.brand} ${selVehicle.model} — ${formatDate(bkStart)}`);
    bkStep = 4; renderBk();
  } catch (e) {
    showAlert('payErr', e.error || 'Ödeme işlemi başarısız.', 'danger');
    if (btn) { btn.disabled = false; btn.textContent = 'Ödemeyi Onayla →'; }
  }
}

// --- REZERVASYONLARIM ---
function renderMyReservations() {
  const list = DB.reservations.filter(r=>r.customerId===currentUser.id).reverse();
  const activeCount = list.filter(r=>r.status==='Active').length;
  const completedCount = list.filter(r=>r.status==='Completed').length;
  const totalSpent = list.filter(r=>r.paymentStatus==='Paid').reduce((s,r)=>s+r.totalAmount,0);

  const rows = list.map(r => {
    const v=getVehicleById(r.vehicleId), b=getBranchById(r.pickupBranchId);
    if(v) enrichVehicleCatalog(v);
    const imgHtml = v ? vehicleThumb(v, 'sm') : '<div class="no-img"></div>';
    return `<tr>
      <td style="width:40px"><span style="font-family:monospace;font-size:12px;color:var(--text2)">#${r.id}</span></td>
      <td style="width:280px">
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="width:70px;flex-shrink:0;">${imgHtml}</div>
          <div>
            <strong>${v?v.brand+' '+v.model:'—'}</strong>
            <div style="font-size:11px;color:var(--text3);margin-top:2px;letter-spacing:1px">${v?v.plate:'—'}</div>
          </div>
        </div>
      </td>
      <td>
        <div style="font-size:13px;font-weight:600">${formatDate(r.startDate)}</div>
        <div style="font-size:11px;color:var(--text2)">Alış</div>
      </td>
      <td>
        <div style="font-size:13px;font-weight:600">${formatDate(r.endDate)}</div>
        <div style="font-size:11px;color:var(--text2)">İade</div>
      </td>
      <td>
        <div style="font-weight:600;font-size:13px">${b?.city||'—'}</div>
        <div style="font-size:11px;color:var(--text2)">Şube</div>
      </td>
      <td>${statusBadge(r.status)}</td>
      <td style="font-weight:800;font-size:15px">${formatMoney(r.totalAmount)}</td>
      <td style="text-align:right;">
        <div style="display:flex;justify-content:flex-end;gap:6px;">
          <button class="btn btn-ghost btn-sm" onclick="viewInvoiceFromList(${r.id})" style="padding:6px 12px;gap:4px;color:var(--accent);border:1px solid rgba(200,16,46,0.12);">📄 Fatura</button>
          ${r.status==='Active'?`<button class="btn btn-danger btn-sm" onclick="cancelRes(${r.id})" style="padding:6px 12px">İptal Et</button>`:''}
          ${r.status==='Completed'?`<button class="btn btn-ghost btn-sm" onclick="showPage('vehicleSearch')" style="padding:6px 12px">Tekrar Kirala</button>`:''}
        </div>
      </td>
    </tr>`;
  }).join('') || `<tr><td colspan="8"><div class="empty-premium">
    <div class="empty-ico-lg">🚗</div>
    <h3>Henüz bir seyahatiniz yok</h3>
    <p>DriveFleet ayrıcalığıyla yola çıkmak için ilk rezervasyonunuzu oluşturun.</p>
    <button class="btn btn-primary" onclick="showPage('vehicleSearch')">Araçları Keşfet</button>
  </div></td></tr>`;

  const content = `
    <div class="page-hero">
      <div class="page-hero-bg"></div>
      <div class="page-hero-inner">
        <h1 class="page-title-lg">Rezervasyon Yönetimi</h1>
        <p class="page-subtitle">Geçmiş ve aktif kiralama işlemlerinizi detaylıca takip edin.</p>
        
        <div class="stats-inline premium-stats" style="margin-top:24px;">
          <div class="stat-card">
            <div class="stat-lbl">Aktif Kiralamalar</div>
            <div class="stat-val" style="color:var(--accent)">${activeCount}</div>
          </div>
          <div class="stat-card">
            <div class="stat-lbl">Tamamlanan</div>
            <div class="stat-val" style="color:var(--green)">${completedCount}</div>
          </div>
          <div class="stat-card">
            <div class="stat-lbl">Toplam Harcama</div>
            <div class="stat-val">${formatMoney(totalSpent)}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="section-inset" style="margin-top:-32px;position:relative;z-index:10;">
      <div class="card p-card">
        <div class="card-header" style="border-bottom:none;padding-bottom:0;">
          <div>
            <div class="card-title" style="font-size:18px;">Tüm Seyahatlerim</div>
            <div style="font-size:12px;color:var(--text2);margin-top:4px;">Kronolojik olarak listelenmektedir</div>
          </div>
          <button class="btn btn-primary" onclick="showPage('vehicleSearch')">+ Yeni Rezervasyon</button>
        </div>
        <div class="tbl-wrap" style="border:none;box-shadow:none;">
          <table class="premium-table">
            <thead>
              <tr><th>KOD</th><th>ARAÇ DETAYI</th><th>ALIŞ</th><th>İADE</th><th>LOKASYON</th><th>DURUM</th><th>TUTAR</th><th></th></tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>
    </div>
    <div class="modal-overlay" id="bkModal"><div class="modal modal-lg"><div id="bkContent"></div></div></div>
  `;
  
  return layout('Rezervasyonlarım', '', content, { wide: true });
}

async function cancelRes(id) {
  if (!confirm('Rezervasyonu iptal etmek istediğinize emin misiniz?')) return;
  try {
    await apiCancelReservation(id);
    showPage('myReservations');
  } catch (e) { alert(e.error || 'İptal başarısız.'); }
}

function viewInvoiceFromList(resId) {
  const res = DB.reservations.find(r => r.id === resId);
  if (!res) return;
  const v = getVehicleById(res.vehicleId);
  if (!v) return;
  
  // Calculate historical tier
  const myRes = DB.reservations.filter(r => r.customerId === currentUser.id);
  const spent = myRes.filter(r => r.paymentStatus === 'Paid').reduce((s,r)=>s+r.totalAmount,0);
  const tier = getLoyaltyTier(spent);
  
  const days = calcDays(res.startDate, res.endDate);
  const baseTotal = v.dailyRate * days;
  const discountAmount = baseTotal * tier.discount;
  const finalTotal = res.totalAmount; 

  const body = `
    <div class="modal-header">
      <div class="modal-title">Seyahat Faturası</div>
      <button class="modal-close" onclick="closeModal('bkModal')">✕</button>
    </div>
    <div class="modal-body" style="background:#f8f9fb;padding:24px;">
      <div class="invoice-box" id="printInvoice" style="background:white;border-radius:14px;padding:32px;box-shadow:0 4px 20px rgba(0,0,0,0.04);border:1px solid #eef0f4;position:relative;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px dashed #e2e8f0;padding-bottom:20px;margin-bottom:24px;">
          <div>
            <div style="font-size:20px;font-weight:900;color:var(--sidebar);display:flex;align-items:center;gap:6px;">
              <span style="background:var(--accent);color:white;width:28px;height:28px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:14px;">🚗</span>
              DriveFleet
            </div>
            <div style="font-size:11px;color:var(--text3);margin-top:4px;">Elektronik Kiralama Faturası</div>
          </div>
          <div style="text-align:right;">
            <span style="font-size:10px;background:#def7ec;color:#03543f;font-weight:700;padding:4px 10px;border-radius:999px;display:inline-block;margin-bottom:6px;">ÖDENDİ</span>
            <div style="font-family:monospace;font-size:13px;font-weight:700;color:var(--text2)">#RES-${res.id}</div>
          </div>
        </div>
        
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;font-size:12px;margin-bottom:24px;color:var(--text2);">
          <div>
            <strong style="color:var(--text);display:block;margin-bottom:4px;">MÜŞTERİ</strong>
            ${currentUser.firstName} ${currentUser.lastName}<br>
            ${currentUser.email}<br>
            VIP Durumu: <span style="font-weight:700;color:${tier.color}">${tier.name}</span>
          </div>
          <div>
            <strong style="color:var(--text);display:block;margin-bottom:4px;">KİRALAMA DETAYI</strong>
            Araç: <strong>${v.brand} ${v.model}</strong> (${v.plate})<br>
            Alış Şubesi: ${getBranchById(res.pickupBranchId)?.name || 'Merkez Şube'}<br>
            Süre: ${days} gün (${formatDate(res.startDate)} - ${formatDate(res.endDate)})
          </div>
        </div>
        
        <div style="border-top:1px solid #f1f3f5;border-bottom:1px solid #f1f3f5;padding:14px 0;margin-bottom:24px;font-size:13px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
            <span>Günlük Bedel (${days} Gün × ${formatMoney(v.dailyRate)})</span>
            <span style="font-weight:600;">${formatMoney(baseTotal)}</span>
          </div>
          ${tier.discount > 0 ? `
          <div style="display:flex;justify-content:space-between;margin-bottom:8px;color:var(--green);">
            <span>VIP Privilege İndirimi (-%${tier.discount*100})</span>
            <span>-${formatMoney(discountAmount)}</span>
          </div>` : ''}
          <div style="display:flex;justify-content:space-between;margin-bottom:8px;opacity:0.8;font-size:12px;">
            <span>KDV (%20)</span>
            <span>Dahildir</span>
          </div>
          <div style="display:flex;justify-content:space-between;margin-top:14px;padding-top:14px;border-top:1px dashed #e2e8f0;font-size:16px;font-weight:900;color:var(--sidebar);">
            <span>GENEL TOPLAM</span>
            <span style="color:var(--accent);font-size:18px;">${formatMoney(finalTotal)}</span>
          </div>
        </div>
        
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div style="font-size:11px;color:var(--text3);max-width:240px;line-height:1.4;">
            * Bu belge DriveFleet Kiralama Otomasyonu tarafından dijital olarak düzenlenmiştir. Teslimat anında barkod ile sorgulanabilir.
          </div>
          <div style="width:70px;height:70px;border:1px solid #e2e8f0;padding:4px;border-radius:6px;background:white;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.03);">
            <div style="width:100%;height:100%;background:repeating-conic-gradient(from 0deg,#000 0deg 90deg,#fff 0deg 180deg) 0 0/14px 14px;filter:contrast(150%);"></div>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-footer" style="background:white;">
      <button class="btn btn-ghost" onclick="window.print()" style="gap:6px;">🖨️ Yazdır / PDF Kaydet</button>
      <button class="btn btn-primary" onclick="closeModal('bkModal')">Kapat</button>
    </div>`;
    
  document.getElementById('bkContent').innerHTML = body;
  openModal('bkModal');
}

// --- BİLDİRİMLER ---
function renderMyNotifications() {
  const notifs = DB.notifications.filter(n=>n.customerId===currentUser.id).reverse();
  const rows = notifs.map(n=>`<tr>
    <td style="width:60px;text-align:center;">
      <div style="width:36px;height:36px;background:var(--bg3);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:16px;">
        ${n.type==='Email'?'📧':'📱'}
      </div>
    </td>
    <td>
      <strong style="font-size:14px">${n.subject}</strong>
      <div style="font-size:12px;color:var(--text2);margin-top:4px;">${n.body}</div>
    </td>
    <td style="text-align:right;">
      <div style="font-size:12px;color:var(--text3);font-weight:600">${formatDate(n.createdAt)}</div>
      <div style="margin-top:6px;">
        <button class="btn btn-ghost btn-sm" onclick="markRead(${n.id})">✓ Okundu İşaretle</button>
      </div>
    </td>
  </tr>`).join('')||`<tr><td colspan="3"><div class="empty-premium">
    <div class="empty-ico-lg">📭</div>
    <h3>Bildirim kutunuz boş</h3>
    <p>Şu an için size ulaşan yeni bir mesaj veya sistem uyarısı bulunmamaktadır.</p>
  </div></td></tr>`;

  const content = `
    <div class="page-hero">
      <div class="page-hero-bg"></div>
      <div class="page-hero-inner">
        <h1 class="page-title-lg">Bildirimler</h1>
        <p class="page-subtitle">Hesabınızla ilgili tüm önemli duyurular, onaylar ve kampanya mesajları.</p>
      </div>
    </div>
    
    <div class="section-inset" style="margin-top:-32px;position:relative;z-index:10;max-width:800px;margin-left:auto;margin-right:auto;">
      <div class="card p-card">
        <div class="tbl-wrap" style="border:none;box-shadow:none;">
          <table class="premium-table">
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>
    </div>
  `;
  return layout('Bildirimler', '', content, { wide: true });
}
async function markRead(id) {
  try { await apiMarkNotificationRead(id); } catch(e) { console.error(e); }
  showPage('myNotifications');
}

// --- PROFİL ---
function renderMyProfile() {
  const c = currentUser;
  const content = `<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
    <div class="card">
      <div class="card-title" style="margin-bottom:16px">Kişisel Bilgiler</div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Ad</label><input class="form-control" id="pfFirst" value="${c.firstName}"/></div>
        <div class="form-group"><label class="form-label">Soyad</label><input class="form-control" id="pfLast" value="${c.lastName}"/></div>
      </div>
      <div class="form-group"><label class="form-label">TC Kimlik No</label><input class="form-control" value="${c.nationalId}" readonly style="opacity:.5"/></div>
      <div class="form-group"><label class="form-label">Ehliyet No</label><input class="form-control" id="pfLic" value="${c.licenseNo}"/></div>
      <div class="form-group"><label class="form-label">E-posta</label><input class="form-control" id="pfEmail" value="${c.email}"/></div>
      <div class="form-group"><label class="form-label">Telefon</label><input class="form-control" id="pfPhone" value="${c.phone}"/></div>
      <div id="pfAlert"></div>
      <button class="btn btn-primary" onclick="saveProfile()">Değişiklikleri Kaydet</button>
    </div>
    <div class="card">
      <div class="card-title" style="margin-bottom:16px">Şifre Değiştir</div>
      <div class="form-group"><label class="form-label">Mevcut Şifre</label><input class="form-control" type="password" id="pwOld"/></div>
      <div class="form-group"><label class="form-label">Yeni Şifre</label><input class="form-control" type="password" id="pwNew"/></div>
      <div class="form-group"><label class="form-label">Yeni Şifre (Tekrar)</label><input class="form-control" type="password" id="pwNew2"/></div>
      <div id="pwAlert"></div>
      <button class="btn btn-warning" onclick="changePassword()">Şifreyi Güncelle</button>
    </div>
  </div>`;
  return layout('Profilim','',content);
}

async function saveProfile() {
  const firstName = document.getElementById('pfFirst').value.trim();
  const lastName  = document.getElementById('pfLast').value.trim();
  const licenseNo = document.getElementById('pfLic').value.trim();
  const email     = document.getElementById('pfEmail').value.trim();
  const phone     = document.getElementById('pfPhone').value.trim();
  try {
    await apiUpdateCustomer(currentUser.id, { firstName, lastName, licenseNo, email, phone });
    Object.assign(currentUser, { firstName, lastName, licenseNo, email, phone });
    showAlert('pfAlert', 'Profil güncellendi.', 'success');
  } catch (e) { showAlert('pfAlert', e.error || 'Güncelleme başarısız.', 'danger'); }
}

async function changePassword() {
  const old = document.getElementById('pwOld').value;
  const nw  = document.getElementById('pwNew').value;
  const nw2 = document.getElementById('pwNew2').value;
  if (nw.length < 6) { showAlert('pwAlert', 'En az 6 karakter.', 'danger'); return; }
  if (nw !== nw2)    { showAlert('pwAlert', 'Şifreler uyuşmuyor.', 'danger'); return; }
  try {
    await apiUpdateCustomerPassword(currentUser.id, old, nw);
    showAlert('pwAlert', 'Şifre güncellendi.', 'success');
  } catch (e) { showAlert('pwAlert', e.error || 'Şifre güncellenemedi.', 'danger'); }
}
