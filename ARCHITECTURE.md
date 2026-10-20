# BeyondNest — Architecture Documentation

This document describes the codebase architecture of **BeyondNest** and guides developers on how to extend themes, questions, 3D scenes, state stores, and feature flags without breaking existing flows.

---

## Architecture Overview

BeyondNest follows a **modular, decoupled architecture**:

```
src/
├── config/             # Declarative configurations (brand text, questions, feature flags, roadmap)
├── data/               # Static maintained datasets (180+ countries with lat/lon)
├── store/              # State management, persistence, validation schemas, domain types
├── styles/             # Shared CSS custom properties (tokens) and global resets
├── hooks/              # Accessibility & performance hooks (reduced-motion, visibility, WebGL)
├── components/
│   ├── common/         # Atomic UI primitives (Button, Card, ProgressBar, Combobox, Header)
│   ├── scenes/         # 3D R3F scenes, procedural textures, scene registry, vector fallbacks
│   └── onboarding/     # Screen containers (WelcomeScreen, QuestionScreen, SummaryScreen, Shell)
└── tests/              # Automated unit and integration test suites
```

---

## 1. How to Change Themes and Styles

All aesthetic variables are maintained in [`src/styles/tokens.css`](file:///d:/Personal%20project/BeyondNest/src/styles/tokens.css).

To update the brand color palette or radii:
- **Teal brand accents:** Edit `--bn-color-teal-50` through `--bn-color-teal-900`.
- **Sky-blue atmosphere:** Edit `--bn-color-sky-50` through `--bn-color-sky-900`.
- **Navy typography:** Edit `--bn-color-navy-100` through `--bn-color-navy-950`.
- **Card and surface shadows:** Edit `--bn-shadow-sm`, `--bn-shadow-md`, `--bn-shadow-card-selected`.
- **Border radius:** Edit `--bn-radius-sm`, `--bn-radius-md`, `--bn-radius-lg`, `--bn-radius-xl`.

All components consume these variables via CSS Modules (`.module.css`), ensuring zero style leakage and consistent styling across screens.

### 3D Theme & Palette Alignment
Shared 3D brand colors, material parameters, and lighting are centralized in [`src/config/theme3d.ts`](file:///d:/Personal%20project/BeyondNest/src/config/theme3d.ts). This ensures 3D geometry aligns directly with the CSS token color space without fragile ad-hoc hex values across scene components:
- `THEME_3D.colors`: Oceanic navy, land teal, glow atmosphere, travel pin, and milestone colors.
- `THEME_3D.lighting`: Key, fill, and rim light configurations.
- `THEME_3D.materials`: Roughness, metalness, and opacity defaults for physical and standard materials.

---

## 2. Adaptive Question Engine & Dependency Policy

Questions are declaratively configured in [`src/config/questions.ts`](file:///d:/Personal%20project/BeyondNest/src/config/questions.ts). The application does not use hardcoded screen indices or rigid procedural switch statements. Every question is defined with a stable ID, visibility rule (`isVisible`), dynamic copy resolvers (`title`, `subtitle`, `options`), validator, and dependency invalidation policy.

### Question Model
Each question in `QUESTIONS` defines:
- `id`: Stable identifier from `QuestionId`.
- `title` / `subtitle`: String or dynamic function `(answers) => string` adapting tense and wording (e.g. *"Where would you like to move?"* vs *"Which country did you move to?"* for already-abroad movers).
- `type`: `card_select`, `multi_card_select`, `country_select`, `citizenship_select`, `destination_select`, `city_input`, `date_select`, `duration_select`, `backpacking_select`, `budget_input`, or `university_input`.
- `isVisible(answers)`: Boolean predicate determining whether the question applies to the current user path.
- `invalidates(newVal, oldVal)`: Function returning an array of downstream `QuestionId`s to clear when an answer changes.
- `sceneId`: Stable key matching an entry in `SCENE_REGISTRY`.
- `isRequired`: Whether the question must be answered or explicitly skipped before continuing.
- `validate(value, answers)`: Pure validation function returning `{ valid: boolean, error?: string }`.

### Dependency Invalidation Policy
To maintain data integrity and prevent inconsistent planning state:
1. **Upstream Invalidation:**
   - Changing `relocation_purpose` clears `study_level`, `university`, and `work_status`.
   - Changing `journey_stage` clears `move_date` (planning vs arrived semantics), `origin_country_abroad`, and `preparation_status` (due to purpose/stage-specific options).
   - Changing `destination_country` clears `city` and `destination_priorities`.
   - Changing `travel_style` to non-backpacking clears `backpacking_destinations`.
2. **Exclusion from Planning & Review:** Inactive questions (where `isVisible(answers) === false`) are strictly filtered out of progress calculations (`Step X of Y`), review summaries, and downstream planning input.
3. **Preservation of Independent Answers:** Unrelated valid answers (e.g. citizenship, companions, budget) are preserved across branch changes.

---

## 3. Dedicated Citizenship & Passport Options Model

Citizenship data is maintained in [`src/data/citizenships.ts`](file:///d:/Personal%20project/BeyondNest/src/data/citizenships.ts):
- **Distinction from Residence:** We distinguish sovereign citizenship and passport-issuing authorities from territorial residence. Not every dependent territory or administrative zone in the 202-country residence list issues a separate sovereign passport.
- **Coverage Policy:** 195 sovereign states plus internationally recognized travel document authorities (e.g. Hong Kong SAR `HK`, Macao SAR `MO`, Taiwan `TW`).
- **Dependent Territories:** Non-sovereign overseas territories (e.g. Bermuda, Puerto Rico, Greenland) are not presented as separate sovereign nationalities; their citizens hold the respective sovereign passport (United Kingdom, United States, Kingdom of Denmark).
- **Selection Policy:** Multi-select allowing dual/multiple citizenships, plus a dedicated "Skip for now" option explaining: *"This helps us find relevant official entry guidance later."*
- **Limitations:** Collects nationality/citizenship selections only. Does not collect passport numbers, expiry dates, or uploaded documents. Does not perform legal dual-citizenship compatibility determinations.

---

## 4. 3D Scene Registry and Fallback Architecture

The 3D presentation layer is completely decoupled from question logic via [`src/components/scenes/SceneRegistry.tsx`](file:///d:/Personal%20project/BeyondNest/src/components/scenes/SceneRegistry.tsx).

Every scene entry in `SCENE_REGISTRY` provides:
1. `renderScene`: A Three.js / React Three Fiber component rendered inside [`CanvasContainer`](file:///d:/Personal%20project/BeyondNest/src/components/scenes/CanvasContainer.tsx).
2. `renderFallback`: A lightweight static SVG/HTML component rendered if WebGL is unavailable or fails.

```ts
export const SCENE_REGISTRY: Record<string, SceneConfig> = {
  destination_globe_scene: {
    renderScene: ({ answers, paused, reducedMotion }) => (
      <DestinationGlobeScene answers={answers} paused={paused} reducedMotion={reducedMotion} />
    ),
    renderFallback: ({ answers }) => (
      <FallbackDestinationGlobe answers={answers} />
    )
  }
}
```

### Shared 3D Theme & Coordinate Geometry
- **Centralized Materials & Lighting:** [`src/config/theme3d.ts`](file:///d:/Personal%20project/BeyondNest/src/config/theme3d.ts) defines brand materials, roughness, metalness, and lighting palettes.
- **Co-transformed Geometry and Pins:** In `GlobeMesh.tsx`, `CountryGlobeScene.tsx`, and `DestinationGlobeScene.tsx`, the globe geometry, location pins, and geodesic arcs share the same rotating group transform.
- **Camera-Facing Quaternion Rotation:** Geographic coordinates are rotated directly to face the camera at $+Z$ via `calculateGlobeTargetQuaternion(lat, lon)` using shortest-path quaternion slerp.

---

## 5. Canonical Datasets

1. **Residence & Destination Countries:** [`src/data/countries.ts`](file:///d:/Personal%20project/BeyondNest/src/data/countries.ts) (202 recognized countries and territories, ISO 3166-1 alpha-2, Natural Earth 1:110m vectors, UN Geoscheme).
2. **Citizenship & Passports:** [`src/data/citizenships.ts`](file:///d:/Personal%20project/BeyondNest/src/data/citizenships.ts) (198 sovereign and passport-issuing authorities).
3. **No External Runtime Fetch:** All geographical datasets are statically bundled and typed, guaranteeing zero network dependencies or external privacy leaks.

---

## 6. State Management, Schema Migration, and Persistence

State is managed by [`src/store/onboardingStore.ts`](file:///d:/Personal%20project/BeyondNest/src/store/onboardingStore.ts):
- **Schema Version:** Governed by `CURRENT_SCHEMA_VERSION = 2`.
- **Storage Key:** `localStorage` key `beyondnest_onboarding_v2`.
- **Version-1 Migration:**
  - Automatically reads existing `beyondnest_onboarding_v1` payloads.
  - Sanitizes valid v1 answers (`relocation_purpose`, `journey_stage`, `current_country`).
  - **Invariant:** A Task 1 preview marked completed does *not* automatically complete the expanded onboarding. `isCompleted` is strictly reset to `false`, and navigation resumes at `citizenship` (the first new unanswered question).
- **Validation on Restore:**
  - Country and citizenship codes are validated against canonical datasets; unknown codes are stripped.
  - Incomplete states clamp `currentQuestionId` to the first unanswered applicable question.
  - Storage failures (e.g. quota limits) are caught gracefully and surfaced via `storageStatus: 'error'` with a non-blocking UI alert.
- **Review Screen Editing & Guided Return:**
  - `editAnswer(questionId)` sets `returnToReview = true` and navigates to the target question.
  - If saving an edit preserves the branch, the user immediately returns to the review screen.
  - If saving an edit opens a new required branch (e.g. changing purpose to Study or changing destination from undecided to a specific country), `goToNextQuestion` guides the user sequentially through the newly required questions before returning to review.
- **Local Data Privacy:** All answers remain local in browser storage. No data is sent to servers or third-party analytics.

---

## 7. Feature Flags

Feature flags are declared in [`src/config/featureFlags.ts`](file:///d:/Personal%20project/BeyondNest/src/config/featureFlags.ts):

```ts
export const FEATURE_FLAGS = {
  enable3DScenes: true,
  enableSmoothTransitions: true,
  persistProgressLocally: true,
  enableLuggageTagAccents: true,
  enableConfettiOnCompletion: true,
  debugMode: false,
}
```

---

## 8. Accessibility & Resilience Principles

1. **Screen Reader Separation:** The 3D canvas container is marked `aria-hidden="true"`. All user inputs use accessible native controls, ARIA 1.2 combobox, multi-select listbox, or radiogroup patterns.
2. **Reduced Motion:** Checked via [`src/hooks/useReducedMotion.ts`](file:///d:/Personal%20project/BeyondNest/src/hooks/useReducedMotion.ts) and `@media (prefers-reduced-motion: reduce)`. Rotations, lerping, and 3D animations are immediately simplified to static poses.
3. **Tab Visibility:** Pauses Three.js rendering loops when the browser tab is hidden using [`src/hooks/useDocumentVisibility.ts`](file:///d:/Personal%20project/BeyondNest/src/hooks/useDocumentVisibility.ts) to conserve battery and CPU.
4. **Resolution Throttling:** The R3F Canvas limits DPR with `dpr={[1, 1.5]}` to prevent high-DPI mobile devices from overheating or dropping frames.
5. **Zero Horizontal Overflow:** Desktop scene sits beside the question form; mobile view displays a compact scene above the question with responsive CSS layout.

5. **Progressive Loading:** Bundles are chunk-split so core application HTML, CSS, and UI controls become interactive immediately, while 3D geometry renders inside a `<Suspense>` wrapper.
