# Ex-Eraser — Technical Specification

**Version:** 1.0
**Date:** 2026-02-17
**Status:** Draft
**Owner:** Engineering Team

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    React Native App                  │
│                      (iOS First)                     │
├──────────┬──────────┬───────────┬───────────────────┤
│  UI      │  Scan    │  Vault    │  Subscription     │
│  Layer   │  Engine  │  Manager  │  Manager          │
├──────────┴──────────┴───────────┴───────────────────┤
│              Native Bridge Layer                     │
├──────────┬──────────┬───────────┬───────────────────┤
│  Apple   │  Photos  │  Event-   │  Keychain /       │
│  Vision  │  Kit     │  Kit      │  Biometrics       │
│  (Face)  │ (PHAsset)│(Calendar) │  (LocalAuth)      │
└──────────┴──────────┴───────────┴───────────────────┘
         ALL PROCESSING ON-DEVICE

┌─────────────────────────────────────────────────────┐
│               Lightweight Backend                    │
│            (Auth, Subscriptions, Analytics)           │
├──────────┬──────────────────────┬───────────────────┤
│  Auth    │  Subscription API    │  Anonymous         │
│ (Firebase│  (RevenueCat)        │  Analytics         │
│  Auth)   │                      │  (PostHog)         │
└──────────┴──────────────────────┴───────────────────┘
         NO USER CONTENT TOUCHES THE SERVER
```

### Design Principles

- **Privacy-First:** All photo/video/message processing happens on-device
- **Native When It Matters:** React Native for UI; native modules (Swift) for Apple Vision, PhotoKit, EventKit
- **Minimal Backend:** Server only handles auth, subscriptions, and anonymized analytics
- **Fail Safe:** No destructive action without explicit user confirmation + cooling off period

---

## 2. Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Framework** | React Native 0.76+ | Cross-platform readiness for Android v2; strong iOS support |
| **Language (App)** | TypeScript | Type safety, better DX |
| **Language (Native)** | Swift 5.9 | Required for Apple Vision, PhotoKit, EventKit bridges |
| **State Management** | Zustand | Lightweight, minimal boilerplate |
| **Local Storage** | SQLite (via expo-sqlite or WatermelonDB) | Vault metadata, scan history, cooling off tracking |
| **Navigation** | React Navigation 7 | Industry standard for RN |
| **Auth** | Firebase Auth | Quick setup, Apple Sign-In support |
| **Subscriptions** | RevenueCat | Handles App Store billing, receipt validation, entitlements |
| **Analytics** | PostHog (self-hosted or cloud) | Privacy-friendly, anonymized event tracking |
| **Biometrics** | react-native-local-authentication | Face ID / Touch ID for Vault access |
| **CI/CD** | GitHub Actions + Fastlane | Automated builds, TestFlight distribution |

---

## 3. Native Modules (Swift Bridges)

React Native cannot directly access Apple Vision, PhotoKit, or EventKit with the depth we need. Three custom native modules are required.

### 3.1 FaceDetectionBridge

**Purpose:** Detect and match faces in the user's photo library against reference photos of the ex.

```
Input:  3-5 reference photos (selected by user)
Output: Array of PHAsset IDs with confidence scores

