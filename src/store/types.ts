/**
 * BeyondNest Domain and Onboarding State Types
 * Complete typed question, answer, and scene models for adaptive onboarding.
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

export interface CitizenshipAnswer {
  codes: string[]
  skipped?: boolean
}

export type DestinationCountryAnswer = 
  | (CountryInfo & { explore?: false })
  | { explore: true; code?: undefined; name?: undefined }

export type OriginCountryAbroadAnswer = 
  | CountryInfo 
  | { preferNotToSay: true; code?: undefined; name?: undefined }

export interface DestinationCityAnswer {
  cityName?: string
  notDecided?: boolean
}

export type DestinationPriority = 
  | 'study_opportunities'
  | 'work_opportunities'
  | 'living_costs'
  | 'language'
  | 'family_connections'
  | 'lifestyle_community'

export type DestinationPrioritiesAnswer = DestinationPriority[]

export interface MoveDateAnswer {
  year?: number
  month?: number    // 1-12
  notSureYet?: boolean      // for preparing users
  preferNotToSay?: boolean  // for already-abroad users
}

export type PlannedDurationAnswer = 
  | 'under_6_months'
  | '6_to_12_months'
  | '1_to_2_years'
  | 'more_than_2_years'
  | 'not_sure'

export type TravelStyleAnswer = 
  | 'backpacking'
  | 'settling'
  | 'mix'
  | 'not_sure'

export interface BackpackingDestinationsAnswer {
  destinations: CountryInfo[]   // Order represents user's tentative route
  planRouteForMe?: boolean
}

export type CompanionsAnswer = 
  | 'solo'
  | 'partner'
  | 'family'
  | 'friends'

export interface LivingBudgetAnswer {
  currency: string
  amount?: number
  helpEstimate?: boolean
}

export type StudyLevelAnswer = 
  | 'language_prep'
  | 'bachelors'
  | 'masters'
  | 'doctorate'
  | 'exchange_short'
  | 'other'
  | 'not_sure'

export interface UniversityNameAnswer {
  name?: string
  notDecided?: boolean
}

export type WorkStatusAnswer = 
  | 'yes_offer'
  | 'interviewing'
  | 'not_yet'
  | 'not_applicable'
  | 'employed'
  | 'starting_soon'
  | 'looking'
  | 'other'

export type PreparationItem = 
  | 'admission_enrolment'
  | 'job_offer'
  | 'visa_permission'
  | 'housing'
  | 'insurance'
  | 'travel_booking'
  | 'nothing_yet'

export type PreparationStatusAnswer = PreparationItem[]

export type PriorityArea = 
  | 'paperwork'
  | 'housing'
  | 'budget'
  | 'language_daily_life'
  | 'meeting_people'
  | 'whole_process'

export type FirstPriorityAnswer = PriorityArea[]

export type QuestionId = 
  | 'relocation_purpose'
  | 'journey_stage'
  | 'current_country'
  | 'citizenship'
  | 'destination_country'
  | 'origin_country_abroad'
  | 'destination_city'
  | 'destination_priorities'
  | 'move_date'
  | 'planned_duration'
  | 'travel_style'
  | 'backpacking_destinations'
  | 'companions'
  | 'living_budget'
  | 'study_level'
  | 'university_name'
  | 'work_status'
  | 'preparation_status'
  | 'first_priority'
  | (string & {})

export interface OnboardingAnswers {
  relocation_purpose?: RelocationPurpose
  journey_stage?: JourneyStage
  current_country?: CountryInfo
  citizenship?: CitizenshipAnswer
  destination_country?: DestinationCountryAnswer
  origin_country_abroad?: OriginCountryAbroadAnswer
  destination_city?: DestinationCityAnswer
  destination_priorities?: DestinationPrioritiesAnswer
  move_date?: MoveDateAnswer
  planned_duration?: PlannedDurationAnswer
  travel_style?: TravelStyleAnswer
  backpacking_destinations?: BackpackingDestinationsAnswer
  companions?: CompanionsAnswer
  living_budget?: LivingBudgetAnswer
  study_level?: StudyLevelAnswer
  university_name?: UniversityNameAnswer
  work_status?: WorkStatusAnswer
  preparation_status?: PreparationStatusAnswer
  first_priority?: FirstPriorityAnswer
  [key: string]: unknown
}

export type QuestionType = 
  | 'single_choice' 
  | 'country_select'
  | 'citizenship_select'
  | 'destination_country_select'
  | 'city_input'
  | 'multi_choice'
  | 'date_select'
  | 'backpacking_destinations_select'
  | 'budget_input'
  | 'university_input'

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
  title: string | ((answers: OnboardingAnswers) => string)
  subtitle?: string | ((answers: OnboardingAnswers) => string)
  helperText?: string | ((answers: OnboardingAnswers) => string)
  type: QuestionType
  options?: QuestionOption[] | ((answers: OnboardingAnswers) => QuestionOption[])
  maxSelections?: number
  sceneId: string
  isRequired: boolean
  isVisible?: (answers: OnboardingAnswers) => boolean
  validate: (value: unknown, answers?: OnboardingAnswers) => { valid: boolean; error?: string }
}

export type StorageStatus = 'saved' | 'error' | 'disabled'

export interface StoredOnboardingState {
  version: number
  updatedAt: string
  answers: OnboardingAnswers
  currentQuestionId?: QuestionId
  isCompleted: boolean
  isReviewEditing?: boolean
  editingOriginQuestionId?: QuestionId | null
  editNavigationHistory?: QuestionId[]
  storageStatus?: StorageStatus
}

export type FlowScreen = 
  | { type: 'welcome' }
  | { type: 'question'; questionId: QuestionId }
  | { type: 'summary' }
  | { type: 'plan' }
