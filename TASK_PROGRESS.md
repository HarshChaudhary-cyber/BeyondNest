# BeyondNest — Task 1 Progress & Validation

## 1. What Was Implemented

### Task 1: Customisable Foundation and 3D Onboarding Preview

- **Project Foundation:**
  - Initialized with React 19, TypeScript, Vite 8, and CSS Modules.
  - Core design system defined in `src/styles/tokens.css` (warm whites, sky-blue atmosphere, deep navy typography, vibrant sea-teal accents, soft ambient shadows, and luggage-tag accents).
  - Centralized brand copy and navigation strings in `src/config/brand.ts`.
  - Feature flag configuration in `src/config/featureFlags.ts`.
  - Decoupled question definitions in `src/config/questions.ts`.

- **Welcome Screen:**
  - Headline: *“A new country. A new chapter. Let’s get you ready.”*
  - Supporting text: *“Tell us about your move. Build a clearer path to your next home.”*
  - Primary call-to-action button: *“Plan my move”* displaying immediately without blocking interaction.
  - Interactive 3D globe with recognizable procedural geography, soft atmospheric clouds, and an airplane flying along an arched flight trajectory.

- **Question Experience (3 Questions):**
  - **Screen 1 (Purpose):** *“What brings you to a new country?”* (Study, Work, Join family, Explore my options).
    - 3D Scene: Graduation cap, briefcase, house, and compass. The selected object gently elevates, scales, and highlights with a glowing teal ring underneath.
  - **Screen 2 (Journey Stage):** *“Where are you in your journey?”* (Just exploring, Preparing applications, Accepted / offer received, Preparing to leave, Already abroad).
    - 3D Scene: Miniature winding trail with 5 milestone pedestals. An animated 3D traveler figurine glides smoothly to the selected milestone.
  - **Screen 3 (Starting Location):** *“Where do you currently live?”*
    - Searchable, accessible country combobox powered by a dataset of 180+ countries with exact latitudes and longitudes.
    - 3D Scene: The globe smoothly rotates to face the selected country and plants a 3D location pin with a ground pulse ring.
  - Progress tracked as *“Preview step 1 of 3,”* *“Preview step 2 of 3,”* and *“Preview step 3 of 3”*.

- **Preview Completion Screen:**
  - Headline: *“Your journey is taking shape.”*
  - Summary cards displaying Purpose, Current Stage, and Starting Location.
  - Direct *“Edit answers”* action that allows jumping to any step to revise responses.
  - *“Start again”* action that safely clears local storage and resets the journey.
  - Clear explanation that this is the first onboarding preview without fabricating an artificial moving plan.
  - Celebratory confetti flair on first completion.

- **Storage & State Resilience:**
  - Typed state store in `src/store/onboardingStore.ts` persisting to `localStorage` under `beyondnest_onboarding_v1` with schema version `1`.
  - Data sanitization and recovery: automatically handles corrupt JSON, outdated schemas, and malformed fields by falling back to clean defaults.
  - Refresh and back navigation preserve all valid user answers.

- **Accessibility & Fallback Layer:**
  - Complete WebGL detection and graceful static vector/CSS fallbacks (`FallbackWelcome`, `FallbackPurpose`, `FallbackJourney`, `FallbackCountry`).
  - Automatic reduced-motion support (`prefers-reduced-motion`) simplifying 3D animations and transitions.
  - Animation pausing on tab visibility change (`document.visibilityState === 'hidden'`).
  - Mobile rendering optimization (`dpr={[1, 1.5]}`) and zero horizontal scroll overflow.
  - Full keyboard accessibility and ARIA roles (`role="radiogroup"`, `role="combobox"`, `role="listbox"`, `aria-checked`, `aria-expanded`).

---

## 2. Task 1.1: Correct the Existing Foundation

### Corrections Implemented

