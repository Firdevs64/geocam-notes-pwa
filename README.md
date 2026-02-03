📍 GeoCam Notes – PWA

GeoCam Notes, HTML, CSS ve Vanilla JavaScript kullanılarak geliştirilmiş, yüklenebilir (installable) bir Progressive Web Application (PWA)’dır.
Uygulama; offline çalışma, native cihaz özelliklerine erişim, performans ve responsive tasarım gibi temel PWA kavramlarını pratik olarak göstermeyi amaçlar.

👉 Live Demo:
https://firdevs64.github.io/geocam-notes-pwa/

🚀 Temel Özellikler

📸 Fotoğraf çekme ve saklama

📍 Konum (GPS) kaydı

🎤 Sesli not (Speech-to-Text)

🌐 Offline kullanım desteği

📱 Mobil cihazlara yüklenebilir PWA

⚡ Hızlı ve performans odaklı yapı

🛠️ Kullanılan Teknolojiler

HTML5

CSS3

Vanilla JavaScript

Service Workers

Web APIs

Camera API

Geolocation API

Web Speech API (Speech-to-Text)

⚠️ Not:
Service Worker, cache yönetimi ve offline mekanizmaları için herhangi bir harici JavaScript kütüphanesi veya framework kullanılmamıştır.

📦 PWA (Installable Application)

Uygulama bir Web App Manifest içerir ve aşağıdaki özellikleri tanımlar:

Uygulama adı

İkonlar

Tema ve arka plan renkleri

Start URL

Standalone görüntüleme modu

GitHub Pages üzerinden HTTPS ile yayınlandığı için uygulama:

Mobil cihazlara yüklenebilir

Native uygulama benzeri bir deneyim sunar

📱 Native Cihaz Özellikleri
📸 Kamera

HTML file input ile kamera yakalama desteği

Mobil cihazlarda doğrudan fotoğraf çekme

Fotoğraflar localStorage yerine Cache API ile saklanır
(storage limit problemleri önlenir)

📍 Geolocation

Geolocation API kullanılır

Her kayıtla birlikte GPS koordinatları saklanır

🎤 Mikrofon (Speech-to-Text)

Web Speech API kullanılır

Kullanıcılar notlarını sesli olarak dikte edebilir

Ses otomatik olarak metne dönüştürülür

🌐 Offline Desteği

Offline çalışma Service Worker + Cache API ile sağlanır:

Statik dosyalar install aşamasında cache’lenir

Dinamik içerikler runtime sırasında cache’e alınır

Ağ durumu (online / offline) algılanır ve kullanıcı bilgilendirilir

Offline iken:

Önceden çekilmiş fotoğraflar erişilebilir

Uygulama çalışmaya devam eder

🧭 Uygulama Akışı (Views)

Uygulama üç ana ekrandan oluşur:

🏠 Home View

Kayıtlı notları listeler

Online / offline durumunu gösterir

Temel özelliklere hızlı erişim sağlar

📸 Capture View

Fotoğraf çekme

Metin veya sesli not ekleme

Konum bilgisi kaydetme

📍 Location View

En son kaydedilen konumu gösterir

Kaydetmeden canlı konum önizleme imkanı sunar

Tüm ekranlar arasında sade ve sezgisel bir gezinme akışı bulunur.

⚡ Responsive Tasarım & Performans

Tüm ekran boyutlarına uyumlu (mobile-first)

Hızlı yükleme ve akıcı kullanım

PWA uyumluluğu ve performans:

Lighthouse ile ölçümlenebilir

🗂️ Cache Stratejisi

Statik dosyalar → install aşamasında cache

Cache-First stratejisi → offline güvenilirlik

Dinamik içerikler → runtime cache

Fotoğraflar → ayrı bir cache içinde tutulur
(photos-v1)

🌍 Hosting & HTTPS

Uygulama GitHub Pages üzerinde barındırılmaktadır:

🔒 HTTPS desteği

🌐 Herkese açık erişim

📲 PWA yükleme desteği
