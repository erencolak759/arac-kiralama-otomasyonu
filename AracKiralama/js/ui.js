// ========== ORTAK ARAYÜZ — KAYDIRMALI BÖLÜMLER & KİRALAMA WİDGET ==========

function carouselSection(id, title, subtitle, itemsHtml, linkHtml = '') {
  return `<section class="section-block">
    <div class="section-head">
      <div>
        <h2 class="section-title">${title}</h2>
        ${subtitle ? `<p class="section-sub">${subtitle}</p>` : ''}
      </div>
      <div class="section-head-right">
        ${linkHtml}
        <div class="carousel-controls">
          <button type="button" class="carousel-btn" onclick="scrollCarousel('${id}',-1)" aria-label="Önceki">‹</button>
          <button type="button" class="carousel-btn" onclick="scrollCarousel('${id}',1)" aria-label="Sonraki">›</button>
        </div>
      </div>
    </div>
    <div class="carousel-viewport" id="${id}">
      <div class="carousel-track">${itemsHtml}</div>
    </div>
  </section>`;
}

function scrollCarousel(id, direction) {
  const vp = document.getElementById(id);
  if (!vp) return;
  const card = vp.querySelector('.carousel-slide');
  const gap = 16;
  const step = card ? card.offsetWidth + gap : vp.clientWidth * 0.82;
  vp.scrollBy({ left: step * direction, behavior: 'smooth' });
}

function fleetCarouselCard(v, onClick = '') {
  enrichVehicleCatalog(v);
  const click = onClick || `showPage('vehicleSearch')`;
  const branch = getBranchById(v.branchId);
  return `<article class="carousel-slide fleet-slide" onclick="${click}">
    <div class="fleet-slide-photo">${vehicleThumb(v)}</div>
    <div class="fleet-slide-body">
      <div class="fleet-slide-top">
        <h3>${v.brand} ${v.model}</h3>
        ${statusBadge(v.category)}
      </div>
      <p class="fleet-slide-trim">${v.trim || ''}</p>
      <div class="fleet-slide-meta">
        <span>${v.transmission || v.fuelType}</span>
        <span>${branch?.city || '—'}</span>
        <span>${v.year}</span>
      </div>
      <div class="fleet-slide-price">
        <div><span class="fleet-price">${formatMoney(v.dailyRate)}</span><span class="fleet-price-unit">/ gün</span></div>
        <button type="button" class="btn btn-primary btn-sm" onclick="event.stopPropagation();${onClick || "showPage('vehicleSearch')"}">Kirala</button>
      </div>
    </div>
  </article>`;
}

function bookingWidgetHtml(opts = {}) {
  const today = new Date().toISOString().split('T')[0];
  const d3 = new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0];
  const brOpts = DB.branches.map(b =>
    `<option value="${b.id}"${opts.pickupId == b.id ? ' selected' : ''}>${b.name}</option>`
  ).join('');
  const compact = opts.compact ? ' booking-widget-compact' : '';
  const btnAction = opts.onResults ? 'doSearch()' : 'goToSearchFromWidget()';
  const ids = opts.useSearchIds ? { start: 'sStart', end: 'sEnd', pick: 'sBranch', ret: 'sBranch', cat: 'sCat' } : {};

  return `<div class="booking-widget${compact}">
    <form class="booking-form" onsubmit="event.preventDefault();${btnAction}">
      <div class="booking-field">
        <label>Alış ofisi</label>
        <select class="form-control" id="${ids.pick || 'bwPick'}">${brOpts}</select>
      </div>
      <div class="booking-field">
        <label>İade ofisi</label>
        <select class="form-control" id="${ids.ret || 'bwRet'}">${brOpts}</select>
      </div>
      <div class="booking-field">
        <label>Alış tarihi</label>
        <input class="form-control" type="date" id="${ids.start || 'bwStart'}" value="${opts.start || today}" min="${today}"/>
      </div>
      <div class="booking-field">
        <label>İade tarihi</label>
        <input class="form-control" type="date" id="${ids.end || 'bwEnd'}" value="${opts.end || d3}"/>
      </div>
      ${opts.showCategory ? `<div class="booking-field">
        <label>Kategori</label>
        <select class="form-control" id="${ids.cat}">
          <option value="all">Tümü</option>
          <option value="Economy">Ekonomi</option>
          <option value="Comfort">Konfor</option>
          <option value="SUV">SUV</option>
          <option value="Premium">Premium</option>
        </select>
      </div>` : ''}
      <button type="submit" class="btn btn-search">${opts.btnLabel || 'Araç Ara'}</button>
    </form>
  </div>`;
}

function promoStripHtml() {
  const items = [
    { t: 'Ücretsiz iptal', d: '24 saat öncesine kadar' },
    { t: 'En iyi fiyat', d: 'Şeffaf günlük tarife' },
    { t: '2024–2026 model', d: 'Düzenli bakımlı filo' },
    { t: '7/24 destek', d: '0850 222 44 55' }
  ];
  return `<div class="promo-strip">
    <div class="promo-strip-track">${items.map(i =>
      `<div class="promo-chip"><strong>${i.t}</strong><span>${i.d}</span></div>`
    ).join('')}${items.map(i =>
      `<div class="promo-chip" aria-hidden="true"><strong>${i.t}</strong><span>${i.d}</span></div>`
    ).join('')}</div>
  </div>`;
}