Flow:
1. User selects reference photos → passed to native module
2. Apple Vision generates VNFaceObservation for each reference
3. Module iterates through PHAsset library in batches (50 at a time)
4. For each photo: detect faces → compare face prints against references
5. Return matches with confidence > 0.6 threshold
6. Results displayed in "Review Gallery" for user confirmation
```

**Key APIs:**
- `VNDetectFaceRectanglesRequest` — detect faces in photos
- `VNGenerateFacePrintRequest` — generate face embeddings
- `VNFacePrintDistance` — compare face prints (lower = closer match)

**Performance:**
- Process in background thread (DispatchQueue)
- Batch processing to avoid memory spikes
- Progress callback to JS layer for UI updates
- Estimated: ~500 photos/minute on iPhone 12+

### 3.2 PhotoKitBridge

**Purpose:** Read, hide, and manage photos/videos in the user's library.

```
Capabilities:
- Fetch all PHAssets (photos + videos) with metadata
- Fetch iCloud-synced assets (PHAsset.sourceType)
- Move assets to a hidden album (app-specific)
- Delete assets (moves to "Recently Deleted" → then permanent after 30 days)
- Export assets to app sandbox (for Vault storage)
- Restore assets from Vault back to library
```

**Key APIs:**
- `PHPhotoLibrary` — access and modify photo library
- `PHAsset` — individual photo/video representation
- `PHAssetChangeRequest` — create, modify, delete assets
- `PHFetchOptions` — filter by date range, media type

**Permissions:**
- `NSPhotoLibraryUsageDescription` — full library access required
- Must handle partial access (iOS 17+ "Limited Photos Access") gracefully
- If limited access: prompt user to grant full access with clear explanation

### 3.3 EventKitBridge

**Purpose:** Scan and manage calendar events associated with the ex.

```
Capabilities:
- Fetch all calendar events within a date range
- Search by attendee name, email, or event title keywords
- Hide events (remove from calendar, store metadata in Vault)
- Delete events (with cooling off period)
- Restore events from Vault
```

**Key APIs:**
- `EKEventStore` — access calendars
- `EKEvent` — individual event
- `EKParticipant` — event attendees

**Permissions:**
- `NSCalendarsUsageDescription` — calendar access
- `NSCalendarsFullAccessUsageDescription` (iOS 17+)

---

## 4. Core Features — Technical Design

### 4.1 "Search & Rescue" Scan Engine

The scan engine orchestrates face detection, date-range filtering, and contact matching.

```
ScanEngine
├── FaceScanner (Apple Vision via FaceDetectionBridge)
│   ├── Input: reference photos
│   ├── Process: batch face comparison
│   └── Output: matched PHAsset IDs + confidence scores
│
├── DateRangeScanner (PhotoKitBridge + EventKitBridge)
│   ├── Input: user-specified date ranges
│   ├── Process: fetch all content within dates
│   └── Output: PHAsset IDs + EKEvent IDs
│
├── ContactMatcher (EventKitBridge)
│   ├── Input: ex's name + phone number
│   ├── Process: search calendar attendees + event titles
│   └── Output: matched EKEvent IDs
│
└── ResultAggregator
    ├── Merge and deduplicate results
    ├── Assign categories (face match, date match, contact match)
    └── Sort by confidence / date for Review Gallery
```

**Scan States:**

```typescript
type ScanState =
  | { status: 'idle' }
  | { status: 'scanning'; progress: number; phase: ScanPhase }
  | { status: 'review'; results: ScanResult[] }
  | { status: 'complete'; summary: CleanupSummary }
  | { status: 'error'; message: string };

type ScanPhase = 'faces' | 'dates' | 'calendar' | 'messages';

interface ScanResult {
  id: string;
  assetId: string;           // PHAsset ID or EKEvent ID
  type: 'photo' | 'video' | 'calendar_event' | 'message';
  matchType: 'face' | 'date_range' | 'contact';
  confidence: number;        // 0.0 - 1.0
  thumbnailUri: string;
  date: string;
  userDecision?: 'vault' | 'delete' | 'keep';
}
```

### 4.2 The Vault

**Architecture:**

```
App Sandbox Directory
└── /vault/
    ├── /media/           ← encrypted photo/video files
    │   ├── {uuid}.enc
    │   └── ...
    ├── /thumbnails/      ← encrypted thumbnails for gallery view
    │   ├── {uuid}_thumb.enc
    │   └── ...
    └── vault.db          ← SQLite database (encrypted)
```

**Encryption:**
- Files encrypted at rest using AES-256
- Encryption key stored in iOS Keychain (hardware-backed)
- Key access gated behind biometric authentication (Face ID / Touch ID)

**Vault Database Schema:**

```sql
CREATE TABLE vault_items (
  id            TEXT PRIMARY KEY,
  original_id   TEXT NOT NULL,          -- original PHAsset/EKEvent ID
  type          TEXT NOT NULL,          -- 'photo', 'video', 'calendar', 'message'
  file_path     TEXT,                   -- path to encrypted file in sandbox
  thumbnail_path TEXT,                  -- path to encrypted thumbnail
  metadata      TEXT,                   -- JSON: original date, location, album, etc.
  match_type    TEXT NOT NULL,          -- 'face', 'date_range', 'contact'
  created_at    TEXT NOT NULL,          -- when item was vaulted
  source        TEXT NOT NULL           -- 'camera_roll', 'icloud', 'calendar', 'messages'
);

CREATE TABLE cooling_off (
  id            TEXT PRIMARY KEY,
  vault_item_id TEXT REFERENCES vault_items(id),
  delete_after  TEXT NOT NULL,          -- ISO 8601 date (created_at + 7 days)
  reminded      INTEGER DEFAULT 0,     -- 1 if Day 6 reminder was sent
  status        TEXT DEFAULT 'pending'  -- 'pending', 'deleted', 'restored'
);

CREATE TABLE scan_history (
  id            TEXT PRIMARY KEY,
  started_at    TEXT NOT NULL,
  completed_at  TEXT,
  total_scanned INTEGER,
  total_matched INTEGER,
  total_vaulted INTEGER,
  total_deleted INTEGER
);
```

### 4.3 Cooling Off Bin

**Flow:**

```
User chooses "Delete"
  ↓
Item moved to Vault + cooling_off record created (delete_after = now + 7 days)
  ↓
Day 6: Local push notification
  "Tomorrow, these items will be gone forever. Want to take one last look?"
  ↓
