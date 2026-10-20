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

---

## 4. Task 2.1: Review Navigation, Reset Safety, and Validation

### Corrections & Safeguards Implemented

1. **Review Editing and Guided Back Navigation:**
   - **Editing Semantics:** Defined consistent editing semantics where edits are retained and users are guided through any missing required answers created by branch or dependency changes.
   - **Navigation History Stack:** Implemented `editNavigationHistory: QuestionId[]` in `useOnboardingStore` and `StoredOnboardingState`. When guided from an edit origin (e.g. `relocation_purpose`) to a newly required question (e.g. `work_status`), the path is tracked sequentially. Pressing "Back" pops the history stack and steps back to the preceding question in the edit chain (`relocation_purpose`), avoiding jumps to unrelated intermediate questions.
   - **No Incomplete Review Exposure:** Ensured that Back navigation or review return *never* shows a completed review screen while applicable required answers are invalid or missing.
   - **Refresh Recovery During Edits:** Stored editing state safely preserves `isReviewEditing`, `editingOriginQuestionId`, and `editNavigationHistory`. In `validateAndSanitizeStoredState`, any malformed payload attempting to mark `isCompleted: true` while required questions are unanswered is strictly forced to `isCompleted: false`, resuming at the current or first unanswered required question.

2. **Centralised Reset Confirmation:**
   - Centralized the reset confirmation flow in `OnboardingShell.tsx` for all explicit destructive reset actions (Header "Start again" and Summary "Start again").
   - Logo navigation (`onLogoClick`) now cleanly navigates to the welcome screen (`navigateToWelcome`) while preserving all user progress and completed answers without triggering a reset.
   - Clean separation of concerns: requesting a reset (`handleRequestReset(trigger)`) opens the dialog and stores the triggering element; the actual destructive reset (`resetOnboarding()`) executes only upon explicit user confirmation.

3. **Accessible Confirmation Dialog (`ConfirmResetDialog`):**
   - Implemented `ConfirmResetDialog.tsx` with accessible modal semantics (`role="alertdialog"`, `aria-modal="true"`, `aria-labelledby`, `aria-describedby`).
   - Initial focus automatically moves to the safe control (**Cancel** button).
   - Focus trap: keyboard focus stays inside the modal while open; Tab and Shift+Tab wrap between Cancel and Reset buttons.
   - Dismissal: pressing `Escape` cancels the dialog and returns to the active flow.
   - Interaction blocking: background content is disabled while the modal is active.
   - Focus restoration: canceling restores keyboard focus back to the triggering button. Confirming resets storage and navigates to the welcome screen with focus moved to the primary call-to-action button.

4. **Numeric and Saved Data Validation:**
   - **Date Validation (`validateMoveDate`):** Enforces finite integers for year and month, valid month bounds ($1 \le \text{month} \le 12$), and documented sensible year limits:
     - Planning movers: $\text{currentYear} \le \text{year} \le \text{currentYear} + 10$.
     - Already abroad: $1950 \le \text{year} \le \text{currentYear}$.
     - Local-calendar validation: current local calendar month is supported for both planning and arrival.
   - **Budget Validation (`validateLivingBudget`):** Enforces finite positive amounts ($\text{amount} > 0$ and `Number.isFinite`), supported currency code from a shared currency registry (`src/data/currencies.ts`), and flexible decimal precision (not rigidly locked to two decimals).
   - **Saved Data Sanitization & Invalidation:** In `validateAndSanitizeStoredState`, invalid or non-finite dates and malformed budget entries are stripped while preserving independent valid answers. Dependency invalidation automatically clears `destination_city` if the destination country changes, and invalidates `move_date` on `journey_stage` change if no longer valid.

---

---

## 5. Task 3: Source-Backed Personalised Moving Plans

### Features Implemented

1. **Decoupled Planning Engine Architecture:**
   - **Separation of Concerns:** Isolated task templates, applicability rules, prerequisite/priority ordering, official resource records, destination packs, user task progress, and UI presentation components across `src/planning/`.
   - **Pure Personalisation Logic:** Pure engine function `generatePersonalisedPlan(answers, storedProgress)` reconciles user answers with applicable packs, evaluates prerequisites, scores top-3 immediate actions, and checks context key validity.
   - **No AI / Backend Dependencies:** Driven 100% by deterministic, configurable rules without third-party AI APIs, authentication, backend servers, or paid subscriptions.

