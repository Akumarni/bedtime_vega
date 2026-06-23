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
- Checklist items are stored **per child** at `families/{familyId}/children/{childId}/checklistItems/`
- Family pairing: 6-char alphanumeric code + 4-digit PIN

## Key Design Decisions

- **No react-navigation**: Fewer dependencies = fewer Vega compatibility issues. Navigation is a simple switch on `nav.screen` in App.tsx
- **Firebase JS SDK (not @react-native-firebase)**: Pure JS works on any RN platform without native module compatibility concerns
- **No AsyncStorage**: Replaced with Firebase-based device config (AsyncStorage native module not available on VegaOS). Family ID stored at `devices/bedtime_tv_device` in Firebase
- **Date rollover at 4 AM**: `getTodayKey()` in database.ts treats hours before 4 AM as the previous day, so late-night usage stays on the same bedtime session
- **TV focus management**: TouchableOpacity with onFocus/onBlur + TVFocusGuideView from `@amazon-devices/react-native-kepler` for D-pad navigation
- **No Animated API**: VegaOS compatibility — use static `transform: [{ scale }]` in focused styles instead
- **No BackHandler**: Not available on VegaOS — navigation uses goBack() from context
- **Theme**: "Starry Night" calming palette — deep blues, soft purples, warm gold. Font sizes scaled up for TV (xs=28, sm=36, md=44, lg=56, xl=72, xxl=96, hero=128)

## VegaOS Compatibility Rules

When writing code for this project, follow these patterns (learned from debugging on real device):

- **Use `TouchableOpacity`**, NOT `Pressable` — Pressable may not work on VegaOS
- **Use `TVFocusGuideView`** from `@amazon-devices/react-native-kepler` to wrap focusable areas
- **Use `hasTVPreferredFocus`** prop on the default focus target per screen
- **App registration** must use `app.json` name: `com.bedtime.checklist.main` (matches manifest.toml component ID)
- **No native modules** beyond what Vega provides — `@react-native-async-storage/async-storage` caused crash (signal 6, "cannot find library")
- **The Vega template** package.json uses `@amazon-devices/react-native-kepler` and `@amazon-devices/kepler-cli-platform` — these are required
- **`kepler` section** in package.json is required: `{ "projectType": "application", "appName": "BedtimeChecklist", "targets": ["tv"] }`

## Features

- Configurable 2-4 children with independent parallel checklists (per-child checklist items)
- Reward wheel: vertical scroller animation that decelerates and lands on random reward
- Dashboard: streak counter, reward history, per-child stats
- In-app settings + phone companion web app for parent control
- Default checklist items and rewards seeded on first setup

## Build & Run

### TV App (must be done on Ubuntu — VPS or Kali laptop with Vega SDK)

```bash
# On the VPS (vega@155.138.226.194), the build environment is at ~/vega_template
# Our source code gets copied from the git repo into the Vega template structure
cd ~/vega_template
npx react-native build-vega --build-type Release

# Output: build/armv7-release/bedtimechecklist_armv7.vpkg (for Fire TV Stick)

# Deploy to Fire TV over network:
vega device connect <FIRE_TV_IP>:5555
vega device install-app -d <DEVICE_ID> --packagePath build/armv7-release/bedtimechecklist_armv7.vpkg
vega device launch-app -d <DEVICE_ID> --appName com.bedtime.checklist.main
```

### Companion Web App

```bash
cd web-companion && npm install && npm run dev    # Local dev
cd web-companion && npm run build && firebase deploy --only hosting  # Deploy to https://bedtime.jg-it.net
```

## Setup Checklist — Current Progress

### DONE
- [x] Node.js installed on Windows dev machine (v22.20.0)
- [x] All TV app source code written and updated for VegaOS compatibility
- [x] Companion web app working and deployed to Firebase Hosting: https://bedtime.jg-it.net
- [x] Firebase project created (bedtime-checklist-2ee83) with Realtime Database
- [x] Firebase config wired up via .env files (keys NOT in source code)
- [x] Realtime Database security rules deployed
- [x] Git repo synced to GitHub: https://github.com/Akumarni/bedtime_vega
- [x] Developer Mode enabled on Fire TV Stick 4K Select
- [x] Vega SDK installed on Ubuntu VPS (vega@155.138.226.194, SDK 0.23.8128, CLI 1.3.2)
- [x] Vega SDK also being installed on Kali Linux laptop for local device deployment
- [x] Vega project template generated and merged with source code (at ~/vega_template on VPS)
- [x] Successful .vpkg builds (armv7, x86_64, aarch64)
- [x] Test family seeded in Firebase (code: TEST01, PIN: 1234, children: Emma & Jack)
- [x] Companion web app tested end-to-end — per-child checklist management working
- [x] Removed AsyncStorage (crashed on VegaOS) — replaced with Firebase device config
- [x] Rewrote all components: Pressable→TouchableOpacity, added TVFocusGuideView, removed BackHandler, removed Animated API
- [x] App installs on Fire TV Stick successfully

### CURRENT — Debugging TV App Launch
- [ ] App installs but crashes or shows errors on launch — seeing "resource not found" in logs
- [ ] Need to stream device logs to diagnose: `vega device start-log-stream -d <DEVICE_ID> 2>&1 | grep -iE "bedtime|checklist|error|crash|fatal|resource"`
- [ ] May need to check if Firebase JS SDK works on VegaOS RN runtime, or if `process.env` doesn't work for config loading
- [ ] The Firebase config in the TV app uses `process.env.FIREBASE_*` which likely resolves to empty strings at runtime since RN doesn't load .env files automatically — may need to hardcode or use a different env loading approach

### TODO — After App Launches
- [ ] Test full flow on Fire TV: setup wizard → checklist → reward wheel → dashboard
- [ ] Test real-time sync between TV app and companion web app
- [ ] Remove test family data before production use
- [ ] Clean up VPS file server (port 9090 was temporarily opened in UFW)

### Environment Details

**Windows dev machine**: Code editing, companion web app, Firebase management
**Ubuntu VPS** (vega@155.138.226.194): Vega SDK build environment. Build dir: `~/vega_template`. Source synced from git repo at `~/bedtime_vega`
**Kali Linux laptop**: Vega SDK for local device deployment (same network as Fire TV Stick). Vega SDK install may need `TMPDIR=/home/vendas/tmp` since /tmp is only 1.8GB
**Fire TV Stick 4K Select**: Target device, Developer Mode enabled, connected over network via `vega device connect <IP>:5555`

### Build & Deploy Workflow
1. Edit code on Windows, commit & push to GitHub
2. On VPS: `cd ~/bedtime_vega && git pull`
3. On VPS: Copy source into template: `cd ~/vega_template && rm -rf src App.tsx index.js app.json && cp -r ~/bedtime_vega/src . && cp ~/bedtime_vega/App.tsx ~/bedtime_vega/index.js ~/bedtime_vega/app.json .`
4. On VPS: Build: `npx react-native build-vega --build-type Release`
5. Download vpkg to Kali laptop (or serve from VPS port 9090 with UFW opened temporarily)
6. On Kali laptop: `vega device install-app -d <DEVICE_ID> --packagePath ~/bedtimechecklist_armv7.vpkg`

### BLOCKED / KNOWN ISSUES
- Vega SDK does NOT support Windows or WSL — requires native macOS or Ubuntu only
- Vega Studio extension does NOT work on Windows 64-bit, not even in Kiro IDE
- VPS /tmp needs TMPDIR override for SDK install on Kali laptop (only 1.8GB in /tmp)
- Firebase config via process.env likely broken at runtime — high priority fix needed
