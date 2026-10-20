export type { OnboardingAnswers, RelocationPurpose } from '../store/types'
import type { OnboardingAnswers, RelocationPurpose } from '../store/types'

export type TaskCategory = 
  | 'paperwork' 
  | 'housing' 
  | 'budget' 
  | 'insurance' 
  | 'travel' 
  | 'arrival' 
  | 'daily_life' 
  | 'community'

export type JourneyPhase = 
  | 'start_here' 
  | 'before_departure' 
  | 'arrival_settling'

export interface OfficialResource {
  id: string
  title: string
  url: string
  publisher: string
  destinationCountry?: string // ISO code e.g. 'DE', 'CA', or undefined for global
  topic: string
  reviewedOn: string // e.g. "October 2026"
  summary: string
  scopeAndLimitations: string
}

export interface TaskTemplate {
  id: string
  title: string | ((answers: OnboardingAnswers) => string)
  action: string | ((answers: OnboardingAnswers) => string)
  category: TaskCategory
  phase: JourneyPhase
  whyItAppears: string | ((answers: OnboardingAnswers) => string)
  isDestinationSpecific: boolean
  destinationCountry?: string // e.g. 'DE', 'CA'
  resourceIds?: string[]
  suggestedTiming: string | ((answers: OnboardingAnswers) => string)
  prerequisiteTaskIds?: string[]
  isApplicable: (answers: OnboardingAnswers) => boolean
  computeContextKey: (answers: OnboardingAnswers) => string
}

export interface PersonalisedTask {
  id: string
  title: string
  action: string
  category: TaskCategory
  phase: JourneyPhase
  whyItAppears: string
  isDestinationSpecific: boolean
  destinationCountry?: string
  resources: OfficialResource[]
  suggestedTiming: string
  isArrangedAlready: boolean
  isCompleted: boolean
  completedAt?: string
  prerequisiteTaskIds: string[]
  hasUnmetPrerequisites: boolean
  contextKey: string
}

export interface DestinationPack {
  id: string
  destinationCountry: string
  purpose: RelocationPurpose
  title: string
  description: string
  resources: OfficialResource[]
  taskTemplates: TaskTemplate[]
}

export interface PlanTaskRecord {
  completed: boolean
  completedAt?: string
  contextKey: string
}

export interface StoredPlanState {
  version: number
  updatedAt: string
  destinationCode?: string
  destinationState?: string
  tasks: Record<string, PlanTaskRecord>
  invalidatedTasks?: Array<{
    taskId: string
    taskTitle: string
    reason: string
  }>
}

export interface MovingPlan {
  destinationTitle: string
  destinationCode?: string
  isUndecided: boolean
  hasDestinationPack: boolean
  destinationPackNotice?: string
  priorityFocusExplanation: string
  allTasks: PersonalisedTask[]
  nextThreeTasks: PersonalisedTask[]
  completedCount: number
  totalCount: number
  materialChangeNotice?: string
  budgetSummary?: {
    hasBudget: boolean
    amount?: number
    currency?: string
    helpEstimate: boolean
  }
}
