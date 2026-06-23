# Bedtime Checklist — Fire TV (VegaOS)

A bedtime routine checklist app for Fire TV Stick 4K Select (VegaOS) with a companion web app for parent phone control.

## Tech Stack

- **TV App**: React Native for Vega (RN 0.72), targeting VegaOS (Linux-based, NOT Android)
- **Backend**: Firebase Realtime Database for real-time sync
- **Companion Web App**: React + Vite (in `web-companion/`), accessed from parent's phone browser
- **Language**: TypeScript throughout

## Architecture

- `FamilyContext` (src/context/FamilyContext.tsx) manages ALL app state and Firebase subscriptions
- Simple state-based navigation in App.tsx (no react-navigation dependency)
- Firebase paths: `families/{familyId}/` for config, `tonight/{familyId}/{date}/` for daily progress, `history/{familyId}/{childId}/` for reward history
- Family pairing: 6-char alphanumeric code + 4-digit PIN

## Key Design Decisions

- **No react-navigation**: Fewer dependencies = fewer Vega compatibility issues. Navigation is a simple switch on `nav.screen` in App.tsx
- **Firebase JS SDK (not @react-native-firebase)**: Pure JS works on any RN platform without native module compatibility concerns
- **Date rollover at 4 AM**: `getTodayKey()` in database.ts treats hours before 4 AM as the previous day, so late-night usage stays on the same bedtime session
- **TV focus management**: All interactive components use Pressable with onFocus/onBlur + Animated scale for D-pad navigation feedback
- **Theme**: "Starry Night" calming palette — deep blues, soft purples, warm gold. Bedtime-appropriate (not stimulating)

## Features

- Configurable 2-4 children with independent parallel checklists
- Reward wheel: vertical scroller animation (~4.5s) that decelerates and lands on random reward
- Dashboard: streak counter, reward history, per-child stats
- In-app settings + phone companion web app for parent control
- Default checklist items and rewards seeded on first setup

## Build & Run

```bash
# TV app
npm install
npx react-native build-vega

# Companion web app
cd web-companion && npm install && npm run dev
```

## Setup Checklist — Current Progress

### DONE
- [x] Node.js installed (v22.20.0, npm 10.9.3)
- [x] All TV app source code scaffolded (25 files — types, theme, Firebase layer, context, components, screens, App.tsx)
- [x] Companion web app scaffolded (web-companion/ — Vite + React + Firebase)
- [x] Project config files (package.json, manifest.toml, tsconfig, metro, babel, .gitignore)

### TODO — Dev Environment
- [ ] Install Kiro IDE (https://kiro.dev/downloads/) — needed because Vega Studio doesn't support Windows 64-bit
- [ ] Install Vega Studio extension in Kiro — download .vsix from Open VSX Registry, then Ctrl+Shift+P → "Extensions: Install from VSIX..."
- [ ] Install Vega CLI via the Vega SDK installer inside Kiro (https://developer.amazon.com/docs/vega/0.22/install-vega-sdk.html)
- [ ] Enable Developer Mode on Fire TV Stick 4K Select (https://developer.amazon.com/docs/vega/0.22/developer-mode.html)

### TODO — Firebase
- [ ] Create Firebase project at https://console.firebase.google.com
- [ ] Enable Realtime Database (start in test mode)
- [ ] Add a Web app in Firebase Console → Project Settings → copy config values
- [ ] Paste Firebase config into src/firebase/config.ts (TV app)
- [ ] Paste Firebase config into web-companion/src/firebase.ts (companion app)

### TODO — Build & Test
- [ ] Run `npm install` in project root
- [ ] Run `npm install` in web-companion/
- [ ] Generate Vega project template via CLI to get any missing Vega-specific native files, then merge our src/ code into it
- [ ] Build TV app: `npx react-native build-vega`
- [ ] Test on Vega Virtual Device (simulator) or physical Fire TV Stick
- [ ] Test companion web app: `cd web-companion && npm run dev` → open on phone browser

### BLOCKED / KNOWN ISSUES
- Vega Studio VS Code extension does NOT work on Windows 64-bit — must use Kiro IDE or WSL2+Ubuntu instead
- The Vega CLI also requires macOS or Ubuntu natively — may need WSL2 if Kiro alone isn't sufficient for CLI tools
- Firebase config files (src/firebase/config.ts, web-companion/src/firebase.ts) still have placeholder values — must be filled in before the app will connect
