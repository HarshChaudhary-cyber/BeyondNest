/**
 * BeyondNest — Date Validation Utilities
 * 
 * Enforces finite integer date years and months, valid 1–12 month bounds,
 * and documented sensible year limits with local-calendar awareness.
 */

import type { MoveDateAnswer, JourneyStage } from '../store/types'

// Documented sensible year boundaries
export const MIN_ARRIVAL_YEAR = 1950
export const MAX_PLANNING_OFFSET_YEARS = 10

export interface DateValidationResult {
  valid: boolean
  error?: string
}

/**
 * Validates a move or arrival date answer.
 * 
 * Rules:
 * 1. For already_abroad:
 *    - preferNotToSay: true is valid.
 *    - If date provided: year and month must be finite integers.
 *    - Month must be between 1 and 12.
 *    - Year must be between MIN_ARRIVAL_YEAR (1950) and currentYear.
 *    - Arrival date cannot be in the future (relative to the user's current local month). Current month is allowed.
 * 2. For planning movers (all other stages):
 *    - notSureYet: true is valid.
 *    - If date provided: year and month must be finite integers.
 *    - Month must be between 1 and 12.
 *    - Year must be between currentYear and currentYear + 10.
 *    - Planning date cannot be in the past (relative to the user's current local month). Current month is allowed.
 */
export function validateMoveDate(
  val: unknown,
  journeyStage?: JourneyStage,
  referenceDate: Date = new Date()
): DateValidationResult {
  if (!val || typeof val !== 'object') {
    return { valid: false, error: 'Please choose a date or select flexible options.' }
  }

  const ans = val as Partial<MoveDateAnswer>
  const isAlreadyAbroad = journeyStage === 'already_abroad'

  if (isAlreadyAbroad && ans.preferNotToSay === true) {
    return { valid: true }
  }

  if (!isAlreadyAbroad && ans.notSureYet === true) {
    return { valid: true }
  }

  const { year, month } = ans

  // Finite integer validation
  if (
    typeof year !== 'number' ||
    typeof month !== 'number' ||
    !Number.isInteger(year) ||
    !Number.isInteger(month)
  ) {
    return { valid: false, error: 'Year and month must be whole integer numbers.' }
  }

  // Month range validation
  if (month < 1 || month > 12) {
    return { valid: false, error: 'Month must be between 1 and 12.' }
  }

  const currentYear = referenceDate.getFullYear()
  const currentMonth = referenceDate.getMonth() + 1 // 1-indexed

  if (isAlreadyAbroad) {
    // Arrival sensible limits: 1950 to currentYear
    if (year < MIN_ARRIVAL_YEAR) {
      return { 
        valid: false, 
        error: `Arrival year cannot be earlier than ${MIN_ARRIVAL_YEAR}.` 
      }
    }
    if (year > currentYear) {
      return { valid: false, error: 'Arrival date cannot be in the future.' }
    }
    // Local calendar current-month check: cannot be in future months of current year
    if (year === currentYear && month > currentMonth) {
      return { valid: false, error: 'Arrival date cannot be in the future.' }
    }
  } else {
    // Planning sensible limits: currentYear to currentYear + 10
    const maxPlanningYear = currentYear + MAX_PLANNING_OFFSET_YEARS
    if (year > maxPlanningYear) {
      return { 
        valid: false, 
        error: `Planned move year cannot be more than ${MAX_PLANNING_OFFSET_YEARS} years in the future.` 
      }
    }
    if (year < currentYear) {
      return { valid: false, error: 'Planning date cannot be in the past.' }
    }
    // Local calendar current-month check: cannot be in past months of current year
    if (year === currentYear && month < currentMonth) {
      return { valid: false, error: 'Planning date cannot be in the past.' }
    }
  }

  return { valid: true }
}
