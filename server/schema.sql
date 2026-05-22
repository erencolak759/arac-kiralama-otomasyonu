-- ============================================================
-- DriveFleet — PostgreSQL Şeması + Seed Data
-- pgcrypto ile bcrypt şifre hash'leme
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ===== TABLOLAR =====

CREATE TABLE IF NOT EXISTS branches (
  id      SERIAL PRIMARY KEY,
  name    VARCHAR(100) NOT NULL,
  city    VARCHAR(50)  NOT NULL,
  address VARCHAR(200) NOT NULL,
  phone   VARCHAR(20)  NOT NULL
);

CREATE TABLE IF NOT EXISTS employees (
  id            SERIAL PRIMARY KEY,
  first_name    VARCHAR(50)  NOT NULL,
  last_name     VARCHAR(50)  NOT NULL,
  email         VARCHAR(100) UNIQUE NOT NULL,
  role          VARCHAR(20)  NOT NULL CHECK (role IN ('Employee','Admin')),
  password_hash VARCHAR(255) NOT NULL,
  branch_id     INTEGER REFERENCES branches(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS customers (
  id              SERIAL PRIMARY KEY,
  national_id     VARCHAR(11)  UNIQUE NOT NULL,
  license_no      VARCHAR(20)  UNIQUE NOT NULL,
  first_name      VARCHAR(50)  NOT NULL,
  last_name       VARCHAR(50)  NOT NULL,
  email           VARCHAR(100) UNIQUE NOT NULL,
  phone           VARCHAR(20)  NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  created_at      DATE         DEFAULT CURRENT_DATE,
  failed_attempts INTEGER      DEFAULT 0,
  locked_until    TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vehicles (
  id         SERIAL PRIMARY KEY,
  plate      VARCHAR(10) UNIQUE NOT NULL,
  brand      VARCHAR(50)  NOT NULL,
  model      VARCHAR(50)  NOT NULL,
  year       INTEGER      NOT NULL,
  category   VARCHAR(20)  NOT NULL CHECK (category IN ('Economy','Comfort','SUV','Premium')),
  daily_rate DECIMAL(10,2) NOT NULL,
  status     VARCHAR(20)  DEFAULT 'Available' CHECK (status IN ('Available','Rented','Maintenance')),
  branch_id  INTEGER REFERENCES branches(id) ON DELETE SET NULL,
  km         INTEGER      DEFAULT 0,
  fuel_type  VARCHAR(20),
  seats      INTEGER      DEFAULT 5
);

CREATE TABLE IF NOT EXISTS reservations (
  id                 SERIAL PRIMARY KEY,
  customer_id        INTEGER REFERENCES customers(id) ON DELETE CASCADE,
  vehicle_id         INTEGER REFERENCES vehicles(id)  ON DELETE SET NULL,
  start_date         DATE         NOT NULL,
  end_date           DATE         NOT NULL,
  total_amount       DECIMAL(10,2) NOT NULL,
  status             VARCHAR(20)  DEFAULT 'Active'   CHECK (status IN ('Active','Completed','Cancelled')),
  payment_status     VARCHAR(20)  DEFAULT 'Paid'     CHECK (payment_status IN ('Pending','Paid','Refunded')),
  pickup_branch_id   INTEGER REFERENCES branches(id),
  return_branch_id   INTEGER REFERENCES branches(id),
  return_km          INTEGER,
  fuel_level         INTEGER      CHECK (fuel_level BETWEEN 0 AND 100),
  created_at         DATE         DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS reservation_extras (
  id             SERIAL PRIMARY KEY,
  reservation_id INTEGER REFERENCES reservations(id) ON DELETE CASCADE,
  service_name   VARCHAR(100) NOT NULL,
  price          DECIMAL(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS payments (
  id             SERIAL PRIMARY KEY,
  reservation_id INTEGER REFERENCES reservations(id) ON DELETE CASCADE,
  transaction_id VARCHAR(50)  UNIQUE NOT NULL,
  payment_date   DATE         DEFAULT CURRENT_DATE,
  amount         DECIMAL(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS damage_reports (
  id             SERIAL PRIMARY KEY,
  reservation_id INTEGER REFERENCES reservations(id) ON DELETE CASCADE,
  employee_id    INTEGER REFERENCES employees(id)    ON DELETE SET NULL,
  description    TEXT         NOT NULL,
  extra_charge   DECIMAL(10,2) DEFAULT 0,
  created_at     DATE         DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS notifications (
  id             SERIAL PRIMARY KEY,
  customer_id    INTEGER REFERENCES customers(id)    ON DELETE CASCADE,
  reservation_id INTEGER REFERENCES reservations(id) ON DELETE SET NULL,
  type           VARCHAR(20)  DEFAULT 'Email',
  subject        VARCHAR(200),
  body           TEXT,
  status         VARCHAR(20)  DEFAULT 'Sent' CHECK (status IN ('Sent','Read')),
  created_at     TIMESTAMP    DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS campaigns (
  id               SERIAL PRIMARY KEY,
  title            VARCHAR(100) NOT NULL,
  description      TEXT,
  tag              VARCHAR(50),
  color            VARCHAR(10)  DEFAULT 'c1',
  discount_percent INTEGER      DEFAULT 0,
  category         VARCHAR(20),
  is_active        BOOLEAN      DEFAULT true,
  created_at       DATE         DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS reviews (
  id           SERIAL PRIMARY KEY,
  vehicle_id   INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
  customer_id  INTEGER REFERENCES customers(id) ON DELETE SET NULL,
  author_name  VARCHAR(100) DEFAULT 'Anonim',
  rating       INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment      TEXT NOT NULL,
  created_at   TIMESTAMP DEFAULT NOW()
);

-- ===== İNDEKSLER =====

CREATE INDEX IF NOT EXISTS idx_res_customer  ON reservations(customer_id);
CREATE INDEX IF NOT EXISTS idx_res_vehicle   ON reservations(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_res_status    ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_veh_branch    ON vehicles(branch_id);
CREATE INDEX IF NOT EXISTS idx_veh_status    ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_notif_cust    ON notifications(customer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_veh   ON reviews(vehicle_id);

-- ===== SEED DATA =====

-- Şubeler
INSERT INTO branches (name, city, address, phone) VALUES
  ('İstanbul Merkez Şube', 'İstanbul', 'Atatürk Cad. No:1, Şişli',          '02121234567'),
  ('Ankara Kızılay Şube',  'Ankara',   'Kızılay Meydan No:5, Çankaya',       '03121234567'),
  ('İzmir Alsancak Şube',  'İzmir',    'Alsancak Kordon No:12, Konak',       '02321234567'),
  ('Bursa Merkez Şube',    'Bursa',    'Cumhuriyet Cad. No:8, Nilüfer',      '02241234567');

-- Personel (bcrypt hash)
INSERT INTO employees (first_name, last_name, email, role, password_hash, branch_id) VALUES
  ('Mehmet', 'Demir',  'mehmet@arackiralama.com', 'Employee', crypt('emp123',   gen_salt('bf',10)), 1),
  ('Fatma',  'Çelik',  'fatma@arackiralama.com',  'Employee', crypt('emp123',   gen_salt('bf',10)), 2),
  ('Ali',    'Şahin',  'ali@arackiralama.com',    'Employee', crypt('emp123',   gen_salt('bf',10)), 3),
  ('Admin',  'User',   'admin@arackiralama.com',  'Admin',    crypt('admin123', gen_salt('bf',10)), NULL);

-- Müşteriler (bcrypt hash)
INSERT INTO customers (national_id, license_no, first_name, last_name, email, phone, password_hash, created_at) VALUES
  ('12345678901','06AB1234','Ahmet',   'Yılmaz', 'ahmet@mail.com',   '05321112233', crypt('123456', gen_salt('bf',10)), '2025-01-10'),
  ('98765432109','34CD5678','Ayşe',    'Kaya',   'ayse@mail.com',    '05439998877', crypt('123456', gen_salt('bf',10)), '2025-02-15'),
  ('11122233344','35EF9012','Mustafa', 'Öztürk', 'mustafa@mail.com', '05551234567', crypt('123456', gen_salt('bf',10)), '2025-03-01'),
  ('55566677788','01GH3456','Zeynep',  'Arslan', 'zeynep@mail.com',  '05367654321', crypt('123456', gen_salt('bf',10)), '2025-03-20');

-- Araçlar
INSERT INTO vehicles (plate, brand, model, year, category, daily_rate, status, branch_id, km, fuel_type, seats) VALUES
  ('34ABC123','Renault',    'Clio',     2022,'Economy', 750,  'Available',   1, 45000,'Benzin',5),
  ('34XYZ456','Volkswagen', 'Passat',   2023,'Comfort', 1200, 'Available',   1, 22000,'Dizel', 5),
  ('06DEF789','Toyota',     'RAV4',     2023,'SUV',     1800, 'Available',   2, 15000,'Hibrit',5),
  ('06GHI012','BMW',        '5 Serisi', 2024,'Premium', 3500, 'Available',   2, 8000, 'Benzin',5),
  ('35JKL345','Ford',       'Focus',    2022,'Economy', 800,  'Maintenance', 3, 60000,'Benzin',5),
  ('35MNO678','Mercedes',   'E200',     2024,'Premium', 4200, 'Available',   3, 5000, 'Benzin',5),
  ('34PQR901','Hyundai',    'Tucson',   2023,'SUV',     1650, 'Available',   1, 18000,'Dizel', 5),
  ('06STU234','Skoda',      'Octavia',  2022,'Comfort', 1100, 'Available',   2, 35000,'Dizel', 5),
  ('16VWX567','Fiat',       'Egea',     2023,'Economy', 700,  'Available',   4, 28000,'Benzin',5),
  ('16YZA890','Audi',       'A6',       2024,'Premium', 4800, 'Available',   4, 3000, 'Dizel', 5);

-- Rezervasyonlar
INSERT INTO reservations (customer_id, vehicle_id, start_date, end_date, total_amount, status, payment_status, pickup_branch_id, return_branch_id, return_km, fuel_level, created_at) VALUES
  (1, 3, '2025-05-10','2025-05-15', 9000,'Completed','Paid', 2, 2, 15800, 70, '2025-05-08'),
  (2, 1, '2025-05-18','2025-05-20', 1500,'Completed','Paid', 1, 1, 45200, 85, '2025-05-17'),
  (3, 2, '2025-04-01','2025-04-05', 4800,'Completed','Paid', 1, 1, 22500, 90, '2025-03-30'),
  (4, 4, '2025-05-01','2025-05-03', 7000,'Completed','Paid', 2, 2, 8200,  85, '2025-04-29');

-- Ödemeler
INSERT INTO payments (reservation_id, transaction_id, payment_date, amount) VALUES
  (1,'TXN20250510001','2025-05-08', 9000),
  (2,'TXN20250517002','2025-05-17', 1500),
  (3,'TXN20250330003','2025-03-30', 4800),
  (4,'TXN20250429004','2025-04-29', 7000);

-- Hasar raporları
INSERT INTO damage_reports (reservation_id, employee_id, description, extra_charge, created_at) VALUES
  (1, 2, 'Ön tampon sağ köşede küçük çizik', 500, '2025-05-15'),
  (3, 1, 'Sol arka kapı boyasında soyulma',  800, '2025-04-05');

-- Bildirimler
INSERT INTO notifications (customer_id, reservation_id, type, subject, body, status, created_at) VALUES
  (1, 1, 'Email', 'Rezervasyonunuz Tamamlandı', 'RAV4 aracınız başarıyla iade alındı.',             'Sent', '2025-05-15T10:00:00Z'),
  (2, 2, 'Email', 'Rezervasyonunuz Onaylandı',  'Clio aracınız 18 Mayıs''ta hazır olacak.', 'Sent', '2025-05-17T08:00:00Z');

-- Kampanyalar
INSERT INTO campaigns (title, description, tag, color, discount_percent, category, is_active) VALUES
  ('SUV Fırsatları',    'Tucson ve RAV4 — günlük özel fiyat',    'Kampanya', 'c1', 10, 'SUV',     true),
  ('Premium Segment',   'BMW ve Mercedes — kurumsal indirim',     'Yeni',     'c2', 15, 'Premium', true),
  ('Haftalık Kiralama', '7 gün ve üzeri ek avantaj',              'Popüler',  'c3', 20, NULL,      true),
  ('Şehir İçi Paket',   'Clio ve Egea ile uygun fiyat',           'Ekonomi',  'c4',  5, 'Economy', true);
