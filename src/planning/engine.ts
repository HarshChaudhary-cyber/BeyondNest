import type { OnboardingAnswers, DestinationCountryAnswer } from '../store/types'
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

/**
 * Determines whether a task belongs specifically to a given country code (e.g. 'DE', 'CA').
 */
export function isTaskSpecificToCountry(taskId: string, contextKey: string, countryCode: string): boolean {
  const upper = countryCode.toUpperCase()
  const lower = countryCode.toLowerCase()
  return (
    taskId.startsWith(`${lower}_`) ||
    contextKey.startsWith(`dest:${upper}|`) ||
    contextKey.includes(`dest:${upper}|`) ||
    contextKey.endsWith(`dest:${upper}`)
  )
}

/**
 * Determines whether a task is destination-specific to any concrete country pack.
 */
export function isAnyCountrySpecificTask(taskId: string, contextKey: string): boolean {
  if (taskId.startsWith('de_') || taskId.startsWith('ca_')) {
    return true
  }
  if (/^[a-z]{2}_/i.test(taskId) && !taskId.startsWith('ge_') && !taskId.startsWith('sp_') && !taskId.startsWith('re_')) {
    return true
  }
  const match = contextKey.match(/dest:([A-Za-z0-9_]+)/)
  if (match) {
    const val = match[1]
    if (val.length === 2 && val === val.toUpperCase()) {
      return true
    }
  }
  return false
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
  const rawDest = (answers.destination_country || (answers as Record<string, unknown>).destination) as DestinationCountryAnswer | undefined
  const isUndecided = Boolean(rawDest && 'explore' in rawDest && rawDest.explore)
  const destCode = rawDest && 'code' in rawDest ? rawDest.code : undefined
  const destName = rawDest && 'name' in rawDest ? rawDest.name : undefined

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

  const recordInvalidation = (taskId: string, taskTitle: string, reason: string) => {
    if (!newlyInvalidated.some(item => item.taskId === taskId)) {
      newlyInvalidated.push({ taskId, taskTitle, reason })
    }
  }

  // Determine current and previous destination states
  const currentDestState = isUndecided ? 'UNDECIDED' : (destCode || 'UNKNOWN')
  let previousDestState: string | undefined = storedProgress.destinationState
  if (!previousDestState) {
    if (storedProgress.destinationCode) {
      previousDestState = storedProgress.destinationCode
    } else if (Object.keys(storedProgress.tasks).length > 0) {
      previousDestState = 'UNDECIDED'
    }
  }

  const isDestinationTransition = previousDestState !== undefined && previousDestState !== currentDestState

  // Explicit transitions between concrete destinations and undecided states
  if (isDestinationTransition) {
    // 1. If we left a concrete destination (e.g. 'DE' or 'CA'), invalidate all tasks specific to that destination
    if (previousDestState && previousDestState !== 'UNDECIDED' && previousDestState !== 'UNKNOWN') {
      const oldCode = previousDestState
      for (const [tId, record] of Object.entries(updatedTasksMap)) {
        if (isTaskSpecificToCountry(tId, record.contextKey, oldCode)) {
          if (record.completed) {
            recordInvalidation(
              tId,
              tId,
              `Destination changed from ${oldCode} to ${isUndecided ? 'exploring destinations' : currentDestState}.`
            )
          }
          updatedTasksMap[tId] = {
            ...record,
            completed: false
          }
        }
      }
    }

    // 2. Invalidate affected records when entering undecided
    if (currentDestState === 'UNDECIDED') {
      for (const [tId, record] of Object.entries(updatedTasksMap)) {
        if (isAnyCountrySpecificTask(tId, record.contextKey)) {
          if (record.completed) {
            recordInvalidation(tId, tId, 'Exploring destinations: specific destination tasks invalidated.')
          }
          updatedTasksMap[tId] = {
            ...record,
            completed: false
          }
        }
      }
    }

    // 3. Invalidate inactive historical records from any other destination
    if (destCode) {
      for (const [tId, record] of Object.entries(updatedTasksMap)) {
        if (isAnyCountrySpecificTask(tId, record.contextKey) && !isTaskSpecificToCountry(tId, record.contextKey, destCode)) {
          updatedTasksMap[tId] = {
            ...record,
            completed: false
          }
        }
      }
    }
  }

  // Always ensure inactive historical records from outside the current context cannot remain completed
  for (const [tId, record] of Object.entries(updatedTasksMap)) {
    if (isUndecided) {
      if (isAnyCountrySpecificTask(tId, record.contextKey) && record.completed) {
        updatedTasksMap[tId] = {
          ...record,
          completed: false
        }
      }
    } else if (destCode) {
      if (isAnyCountrySpecificTask(tId, record.contextKey) && !isTaskSpecificToCountry(tId, record.contextKey, destCode) && record.completed) {
        updatedTasksMap[tId] = {
          ...record,
          completed: false
        }
      }
    }
  }

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
    task.hasUnmetPrerequisites = checkHasUnmetPrerequisites(task, personalisedTasks, answers)
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
    destinationCode: destCode,
    destinationState: currentDestState,
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
