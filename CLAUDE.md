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
- Back button handled via `useKeplerBackHandler` from `@amazon-devices/react-native-kepler`
- Screen components use `key={screenKey}` for clean focus reset on navigation
- Firebase paths: `families/{familyId}/` for config, `tonight/{familyId}/{date}/` for daily progress, `history/{familyId}/{childId}/` for reward history
- Checklist items stored per child at `families/{familyId}/children/{childId}/checklistItems/`
- Rewards stored per child at `families/{familyId}/children/{childId}/rewards/`
- Family pairing: 6-char alphanumeric code + 4-digit PIN
- QR code on TV home screen encodes `https://bedtime.jg-it.net?code={familyId}` for quick phone pairing

## Key Design Decisions

- **No react-navigation**: Fewer dependencies = fewer Vega compatibility issues. Navigation is a simple switch on `nav.screen` in App.tsx
- **Firebase JS SDK (not @react-native-firebase)**: Pure JS works on any RN platform without native module compatibility concerns
- **No AsyncStorage**: Replaced with Firebase-based device config (AsyncStorage native module not available on VegaOS). Family ID stored at `devices/bedtime_tv_device` in Firebase
- **Date rollover at 4 AM**: `getTodayKey()` in database.ts treats hours before 4 AM as the previous day, so late-night usage stays on the same bedtime session
- **TV focus management**: TouchableOpacity with onFocus/onBlur + TVFocusGuideView from `@amazon-devices/react-native-kepler` for D-pad navigation. Every screen sets `hasTVPreferredFocus` on the first interactive element
- **No Animated API**: VegaOS compatibility — use static styles for focused states instead
- **No BackHandler**: Use `useKeplerBackHandler` from Kepler SDK instead — intercepts remote back button, navigates back through screens, does nothing on home screen
- **No TextInput**: VegaOS has no virtual keyboard. All text input uses custom `TVKeyboard` (QWERTY grid) and `TVNumPad` (0-9 grid) components navigable by D-pad
- **No scale transforms**: VegaOS renders them but they cause overlapping elements on TV. Focus indicated by border color + background change only
- **No shadows/elevation**: Not supported on VegaOS. Use border colors for depth
- **No rgba() colors**: May not be supported on VegaOS. Use solid hex colors
- **No borderRadius shorthand**: VegaOS crashes on `borderRadius`. Use individual corner properties via `rounded()` helper in theme
- **Per-child data model**: Checklist items, rewards, and timers are all independent per child
- **PIN-protected settings**: Settings screen requires family PIN entry so kids can't change configuration
- **Theme**: Deep space palette — dark backgrounds (#080D1F), purple primary (#6C5CE7), gold accent (#FDCB6E), teal success (#00B894). Font sizes scaled for TV viewing distance

## Features

- Configurable 2-4 children with independent parallel checklists (per-child checklist items)
- Independent per-child countdown timers (configurable 5-60 min in settings)
- Manual reward wheel spin with glassmorphic selector frame (transparent glass border, no solid overlay)
- Per-child reward lists (separate from each other)
- Dashboard: streak counter, completion time, tonight's reward, reward history
- Reset Tonight per child (PIN-protected, clears progress + history entry for re-do, only 1 completion tracked per night)
- QR code on home screen for quick companion app pairing (pre-fills family code, user only enters PIN)
- In-app settings (PIN-protected) + phone companion web app for parent control
- Default checklist items and rewards seeded per child on first setup
- Custom app icon (320x180 banner with moon/stars/checklist design)

## Build & Run

### TV App (requires Ubuntu/Kali with Vega SDK)

```bash
# On Kali laptop, the build environment is at ~/vega_template
# Source code gets copied from the git repo into the Vega template structure

# 1. Pull latest code
cd ~/Documents/GitHub/bedtime_vega && git pull

# 2. Copy source into template
cd ~/vega_template && rm -rf src App.tsx index.js app.json && \
  cp -r ~/Documents/GitHub/bedtime_vega/src . && \
  cp ~/Documents/GitHub/bedtime_vega/App.tsx \
     ~/Documents/GitHub/bedtime_vega/index.js \
     ~/Documents/GitHub/bedtime_vega/app.json .

# 3. Build
npx react-native build-vega --build-type Release

# 4. Deploy to Fire TV (must be on same network)
# NOTE: if manifest.toml changed (version, icon, etc.), uninstall first:
#   vega device uninstall-app -d 192.168.1.133:5555 --appName com.bedtime.checklist.main
vega device install-app -d 192.168.1.133:5555 \
  --packagePath ~/vega_template/build/armv7-release/bedtimechecklist_armv7.vpkg
vega device launch-app -d 192.168.1.133:5555 \
  --appName com.bedtime.checklist.main
```

### Companion Web App

```bash
cd web-companion && npm install && npm run dev    # Local dev
cd web-companion && npm run build && firebase deploy --only hosting  # Deploy to https://bedtime.jg-it.net
```

### Vega Template Setup (one-time on new machine)

```bash
# Generate template
vega project generate --template helloWorld --name BedtimeChecklist \
  --packageId com.bedtime.checklist -o ~/vega_template

# Add firebase + qrcode-generator to template package.json dependencies
# Then: cd ~/vega_template && npm install

# Copy app icon into template (must be in assets/image/, NOT assets/raw/)
mkdir -p ~/vega_template/assets/image
cp ~/Documents/GitHub/bedtime_vega/assets/icon_banner.png ~/vega_template/assets/image/icon.png

# Update ~/vega_template/manifest.toml to include:
#   icon = "@image/icon.png"
# Icon format: @image/<filename> maps to assets/image/ directory

# Hermesc symlink (if build fails with "hermesc not found"):
# The binary is at .../build/x86_64-Linux/bin/hermesc but build expects .../build/bin/hermesc
# Create symlink: ln -s .../build/x86_64-Linux/bin .../build/bin
```

## App Icon

- Source files in `assets/`: `icon_banner.png` (320x180, used on Fire TV), `icon_banner_2x.png` (640x360, source), `icon_512.png` (512x512, for stores), `icon_256.png`, `icon_128.png`
- Generated with ImageMagick — crescent moon, stars, checklist progress bar, "Bedtime Checklist" text
- Manifest reference: `icon = "@image/icon.png"` — file must be in `assets/image/` directory in the vega_template
- Fire TV home screen tiles are 320x180 (16:9 landscape) — do NOT use square icons, they get zoomed/cropped
- Do NOT add a border/outline on the icon — the Fire TV launcher clips edges

## Environment Details

**Kali Linux laptop**: Vega SDK (0.23.8128, CLI 1.3.2), Node v22. Build dir: `~/vega_template`. Source at `~/Documents/GitHub/bedtime_vega`. SSH key configured for GitHub push (ed25519, labeled "Kali Laptop" in GitHub).
**Ubuntu VPS** (vega@155.138.226.194): Previous build environment. Build dir: `~/vega_template`. Firebase CLI authenticated here — use for `firebase deploy` commands.
**Fire TV Stick 4K Select**: Target device at 192.168.1.133:5555, Developer Mode enabled.

### Build & Deploy Workflow
1. Edit code on Kali laptop, commit & push to GitHub
2. Copy source into template: see Build & Run above
3. Build: `npx react-native build-vega --build-type Release`
4. Deploy: `vega device install-app` + `vega device launch-app`
5. If manifest changed: uninstall first, then install fresh

### Companion Web App Deploy
Firebase CLI won't authenticate on the Kali laptop (non-interactive terminal issue). Deploy from the VPS or a machine with Firebase CLI logged in:
```bash
cd web-companion && npm run build && firebase deploy --only hosting
```

## Firebase Database Rules

Rules are at `database.rules.json`. Updated with:
- Per-child rewards validation at `families/{familyId}/children/{childId}/rewards/`
- `timerMinutes` validated as number 5-60 on children
- `timerStartedAt` validated as number on tonight progress
- History entries validated with required fields (date, rewardTitle, rewardIcon, timestamp)
- Device config validated with required familyId field
- Tonight progress items validated as booleans

## Status

### DONE
- [x] TV app fully functional on Fire TV Stick 4K Select
- [x] All VegaOS compatibility issues resolved (borderRadius, shadows, TextInput, BackHandler, etc.)
- [x] TV keyboard and numpad for D-pad text input
- [x] Back button on remote navigates within app (doesn't exit)
- [x] Per-child checklists, rewards, and timers
- [x] PIN-protected settings
- [x] Reset Tonight per child (PIN-protected, clears progress + history entry for re-do, only 1 completion tracked per night)
- [x] Reward wheel with manual spin trigger and glassmorphic selector frame (transparent glass border, no solid overlay)
- [x] Dashboard with streak, completion time, tonight's reward, reward history
- [x] QR code on home screen for quick companion app pairing (pre-fills family code, user only enters PIN)
- [x] Companion web app updated for per-child data + QR pre-fill + timer config
- [x] Companion web app deployed to Firebase Hosting
- [x] Custom app icon (320x180 banner with moon/stars/checklist design)
- [x] Production UI polish pass — modern color palette, refined typography, clean card designs
- [x] Git repo synced to GitHub with SSH auth from Kali laptop
- [x] Test family data cleaned out of Firebase
- [x] Firebase database rules updated — per-child rewards, timerMinutes, tonight progress fields, history entries all validated
- [x] Companion web app polished to match TV app's deep space palette (Inter font, gradient bg, refined cards)
- [x] Companion web app: inline editing of checklist items, rewards, and child names (tap to edit)
- [x] Companion web app: reorder buttons (up/down arrows) for checklist items
- [x] Companion web app: history page with stats — streak, this week/month/all-time counts, most earned reward
- [x] TV app: show one checklist item at a time (completed items as compact chips, step counter, "up next" hint)
- [x] Built and deployed TV app with one-at-a-time checklist from Kali laptop
- [x] Timer redesign: large full-width bar below header, color-coded green→yellow→red based on time remaining
- [x] In-app splash screen (branded loading view with moon, stars, app title, tagline)
- [x] Dashboard: weekly/monthly stats (this week, last 30 days, best streak, most earned reward)

### POSSIBLE NEXT STEPS
- [ ] End-to-end testing with real family data over multiple nights
- [ ] Add multiple device support (e.g., tablet in kid's room + TV in living room)
- [ ] Investigate app store submission requirements for Vega/Fire TV
- [ ] Add splash screen image (SplashScreenImages.zip) for loading screen branding
