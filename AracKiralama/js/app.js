// ============================================================
// AUTH & ROUTER & LAYOUT
// ============================================================

let currentUser = null;
let currentRole = null;
const pages = {};
let activePage = null;

// --- AUTH ---
function login(email, password, role) {
  const mail = email.trim().toLowerCase();
  if (role === 'Customer') {
    const c = DB.customers.find(x => x.email.toLowerCase() === mail && x.passwordHash === password);
    if (!c) return false;
    currentUser = c; currentRole = 'Customer';
  } else {
    const e = DB.employees.find(x => x.email.toLowerCase() === mail && x.passwordHash === password);
    if (!e) return false;
    if (role === 'Admin' && e.role !== 'Admin') return false;
    if (role === 'Employee' && e.role === 'Admin') return false;
    currentUser = e; currentRole = e.role;
  }
  sessionStorage.setItem('aks_user', JSON.stringify({ id: currentUser.id, role: currentRole }));
  return true;
}

function defaultPageForRole() {
  if (currentRole === 'Customer') return 'customerDashboard';
  if (currentRole === 'Employee') return 'empDashboard';
  if (currentRole === 'Admin') return 'adminDashboard';
  return 'customerDashboard';
}

function logout() {
  currentUser = null; currentRole = null;
  sessionStorage.removeItem('aks_user');
  document.getElementById('app').innerHTML = renderLoginPage();
}

function restoreSession() {
  const s = sessionStorage.getItem('aks_user');
  if (!s) return false;
  const { id, role } = JSON.parse(s);
  currentRole = role;
  currentUser = role === 'Customer'
    ? DB.customers.find(c => c.id === id)
    : DB.employees.find(e => e.id === id);
  return !!currentUser;
}

// --- ROUTER ---
function registerPage(name, fn) { pages[name] = fn; }

function showPage(name, params = {}) {
  if (!pages[name]) return;
  activePage = name;
  const app = document.getElementById('app');
  const html = pages[name](params);
  app.innerHTML = html;
  app.querySelector('.content')?.classList.add('fade-in');
  requestAnimationFrame(() => {
    initPageUI(name);
    updateThemeButton();
  });
}

// --- UI HELPERS ---
function onVehicleImgError(img) {
  const fallbacks = JSON.parse(img.getAttribute('data-fallbacks') || '[]');
  const tryIdx = parseInt(img.getAttribute('data-try') || '0', 10) + 1;
  if (tryIdx < fallbacks.length) {
    img.setAttribute('data-try', String(tryIdx));
    img.src = fallbacks[tryIdx];
    return;
  }
  const wrap = img.closest('.vehicle-photo');
  if (!wrap) return;
  wrap.classList.add('is-placeholder');
  img.style.display = 'none';
  if (!wrap.querySelector('.vehicle-photo-ph')) {
    const brand = (img.getAttribute('alt') || 'Araç').split(' ')[0];
    wrap.insertAdjacentHTML('beforeend',
      `<div class="vehicle-photo-ph"><span class="vehicle-photo-ph-brand">${brand}</span><span class="vehicle-photo-ph-hint">Görsel yüklenemedi</span></div>`);
  }
}

