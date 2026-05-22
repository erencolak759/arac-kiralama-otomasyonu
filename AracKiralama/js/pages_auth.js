// ============================================================
// AUTH PAGES — API tabanlı giriş, kayıt, şifremi unuttum
// ============================================================
function renderLoginPage() {
  return `<div class="lp-root">
    <div class="lp-hero">
      <div class="lp-hero-content">
        <div class="lp-brand">
          <div class="lp-brand-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 11l1-4h12l1 4"/>
              <path d="M4 11h16v5a1 1 0 01-1 1h-1a1 1 0 01-1-1v-1H7v1a1 1 0 01-1 1H5a1 1 0 01-1-1v-5z"/>
              <circle cx="7.5" cy="15.5" r="1.5"/><circle cx="16.5" cy="15.5" r="1.5"/>
            </svg>
          </div>
          <span class="lp-brand-name">DriveFleet</span>
        </div>
        <a href="#" class="lp-contact">Contact Support / İletişim</a>
        <div class="lp-hero-body">
          <div class="lp-hero-tag">Türkiye geneli araç kiralama</div>
          <h1 class="lp-hero-h1">Yolculuğunuz<br>için doğru<br>araç burada</h1>
          <p class="lp-hero-p">4 şehirde 500+ araçla günlük ve kurumsal kiralama.<br>Anında onay, şeffaf fiyatlandırma.</p>
          <div class="lp-feat-list">
            <div class="lp-feat"><span class="lp-feat-check">✓</span> Ücretsiz iptal — 24 saat öncesine kadar</div>
            <div class="lp-feat"><span class="lp-feat-check">✓</span> Tüm araçlar tam sigortalı</div>
            <div class="lp-feat"><span class="lp-feat-check">✓</span> 7/24 yol yardım hizmeti</div>
          </div>
        </div>
        <div class="lp-stats-row">
          <div class="lp-stat-item"><strong>500+</strong><span>Araç</span></div>
          <div class="lp-stat-sep"></div>
          <div class="lp-stat-item"><strong>4</strong><span>Şehir</span></div>
          <div class="lp-stat-sep"></div>
          <div class="lp-stat-item"><strong>50K+</strong><span>Müşteri</span></div>
          <div class="lp-stat-sep"></div>
          <div class="lp-stat-item"><strong>7/24</strong><span>Destek</span></div>
        </div>
      </div>
    </div>

    <div class="lp-panel">
      <div class="lp-form-wrap">
        <div class="lp-form-logo">
          <div class="lp-brand-icon sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 11l1-4h12l1 4"/>
              <path d="M4 11h16v5a1 1 0 01-1 1h-1a1 1 0 01-1-1v-1H7v1a1 1 0 01-1 1H5a1 1 0 01-1-1v-5z"/>
              <circle cx="7.5" cy="15.5" r="1.5"/><circle cx="16.5" cy="15.5" r="1.5"/>
            </svg>
          </div>
          <span>DriveFleet</span>
        </div>
        <h2 class="lp-form-title">Hesabınıza giriş yapın</h2>
        <p class="lp-form-sub">Rezervasyon ve yönetim panelinize erişin</p>

        <div class="lp-tabs">
          <button class="lp-tab active" id="tabCustomer" onclick="switchTab('Customer')">Müşteri</button>
          <button class="lp-tab" id="tabEmployee" onclick="switchTab('Employee')">Personel</button>
          <button class="lp-tab" id="tabAdmin" onclick="switchTab('Admin')">Yönetici</button>
        </div>

        <div class="lp-err" id="loginErr"></div>

        <div class="lp-field">
          <label class="lp-label">E-posta adresi</label>
          <div class="lp-input-wrap">
            <svg class="lp-input-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            <input class="lp-input" type="email" id="loginEmail" placeholder="E-POSTA ADRESİ" autocomplete="username"/>
          </div>
        </div>

        <div class="lp-field">
          <label class="lp-label">Şifre</label>
          <div class="lp-input-wrap">
            <svg class="lp-input-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
            <input class="lp-input" type="password" id="loginPw" placeholder="ŞİFRE" autocomplete="current-password"
              onkeydown="if(event.key==='Enter')doLogin()"/>
          </div>
        </div>

        <button class="lp-btn" id="loginBtn" onclick="doLogin()">
          Giriş Yap
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>

        <div class="lp-register" id="loginRegisterHint">
          Hesabınız yok mu? <a href="#" onclick="openModal('registerModal');return false">Ücretsiz kayıt olun →</a>
          <br><a href="#" onclick="openModal('forgotModal');return false" style="font-size:12px;color:var(--text3);margin-top:6px;display:inline-block">Şifremi unuttum</a>
        </div>

        <details class="lp-demo">
          <summary>Demo hesapları göster</summary>
          <div class="lp-demo-grid">
            <div><b>Müşteri:</b> ahmet@mail.com / 123456</div>
            <div><b>Personel:</b> mehmet@arackiralama.com / emp123</div>
            <div><b>Yönetici:</b> admin@arackiralama.com / admin123</div>
          </div>
        </details>
      </div>
    </div>
    ${registerModal()}
    ${forgotModal()}
  </div>`;
}

