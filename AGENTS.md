# AGENTS.md — Contributor & AI Agent Guide

Welcome to the **HN by PG (Android App)** repository. This document serves as the architectural and design guide for AI agents and human engineers developing or modifying this codebase.

---

## 🧭 Project Overview

**HN by PG** is an ultra-minimalist, high-signal, high-performance native Android application for Hacker News built with React 19, Capacitor 8, TypeScript, and Tailwind CSS v4, inspired by Paul Graham's original aesthetic elevated to modern OLED standards.

### Core Philosophy
1. **Zero UI Slop**: No boxy cards, drop shadows, or loud badges. Whitespace (20px–24px) is the separator.
2. **OLED Comfort**: Default halation-safe `#0A0A0A` background with a user-toggleable `#000000` True Black mode.
3. **Typography**: Sans-serif (`Inter`, `system-ui`) for titles/body, clean monospace (`JetBrains Mono`) for metadata, and editorial serif (`Newsreader`) for long-form reading.
4. **Discussion Signal Suite**: 1px vertical guide rails with inline count branch collapsing, OP Stepper, Link Drawer, Fold-to-Root, and Real-Time Progressive Comment Streaming.
5. **Zero Backend**: Pure client-side architecture directly connecting to Hacker News Firebase and Algolia APIs. Channels, bookmarks, and mute rules persist locally via IndexedDB (`idb-keyval`).
6. **Native Android Integration**: Deep linking (`https://news.ycombinator.com/*`), edge-to-edge safe area insets, Chrome Custom Tabs via `@capacitor/browser`, native clipboard support via `@capacitor/clipboard`, and Android back-gesture navigation.

---

## 📂 Codebase Architecture

