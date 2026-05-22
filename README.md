# Bölüm A: README.md Dosyasının Amacı ve Önemi

### 📌 README Dosyasının Amacı
Bir `README.md` dosyası, herhangi bir yazılım projesinin vitrini ve ilk kullanım kılavuzudur. Projenin ne işe yaradığını, kimler tarafından neden geliştirildiğini, hangi teknolojileri barındırdığını ve en önemlisi projenin nasıl kurulup çalıştırılacağını açıklamak amacıyla hazırlanır. Proje deposunu (repository) ziyaret eden bir kişinin veya geliştiricinin projeyi anlaması için okuduğu ilk belgedir.

### 💡 Yazılım Projelerinde Neden Önemlidir?
1. **İlk İzlenim ve Profesyonellik:** Bir projenin iyi bir README dosyasına sahip olması, kod kalitesine ve belgelendirmeye verilen önemi gösterir.
2. **Hızlı Adaptasyon (Onboarding):** Ekibe yeni katılan geliştiricilerin veya açık kaynak katkıcılarının projeyi hızlıca kendi bilgisayarlarına kurup anlamalarını sağlar.
3. **Zaman Tasarrufu:** Kurulum hataları, "Nasıl kullanılır?" soruları ve sistem gereksinimleri peşinen yanıtlandığı için takım içi iletişimi rahatlatır.
4. **Portfolyo Değeri:** Projenin GitHub gibi platformlarda diğer mühendisler veya işverenler tarafından incelenirken kolay anlaşılmasını sağlayarak projenin değerini artırır.

---

# Bölüm B: Proje Detayları

# 🚗 DriveFleet - Araç Kiralama Otomasyonu

## 📝 Proje Tanımı
DriveFleet, müşterilerin araç kiralayabildiği, personellerin araç teslimatı ve hasar kayıtlarını yürütebildiği, yöneticilerin ise tüm filoyu, personelleri ve finansal istatistikleri takip edebildiği kapsamlı, 3 modüllü bir **Araç Kiralama Otomasyonu** web uygulamasıdır. Proje, modern web teknolojileri ile tamamen asenkron, duyarlı (responsive) ve pürüzsüz bir kullanıcı deneyimi sunacak şekilde sıfırdan geliştirilmiştir.

## ✨ Özellikler
- **Dinamik ve Akıllı Arama:** Tarih, kategori ve lokasyon bazlı gerçek zamanlı araç müsaitlik sorgulama.
- **Sadakat Programı (Loyalty Tier):** Müşterilerin geçmiş harcamalarına göre otomatik VIP seviye belirleme ve özel indirim uygulama.
- **Kapsamlı Rezervasyon Süreci:** Ekstra hizmetler (Kasko, Çocuk Koltuğu, GPS), 3D Secure simülasyonu ve PDF elektronik fatura oluşturma.
- **Yönetici Paneli (Admin):** Personel yönetimi (Ekleme/Çıkarma), finansal raporlamalar, araç ve kampanya takibi.
- **Personel Paneli (Employee):** Araç iade alma, gecikme ücreti (Late Charge) yansıtma ve detaylı hasar raporu oluşturma.
- **Kullanıcı Etkileşimi:** Müşterilerin araçlara 5 yıldız üzerinden puan verip yorum yapabilmesi.

## 💻 Kullanılan Teknolojiler
Bu proje modern bir mimariyle geliştirilmiş olup şu teknolojileri barındırmaktadır:
- **Frontend (Önyüz):** HTML5, CSS3, Vanilla JavaScript (ES6+) - *Herhangi bir kütüphane/çatı kullanılmadan tamamen saf ve modüler mimari ile yazılmıştır.*
- **Backend (Arkayüz):** Node.js, Express.js (RESTful API mimarisi).
- **Veritabanı:** PostgreSQL (ilişkisel veritabanı).
- **Güvenlik:** Pgcrypto (Şifrelerin Hash'lenmesi), CORS, Helmet.
- **Altyapı & Sanallaştırma:** Docker, Docker Compose (Tek komutla kurulum için).

## 🚀 Kurulum Adımları
Projeyi bilgisayarınızda yerel (local) olarak çalıştırmak için şu adımları izleyin:

1. **Projeyi Klonlayın:**
   ```bash
   git clone https://github.com/KullaniciAdiniz/arac-kiralama-otomasyonu.git
   cd arac-kiralama-otomasyonu-main
   ```
2. **Gereksinimler:** Sisteminizde **Docker** ve **Node.js** yüklü olmalıdır.
3. **Backend Bağımlılıklarını Yükleyin:**
   ```bash
   cd server
   npm install
   cd ..
   ```
4. **Veritabanı ve Sunucuyu Başlatın (Docker Compose):**
   ```bash
   docker-compose up --build -d
   ```
   *Bu komut, PostgreSQL veritabanını oluşturacak, tabloları (`schema.sql`) ekleyecek ve Express.js sunucusunu ayağa kaldıracaktır.*
5. **Uygulamayı Açın:**
   Herhangi bir sunucu (Örn. VS Code Live Server eklentisi) ile `AracKiralama/index.html` dosyasını çalıştırın veya doğrudan tarayıcı üzerinden açın.

## 📖 Kullanım
Uygulamayı açtığınızda üç farklı hesap türü ile giriş yapabilirsiniz (Test Verileri):
- **Müşteri Girişi:** Kayıt ol ekranından yeni bir üyelik açabilir veya varsayılan hesapları deneyebilirsiniz. (Sadakat sistemini, yorum yapmayı ve araç kiralama sepetini test edin.)
- **Personel Girişi:** Kadıköy veya diğer şubelere atanmış personeller ile giriş yapıp, "Rezarvasyonlar" kısmından `İade Al` ve `Hasar Bildir` özelliklerini test edin.
- **Yönetici Girişi:** Sisteme tam yetkili olarak giriş yapıp gelir-gider raporlarını, yeni personel atamalarını ve araç filosu üzerindeki işlemleri yönetin.

## 🤝 Katkı Sağlayanlar (Contribution)
Bu proje, geliştirici ekibi tarafından görevler **%25 oranında eşit paylaşımla** yürütülerek hayata geçirilmiştir:

- **Talha Ergelen** *(Tam Yığın Geliştirici)* - Backend API mimarisi ve Veritabanı entegrasyonu.
- **Abdulkadir Gümüşer** *(Tam Yığın Geliştirici)* - Müşteri modülleri, VIP Sadakat sistemi ve arama algoritmaları.
- **Hacı Osman Cingöz** *(Tam Yığın Geliştirici)* - Yönetici ve Personel modülleri (Hasar, İade, Finansal raporlama).
- **Eren Çolak** *(Tam Yığın Geliştirici)* - UI/UX Tasarımı, Frontend mimarisi (Modüler JS) ve kullanıcı deneyimi.

## 📄 Lisans
Bu proje **MIT Lisansı** (MIT License) altında açık kaynak olarak lisanslanmıştır. Projeyi ticari veya bireysel amaçla kullanabilir, kopyalayabilir ve değiştirebilirsiniz. Daha fazla detay için `LICENSE` dosyasına göz atabilirsiniz.