let loginRole = 'Customer';
function switchTab(role) {
  loginRole = role;
  document.querySelectorAll('.lp-tab').forEach(t => t.classList.remove('active'));
  const tabId = role === 'Customer' ? 'tabCustomer' : role === 'Admin' ? 'tabAdmin' : 'tabEmployee';
  document.getElementById(tabId)?.classList.add('active');
  const hint = document.getElementById('loginRegisterHint');
  if (hint) hint.style.display = role === 'Customer' ? 'block' : 'none';
}

async function doLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const pw    = document.getElementById('loginPw').value;
  const err   = document.getElementById('loginErr');
  const btn   = document.getElementById('loginBtn');

  if (!email || !pw) { err.style.display='flex'; err.textContent='E-posta ve şifre gerekli.'; return; }
  err.style.display = 'none';
  if (btn) { btn.disabled = true; btn.textContent = 'Giriş yapılıyor...'; }

  try {
    const result = await apiLogin(email, pw, loginRole);
    currentUser = result.user;
    currentRole = result.role;
    sessionStorage.setItem('aks_user', JSON.stringify({ id: currentUser.id, role: currentRole }));
    showPage(defaultPageForRole());
  } catch (e) {
    err.style.display = 'flex';
    err.textContent = e.error || 'Giriş başarısız.';
    if (btn) { btn.disabled = false; btn.innerHTML = 'Giriş Yap <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>'; }
  }
}

// ---- KAYIT MODAL ----
function registerModal() {
  return `<div class="modal-overlay" id="registerModal">
    <div class="modal">
      <div class="modal-header">
        <div class="modal-title">Yeni Hesap Oluştur</div>
        <button class="modal-close" onclick="closeModal('registerModal')">✕</button>
      </div>
      <div class="modal-body">
        <div id="regAlert"></div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Ad</label><input class="form-control" id="rFirst" placeholder="Adınız"/></div>
          <div class="form-group"><label class="form-label">Soyad</label><input class="form-control" id="rLast" placeholder="Soyadınız"/></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">TC Kimlik No</label><input class="form-control" id="rNat" placeholder="11 haneli" maxlength="11"/></div>
          <div class="form-group"><label class="form-label">Ehliyet No</label><input class="form-control" id="rLic" placeholder="Ehliyet no"/></div>
        </div>
        <div class="form-group"><label class="form-label">E-posta</label><input class="form-control" type="email" id="rEmail"/></div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Telefon</label><input class="form-control" id="rPhone" placeholder="05XXXXXXXXX"/></div>
          <div class="form-group"><label class="form-label">Şifre</label><input class="form-control" type="password" id="rPw" placeholder="Min. 6 karakter"/></div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="closeModal('registerModal')">İptal</button>
        <button class="btn btn-primary" id="regBtn" onclick="doRegister()">Kayıt Ol</button>
      </div>
    </div>
  </div>`;
}