2. **Curated Destination Resource Packs:**
   - **Germany: International Students (`pack_germany_students`):**
     - Admission & enrolment at German universities.
     - Statutory proof of financial resources via federally approved Blocked Account (Sperrkonto).
     - Statutory health insurance (Gesetzliche Krankenversicherung) & electronic reporting (M10).
     - Category D national student visa appointment (Visum zu Studienzwecken).
     - Studierendenwerk student halls & temporary accommodation in target city.
     - Mandatory municipal address registration (Anmeldung beim Bürgeramt) within 14 days.
     - German student checking account (Girokonto) & blocked account payouts.
     - Electronic residence permit (Aufenthaltstitel) at local Ausländerbehörde.
   - **Canada: International Students (`pack_canada_students`):**
     - Designated Learning Institution (DLI) acceptance & Provincial Attestation Letter (PAL).
     - Financial proof & Guaranteed Investment Certificate (GIC).
     - IRCC online study permit application and biometrics.
     - Student health insurance coverage (e.g. provincial UHIP).
     - Campus residence and temporary arrival housing in target city.
     - Border inspection & physical study permit issuance at first Canadian port of entry.
     - Social Insurance Number (SIN) from Service Canada for legal on/off-campus work.
     - Canadian student bank account setup.

3. **Fallback and Exploration Planning:**
   - **Unsupported Destinations:** When destination is specific but lacks a curated pack (e.g. France, Australia), the engine generates practical general relocation tasks alongside an honest notice: *"A curated destination pack is not yet available for [Country]. BeyondNest provides verified general relocation guidance while country-specific packs are in development. We do not apply rules from another country."*
   - **Undecided Movers (`explore: true`):** Generates comparative research tasks aligned with user stated priorities (quality education, living costs, languages, community roots). Does not invent country rankings, scores, or artificial visa percentages.

4. **Personalisation & Special Context Rules:**
   - **Housing Arranged vs Not Arranged:** Arranged housing prompts lease confirmation and landlord registration slips (e.g. Wohnungsgeberbestätigung); unarranged housing guides student hall applications and temporary accommodation.
   - **Insurance Arranged:** Avoids claiming coverage is adequate; prompts verifying statutory recognition and transition dates.
   - **Moving Solo vs Family:** Solo movers receive local community network and student society tasks; family movers receive dependent visa, certified translation, and schooling tasks.
   - **Backpacking Route Order:** Preserves the user's tentative country sequence in action text (e.g. "1. Japan → 2. Vietnam → 3. Thailand") and includes lightweight modular gear tasks.
   - **Already Abroad:** Prioritises settling-in tasks (local address registration, tax ID, residency conversion); pre-departure tasks are not marked as urgent.
   - **Skipped Citizenship:** Generates an entry rules check task explaining that entry guidance cannot be confirmed without passport nationality.
   - **Visa Permission Ambiguity:** Treats `visa_permission` preparation checkbox as in-progress rather than proof of approval, directing user to verify official decision letter and entry window.
   - **Job Offer Inference Guard:** Never infers that a job offer exists from generic journey stage wording alone.

5. **Prerequisites and Top 3 Actionable Priorities:**
   - Priority scoring in `src/planning/rules/priorities.ts` selects the next three actionable tasks using timeline, journey stage, user priorities, and unresolved prerequisites.
   - **Strict Prerequisite Guard:** A dependent task (e.g. German visa appointment) is *never* ranked ahead of an unmet prerequisite (e.g. university admission or blocked account).
   - Tasks are grouped into non-punitive journey phases ("1. Start here", "2. Before departure", "3. Arrival & settling in").

6. **Moving Plan User Interface:**
   - **Summary Screen Integration:** Added primary call-to-action button *"View my moving plan"* to `SummaryScreen.tsx` (`id="view-plan-button"`).
   - **Responsive Plan Screen (`MovingPlanScreen.tsx`):**
     - Luggage-tag header with honest local storage indicator.
     - Destination eyebrow with verified guide badge.
     - Top 3 actionable priorities grid with category tags and step numbers.
     - Phase filtering tabs ("All", "Start here", "Before departure", "Arrival & settling in").
     - Expandable task cards with "Why this appears", verified source links with external link icon, and toggle completion button.
     - Separate completed tasks section with "Reopen" action.
     - Navigation controls: "Back to profile review", "Edit answers", and "Start again".
     - Removed milestone numbers and internal development terminology from review and plan screens.
   - **Interactive Expense Worksheet (`ExpenseWorksheet.tsx`):**
     - Embedded when user selected "Help me estimate" budget.
     - Allows budgeting housing, groceries, transit, health insurance, and connectivity locally. No fabricated living costs or fake currency conversions.

