import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import type { 
  OnboardingAnswers, 
  QuestionId, 
  StoredOnboardingState, 
  FlowScreen, 
  RelocationPurpose,
  JourneyStage,
  CountryInfo,
  DestinationCountryAnswer,
  DestinationPriority,
  PlannedDurationAnswer,
  TravelStyleAnswer,
  CompanionsAnswer,
  StudyLevelAnswer,
  WorkStatusAnswer,
  PreparationItem,
  PriorityArea,
  StorageStatus
} from './types'
import { 
  QUESTIONS, 
  getApplicableQuestions, 
  getNextQuestionId, 
  getPreviousQuestionId, 
  getQuestionById 
} from '../config/questions'
import { findCountryByCode } from '../data/countries'
import { findCitizenshipByCode } from '../data/citizenships'
import { FEATURE_FLAGS } from '../config/featureFlags'
import { validateMoveDate } from '../utils/dateValidation'
import { validateLivingBudget } from '../utils/budgetValidation'

export const STORAGE_KEY_V2 = 'beyondnest_onboarding_v2'
export const STORAGE_KEY_V1 = 'beyondnest_onboarding_v1'
export const STORAGE_KEY = STORAGE_KEY_V2
export const CURRENT_SCHEMA_VERSION = 2

export const DEFAULT_INITIAL_STATE: StoredOnboardingState = {
  version: CURRENT_SCHEMA_VERSION,
  updatedAt: new Date().toISOString(),
  answers: {},
  currentQuestionId: QUESTIONS[0]?.id || 'relocation_purpose',
  isCompleted: false,
  isReviewEditing: false,
  editingOriginQuestionId: null,
  editNavigationHistory: [],
  storageStatus: 'saved'
}

/**
 * Returns the first required question ID that lacks a valid answer among applicable questions,
 * or null if all currently applicable required questions have valid answers.
 */
export function getFirstUnansweredRequiredQuestionId(answers: OnboardingAnswers): QuestionId | null {
  const applicable = getApplicableQuestions(answers)
  for (const q of applicable) {
    if (q.isRequired) {
      const val = answers[q.id]
      const validation = q.validate(val, answers)
      if (!validation.valid) {
        return q.id
      }
    }
  }
  return null
}

/**
 * Returns whether every currently applicable required question has a valid answer.
 */
export function areAllRequiredQuestionsAnswered(answers: OnboardingAnswers): boolean {
  return getFirstUnansweredRequiredQuestionId(answers) === null
}

/**
 * Apply dependency invalidation policy when an answer changes.
 * Ensures dependent states are cleared when prerequisites change.
 */
