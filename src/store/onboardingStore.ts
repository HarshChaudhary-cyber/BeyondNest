import { useState, useEffect, useCallback, useMemo } from 'react'
import type { 
  OnboardingAnswers, 
  QuestionId, 
  StoredOnboardingState, 
  FlowScreen, 
  RelocationPurpose,
  JourneyStage 
} from './types'
import { QUESTIONS, getNextQuestionId, getPreviousQuestionId, getQuestionById } from '../config/questions'
import { findCountryByCode } from '../data/countries'
import { FEATURE_FLAGS } from '../config/featureFlags'

export const STORAGE_KEY = 'beyondnest_onboarding_v1'
export const CURRENT_SCHEMA_VERSION = 1

export const DEFAULT_INITIAL_STATE: StoredOnboardingState = {
  version: CURRENT_SCHEMA_VERSION,
  updatedAt: new Date().toISOString(),
  answers: {},
  currentQuestionId: QUESTIONS[0]?.id || 'relocation_purpose',
  isCompleted: false
}

/**
 * Returns the first required question ID that lacks a valid answer,
 * or null if all required questions have valid answers.
 */
export function getFirstUnansweredRequiredQuestionId(answers: OnboardingAnswers): QuestionId | null {
  for (const q of QUESTIONS) {
    if (q.isRequired) {
      const val = answers[q.id]
      const validation = q.validate(val)
      if (!validation.valid) {
        return q.id
      }
    }
  }
  return null
}

/**
 * Returns whether every required question has a valid answer.
 */
export function areAllRequiredQuestionsAnswered(answers: OnboardingAnswers): boolean {
  return getFirstUnansweredRequiredQuestionId(answers) === null
}

/**
 * Validates and sanitizes stored data safely against corruption, schema drift,
 * fabricated country codes, or illegitimate completion flags.
 */
export function validateAndSanitizeStoredState(raw: unknown): StoredOnboardingState {
  if (!raw || typeof raw !== 'object') {
    return { ...DEFAULT_INITIAL_STATE }
  }

  const obj = raw as Record<string, unknown>

  // Version check — reset if schema version does not match
  if (obj.version !== CURRENT_SCHEMA_VERSION) {
    return { ...DEFAULT_INITIAL_STATE }
  }

  const answers: OnboardingAnswers = {}

  // 1. Validate relocation_purpose
  const validPurposes: RelocationPurpose[] = ['study', 'work', 'family', 'explore']
  if (typeof obj.answers === 'object' && obj.answers !== null) {
    const rawAnswers = obj.answers as Record<string, unknown>
    if (typeof rawAnswers.relocation_purpose === 'string' && validPurposes.includes(rawAnswers.relocation_purpose as RelocationPurpose)) {
      answers.relocation_purpose = rawAnswers.relocation_purpose as RelocationPurpose
    }

    // 2. Validate journey_stage
    const validStages: JourneyStage[] = ['exploring', 'preparing_apps', 'accepted_offer', 'preparing_leave', 'already_abroad']
    if (typeof rawAnswers.journey_stage === 'string' && validStages.includes(rawAnswers.journey_stage as JourneyStage)) {
      answers.journey_stage = rawAnswers.journey_stage as JourneyStage
    }

    // 3. Validate current_country against canonical dataset
    if (typeof rawAnswers.current_country === 'object' && rawAnswers.current_country !== null) {
      const rawCountry = rawAnswers.current_country as { code?: unknown }
      if (typeof rawCountry.code === 'string') {
        const canonical = findCountryByCode(rawCountry.code)
        if (canonical) {
          // Restore canonical names, coordinates, and region; do not trust stored copies
          answers.current_country = {
            code: canonical.code,
            name: canonical.name,
            lat: canonical.lat,
            lon: canonical.lon,
            region: canonical.region
          }
        }
      }
    }
  }

  // 4. Validate completion flag:
  // Strict check — treat completion as valid ONLY when every required question is genuinely answered
  const allAnswered = areAllRequiredQuestionsAnswered(answers)
  const isCompleted = obj.isCompleted === true && allAnswered

  // 5. Validate navigation state (currentQuestionId):
  // Prevent users from skipping required questions through malformed stored data
  const firstUnanswered = getFirstUnansweredRequiredQuestionId(answers)
  let currentQuestionId: QuestionId = QUESTIONS[0].id

  if (isCompleted) {
    currentQuestionId = QUESTIONS[QUESTIONS.length - 1].id
  } else if (firstUnanswered) {
    // If there is an unanswered required question, ensure user cannot advance past it
    if (typeof obj.currentQuestionId === 'string' && QUESTIONS.some(q => q.id === obj.currentQuestionId)) {
      const storedIdx = QUESTIONS.findIndex(q => q.id === obj.currentQuestionId)
      const unansweredIdx = QUESTIONS.findIndex(q => q.id === firstUnanswered)
      // If stored question is beyond the first unanswered question, clamp back to firstUnanswered
      if (storedIdx > unansweredIdx) {
        currentQuestionId = firstUnanswered
      } else {
        currentQuestionId = obj.currentQuestionId as QuestionId
      }
    } else {
      currentQuestionId = firstUnanswered
    }
  } else {
    // All answered but not marked completed yet
    if (typeof obj.currentQuestionId === 'string' && QUESTIONS.some(q => q.id === obj.currentQuestionId)) {
      currentQuestionId = obj.currentQuestionId as QuestionId
    }
  }

  return {
    version: CURRENT_SCHEMA_VERSION,
    updatedAt: typeof obj.updatedAt === 'string' ? obj.updatedAt : new Date().toISOString(),
    answers,
    currentQuestionId,
    isCompleted
  }
}

