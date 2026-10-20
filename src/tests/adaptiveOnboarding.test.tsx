import { describe, it, expect, beforeEach } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { App } from '../App'
import { 
  getQuestionById, 
  getApplicableQuestions
} from '../config/questions'
import { 
  applyDependencyInvalidation, 
  validateAndSanitizeStoredState, 
  migrateV1State,
  loadPersistedState,
  STORAGE_KEY_V1,
  STORAGE_KEY_V2,
  CURRENT_SCHEMA_VERSION
} from '../store/onboardingStore'
import type { OnboardingAnswers, CountryInfo } from '../store/types'
import { searchCitizenships, findCitizenshipByCode } from '../data/citizenships'

describe('Task 2: Adaptive Onboarding Comprehensive Coverage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('1. Student and Work Branching', () => {
    it('activates student questions only when relocation_purpose is study', () => {
      const studentAnswers: OnboardingAnswers = { relocation_purpose: 'study' }
      const studentQuestions = getApplicableQuestions(studentAnswers).map(q => q.id)

      expect(studentQuestions).toContain('study_level')
      expect(studentQuestions).toContain('university_name')
      expect(studentQuestions).not.toContain('work_status')
    })

    it('activates work question only when relocation_purpose is work', () => {
      const workAnswers: OnboardingAnswers = { relocation_purpose: 'work' }
      const workQuestions = getApplicableQuestions(workAnswers).map(q => q.id)

      expect(workQuestions).toContain('work_status')
      expect(workQuestions).not.toContain('study_level')
      expect(workQuestions).not.toContain('university_name')
    })

    it('dynamically adapts work_status options for already abroad users', () => {
      const workQ = getQuestionById('work_status')!
      expect(workQ).toBeDefined()

      const optionsFn = workQ.options as any
      const preparingOptions = optionsFn({ journey_stage: 'exploring' })
      expect(preparingOptions.some((o: any) => o.id === 'yes_offer')).toBe(true)
      expect(preparingOptions.some((o: any) => o.id === 'employed')).toBe(false)

      const abroadOptions = optionsFn({ journey_stage: 'already_abroad' })
      expect(abroadOptions.some((o: any) => o.id === 'employed')).toBe(true)
      expect(abroadOptions.some((o: any) => o.id === 'yes_offer')).toBe(false)
    })
  })

  describe('2. Undecided Destinations and Priority Guidance', () => {
    it('activates destination_priorities and hides destination_city when destination is explore', () => {
      const exploreAnswers: OnboardingAnswers = {
        destination_country: { explore: true }
      }
      const questions = getApplicableQuestions(exploreAnswers).map(q => q.id)

      expect(questions).toContain('destination_priorities')
      expect(questions).not.toContain('destination_city')
    })

    it('activates destination_city and hides destination_priorities when specific country is chosen', () => {
      const countryAnswers: OnboardingAnswers = {
        destination_country: {
          code: 'DE',
          name: 'Germany',
          lat: 51.1657,
          lon: 10.4515,
          region: 'Europe'
        }
      }
      const questions = getApplicableQuestions(countryAnswers).map(q => q.id)

      expect(questions).toContain('destination_city')
      expect(questions).not.toContain('destination_priorities')
    })

    it('validates destination_priorities with maximum of 3 choices', () => {
      const prioritiesQ = getQuestionById('destination_priorities')
      expect(prioritiesQ).toBeDefined()

      expect(prioritiesQ?.validate([])).toEqual({
        valid: false,
        error: 'Please select at least one priority.'
      })

      expect(prioritiesQ?.validate(['study_opportunities', 'living_costs'])).toEqual({
        valid: true
      })

      expect(prioritiesQ?.validate([
        'study_opportunities', 'work_opportunities', 'living_costs', 'language'
      ])).toEqual({
        valid: false,
        error: 'You can select a maximum of three priorities.'
      })
    })
  })

  describe('3. Citizenship Model and Skipped Citizenship', () => {
    it('allows searching sovereign citizenships by country or demonym', () => {
      const canadian = searchCitizenships('canadian')
      expect(canadian.some(c => c.countryName === 'Canada' && c.nationality === 'Canadian')).toBe(true)

      const japan = searchCitizenships('japan')
      expect(japan.some(c => c.code === 'JP' && c.nationality === 'Japanese')).toBe(true)

      const us = findCitizenshipByCode('US')
      expect(us?.countryName).toBe('United States')
      expect(us?.nationality).toBe('American')
    })

    it('validates skipped citizenship or selected passport codes', () => {
      const citQ = getQuestionById('citizenship')
      expect(citQ).toBeDefined()

      // Valid skipped
      expect(citQ?.validate({ codes: [], skipped: true })).toEqual({ valid: true })

      // Valid selected passports
      expect(citQ?.validate({ codes: ['CA', 'FR'], skipped: false })).toEqual({ valid: true })

      // Invalid empty without skip
      expect(citQ?.validate({ codes: [], skipped: false })).toEqual({
        valid: false,
        error: expect.any(String)
      })

      // Invalid undefined/null
      expect(citQ?.validate(null)).toEqual({
        valid: false,
        error: expect.any(String)
      })
    })
  })

  describe('4. Already-Abroad Origin & Destination Semantics', () => {
    it('activates origin_country_abroad only when journey_stage is already_abroad', () => {
      const preparingAnswers: OnboardingAnswers = { journey_stage: 'preparing_leave' }
      expect(getApplicableQuestions(preparingAnswers).map(q => q.id)).not.toContain('origin_country_abroad')

      const abroadAnswers: OnboardingAnswers = { journey_stage: 'already_abroad' }
      expect(getApplicableQuestions(abroadAnswers).map(q => q.id)).toContain('origin_country_abroad')
    })

    it('adapts question titles and wording for already-abroad movers', () => {
      const destQ = getQuestionById('destination_country')!
      expect(typeof destQ.title === 'function').toBe(true)
      const destTitleFn = destQ.title as any
      expect(destTitleFn({ journey_stage: 'already_abroad' })).toBe('Which country did you move to?')
      expect(destTitleFn({ journey_stage: 'exploring' })).toBe('Where would you like to move?')

      const moveDateQ = getQuestionById('move_date')!
      const moveDateTitleFn = moveDateQ.title as any
      expect(moveDateTitleFn({ journey_stage: 'already_abroad' })).toBe('When did you arrive?')
      expect(moveDateTitleFn({ journey_stage: 'exploring' })).toBe('When are you planning to move?')
    })
  })

  describe('5. Move and Arrival Date Validation', () => {
    const moveDateQ = getQuestionById('move_date')
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1

    it('allows current month for future planning', () => {
      const res = moveDateQ?.validate(
        { year: currentYear, month: currentMonth },
        { journey_stage: 'preparing_leave' }
      )
      expect(res).toEqual({ valid: true })
    })

    it('rejects past months for users preparing to move', () => {
      const res = moveDateQ?.validate(
        { year: currentYear - 1, month: currentMonth },
        { journey_stage: 'preparing_leave' }
      )
      expect(res).toEqual({
        valid: false,
        error: 'Planning date cannot be in the past.'
      })
    })

    it('allows past dates and rejects future arrival months for already-abroad users', () => {
      // Past month allowed for arrival
      const pastArrival = moveDateQ?.validate(
        { year: currentYear - 1, month: 5 },
        { journey_stage: 'already_abroad' }
      )
      expect(pastArrival).toEqual({ valid: true })

      // Future month rejected for arrival
      const futureArrival = moveDateQ?.validate(
        { year: currentYear + 1, month: 1 },
        { journey_stage: 'already_abroad' }
      )
      expect(futureArrival).toEqual({
        valid: false,
        error: 'Arrival date cannot be in the future.'
      })
    })

    it('accepts notSureYet for planning and preferNotToSay for already abroad', () => {
      expect(moveDateQ?.validate({ notSureYet: true }, { journey_stage: 'exploring' })).toEqual({
        valid: true
      })
      expect(moveDateQ?.validate({ preferNotToSay: true }, { journey_stage: 'already_abroad' })).toEqual({
        valid: true
      })
    })
  })

  describe('6. Backpacking Destinations & Route Order', () => {
    it('activates backpacking_destinations only for backpacking or mix', () => {
      expect(getApplicableQuestions({ travel_style: 'settling' }).map(q => q.id)).not.toContain('backpacking_destinations')
      expect(getApplicableQuestions({ travel_style: 'backpacking' }).map(q => q.id)).toContain('backpacking_destinations')
      expect(getApplicableQuestions({ travel_style: 'mix' }).map(q => q.id)).toContain('backpacking_destinations')
    })

    it('preserves user selection order as tentative route', () => {
      const spain: CountryInfo = { code: 'ES', name: 'Spain', lat: 40.4637, lon: -3.7492, region: 'Europe' }
      const france: CountryInfo = { code: 'FR', name: 'France', lat: 46.2276, lon: 2.2137, region: 'Europe' }
      const italy: CountryInfo = { code: 'IT', name: 'Italy', lat: 41.8719, lon: 12.5674, region: 'Europe' }

      const raw = {
        version: CURRENT_SCHEMA_VERSION,
        answers: {
          travel_style: 'backpacking',
          backpacking_destinations: {
            destinations: [spain, france, italy]
          }
        }
      }

      const sanitized = validateAndSanitizeStoredState(raw)
      expect(sanitized.answers.backpacking_destinations?.destinations?.map(d => d.code)).toEqual(['ES', 'FR', 'IT'])
    })
  })

  describe('7. Dependent-Answer Invalidation Policy', () => {
    it('clears study fields and removes admission_enrolment when purpose changes from study to work', () => {
      const initial: OnboardingAnswers = {
        relocation_purpose: 'study',
        study_level: 'masters',
        university_name: { name: 'Oxford' },
        preparation_status: ['admission_enrolment', 'housing']
      }

      const updated = applyDependencyInvalidation(initial, 'relocation_purpose', 'work')
      expect(updated.relocation_purpose).toBe('work')
      expect(updated.study_level).toBeUndefined()
      expect(updated.university_name).toBeUndefined()
      expect(updated.preparation_status).toEqual(['housing'])
    })

    it('clears destination_city when destination changes to explore', () => {
      const initial: OnboardingAnswers = {
        destination_country: { code: 'JP', name: 'Japan', lat: 36, lon: 138, region: 'Asia' },
        destination_city: { cityName: 'Kyoto' }
      }

      const updated = applyDependencyInvalidation(initial, 'destination_country', { explore: true })
      expect(updated.destination_city).toBeUndefined()
    })

    it('clears destination_city when target destination country changes', () => {
      const initial: OnboardingAnswers = {
        destination_country: { code: 'JP', name: 'Japan', lat: 36, lon: 138, region: 'Asia' },
        destination_city: { cityName: 'Kyoto' }
      }

      const updated = applyDependencyInvalidation(initial, 'destination_country', {
        code: 'CA',
        name: 'Canada',
        lat: 56,
        lon: -106,
        region: 'Americas'
      })
      expect(updated.destination_city).toBeUndefined()
    })

    it('clears backpacking_destinations when travel style changes to settling', () => {
      const initial: OnboardingAnswers = {
        travel_style: 'backpacking',
        backpacking_destinations: {
          destinations: [{ code: 'ES', name: 'Spain', lat: 40, lon: -3, region: 'Europe' }]
        }
      }

      const updated = applyDependencyInvalidation(initial, 'travel_style', 'settling')
      expect(updated.backpacking_destinations).toBeUndefined()
    })
  })

  describe('8. Mutual Exclusivity for "Nothing Yet"', () => {
    const prepQ = getQuestionById('preparation_status')

    it('rejects selection combining nothing_yet with other items', () => {
      expect(prepQ?.validate(['nothing_yet', 'housing'])).toEqual({
        valid: false,
        error: '"Nothing yet" cannot be selected together with other arranged items.'
      })
    })

    it('isolates nothing_yet if user clicks it after other items were selected', () => {
      const prev: OnboardingAnswers = { preparation_status: ['housing', 'insurance'] }
      const next = applyDependencyInvalidation(prev, 'preparation_status', ['housing', 'insurance', 'nothing_yet'])
      expect(next.preparation_status).toEqual(['nothing_yet'])
    })

    it('removes nothing_yet if user clicks another item while nothing_yet was active', () => {
      const prev: OnboardingAnswers = { preparation_status: ['nothing_yet'] }
      const next = applyDependencyInvalidation(prev, 'preparation_status', ['nothing_yet', 'housing'])
      expect(next.preparation_status).toEqual(['housing'])
    })
  })

  describe('9. Schema Version 1 Migration and Incomplete States', () => {
    it('resets completion flag when migrating a completed version 1 preview', () => {
      const v1Completed = {
        version: 1,
        updatedAt: '2026-10-15T00:00:00.000Z',
        answers: {
          relocation_purpose: 'study',
          journey_stage: 'exploring',
          current_country: { code: 'GB', name: 'United Kingdom', lat: 55, lon: -3, region: 'Europe' }
        },
        currentQuestionId: 'current_country',
        isCompleted: true // Task 1 marked complete
      }

      const migrated = migrateV1State(v1Completed)

      // Must NOT be marked completed for expanded onboarding!
      expect(migrated.isCompleted).toBe(false)
      expect(migrated.version).toBe(CURRENT_SCHEMA_VERSION)
      // Must resume at the first new unanswered question
      expect(migrated.currentQuestionId).toBe('citizenship')
    })

    it('automatically reads and migrates v1 localStorage key when v2 key is absent', () => {
      const v1State = {
        version: 1,
        updatedAt: '2026-10-15T00:00:00.000Z',
        answers: {
          relocation_purpose: 'work',
          journey_stage: 'accepted_offer',
          current_country: { code: 'CA', name: 'Canada', lat: 56, lon: -106, region: 'Americas' }
        },
        currentQuestionId: 'current_country',
        isCompleted: true
      }
      localStorage.setItem(STORAGE_KEY_V1, JSON.stringify(v1State))

      const loaded = loadPersistedState()
      expect(loaded.version).toBe(CURRENT_SCHEMA_VERSION)
      expect(loaded.answers.relocation_purpose).toBe('work')
      expect(loaded.isCompleted).toBe(false)
      expect(loaded.currentQuestionId).toBe('citizenship')

      // Verifies v2 key was saved
      expect(localStorage.getItem(STORAGE_KEY_V2)).not.toBeNull()
    })
  })

  describe('10. Realistic User-Event Integration: Review Editing Flow', () => {
    it('allows editing from review and handles guided navigation if branch changes', async () => {
      const user = userEvent.setup()

      // Seed a completed profile with purpose = study
      const completeAnswers: OnboardingAnswers = {
        relocation_purpose: 'study',
        journey_stage: 'exploring',
        current_country: { code: 'JP', name: 'Japan', lat: 36, lon: 138, region: 'Asia' },
        citizenship: { skipped: true, codes: [] },
        destination_country: { explore: true },
        destination_priorities: ['study_opportunities'],
        move_date: { notSureYet: true },
        planned_duration: '1_to_2_years',
        travel_style: 'settling',
        companions: 'solo',
        living_budget: { currency: 'USD', helpEstimate: true },
        study_level: 'masters',
        university_name: { notDecided: true },
        preparation_status: ['nothing_yet'],
        first_priority: ['paperwork']
      }

      localStorage.setItem(STORAGE_KEY_V2, JSON.stringify({
        version: CURRENT_SCHEMA_VERSION,
        updatedAt: new Date().toISOString(),
        answers: completeAnswers,
        currentQuestionId: 'first_priority',
        isCompleted: true
      }))

      render(<App />)

      // 1. Should be on the Review screen
      await waitFor(() => {
        expect(screen.getByText('Your next chapter is taking shape.')).toBeInTheDocument()
      })
      expect(screen.getByText('Milestone 2 Complete')).toBeInTheDocument()
      expect(screen.getByText(/Saved locally/i)).toBeInTheDocument()

      // 2. Click Edit on "Purpose for Moving"
      const editPurposeBtn = screen.getByRole('button', { name: /Edit Purpose for Moving/i })
      await user.click(editPurposeBtn)

      // Should navigate to Question 1
      await waitFor(() => {
        expect(screen.getByText('What brings you to a new country?')).toBeInTheDocument()
      })

      // 3. Switch Purpose to "Work"
      // This will clear study fields (study_level, university_name) and make work_status required!
      const workCard = screen.getByRole('radio', { name: /^Work/i })
      await user.click(workCard)

      // 4. Click Continue
      const continueBtn = screen.getByRole('button', { name: /Continue/i })
      await user.click(continueBtn)

      // Since work_status is now required and unanswered, navigation must guide user to work_status!
      await waitFor(() => {
        expect(screen.getByText(/Do you already have a job offer\?/i)).toBeInTheDocument()
      })

      // 5. Answer work_status
      const offerCard = screen.getByRole('radio', { name: /^Yes/i })
      await user.click(offerCard)

      // 6. Click Continue: All applicable questions are now answered, returns to Review Screen
      const continueBtnWork = screen.getByRole('button', { name: /Continue/i })
      await user.click(continueBtnWork)

      await waitFor(() => {
        expect(screen.getByText('Your next chapter is taking shape.')).toBeInTheDocument()
      })

      // 7. Test Reset confirmation modal
      const startAgainBtn = document.getElementById('start-again-button')!
      expect(startAgainBtn).toBeInTheDocument()
      await user.click(startAgainBtn)

      // Modal appears
      expect(screen.getByText('Reset your journey?')).toBeInTheDocument()
      const confirmResetBtn = screen.getByRole('button', { name: /Reset everything/i })
      await user.click(confirmResetBtn)

      // Returns to Welcome Screen and storage is cleared
      await waitFor(() => {
        expect(screen.getByText(/A new country\. A new chapter\. Let’s get you ready\./i)).toBeInTheDocument()
      })
    })
  })
})
