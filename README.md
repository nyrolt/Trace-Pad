# 📝 Tracepad

> **Tracepad** is a sleek, modern, offline-first notepad application with real-time Firebase cloud synchronization, Markdown formatting, custom tagging, pinning, live search, and PWA capabilities.

---

# Features

- > 🔐 **Firebase Authentication**: Email/Password Sign-up & Sign-in, Google OAuth Sign-in, and Password Reset flow.
- > ☁️ **Real-time Cloud Sync**: Powered by Cloud Firestore with offline persistence enabled.
- >📌 **Pin & Organize**: Pin important notes to the top of your list for quick access.
- >🏷️ **Tagging & Filtering**: Add tags to notes and search/filter by tag, title, or body text.
- >✍️ **Markdown Support**: Render markdown formatting (**bold**, *italic*, headers `#`, lists `-`, code, etc.) automatically.
- >🌗 **Dark & Light Mode**: Persistent theme toggling with smooth transition animations and OS preference detection.
- >🔲 **Grid & List View**: Switch between responsive grid and structured list layouts.
- >🔔 **Toast Notifications**: Non-intrusive feedback for note creation, edits, deletion, and system events.
- >📱 **Progressive Web App (PWA)**: Service Worker for offline asset caching and Web App Manifest for mobile/desktop app installation.
- >🔒 **Security Rules**: User data is isolated per authenticated user using Firestore security rules.


##  Components & Technologies Used

### Frontend & Core Technologies
- **HTML5 & Semantic Markup**: Structured accessibility and web standards.
- **Vanilla CSS3 (Custom Design System)**: Glassmorphic UI design, CSS variables, dark/light theme tokens, fluid responsive grid layout, micro-animations, and custom typography.
- **Vanilla JavaScript (ES6+)**: Modular code layout without external framework dependencies (`auth.js`, `notes.js`, `firebase-config.js`).

### Backend Services & Cloud (Google Firebase v10.12.2)
- **Firebase Auth (`firebase-auth-compat`)**: Manages user session state, Google OAuth, and password recovery.
- **Cloud Firestore (`firebase-firestore-compat`)**: NoSQL database holding notes per user (`users/{uid}/notes`).
- **Offline Persistence**: Enabled via `db.enablePersistence()`.
- **Security Rules (`firestore.rules`)**: Granular read/write permissions enforcing user ownership.

### Libraries & Utilities
- **[Marked.js](https://marked.js.org/)**: Lightweight JavaScript library for parsing and rendering Markdown syntax on notes.
- **Service Worker (`sw.js`)**: Caches static assets (`index.html`, `login.html`, `notes.html`, `css/style.css`, `js/*`, icons) for full offline usability.
- **Web App Manifest (`manifest.json`)**: Configures app icons, colors, display modes (`standalone`), and app installation metadata.

---

##  Project Structure

```text
Trace-Pad/
├── assets/             # Icons, images, and brand assets (ip.png, icon.svg)
├── css/
│   └── style.css       # Unified design system, CSS variables, and layout styles
├── js/
│   ├── firebase-config.js # Firebase app initialization & offline persistence config
│   ├── auth.js            # Authentication logic, theme manager & SW registration
│   └── notes.js           # CRUD operations, Markdown rendering, pinning & filtering
├── firestore.rules     # Security rules for Cloud Firestore
├── index.html          # Landing / Home page
├── login.html          # Authentication page (Sign in / Sign up / Forgot Password)
├── notes.html          # Main application dashboard
├── manifest.json       # Web App Manifest for PWA support
├── sw.js               # Service Worker for offline caching
└── README.md           # Project documentation
```

---

## Run Locally Clone the repository

1. **Clone the repository** :
   ```bash
   git clone https://github.com/YOUR_USERNAME/Trace-Pad.git
   cd Trace-Pad
   ```

2. **Open in Browser**

   - Simply open `index.html` directly in any web browser, OR
   - Serve using a local HTTP server (e.g., Live Server extension in VS Code, or Python `python -m http.server 8000`).

3. **Firebase Setup** *(Optional if using your own Firebase project)*:

   - Create a project on [Firebase Console](https://console.firebase.google.com/).
   - Enable **Authentication** (Email/Password & Google Sign-In).
   - Create a **Cloud Firestore Database**.
   - Update the configuration object in `js/firebase-config.js` with your credentials:
     ```javascript
     
     const firebaseConfig = {
       apiKey: "YOUR_API_KEY",
       authDomain: "YOUR_AUTH_DOMAIN",
       projectId: "YOUR_PROJECT_ID",
       storageBucket: "YOUR_STORAGE_BUCKET",
       messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
       appId: "YOUR_APP_ID"
     };
     ```
