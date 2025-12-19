# geocam-notes-pwa
GeoCam Notes is an installable Progressive Web Application (PWA) developed using HTML, CSS, and Vanilla JavaScript.
The application is designed to demonstrate core PWA concepts such as offline support, use of native device features, responsiveness, and performance best practices.

TECHNOLOGIES USED
🔹HTML5
🔹CSS3
🔹Vanilla JavaScript
🔹Service Workers
🔹Web APIs (Camera, Geolocation, Microphone)
No external JavaScript frameworks or libraries are used for Service Worker logic, caching strategies, or offline handling.

INSTALLABLE APPLICATION (PWA)
The application includes a Web App Manifest that defines:
🔹Application name
🔹Icons
🔹Theme and background colors
🔹Start URL
🔹Standalone display mode
Thanks to HTTPS hosting via GitHub Pages and proper manifest configuration, the application can be installed on mobile devices and used similarly to a native application.

NATIVE DEVICE FEATURES
The application uses the following native device features:

 Camera
🔹Implemented using an HTML file input with camera capture support.
🔹Allows users to take photos directly on mobile devices.
🔹Photos are cached using the Service Worker Cache API instead of localStorage to avoid storage limitations.
 
 Geolocation
🔹Implemented using the Geolocation API.
🔹GPS coordinates are captured and stored with each record.

 Microphone (Speech-to-Text)
🔹Implemented using the Web Speech API.
🔹Users can dictate notes using voice input, which is automatically converted into text.

OFFLINE FUNCTIONALITY
Offline support is implemented using a Service Worker and the Cache API.
🔹Static assets are cached during the service worker installation.
🔹Dynamic content and photos are cached at runtime.
🔹The application detects network status changes and informs the user when they are offline.
🔹Cached photos remain accessible even when the device is offline.

VIEW AND APPLICATION FLOW
The application consists of three main views with a consistent and intuitive navigation flow:

Home View
🔹Displays saved records
🔹Shows online/offline status
🔹Provides quick access to core features

Capture View
🔹Allows users to take photos
🔹Add text or voice-based notes
🔹Capture location data

Location View
🔹Displays the most recently saved location
🔹Allows live location preview without saving
Each view has a clearly defined purpose and smooth transitions.

RESPONSIVENESS AND PERFORMANCE
🔹The user interface is fully responsive and adapts to different screen sizes.
🔹The application loads quickly and runs smoothly.
🔹Performance and PWA compliance can be evaluated using Lighthouse.

CACHING STRATEGY
🔹Static assets are cached during the service worker installation phase.
🔹The cache-first strategy is used for offline reliability.
🔹Dynamic content is cached at runtime.
🔹Photos are stored in a dedicated cache (photos-v1) and served via the Service Worker.

HOSTING AND HTTPS
The application is hosted using GitHub Pages, which provides:
🔹Secure HTTPS connection
🔹Public accessibility
🔹PWA installation support

Live Demo:
https://firdevs64.github.io/geocam-notes-pwa/













