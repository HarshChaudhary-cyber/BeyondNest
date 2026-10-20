import type { StoredPlanState, PlanTaskRecord } from './types'

export const PLAN_STORAGE_KEY_V1 = 'beyondnest_moving_plan_v1'
export const STORAGE_KEY_PLAN_V1 = PLAN_STORAGE_KEY_V1
export const CURRENT_PLAN_SCHEMA_VERSION = 1

export const DEFAULT_PLAN_STATE: StoredPlanState = {
  version: CURRENT_PLAN_SCHEMA_VERSION,
  updatedAt: new Date().toISOString(),
  tasks: {},
  invalidatedTasks: []
}

/**
 * Validates and sanitizes raw stored plan progress.
 */
export function validateAndSanitizeStoredPlan(raw: unknown): StoredPlanState {
  if (!raw || typeof raw !== 'object') {
    return { ...DEFAULT_PLAN_STATE }
  }

  const obj = raw as Record<string, unknown>
  const tasks: Record<string, PlanTaskRecord> = {}

  if (obj.tasks && typeof obj.tasks === 'object') {
    for (const [id, val] of Object.entries(obj.tasks as Record<string, unknown>)) {
      if (val && typeof val === 'object') {
        const record = val as { completed?: unknown; completedAt?: unknown; contextKey?: unknown }
        if (typeof record.completed === 'boolean' && typeof record.contextKey === 'string') {
          tasks[id] = {
            completed: record.completed,
            completedAt: typeof record.completedAt === 'string' ? record.completedAt : undefined,
            contextKey: record.contextKey
          }
        }
      }
    }
  }

  const invalidatedTasks: Array<{ taskId: string; taskTitle: string; reason: string }> = []
  if (Array.isArray(obj.invalidatedTasks)) {
    for (const item of obj.invalidatedTasks) {
      if (item && typeof item === 'object') {
        const entry = item as { taskId?: unknown; taskTitle?: unknown; reason?: unknown }
        if (typeof entry.taskId === 'string' && typeof entry.taskTitle === 'string' && typeof entry.reason === 'string') {
          invalidatedTasks.push({
            taskId: entry.taskId,
            taskTitle: entry.taskTitle,
            reason: entry.reason
          })
        }
      }
    }
  }

  return {
    version: CURRENT_PLAN_SCHEMA_VERSION,
    updatedAt: typeof obj.updatedAt === 'string' ? obj.updatedAt : new Date().toISOString(),
    tasks,
    invalidatedTasks
  }
}

/**
 * Loads plan progress safely from localStorage.
 */
export function loadPlanProgress(): StoredPlanState {
  if (typeof window === 'undefined') {
    return { ...DEFAULT_PLAN_STATE }
  }

  try {
    const raw = localStorage.getItem(PLAN_STORAGE_KEY_V1)
    if (!raw) return { ...DEFAULT_PLAN_STATE }
    const parsed = JSON.parse(raw)
    return validateAndSanitizeStoredPlan(parsed)
  } catch (err) {
    console.warn('[BeyondNest] Failed to load plan progress, resetting:', err)
    return { ...DEFAULT_PLAN_STATE }
  }
}

/**
 * Persists plan progress safely to localStorage.
 */
export function savePlanProgress(state: StoredPlanState): boolean {
  if (typeof window === 'undefined') return false

  try {
    localStorage.setItem(PLAN_STORAGE_KEY_V1, JSON.stringify({
      ...state,
      version: CURRENT_PLAN_SCHEMA_VERSION,
      updatedAt: new Date().toISOString()
    }))
    return true
  } catch (err) {
    console.warn('[BeyondNest] Failed to save plan progress:', err)
    return false
  }
}

/**
 * Clears plan progress from localStorage.
 */
export function clearPlanProgress(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(PLAN_STORAGE_KEY_V1)
  } catch (err) {
    console.warn('[BeyondNest] Failed to clear plan progress:', err)
  }
}