export function applyDependencyInvalidation(
  prevAnswers: OnboardingAnswers,
  questionId: QuestionId,
  newValue: unknown
): OnboardingAnswers {
  const nextAnswers = { ...prevAnswers, [questionId]: newValue }

  // 1. Relocation Purpose changes
  if (questionId === 'relocation_purpose') {
    if (newValue !== 'study') {
      delete nextAnswers.study_level
      delete nextAnswers.university_name
      if (Array.isArray(nextAnswers.preparation_status)) {
        nextAnswers.preparation_status = nextAnswers.preparation_status.filter(
          item => item !== 'admission_enrolment'
        )
      }
    }
    if (newValue !== 'work') {
      delete nextAnswers.work_status
      if (Array.isArray(nextAnswers.preparation_status)) {
        nextAnswers.preparation_status = nextAnswers.preparation_status.filter(
          item => item !== 'job_offer'
        )
      }
    }
  }

  // 2. Journey Stage changes
  if (questionId === 'journey_stage') {
    if (prevAnswers.journey_stage !== newValue) {
      if (nextAnswers.move_date) {
        const dateCheck = validateMoveDate(nextAnswers.move_date, newValue as JourneyStage)
        if (!dateCheck.valid) {
          delete nextAnswers.move_date
        }
      }
      if (newValue !== 'already_abroad') {
        delete nextAnswers.origin_country_abroad
      } else {
        // If changed to already_abroad, remove travel booking from preparation if present
        if (Array.isArray(nextAnswers.preparation_status)) {
          nextAnswers.preparation_status = nextAnswers.preparation_status.filter(
            item => item !== 'travel_booking'
          )
        }
      }
    }
  }

  // 3. Destination Country changes
  if (questionId === 'destination_country') {
    const val = newValue as Partial<DestinationCountryAnswer> | undefined
    if (val && 'explore' in val && val.explore) {
      // Changed to explore -> clear city
      delete nextAnswers.destination_city
    } else if (val && 'code' in val && val.code) {
      // Changed to a specific country -> clear destination priorities
      delete nextAnswers.destination_priorities
      // If country changed compared to previous specific country, clear city
      const prevDest = prevAnswers.destination_country
      if (prevDest && 'code' in prevDest && prevDest.code !== val.code) {
        delete nextAnswers.destination_city
      }
    }
  }

  // 4. Travel Style changes
  if (questionId === 'travel_style') {
    if (newValue !== 'backpacking' && newValue !== 'mix') {
      delete nextAnswers.backpacking_destinations
    }
  }

  // 5. Preparation Status mutual exclusivity
  if (questionId === 'preparation_status' && Array.isArray(newValue)) {
    if (newValue.includes('nothing_yet')) {
      const prevPrep = prevAnswers.preparation_status || []
      if (!prevPrep.includes('nothing_yet') && newValue.length > 1) {
        // User just clicked 'nothing_yet': isolate it
        nextAnswers.preparation_status = ['nothing_yet']
      } else if (newValue.length > 1) {
        // User had 'nothing_yet' and clicked something else: uncheck 'nothing_yet'
        nextAnswers.preparation_status = newValue.filter(i => i !== 'nothing_yet')
      }
    }
  }

  return nextAnswers
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

  // Version check: if version is unrecognized (not current version and not v1), reset to defaults
  if (typeof obj.version === 'number' && obj.version !== CURRENT_SCHEMA_VERSION && obj.version !== 1) {
    return { ...DEFAULT_INITIAL_STATE }
  }

  const answers: OnboardingAnswers = {}

  if (typeof obj.answers === 'object' && obj.answers !== null) {
    const rawAnswers = obj.answers as Record<string, unknown>

    // 1. Relocation Purpose
    const validPurposes: RelocationPurpose[] = ['study', 'work', 'family', 'explore']
    if (typeof rawAnswers.relocation_purpose === 'string' && validPurposes.includes(rawAnswers.relocation_purpose as RelocationPurpose)) {
      answers.relocation_purpose = rawAnswers.relocation_purpose as RelocationPurpose
    }

    // 2. Journey Stage
    const validStages: JourneyStage[] = ['exploring', 'preparing_apps', 'accepted_offer', 'preparing_leave', 'already_abroad']
    if (typeof rawAnswers.journey_stage === 'string' && validStages.includes(rawAnswers.journey_stage as JourneyStage)) {
      answers.journey_stage = rawAnswers.journey_stage as JourneyStage
    }

    // 3. Current Country
    if (typeof rawAnswers.current_country === 'object' && rawAnswers.current_country !== null) {
      const rawCountry = rawAnswers.current_country as { code?: unknown }
      if (typeof rawCountry.code === 'string') {
        const canonical = findCountryByCode(rawCountry.code)
        if (canonical) {
          answers.current_country = { ...canonical }
        }
      }
    }

    // 4. Citizenship
    if (typeof rawAnswers.citizenship === 'object' && rawAnswers.citizenship !== null) {
      const rawCit = rawAnswers.citizenship as { codes?: unknown; skipped?: unknown }
      if (rawCit.skipped === true) {
        answers.citizenship = { codes: [], skipped: true }
      } else if (Array.isArray(rawCit.codes)) {
        const validCodes = rawCit.codes
          .filter((c): c is string => typeof c === 'string' && Boolean(findCitizenshipByCode(c)))
        if (validCodes.length > 0) {
          answers.citizenship = { codes: validCodes }
        }
      }
    }

    // 5. Destination Country
    if (typeof rawAnswers.destination_country === 'object' && rawAnswers.destination_country !== null) {
      const rawDest = rawAnswers.destination_country as { explore?: unknown; code?: unknown }
      if (rawDest.explore === true) {
        answers.destination_country = { explore: true }
      } else if (typeof rawDest.code === 'string') {
        const canonical = findCountryByCode(rawDest.code)
        if (canonical) {
          answers.destination_country = { ...canonical }
        }
      }
    }

    // 6. Origin Country Abroad
    if (typeof rawAnswers.origin_country_abroad === 'object' && rawAnswers.origin_country_abroad !== null) {
      const rawOrig = rawAnswers.origin_country_abroad as { preferNotToSay?: unknown; code?: unknown }
      if (rawOrig.preferNotToSay === true) {
        answers.origin_country_abroad = { preferNotToSay: true }
      } else if (typeof rawOrig.code === 'string') {
        const canonical = findCountryByCode(rawOrig.code)
        if (canonical) {
          answers.origin_country_abroad = { ...canonical }
        }
      }
    }

    // 7. Destination City
    if (typeof rawAnswers.destination_city === 'object' && rawAnswers.destination_city !== null) {
      const rawCity = rawAnswers.destination_city as { cityName?: unknown; notDecided?: unknown }
      if (rawCity.notDecided === true) {
        answers.destination_city = { notDecided: true }
      } else if (typeof rawCity.cityName === 'string' && rawCity.cityName.trim().length > 0) {
        answers.destination_city = { cityName: rawCity.cityName.trim() }
      }
    }

    // 8. Destination Priorities
    if (Array.isArray(rawAnswers.destination_priorities)) {
      const validPriorities: DestinationPriority[] = [
        'study_opportunities', 'work_opportunities', 'living_costs', 
        'language', 'family_connections', 'lifestyle_community'
      ]
      const sanitized = rawAnswers.destination_priorities.filter(
        (p): p is DestinationPriority => typeof p === 'string' && validPriorities.includes(p as DestinationPriority)
      ).slice(0, 3)
      if (sanitized.length > 0) {
        answers.destination_priorities = sanitized
      }
    }

    // 9. Move Date
    if (typeof rawAnswers.move_date === 'object' && rawAnswers.move_date !== null) {
      const dateCheck = validateMoveDate(rawAnswers.move_date, answers.journey_stage)
      if (dateCheck.valid) {
        const rawDate = rawAnswers.move_date as { year?: unknown; month?: unknown; notSureYet?: unknown; preferNotToSay?: unknown }
        if (rawDate.preferNotToSay === true) {
          answers.move_date = { preferNotToSay: true }
        } else if (rawDate.notSureYet === true) {
          answers.move_date = { notSureYet: true }
        } else if (
          typeof rawDate.year === 'number' && 
          typeof rawDate.month === 'number'
        ) {
          answers.move_date = { year: rawDate.year, month: rawDate.month }
        }
      }
    }

    // 10. Stay Duration
    const validDurations: PlannedDurationAnswer[] = ['under_6_months', '6_to_12_months', '1_to_2_years', 'more_than_2_years', 'not_sure']
    if (typeof rawAnswers.planned_duration === 'string' && validDurations.includes(rawAnswers.planned_duration as PlannedDurationAnswer)) {
      answers.planned_duration = rawAnswers.planned_duration as PlannedDurationAnswer
    }

    // 11. Travel Style
    const validStyles: TravelStyleAnswer[] = ['backpacking', 'settling', 'mix', 'not_sure']
    if (typeof rawAnswers.travel_style === 'string' && validStyles.includes(rawAnswers.travel_style as TravelStyleAnswer)) {
      answers.travel_style = rawAnswers.travel_style as TravelStyleAnswer
    }

    // 12. Backpacking Destinations
    if (typeof rawAnswers.backpacking_destinations === 'object' && rawAnswers.backpacking_destinations !== null) {
      const rawBpk = rawAnswers.backpacking_destinations as { destinations?: unknown; planRouteForMe?: unknown }
      if (rawBpk.planRouteForMe === true) {
        answers.backpacking_destinations = { destinations: [], planRouteForMe: true }
      } else if (Array.isArray(rawBpk.destinations)) {
        const canonicalDests: CountryInfo[] = []
        for (const item of rawBpk.destinations) {
          if (item && typeof item === 'object' && typeof (item as { code?: unknown }).code === 'string') {
            const c = findCountryByCode((item as { code: string }).code)
            if (c) canonicalDests.push({ ...c })
          }
        }
        if (canonicalDests.length > 0) {
          answers.backpacking_destinations = { destinations: canonicalDests }
        }
      }
    }

    // 13. Companions
    const validCompanions: CompanionsAnswer[] = ['solo', 'partner', 'family', 'friends']
    if (typeof rawAnswers.companions === 'string' && validCompanions.includes(rawAnswers.companions as CompanionsAnswer)) {
      answers.companions = rawAnswers.companions as CompanionsAnswer
    }

    // 14. Living Budget
    if (typeof rawAnswers.living_budget === 'object' && rawAnswers.living_budget !== null) {
      const budgetCheck = validateLivingBudget(rawAnswers.living_budget)
      if (budgetCheck.valid) {
        const rawBgt = rawAnswers.living_budget as { currency?: unknown; amount?: unknown; helpEstimate?: unknown }
        const cur = typeof rawBgt.currency === 'string' ? rawBgt.currency.toUpperCase() : 'USD'
        if (rawBgt.helpEstimate === true) {
          answers.living_budget = { currency: cur, helpEstimate: true }
        } else if (typeof rawBgt.amount === 'number' && Number.isFinite(rawBgt.amount) && rawBgt.amount > 0) {
          answers.living_budget = { currency: cur, amount: rawBgt.amount }
        }
      }
    }

    // 15. Student: Study Level
    const validLevels: StudyLevelAnswer[] = ['language_prep', 'bachelors', 'masters', 'doctorate', 'exchange_short', 'other', 'not_sure']
    if (typeof rawAnswers.study_level === 'string' && validLevels.includes(rawAnswers.study_level as StudyLevelAnswer)) {
      answers.study_level = rawAnswers.study_level as StudyLevelAnswer
    }

    // 16. Student: University Name
    if (typeof rawAnswers.university_name === 'object' && rawAnswers.university_name !== null) {
      const rawUni = rawAnswers.university_name as { name?: unknown; notDecided?: unknown }
      if (rawUni.notDecided === true) {
        answers.university_name = { notDecided: true }
      } else if (typeof rawUni.name === 'string' && rawUni.name.trim().length > 0) {
        answers.university_name = { name: rawUni.name.trim() }
      }
    }

    // 17. Work: Work Status
    const validWork: WorkStatusAnswer[] = ['yes_offer', 'interviewing', 'not_yet', 'not_applicable', 'employed', 'starting_soon', 'looking', 'other']
    if (typeof rawAnswers.work_status === 'string' && validWork.includes(rawAnswers.work_status as WorkStatusAnswer)) {
      answers.work_status = rawAnswers.work_status as WorkStatusAnswer
    }

    // 18. Preparation Status
    if (Array.isArray(rawAnswers.preparation_status)) {
      const validItems: PreparationItem[] = [
        'admission_enrolment', 'job_offer', 'visa_permission', 'housing', 'insurance', 'travel_booking', 'nothing_yet'
      ]
      const sanitized = rawAnswers.preparation_status.filter(
        (i): i is PreparationItem => typeof i === 'string' && validItems.includes(i as PreparationItem)
      )
      if (sanitized.includes('nothing_yet')) {
        answers.preparation_status = ['nothing_yet']
      } else if (sanitized.length > 0) {
        answers.preparation_status = sanitized
      }
    }

    // 19. First Priorities
    if (Array.isArray(rawAnswers.first_priority)) {
      const validPriorities: PriorityArea[] = [
        'paperwork', 'housing', 'budget', 'language_daily_life', 'meeting_people', 'whole_process'
      ]
      const sanitized = rawAnswers.first_priority.filter(
        (p): p is PriorityArea => typeof p === 'string' && validPriorities.includes(p as PriorityArea)
      ).slice(0, 3)
      if (sanitized.length > 0) {
        answers.first_priority = sanitized
      }
    }
  }

  // Completion flag:
  // Strict check — treat completion as valid ONLY when every currently applicable required question is genuinely answered
  const allAnswered = areAllRequiredQuestionsAnswered(answers)
  const isCompleted = obj.isCompleted === true && allAnswered

  // Navigation state (currentQuestionId) clamping
  const applicable = getApplicableQuestions(answers)
  const firstUnanswered = getFirstUnansweredRequiredQuestionId(answers)
  let currentQuestionId: QuestionId = applicable[0]?.id || QUESTIONS[0].id

  if (isCompleted) {
    currentQuestionId = applicable[applicable.length - 1]?.id || QUESTIONS[0].id
  } else if (firstUnanswered) {
    if (typeof obj.currentQuestionId === 'string' && applicable.some(q => q.id === obj.currentQuestionId)) {
      const storedIdx = applicable.findIndex(q => q.id === obj.currentQuestionId)
      const unansweredIdx = applicable.findIndex(q => q.id === firstUnanswered)
      if (storedIdx > unansweredIdx) {
        currentQuestionId = firstUnanswered
      } else {
        currentQuestionId = obj.currentQuestionId as QuestionId
      }
    } else {
      currentQuestionId = firstUnanswered
    }
  } else {
    if (typeof obj.currentQuestionId === 'string' && applicable.some(q => q.id === obj.currentQuestionId)) {
      currentQuestionId = obj.currentQuestionId as QuestionId
    }
  }

  const isReviewEditing = typeof obj.isReviewEditing === 'boolean' ? obj.isReviewEditing : false
  const editingOriginQuestionId = typeof obj.editingOriginQuestionId === 'string' && applicable.some(q => q.id === obj.editingOriginQuestionId)
    ? (obj.editingOriginQuestionId as QuestionId)
    : null
  let editNavigationHistory = Array.isArray(obj.editNavigationHistory)
    ? (obj.editNavigationHistory as string[]).filter((id): id is QuestionId => typeof id === 'string' && applicable.some(q => q.id === id))
    : []
  if (editNavigationHistory.length === 0 && editingOriginQuestionId) {
    editNavigationHistory = [editingOriginQuestionId]
  }

  return {
    version: CURRENT_SCHEMA_VERSION,
    updatedAt: typeof obj.updatedAt === 'string' ? obj.updatedAt : new Date().toISOString(),
    answers,
    currentQuestionId,
    isCompleted,
    isReviewEditing: isCompleted ? false : isReviewEditing,
    editingOriginQuestionId: isCompleted ? null : editingOriginQuestionId,
    editNavigationHistory: isCompleted ? [] : editNavigationHistory,
    storageStatus: 'saved'
  }
}

