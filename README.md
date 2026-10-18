# BeyondNest

> **“Your next country. Your next chapter.”**

BeyondNest helps people prepare to move abroad for study, work, family reunification, or exploration (including backpacking and slow travel).

This repository contains **Task 1: Customisable Foundation and 3D Onboarding Preview**, establishing the core architectural foundation, an interactive 3D travel onboarding preview, and resilient state persistence.

---

## Getting Started

### Prerequisites
- Node.js (v18+ or v20+ recommended)
- npm (v9+)

### Installation
```bash
npm install
```

### Development Server
Start the local development server at `http://localhost:5173`:
```bash
npm run dev
```

### Testing
Run automated unit and integration tests via Vitest:
```bash
npm test
```

### Type Checking & Linting
Validate TypeScript types and lint rules:
```bash
npm run typecheck
npm run lint
```

### Production Build
Generate optimized production bundles:
```bash
npm run build
```

---

## What is Included in Milestone 1

1. **Configurable Project Foundation:**
   - React 19 + TypeScript + Vite.
   - React Three Fiber and Drei for interactive 3D scenes.
   - Shared CSS custom properties (`src/styles/tokens.css`) and modular styles (`.module.css`).
   - Clean separation of concerns: brand copy, question definitions, 3D scene registry, and state management.

2. **Welcome Screen:**
   - Prominent 3D globe with recognizable geography, atmospheric cloud sphere, and an airplane flying along an arched flight trajectory.
   - Immediate headline, tagline, and call-to-action button without blocking on 3D assets.

3. **3 Interactive Onboarding Questions:**
   - **Step 1 (Purpose):** *“What brings you to a new country?”* with 3D models (academic cap, briefcase, house, compass) highlighting on selection.
   - **Step 2 (Journey Stage):** *“Where are you in your journey?”* with a 3D winding path and a miniature traveler marker gliding to the active milestone.
   - **Step 3 (Origin Location):** *“Where do you currently live?”* with an accessible country combobox (180+ countries) and a 3D globe rotating to the selected coordinates with a labelled pin.

4. **Preview Completion Screen:**
   - *“Your journey is taking shape.”*
   - Clear summary of the three captured answers with inline *“Edit”* buttons and a *“Start again”* reset control.
   - Explicitly explains this is an onboarding preview without fabricating an artificial moving plan.

5. **Accessibility & Resilience:**
   - Respects `prefers-reduced-motion` across CSS and WebGL.
   - Automatic static vector/CSS fallbacks if WebGL is unavailable.
   - Animation loops pause when the browser tab is hidden.
   - Screen reader accessible native and ARIA controls (`aria-hidden="true"` on 3D canvas).
   - LocalStorage persistence with versioned schema validation (`beyondnest_onboarding_v1`).

---

## Documentation

- [`PROJECT_BRIEF.md`](file:///d:/Personal%20project/BeyondNest/PROJECT_BRIEF.md) — Vision, visual direction, planned topics, and scope.
- [`ARCHITECTURE.md`](file:///d:/Personal%20project/BeyondNest/ARCHITECTURE.md) — Architectural patterns, how to customize themes, questions, scenes, and storage.
- [`TASK_PROGRESS.md`](file:///d:/Personal%20project/BeyondNest/TASK_PROGRESS.md) — Implementation details, test verification, known limitations, and Task 2 roadmap.
