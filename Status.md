# Project Status (Updated: 2026-02-18)

## Project: Ex-Eraser

**Platform:** iOS (React Native)
**Phase:** Phase 2 — Native Bridges (Complete)
**Framework:** React Native 0.76+ / TypeScript / Swift Native Modules

---

## Folder Structure

```
exCleanApp/
├── src/
│   ├── app/                        # App entry, navigation, providers
│   ├── screens/
│   │   ├── Onboarding/             # Welcome, ex identification setup
│   │   ├── Scan/                   # Scan progress, review gallery
│   │   ├── Vault/                  # Vault browser, item detail
│   │   ├── Dashboard/              # Cleanup summary, re-scan
│   │   └── Settings/               # Subscription, permissions, about
│   ├── components/
│   │   ├── ui/                     # Design system (buttons, cards, modals)
│   │   ├── gallery/                # Photo grid, thumbnail, selection
│   │   └── feedback/               # Progress bars, toasts, celebrations
│   ├── native/                     # Swift bridge type definitions
│   ├── services/
│   │   ├── scanEngine.ts           # Orchestrates scan phases
│   │   ├── vaultManager.ts         # CRUD for vault items
│   │   ├── coolingOff.ts           # Deletion queue management
│   │   ├── encryption.ts           # File encryption/decryption
│   │   └── analytics.ts            # PostHog event tracking
│   ├── store/
│   │   ├── scanStore.ts            # Zustand: scan state
│   │   ├── vaultStore.ts           # Zustand: vault state
│   │   └── userStore.ts            # Zustand: auth, subscription
│   ├── utils/
│   │   ├── permissions.ts          # Permission request flows
│   │   ├── dates.ts                # Date range helpers
│   │   └── constants.ts            # App-wide constants
│   └── theme/
│       ├── colors.ts               # Soft blues/greens palette
│       ├── typography.ts           # Font scales
│       └── spacing.ts              # Layout constants
├── ios/ExEraser/
│   ├── FaceDetectionModule.swift   # Apple Vision face matching
│   ├── FaceDetectionModule.m       # ObjC bridge registration
│   ├── PhotoKitModule.swift        # Photo library access
│   ├── PhotoKitModule.m            # ObjC bridge registration
│   ├── EventKitModule.swift        # Calendar access
│   ├── EventKitModule.m            # ObjC bridge registration
│   └── ExEraser-Bridging-Header.h  # Swift/ObjC bridge
├── __tests__/                      # Unit & integration tests
├── tmp/                            # Temporary files (gitignored)
└── android/                        # Placeholder for v2
```

---

## Development Roadmap

| Phase | Scope | Status |
|-------|-------|--------|
| **Phase 1: Foundation** | RN project setup, navigation, design system, theme, auth | **Complete** |
| **Phase 2: Native Bridges** | FaceDetectionBridge, PhotoKitBridge, EventKitBridge | **Complete** |
| **Phase 3: Scan Engine** | Scan orchestration, review gallery, batch processing | Pending |
| **Phase 4: Vault** | Encryption, biometric lock, vault UI, restore flow | Pending |
| **Phase 5: Cooling Off** | Deletion queue, background tasks, notifications | Pending |
| **Phase 6: Subscriptions** | RevenueCat integration, paywall, entitlement gating | Pending |
| **Phase 7: Polish & QA** | Edge cases, performance, accessibility, App Store prep | Pending |
| **Phase 8: Messages (P2)** | Guided message cleanup, export flow | Pending |

---

## Recent Activity

