export const WORKSHEET_STORAGE_KEY_V1 = 'beyondnest_expense_worksheet_v1'
export const CURRENT_WORKSHEET_SCHEMA_VERSION = 1

export interface WorksheetItemDefinition {
  id: string
  label: string
  placeholder: string
}

export const WORKSHEET_ITEM_DEFINITIONS: WorksheetItemDefinition[] = [
  { id: 'rent', label: 'Rent & Accommodation (student dorm, flatshare, or room)', placeholder: 'Research local rent' },
  { id: 'groceries', label: 'Groceries & Household Food', placeholder: 'Estimate monthly food' },
  { id: 'transit', label: 'Local Transit / Student Semester Ticket', placeholder: 'Check transit pass rate' },
  { id: 'utilities', label: 'Mobile Connectivity, Internet & Utilities', placeholder: 'Research utility costs' },
  { id: 'insurance', label: 'Health & Personal Liability Insurance', placeholder: 'Check student insurance fee' },
  { id: 'leisure', label: 'Course Materials & Personal Expenses', placeholder: 'Set personal allocation' }
]

export interface StoredWorksheetState {
  version: number
  updatedAt: string
  currency: string
  items: Record<string, number>
}

export function getDefaultWorksheetState(currency = 'EUR'): StoredWorksheetState {
  const blankItems: Record<string, number> = {}
  for (const def of WORKSHEET_ITEM_DEFINITIONS) {
    blankItems[def.id] = 0
  }
  return {
    version: CURRENT_WORKSHEET_SCHEMA_VERSION,
    updatedAt: new Date().toISOString(),
    currency,
    items: blankItems
  }
}

/**
 * Validates and sanitizes stored expense worksheet data.
 * Safely resets to blank defaults if the schema version is unsupported.
 */
export function validateAndSanitizeStoredWorksheet(raw: unknown, defaultCurrency = 'EUR'): StoredWorksheetState {
  if (!raw || typeof raw !== 'object') {
    return getDefaultWorksheetState(defaultCurrency)
  }

  const obj = raw as Record<string, unknown>

  // Version check: only version 1 is supported currently
  if (obj.version !== CURRENT_WORKSHEET_SCHEMA_VERSION) {
    return getDefaultWorksheetState(defaultCurrency)
  }

  const currency = typeof obj.currency === 'string' && obj.currency.length > 0
    ? obj.currency
    : defaultCurrency

  const items: Record<string, number> = {}
  const rawItems = obj.items && typeof obj.items === 'object' ? (obj.items as Record<string, unknown>) : {}

  for (const def of WORKSHEET_ITEM_DEFINITIONS) {
    const val = rawItems[def.id]
    if (typeof val === 'number' && !isNaN(val) && val >= 0) {
      items[def.id] = val
    } else {
      items[def.id] = 0
    }
  }

  return {
    version: CURRENT_WORKSHEET_SCHEMA_VERSION,
    updatedAt: typeof obj.updatedAt === 'string' ? obj.updatedAt : new Date().toISOString(),
    currency,
    items
  }
}

/**
 * Loads expense worksheet state safely from browser localStorage.
 */
export function loadWorksheetState(defaultCurrency = 'EUR'): StoredWorksheetState {
  if (typeof window === 'undefined') {
    return getDefaultWorksheetState(defaultCurrency)
  }

  try {
    const raw = localStorage.getItem(WORKSHEET_STORAGE_KEY_V1)
    if (!raw) return getDefaultWorksheetState(defaultCurrency)
    const parsed = JSON.parse(raw)
    return validateAndSanitizeStoredWorksheet(parsed, defaultCurrency)
  } catch (err) {
    console.warn('[BeyondNest] Failed to load expense worksheet, resetting:', err)
    return getDefaultWorksheetState(defaultCurrency)
  }
}

/**
 * Persists expense worksheet state to localStorage.
 * Returns true if save succeeded, false otherwise.
 */
export function saveWorksheetState(state: StoredWorksheetState): boolean {
  if (typeof window === 'undefined') return false

  try {
    localStorage.setItem(WORKSHEET_STORAGE_KEY_V1, JSON.stringify({
      ...state,
      version: CURRENT_WORKSHEET_SCHEMA_VERSION,
      updatedAt: new Date().toISOString()
    }))
    return true
  } catch (err) {
    console.warn('[BeyondNest] Failed to save expense worksheet:', err)
    return false
  }
}

/**
 * Clears expense worksheet storage.
 */
export function clearWorksheetState(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(WORKSHEET_STORAGE_KEY_V1)
  } catch (err) {
    console.warn('[BeyondNest] Failed to clear expense worksheet:', err)
  }
}
