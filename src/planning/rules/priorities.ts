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
 */
export function checkHasUnmetPrerequisites(
  task: PersonalisedTask,
  allTasks: PersonalisedTask[]
): boolean {
  if (!task.prerequisiteTaskIds || task.prerequisiteTaskIds.length === 0) {
    return false
  }

  // Check if any prerequisite task exists in allTasks and is not yet completed
  for (const prereqId of task.prerequisiteTaskIds) {
    const prereq = allTasks.find(t => t.id === prereqId)
    if (prereq && !prereq.isCompleted) {
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

  // 4. Prerequisite count: tasks that unlock many other tasks get a slight priority boost
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
    hasUnmetPrerequisites: checkHasUnmetPrerequisites(task, allTasks)
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
