# AGENTS.md — Contributor & AI Agent Guide

Welcome to the **Hacker News by pg** repository. This document serves as the architectural and design guide for AI agents and human engineers developing or modifying this codebase.

---

## 🧭 Project Overview

**Hacker News by pg** is an ultra-minimalist, high-signal, high-performance Hacker News single-page web application (PWA) with zero server-side infrastructure, inspired by Paul Graham's original aesthetic elevated to modern OLED standards.

### Core Philosophy
1. **Zero UI Slop**: No boxy cards, drop shadows, or loud badges. Whitespace (20px–24px) is the separator.
2. **OLED Comfort**: Default halation-safe `#0A0A0A` background with a user-toggleable `#000000` True Black mode.
3. **Typography**: Sans-serif (`Inter`, `system-ui`) for titles/body, clean monospace (`JetBrains Mono`) for metadata, and editorial serif (`Newsreader`) for long-form reading.
4. **Discussion Signal Suite**: 1px vertical guide rails with inline count branch collapsing, OP Stepper, Link Drawer, and Fold-to-Root.
5. **Zero Backend**: 100% static client deployable to Netlify or Vercel. All channels, bookmarks, and mute rules persist locally via IndexedDB (`idb-keyval`).

---

## 📂 Codebase Architecture

```
Hacker News ReDesign/
├── index.html                  # HTML entry point (fonts, meta, viewport-fit=cover)
├── vite.config.ts              # Vite 6 config with @tailwindcss/vite & vite-plugin-pwa
├── vercel.json                 # Vercel SPA rewrites & security headers
├── netlify.toml                # Netlify SPA redirects & security headers
├── public/
│   └── favicon.svg             # Minimalist SVG app icon
└── src/
    ├── main.tsx                # React 19 root + PWA service worker registration
    ├── App.tsx                 # Root layout, split-pane desktop, tab manager
    ├── index.css               # Tailwind CSS v4 directives + custom OLED tokens
    ├── types/
    │   └── index.ts            # Story, CommentNode, Channel, MuteRules, etc.
    ├── config/
    │   ├── constants.ts        # API endpoints, cache limits, storage keys
    │   └── channels.ts         # Built-in channels (#all, #systems, #showcase, etc.)
    ├── services/
    │   ├── hnFirebase.ts       # Firebase HN API (items, story IDs, recursive trees)
    │   ├── hnAlgolia.ts        # Algolia HN API (full-text search & typeahead)
    │   └── storage.ts          # idb-keyval + localStorage persistent store
    ├── hooks/
    │   ├── useStories.ts       # Feed pagination, channel matching, mute filtering
    │   ├── useThread.ts        # Comment tree state, branch folding, OP stepper
    │   ├── useChannels.ts      # Custom and built-in channel manager
    │   ├── useMuteList.ts      # Negative filtering manager (keywords, domains, authors)
    │   ├── useBookmarks.ts     # Saved stories manager
    │   ├── useReadState.ts     # Visited stories tracker (dimmed titles)
    │   ├── useReader.ts        # Distraction-free article reader state & prefs
    │   ├── useKeyboard.ts      # Desktop hotkeys ('j', 'k', 'o', 'c', 'r', '/')
    │   └── useSwipe.ts         # Mobile touch gesture detection
    ├── components/
    │   ├── common/
    │   │   ├── Header.tsx      # Top bar (logo, search trigger, settings, tabs)
    │   │   └── BottomNav.tsx   # Mobile floating pill bar (Feed / Thread / Page)
    │   ├── channels/
    │   │   ├── ChannelBar.tsx  # Scrollable pill channel selector
    │   │   └── AddChannelModal.tsx # Custom channel filter rule builder
    │   ├── stories/
    │   │   ├── StoryList.tsx   # Story feed with mute counter & empty states
    │   │   ├── StoryItem.tsx   # Story row with direct original URL & metadata
    │   │   └── StorySkeleton.tsx # CSS shimmer loader
    │   ├── discussion/
    │   │   ├── ThreadView.tsx  # Comment tree container & signal toolbar
    │   │   ├── CommentItem.tsx # 1px guide rail & recursive tree component
    │   │   ├── OpStepper.tsx   # OP comment jump controller
    │   │   └── LinkDrawer.tsx  # Thread external URLs bottom sheet / drawer
    │   ├── reader/
    │   │   └── ReaderView.tsx  # Direct original page viewer & self-post reader
    │   ├── search/
    │   │   └── SearchBar.tsx   # Instant Algolia full-text search modal
    │   └── settings/
    │       └── SettingsModal.tsx # Mute rules, OLED display toggles, data export
    └── utils/
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

---

## 🛠️ Development & Build Commands

```bash
# Run local Vite development server
npm run dev

# Run TypeScript check & production build
npm run build

# Preview production build locally
npm run preview
```

---

## 🔌 Agent Skills Installed

The repository has access to the following skills in `.agents/skills/`:
- **`vercel-react-best-practices`**: React 19 and Next.js performance and composition guidelines.
- **`web-design-guidelines`**: UX, accessibility, and clean interface standards.
- **`ui-taste` & `ios-design`**: Anti-UI-slop craft principles and mobile ergonomics.
- **`frontend-design`**: Restrained, memorable design aesthetics.
- **`agent-browser`**: Browser automation and verification tools.
