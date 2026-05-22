// ========== ARAÇ KATALOĞU — DOĞRU MARKA GÖRSELLERİ & TEKNİK VERİ ==========
// Öncelik: assets/vehicles/{id}.jpg (Git ile paylaşılan kendi fotoğraflarınız)
// Yedek: imageUrl (Wikimedia — marka/model doğrulanmış)

const LOCAL_VEHICLE_DIR = 'assets/vehicles';

const VEHICLE_CATALOG = {
  1: {
    make: 'renault', modelFamily: 'clio', trim: 'Icon 1.0 TCe 90',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/2019_Renault_Clio_ICONIC_TCe_100_Automatic_1.0_Front.jpg/1280px-2019_Renault_Clio_ICONIC_TCe_100_Automatic_1.0_Front.jpg',
    bodyType: 'Hatchback', color: 'İnci Beyazı', doors: 5,
    engine: '1.0 TCe', powerHp: 90, torqueNm: 160,
    transmission: 'EDC Otomatik', driveType: 'Önden çekiş',
    fuelConsumption: '5,1 L/100 km (WLTP)', luggageLiters: 391,
    features: ['Klima', 'LED Pure Vision', 'Apple CarPlay / Android Auto', 'Park sensörü', 'ABS / ESP', 'Cruise control']
  },
  2: {
    make: 'volkswagen', modelFamily: 'passat', trim: 'Business 2.0 TDI 150',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/2020_Volkswagen_Passat_R-Line_2.0_Front.jpg/1280px-2020_Volkswagen_Passat_R-Line_2.0_Front.jpg',
    bodyType: 'Sedan', color: 'Gümüş Gri', doors: 4,
    engine: '2.0 TDI', powerHp: 150, torqueNm: 360,
    transmission: '7 ileri DSG', driveType: 'Önden çekiş',
    fuelConsumption: '4,9 L/100 km (WLTP)', luggageLiters: 586,
    features: ['Dijital Cockpit', 'Adaptif cruise', 'Şerit takip', '3 bölge klima', 'LED far', 'Park Pilot']
  },
  3: {
    make: 'toyota', modelFamily: 'rav4', trim: 'Hybrid Flame e-CVT',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/2021_Toyota_RAV4_Limited_AWD_1.jpg/1280px-2021_Toyota_RAV4_Limited_AWD_1.jpg',
    bodyType: 'SUV', color: 'Siyah', doors: 5,
    engine: '2.5 Hybrid', powerHp: 218, torqueNm: 221,
    transmission: 'e-CVT', driveType: 'AWD-i',
    fuelConsumption: '4,7 L/100 km (WLTP)', luggageLiters: 580,
    features: ['Toyota Safety Sense', 'Elektrikli bagaj', 'Isıtmalı koltuk', 'Kablosuz şarj', '360° kamera']
  },
  4: {
    make: 'bmw', modelFamily: '5-series', trim: '520i M Sport',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/2018_BMW_520d_M_Sport_Automatic_2.0_Front.jpg/1280px-2018_BMW_520d_M_Sport_Automatic_2.0_Front.jpg',
    bodyType: 'Sedan', color: 'Portimao Mavi', doors: 4,
    engine: '2.0 TwinPower Turbo', powerHp: 184, torqueNm: 290,
    transmission: '8 ileri Steptronic', driveType: 'Arkadan itiş',
    fuelConsumption: '6,5 L/100 km (WLTP)', luggageLiters: 530,
    features: ['M Sport paket', 'Live Cockpit Pro', 'Harman Kardon', 'Panoramik tavan', 'Park Assistant Plus']
  },
  5: {
    make: 'ford', modelFamily: 'focus', trim: 'Titanium 1.5 EcoBoost',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/2018_Ford_Focus_ST-Line_EcoBoost_1.0_Front.jpg/1280px-2018_Ford_Focus_ST-Line_EcoBoost_1.0_Front.jpg',
    bodyType: 'Hatchback', color: 'Magnetic Gri', doors: 5,
    engine: '1.5 EcoBoost', powerHp: 150, torqueNm: 240,
    transmission: '8 ileri Otomatik', driveType: 'Önden çekiş',
    fuelConsumption: '5,8 L/100 km (WLTP)', luggageLiters: 375,
    features: ['Ford Co-Pilot360', 'B&O ses', 'Isıtmalı direksiyon', 'SYNC 3', 'Anahtarsız giriş']
  },
  6: {
    make: 'mercedes-benz', modelFamily: 'e-class', trim: 'E 200 Avantgarde',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/2019_Mercedes-Benz_E220d_AMG_Line_Premium%2B_2.0_Front.jpg/1280px-2019_Mercedes-Benz_E220d_AMG_Line_Premium%2B_2.0_Front.jpg',
    bodyType: 'Sedan', color: 'Obsidiyen Siyah', doors: 4,
    engine: '2.0 Turbo Benzin', powerHp: 184, torqueNm: 300,
    transmission: '9G-TRONIC', driveType: 'Arkadan itiş',
    fuelConsumption: '6,8 L/100 km (WLTP)', luggageLiters: 540,
    features: ['MBUX', 'Burmester ses', '360° kamera', 'Adaptif far', 'Anahtarsız start', 'Masajlı koltuk']
  },
  7: {
    make: 'hyundai', modelFamily: 'tucson', trim: 'Elite 1.6 CRDi DCT',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/2021_Hyundai_Tucson_NX4_160D_Calligraphy_Front.jpg/1280px-2021_Hyundai_Tucson_NX4_160D_Calligraphy_Front.jpg',
    bodyType: 'SUV', color: 'Grafit Gri', doors: 5,
    engine: '1.6 CRDi', powerHp: 136, torqueNm: 320,
    transmission: '7 ileri DCT', driveType: 'Önden çekiş',
    fuelConsumption: '5,4 L/100 km (WLTP)', luggageLiters: 620,
    features: ['Hyundai SmartSense', 'Elektrikli bagaj', 'Ventilasyonlu koltuk', 'Kablosuz CarPlay', 'Isıtmalı direksiyon']
  },
  8: {
    make: 'skoda', modelFamily: 'octavia', trim: 'Style 2.0 TDI 150',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/2020_Skoda_Octavia_SE_L_TDI_2.0_Front.jpg/1280px-2020_Skoda_Octavia_SE_L_TDI_2.0_Front.jpg',
    bodyType: 'Liftback', color: 'Beyaz', doors: 5,
    engine: '2.0 TDI', powerHp: 150, torqueNm: 360,
    transmission: '7 ileri DSG', driveType: 'Önden çekiş',
    fuelConsumption: '4,6 L/100 km (WLTP)', luggageLiters: 600,
    features: ['Virtual Cockpit', 'Adaptif cruise', 'Matrix LED', 'Elektrikli bagaj', 'Kablosuz şarj']
  },
  9: {
    make: 'fiat', modelFamily: 'tipo', trim: '1.4 Fire Urban',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/2017_Fiat_Tipo_Easy_Plus_1.4_Front.jpg/1280px-2017_Fiat_Tipo_Easy_Plus_1.4_Front.jpg',
    bodyType: 'Sedan', color: 'Kırmızı', doors: 4,
    engine: '1.4 Fire', powerHp: 95, torqueNm: 127,
    transmission: '6 ileri Manuel', driveType: 'Önden çekiş',
    fuelConsumption: '5,7 L/100 km (WLTP)', luggageLiters: 520,
    features: ['Uconnect', 'Klima', 'ABS / ESP', 'LED gündüz farı', 'Cruise control', 'Isofix']
  },
  10: {
    make: 'audi', modelFamily: 'a6', trim: '40 TDI quattro S line',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/2019_Audi_A6_40_TDI_Quattro_Front.jpg/1280px-2019_Audi_A6_40_TDI_Quattro_Front.jpg',
    bodyType: 'Sedan', color: 'Gri', doors: 4,
    engine: '2.0 TDI', powerHp: 204, torqueNm: 400,
    transmission: '7 ileri S tronic', driveType: 'quattro',
    fuelConsumption: '5,3 L/100 km (WLTP)', luggageLiters: 530,
    features: ['Virtual Cockpit Plus', 'S line paket', 'Matrix LED', 'quattro', 'Bang & Olufsen', 'Park assist plus']
  }
};

