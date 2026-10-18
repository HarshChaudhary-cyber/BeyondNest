import type { ReactNode } from 'react'
import type { OnboardingAnswers } from '../../store/types'
import { WelcomeGlobeScene } from './WelcomeGlobeScene'
import { PurposeScene } from './PurposeScene'
import { JourneyPathScene } from './JourneyPathScene'
import { CountryGlobeScene } from './CountryGlobeScene'

import { FallbackWelcome } from './fallbacks/FallbackWelcome'
import { FallbackPurpose } from './fallbacks/FallbackPurpose'
import { FallbackJourney } from './fallbacks/FallbackJourney'
import { FallbackCountry } from './fallbacks/FallbackCountry'

export interface SceneConfig {
  renderScene: (props: { answers: OnboardingAnswers; paused: boolean; reducedMotion: boolean }) => ReactNode
  renderFallback: (props: { answers: OnboardingAnswers }) => ReactNode
}

/**
 * Registry mapping scene identifiers to their 3D scene and static fallback components.
 * To introduce a new question scene, register its renderer and fallback here.
 */
export const SCENE_REGISTRY: Record<string, SceneConfig> = {
  welcome_scene: {
    renderScene: ({ paused, reducedMotion }) => (
      <WelcomeGlobeScene paused={paused} reducedMotion={reducedMotion} />
    ),
    renderFallback: () => <FallbackWelcome />
  },
  purpose_scene: {
    renderScene: ({ answers, paused, reducedMotion }) => (
      <PurposeScene 
        selectedPurpose={answers.relocation_purpose} 
        paused={paused}
        reducedMotion={reducedMotion}
      />
    ),
    renderFallback: ({ answers }) => (
      <FallbackPurpose selectedPurpose={answers.relocation_purpose} />
    )
  },
  journey_scene: {
    renderScene: ({ answers, paused, reducedMotion }) => (
      <JourneyPathScene 
        selectedStage={answers.journey_stage} 
        paused={paused}
        reducedMotion={reducedMotion}
      />
    ),
    renderFallback: ({ answers }) => (
      <FallbackJourney selectedStage={answers.journey_stage} />
    )
  },
  country_globe_scene: {
    renderScene: ({ answers, paused, reducedMotion }) => (
      <CountryGlobeScene 
        selectedCountry={answers.current_country} 
        paused={paused}
        reducedMotion={reducedMotion}
      />
    ),
    renderFallback: ({ answers }) => (
      <FallbackCountry selectedCountry={answers.current_country} />
    )
  }
}

export function getSceneConfig(sceneId: string): SceneConfig {
  const config = SCENE_REGISTRY[sceneId]
  if (!config) {
    console.warn(`[BeyondNest] Scene id "${sceneId}" not found in registry, falling back to welcome scene`)
    return SCENE_REGISTRY.welcome_scene
  }
  return config
}