- [x] PRD.md created — product requirements defined
- [x] TechSpec.md created — technical architecture defined
- [x] Status.md updated with project structure and roadmap
- [x] Phase 1: Project config (package.json, tsconfig, app.json, .gitignore)
- [x] Phase 1: Directory structure created (37 source files)
- [x] Phase 1: Theme system implemented (colors, typography, spacing)
- [x] Phase 1: Utilities built (constants, dates, logger, permissions)
- [x] Phase 1: Zustand stores scaffolded (scan, vault, user)
- [x] Phase 1: Service layer created (scanEngine, vaultManager, coolingOff, encryption, analytics)
- [x] Phase 1: Native bridge TS types + Swift module stubs (FaceDetection, PhotoKit, EventKit)
- [x] Phase 1: All screens scaffolded (Onboarding, Scan, ReviewGallery, Vault, Dashboard, Settings)
- [x] Phase 1: Reusable components built (Button, Card, ProgressBar, Toast, PhotoGrid, ThumbnailItem)
- [x] Phase 1: Navigation shell set up (React Navigation 7 stack)
- [x] Phase 1: App entry point wired (App → Providers → Navigation)
- [ ] Phase 1: Auth flow (Firebase Auth + Apple Sign-In) — deferred
- [x] Phase 1: `npm install` via fnm Node 18 — 891 packages installed
- [x] **Phase 2: ObjC bridge registration files** — FaceDetectionModule.m, PhotoKitModule.m, EventKitModule.m
- [x] **Phase 2: FaceDetectionModule** — RCTEventEmitter, Vision framework face detection + cropped pixel comparison, batch processing with autoreleasepool, progress events
- [x] **Phase 2: PhotoKitModule** — fetchAssetsByDateRange (PHFetchOptions date predicate), exportAsset (image + video via PHImageManager), deleteAsset (PHAssetChangeRequest.deleteAssets)
- [x] **Phase 2: EventKitModule** — searchEvents (title/notes/location/attendees, case-insensitive), deleteEvent, exportEvent (full JSON serialization), getAuthorizationStatus (iOS 17+ branching)
- [x] **Phase 2: TypeScript bridges updated** — ScanProgressEvent + NativeEventEmitter on FaceDetectionBridge, getAuthorizationStatus on EventKitBridge
- [x] **Phase 2: permissions.ts wired** — requestPermission/checkPermission routed to PhotoKitBridge + EventKitBridge with status mapping
- [x] **Phase 2: scanEngine.ts wired** — scanFaces (NativeEventEmitter progress listener + FaceDetectionBridge.scanLibrary), scanDateRanges (PhotoKitBridge.fetchAssetsByDateRange loop), scanCalendar (EventKitBridge.searchEvents with 5-year lookback)
- [x] **Security Audit (2026-02-18)** — PII logging gated behind __DEV__, generateId() uses crypto.getRandomValues(), coolingOff.ts fixed type safety, .gitignore updated
- [x] **Environment Setup** — fnm installed (Node 18.20.8), npm install successful, react-native-local-authentication → react-native-biometrics
- [x] **Storybook Setup** — @storybook/react-native v8, .storybook/ config, metro.config.js, STORYBOOK_ENABLED toggle in index.js
- [x] **UI: Onboarding Screen** — 4-step animated flow (Welcome → Promise → How It Works → Ready), progress dots, back navigation, Storybook story
- [x] **UI: Target Selection Screen** — Name/phone inputs, 5-slot photo reference grid, shake validation, privacy banner, wired into navigation, Storybook story
- [x] **UI: Vault Screen** — Locked/unlocked states, filter tabs, 3-column thumbnail grid, item detail modal with restore/delete actions, spring unlock animation, Storybook stories (Locked, WithItems, Empty)
- [x] **UI: Button Component Story** — All variants (primary, secondary, danger, ghost) + sizes + disabled state
- [x] **iOS Project Setup** — Full Xcode project (ExEraser.xcodeproj) with AppDelegate, main.m, LaunchScreen, Info.plist with privacy strings, PrivacyInfo.xcprivacy
- [x] **Native Modules Integrated** — 3 Swift + 3 ObjC files added to PBXGroup, PBXSourcesBuildPhase, bridging header configured
- [x] **CocoaPods Installed** — 86 pods installed (React 0.76.9, Firebase 11.11.0, RevenueCat 5.32.0, Hermes, etc.)
- [x] **Dependencies Fixed** — CocoaPods upgraded to 1.16.2, react-native-screens pinned to 4.4.0, @react-native-community/cli added, modular headers enabled

---

## Known Issues / Pending Tasks