function whyUsCarouselHtml() {
  const cards = [
    { title: 'Hızlı rezervasyon', text: 'Dakikalar içinde araç seçin, anında onay alın.' },
    { title: 'Bakımlı araçlar', text: 'Periyodik servis ve kontrolden geçmiş filo.' },
    { title: 'Araç güvenliği', text: 'Tam sigorta ve yol yardım seçenekleri.' },
    { title: '7/24 iletişim', text: 'Yolculuk boyunca destek hattı.' },
    { title: 'Çok şubeli ağ', text: 'İstanbul, Ankara, İzmir ve Bursa.' }
  ];
  const html = cards.map(c =>
    `<div class="carousel-slide why-slide">
      <h3>${c.title}</h3>
      <p>${c.text}</p>
    </div>`
  ).join('');
  return carouselSection('whyCarousel', 'Neden DriveFleet?', 'Araç kiralamada güvenilir iş ortağınız', html);
}

function campaignsCarouselHtml() {
  const campaigns = (typeof DB !== 'undefined' && DB.campaigns && DB.campaigns.length)
    ? DB.campaigns.filter(c => c.isActive !== false)
    : [
        { tag: 'Kampanya', title: 'SUV fırsatları',   description: 'Tucson ve RAV4 — günlük özel fiyat', color: 'c1' },
        { tag: 'Yeni',     title: 'Premium segment',  description: 'BMW ve Mercedes — kurumsal indirim', color: 'c2' },
        { tag: 'Popüler',  title: 'Haftalık kiralama', description: '7 gün ve üzeri ek avantaj',         color: 'c3' },
        { tag: 'Ekonomi',  title: 'Şehir içi paket',  description: 'Clio ve Egea ile uygun fiyat',      color: 'c4' }
      ];
  const html = campaigns.map(c =>
    `<div class="carousel-slide campaign-slide campaign-${c.color || 'c1'}">
      <span class="campaign-tag">${c.tag || 'Kampanya'}</span>
      <h3>${c.title}</h3>
      <p>${c.description || ''}</p>
      ${c.discountPercent ? `<div style="font-size:18px;font-weight:900;color:#fff;margin:6px 0">%${c.discountPercent} İndirim</div>` : ''}
      <button type="button" class="btn btn-ghost btn-sm" onclick="showPage('vehicleSearch')">İncele</button>
    </div>`
  ).join('');
  return carouselSection('campCarousel', 'Kampanyalar', 'Güncel fırsat ve indirimler', html);
}

function featuredFleetCarouselHtml(vehicles, title, sub) {
  const html = vehicles.map(v => fleetCarouselCard(v)).join('') ||
    '<div class="carousel-empty">Şu an listelenecek araç yok.</div>';
  return carouselSection('fleetCarousel', title, sub, html,
    `<button type="button" class="btn btn-ghost btn-sm" onclick="showPage('vehicleSearch')">Tüm filo →</button>`);
}

function initCarousels() {
  document.querySelectorAll('.carousel-viewport').forEach(vp => {
    if (vp.dataset.bound) return;
    vp.dataset.bound = '1';
    let isDown = false, startX = 0, scrollLeft = 0;
    vp.addEventListener('mousedown', e => {
      isDown = true;
      startX = e.pageX - vp.offsetLeft;
      scrollLeft = vp.scrollLeft;
      vp.classList.add('is-dragging');
    });
    vp.addEventListener('mouseleave', () => { isDown = false; vp.classList.remove('is-dragging'); });
    vp.addEventListener('mouseup', () => { isDown = false; vp.classList.remove('is-dragging'); });
    vp.addEventListener('mousemove', e => {
      if (!isDown) return;
      e.preventDefault();
      vp.scrollLeft = scrollLeft - (e.pageX - vp.offsetLeft - startX) * 1.2;
    });
  });

  const promo = document.querySelector('.promo-strip-track');
  if (promo && !promo.dataset.marquee) {
    promo.dataset.marquee = '1';
    let pos = 0;
    const half = () => promo.scrollWidth / 2;
    const tick = () => {
      pos += 0.35;
      if (pos >= half()) pos = 0;
      promo.style.transform = `translateX(-${pos}px)`;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
}

function initPageUI(pageName) {
  initCarousels();
  if (pageName === 'vehicleSearch' && document.getElementById('sStart')) {
    const bwPick = document.getElementById('bwPick');
    if (bwPick) {
      document.getElementById('sBranch').value = bwPick.value;
    }
    // Auto trigger search
    if (typeof doSearch === 'function') doSearch();
  }
  if (typeof lazyLoadVehicleImages === 'function') {
    setTimeout(lazyLoadVehicleImages, 400);
  }
}

function customerPageWrap(innerHtml) {
  return `<div class="customer-site">${innerHtml}</div>`;
}

function goToSearchFromWidget() {
  const pick = document.getElementById('bwPick')?.value;
  const ret = document.getElementById('bwRet')?.value;
  const start = document.getElementById('bwStart')?.value;
  const end = document.getElementById('bwEnd')?.value;
  showPage('vehicleSearch');
  requestAnimationFrame(() => {
    const s = document.getElementById('sStart');
    const e = document.getElementById('sEnd');
    const b = document.getElementById('sBranch');
    if (s && start) s.value = start;
    if (e && end) e.value = end;
    if (b && pick) b.value = pick;
  });
}