/**
 * Pure helper to read from localStorage with error safety
 */
export function loadPersistedState(): StoredOnboardingState {
  if (typeof window === 'undefined' || !FEATURE_FLAGS.persistProgressLocally) {
    return { ...DEFAULT_INITIAL_STATE }
  }

  try {
    const item = localStorage.getItem(STORAGE_KEY)
    if (!item) return { ...DEFAULT_INITIAL_STATE }
    const parsed = JSON.parse(item)
    return validateAndSanitizeStoredState(parsed)
  } catch (err) {
    console.warn('[BeyondNest] Failed to load onboarding state, resetting to defaults:', err)
    return { ...DEFAULT_INITIAL_STATE }
  }
}

/**
 * Pure helper to save to localStorage with error safety
 */
export function savePersistedState(state: StoredOnboardingState): void {
  if (typeof window === 'undefined' || !FEATURE_FLAGS.persistProgressLocally) {
    return
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...state,
      version: CURRENT_SCHEMA_VERSION,
      updatedAt: new Date().toISOString()
    }))
  } catch (err) {
    console.warn('[BeyondNest] Failed to persist onboarding state:', err)
  }
}

/**
 * Pure helper to clear onboarding persistence
 */
export function clearPersistedState(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (err) {
    console.warn('[BeyondNest] Failed to clear onboarding state:', err)
  }
}

/**
 * React hook to manage onboarding state, navigation, answers, and persistence
 */
export function useOnboardingStore() {
  const [persisted, setPersisted] = useState<StoredOnboardingState>(() => loadPersistedState())
  const [screen, setScreen] = useState<FlowScreen>(() => {
    // If completed previously and all required answers exist, resume at summary
    if (persisted.isCompleted) {
      return { type: 'summary' }
    }
    // If user has answered at least one question, resume at validated question step
    if (Object.keys(persisted.answers).length > 0) {
      return { type: 'question', questionId: persisted.currentQuestionId || QUESTIONS[0].id }
    }
    return { type: 'welcome' }
  })
  const [validationError, setValidationError] = useState<string | null>(null)

  // Sync state to localStorage whenever persisted state updates
  useEffect(() => {
    savePersistedState(persisted)
  }, [persisted])

  const setAnswer = useCallback(<K extends keyof OnboardingAnswers>(questionId: K, value: OnboardingAnswers[K]) => {
    setPersisted(prev => {
      const nextAnswers = { ...prev.answers, [questionId]: value }
      return {
        ...prev,
        answers: nextAnswers
      }
    })
    setValidationError(null)
  }, [])

  const startOnboarding = useCallback(() => {
    setScreen({ type: 'question', questionId: QUESTIONS[0].id })
    setPersisted(prev => ({
      ...prev,
      currentQuestionId: QUESTIONS[0].id,
      isCompleted: false
    }))
    setValidationError(null)
  }, [])

  const goToNextQuestion = useCallback(() => {
    if (screen.type !== 'question') return

    const currentQ = getQuestionById(screen.questionId)
    if (!currentQ) return

    // Run question validation
    const currentAnswer = persisted.answers[screen.questionId]
    const validation = currentQ.validate(currentAnswer)
    if (!validation.valid) {
      setValidationError(validation.error || 'Please provide an answer before continuing.')
      return
    }

    setValidationError(null)
    const nextId = getNextQuestionId(screen.questionId)
    if (nextId) {
      setScreen({ type: 'question', questionId: nextId })
      setPersisted(prev => ({ ...prev, currentQuestionId: nextId }))
    } else {
      // Completed all questions in milestone 1
      setScreen({ type: 'summary' })
      setPersisted(prev => ({ ...prev, isCompleted: true }))
    }
  }, [screen, persisted.answers])

  const goToPreviousQuestion = useCallback(() => {
    if (screen.type !== 'question') return

    setValidationError(null)
    const prevId = getPreviousQuestionId(screen.questionId)
    if (prevId) {
      setScreen({ type: 'question', questionId: prevId })
      setPersisted(prev => ({ ...prev, currentQuestionId: prevId }))
    } else {
      // Back to welcome
      setScreen({ type: 'welcome' })
    }
  }, [screen])

  const editAnswer = useCallback((questionId: QuestionId) => {
    setValidationError(null)
    setScreen({ type: 'question', questionId })
    setPersisted(prev => ({ ...prev, currentQuestionId: questionId, isCompleted: false }))
  }, [])

  const resetOnboarding = useCallback(() => {
    clearPersistedState()
    setPersisted({ ...DEFAULT_INITIAL_STATE })
    setScreen({ type: 'welcome' })
    setValidationError(null)
  }, [])

  const currentQuestion = useMemo(() => {
    if (screen.type !== 'question') return null
    return getQuestionById(screen.questionId) || null
  }, [screen])

  const currentStepNumber = useMemo(() => {
    if (screen.type !== 'question') return 0
    const idx = QUESTIONS.findIndex(q => q.id === screen.questionId)
    return idx >= 0 ? idx + 1 : 1
  }, [screen])

  return {
    screen,
    answers: persisted.answers,
    currentQuestion,
    currentStepNumber,
    totalSteps: QUESTIONS.length,
    validationError,
    setAnswer,
    startOnboarding,
    goToNextQuestion,
    goToPreviousQuestion,
    editAnswer,
    resetOnboarding
  }
}