1. **Globe and Location-Pin Alignment:**
   - **Unified Geographic Transform:** Re-architected `GlobeMesh.tsx` to accept children directly inside the rotating `<group ref={globeGroupRef}>`. In `CountryGlobeScene.tsx`, the `CountryPin` is now placed inside `GlobeMesh` at its surface coordinates `latLonToVector3(lat, lon, GLOBE_RADIUS)`. The pin remains rigidly anchored to its location during rotation.
   - **Mathematically Verified Camera-Facing Rotation:** Derived and implemented `calculateGlobeTargetQuaternion(lat, lon)` in `src/components/scenes/shared/coordinates.ts` using an orthonormal basis inversion. The target location $\hat{P}$ rotates directly to $(0, 0, +R)$ facing the camera at $+Z$, while the North Pole remains upright in $+Y$ with zero sideways roll ($\hat{N}' \cdot \hat{x} \approx 0$).
   - **Mathematical Tests:** Verified India, Japan, Canada, Australia, Fiji (near Date Line), and Kiribati in `src/tests/globeCoordinates.test.ts`. All locations rotate to $(0, 0, +R)$ within $10^{-3}$ tolerance.
   - **Shortest Geodesic Rotation:** Quaternion spherical linear interpolation (`slerp`) takes the shortest path ($\le 180^\circ$) across longitude boundaries (e.g. Canada to Fiji is $\approx 101.6^\circ$, avoiding unnecessary $360^\circ$ spins).

2. **Accurate Country Coverage and Documentation:**
   - **Canonical Dataset:** Replaced the incomplete 110-entry list with a canonical, documented dataset of **202 sovereign countries and territories** in `src/data/countries.ts`.
   - **Dataset Metadata & Licensing:** Added `COUNTRY_DATASET_METADATA` documenting the source (ISO 3166-1 alpha-2, Natural Earth 1:110m populated places, UN Geoscheme), CC0 1.0 Public Domain license, version date (October 2026), and coverage policy (internationally recognized sovereign states and major territories).
   - **Accurate Coordinates Description:** Clarified in documentation and comments that coordinates represent capital/geographic reference points, not exact boundary geometries.
   - **Validation and Integrity:** Verified unique 2-letter codes, non-empty names, finite coordinate bounds (latitude $[-90, 90]$, longitude $[-180, 180]$), and prefix-prioritized search.

3. **Strengthened Saved-State Validation & Recovery:**
   - **Canonical Data Restoration:** `validateAndSanitizeStoredState` in `src/store/onboardingStore.ts` validates stored country codes against the canonical dataset (`findCountryByCode`) and restores canonical names, coordinates, and regions rather than trusting stored copies. Fabricated codes (e.g. `'XX'`) are rejected and stripped.
   - **Strict Completion Requirement:** `isCompleted` is honored only when all required onboarding questions have valid answers. Arbitrary truthy values or incomplete answers force `isCompleted = false`.
   - **Navigation Clamping:** If stored state is incomplete or partially corrupted, valid answers are preserved, and `currentQuestionId` automatically clamps to the first unanswered required question. Users cannot skip questions through malformed storage.
   - **Non-Fatal Storage Failures:** Wrapped `localStorage` read/write operations in `try/catch` to guarantee storage errors (e.g. quota limits) remain completely non-fatal.
   - **Regression Coverage:** Added 4 focused regression tests in `src/tests/storage.test.ts`.

4. **Complete Keyboard Accessibility:**
   - **Answer Cards:** Refactored `Card.tsx` to use styled native `<input type="radio">` controls inside accessible `<label>` wrappers. Added `:focus-within` visible focus outline in `Card.module.css`.
   - **Radio Group Navigation:** Arrow keys (Up, Down, Left, Right) seamlessly roam and select within the option group; Tab cleanly enters and exits the group.
   - **Country Combobox:**
     - Closes on Escape, clicking outside (`mousedown`/`touchstart`), or when focus leaves the container (`onBlur`).
     - `aria-activedescendant` is set only when an option exists, the list is open, and the index is valid; otherwise it is strictly `undefined`.
     - Zero search results display a polite status message (`role="status"`) without errors or invalid option references.
     - Associated validation errors with the input via `aria-invalid="true"` and `aria-describedby="country-error-{id}"`.

5. **Respect Reduced Motion:**
   - Updated `SummaryScreen.tsx` with `useReducedMotion()`.
   - Suppresses confetti when `prefers-reduced-motion` is enabled and calls `confetti.reset()` to clean up any active animation frames on unmount or setting changes.

6. **Removed Fragile Customisation Dependencies:**
   - Centralized shared 3D brand colors, material settings, and soft lighting in `src/config/theme3d.ts`.
   - Replaced fragile array index lookups (`QUESTIONS[0]`, `QUESTIONS[1]`) in `SummaryScreen.tsx` with stable question ID lookups via `getQuestionById('relocation_purpose')` and `getQuestionById('journey_stage')`.

---

## 3. Task 1.2: Final Interaction Corrections

### Corrections Implemented

1. **CountryCombobox Mouse & Touch Reliability Across Blur Dismissal:**
   - **Root Cause:** Custom dropdown options were previously vulnerable to a race condition where mouse/touch pointer events triggered container blur before the option `click` event could register, unmounting the listbox prematurely.
   - **Solution:** Added `onPointerDown` and `onMouseDown` handlers with `e.preventDefault()` on each option `<li>` to prevent focus loss from the text input during clicks and taps.
   - **Interaction Guard:** Added `isInteractingWithListboxRef` to explicitly guard `handleContainerBlur` against closing the combobox while the user is actively selecting an option.
   - **Input Click Toggle:** Added `onClick` to the combobox input so clicking an already-focused input re-opens the dropdown.
   - **Preserved Features:** Maintained keyboard arrow/Enter selection, Escape dismissal, outside click dismissal, and screen reader announcements.

2. **Card Native Radio Semantics & Duplicate Callback Elimination:**
   - **Root Cause:** `Card.tsx` previously attached `onClick` handlers to both `<label>` and `<input>`, as well as an `onChange` on the `<input>` and a keydown listener on `<label>`. This triggered multiple duplicate callbacks on a single user click.
   - **Solution:** Streamlined `Card.tsx` to strictly use native radio semantics. Removed duplicate `onClick` and `onKeyDown` handlers from the `<label>` and `<input>`.
   - **Genuine Change Guard:** Added `if (!disabled && e.target.checked && !selected)` so callbacks fire strictly once per genuine choice change. Repeated clicks or Space presses on an already-selected choice do not trigger redundant callbacks.
   - **Preserved Accessibility:** Keyboard arrow roaming, Space selection, native screen reader grouping, and visible `:focus-within` focus rings are fully preserved.

3. **Accurate Country Coverage and Multi-Source Provenance:**
   - **Resolved Contradiction:** Corrected the contradictory statement ("195 plus 20 does not equal 202").
   - **Exact Mathematical Breakdown:** Documented the exact composition of the dataset:
     - **193** United Nations Member States
     - **2** United Nations General Assembly Observer States (Holy See / Vatican City: `VA`, State of Palestine: `PS`)
     - **7** self-governing territories / special administrative regions with distinct ISO 3166-1 alpha-2 codes: Bermuda (`BM`), Cayman Islands (`KY`), Greenland (`GL`), Hong Kong (`HK`), Macao (`MO`), Puerto Rico (`PR`), and Taiwan (`TW`).
     - **Sum:** $193 + 2 + 7 = 202$ total entities.
   - **Dynamically Derived Count:** Configured `COUNTRY_DATASET_METADATA.totalCount` to derive directly from `COUNTRIES.length`.
   - **Documented Provenance & Separate Licenses:** Documented exact URLs, versions, and separate applicable licenses for each component without conflating sources:
     - ISO 3166-1 alpha-2 standard (ISO 3166/MA, https://www.iso.org/iso-3166-country-codes.html, open standard nomenclature).
     - Natural Earth 1:110m Cultural Vectors v5.1.2 (https://www.naturalearthdata.com, Public Domain / CC0).
     - United Nations Statistics Division M49 Geoscheme (https://unstats.un.org/unsd/methodology/m49/, open UN statistical terms).

4. **Realistic Interaction Test Suite:**
   - Installed and integrated `@testing-library/user-event`.
   - Created [`src/tests/realisticInteractions.test.tsx`](file:///d:/Personal%20project/BeyondNest/src/tests/realisticInteractions.test.tsx) testing:
     - Focus input, search, and click a country option with mouse/pointer.
     - Keyboard country selection (ArrowDown + Enter) and outside click dismissal.
     - Radio selection through label click, input click, Space key, and Arrow keys.
     - Verification of exactly one selection callback per changed choice (and zero redundant callbacks on re-clicks).
     - Reduced-motion preference enabled before mount: confetti does not run.
     - Runtime reduced-motion preference changes: immediately cleans up active confetti via `confetti.reset()`.
     - Country dataset integrity, breakdown mathematics ($193 + 2 + 7 = 202$), source URLs, and finite coordinate bounds.

---

## 4. Task 2: Complete the Adaptive 3D Onboarding

### Features Implemented

1. **Adaptive Question Engine & Dynamic Conditionality:**
   - Extended the typed question registry (`src/config/questions.ts`) to support all 19 onboarding questions.
   - Replaced static step indices with dynamic progress calculation (`Step X of Y`) reflecting only currently applicable questions for the user's specific path.
   - Dynamic copy resolvers adapt question titles, subtitles, and options based on user journey state (e.g. *"Where would you like to move?"* vs *"Which country did you move to?"* and *"When are you planning to move?"* vs *"When did you arrive?"* for `already_abroad` movers).
   - Upstream dependency invalidation automatically clears invalidated downstream answers (e.g. changing destination resets city and exploration priorities; changing purpose resets study or work branch selections).

2. **Dedicated Citizenship & Passport Model:**
   - Bundled sovereign citizenship data in `src/data/citizenships.ts` (198 sovereign states and international travel document authorities like Hong Kong SAR and Taiwan).
   - Distinguishes sovereign citizenship from territorial residence (e.g. overseas territories map to their sovereign state).
   - Accessible searchable multi-selection with "Skip for now" toggle explaining official entry guidance relevance.
   - 3D Scene: Golden emblem passport beside an illuminated rotating globe (`CitizenshipScene.tsx`) with vector fallback.

3. **Destination Exploration & Priorities:**
   - Supports selecting a destination country or choosing "Help me explore destinations".
   - Exploring movers receive the "What matters most when choosing a destination?" multi-select question (study, work, living costs, language, family, lifestyle).
   - For already-abroad movers, offers an optional "Where did you move from?" origin question (`origin_country_abroad`).
   - 3D Scene: Two-pin origin/destination globe with animated geodesic flight arc when both countries are known (`DestinationGlobeScene.tsx`), and interactive 3D compass with orbiting priority badges (`PrioritiesCompassScene.tsx`).

4. **City Selection:**
   - Shown conditionally when a destination country is selected.
   - Clean free-text input with "Not decided yet" toggle without fake autocomplete. Adapts label for already-abroad movers: *"Which city do you live in?"*.
   - 3D Scene: Isometric miniature city skyline with dynamic location marker pin (`CityScene.tsx`).

5. **Date Validation with Local Calendar Integrity:**
   - Month and year selection (`DateSelect.tsx`) with "Not sure yet" / "Prefer not to say".
   - Validates that future move dates cannot be in the past, and arrival dates for already-abroad movers cannot be in the future, while allowing the current month.
   - 3D Scene: 3D desktop calendar and retro travel suitcase (`CalendarSuitcaseScene.tsx`).

6. **Duration, Travel Style & Backpacking Route:**
   - Stay duration picker (under 6 months, 6–12 months, 1–2 years, >2 years, not sure yet) paired with timeline scene (`TimelineScene.tsx`).
   - Travel style question (Backpacking, Moving to one place, Mix of both, Not sure yet) with dynamic 3D backpack and rolling suitcase scene (`TravelStyleScene.tsx`).
   - Backpacking movers receive the backpacking destinations multi-select question with "Help me plan my route". Order of selection is preserved as a tentative user-defined route without claiming automated route optimization.
   - 3D Scene: Globe displaying interconnected sequential route pins and arcs (`BackpackingGlobeScene.tsx`).

7. **Companions & Budget:**
   - Companions question (Just me, Partner, Family, Friends) paired with stylized low-poly traveler figures (`CompanionsScene.tsx`).
   - Monthly living budget input (`BudgetInput.tsx`) with currency selector (USD, EUR, GBP, CAD, AUD, JPY, INR, CHF, etc.), positive amount validation, "Help me estimate" toggle, and clear exclusion of tuition fees and moving costs.
   - 3D Scene: Embossed 3D leather wallet with floating currency icons (`BudgetWalletScene.tsx`).

8. **Conditional Student & Work Branches:**
   - **Student Branch:** "What level will you study?" (Language, Bachelor's, Master's, Doctorate, Exchange, Other, Not sure) and optional "Which university will you attend?" free text. Paired with 3D campus building and graduation mortarboard (`CampusScene.tsx`).
   - **Work Branch:** "Do you already have a job offer?" (Yes, Interviewing, Not yet, N/A) for planning movers; dynamically adapts to "What is your current work situation?" (Employed, Starting confirmed role, Looking for work, Other) for already-abroad movers. Paired with 3D briefcase and desk workspace scene (`WorkspaceScene.tsx`).

9. **Preparation Status & Help Priorities:**
   - "What have you already arranged?" dynamically surfaces relevant options (admission, job offer, visa/residence permission, housing, insurance, travel booking, or "Nothing yet").
   - "Nothing yet" is strictly mutually exclusive with other selections.
   - 3D Scene: Open travel suitcase with packing checklist items falling in (`PackingSuitcaseScene.tsx`).
   - "What would you like help with first?" (Paperwork, Housing, Budget, Language, Meeting people, Understanding whole process) with miniature neighbourhood scene (`NeighbourhoodPrioritiesScene.tsx`).

10. **Editable Review Screen ("Your next chapter is taking shape"):**
    - Replaced the preview summary with a comprehensive review dashboard organized into 3 logical sections:
      1. *Your journey* (purpose, stage, origin, date, duration, companions)
      2. *Destination and travel style* (citizenship, destination, city, backpacking route, travel style, budget, student/work branch)
      3. *Preparation and priorities* (arrangements completed, priority help areas)
    - **Inline Edit Actions:** Clicking "Edit" navigates directly to the target question.
    - **Guided Return Navigation:** If an edit alters the user's branch (e.g. switching purpose to Study), the engine guides the user through the newly required unanswered questions before returning to review.
    - **Honest Local Saving Status:** Real-time indicator displaying "Saved to browser" or warning banner on local storage quota failures.
    - **Start Again Confirmation:** Accessible modal dialog requiring explicit confirmation before clearing responses.
    - **No Fabricated Planning:** Clearly states that source-backed personalised roadmaps arrive in the next milestone, without nonfunctional generation buttons.

11. **Schema v2 Persistence & Version-1 Migration:**
    - Incremented schema to `CURRENT_SCHEMA_VERSION = 2` under storage key `beyondnest_onboarding_v2`.
    - Automatically migrates existing version-1 storage payloads: preserves valid v1 answers (`relocation_purpose`, `journey_stage`, `current_country`), resets `isCompleted` to `false`, and resumes at `citizenship`.
    - Catches all storage exceptions gracefully.

---

## 5. Validation Matrix

| Check | Tool / Command | Result | Notes |
|---|---|---|---|
| **TypeScript Typecheck** | `npm run typecheck` (`tsc -b`) | **PASS** | 0 type errors across all code, components, and test files. |
| **Linting** | `npm run lint` (`oxlint`) | **PASS** | 0 errors, 0 warnings across 71 files. |
| **Unit & Integration Tests** | `npm test` (`vitest run`) | **PASS** | **66 passed tests across 7 test suites** (includes 26 comprehensive tests in `adaptiveOnboarding.test.tsx`). |
| **Production Build** | `npm run build` (`vite build`) | **PASS** | Built in 965ms with clean chunk splitting and gzip compression. |
| **Dev Server Execution** | `npm run dev` | **PASS** | Running smoothly on `http://localhost:5173/`. |

---

## 6. Limitations & Honest Reporting

- **Automated Browser Subagent Driver Boundary:** Automated Playwright browser downloading continues to be blocked by an external CDN 404 response (`playwright.azureedge.net`) in this environment.
- **Physical WebGL GPU Pixel Boundary:** Automated tests verify DOM accessibility, ARIA compliance, user-event interaction order, blur dismissal guards, storage migration, and 3D coordinate mathematics. They do not prove GPU pixel output or hardware shader compilation on all physical devices.
- **Recommendations Deferred:** No automated recommendation calculations, visa eligibility rules, or live web APIs are implemented in this milestone, in strict accordance with the task specification.

---

## 7. Recommended Next Milestone

- **Milestone 3: Source-Backed Personalised Planning Engine**
  - Implement country-specific requirements, visa timelines, housing checklists, and cost-of-living models backed by authoritative, curated government and institutional sources.