const MAKE_SLUG = {
  Renault: 'renault', Volkswagen: 'volkswagen', Toyota: 'toyota', BMW: 'bmw',
  Ford: 'ford', Mercedes: 'mercedes-benz', Hyundai: 'hyundai', Skoda: 'skoda',
  Fiat: 'fiat', Audi: 'audi'
};

const MODEL_SLUG = {
  'Clio': 'clio', 'Passat': 'passat', 'RAV4': 'rav4', '5 Serisi': '5-series',
  'Focus': 'focus', 'E200': 'e-class', 'Tucson': 'tucson', 'Octavia': 'octavia',
  'Egea': 'tipo', 'A6': 'a6'
};

function getCatalogEntry(vehicle) {
  return VEHICLE_CATALOG[vehicle.id] || null;
}

function enrichVehicleCatalog(vehicle) {
  const cat = getCatalogEntry(vehicle);
  if (cat) Object.assign(vehicle, cat);
  if (!vehicle.make) vehicle.make = MAKE_SLUG[vehicle.brand] || vehicle.brand.toLowerCase().replace(/\s+/g, '-');
  if (!vehicle.modelFamily) vehicle.modelFamily = MODEL_SLUG[vehicle.model] || vehicle.model.toLowerCase().replace(/\s+/g, '-');
  return vehicle;
}