async function doRegister() {
  const first = document.getElementById('rFirst').value.trim();
  const last  = document.getElementById('rLast').value.trim();
  const nat   = document.getElementById('rNat').value.trim();
  const lic   = document.getElementById('rLic').value.trim();
  const email = document.getElementById('rEmail').value.trim();
  const phone = document.getElementById('rPhone').value.trim();
  const pw    = document.getElementById('rPw').value;
  const btn   = document.getElementById('regBtn');

  if (!first||!last||!nat||!lic||!email||!phone||!pw) { showAlert('regAlert','Tüm alanlar zorunludur.','danger'); return; }
  if (nat.length !== 11) { showAlert('regAlert','TC No 11 haneli olmalı.','danger'); return; }
  if (pw.length < 6) { showAlert('regAlert','Şifre en az 6 karakter.','danger'); return; }

  if (btn) btn.disabled = true;
  try {
    const newCustomer = await apiRegister({ firstName: first, lastName: last, nationalId: nat, licenseNo: lic, email, phone, password: pw });
    // Lokal cache'e ekle
    DB.customers.push({ ...newCustomer, passwordHash: '' });
    showAlert('regAlert','Hesap oluşturuldu! Giriş yapabilirsiniz.','success');
    setTimeout(() => closeModal('registerModal'), 1500);
  } catch (e) {
    showAlert('regAlert', e.error || 'Kayıt başarısız.', 'danger');
  } finally {
    if (btn) btn.disabled = false;
  }
}

// ---- ŞİFREMİ UNUTTUM MODAL ----
function forgotModal() {
  return `<div class="modal-overlay" id="forgotModal">
    <div class="modal">
      <div class="modal-header">
        <div class="modal-title">Şifremi Unuttum</div>
        <button class="modal-close" onclick="closeModal('forgotModal')">✕</button>
      </div>
      <div class="modal-body">
        <div id="forgotAlert"></div>
        <p style="font-size:13px;color:var(--text2);margin-bottom:16px">E-posta adresinizi girin, kimlik doğrulamasının ardından yeni şifre belirleyin.</p>
        <div class="form-group" id="forgotEmailGroup">
          <label class="form-label">E-posta</label>
          <input class="form-control" type="email" id="forgotEmail" placeholder="kayıtlı e-posta"/>
        </div>
        <div id="forgotNewPwGroup" style="display:none">
          <div class="form-group">
            <label class="form-label">Yeni Şifre</label>
            <input class="form-control" type="password" id="forgotNewPw" placeholder="Min. 6 karakter"/>
          </div>
          <div class="form-group">
            <label class="form-label">Yeni Şifre (Tekrar)</label>
            <input class="form-control" type="password" id="forgotNewPw2" placeholder="Tekrar girin"/>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="closeModal('forgotModal')">İptal</button>
        <button class="btn btn-primary" id="forgotBtn" onclick="doForgotStep()">Doğrula</button>
      </div>
    </div>
  </div>`;
}

let _forgotStep = 1, _forgotEmail = '';
async function doForgotStep() {
  const btn = document.getElementById('forgotBtn');
  if (_forgotStep === 1) {
    _forgotEmail = document.getElementById('forgotEmail').value.trim();
    if (!_forgotEmail) { showAlert('forgotAlert','E-posta gerekli.','danger'); return; }
    if (btn) btn.disabled = true;
    try {
      await apiForgotPassword(_forgotEmail, null);
      showAlert('forgotAlert','✅ Hesap doğrulandı. Yeni şifrenizi belirleyin.','success');
      document.getElementById('forgotEmailGroup').style.display = 'none';
      document.getElementById('forgotNewPwGroup').style.display = 'block';
      btn.textContent = 'Şifreyi Güncelle';
      _forgotStep = 2;
    } catch (e) {
      showAlert('forgotAlert', e.error || 'E-posta bulunamadı.', 'danger');
    } finally {
      if (btn) btn.disabled = false;
    }
  } else {
    const pw  = document.getElementById('forgotNewPw').value;
    const pw2 = document.getElementById('forgotNewPw2').value;
    if (pw.length < 6) { showAlert('forgotAlert','Şifre en az 6 karakter.','danger'); return; }
    if (pw !== pw2) { showAlert('forgotAlert','Şifreler uyuşmuyor.','danger'); return; }
    if (btn) btn.disabled = true;
    try {
      await apiForgotPassword(_forgotEmail, pw);
      showAlert('forgotAlert','🎉 Şifre başarıyla güncellendi! Giriş yapabilirsiniz.','success');
      setTimeout(() => { closeModal('forgotModal'); _forgotStep = 1; }, 1800);
    } catch (e) {
      showAlert('forgotAlert', e.error || 'Güncelleme başarısız.', 'danger');
    } finally {
      if (btn) btn.disabled = false;
    }
  }
}
