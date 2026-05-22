// ============================================================
// VEHICLE IMAGE API — Wikimedia Commons (no API key needed)
// ============================================================

const _viCache = {};

async function fetchWikimediaCarImage(brand, model) {
  const key = (brand + '_' + model).toLowerCase().replace(/\s+/g, '_');
  if (_viCache[key]) return _viCache[key];
  const ls = localStorage.getItem('vi_' + key);
  if (ls) { _viCache[key] = ls; return ls; }

  const queries = [
    brand + ' ' + model + ' automobile',
    brand + ' ' + model + ' car',
    brand + ' ' + model
  ];

  for (const q of queries) {
    try {
      const url = 'https://commons.wikimedia.org/w/api.php?action=query' +
        '&generator=search&gsrsearch=' + encodeURIComponent(q) +
        '&gsrnamespace=6&gsrlimit=5&prop=imageinfo&iiprop=url' +
        '&format=json&origin=*';
      const resp = await fetch(url, { signal: AbortSignal.timeout(5000) });
      const data = await resp.json();
      if (!data.query?.pages) continue;
      const pages = Object.values(data.query.pages);
      for (const pg of pages) {
        const imgUrl = pg.imageinfo?.[0]?.url;
        if (imgUrl && /\.(jpg|jpeg|png|webp)$/i.test(imgUrl)) {
          _viCache[key] = imgUrl;
          try { localStorage.setItem('vi_' + key, imgUrl); } catch(e){}
          return imgUrl;
        }
      }
    } catch (e) { /* network error, try next query */ }
  }
  return null;
}

// Called after page render — finds all placeholders and fills them
async function lazyLoadVehicleImages() {
  const imgs = document.querySelectorAll('img[data-brand][data-model]');
  for (const img of imgs) {
    if (img.dataset.loaded) continue;
    if (!img.closest('.is-placeholder') && img.complete && img.naturalWidth > 0) {
      img.dataset.loaded = '1';
      continue;
    }
    const brand = img.dataset.brand;
    const model = img.dataset.model;
    if (!brand || !model) continue;
    img.dataset.loaded = '1';
    const url = await fetchWikimediaCarImage(brand, model);
    if (url) {
      const wrap = img.closest('.vehicle-photo');
      if (wrap) {
        wrap.classList.remove('is-placeholder');
        const ph = wrap.querySelector('.vehicle-photo-ph');
        if (ph) ph.remove();
      }
      img.style.display = '';
      img.src = url;
    }
  }
}
