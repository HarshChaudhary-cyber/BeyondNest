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

## 2. How to Add or Modify Questions

Questions are declaratively configured in [`src/config/questions.ts`](file:///d:/Personal%20project/BeyondNest/src/config/questions.ts). The application **does not use hardcoded screen indices** or rigid procedural switch statements. Option lookups are resolved by stable question IDs using `getQuestionById(id)` rather than array indices.

To add a new question (e.g. for Milestone 2):
1. Define the question's stable identifier in `src/store/types.ts`:
   ```ts
   export type QuestionId = 'relocation_purpose' | 'journey_stage' | 'current_country' | 'destination_country'
   ```
2. Add the question definition object to `QUESTIONS` in `src/config/questions.ts`:
   ```ts
   {
     id: 'destination_country',
     order: 4,
     title: 'Where do you plan to move?',
     subtitle: 'Select your prospective destination country.',
     type: 'country_select',
     sceneId: 'destination_globe_scene',
     isRequired: true,
     validate: (val) => val ? { valid: true } : { valid: false, error: 'Please choose a destination' }
   }
   ```
3. The onboarding flow automatically calculates step progress (`Preview step X of Y`), handles back/continue transitions, and manages validation without any shell refactoring.

---

## 3. How to Add or Change 3D Scenes (Scene Registry)

The 3D presentation layer is decoupled from question logic via [`src/components/scenes/SceneRegistry.tsx`](file:///d:/Personal%20project/BeyondNest/src/components/scenes/SceneRegistry.tsx).

Every scene entry in `SCENE_REGISTRY` provides:
1. `renderScene`: A Three.js / React Three Fiber component rendered inside [`CanvasContainer`](file:///d:/Personal%20project/BeyondNest/src/components/scenes/CanvasContainer.tsx).
2. `renderFallback`: A lightweight static SVG/HTML component rendered if WebGL is unavailable or fails.

```ts
export const SCENE_REGISTRY: Record<string, SceneConfig> = {
  my_new_scene: {
    renderScene: ({ answers, paused, reducedMotion }) => (
      <My3DScene answers={answers} paused={paused} reducedMotion={reducedMotion} />
    ),
    renderFallback: ({ answers }) => (
      <MyStaticFallback answers={answers} />
    )
  }
}
```

### 3D Coordinate Utilities and Camera-Facing Rotation Math
Geographic conversions are isolated in [`src/components/scenes/shared/coordinates.ts`](file:///d:/Personal%20project/BeyondNest/src/components/scenes/shared/coordinates.ts):
- `latLonToVector3(lat, lon, radius)`: Converts geographic latitude and longitude into 3D Cartesian coordinates (`THREE.Vector3`) matching Three.js `SphereGeometry` UV mapping.
- `calculateGlobeTargetQuaternion(lat, lon)`: Computes an exact target rotation quaternion using orthonormal basis inversion. The target location $\hat{P}$ is rotated to `(0, 0, +R)` directly facing the camera at $+Z$, while the North Pole remains upright in $+Y$ with zero sideways roll ($\hat{N}' \cdot \hat{x} \approx 0$).
- **Co-transformed Geometry and Pins:** In `GlobeMesh.tsx` and `CountryGlobeScene.tsx`, the globe geometry and location pin share the same rotating group transform. Consequently, pins remain rigidly anchored to their geographic coordinates during rotation and smoothly align with the camera using shortest-path quaternion slerp.

---

## 4. Canonical Country Dataset

Country data is bundled locally in [`src/data/countries.ts`](file:///d:/Personal%20project/BeyondNest/src/data/countries.ts):
- **Coverage:** 202 recognized sovereign countries and territories.
- **Source:** ISO 3166-1 alpha-2, Natural Earth 1:110m populated places, and UN Geoscheme regional groupings.
- **Coordinates:** Documented as representative capital/geographic locations, not exact boundaries.
- **License:** Public Domain / Creative Commons CC0 1.0. No runtime network or external API dependency.

---

## 5. State Management, Validation, and Recovery

State is managed by [`src/store/onboardingStore.ts`](file:///d:/Personal%20project/BeyondNest/src/store/onboardingStore.ts):
- **Schema Version:** Governed by `CURRENT_SCHEMA_VERSION = 1`.
- **Validation on Restore:** Data loaded from `localStorage` (`beyondnest_onboarding_v1`) is validated by `validateAndSanitizeStoredState(raw)`:
  - Country codes are validated against the canonical 202-country dataset; unknown or fabricated codes are stripped.
  - Stored coordinates, names, and regions are restored from the canonical dataset rather than trusting stored copies.
  - Completion status (`isCompleted`) is valid only when every required question has a valid answer; arbitrary truthy flags are rejected.
  - Incomplete or malformed states automatically preserve valid answers and resume navigation at the first unanswered required question.
  - Storage failures (e.g. `QuotaExceededError`) are caught gracefully and remain non-fatal.
- **Selective Persistence:** Only onboarding responses and navigation progress are persisted locally. Sensitive data or user authentication is not collected in this milestone.
- **Actions:** Pure, predictable dispatchers: `setAnswer`, `startOnboarding`, `goToNextQuestion`, `goToPreviousQuestion`, `editAnswer`, `resetOnboarding`.

---

## 5. Feature Flags

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

## 6. Accessibility & Resilience Principles

1. **Screen Reader Separation:** The 3D canvas container is marked `aria-hidden="true"`. All user inputs use accessible native controls or full ARIA 1.2 combobox and radiogroup patterns.
2. **Reduced Motion:** Checked via [`src/hooks/useReducedMotion.ts`](file:///d:/Personal%20project/BeyondNest/src/hooks/useReducedMotion.ts) and `@media (prefers-reduced-motion: reduce)`. Rotations, lerping, and animations are immediately simplified to static poses.
3. **Tab Visibility:** Pauses Three.js rendering loops when the browser tab is hidden using [`src/hooks/useDocumentVisibility.ts`](file:///d:/Personal%20project/BeyondNest/src/hooks/useDocumentVisibility.ts) to conserve battery and CPU.
4. **Resolution Throttling:** The R3F Canvas limits DPR with `dpr={[1, 1.5]}` to prevent high-DPI mobile devices from overheating or dropping frames.
5. **Progressive Loading:** Bundles are chunk-split so core application HTML, CSS, and UI controls become interactive immediately, while 3D geometry renders inside a `<Suspense>` wrapper.