- [ ] **Xcode 15.1+ required** — Current Xcode is 13.1, RN 0.76 requires 15.1+. Update from App Store before building.
- [ ] iOS message access is limited — v1 will use guided approach (see TechSpec §4.4)
- [ ] iOS 17+ "Limited Photo Access" handling needs UX design
- [ ] RevenueCat product IDs TBD (need App Store Connect setup)
- [ ] Face matching uses pixel comparison fallback — VNGenerateFacePrintRequest available on iOS 18+ for improved accuracy
- [ ] Auth flow (Firebase Auth + Apple Sign-In) not yet implemented

---

## Security & Apple Privacy Audit (2026-02-18)

### Audit Scope
Full codebase review covering: data leakage, API safety, vault encryption, orphaned code, dependency security, Apple Privacy Guidelines compliance, and data minimization.

### Findings & Remediation

| # | Severity | Finding | Status |
|---|----------|---------|--------|
| 1 | CRITICAL | Encryption entirely unimplemented — vault files stored in plaintext | **Deferred to Phase 4** (no user data handled before then) |
| 2 | CRITICAL | Vault biometric auth is a TODO — `unlock()` has no auth challenge | **Deferred to Phase 4** (vault not functional yet) |
| 3 | HIGH | PII (name, phone, UID) logged unconditionally in production | **FIXED** — All info/warn/debug logs gated behind `__DEV__`, Swift NSLog redacts PII |
| 4 | HIGH | Face matching uses raw pixel comparison, not Vision face embeddings | **Known limitation** — VNGenerateFacePrintRequest for iOS 18+ planned |
| 5 | HIGH | No authentication flow implemented — all screens accessible | **Deferred** — Firebase Auth + Apple Sign-In is Phase 1 backlog |
| 6 | HIGH | `generateId()` uses `Math.random()` — not cryptographically secure | **FIXED** — Now uses `crypto.getRandomValues()` |
| 7 | HIGH | ExProfile PII has no memory zeroing or persistence protection | **Noted** — Zustand is in-memory only, no persistence configured |
| 8 | MEDIUM | Calendar export captures all attendee emails into unencrypted vault | **Deferred to Phase 4** (vault encryption will cover this) |
| 9 | MEDIUM | Face scan downloads iCloud photos with no data-usage warning | **Noted** — Will add Wi-Fi check in Phase 3 |
| 10 | MEDIUM | `restoreAsset`/`restoreEvent` stubs resolve with `""` masking failure | **Noted** — Phase 4 will implement real logic |
| 11 | MEDIUM | `permanentlyDelete` received `as any` cast — type safety bypass | **FIXED** — Now properly typed as `VaultItem[]` |
| 12 | LOW | `settings.json` (Claude Code config) tracked in git | **FIXED** — Added to `.gitignore` |
| 13 | LOW | `hooks/` directory not gitignored | **FIXED** — Added to `.gitignore` |
| 14 | LOW | Firebase packages installed but no `GoogleService-Info.plist` | **Known** — Will be added during auth implementation |
| 15 | INFO | No test files exist despite Jest being configured | **Noted** — Tests planned for Phase 7 |

### Apple Privacy Compliance Status

| Requirement | Status |
|-------------|--------|
| On-device face recognition (no server processing) | **Compliant** — All Vision framework processing is on-device |
| Principle of Least Privilege | **Compliant** — Only photos + calendar permissions requested |
| Info.plist permission strings | **Compliant** — NSPhotoLibraryUsageDescription, NSCalendarsUsageDescription, NSFaceIDUsageDescription all configured |
| No PII sent to backend | **Compliant** — No network calls to backend, all data local |
| Data minimization | **Compliant** — Only scan results and vault items stored |

### Critical Pre-Launch Blockers
1. Encryption must be implemented before any real user data is handled (Phase 4)
2. Biometric auth must gate vault access before App Store submission
3. Info.plist privacy strings must be added before build
4. Firebase `GoogleService-Info.plist` required for auth

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native 0.76+ |
| Language (App) | TypeScript |
| Language (Native) | Swift 5.9 |
| State | Zustand |
| Local DB | SQLite (encrypted) |
| Navigation | React Navigation 7 |
| Auth | Firebase Auth |
| Subscriptions | RevenueCat |
| Analytics | PostHog |
| CI/CD | GitHub Actions + Fastlane |