/** Görsel önceliği: proje klasörü (ekip paylaşımı) → doğrulanmış uzak URL */
function getVehicleImageCandidates(vehicle) {
  enrichVehicleCatalog(vehicle);
  const slug = `${vehicle.make}-${vehicle.modelFamily}`;
  const list = [
    `${LOCAL_VEHICLE_DIR}/${vehicle.id}.jpg`,
    `${LOCAL_VEHICLE_DIR}/${vehicle.id}.jpeg`,
    `${LOCAL_VEHICLE_DIR}/${vehicle.id}.png`,
    `${LOCAL_VEHICLE_DIR}/${vehicle.id}.webp`,
    `${LOCAL_VEHICLE_DIR}/${slug}.jpg`
  ];
  if (vehicle.imageUrl) list.push(vehicle.imageUrl);
  return list;
}

function getVehicleImageUrl(vehicle) {
  return getVehicleImageCandidates(vehicle)[0];
}

function buildVehicleImageUrl() {
  return null;
}

function applyCatalogToAllVehicles() {
  DB.vehicles.forEach(enrichVehicleCatalog);
}

function mergeVehiclesFromSeed() {
  SEED_DATA.vehicles.forEach(seed => {
    const idx = DB.vehicles.findIndex(v => v.id === seed.id);
    const existing = idx >= 0 ? DB.vehicles[idx] : {};
    const merged = { ...seed, ...existing };
    const cat = VEHICLE_CATALOG[merged.id];
    if (cat) Object.assign(merged, cat);
    merged.plate = existing.plate || seed.plate;
    merged.status = existing.status ?? seed.status;
    merged.km = existing.km != null ? existing.km : seed.km;
    merged.branchId = existing.branchId ?? seed.branchId;
    merged.dailyRate = existing.dailyRate ?? seed.dailyRate;
    enrichVehicleCatalog(merged);
    if (idx >= 0) DB.vehicles[idx] = merged;
    else DB.vehicles.push(merged);
  });
  DB.vehicles.forEach(v => enrichVehicleCatalog(v));
}

loadDB();
console.log('Araç kiralama DB yüklendi:', getDBStats());
