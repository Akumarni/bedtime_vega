# 🌙 Bedtime Checklist

A bedtime routine app for **Fire TV Stick 4K Select** (VegaOS) that makes winding down fun — with independent checklists for each child, a reward wheel animation, and a companion web app parents control from their phone.

![Platform](https://img.shields.io/badge/platform-VegaOS%20(Fire%20TV)-232F3E?logo=amazon)
![Framework](https://img.shields.io/badge/framework-React%20Native%200.72-61DAFB?logo=react)
![Backend](https://img.shields.io/badge/backend-Firebase%20Realtime%20DB-FFCA28?logo=firebase)
![Language](https://img.shields.io/badge/language-TypeScript-3178C6?logo=typescript)

---

## Features

### For Kids (TV App)
- **Independent parallel checklists** — 2–4 children each track their own bedtime tasks without blocking each other
- **Reward wheel** — a vertical scroller animation (~4.5s) that decelerates and lands on a random reward when all items are checked off
- **Dashboard** — streak counter, total rewards, reward breakdown, and recent night history per child
- **Calming "Starry Night" theme** — deep blues, soft purples, and warm gold accents designed to avoid overstimulation at bedtime

### For Parents (Phone Companion)
- **No app install needed** — open the companion web app in any phone browser
- **Real-time sync** — changes to checklist items, rewards, or children appear on the TV instantly
- **PIN-protected** — 4-digit PIN keeps kids out of the settings
- **Manage everything** — add/remove children, customize checklist items, edit reward pool, view reward history

---

## Architecture

```
bedtime_vega/
├── App.tsx                          # Root component + screen router
├── src/
│   ├── context/FamilyContext.tsx     # All state management + Firebase subscriptions
│   ├── firebase/
│   │   ├── config.ts                # Firebase project config (fill in your values)
│   │   └── database.ts             # All CRUD operations + real-time listeners
│   ├── components/
│   │   ├── FocusableButton.tsx      # TV D-pad focus with animated scale
│   │   ├── ChildProfile.tsx         # Child card with progress bar
│   │   ├── ChecklistItemRow.tsx     # Animated checkbox row
│   │   ├── RewardWheel.tsx          # Vertical scroller reward animation
│   │   └── ProgressBar.tsx          # Animated progress indicator
│   ├── screens/
│   │   ├── HomeScreen.tsx           # Child selection grid
│   │   ├── ChecklistScreen.tsx      # Per-child checklist
│   │   ├── RewardWheelScreen.tsx    # Reward animation + result
│   │   ├── DashboardScreen.tsx      # Stats and history
│   │   ├── SettingsScreen.tsx       # In-app settings (children, items, rewards)
│   │   └── SetupScreen.tsx          # First-time onboarding wizard
│   ├── theme/index.ts               # Color palette, spacing, defaults
│   └── types/index.ts               # TypeScript interfaces
├── web-companion/                   # Parent phone companion (Vite + React)
│   └── src/
│       ├── App.tsx                  # Full companion app with all management pages
│       └── firebase.ts             # Firebase config + helpers
├── manifest.toml                    # Vega app manifest
└── package.json
```

### Key Design Decisions

| Decision | Why |
|---|---|
| **No react-navigation** | Simple state-based routing in App.tsx — fewer dependencies, fewer Vega compatibility risks |
| **Firebase JS SDK** (not @react-native-firebase) | Pure JS works on any RN platform without native module concerns |
| **4 AM date rollover** | `getTodayKey()` treats hours before 4 AM as the previous day so late-night use stays on the same bedtime session |
| **6-char family code + PIN** | Simple pairing between TV and phone — no user accounts or OAuth needed |

---

## Getting Started

### Prerequisites

- **Node.js 18+** and npm
- **Firebase project** with Realtime Database enabled
- **Vega Developer Tools** for building/deploying to Fire TV (requires macOS, Ubuntu, or WSL2 on Windows)

### 1. Clone and Install

```bash
git clone https://github.com/Akumarni/bedtime_vega.git
cd bedtime_vega

# TV app dependencies
npm install

# Companion web app dependencies
cd web-companion && npm install
```

### 2. Configure Firebase

1. Create a project at [Firebase Console](https://console.firebase.google.com)
2. Enable **Realtime Database** (start in test mode)
3. Add a **Web app** → copy the config object
4. Paste your config into **both** files:
   - `src/firebase/config.ts` (TV app)
   - `web-companion/src/firebase.ts` (companion web app)

### 3. Run the Companion Web App

```bash
cd web-companion
npm run dev
```

Opens at `http://localhost:3000` — access it from your phone on the same network.

### 4. Build and Deploy TV App

```bash
# Build the Vega package
npx react-native build-vega

# Run on simulator or device
vega run
```

> **Windows users:** Vega Studio and CLI require macOS or Ubuntu. Use [WSL2 with Ubuntu](https://learn.microsoft.com/en-us/windows/wsl/install) or [Kiro IDE](https://kiro.dev/downloads/) as a workaround.

---

## Firebase Data Structure

```
families/{familyId}/
  info/                    # Family name + PIN
  children/{childId}/      # Name, avatar, order
  checklistItems/{itemId}/ # Title, icon, order
  rewards/{rewardId}/      # Title, icon

tonight/{familyId}/{date}/{childId}/
  items/{itemId}: boolean  # Per-item completion
  allComplete: boolean
  rewardWon: string

history/{familyId}/{childId}/{entryId}/
  date, rewardTitle, rewardIcon, timestamp
```

---

## Tech Stack

- **TV App**: React Native for Vega (RN 0.72) targeting VegaOS
- **Companion Web App**: React 18 + Vite 5
- **Backend**: Firebase Realtime Database
- **Language**: TypeScript throughout

---

## License

MIT
