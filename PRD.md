# Ex-Eraser — Product Requirements Document (PRD)

**Version:** 1.0
**Date:** 2026-02-17
**Status:** Draft
**Product Owner:** PM Team

---

## 1. Vision & Mission

**Vision:** A world where moving on from a relationship isn't sabotaged by your own phone.

**Mission:** Ex-Eraser is a privacy-first mobile application that helps users reclaim their digital space by intelligently detecting, hiding, or archiving traces of an ex-partner — photos, calendar events, and messages — so unexpected "digital memories" no longer ambush their healing process.

---

## 2. Target Users

| Persona | Description |
|---------|-------------|
| **The Fresh Start** | Recently out of a relationship, actively triggered by photos/memories popping up |
| **The Slow Healer** | Months post-breakup, hasn't cleaned up their phone, dreads the manual process |
| **The Privacy-Conscious** | Wants traces archived safely, not deleted — "just in case" |

**Core Demographic:** 18–35, smartphone-heavy, emotionally aware, values privacy.

---

## 3. Monetization Model

**Model:** Freemium with premium upgrade paths.

| Tier | Features | Price |
|------|----------|-------|
| **Free** | Local photo/video hiding, calendar event cleanup, manual selection mode | $0 |
| **Healing Pass (One-Time)** | AI-powered cross-device scan, contextual date-range detection, Secure Vault cloud backup | $9.99 (one-time) |
| **Healing Pass (Monthly)** | All premium features + priority support + early access to v2 features | $2.99/mo |

---

## 4. Platform Strategy

- **v1 Launch:** iOS (iPhone)
- **Framework:** React Native (enables rapid Android expansion in v2)
- **Rationale:** Apple users have deeper photo/calendar/message integration. Apple's privacy-first brand aligns with our trust-building mission.

---

## 5. Feature Scope

### v1 — Core Release

#### 5.1 Identify the Ex ("Search & Rescue Setup")

- User provides: **Name**, **Phone Number**, and selects **3–5 reference photos**
- AI uses reference photos for face matching across the device
- Contact info used to match calendar events and message threads

#### 5.2 Photo & Video Cleanup (Priority 1)

- **Scan:** AI scans local Camera Roll and iCloud Photo Library for face matches
- **Review Gallery:** "Potential Matches" gallery displayed for user confirmation
  - User can approve, reject, or skip each item
  - Batch actions supported (select all, deselect all)
- **Actions:**
  - **Hide → Vault** (default recommendation): Moves to biometric-protected Vault
  - **Permanent Delete**: Moves to hidden bin with a **7-day Cooling Off** period before permanent removal
- **Date-Range Filter:** User can specify date ranges (e.g., "July 14–21, 2024") to surface all photos from that period regardless of face match

#### 5.3 Calendar Event Cleanup (Priority 1)

- Scan local and synced calendars for events containing the ex's name, associated locations, or date patterns
- Actions: Hide (remove from active calendar, store in Vault) or Delete (7-day cooling off)

#### 5.4 Message Cleanup (Priority 2)

- Detect SMS/iMessage threads with the ex's phone number
- Actions: Archive thread to Vault or Delete (7-day cooling off)
- **Note:** iOS message access is limited — implementation depends on available APIs and may require user-guided export

#### 5.5 The Vault

- Biometric-protected space (Face ID / Touch ID)
- Stores all "hidden" content — photos, videos, calendar events, message archives
- User can browse, restore, or permanently delete items from the Vault at any time
- Vault data lives **on-device only** (free tier) or with **encrypted cloud backup** (premium)

#### 5.6 Cooling Off Bin

- Items marked for permanent deletion enter a 7-day holding period
- User receives a gentle reminder on Day 6: *"Tomorrow, these items will be gone forever. Want to review?"*
- After 7 days, items are permanently and irreversibly deleted

### v2 — Future Scope

- Social media integration (Instagram, Facebook tags/memories)
- Spotify/music playlist detection
- AI contextual/location detection ("The Restaurant", "Their Apartment")
- Android release
- Shared album detection and cleanup

---

## 6. User Experience & Emotional Tone

### 6.1 Design Principles

| Principle | Description |
|-----------|-------------|
| **Empathetic** | The app feels like a supportive friend, not a clinical tool |
| **Minimalist** | Clean UI, no clutter, no overwhelming options |
| **Safe** | Every destructive action has a safety net |
| **Encouraging** | Micro-copy celebrates progress without being patronizing |

### 6.2 Color Palette & Feel

- Soft blues and greens — calm, healing, trustworthy
- Rounded shapes, gentle transitions, no harsh alerts
- Dark mode support from Day 1

### 6.3 Micro-Copy Examples

| Context | Copy |
|---------|------|
| Onboarding | *"Let's make your phone feel like yours again."* |
| Scanning | *"Take your time. We'll handle the searching."* |
| Review Gallery | *"You're in control. Nothing happens without your say."* |
| Post-Cleanup | *"You're doing great. Your space, your pace."* |
| Vault Entry | *"These memories are safe. Open when you're ready."* |
| Cooling Off Reminder | *"Tomorrow, these items will be gone forever. Want to take one last look?"* |

### 6.4 Core User Flow

```
1. Welcome & Onboarding
   ↓
2. "Who are we moving on from?" → Name, Phone, Reference Photos
   ↓
3. AI Scan (progress animation, calming UI)
   ↓
4. Review Gallery → User confirms/rejects matches
   ↓
5. Choose Action → Vault (recommended) or Delete (with cooling off)
   ↓
6. Dashboard → Summary of what was cleaned, Vault access, re-scan option
```

---

## 7. Safety & Ethics

| Concern | Mitigation |
|---------|------------|
| Accidental deletion | 7-day Cooling Off period; Vault as default |
| Misuse (hiding evidence) | App marketed and positioned purely as a personal healing tool; Terms of Service prohibit misuse |
| Privacy | All processing on-device; no user photos touch our servers |
| Emotional sensitivity | No gamification of deletion; no "scores" or "streaks" |
| Regret | Vault allows full restoration at any time |

---

## 8. Success Metrics

| Metric | Target (6 months post-launch) |
|--------|-------------------------------|
| App Store Rating | 4.5+ stars |
| Scan Completion Rate | >70% of users who start a scan complete review |
| Vault Usage | >50% of users choose Vault over Delete |
| Freemium → Premium Conversion | >8% |
| D7 Retention | >40% |
| Cooling Off Reversals | Track as insight (not a target) |

---

## 9. Risks & Open Questions

| Risk | Severity | Mitigation |
|------|----------|------------|
| iOS sandboxing limits message access | High | Fallback to user-guided message export; clearly communicate limitations |
| iCloud Photo Library API restrictions | Medium | Use PHAsset framework; test edge cases with large libraries |
| Face detection false positives | Medium | Mandatory user review step; no auto-delete ever |
| App Store rejection (privacy concerns) | Medium | Apple Privacy Nutrition Label compliance; no server-side photo processing |
| Emotional backlash from users | Low | Empathetic UX, safety nets, clear communication |

---

*This document will evolve as we move through design and development. All features are subject to technical feasibility validation in the TechSpec.*