function vehicleThumb(v, size = 'md') {
  enrichVehicleCatalog(v);
  const candidates = getVehicleImageCandidates(v);
  const alt = `${v.brand} ${v.model} ${v.trim || ''}`.trim();
  const badge = size !== 'sm' ? `<span class="vehicle-photo-cat">${v.category}</span>` : '';
  const fallbacks = JSON.stringify(candidates.slice(1)).replace(/"/g, '&quot;');
  return `<div class="vehicle-photo vehicle-photo-${size}">
    <img src="${candidates[0]}" alt="${alt}" loading="lazy" decoding="async"
      referrerpolicy="no-referrer"
      data-brand="${v.brand}" data-model="${v.model}"
      data-fallbacks="${fallbacks}" data-try="0"
      onerror="onVehicleImgError(this)"/>
    ${badge}
  </div>`;
}

function trustBarHtml() {
  return `<div class="trust-bar">
    <div class="trust-item"><strong>Ücretsiz iptal</strong><span>24 saat öncesine kadar</span></div>
    <div class="trust-item"><strong>7/24 destek</strong><span>0850 222 44 55</span></div>
    <div class="trust-item"><strong>4 şube</strong><span>Türkiye geneli teslim</span></div>
    <div class="trust-item"><strong>Tam sigorta</strong><span>Opsiyonel paketler</span></div>
  </div>`;
}

function appFooterHtml() {
  return `<footer class="app-footer">
    <div class="app-footer-inner">
      <div><strong>DriveFleet</strong> — Kurumsal araç kiralama</div>
      <div class="app-footer-links">
        <span>İstanbul</span><span>Ankara</span><span>İzmir</span><span>Bursa</span>
      </div>
      <div class="app-footer-copy">© ${new Date().getFullYear()} DriveFleet. Tüm hakları saklıdır.</div>
    </div>
  </footer>`;
}

function vehicleSpecsHtml(v, compact = false) {
  enrichVehicleCatalog(v);
  const items = [
    ['Motor', v.engine],
    ['Güç', v.powerHp ? `${v.powerHp} HP` : null],
    ['Tork', v.torqueNm ? `${v.torqueNm} Nm` : null],
    ['Şanzıman', v.transmission],
    ['Çekiş', v.driveType],
    ['Yakıt', v.fuelType],
    ['Tüketim', v.fuelConsumption],
    ['Kasa', v.bodyType],
    ['Kapı', v.doors ? `${v.doors} kapı` : null],
    ['Koltuk', v.seats ? `${v.seats} kişi` : null],
    ['Bagaj', v.luggageLiters ? `${v.luggageLiters} L` : null],
    ['Renk', v.color],
    ['KM', v.km != null ? `${Number(v.km).toLocaleString('tr-TR')} km` : null],
  ].filter(([, val]) => val);
  const cls = compact ? 'vehicle-specs vehicle-specs-compact' : 'vehicle-specs';
  return `<div class="${cls}">${items.map(([k, val]) =>
    `<div class="vehicle-spec-item"><span class="vehicle-spec-key">${k}</span><span class="vehicle-spec-val">${val}</span></div>`
  ).join('')}</div>`;
}

function vehicleFeaturesHtml(v, max = 0) {
  enrichVehicleCatalog(v);
  if (!v.features || !v.features.length) return '';
  const list = max > 0 ? v.features.slice(0, max) : v.features;
  const more = max > 0 && v.features.length > max
    ? `<span class="feature-tag feature-more">+${v.features.length - max}</span>` : '';
  return `<div class="vehicle-features">${list.map(f =>
    `<span class="feature-tag">${f}</span>`
  ).join('')}${more}</div>`;
}

function vehicleTitleHtml(v) {
  enrichVehicleCatalog(v);
  return `<div class="vehicle-title">
    <div class="v-name">${v.brand} ${v.model}</div>
    ${v.trim ? `<div class="v-trim">${v.trim}</div>` : ''}
  </div>`;
}

function navIcon(name) {
  const icons = {
    dashboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
    car: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 11l1-4h12l1 4"/><path d="M4 11h16v5a1 1 0 01-1 1h-1a1 1 0 01-1-1v-1H7v1a1 1 0 01-1 1H5a1 1 0 01-1-1v-5z"/><circle cx="7.5" cy="15.5" r="1.5"/><circle cx="16.5" cy="15.5" r="1.5"/></svg>',
    list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>',
    bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8a6 6 0 10-12 0c0 7-3 8-3 8h18s-3-1-3-8"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></svg>',
    branch: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18M6 21V7l6-4 6 4v14"/><path d="M10 11h4"/></svg>',
    pay: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>',
    chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="M7 14l4-4 4 3 5-6"/></svg>',
    db: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3"/></svg>',
    warn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 9v4M12 17h.01"/><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  };
  return icons[name] || icons.dashboard;
}

// --- SIDEBAR ---
function navItems() {
  if (currentRole === 'Customer') return [
    { p: 'customerDashboard', i: 'dashboard', l: 'Özet' },
    { p: 'vehicleSearch',     i: 'car', l: 'Araç Kirala' },
    { p: 'myReservations',    i: 'list', l: 'Rezervasyonlarım' },
    { p: 'myNotifications',   i: 'bell', l: 'Bildirimler' },
    { p: 'myProfile',         i: 'user', l: 'Hesabım' },
  ];
  if (currentRole === 'Employee') return [
    { p: 'empDashboard',    i: 'dashboard', l: 'Özet' },
    { p: 'empReservations', i: 'list', l: 'Rezervasyonlar' },
    { p: 'empVehicles',     i: 'car', l: 'Araçlar' },
    { p: 'empCustomers',    i: 'user', l: 'Müşteriler' },
    { p: 'empDamage',       i: 'warn', l: 'Hasar Raporları' },
  ];
  return [
    { p: 'adminDashboard',    i: 'dashboard', l: 'Özet',           s: null },
    { p: 'adminVehicles',     i: 'car', l: 'Araç Yönetimi',    s: 'YÖNETİM' },
    { p: 'adminBranches',     i: 'branch', l: 'Şubeler',          s: null },
    { p: 'adminEmployees',    i: 'user', l: 'Personel',          s: null },
    { p: 'adminCustomers',    i: 'user', l: 'Müşteriler',        s: null },
    { p: 'adminReservations', i: 'list', l: 'Rezervasyonlar',   s: 'VERİ' },
    { p: 'adminPayments',     i: 'pay', l: 'Ödemeler',          s: null },
    { p: 'adminReports',      i: 'chart',  l: 'Raporlar',          s: null },
    { p: 'adminCampaigns',    i: 'star',   l: 'Kampanyalar',       s: null },
    { p: 'adminDatabase',     i: 'db',     l: 'Veritabanı',        s: 'SİSTEM' },
  ];
}

function sidebar() {
  const items = navItems();
  const nm = `${currentUser.firstName} ${currentUser.lastName}`;
  const av = (currentUser.firstName[0] + currentUser.lastName[0]).toUpperCase();
  const roleLabel = { Customer: 'Müşteri', Employee: 'Personel', Admin: 'Yönetici' }[currentRole];
  const unread = currentRole === 'Customer'
    ? DB.notifications.filter(n => n.customerId === currentUser.id && n.status === 'Sent').length : 0;

  let nav = ''; let lastSec = '';
  items.forEach(it => {
    if (it.s && it.s !== lastSec) {
      nav += `<div class="nav-section">${it.s}</div>`;
      lastSec = it.s;
    }
    nav += `<div class="nav-item ${activePage === it.p ? 'active' : ''}" onclick="showPage('${it.p}')">
      <span class="ni">${navIcon(it.i)}</span>${it.l}
      ${it.p === 'myNotifications' && unread > 0 ? `<span class="badge b-red nav-badge">${unread}</span>` : ''}
    </div>`;
  });

  return `<aside class="sidebar" id="sidebar">
    <div class="sidebar-logo">
      <div class="logo-mark"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 11l1-4h12l1 4"/><path d="M4 11h16v5a1 1 0 01-1 1h-1a1 1 0 01-1-1v-1H7v1a1 1 0 01-1 1H5a1 1 0 01-1-1v-5z"/></svg></div>
      <div class="logo-text">DriveFleet<small>Kurumsal Araç Kiralama</small></div>
    </div>
    <nav class="sidebar-nav">${nav}</nav>
    <div class="sidebar-footer">
      
      <!-- TEMA DEĞİŞTİRİCİ BUTON -->
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; padding-top:12px; border-top:1px solid rgba(255,255,255,0.06);">
        <span style="font-size:10px; text-transform:uppercase; letter-spacing:1px; color:rgba(255,255,255,0.4); font-weight:700;">Görünüm</span>
        <button id="themeToggle" onclick="toggleTheme()" style="background:none; border:none; color:rgba(255,255,255,0.8); cursor:pointer; font-size:13px; display:flex; align-items:center; gap:6px; padding:0; outline:none; transition: color 0.15s; font-family:inherit;">
          🌓 <span style="font-size:12px; font-weight:600;">Tema</span>
        </button>
      </div>

      <div class="user-card" onclick="currentRole==='Customer'?showPage('myProfile'):null">
        <div class="user-av">${av}</div>
        <div><div class="user-name">${nm}</div><div class="user-role">${roleLabel}</div></div>
      </div>
      <button class="btn-logout" onclick="logout()">Çıkış Yap</button>
    </div>
  </aside>`;
}

function topbar(title, sub = '') {
  const unread = currentRole === 'Customer'
    ? DB.notifications.filter(n => n.customerId === currentUser.id && n.status === 'Sent').length : 0;
  const notifBtn = currentRole === 'Customer'
    ? `<button class="notif-btn" onclick="showPage('myNotifications')" title="Bildirimler">${navIcon('bell')}
        ${unread > 0 ? `<span class="notif-dot">${unread}</span>` : ''}</button>` : '';
  return `<div class="topbar">
    <div><div class="page-title">${title}</div>${sub ? `<div class="page-sub">${sub}</div>` : ''}</div>
    <div class="topbar-right">${notifBtn}</div>
  </div>`;
}

function layout(title, sub, contentHtml, opts = {}) {
  const isCustomer = currentRole === 'Customer';
  const trust = isCustomer && !opts.plain ? '' : (isCustomer ? trustBarHtml() : '');
  const contentClass = opts.wide ? 'content content-wide' : 'content';
  const mainClass = opts.wide ? 'main main-customer' : 'main';
  const hamburger = `
    <button class="hamburger-btn" onclick="toggleSidebar()" aria-label="Men\u00fc">
      <span></span><span></span><span></span>
    </button>
    <div class="sidebar-overlay" id="sidebarOverlay" onclick="closeSidebar()"></div>`;
  return `${hamburger}${sidebar()}<div class="${mainClass}">${topbar(title, sub)}${trust}<div class="${contentClass}">${contentHtml}</div>${appFooterHtml()}</div>`;
}

function appLayout(title, contentHtml, subtitle = '') {
  return layout(title, subtitle, contentHtml);
}

function toggleSidebar() {
  const sb  = document.getElementById('sidebar');
  const ov  = document.getElementById('sidebarOverlay');
  if (!sb) return;
  const open = sb.classList.toggle('open');
  if (ov) ov.classList.toggle('visible', open);
}
function closeSidebar() {
  const sb = document.getElementById('sidebar');
  const ov = document.getElementById('sidebarOverlay');
  if (sb) sb.classList.remove('open');
  if (ov) ov.classList.remove('visible');
}

// --- HELPERS ---
function openModal(id)  { document.getElementById(id)?.classList.add('active'); }
function closeModal(id) { document.getElementById(id)?.classList.remove('active'); }

function showAlert(cid, msg, type = 'success') {
  const el = document.getElementById(cid);
  if (el) el.innerHTML = `<div class="alert alert-${type}">${msg}</div>`;
}

function statusBadge(s) {
  const m = {
    Available:   ['b-green',  'Müsait'],
    Rented:      ['b-blue',   'Kirada'],
    Maintenance: ['b-yellow', 'Bakımda'],
    Active:      ['b-blue',   'Aktif'],
    Completed:   ['b-green',  'Tamamlandı'],
    Cancelled:   ['b-red',    'İptal'],
    Paid:        ['b-green',  'Ödendi'],
    Pending:     ['b-yellow', 'Bekliyor'],
    Economy:     ['b-gray',   'Ekonomi'],
    Comfort:     ['b-blue',   'Konfor'],
    SUV:         ['b-purple', 'SUV'],
    Premium:     ['b-yellow', 'Premium'],
    Employee:    ['b-blue',   'Personel'],
    Admin:       ['b-purple', 'Yönetici'],
  };
  const [c, t] = m[s] || ['b-gray', s];
  return `<span class="badge ${c}">${t}</span>`;
}

// --- INIT ---
async function initApp() {
  applySavedTheme();
  const app = document.getElementById('app');

  // Sunucudan veri yükle
  try {
    await loadDataFromServer();
  } catch (e) {
    app.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;height:100vh;flex-direction:column;gap:20px;font-family:'Plus Jakarta Sans',sans-serif;background:#0f172a;color:#fff;">
        <div style="font-size:56px">⚠️</div>
        <div style="font-size:24px;font-weight:800">Sunucuya Bağlanılamadı</div>
        <div style="color:#94a3b8;text-align:center;max-width:480px;line-height:1.6;font-size:15px">
          Lütfen backend sunucusunu başlatın:<br>
          <code style="background:#1e293b;padding:8px 16px;border-radius:8px;font-size:13px;display:inline-block;margin-top:10px;border:1px solid #334155">cd server &amp;&amp; node index.js</code>
        </div>
        <button onclick="location.reload()" style="padding:12px 28px;background:#c8102e;color:#fff;border:none;border-radius:10px;cursor:pointer;font-size:16px;font-weight:700;margin-top:8px">Tekrar Dene</button>
      </div>`;
    return;
  }

  if (restoreSession()) {
    showPage(defaultPageForRole());
  } else {
    app.innerHTML = renderLoginPage();
    requestAnimationFrame(() => {
      initCarousels();
      updateThemeButton();
    });
  }
}

// ========== KOYU/AÇIK TEMA SİSTEMİ ==========
function toggleTheme() {
  const isDark = document.body.classList.toggle('dark-theme');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  updateThemeButton();
}

function updateThemeButton() {
  const btn = document.getElementById('themeToggle');
  if (!btn) return;
  const isDark = document.body.classList.contains('dark-theme');
  btn.innerHTML = isDark 
    ? `☀️ <span style="font-size:12px; font-weight:600; color:rgba(255,255,255,0.78);">Açık Tema</span>` 
    : `🌙 <span style="font-size:12px; font-weight:600; color:rgba(255,255,255,0.78);">Koyu Tema</span>`;
}

function applySavedTheme() {
  const saved = localStorage.getItem('theme');
  if (saved === 'dark') {
    document.body.classList.add('dark-theme');
  } else {
    document.body.classList.remove('dark-theme');
  }
}