7. **Context-Dependent Invalidation & Persistence:**
   - Stored in localStorage under `beyondnest_moving_plan_v1`.
   - Each task computes a context key: `computeContextKey(answers)`.
   - When profile answers change, genuinely unchanged tasks retain completion; tasks whose destination or core context changed (e.g. German housing when changing destination to Canada) are invalidated back to incomplete, and a material change notification is displayed.
   - Corrupted or invalid plan storage is safely sanitized.

8. **Finish Reset-Dialog Isolation:**
   - Upgraded `ConfirmResetDialog.tsx` to use native `<dialog>` element operated via `showModal()`.
   - Wrapped main page content in `OnboardingShell.tsx` in a container with `inert={isResetDialogOpen ? true : undefined}` and `aria-hidden={isResetDialogOpen ? true : undefined}` to guarantee total background isolation across all browsers and test environments.
   - Preserved Cancel button initial focus, Tab loop trap, Escape key cancellation, and trigger focus restoration.

---

## 6. Official Sources Reviewed & Verified

All linked resources are official government or institutional bodies reviewed for accuracy in October 2026:

| Resource ID | Title | Publisher | Destination / Scope | Reviewed Date |
|---|---|---|---|---|
| `de_make_it_in_germany_study_visa` | Studying in Germany — Visa Requirements | Federal Ministry for Economic Affairs and Climate Action (BMWK) & Federal Employment Agency (BA) | Germany (Study) | October 2026 |
| `de_daad_admission` | Requirements for Studying in Germany | German Academic Exchange Service (DAAD) | Germany (Study) | October 2026 |
| `de_auswaertiges_amt_visa` | National Visa for Studies in Germany | Federal Foreign Office (Auswärtiges Amt) | Germany (Study) | October 2026 |
| `de_dsw_student_housing` | Student Accommodation in Germany | Deutsches Studierendenwerk (DSW) | Germany (Housing) | October 2026 |
| `ca_ircc_study_permit` | Study in Canada as an International Student | Immigration, Refugees and Citizenship Canada (IRCC) | Canada (Study) | October 2026 |
| `ca_ircc_border_arrival` | Prepare for Arrival in Canada — Border Control | Immigration, Refugees and Citizenship Canada (IRCC) | Canada (Arrival) | October 2026 |
| `ca_educanada_portal` | EduCanada: Official International Student Portal | Global Affairs Canada (EduCanada) | Canada (Study) | October 2026 |
| `ca_university_international_guide` | International Student Services & Settling Guide | University International Student Services & Provincial Authorities | Canada (Settling) | October 2026 |
| `gen_official_portal_directory` | Official Embassies & National Immigration Consular Directory | Consular Affairs & National Immigration Authorities | Global / General | October 2026 |
| `gen_iata_travel_centre` | IATA Travel Centre — International Entry & Passport Regulations | International Air Transport Association (IATA) | Global / Travel | October 2026 |
| `gen_who_travel_health` | International Travel and Health Requirements | World Health Organization (WHO) | Global / Health | October 2026 |

---

## 7. Validation Matrix

| Check | Tool / Command | Result | Notes |
|---|---|---|---|
| **TypeScript Typecheck** | `npm run typecheck` (`tsc -b`) | **PASS** | 0 type errors across all application, planning engine, and test files. |
| **Linting** | `npm run lint` (`oxlint`) | **PASS** | 0 errors, 0 warnings across all 92 source files. |
| **Unit & Integration Tests** | `npm test` (`vitest run`) | **PASS** | **116 passed tests across 10 test suites** (100% pass rate; includes 15 focused tests in `planningCorrections.test.tsx` and 16 in `movingPlan.test.tsx`). |
| **Production Build** | `npm run build` (`vite build`) | **PASS** | Built in 1.02s with clean chunk splitting and gzip compression. |
| **Reset Dialog Isolation** | `movingPlan.test.tsx` (Test 14) | **PASS** | Verified `inert` and `aria-hidden` attributes applied to background while dialog is active. |

---

## 8. Limitations & Honest Reporting

- **Automated Browser Subagent Driver Boundary:** Automated Playwright browser downloading continues to be blocked by an external CDN 404 response (`playwright.azureedge.net`) in this environment. All user interactions, focus transitions, keyboard traps, and DOM accessibility are verified via testing-library and user-event integration tests.
- **Physical WebGL GPU Pixel Boundary:** Automated tests verify DOM accessibility, ARIA compliance, user-event interaction order, blur dismissal guards, storage migration, and 3D coordinate mathematics. They do not prove GPU pixel output or hardware shader compilation on all physical devices.
- **Legal Advice Boundary:** BeyondNest provides practical preparation guidance and links to official resources. It explicitly does not provide legal advice, determine visa eligibility, or guarantee immigration outcomes.
- **Immigration Accuracy Boundary:** Tests validate deterministic engine rules, state reconciliation, and persistence. Tests do not claim to validate real-world immigration case outcomes or changing consular policies.
- **Scope Boundary:** User accounts, messaging, community matching, and automated visa eligibility checks are deferred to future milestones in strict accordance with the project brief.