/**
 * Migration helper from Schema Version 1 to Schema Version 2.
 * Critical requirement: A Task 1 preview marked completed must NOT count as completion
 * of the expanded onboarding. Resumes at the first new applicable question (citizenship).
 */
export function migrateV1State(rawV1: unknown): StoredOnboardingState {
  const sanitized = validateAndSanitizeStoredState(rawV1)
  
  // Explicitly reset isCompleted to false
  sanitized.isCompleted = false
  sanitized.isReviewEditing = false
  sanitized.editingOriginQuestionId = null
  sanitized.editNavigationHistory = []
  sanitized.version = CURRENT_SCHEMA_VERSION
  
  // Set currentQuestionId to first unanswered applicable question (e.g. citizenship)
  const firstUnanswered = getFirstUnansweredRequiredQuestionId(sanitized.answers)
  sanitized.currentQuestionId = firstUnanswered || 'citizenship'
  
  return sanitized
}

/**
 * Read from localStorage with error safety and automatic v1 -> v2 migration.
 */
export function loadPersistedState(): StoredOnboardingState {
  if (typeof window === 'undefined' || !FEATURE_FLAGS.persistProgressLocally) {
    return { ...DEFAULT_INITIAL_STATE, storageStatus: 'disabled' }
  }

  try {
    // 1. Try loading version 2 state
    const v2Item = localStorage.getItem(STORAGE_KEY_V2)
    if (v2Item) {
      const parsed = JSON.parse(v2Item)
      return validateAndSanitizeStoredState(parsed)
    }

    // 2. Fall back to version 1 state for migration
    const v1Item = localStorage.getItem(STORAGE_KEY_V1)
    if (v1Item) {
      const parsedV1 = JSON.parse(v1Item)
      const migrated = migrateV1State(parsedV1)
      // Save migrated state under v2
      try {
        localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(migrated))
      } catch {
        // Safe ignore
      }
      return migrated
    }

    return { ...DEFAULT_INITIAL_STATE }
  } catch (err) {
    console.warn('[BeyondNest] Failed to load onboarding state, resetting to defaults:', err)
    return { ...DEFAULT_INITIAL_STATE }
  }
}

