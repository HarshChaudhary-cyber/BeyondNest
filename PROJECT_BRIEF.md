# BeyondNest — Project Brief

## Project Vision

**BeyondNest** helps people across the globe prepare to move abroad for **study, work, family reunification, or exploration** (including slow travel and backpacking). The application guides movers through an empathetic, structured onboarding journey to capture their context and eventually assemble a clear, personalized preparation plan.

> **Tagline:** “Your next country. Your next chapter.”  
> **Brand Feeling:** “I’m beginning an exciting new chapter abroad, and this website will help me prepare.”

BeyondNest embraces a welcoming, worldwide ethos that never centers the brand on a single nationality or destination corridor. Whether a student is moving from Tokyo to Edinburgh, a software engineer is transferring from Lagos to Toronto, or a backpacker is taking a working holiday in New Zealand, BeyondNest provides a trustworthy, uplifting starting point.

---

## Visual Direction

The visual style is designed to inspire excitement while remaining calm, trustworthy, and accessible:

- **Color Harmony:**
  - **Base Backgrounds:** Warm whites and subtle soft creams (`#FAF9F5`, `#F4F6F8`, `#FFFFFF`).
  - **Atmosphere:** Sky-blue gradients and morning-air ambient lighting (`#E0F2FE`, `#38BDF8`, `#0284C7`).
  - **Text & Contrast:** Deep navy text (`#0F172A`, `#1E293B`, `#334155`) for readable typography and accessibility.
  - **Brand Accent:** Vibrant sea teal (`#0D9488`, `#14B8A6`, `#0F766E`) for interactive focus, selected states, and primary actions.
  - **Warm Highlights:** Amber and coral touches (`#F59E0B`, `#E11D48`) for milestones and destination pins.
- **Lighting & Materials:** Soft multi-point studio lighting, gentle ambient occlusion, rounded corners (`14px` to `28px`), and tactile glassmorphic surfaces.
- **Layout & Rhythm:** Generous spacing, clean hierarchy, and large, comfortable answer cards.
- **Restrained Travel Details:** Arched flight route curves, dashed air-trail borders, and luggage-tag eyelets.
- **Authentic 3D Objects:** Real WebGL 3D geometry rendered using React Three Fiber, with graceful vector fallbacks when hardware acceleration is unavailable. No emojis or flat placeholder icons are substituted for the central 3D scenes.

---

## Milestone 1 Scope (Task 1)

This initial milestone delivers the complete interactive foundation:

1. **Configurable Project Foundation:** Vite + React 19 + TypeScript + CSS Modules + shared CSS custom property tokens.
2. **Welcome Screen:** Prominent 3D globe with recognizable continents, soft clouds, and an airplane following an international flight route. Immediate call-to-action ("Plan my move") without blocking on 3D assets.
3. **Question 1 (Relocation Purpose):** “What brings you to a new country?” (Study, Work, Join family, Explore my options) with an interactive 3D scene (graduation cap, briefcase, house, compass) that lifts and highlights on selection.
4. **Question 2 (Journey Stage):** “Where are you in your journey?” (5 stages) with a miniature 3D winding pathway where a traveler marker glides to the selected milestone.
5. **Question 3 (Current Country):** “Where do you currently live?” with a searchable, keyboard-navigable combobox (180+ countries) paired with a 3D globe that smoothly rotates to the selected coordinates and plants a labelled pin.
6. **Preview Completion Screen:** “Your journey is taking shape.” Summarizes the three answers, provides “Edit answers” and “Start again” actions, and clarifies that this is the first onboarding preview without fabricating an artificial plan.

---

## Planned Future Topics (Roadmap)

The following topics have been recorded for architectural planning and will be added in upcoming milestones:

| Category | Topic | Milestone | Description |
|---|---|---|---|
| **Identity** | Citizenship & Passports | Milestone 2 | Current passports held, dual nationality, and visa-free access rules. |
| **Destination** | Target Destination Country | Milestone 2 | Primary target country or shortlist of prospective countries. |
| **Destination** | Target City / Region | Milestone 2 | Specific metropolis, university town, or regional hub. |
| **Timeline** | Target Relocation Date | Milestone 2 | Target departure month, season, or flexible exploration window. |
| **Timeline** | Intended Stay Duration | Milestone 3 | Short-term (<1 yr), medium-term (1-3 yrs), or permanent settlement. |
| **Logistics** | Backpacking vs. Settling | Milestone 3 | Slow travel / hostel hopping vs. long-term residential lease. |
| **Destination** | Multi-Stop Itineraries | Milestone 3 | Single-country move vs. multi-destination working holiday hops. |
| **Identity** | Companions & Dependents | Milestone 3 | Moving solo, with partner, dependent children, or pets. |
| **Finances** | Relocation Budget & Buffer | Milestone 4 | Savings reserves, visa financial proofs, and living allowances. |
| **Logistics** | Initial Housing Setup | Milestone 4 | Temporary booking (Airbnb/hotel), dorm, or lease before arrival. |
| **Logistics** | Transition Priorities | Milestone 4 | Healthcare access, safety, expat networks, taxes, or language school. |