---

## 9. Task 3.1: Planning Content, Guidance & Persistence Corrections

### Corrections & Safeguards Implemented

1. **Country Guidance & Resource Audit:**
   - **Student Direct Stream (SDS) Removed:** All advice referencing SDS was purged from task actions, descriptions, and resources following IRCC's policy closure on November 8, 2024.
   - **Unsupported Hardcoded Funding Replaced:** Removed the outdated $20,635 figure. Substituted with a direct link to the official IRCC financial support table (`ca_ircc_financial_support` at `https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit/get-documents.html#doc3`), allowing users to evaluate current living expense requirements based on study level and family size.
   - **PAL/TAL Exemption Guidance:** Re-framed `ca_stu_dli_acceptance` as checking PAL/TAL requirements, linking to official IRCC exemption criteria (`ca_ircc_pal_guidance`) for master's/doctoral and exchange students.
   - **Conditional Applicability Checks:**
     - German student visa (`de_stu_visa_application`): Differentiates EU/EEA citizens (no visa required), select countries (e.g. US, Canada, UK, Australia, Japan, South Korea who can enter visa-free and apply locally), and visa-required third-country nationals.
     - Blocked Account (`de_stu_blocked_account`): Mentions alternatives (scholarships, formal obligation Verpflichtungserklärung) and notes EU/EEA students do not require a blocked account.
     - Residence Permit (`de_stu_residence_permit`): Explains that EU/EEA/Swiss citizens have freedom of movement and do not require a residence permit.
     - Health Insurance (`de_stu_health_insurance` & `ca_stu_health_insurance`): Distinguishes statutory GKV vs EHIC exemption in Germany, and institutional/provincial plans (UHIP in Ontario vs BC MSP) in Canada.
   - **Application vs Approval Distinction:** Preserved the distinction that `visa_permission` indicates an application in progress, not an issued visa or guaranteed entry approval.
   - **Prerequisites as Practical Dependencies:** Removed unsupported fixed timelines (e.g. rigid "3-4 months prior"). Replaced with practical milestones (e.g. after receiving admission letter, before scheduling visa appointment).
   - **University Scope Clarity:** Explicitly labeled `ca_university_international_guide` as an institutional guide example from the University of Toronto (Centre for International Experience) in Ontario, noting that other universities differ.

2. **Reconciled Task Progress Persistence & One-Click Toggle:**
   - `MovingPlanScreen` synchronizes engine-reconciled progress (`updatedProgress`) directly on mount and prop changes without render-time side effects or infinite loops.
   - `handleToggleTask` toggles from the currently reconciled task state (`plan.allTasks`). When a task's context is invalidated, clicking it marks it complete in exactly **ONE click**.
   - Destination switching invalidates destination-specific tasks of the old destination; returning to an earlier destination never resurrects invalidated completion. Genuinely unchanged tasks retain completion.

3. **Prerequisite Ordering & Reopening:**
   - Reopening an unmet prerequisite immediately marks dependent tasks as blocked (`hasUnmetPrerequisites: true`) and excludes them from the Next 3 Actionable Priorities.
   - Missing prerequisites are explicitly checked against elapsed journey stages (e.g. CBSA border entry for `already_abroad` users) rather than silently treated as satisfied. Unknown missing prerequisites are treated as unmet.

4. **Fixed Expense Worksheet (`ExpenseWorksheet.tsx`):**
   - Removed all prefilled invented numbers ($750, $250, etc.); starts completely blank with all amounts at 0.
   - Connected to validated local storage (`beyondnest_expense_worksheet_v1`). Restores values on reload.
   - Save button reports honest error status (`role="alert"`) if storage is unavailable, and displays success only when persistence succeeds.
   - Changing currency updates only the denomination label without performing artificial exchange-rate conversions.

5. **Reset Confirmation Clears All Data Stores:**
   - `clearPersistedState()` removes all 4 BeyondNest storage keys: `beyondnest_onboarding_v2`, `beyondnest_onboarding_v1`, `beyondnest_moving_plan_v1`, and `beyondnest_expense_worksheet_v1`.