/**
 * Save to localStorage with error safety and honest status reporting.
 */
export function savePersistedState(state: StoredOnboardingState): StorageStatus {
  if (typeof window === 'undefined' || !FEATURE_FLAGS.persistProgressLocally) {
    return 'disabled'
  }

  try {
    localStorage.setItem(STORAGE_KEY_V2, JSON.stringify({
      ...state,
      version: CURRENT_SCHEMA_VERSION,
      updatedAt: new Date().toISOString()
    }))
    return 'saved'
  } catch (err) {
    console.warn('[BeyondNest] Failed to persist onboarding state:', err)
    return 'error'
  }
}

/**
 * Clear onboarding persistence across all schema versions.
 */
export function clearPersistedState(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(STORAGE_KEY_V2)
    localStorage.removeItem(STORAGE_KEY_V1)
  } catch (err) {
    console.warn('[BeyondNest] Failed to clear onboarding state:', err)
  }
}

/**
 * React hook to manage adaptive onboarding state, navigation, answers, and persistence.
 */
export function useOnboardingStore() {
  const [persisted, setPersisted] = useState<StoredOnboardingState>(() => loadPersistedState())
  const [isReviewEditing, setIsReviewEditing] = useState<boolean>(Boolean(persisted.isReviewEditing))
  const [editingOriginQuestionId, setEditingOriginQuestionId] = useState<QuestionId | null>(persisted.editingOriginQuestionId || null)
  const [editNavigationHistory, setEditNavigationHistory] = useState<QuestionId[]>(() => {
    if (persisted.editNavigationHistory && persisted.editNavigationHistory.length > 0) {
      return persisted.editNavigationHistory
    }
    if (persisted.editingOriginQuestionId) {
      return [persisted.editingOriginQuestionId]
    }
    return []
  })
  const [storageStatus, setStorageStatus] = useState<StorageStatus>(persisted.storageStatus || 'saved')
  const [validationError, setValidationError] = useState<string | null>(null)

  const [screen, setScreen] = useState<FlowScreen>(() => {
    if (persisted.isCompleted) {
      return { type: 'summary' }
    }
    if (Object.keys(persisted.answers).length > 0) {
      const targetId = persisted.currentQuestionId || QUESTIONS[0].id
      return { type: 'question', questionId: targetId }
    }
    return { type: 'welcome' }
  })

  // Sync state to localStorage whenever persisted state updates
  const isInitialMount = useRef(true)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    const status = savePersistedState(persisted)
    setStorageStatus(status)
  }, [persisted])

  const applicableQuestions = useMemo(() => {
    return getApplicableQuestions(persisted.answers)
  }, [persisted.answers])

  const setAnswer = useCallback(<K extends keyof OnboardingAnswers>(questionId: K, value: OnboardingAnswers[K]) => {
    setPersisted(prev => {
      const nextAnswers = applyDependencyInvalidation(prev.answers, questionId as QuestionId, value)
      return {
        ...prev,
        answers: nextAnswers
      }
    })
    setValidationError(null)
  }, [])

  const startOnboarding = useCallback(() => {
    if (persisted.isCompleted) {
      setScreen({ type: 'summary' })
      return
    }
    const firstUnanswered = getFirstUnansweredRequiredQuestionId(persisted.answers)
    const targetId = persisted.currentQuestionId || firstUnanswered || applicableQuestions[0]?.id || QUESTIONS[0].id
    setScreen({ type: 'question', questionId: targetId })
    setPersisted(prev => ({
      ...prev,
      currentQuestionId: targetId,
      isCompleted: false
    }))
    setValidationError(null)
  }, [applicableQuestions, persisted.isCompleted, persisted.answers, persisted.currentQuestionId])

  const navigateToWelcome = useCallback(() => {
    setValidationError(null)
    setScreen({ type: 'welcome' })
  }, [])

  const goToNextQuestion = useCallback(() => {
    if (screen.type !== 'question') return

    const currentQ = getQuestionById(screen.questionId)
    if (!currentQ) return

    // Run question validation
    const currentAnswer = persisted.answers[screen.questionId]
    const validation = currentQ.validate(currentAnswer, persisted.answers)
    if (!validation.valid) {
      setValidationError(validation.error || 'Please provide an answer before continuing.')
      return
    }

    setValidationError(null)

    // Check if in Review Editing mode
    if (isReviewEditing) {
      // If there are still unanswered required questions (e.g. branch change), navigate to the first one
      const unansweredId = getFirstUnansweredRequiredQuestionId(persisted.answers)
      if (unansweredId) {
        const nextHistory = editNavigationHistory.includes(unansweredId)
          ? editNavigationHistory
          : [...editNavigationHistory, unansweredId]
        setEditNavigationHistory(nextHistory)
        setScreen({ type: 'question', questionId: unansweredId })
        setPersisted(prev => ({ 
          ...prev, 
          currentQuestionId: unansweredId, 
          isCompleted: false,
          editNavigationHistory: nextHistory
        }))
        return
      }
      // Otherwise, all applicable required questions are answered; return to summary review
      setIsReviewEditing(false)
      setEditingOriginQuestionId(null)
      setEditNavigationHistory([])
      setScreen({ type: 'summary' })
      setPersisted(prev => ({ 
        ...prev, 
        isCompleted: true, 
        isReviewEditing: false, 
        editingOriginQuestionId: null,
        editNavigationHistory: []
      }))
      return
    }

    const nextId = getNextQuestionId(screen.questionId, persisted.answers)
    if (nextId) {
      setScreen({ type: 'question', questionId: nextId })
      setPersisted(prev => ({ ...prev, currentQuestionId: nextId }))
    } else {
      // Completed all applicable questions
      setScreen({ type: 'summary' })
      setPersisted(prev => ({ ...prev, isCompleted: true }))
    }
  }, [screen, persisted.answers, isReviewEditing, editNavigationHistory])

  const goToPreviousQuestion = useCallback(() => {
    if (screen.type !== 'question') return

    setValidationError(null)
    const prevId = getPreviousQuestionId(screen.questionId, persisted.answers)

    if (isReviewEditing) {
      // If we walked into a branch during editing (e.g. relocation_purpose -> work_status),
      // popping the edit history navigates back along the edit path to the origin question
      if (editNavigationHistory.length > 1) {
        const nextHistory = editNavigationHistory.slice(0, -1)
        const targetId = nextHistory[nextHistory.length - 1]
        setEditNavigationHistory(nextHistory)
        setScreen({ type: 'question', questionId: targetId })
        setPersisted(prev => ({ 
          ...prev, 
          currentQuestionId: targetId, 
          isCompleted: false,
          editNavigationHistory: nextHistory 
        }))
        return
      }

      // We are at the origin of the edit session (editNavigationHistory has 0 or 1 item)
      const allAnswered = areAllRequiredQuestionsAnswered(persisted.answers)
      if (allAnswered) {
        setIsReviewEditing(false)
        setEditingOriginQuestionId(null)
        setEditNavigationHistory([])
        setScreen({ type: 'summary' })
        setPersisted(prev => ({ 
          ...prev, 
          isCompleted: true, 
          isReviewEditing: false, 
          editingOriginQuestionId: null,
          editNavigationHistory: []
        }))
        return
      }

      // If required answers are missing (e.g. user changed purpose to Work, work_status is missing,
      // and user presses Back on relocation_purpose):
      // NEVER show completed review. Navigate back in questionnaire if prevId exists, or to welcome.
      if (prevId) {
        setScreen({ type: 'question', questionId: prevId })
        setPersisted(prev => ({ ...prev, currentQuestionId: prevId, isCompleted: false }))
        return
      }

      // At start of questionnaire with missing required answers -> return to welcome, preserving edits
      setScreen({ type: 'welcome' })
      setPersisted(prev => ({ ...prev, isCompleted: false }))
      return
    }

    if (prevId) {
      setScreen({ type: 'question', questionId: prevId })
      setPersisted(prev => ({ ...prev, currentQuestionId: prevId }))
    } else {
      // Back to welcome
      setScreen({ type: 'welcome' })
    }
  }, [screen, persisted.answers, isReviewEditing, editNavigationHistory])

  const editAnswer = useCallback((questionId: QuestionId) => {
    setValidationError(null)
    setIsReviewEditing(true)
    setEditingOriginQuestionId(questionId)
    setEditNavigationHistory([questionId])
    setScreen({ type: 'question', questionId })
    setPersisted(prev => ({ 
      ...prev, 
      currentQuestionId: questionId, 
      isCompleted: false,
      isReviewEditing: true,
      editingOriginQuestionId: questionId,
      editNavigationHistory: [questionId]
    }))
  }, [])

  const resetOnboarding = useCallback(() => {
    clearPersistedState()
    setIsReviewEditing(false)
    setEditingOriginQuestionId(null)
    setEditNavigationHistory([])
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
    const idx = applicableQuestions.findIndex(q => q.id === screen.questionId)
    return idx >= 0 ? idx + 1 : 1
  }, [screen, applicableQuestions])

  const totalSteps = useMemo(() => {
    return applicableQuestions.length
  }, [applicableQuestions])

  return {
    screen,
    answers: persisted.answers,
    currentQuestion,
    currentStepNumber,
    totalSteps,
    applicableQuestions,
    validationError,
    storageStatus,
    isReviewEditing,
    editingOriginQuestionId,
    editNavigationHistory,
    setAnswer,
    startOnboarding,
    navigateToWelcome,
    goToNextQuestion,
    goToPreviousQuestion,
    editAnswer,
    resetOnboarding
  }
}

