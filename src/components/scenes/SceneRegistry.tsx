import type { ReactNode } from 'react'
import type { OnboardingAnswers, CountryInfo } from '../../store/types'
import { WelcomeGlobeScene } from './WelcomeGlobeScene'
import { PurposeScene } from './PurposeScene'
import { JourneyPathScene } from './JourneyPathScene'
import { CountryGlobeScene } from './CountryGlobeScene'
import { CitizenshipScene } from './CitizenshipScene'
import { DestinationGlobeScene } from './DestinationGlobeScene'
import { CityScene } from './CityScene'
import { PrioritiesCompassScene } from './PrioritiesCompassScene'
import { CalendarSuitcaseScene } from './CalendarSuitcaseScene'
import { TimelineScene } from './TimelineScene'
import { TravelStyleScene } from './TravelStyleScene'
import { BackpackingGlobeScene } from './BackpackingGlobeScene'
import { CompanionsScene } from './CompanionsScene'
import { BudgetWalletScene } from './BudgetWalletScene'
import { CampusScene } from './CampusScene'
import { WorkspaceScene } from './WorkspaceScene'
import { PackingSuitcaseScene } from './PackingSuitcaseScene'
import { NeighbourhoodPrioritiesScene } from './NeighbourhoodPrioritiesScene'

import { FallbackWelcome } from './fallbacks/FallbackWelcome'
import { FallbackPurpose } from './fallbacks/FallbackPurpose'
import { FallbackJourney } from './fallbacks/FallbackJourney'
import { FallbackCountry } from './fallbacks/FallbackCountry'
import {
  FallbackCitizenship,
  FallbackDestinationGlobe,
  FallbackCity,
  FallbackPrioritiesCompass,
  FallbackCalendarSuitcase,
  FallbackTimeline,
  FallbackTravelStyle,
  FallbackBackpackingGlobe,
  FallbackCompanions,
  FallbackBudgetWallet,
  FallbackCampus,
  FallbackWorkspace,
  FallbackPackingSuitcase,
  FallbackNeighbourhoodPriorities
} from './fallbacks/Task2Fallbacks'

export interface SceneConfig {
  renderScene: (props: { answers: OnboardingAnswers; paused: boolean; reducedMotion: boolean }) => ReactNode
  renderFallback: (props: { answers: OnboardingAnswers }) => ReactNode
}

/**
 * Registry mapping scene identifiers to their 3D scene and static fallback components.
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
  },
  citizenship_scene: {
    renderScene: ({ answers, paused, reducedMotion }) => (
      <CitizenshipScene
        citizenship={answers.citizenship}
        paused={paused}
        reducedMotion={reducedMotion}
      />
    ),
    renderFallback: ({ answers }) => (
      <FallbackCitizenship answers={answers} />
    )
  },
  destination_globe_scene: {
    renderScene: ({ answers, paused, reducedMotion }) => (
      <DestinationGlobeScene
        originCountry={answers.current_country}
        destinationCountry={answers.destination_country}
        isAlreadyAbroad={answers.journey_stage === 'already_abroad'}
        originAbroad={
          answers.origin_country_abroad && !('preferNotToSay' in answers.origin_country_abroad)
            ? (answers.origin_country_abroad as CountryInfo)
            : undefined
        }
        paused={paused}
        reducedMotion={reducedMotion}
      />
    ),
    renderFallback: ({ answers }) => (
      <FallbackDestinationGlobe answers={answers} />
    )
  },
  city_scene: {
    renderScene: ({ paused, reducedMotion }) => (
      <CityScene paused={paused} reducedMotion={reducedMotion} />
    ),
    renderFallback: ({ answers }) => (
      <FallbackCity answers={answers} />
    )
  },
  priorities_compass_scene: {
    renderScene: ({ answers, paused, reducedMotion }) => (
      <PrioritiesCompassScene
        selectedPriorities={answers.destination_priorities}
        paused={paused}
        reducedMotion={reducedMotion}
      />
    ),
    renderFallback: ({ answers }) => (
      <FallbackPrioritiesCompass answers={answers} />
    )
  },
  calendar_suitcase_scene: {
    renderScene: ({ paused, reducedMotion }) => (
      <CalendarSuitcaseScene paused={paused} reducedMotion={reducedMotion} />
    ),
    renderFallback: () => (
      <FallbackCalendarSuitcase />
    )
  },
  timeline_scene: {
    renderScene: ({ answers, paused, reducedMotion }) => (
      <TimelineScene
        duration={answers.planned_duration}
        paused={paused}
        reducedMotion={reducedMotion}
      />
    ),
    renderFallback: () => (
      <FallbackTimeline />
    )
  },
  travel_style_scene: {
    renderScene: ({ answers, paused, reducedMotion }) => (
      <TravelStyleScene
        style={answers.travel_style}
        paused={paused}
        reducedMotion={reducedMotion}
      />
    ),
    renderFallback: () => (
      <FallbackTravelStyle />
    )
  },
  backpacking_globe_scene: {
    renderScene: ({ answers, paused, reducedMotion }) => (
      <BackpackingGlobeScene
        backpacking={answers.backpacking_destinations}
        paused={paused}
        reducedMotion={reducedMotion}
      />
    ),
    renderFallback: ({ answers }) => (
      <FallbackBackpackingGlobe answers={answers} />
    )
  },
  companions_scene: {
    renderScene: ({ answers, paused, reducedMotion }) => (
      <CompanionsScene
        companions={answers.companions}
        paused={paused}
        reducedMotion={reducedMotion}
      />
    ),
    renderFallback: () => (
      <FallbackCompanions />
    )
  },
  budget_wallet_scene: {
    renderScene: ({ paused, reducedMotion }) => (
      <BudgetWalletScene paused={paused} reducedMotion={reducedMotion} />
    ),
    renderFallback: () => (
      <FallbackBudgetWallet />
    )
  },
  campus_scene: {
    renderScene: ({ paused, reducedMotion }) => (
      <CampusScene paused={paused} reducedMotion={reducedMotion} />
    ),
    renderFallback: () => (
      <FallbackCampus />
    )
  },
  workspace_scene: {
    renderScene: ({ paused, reducedMotion }) => (
      <WorkspaceScene paused={paused} reducedMotion={reducedMotion} />
    ),
    renderFallback: () => (
      <FallbackWorkspace />
    )
  },
  packing_suitcase_scene: {
    renderScene: ({ answers, paused, reducedMotion }) => (
      <PackingSuitcaseScene
        selectedItems={answers.preparation_status}
        paused={paused}
        reducedMotion={reducedMotion}
      />
    ),
    renderFallback: ({ answers }) => (
      <FallbackPackingSuitcase answers={answers} />
    )
  },
  neighbourhood_priorities_scene: {
    renderScene: ({ answers, paused, reducedMotion }) => (
      <NeighbourhoodPrioritiesScene
        selectedPriorities={answers.first_priority}
        paused={paused}
        reducedMotion={reducedMotion}
      />
    ),
    renderFallback: ({ answers }) => (
      <FallbackNeighbourhoodPriorities answers={answers} />
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
