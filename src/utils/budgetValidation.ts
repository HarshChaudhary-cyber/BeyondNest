/**
 * BeyondNest — Budget Validation Utilities
 * 
 * Enforces finite positive budget amounts and supported currency codes
 * while preserving flexible decimal precision.
 */

import { isSupportedCurrency } from '../data/currencies'
import type { LivingBudgetAnswer } from '../store/types'

export interface BudgetValidationResult {
  valid: boolean
  error?: string
}

/**
 * Validates a living budget answer.
 * 
 * Rules:
 * 1. helpEstimate: true is valid.
 * 2. If amount is provided:
 *    - Must be a number.
 *    - Must be finite (rejects NaN, Infinity, -Infinity).
 *    - Must be strictly positive (amount > 0).
 *    - Supports flexible decimal precision (e.g. integer JPY, 2-decimal USD/EUR, or fractional inputs).
 *    - Currency must be a supported ISO code from the currency registry.
 */
export function validateLivingBudget(val: unknown): BudgetValidationResult {
  if (!val || typeof val !== 'object') {
    return { valid: false, error: 'Please enter an estimated monthly budget or choose "Help me estimate".' }
  }

  const ans = val as Partial<LivingBudgetAnswer>

  // Currency validation
  if (!isSupportedCurrency(ans.currency)) {
    return { valid: false, error: 'Please select a supported currency.' }
  }

  if (ans.helpEstimate === true) {
    return { valid: true }
  }

  if (ans.amount === undefined || ans.amount === null) {
    return { valid: false, error: 'Please enter a positive budget amount or choose "Help me estimate".' }
  }

  if (typeof ans.amount !== 'number' || !Number.isFinite(ans.amount)) {
    return { valid: false, error: 'Budget amount must be a finite valid number.' }
  }

  if (ans.amount <= 0) {
    return { valid: false, error: 'Budget amount must be greater than zero.' }
  }

  return { valid: true }
}