Day 7: Background task checks cooling_off table
  ├── status = 'pending' → permanently delete file + remove DB records
  └── status = 'restored' → move back to Vault (user changed mind)
```

**Implementation:**
- Background task via `BGAppRefreshTask` (iOS Background Tasks framework)
- Local notifications via `UNUserNotificationCenter`
- Notifications scheduled at item creation time (6 days out)

### 4.4 Messages (Priority 2 — iOS Constraints)

**Reality Check:** iOS does not provide direct API access to read or modify SMS/iMessage databases. Options:

| Approach | Feasibility | Trade-offs |
|----------|-------------|------------|
| **MessageUI Framework** | Limited | Can compose/send, cannot read or delete |
| **Contact-based guidance** | Viable | We identify the contact; guide user to manually hide/delete the conversation |
| **Screen Time / Focus Filter** | Partial | Can suggest notification filtering but not content access |
| **User-guided export** | Viable | User exports conversation → app processes the export file |

**v1 Recommendation:** Hybrid approach
1. Detect the ex's contact exists on-device
2. Show a guided walkthrough: "Here's how to hide this conversation in Messages"
3. Offer to export the conversation (if user wants a Vault backup) via share sheet
4. Mark as "addressed" in the app's cleanup dashboard

---

## 5. Backend Services

### 5.1 Architecture

```
┌──────────────────────────┐
│    Firebase / Supabase    │
├──────────────────────────┤
│  Auth (Apple Sign-In)     │ ← Firebase Auth
│  User Profile             │ ← Firestore (minimal: uid, created, tier)
│  Subscription Status      │ ← RevenueCat webhook → Firestore
└──────────────────────────┘

┌──────────────────────────┐
│       RevenueCat          │
├──────────────────────────┤
│  App Store Connect        │ ← receipt validation
│  Entitlements             │ ← 'free' | 'healing_pass'
│  Webhooks                 │ ← sync status to backend
└──────────────────────────┘

