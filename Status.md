# Project Status (Updated: 2026-02-17)

## Project: Ex-Eraser

**Platform:** iOS (React Native)
**Phase:** Phase 1 — Foundation
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
│   ├── PhotoKitModule.swift        # Photo library access
│   ├── EventKitModule.swift        # Calendar access
│   └── ExEraser-Bridging-Header.h  # Swift/ObjC bridge
├── __tests__/                      # Unit & integration tests
├── tmp/                            # Temporary files (gitignored)
└── android/                        # Placeholder for v2
```

---

## Development Roadmap

| Phase | Scope | Status |
|-------|-------|--------|
| **Phase 1: Foundation** | RN project setup, navigation, design system, theme, auth | **In Progress** |
| **Phase 2: Native Bridges** | FaceDetectionBridge, PhotoKitBridge, EventKitBridge | Pending |
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
- [ ] Phase 1: Auth flow (Firebase Auth + Apple Sign-In) — next
- [ ] Phase 1: `npm install` + verify build — requires Node 18+

---

## Known Issues / Pending Tasks

- [ ] iOS message access is limited — v1 will use guided approach (see TechSpec §4.4)
- [ ] iOS 17+ "Limited Photo Access" handling needs UX design
- [ ] RevenueCat product IDs TBD (need App Store Connect setup)

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
