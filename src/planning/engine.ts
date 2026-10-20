import type { OnboardingAnswers } from '../store/types'
import type { 
  MovingPlan, 
  PersonalisedTask, 
  TaskTemplate, 
  StoredPlanState,
  PlanTaskRecord
} from './types'
import { findMatchingDestinationPack } from './packs'
import { generalTasks } from './templates/generalTasks'
import { researchTasks } from './templates/researchTasks'
import { specialContextTasks } from './templates/specialContextTasks'
import { getOfficialResourceById } from './resources'
import { selectNextThreeTasks, checkHasUnmetPrerequisites } from './rules/priorities'
import { DEFAULT_PLAN_STATE } from './storage'

/**
 * Resolves dynamic or static text properties based on user onboarding answers.
 */
function resolveText(
  prop: string | ((answers: OnboardingAnswers) => string),
  answers: OnboardingAnswers
): string {
  if (typeof prop === 'function') {
    return prop(answers)
  }
  return prop
}

export interface EngineResult {
  plan: MovingPlan
  updatedProgress: StoredPlanState
}

/**
 * Generates a fully personalised, source-backed moving plan from onboarding answers
 * and reconciles with local task progress.
 */
export function generatePersonalisedPlan(
  answers: OnboardingAnswers,
  storedProgress: StoredPlanState = DEFAULT_PLAN_STATE
): EngineResult {
  // 1. Determine destination status and matching pack
  const destCountry = answers.destination_country
  const isUndecided = Boolean(destCountry && 'explore' in destCountry && destCountry.explore)
  const destCode = destCountry && 'code' in destCountry ? destCountry.code : undefined
  const destName = destCountry && 'name' in destCountry ? destCountry.name : undefined

  let destinationTitle = 'Your destination'
  if (isUndecided) {
    destinationTitle = 'Exploring destinations'
  } else if (destName) {
    destinationTitle = destName
  }

  const matchingPack = findMatchingDestinationPack(answers)
  const hasDestinationPack = Boolean(matchingPack)

  let destinationPackNotice: string | undefined = undefined
  if (isUndecided) {
    destinationPackNotice = 'Exploring destinations: Your moving plan focuses on comparative research and decision criteria aligned with your stated priorities. BeyondNest does not invent country rankings or suitability scores.'
  } else if (!hasDestinationPack && destName) {
    destinationPackNotice = `A curated destination pack is not yet available for ${destName}. BeyondNest provides verified general relocation guidance while country-specific packs are in development. We do not apply rules from another country.`
  }

  // 2. Collect all candidate task templates
  const candidateTemplates: TaskTemplate[] = []

  if (matchingPack) {
    candidateTemplates.push(...matchingPack.taskTemplates)
  } else if (isUndecided) {
    candidateTemplates.push(...researchTasks)
  } else {
    candidateTemplates.push(...generalTasks)
  }

  // Add special context tasks (backpacking, solo, family, already abroad, skipped citizenship, etc.)
  candidateTemplates.push(...specialContextTasks)

  // Filter templates strictly by applicability
  const applicableTemplates = candidateTemplates.filter(template => template.isApplicable(answers))

  // 3. Reconcile task completion and detect context invalidation
  const updatedTasksMap: Record<string, PlanTaskRecord> = { ...storedProgress.tasks }
  const newlyInvalidated: Array<{ taskId: string; taskTitle: string; reason: string }> = []

  // Track unique templates by ID to prevent duplicates
  const seenIds = new Set<string>()
  const uniqueTemplates: TaskTemplate[] = []
  for (const t of applicableTemplates) {
    if (!seenIds.has(t.id)) {
      seenIds.add(t.id)
      uniqueTemplates.push(t)
    }
  }

  const personalisedTasks: PersonalisedTask[] = uniqueTemplates.map(template => {
    const currentContextKey = template.computeContextKey(answers)
    const existingRecord = updatedTasksMap[template.id]
    const title = resolveText(template.title, answers)
    const action = resolveText(template.action, answers)
    const whyItAppears = resolveText(template.whyItAppears, answers)
    const suggestedTiming = resolveText(template.suggestedTiming, answers)

    let isCompleted = false
    let completedAt: string | undefined = undefined

    if (existingRecord) {
      if (existingRecord.contextKey !== currentContextKey) {
        // Context changed! Invalidate completion if it was marked completed
        if (existingRecord.completed) {
          newlyInvalidated.push({
            taskId: template.id,
            taskTitle: title,
            reason: `Destination, stage, or prerequisite parameters were updated in your profile.`
          })
        }
        // Update record with new context key and reset completed
        updatedTasksMap[template.id] = {
          completed: false,
          contextKey: currentContextKey
        }
        isCompleted = false
      } else {
        // Context matched: preserve completion status
        isCompleted = existingRecord.completed
        completedAt = existingRecord.completedAt
      }
    } else {
      // Initialize record
      updatedTasksMap[template.id] = {
        completed: false,
        contextKey: currentContextKey
      }
    }

    // Resolve attached resources
    const resources = (template.resourceIds || [])
      .map(id => getOfficialResourceById(id))
      .filter((r): r is NonNullable<typeof r> => Boolean(r))

    // Determine whether this task reflects something already arranged in onboarding
    let isArrangedAlready = false
    if (template.category === 'housing' && answers.preparation_status?.includes('housing')) {
      isArrangedAlready = true
    } else if (template.category === 'insurance' && answers.preparation_status?.includes('insurance')) {
      isArrangedAlready = true
    }

    return {
      id: template.id,
      title,
      action,
      category: template.category,
      phase: template.phase,
      whyItAppears,
      isDestinationSpecific: template.isDestinationSpecific,
      destinationCountry: template.destinationCountry,
      resources,
      suggestedTiming,
      isArrangedAlready,
      isCompleted,
      completedAt,
      prerequisiteTaskIds: template.prerequisiteTaskIds || [],
      hasUnmetPrerequisites: false, // will be computed next
      contextKey: currentContextKey
    }
  })

  // 4. Update unmet prerequisites across all tasks
  for (const task of personalisedTasks) {
    task.hasUnmetPrerequisites = checkHasUnmetPrerequisites(task, personalisedTasks)
  }

  // 5. Select next three actionable tasks
  const nextThreeTasks = selectNextThreeTasks(personalisedTasks, answers)

  // 6. Build priority focus explanation
  let priorityFocusExplanation = 'Based on your relocation profile'
  if (answers.first_priority && answers.first_priority.length > 0) {
    const pNames = answers.first_priority.join(', ').replace(/_/g, ' ')
    priorityFocusExplanation = `Prioritised around your focus areas: ${pNames}`
  } else if (answers.journey_stage === 'already_abroad') {
    priorityFocusExplanation = 'Prioritised around municipal registrations and settling in'
  } else if (answers.journey_stage === 'exploring') {
    priorityFocusExplanation = 'Prioritised around comparative research and entry feasibility'
  }

  // 7. Budget summary
  const budgetSummary = {
    hasBudget: Boolean(answers.living_budget?.amount),
    amount: answers.living_budget?.amount,
    currency: answers.living_budget?.currency,
    helpEstimate: Boolean(answers.living_budget?.helpEstimate)
  }

  const completedCount = personalisedTasks.filter(t => t.isCompleted).length
  const totalCount = personalisedTasks.length

  // Material change notice if tasks were invalidated
  let materialChangeNotice: string | undefined = undefined
  if (newlyInvalidated.length > 0) {
    materialChangeNotice = `${newlyInvalidated.length} task${newlyInvalidated.length > 1 ? 's were' : ' was'} updated because your destination or profile parameters changed.`
  }

  const updatedProgress: StoredPlanState = {
    version: storedProgress.version || 1,
    updatedAt: new Date().toISOString(),
    tasks: updatedTasksMap,
    invalidatedTasks: newlyInvalidated.length > 0 
      ? [...newlyInvalidated, ...(storedProgress.invalidatedTasks || [])].slice(0, 5)
      : storedProgress.invalidatedTasks
  }

  const plan: MovingPlan = {
    destinationTitle,
    destinationCode: destCode,
    isUndecided,
    hasDestinationPack,
    destinationPackNotice,
    priorityFocusExplanation,
    allTasks: personalisedTasks,
    nextThreeTasks,
    completedCount,
    totalCount,
    materialChangeNotice,
    budgetSummary
  }

  return { plan, updatedProgress }
}
