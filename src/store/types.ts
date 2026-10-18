/**
 * BeyondNest Domain and Onboarding State Types
 */

export type RelocationPurpose = 'study' | 'work' | 'family' | 'explore'

export type JourneyStage = 
  | 'exploring' 
  | 'preparing_apps' 
  | 'accepted_offer' 
  | 'preparing_leave' 
  | 'already_abroad'

export interface CountryInfo {
  code: string        // ISO 3166-1 alpha-2
  name: string
  lat: number
  lon: number
  region: string
  flag?: string
}

export type QuestionId = 'relocation_purpose' | 'journey_stage' | 'current_country' | (string & {})

export interface OnboardingAnswers {
  relocation_purpose?: RelocationPurpose
  journey_stage?: JourneyStage
  current_country?: CountryInfo
  [key: string]: unknown
}

export type QuestionType = 'single_choice' | 'country_select'

export interface QuestionOption<T = string> {
  id: T
  label: string
  description?: string
  badge?: string
  iconName?: string
}

export interface QuestionDefinition {
  id: QuestionId
  order: number
  title: string
  subtitle?: string
  helperText?: string
  type: QuestionType
  options?: QuestionOption[]
  sceneId: string
  isRequired: boolean
  isVisible?: (answers: OnboardingAnswers) => boolean
  validate: (value: unknown) => { valid: boolean; error?: string }
}

export interface StoredOnboardingState {
  version: number
  updatedAt: string
  answers: OnboardingAnswers
  currentQuestionId?: QuestionId
  isCompleted: boolean
}

export type FlowScreen = 
  | { type: 'welcome' }
  | { type: 'question'; questionId: QuestionId }
  | { type: 'summary' }
