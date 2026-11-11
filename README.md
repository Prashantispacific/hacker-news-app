# HN by PG — Modern Android App for Hacker News

<div align="center">

![HN by PG Logo](public/favicon.svg)

### Ultra-minimalist, high-signal, high-performance Hacker News Android client.
*Inspired by Paul Graham's original aesthetic, elevated to modern OLED standards.*

[![React 19](https://img.shields.io/badge/React-19.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Capacitor](https://img.shields.io/badge/Capacitor-8.6-119EFF?logo=capacitor&logoColor=white)](https://capacitorjs.com/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.3-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Platform](https://img.shields.io/badge/Platform-Android_8.0+-3DDC84?logo=android&logoColor=white)](https://developer.android.com/)
[![License](https://img.shields.io/badge/License-MIT-orange.svg)](LICENSE)

<br />

🌐 **Live Web App (PWA):** [https://hackernewsbypg.netlify.app/](https://hackernewsbypg.netlify.app/)  
📱 **Android Release (APK):** [v1.0.0 Releases](https://github.com/Prashantispacific/hacker-news-app/releases/tag/v1.0.0)

</div>

---

## ⚡ Highlights

- **Real-Time Progressive Comment Streaming**: No waiting for massive 800+ comment trees to finish loading. Top-level comments appear instantly in **~150–300ms**, with child comment branches streaming in smoothly in the background without layout shifts or collapse resets.
- **Extreme OLED Comfort**: Engineered specifically for mobile screens with a halation-safe `#0A0A0A` canvas, whitespace-driven breathing room (20px–24px), and a user-toggleable `#000000` True Black mode.
- **Deep Linking & Supported Links**: Native intent filters intercept Hacker News URLs (`https://news.ycombinator.com/item?id=...`, `hn://...`) to open threads directly inside the app.
- **Publisher Restriction Bypass**: Seamless integration with Chrome Custom Tabs via `@capacitor/browser` when external publishers restrict in-app frames via `X-Frame-Options` or CSP.
- **Discussion Signal Suite**:
  - **1px Vertical Guide Rails**: Tap any guide rail or comment header to fold the entire branch into `[+] N replies collapsed`.
  - **Clamped Indentation**: Maximum 3 visual levels on mobile; displays `↩ replying to @author` breadcrumbs to preserve horizontal readability on compact screens.
  - **OP Stepper**: Floating controller (`▲ 1/X ▼`) jumping directly to Original Poster comments with brief visual highlight.
  - **Link Drawer**: Bottom sheet extracting, deduplicating, and domain-categorizing every external URL referenced in the discussion.
  - **Fold-to-Root**: One-tap toggle to hide all child comments and scan only root perspectives.
- **Deterministic Channels & Mute List**:
  - Built-in channels (`#all`, `#systems`, `#showcase`, `#essays`, `#ask`, `#jobs`, `#saved`).
  - Custom Channel Filter builder with keyword, domain, and score thresholds.
  - 100% on-device negative filtering (mute keywords, domains, and authors).
- **Official Legal & Developer Hub**:
  - In-app Terms of Service, Privacy Policy, and developer contact options under the Settings modal.
- **Web App & PWA Edition**:
  - In addition to this native Android client, the app is also live as an installable Progressive Web App (PWA) at [https://hackernewsbypg.netlify.app/](https://hackernewsbypg.netlify.app/).

---

## 📱 Tech Stack & Architecture

- **Runtime**: Native Android (API 26+) via [Capacitor 8](https://capacitorjs.com/)
- **Frontend Framework**: [React 19](https://react.dev/) + [Vite 6](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with custom OLED color tokens
- **Data Layer**:
  - Firebase Hacker News REST API (progressive streamed trees & live story IDs)
  - Algolia HN Search API (instant full-text search)
  - `idb-keyval` (IndexedDB) for client-side persistence of channels, bookmarks, read states, and mute rules
- **Hardware & Device Integrations**:
  - `@capacitor/browser`: Chrome Custom Tabs for external articles
  - `@capacitor/clipboard`: Quick-copy HN discussion URLs and article links
  - `@capacitor/app`: Native Android hardware back-button handling
  - `@capacitor/status-bar`: Edge-to-edge system window insets (`pt-[env(safe-area-inset-top,0px)]`)

---

## 🛠️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v20+ recommended)
- [Java Development Kit (JDK)](https://adoptium.net/) (JDK 17)
- [Android Studio / Android SDK](https://developer.android.com/studio) with command-line tools & ADB

### Local Development (Web View)
```bash
# Clone the repository
git clone https://github.com/Prashantispacific/hacker-news-app.git
cd hacker-news-app

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

### Build & Deploy to Connected Android Device
```bash
# 1. Compile web assets & bundle production JavaScript
npm run build

# 2. Sync web assets with Capacitor Android native project
npm run cap:sync

# 3. Build native debug APK using Gradle wrapper
npm run android:build

# 4. Install directly to connected device over USB/ADB
npm run android:install
```

Or trigger full build and install in one step:
```bash
npm run android:build && npm run android:install
```

The compiled APK will be located at:
`android/app/build/outputs/apk/debug/app-debug.apk`

---

## 📂 Repository Structure

```
├── android/                    # Native Android project (Gradle, manifests, icons, splash)
│   ├── app/
│   │   ├── src/main/AndroidManifest.xml  # Deep linking & permission configurations
│   │   └── src/main/java/com/hackernews/pg/MainActivity.java
│   └── build.gradle            # Gradle configuration (JDK 17 target)
├── scripts/
│   └── generate_android_assets.py # Custom generator for mipmap icons & splash screens
├── src/
│   ├── components/
│   │   ├── channels/           # Channel selector pill bar & custom filter builder
│   │   ├── common/             # Top bar header, bottom navigation bar
│   │   ├── discussion/         # Progressive comment trees, OP stepper, link drawer
│   │   ├── reader/             # Article reader & publisher restriction fallback
│   │   ├── search/             # Algolia full-text search modal
│   │   ├── settings/           # Legal pages, mute rules, display toggles
│   │   └── stories/            # Story feeds & list items
│   ├── hooks/                  # Custom React hooks (useThread, useStories, useBookmarks...)
│   ├── services/               # hnFirebase.ts (progressive streaming) & hnAlgolia.ts
│   ├── utils/                  # browser.ts (Chrome Custom Tabs), textParser.ts
│   ├── App.tsx                 # Core app orchestrator & Android back-gesture handler
│   └── index.css               # Tailwind CSS v4 directives & safe area styles
├── capacitor.config.ts         # Capacitor project configuration
└── package.json
```

---

## 📄 License & Disclaimer

This project is an independent open-source client inspired by Paul Graham and the Hacker News community. It is not officially affiliated with or endorsed by Y Combinator. All Hacker News content is provided via the official [Hacker News Firebase API](https://github.com/HackerNews/API).

Code released under the [MIT License](LICENSE).

---

## 📬 Contact & Feedback

- **Developer**: Prashant ([@Prashantispacific](https://github.com/Prashantispacific))
- **Issues & Feedback**: [GitHub Issues](https://github.com/Prashantispacific/hacker-news-app/issues)