```
Hacker News ReDesign - Android App/
├── index.html                  # HTML entry point (fonts, meta, viewport-fit=cover)
├── vite.config.ts              # Vite config with @tailwindcss/vite & vite-plugin-pwa
├── capacitor.config.ts         # Capacitor 8 native bridge configuration (appId: com.hackernews.pg)
├── android/                    # Complete native Android Gradle project
│   ├── app/
│   │   ├── src/main/AndroidManifest.xml  # Intent filters (https://news.ycombinator.com, hn://)
│   │   ├── src/main/java/com/hackernews/pg/MainActivity.java # Edge-to-edge safe area bridge
│   │   └── src/main/res/       # Adaptive icons, mipmaps, styles, and splash drawables
│   └── build.gradle            # Root Gradle configuration (JDK 17 source/target compatibility)
├── scripts/
│   └── generate_android_assets.py # Vector icon & splash generator script
├── public/
│   ├── favicon.svg             # Minimalist SVG HN logo
│   └── manifest.webmanifest    # PWA web manifest
└── src/
    ├── main.tsx                # React 19 root
    ├── App.tsx                 # Root layout, tab manager, Android back button handler
    ├── index.css               # Tailwind CSS v4 directives + custom OLED tokens
    ├── types/
    │   └── index.ts            # Story, CommentNode, Channel, MuteRules, etc.
    ├── config/
    │   ├── constants.ts        # API endpoints, cache limits, storage keys
    │   └── channels.ts         # Built-in channels (#all, #systems, #showcase, etc.)
    ├── services/
    │   ├── hnFirebase.ts       # Firebase HN API + Progressive Comment Streaming
    │   ├── hnAlgolia.ts        # Algolia HN API (full-text search & typeahead)
    │   └── storage.ts          # idb-keyval + localStorage persistent store
    ├── hooks/
    │   ├── useStories.ts       # Feed pagination, channel matching, mute filtering
    │   ├── useThread.ts        # Comment tree state, branch folding, progressive updates, OP stepper
    │   ├── useChannels.ts      # Custom and built-in channel manager
    │   ├── useMuteList.ts      # Negative filtering manager (keywords, domains, authors)
    │   ├── useBookmarks.ts     # Saved stories manager
    │   ├── useReadState.ts     # Visited stories tracker (dimmed titles)
    │   ├── useReader.ts        # Distraction-free article reader state & prefs
    │   ├── useKeyboard.ts      # Desktop hotkeys ('j', 'k', 'o', 'c', 'r', '/')
    │   └── useSwipe.ts         # Mobile touch gesture detection
    ├── components/
    │   ├── common/
    │   │   ├── Header.tsx      # Top bar (logo, search trigger, settings, tabs, safe area insets)
    │   │   └── BottomNav.tsx   # Mobile floating pill bar (Feed / Thread / Page)
    │   ├── channels/
    │   │   ├── ChannelBar.tsx  # Scrollable pill channel selector
    │   │   └── AddChannelModal.tsx # Custom channel filter rule builder
    │   ├── stories/
    │   │   ├── StoryList.tsx   # Story feed with mute counter & empty states
    │   │   └── StoryItem.tsx   # Story row with direct original URL & metadata
    │   ├── discussion/
    │   │   ├── ThreadView.tsx  # Comment tree container & signal toolbar
    │   │   ├── CommentItem.tsx # 1px guide rail & recursive tree component
    │   │   ├── OpStepper.tsx   # OP comment jump controller
    │   │   └── LinkDrawer.tsx  # Thread external URLs bottom sheet / drawer
    │   ├── reader/
    │   │   └── ReaderView.tsx  # Direct page viewer, publisher restriction banner, Chrome Custom Tab
    │   ├── search/
    │   │   └── SearchBar.tsx   # Instant Algolia full-text search modal
    │   └── settings/
    │       └── SettingsModal.tsx # Mute rules, OLED toggles, Privacy Policy, Terms, Contact
    └── utils/
        ├── browser.ts          # Chrome Custom Tabs on Android / Window open on web
        ├── cn.ts               # Class merging (clsx + tailwind-merge)
        ├── timeAgo.ts          # Relative timestamp & domain extractors
        ├── textParser.ts       # Comment HTML sanitizer & code block formatter
        ├── linkExtractor.ts    # URL extraction from comment trees
        └── channelMatcher.ts   # Deterministic story channel matching engine
```

---

## 🎨 UI & Design System Conventions

When making UI adjustments, strictly maintain these principles:
- **Backgrounds**: Use `bg-black` or `bg-[#0a0a0a]`. Avoid generic grays or blue-tinted card backgrounds.
- **Borders**: Keep borders subtle: `border-white/[0.06]` or `border-white/[0.08]`.
- **Accent Color**: Hacker News Orange (`#ff6600`), used sparingly for badges, active states, and focus indicators.
- **Links**: `#6cb6ff` with subtle underlines.
- **Monospace Metadata**: Always apply `font-mono-meta` (`JetBrains Mono`) for domains, scores, times, and counts.
- **Comment Tree Rails**:
  - The vertical rail is 1px: `w-[1px] bg-white/[0.08]`.
  - On hover: brighten to `bg-[#ff6600]/70`.
  - Clicking any rail or header collapses the branch into `[+] N replies collapsed`.
- **Clamped Indentation**: Never indent deeper than 4 levels on desktop or 3 on mobile. Deeper levels must show `↩ replying to @author` to avoid horizontal layout breaking on mobile.
- **Safe Area Insets**: Always apply `pt-[env(safe-area-inset-top,0px)]` and `pb-[env(safe-area-inset-bottom,0px)]` on full-bleed views and fixed headers to prevent overlapping with status bars or camera cutouts.

---

## 🛠️ Development & Build Commands

```bash
# Run local Vite development server
npm run dev

# Run TypeScript check & production build
npm run build

# Synchronize web assets to native Android project
npm run cap:sync

# Build native Android debug APK
npm run android:build

# Install debug APK to connected Android device via ADB
npm run android:install
```
