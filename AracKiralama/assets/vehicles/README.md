# Araç fotoğrafları (tüm ekip için)

## Arkadaşlarınız da görsün istiyorsanız

**localhost veya kendi bilgisayarınızdaki bir API adresi sadece sizde çalışır.**  
Grup arkadaşlarınızın aynı fotoğrafları görmesi için dosyaları **bu klasöre koyup Git ile paylaşmanız** gerekir.

## Dosya adlandırma

| ID | Araç | Dosya adı (tercih) |
|----|------|---------------------|
| 1 | Renault Clio | `1.jpg` veya `renault-clio.jpg` |
| 2 | Volkswagen Passat | `2.jpg` |
| 3 | Toyota RAV4 | `3.jpg` |
| 4 | BMW 5 Serisi | `4.jpg` |
| 5 | Ford Focus | `5.jpg` |
| 6 | Mercedes E200 | `6.jpg` |
| 7 | Hyundai Tucson | `7.jpg` |
| 8 | Skoda Octavia | `8.jpg` |
| 9 | Fiat Egea | `9.jpg` |
| 10 | Audi A6 | `10.jpg` |

Desteklenen uzantılar: `.jpg`, `.jpeg`, `.png`, `.webp`

## Kendi çektiğiniz fotoğraflar

1. Fotoğrafı yukarıdaki isimle kaydedin (ör. `7.jpg` = Hyundai Tucson).
2. Projeyi commit + push yapın veya klasörü zip ile gönderin.
3. Arkadaşlar projeyi çekip `index.html` veya `python -m http.server` ile açsın.

## Projede hazır görseller

`1.jpg` – `10.jpg` dosyaları projeye dahildir. Projeyi indiren herkes (Git, zip, USB) aynı araç fotoğraflarını görür.

Kendi çektiğiniz fotoğrafı aynı numarayla kaydederseniz (ör. `7.jpg`) sizin görseliniz öncelikli kullanılır.

## Arkadaşlarınıza gönderme

1. Tüm `AracKiralama` klasörünü paylaşın **veya**
2. Git: `git add assets/vehicles` → `git commit` → `git push` → arkadaş `git pull`

`localhost` API adresi sadece sizde çalışır; dosyalar klasörde olmalıdır.
