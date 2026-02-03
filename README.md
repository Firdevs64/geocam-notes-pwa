# 📍 GeoCam Notes – PWA

GeoCam Notes is an installable **Progressive Web Application (PWA)** developed using **HTML, CSS, and Vanilla JavaScript**.  
The application demonstrates core PWA concepts such as **offline support**, **native device feature access**, **responsiveness**, and **performance best practices**.

👉 **Live Demo:**  
https://firdevs64.github.io/geocam-notes-pwa/

---

## 🚀 Key Features

- 📸 Capture photos using the device camera  
- 📍 Save GPS location data  
- 🎤 Create notes using speech-to-text  
- 🌐 Full offline support  
- 📱 Installable as a PWA on mobile devices  
- ⚡ Fast and lightweight performance  

---

## 🛠️ Technologies Used

- HTML5  
- CSS3  
- Vanilla JavaScript  
- Service Workers  
- Web APIs  
  - Camera API  
  - Geolocation API  
  - Web Speech API (Speech-to-Text)  

> No external JavaScript frameworks or libraries are used for Service Worker logic, caching strategies, or offline handling.

---

## 📦 Progressive Web App (PWA)

The application includes a **Web App Manifest** that defines:

- Application name  
- Icons  
- Theme and background colors  
- Start URL  
- Standalone display mode  

Thanks to **HTTPS hosting via GitHub Pages** and proper manifest configuration, the application can be installed on mobile devices and used similarly to a native application.

---

## 📱 Native Device Features

### 📸 Camera
- Implemented using an HTML file input with camera capture support  
- Allows users to take photos directly on mobile devices  
- Photos are stored using the **Service Worker Cache API** instead of localStorage to avoid storage limitations  

### 📍 Geolocation
- Implemented using the Geolocation API  
- GPS coordinates are captured and stored with each record  

### 🎤 Microphone (Speech-to-Text)
- Implemented using the Web Speech API  
- Users can dictate notes using voice input  
- Speech is automatically converted into text  

---

## 🌐 Offline Functionality

Offline support is implemented using a **Service Worker** and the **Cache API**:

- Static assets are cached during the service worker installation phase  
- Dynamic content is cached at runtime  
- The application detects network status changes and informs the user  
- Cached photos remain accessible even when the device is offline  

---

## 🧭 Application Flow

The application consists of three main views with a clear and intuitive navigation flow:

### 🏠 Home View
- Displays saved records  
- Shows online/offline status  
- Provides quick access to core features  

### 📸 Capture View
- Take photos  
- Add text or voice-based notes  
- Capture and save location data  

### 📍 Location View
- Displays the most recently saved location  
- Allows live location preview without saving  

---

## ⚡ Responsiveness & Performance

- Fully responsive UI across different screen sizes  
- Fast loading and smooth interaction  
- PWA compliance and performance can be evaluated using **Lighthouse**  

---

## 🗂️ Caching Strategy

- Static assets are cached during service worker installation  
- Cache-first strategy is used for offline reliability  
- Dynamic content is cached at runtime  
- Photos are stored in a dedicated cache (`photos-v1`) and served via the service worker  

---

## 🌍 Hosting & HTTPS

The application is hosted on **GitHub Pages**, providing:

- Secure HTTPS connection  
- Public accessibility  
- PWA installation support  
