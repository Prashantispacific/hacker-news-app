# Hacker News by pg

> A minimalist, high-signal, high-breathing-room Hacker News OLED PWA with zero runtime backend, inspired by Paul Graham's original vision.

Built with **React 19**, **TypeScript**, **Tailwind CSS v4**, and **Vite 6**.

---

## ✨ Features

- **Extreme OLED Minimalism**: Halation-safe `#0A0A0A` canvas with `#000000` True Black toggle, whitespace-driven rhythm (20px–24px padding), and crisp monospace metadata (`JetBrains Mono`).
- **Deterministic Channel Knobs**:
  - `#all`, `#systems`, `#showcase`, `#essays`, `#ask`, `#jobs`, `#saved`.
  - Custom Channel Filter builder with keyword, domain, and score filtering.
- **Client-Side Negative Filtering**:
  - Global mute lists for keywords, domains, and authors running 100% locally on-device.
- **Discussion Signal Suite**:
  - **1px Vertical Guide Rails**: Click rail or header to fold entire branches into `[+] N replies collapsed`.
  - **Clamped Indentation**: Max 4 visual levels on mobile; displays `↩ replying to @author` breadcrumb so content is never squeezed off-screen.
  - **OP Stepper**: Floating `▲ 1 of X ▼` controller with smooth scroll and brief highlight.
  - **Link Drawer**: Bottom sheet / side panel automatically extracting and deduplicating every external URL mentioned across the thread.
  - **Fold-to-Root**: One-tap toggle to review only top-level root perspectives.
- **Distraction-Free Reader Mode**:
  - Clean text and markdown reader powered by `r.jina.ai` with CORS support and story summary fallbacks.
  - Reading Comfort panel: Font size slider (14px–26px), line-height, width, and warm amber/sepia tone toggle.
  - Top scroll reading progress indicator.
- **Ergonomic One-Handed Mobile Navigation**:
  - Sticky bottom pill bar (`Feed` | `Reader` | `Thread`) with unread comment badge and notch safe-area handling.
  - Horizontal swipe gesture navigation.
- **Desktop Split-Pane Layout**:
  - Responsive two-column view on `≥1024px`: feed list on the left, reader or discussion on the right.
- **Full WAI-ARIA TreeView & Keyboard Shortcuts**:
  - `j` / `k`: Next / Previous story
  - `o`: Open original article
  - `c`: Open discussion tree
  - `r`: Open reader mode
  - `/`: Instant full-text Algolia search
  - `f`: Toggle fold-to-root
  - `Esc`: Dismiss modal or link drawer
- **Offline & Zero Backend**:
  - PWA Service Worker caching HN API requests and static assets for seamless offline reading.
  - IndexedDB key-value persistence for custom channels, bookmarks, and mute rules.
  - Ready for Netlify and Vercel deployment with zero runtime dependencies.

---

## 🚀 Getting Started

### Development
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

### Deploy to Vercel or Netlify
This repository includes `vercel.json` and `netlify.toml` for 1-click zero-config static hosting.