┌──────────────────────────┐
│        PostHog            │
├──────────────────────────┤
│  Anonymous Events         │ ← scan_started, scan_completed,
│                           │   vault_action, delete_action,
│                           │   cooling_off_reversal
│  NO PII, NO content data  │
└──────────────────────────┘
```

### 5.2 Data We Store Server-Side

| Data | Where | Purpose |
|------|-------|---------|
| Anonymous user ID | Firebase Auth | Authentication |
| Subscription tier | Firestore (via RevenueCat) | Feature gating |
| Anonymous events | PostHog | Product analytics |

### 5.3 Data We NEVER Store Server-Side

- Photos, videos, or thumbnails
- Contact names, phone numbers, or any PII
- Calendar event content
- Message content
- Face embeddings or reference photos
- Location data

---

## 6. Security

| Layer | Mechanism |
|-------|-----------|
| **Vault Access** | Face ID / Touch ID via `LAContext` (LocalAuthentication) |
| **Vault Encryption** | AES-256; key in iOS Keychain (`kSecAttrAccessibleWhenUnlockedThisDeviceOnly`) |
| **Network** | HTTPS/TLS 1.3 for all backend calls; certificate pinning |
| **Auth** | Apple Sign-In (no password to leak); Firebase Auth tokens |
| **Local DB** | SQLCipher or encrypted SQLite for vault.db |
| **App Transport** | ATS enforced (iOS default) |
| **Jailbreak Detection** | Basic check; warn user that Vault security is compromised |

---

## 7. Privacy & Compliance

### 7.1 App Store Privacy Labels ("Nutrition Label")

| Category | Data Collected | Linked to Identity |
|----------|---------------|-------------------|
| Identifiers | Anonymous ID | No |
| Purchases | Subscription status | Yes (via Apple ID) |
| Diagnostics | Crash logs | No |
| Usage Data | Anonymous feature events | No |

**Not Collected:** Photos, Contacts, Location, Messages, Browsing History, Search History

### 7.2 Compliance

- **GDPR:** No personal data stored server-side beyond anonymous ID. Right to deletion = delete Firebase Auth account.
- **CCPA:** No sale of personal data. Minimal collection.
- **Apple App Review Guidelines:** On-device processing only. Clear privacy disclosure. No background access to photo library without active session.

---

## 8. Permissions Required

| Permission | iOS Key | When Requested | Justification Copy |
|-----------|---------|----------------|-------------------|
| Photo Library | `NSPhotoLibraryUsageDescription` | Scan setup | *"Ex-Eraser needs access to your photos to find and protect memories you'd like to hide."* |
| Calendar | `NSCalendarsFullAccessUsageDescription` | Calendar scan | *"We'll look for calendar events with your ex so you can choose what to keep."* |
| Face ID | `NSFaceIDUsageDescription` | Vault setup | *"Protect your Vault with Face ID so only you can access it."* |
| Notifications | `UNAuthorizationOptions` | After first vault/delete | *"We'll remind you before permanently deleting anything."* |
| Contacts (read-only) | `NSContactsUsageDescription` | Ex identification | *"We'll use your contact info to find related calendar events and messages."* |

---

## 9. Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Initial scan (1,000 photos) | < 3 minutes | Time from scan start to review gallery |
| Initial scan (10,000 photos) | < 15 minutes | Batch processing with progress UI |
| Vault open (biometric) | < 1 second | Time from Face ID success to gallery render |
| Vault gallery load (500 items) | < 2 seconds | Thumbnail rendering with lazy loading |
| App cold start | < 2 seconds | Splash → home screen |
| Memory usage during scan | < 200 MB | Peak during batch face detection |

---

## 10. Project Structure

```
exCleanApp/
├── src/
│   ├── app/                    # App entry, navigation, providers
│   ├── screens/
│   │   ├── Onboarding/         # Welcome, ex identification
│   │   ├── Scan/               # Scan progress, review gallery
│   │   ├── Vault/              # Vault browser, item detail
│   │   ├── Dashboard/          # Cleanup summary, re-scan
│   │   └── Settings/           # Subscription, permissions, about
│   ├── components/
│   │   ├── ui/                 # Design system (buttons, cards, modals)
│   │   ├── gallery/            # Photo grid, thumbnail, selection
│   │   └── feedback/           # Progress bars, toasts, celebrations
│   ├── native/
│   │   ├── FaceDetectionBridge.swift
│   │   ├── PhotoKitBridge.swift
│   │   └── EventKitBridge.swift
│   ├── services/
│   │   ├── scanEngine.ts       # Orchestrates scan phases
│   │   ├── vaultManager.ts     # CRUD for vault items
│   │   ├── coolingOff.ts       # Deletion queue management
│   │   ├── encryption.ts       # File encryption/decryption
│   │   └── analytics.ts        # PostHog event tracking
│   ├── store/
│   │   ├── scanStore.ts        # Zustand: scan state
│   │   ├── vaultStore.ts       # Zustand: vault state
│   │   └── userStore.ts        # Zustand: auth, subscription
│   ├── utils/
│   │   ├── permissions.ts      # Permission request flows
│   │   ├── dates.ts            # Date range helpers
│   │   └── constants.ts        # App-wide constants
│   └── theme/
│       ├── colors.ts           # Soft blues/greens palette
│       ├── typography.ts       # Font scales
│       └── spacing.ts          # Layout constants
├── ios/
│   └── ExEraser/
│       ├── FaceDetectionModule.swift
│       ├── PhotoKitModule.swift
│       ├── EventKitModule.swift
│       └── ExEraser-Bridging-Header.h
├── __tests__/
├── android/                    # Placeholder for v2
├── app.json
├── package.json
├── tsconfig.json
└── README.md
```

---

## 11. Development Phases

| Phase | Scope | Duration |
|-------|-------|----------|
| **Phase 1: Foundation** | RN project setup, navigation, design system, theme, auth | 2 weeks |
| **Phase 2: Native Bridges** | FaceDetectionBridge, PhotoKitBridge, EventKitBridge | 3 weeks |
| **Phase 3: Scan Engine** | Scan orchestration, review gallery, batch processing | 2 weeks |
| **Phase 4: Vault** | Encryption, biometric lock, vault UI, restore flow | 2 weeks |
| **Phase 5: Cooling Off** | Deletion queue, background tasks, notifications | 1 week |
| **Phase 6: Subscriptions** | RevenueCat integration, paywall, entitlement gating | 1 week |
| **Phase 7: Polish & QA** | Edge cases, performance, accessibility, App Store prep | 2 weeks |
| **Phase 8: Messages (P2)** | Guided message cleanup, export flow | 1 week |

**Total Estimated: ~14 weeks to TestFlight**

---

## 12. Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|------------|
| Apple Vision face matching accuracy < 80% | High | Medium | Mandatory user review; adjustable confidence threshold; allow manual additions |
| iOS 17+ "Limited Photo Access" adoption | High | High | Clear UX explaining why full access is needed; graceful fallback to selected photos only |
| iCloud photos not locally cached | Medium | High | Use `PHImageManager` with `networkAccessAllowed`; show progress for cloud downloads |
| Background task not guaranteed by iOS | Medium | High | Also run cooling off check on app foreground; don't rely solely on BGTask |
| App Store rejection | High | Low | Pre-submission review against guidelines; no server-side photo access; clear privacy labels |
| Large photo libraries (50k+ photos) | Medium | Medium | Chunked processing; "scan in progress" persistent notification; resume interrupted scans |

---

*This spec is a living document. Technical decisions will be validated during Phase 1 prototyping and adjusted based on real-device testing.*
