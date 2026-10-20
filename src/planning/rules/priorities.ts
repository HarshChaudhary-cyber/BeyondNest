import type { PersonalisedTask, JourneyPhase, TaskCategory } from '../types'
import type { OnboardingAnswers, PriorityArea } from '../../store/types'

const CATEGORY_PRIORITY_MAP: Record<PriorityArea, TaskCategory[]> = {
  paperwork: ['paperwork'],
  housing: ['housing'],
  budget: ['budget'],
  language_daily_life: ['daily_life', 'community'],
  meeting_people: ['community'],
  whole_process: ['paperwork', 'budget', 'housing']
}

/**
 * Evaluates whether any prerequisite tasks are unmet.
 * Strict invariants:
 * 1. If prerequisite task exists in allTasks:
 *    It is unmet if !prereq.isCompleted (including if it was reopened!).
 * 2. If prerequisite task does NOT exist in allTasks:
 *    Do NOT silently treat as satisfied!
 *    Explicit handling:
 *    - If the prerequisite was omitted because the user's journey stage indicates that earlier stage has elapsed
 *      (e.g., journey_stage is 'already_abroad' for pre-arrival/border-entry tasks, or 'accepted_offer' for admission tasks),
 *      it is treated as satisfied by virtue of the journey stage.
 *    - Otherwise, if a prerequisite is missing and cannot be verified from the journey stage or answers,
 *      it is treated as UNMET (true) so the dependent task is not prematurely surfaced.
 */
export function checkHasUnmetPrerequisites(
  task: PersonalisedTask,
  allTasks: PersonalisedTask[],
  answers?: OnboardingAnswers
): boolean {
  if (!task.prerequisiteTaskIds || task.prerequisiteTaskIds.length === 0) {
    return false
  }

  for (const prereqId of task.prerequisiteTaskIds) {
    const prereq = allTasks.find(t => t.id === prereqId)
    if (prereq) {
      if (!prereq.isCompleted) {
        return true
      }
    } else {
      // Prerequisite is NOT in allTasks.
      // Explicit handling: check if the omission was due to an elapsed journey stage.
      const isAlreadyAbroad = answers?.journey_stage === 'already_abroad'
      const isAcceptedOffer = answers?.journey_stage === 'accepted_offer'

      // Pre-arrival / border-crossing prerequisites elapsed for already_abroad users
      const isPreArrivalOrBorderPrereq = prereqId.includes('border') || prereqId.includes('visa') || prereqId.includes('study_permit')
      if (isAlreadyAbroad && isPreArrivalOrBorderPrereq) {
        continue
      }

      // University admission prerequisite elapsed for accepted_offer users
      const isAdmissionPrereq = prereqId.includes('admission') || prereqId.includes('dli_acceptance')
      if (isAcceptedOffer && isAdmissionPrereq) {
        continue
      }

      // Otherwise, the missing prerequisite cannot be confirmed as satisfied: treat as unmet!
      return true
    }
  }

  return false
}

/**
 * Computes an actionable priority score for an uncompleted task.
 * Lower score = higher priority (should be acted on sooner).
 */
export function computeTaskPriorityScore(
  task: PersonalisedTask,
  answers: OnboardingAnswers
): number {
  let score = 100

  const isAbroad = answers.journey_stage === 'already_abroad'

  // 1. Base phase weighting
  const phaseWeights: Record<JourneyPhase, number> = isAbroad
    ? { arrival_settling: 10, before_departure: 50, start_here: 40 }
    : { start_here: 10, before_departure: 30, arrival_settling: 60 }

  score += phaseWeights[task.phase] || 30

  // 2. Journey Stage alignment
  switch (answers.journey_stage) {
    case 'exploring':
      if (task.phase === 'start_here') score -= 15
      break
    case 'preparing_apps':
      if (task.category === 'paperwork' && task.phase === 'start_here') score -= 20
      break
    case 'accepted_offer':
      if (task.category === 'paperwork' || task.category === 'budget') score -= 15
      break
    case 'preparing_leave':
      if (task.phase === 'before_departure') score -= 20
      break
    case 'already_abroad':
      if (task.category === 'arrival' || task.category === 'daily_life') score -= 25
      break
  }

  // 3. User First Priorities matching
  const userPriorities = answers.first_priority || []
  for (const p of userPriorities) {
    const matchedCategories = CATEGORY_PRIORITY_MAP[p] || []
    if (matchedCategories.includes(task.category)) {
      score -= 10
    }
  }

  return score
}

/**
 * Selects the next three actionable tasks.
 * Strict invariants:
 * 1. Must NOT include already completed tasks.
 * 2. Must NOT rank a task with unmet prerequisites ahead of its prerequisite.
 * 3. Returns up to 3 tasks sorted by actionable priority.
 */
export function selectNextThreeTasks(
  allTasks: PersonalisedTask[],
  answers: OnboardingAnswers
): PersonalisedTask[] {
  // Update unmet prerequisites flags across all tasks
  const preparedTasks = allTasks.map(task => ({
    ...task,
    hasUnmetPrerequisites: checkHasUnmetPrerequisites(task, allTasks, answers)
  }))

  // Filter for uncompleted tasks with zero unmet prerequisites
  const actionableCandidates = preparedTasks.filter(
    task => !task.isCompleted && !task.hasUnmetPrerequisites
  )

  // Sort by priority score
  actionableCandidates.sort((a, b) => {
    const scoreA = computeTaskPriorityScore(a, answers)
    const scoreB = computeTaskPriorityScore(b, answers)
    return scoreA - scoreB
  })

  return actionableCandidates.slice(0, 3)
}
