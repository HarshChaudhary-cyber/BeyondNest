import { describe, it, expect, beforeEach } from 'vitest'
import {
  STORAGE_KEY,
  CURRENT_SCHEMA_VERSION,
  DEFAULT_INITIAL_STATE,
  validateAndSanitizeStoredState,
  loadPersistedState,
  savePersistedState,
  clearPersistedState
} from '../store/onboardingStore'
import type { StoredOnboardingState } from '../store/types'

describe('Persisted State Recovery and Validation', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('saves and reloads valid onboarding state faithfully', () => {
    const sampleState: StoredOnboardingState = {
      version: CURRENT_SCHEMA_VERSION,
      updatedAt: new Date().toISOString(),
      currentQuestionId: 'journey_stage',
      isCompleted: false,
      answers: {
        relocation_purpose: 'study',
        journey_stage: 'exploring',
        current_country: {
          code: 'CA',
          name: 'Canada',
          lat: 56.1304,
          lon: -106.3468,
          region: 'Americas'
        }
      }
    }

    savePersistedState(sampleState)
    const reloaded = loadPersistedState()

    expect(reloaded.answers.relocation_purpose).toBe('study')
    expect(reloaded.answers.journey_stage).toBe('exploring')
    expect(reloaded.answers.current_country?.code).toBe('CA')
    expect(reloaded.currentQuestionId).toBe('journey_stage')
  })

  it('safely recovers when localStorage contains corrupted JSON', () => {
    localStorage.setItem(STORAGE_KEY, '{invalid_json_corrupted:::')

    const reloaded = loadPersistedState()
    expect(reloaded).toEqual(DEFAULT_INITIAL_STATE)
  })

  it('safely resets when stored state has an outdated or invalid schema version', () => {
    const outdatedState = {
      version: 999, // Unrecognized future or past version
      answers: { relocation_purpose: 'study' }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(outdatedState))

    const reloaded = loadPersistedState()
    expect(reloaded.answers).toEqual({})
    expect(reloaded.version).toBe(CURRENT_SCHEMA_VERSION)
  })

  it('sanitizes invalid answers while preserving valid ones', () => {
    const partiallyCorrupted = {
      version: CURRENT_SCHEMA_VERSION,
      answers: {
        relocation_purpose: 'invalid_purpose_string',
        journey_stage: 'already_abroad',
        current_country: { code: 1234 } // invalid format
      }
    }

    const sanitized = validateAndSanitizeStoredState(partiallyCorrupted)
    // Invalid purpose dropped
    expect(sanitized.answers.relocation_purpose).toBeUndefined()
    // Valid stage preserved
    expect(sanitized.answers.journey_stage).toBe('already_abroad')
    // Invalid country dropped
    expect(sanitized.answers.current_country).toBeUndefined()
  })

  it('rejects incomplete completed states and resumes at the first unanswered required question', () => {
    const incompleteCompleted = {
      version: CURRENT_SCHEMA_VERSION,
      isCompleted: true,
      currentQuestionId: 'current_country',
      answers: {
        relocation_purpose: 'study'
        // Missing journey_stage and current_country
      }
    }

    const sanitized = validateAndSanitizeStoredState(incompleteCompleted)
    expect(sanitized.isCompleted).toBe(false)
    expect(sanitized.currentQuestionId).toBe('journey_stage')
    expect(sanitized.answers.relocation_purpose).toBe('study')
  })

  it('rejects fabricated country codes and does not trust arbitrary country data', () => {
    const fabricated = {
      version: CURRENT_SCHEMA_VERSION,
      answers: {
        relocation_purpose: 'study',
        journey_stage: 'exploring',
        current_country: {
          code: 'XX', // Not a recognized ISO country code
          name: 'Fabricated Republic',
          lat: 12.34,
          lon: 56.78,
          region: 'Imaginary'
        }
      }
    }

    const sanitized = validateAndSanitizeStoredState(fabricated)
    expect(sanitized.answers.current_country).toBeUndefined()
    expect(sanitized.isCompleted).toBe(false)
    expect(sanitized.currentQuestionId).toBe('current_country')
  })

  it('restores canonical country coordinates, names, and regions rather than trusting stored values', () => {
    const tamperedCountry = {
      version: CURRENT_SCHEMA_VERSION,
      answers: {
        current_country: {
          code: 'JP',
          name: 'Tampered Name',
          lat: 9999.0, // Invalid coordinate
          lon: -9999.0,
          region: 'Hacked'
        }
      }
    }

    const sanitized = validateAndSanitizeStoredState(tamperedCountry)
    expect(sanitized.answers.current_country).toBeDefined()
    expect(sanitized.answers.current_country?.code).toBe('JP')
    expect(sanitized.answers.current_country?.name).toBe('Japan')
    expect(sanitized.answers.current_country?.lat).toBe(36.2048)
    expect(sanitized.answers.current_country?.lon).toBe(138.2529)
    expect(sanitized.answers.current_country?.region).toBe('Asia')
  })

  it('keeps storage failures non-fatal when localStorage throws', () => {
    const originalSetItem = localStorage.setItem
    try {
      localStorage.setItem = () => {
        throw new Error('QuotaExceededError: storage is full')
      }

      // Should not throw an unhandled error
      expect(() => {
        savePersistedState({
          version: CURRENT_SCHEMA_VERSION,
          updatedAt: new Date().toISOString(),
          currentQuestionId: 'relocation_purpose',
          isCompleted: false,
          answers: {}
        })
      }).not.toThrow()
    } finally {
      localStorage.setItem = originalSetItem
    }
  })

  it('clears persisted state completely on explicit reset', () => {
    savePersistedState({
      version: CURRENT_SCHEMA_VERSION,
      updatedAt: new Date().toISOString(),
      currentQuestionId: 'current_country',
      isCompleted: true,
      answers: { relocation_purpose: 'work' }
    })

    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull()

    clearPersistedState()
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })
})
