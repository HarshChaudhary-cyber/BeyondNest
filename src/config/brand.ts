/**
 * BeyondNest Brand Copy and Navigation Labels
 * Centralized for localization readiness and clean separation of concerns.
 */

export const BRAND = {
  name: 'BeyondNest',
  tagline: 'Your next country. Your next chapter.',
  description: 'BeyondNest helps people prepare to move abroad for study, work, family, or exploration, including backpacking.',
  
  welcome: {
    badge: 'Onboarding Preview',
    headline: 'A new country. A new chapter. Let’s get you ready.',
    supportingText: 'Tell us about your move. Build a clearer path to your next home.',
    primaryButton: 'Plan my move',
    secondaryNote: 'Takes about 2 minutes • No account required',
  },

  navigation: {
    back: 'Back',
    continue: 'Continue',
    editAnswers: 'Edit answers',
    startAgain: 'Start again',
    stepProgressPrefix: 'Preview step',
    stepProgressOf: 'of',
  },

  summary: {
    headline: 'Your journey is taking shape.',
    supportingText: 'This is the first onboarding preview of BeyondNest. In this milestone, we’ve captured the foundation of your relocation story. Future milestones will unlock personalized moving checklists, destination insights, budget calculators, and community connections.',
    badge: 'Preview Milestone 1 Complete',
    purposeLabel: 'Purpose for Moving',
    stageLabel: 'Current Stage',
    countryLabel: 'Starting Location',
    nextMilestoneNote: 'Future milestones will introduce citizenship details, destination cities, move timelines, settling vs. backpacking preferences, and budget planning tools.',
  },

  accessibility: {
    globeLabel: 'Interactive 3D representation of the globe',
    sceneAltStudy: 'Stylized 3D academic cap representing study abroad',
    sceneAltWork: 'Stylized 3D briefcase representing international career',
    sceneAltFamily: 'Stylized 3D home representing joining family or partners',
    sceneAltExplore: 'Stylized 3D compass representing travel and backpacking exploration',
    milestonesAlt: 'A winding pathway with five travel milestone markers',
  }
} as const
