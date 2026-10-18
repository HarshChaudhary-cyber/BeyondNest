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
