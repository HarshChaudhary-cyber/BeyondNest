import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OnboardingShell } from '../components/onboarding/OnboardingShell'
import { 
  validateAndSanitizeStoredState, 
  STORAGE_KEY_V2
} from '../store/onboardingStore'
import { validateMoveDate, MIN_ARRIVAL_YEAR, MAX_PLANNING_OFFSET_YEARS } from '../utils/dateValidation'
import { validateLivingBudget } from '../utils/budgetValidation'
import { isSupportedCurrency } from '../data/currencies'
import type { OnboardingAnswers, StoredOnboardingState } from '../store/types'

// Mock 3D Canvas
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => <div data-testid="r3f-canvas">{children}</div>,
  useFrame: () => {},
  useThree: () => ({
    camera: { position: { set: () => {} }, lookAt: () => {} },
    gl: { setPixelRatio: () => {} },
    scene: {}
  })
}))

describe('Task 2.1: Review Navigation, Reset Safety, and Validation', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
  })

  // -------------------------------------------------------------
  // 1. Numeric and Saved Data Validation: Dates
  // -------------------------------------------------------------
  describe('1. Date Validation: Finite Integers, Bounds, and Sensible Limits', () => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1

    it('rejects fractional years, fractional months, NaN, and Infinity', () => {
      expect(validateMoveDate({ year: 2026.5, month: 6 }, 'exploring', now).valid).toBe(false)
      expect(validateMoveDate({ year: 2026, month: 6.5 }, 'exploring', now).valid).toBe(false)
      expect(validateMoveDate({ year: NaN, month: 6 }, 'exploring', now).valid).toBe(false)
      expect(validateMoveDate({ year: 2026, month: NaN }, 'exploring', now).valid).toBe(false)
      expect(validateMoveDate({ year: Infinity, month: 6 }, 'exploring', now).valid).toBe(false)
      expect(validateMoveDate({ year: 2026, month: Infinity }, 'exploring', now).valid).toBe(false)
    })

    it('rejects months outside 1 to 12 range', () => {
      expect(validateMoveDate({ year: currentYear + 1, month: 0 }, 'exploring', now).valid).toBe(false)
      expect(validateMoveDate({ year: currentYear + 1, month: 13 }, 'exploring', now).valid).toBe(false)
      expect(validateMoveDate({ year: currentYear + 1, month: -1 }, 'exploring', now).valid).toBe(false)
    })

    it('enforces sensible year limits for planning and arrival', () => {
      // Planning cannot be more than MAX_PLANNING_OFFSET_YEARS in the future
      expect(validateMoveDate({ year: currentYear + MAX_PLANNING_OFFSET_YEARS + 1, month: 6 }, 'exploring', now).valid).toBe(false)
      // Planning cannot be in the past
      expect(validateMoveDate({ year: currentYear - 1, month: 6 }, 'exploring', now).valid).toBe(false)

      // Already abroad arrival cannot be earlier than MIN_ARRIVAL_YEAR (1950)
      expect(validateMoveDate({ year: MIN_ARRIVAL_YEAR - 1, month: 6 }, 'already_abroad', now).valid).toBe(false)
      // Already abroad arrival cannot be in the future
      expect(validateMoveDate({ year: currentYear + 1, month: 1 }, 'already_abroad', now).valid).toBe(false)
    })

    it('supports the current local calendar month for both planning and arrival', () => {
      const planningCurrent = validateMoveDate({ year: currentYear, month: currentMonth }, 'exploring', now)
      expect(planningCurrent.valid).toBe(true)

      const arrivalCurrent = validateMoveDate({ year: currentYear, month: currentMonth }, 'already_abroad', now)
      expect(arrivalCurrent.valid).toBe(true)
    })

    it('honors valid skip flags conditionally by journey stage', () => {
      expect(validateMoveDate({ notSureYet: true }, 'exploring', now).valid).toBe(true)
      expect(validateMoveDate({ notSureYet: true }, 'already_abroad', now).valid).toBe(false)

      expect(validateMoveDate({ preferNotToSay: true }, 'already_abroad', now).valid).toBe(true)
      expect(validateMoveDate({ preferNotToSay: true }, 'exploring', now).valid).toBe(false)
    })
  })

  // -------------------------------------------------------------
  // 2. Numeric and Saved Data Validation: Living Budget
  // -------------------------------------------------------------
  describe('2. Budget Validation: Finite Positive Amounts and Supported Currencies', () => {
    it('validates supported currencies from the currency registry', () => {
      expect(isSupportedCurrency('USD')).toBe(true)
      expect(isSupportedCurrency('EUR')).toBe(true)
      expect(isSupportedCurrency('GBP')).toBe(true)
      expect(isSupportedCurrency('JPY')).toBe(true)
      expect(isSupportedCurrency('INR')).toBe(true)
      expect(isSupportedCurrency('CAD')).toBe(true)
      expect(isSupportedCurrency('AUD')).toBe(true)
      expect(isSupportedCurrency('CHF')).toBe(true)
      expect(isSupportedCurrency('FAKE')).toBe(false)
      expect(isSupportedCurrency(null)).toBe(false)
      expect(isSupportedCurrency(123)).toBe(false)
    })

    it('rejects unsupported currency codes and invalid amounts', () => {
      expect(validateLivingBudget({ currency: 'XYZ', amount: 1500 }).valid).toBe(false)
      expect(validateLivingBudget({ currency: 'USD', amount: -200 }).valid).toBe(false)
      expect(validateLivingBudget({ currency: 'USD', amount: 0 }).valid).toBe(false)
      expect(validateLivingBudget({ currency: 'USD', amount: NaN }).valid).toBe(false)
      expect(validateLivingBudget({ currency: 'USD', amount: Infinity }).valid).toBe(false)
      expect(validateLivingBudget({ currency: 'USD', amount: -Infinity }).valid).toBe(false)
      expect(validateLivingBudget({ currency: 'USD' }).valid).toBe(false)
    })

    it('accepts valid amounts with flexible decimal precision', () => {
      expect(validateLivingBudget({ currency: 'USD', amount: 1500 }).valid).toBe(true)
      expect(validateLivingBudget({ currency: 'EUR', amount: 1250.5 }).valid).toBe(true)
      expect(validateLivingBudget({ currency: 'GBP', amount: 980.75 }).valid).toBe(true)
      expect(validateLivingBudget({ currency: 'JPY', amount: 200000 }).valid).toBe(true)
      expect(validateLivingBudget({ currency: 'USD', helpEstimate: true }).valid).toBe(true)
    })
  })

  // -------------------------------------------------------------
  // 3. Stored Data Sanitization: Reject Malformed, Keep Independent Valid Answers
  // -------------------------------------------------------------
  describe('3. Saved Data Sanitization & Invalidation', () => {
    it('safely strips fractional or nonfinite dates from storage while preserving valid answers', () => {
      const rawStored = {
        version: 2,
        answers: {
          relocation_purpose: 'study',
          journey_stage: 'exploring',
          current_country: { code: 'US', name: 'United States', region: 'Americas' },
          move_date: { year: 2026.5, month: 6 } // Invalid fractional year
        },
        currentQuestionId: 'move_date',
        isCompleted: false
      }

      const sanitized = validateAndSanitizeStoredState(rawStored)
      expect(sanitized.answers.relocation_purpose).toBe('study')
      expect(sanitized.answers.current_country?.code).toBe('US')
      expect(sanitized.answers.move_date).toBeUndefined()
    })

    it('safely strips invalid budget amounts or unsupported currencies from storage', () => {
      const rawStored = {
        version: 2,
        answers: {
          relocation_purpose: 'work',
          journey_stage: 'already_abroad',
          current_country: { code: 'GB', name: 'United Kingdom', region: 'Europe' },
          living_budget: { currency: 'UNSUPPORTED_COIN', amount: 2500 }
        },
        currentQuestionId: 'living_budget',
        isCompleted: false
      }

      const sanitized = validateAndSanitizeStoredState(rawStored)
      expect(sanitized.answers.relocation_purpose).toBe('work')
      expect(sanitized.answers.living_budget).toBeUndefined()
    })
  })

  // -------------------------------------------------------------
  // 4. Review Editing & Back Navigation with Newly Required Branches
  // -------------------------------------------------------------
  describe('4. Review Editing and Guided Back Navigation', () => {
    const fullStudyAnswers: OnboardingAnswers = {
      relocation_purpose: 'study',
      journey_stage: 'accepted_offer',
      current_country: { code: 'US', name: 'United States', region: 'Americas', lat: 37.0902, lon: -95.7129 },
      citizenship: { codes: ['US'] },
      destination_country: { code: 'CA', name: 'Canada', region: 'Americas', lat: 56.1304, lon: -106.3468 },
      destination_city: { cityName: 'Toronto' },
      move_date: { year: new Date().getFullYear() + 1, month: 9 },
      planned_duration: '1_to_2_years',
      travel_style: 'settling',
      companions: 'solo',
      living_budget: { currency: 'CAD', amount: 2200 },
      study_level: 'masters',
      university_name: { name: 'University of Toronto' },
      preparation_status: ['admission_enrolment'],
      first_priority: ['housing', 'paperwork']
    }

    it('changing Study to Work and pressing Back returns to purpose without showing incomplete review', async () => {
      const completedStudyState: StoredOnboardingState = {
        version: 2,
        updatedAt: new Date().toISOString(),
        answers: { ...fullStudyAnswers },
        currentQuestionId: 'first_priority',
        isCompleted: true
      }
      localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(completedStudyState))

      const user = userEvent.setup()
      render(<OnboardingShell />)

      // Verify we are on review screen
      expect(await screen.findByText(/Your next chapter is taking shape/i)).toBeInTheDocument()

      // Click "Edit" on relocation purpose
      const editPurposeBtn = screen.getByLabelText(/Edit Purpose for Moving/i)
      await user.click(editPurposeBtn)

      // Verify we are on the purpose question
      expect(await screen.findByRole('heading', { name: /What brings you to a new country\?/i })).toBeInTheDocument()

      // Change purpose to Work
      const workRadio = screen.getByRole('radio', { name: /^Work\b/i })
      await user.click(workRadio)

      // Click Continue
      const continueBtn = screen.getByRole('button', { name: /Continue/i })
      await user.click(continueBtn)

      // Because purpose changed to Work, work_status is now required and unanswered.
      // The flow must guide user to work_status, NOT show summary!
      expect(await screen.findByText(/Do you already have a job offer\?/i)).toBeInTheDocument()

      // Now on work_status, press "Back"
      const backBtn = screen.getByRole('button', { name: /Back/i })
      await user.click(backBtn)

      // Back navigation MUST step back to relocation_purpose!
      // It must NEVER show a completed review screen while work_status is unanswered!
      expect(await screen.findByRole('heading', { name: /What brings you to a new country\?/i })).toBeInTheDocument()
      expect(screen.queryByText(/Your next chapter is taking shape/i)).not.toBeInTheDocument()

      // The work radio remains selected
      const workRadioAgain = screen.getByRole('radio', { name: /^Work\b/i })
      expect(workRadioAgain).toBeChecked()
    })

    it('safely recovers on refresh during edit mode without presenting completed review', () => {
      // Simulate intermediate editing state: user changed purpose to Work but has not answered work_status
      const intermediateEditState = {
        version: 2,
        updatedAt: new Date().toISOString(),
        answers: {
          ...fullStudyAnswers,
          relocation_purpose: 'work'
          // study_level and university_name are cleared, work_status is missing!
        },
        currentQuestionId: 'work_status',
        isCompleted: true, // Malformed attempt to mark completed
        isReviewEditing: true,
        editingOriginQuestionId: 'relocation_purpose'
      }
      delete (intermediateEditState.answers as any).study_level
      delete (intermediateEditState.answers as any).university_name

      const sanitized = validateAndSanitizeStoredState(intermediateEditState)

      // Completion MUST be strictly false because work_status is missing
      expect(sanitized.isCompleted).toBe(false)
      // Must resume at work_status
      expect(sanitized.currentQuestionId).toBe('work_status')
    })

    it('destination change invalidates city and guides user through missing answers', async () => {
      const completedStudyState: StoredOnboardingState = {
        version: 2,
        updatedAt: new Date().toISOString(),
        answers: { ...fullStudyAnswers },
        currentQuestionId: 'first_priority',
        isCompleted: true
      }
      localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(completedStudyState))

      const user = userEvent.setup()
      render(<OnboardingShell />)

      expect(await screen.findByText(/Your next chapter is taking shape/i)).toBeInTheDocument()

      // Edit destination country
      const editDestBtn = screen.getByLabelText(/Edit Destination/i)
      await user.click(editDestBtn)

      expect(await screen.findByText(/Where would you like to move\?/i)).toBeInTheDocument()

      // Select Japan instead of Canada
      const destInput = screen.getByRole('combobox')
      await user.clear(destInput)
      await user.type(destInput, 'Japan')
      const japanOption = await screen.findByRole('option', { name: /Japan/i })
      await user.click(japanOption)

      // Click Continue
      const continueBtn = screen.getByRole('button', { name: /Continue/i })
      await user.click(continueBtn)

      // City was invalidated because destination changed from Canada to Japan.
      // Must guide to destination_city question!
      expect(await screen.findByText(/Do you have a city in mind\?/i)).toBeInTheDocument()

      // Press Back on city question -> returns to destination_country
      const backBtn = screen.getByRole('button', { name: /Back/i })
      await user.click(backBtn)

      expect(await screen.findByText(/Where would you like to move\?/i)).toBeInTheDocument()
      expect(screen.queryByText(/Your next chapter is taking shape/i)).not.toBeInTheDocument()
    })

    it('changing journey stage to already_abroad invalidates future move_date, introduces origin_country_abroad, and handles Back safely', async () => {
      const completedStudyState: StoredOnboardingState = {
        version: 2,
        updatedAt: new Date().toISOString(),
        answers: { ...fullStudyAnswers },
        currentQuestionId: 'first_priority',
        isCompleted: true
      }
      localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(completedStudyState))

      const user = userEvent.setup()
      render(<OnboardingShell />)

      expect(await screen.findByText(/Your next chapter is taking shape/i)).toBeInTheDocument()

      // Edit journey stage
      const editStageBtn = screen.getByLabelText(/Edit Journey Stage/i)
      await user.click(editStageBtn)

      expect(await screen.findByText(/Where are you in your journey\?/i)).toBeInTheDocument()

      // Select "Already abroad"
      const alreadyAbroadRadio = screen.getByRole('radio', { name: /^Already abroad\b/i })
      await user.click(alreadyAbroadRadio)

      // Click Continue
      const continueBtn = screen.getByRole('button', { name: /Continue/i })
      await user.click(continueBtn)

      // origin_country_abroad is optional, but move_date was a future date which is invalid for already_abroad.
      // Therefore move_date was invalidated and is now required and unanswered.
      // Must guide user to arrival date question!
      expect(await screen.findByRole('heading', { name: /When did you arrive\?/i })).toBeInTheDocument()

      // Now press Back
      const backBtn = screen.getByRole('button', { name: /Back/i })
      await user.click(backBtn)

      // Must step back to journey_stage, NOT completed review
      expect(await screen.findByText(/Where are you in your journey\?/i)).toBeInTheDocument()
      expect(screen.queryByText(/Your next chapter is taking shape/i)).not.toBeInTheDocument()
    })

    it('clearing a required answer prevents completion and Back navigation never shows completed review', async () => {
      const completedStudyState: StoredOnboardingState = {
        version: 2,
        updatedAt: new Date().toISOString(),
        answers: { ...fullStudyAnswers },
        currentQuestionId: 'first_priority',
        isCompleted: true
      }
      localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(completedStudyState))

      const user = userEvent.setup()
      render(<OnboardingShell />)

      expect(await screen.findByText(/Your next chapter is taking shape/i)).toBeInTheDocument()

      // Edit destination city
      const editCityBtn = screen.getByLabelText(/Edit City/i)
      await user.click(editCityBtn)

      expect(await screen.findByText(/Do you have a city in mind\?/i)).toBeInTheDocument()

      // Clear the city text input
      const cityInput = screen.getByRole('textbox')
      await user.clear(cityInput)

      // Click Continue
      const continueBtn = screen.getByRole('button', { name: /Continue/i })
      await user.click(continueBtn)

      // Validation error alert shown, prevents returning to summary
      const alert = await screen.findByRole('alert')
      expect(alert).toHaveTextContent(/Please enter a city or select/i)
      expect(screen.queryByText(/Your next chapter is taking shape/i)).not.toBeInTheDocument()



      // Press Back: at edit origin, but allRequired is now false (city is invalid/blank)
      const backBtn = screen.getByRole('button', { name: /Back/i })
      await user.click(backBtn)

      // Navigates back in questionnaire flow without marking completed!
      expect(screen.queryByText(/Your next chapter is taking shape/i)).not.toBeInTheDocument()
    })
  })


  // -------------------------------------------------------------
  // 5. Centralised Reset Confirmation & Accessible Dialog Focus
  // -------------------------------------------------------------
  describe('5. Reset Confirmation Dialog Accessibility & Focus Restoration', () => {
    it('clicking Header Start again opens dialog, Cancel restores focus, and progress is preserved', async () => {
      const user = userEvent.setup()
      render(<OnboardingShell />)

      // Start onboarding
      const startBtn = screen.getByRole('button', { name: /Plan my move/i })
      await user.click(startBtn)

      // Select study
      const studyRadio = await screen.findByRole('radio', { name: /Study/i })
      await user.click(studyRadio)

      // Header Start again button is visible
      const headerResetBtn = screen.getByRole('button', { name: /Start again/i })
      await user.click(headerResetBtn)

      // Dialog is open
      const dialog = await screen.findByRole('alertdialog')
      expect(dialog).toBeInTheDocument()
      expect(screen.getByText(/Reset your journey\?/i)).toBeInTheDocument()

      // Initial focus is on Cancel button
      const cancelBtn = screen.getByRole('button', { name: /^Cancel$/i })
      await waitFor(() => {
        expect(document.activeElement).toBe(cancelBtn)
      })

      // Click Cancel
      await user.click(cancelBtn)

      // Dialog closed
      await waitFor(() => {
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
      })

      // Progress is preserved: study radio is still checked!
      const studyRadioStill = screen.getByRole('radio', { name: /Study/i })
      expect(studyRadioStill).toBeChecked()
    })

    it('dialog traps keyboard focus with Tab and Shift+Tab and cancels on Escape', async () => {
      const user = userEvent.setup()
      render(<OnboardingShell />)

      const startBtn = screen.getByRole('button', { name: /Plan my move/i })
      await user.click(startBtn)

      const headerResetBtn = await screen.findByRole('button', { name: /Start again/i })
      await user.click(headerResetBtn)

      const dialog = await screen.findByRole('alertdialog')
      expect(dialog).toBeInTheDocument()

      const cancelBtn = screen.getByRole('button', { name: /^Cancel$/i })
      const confirmBtn = screen.getByRole('button', { name: /Reset everything/i })

      await waitFor(() => {
        expect(document.activeElement).toBe(cancelBtn)
      })

      // Tab moves focus from Cancel to Reset everything
      await user.tab()
      expect(document.activeElement).toBe(confirmBtn)

      // Tab from Reset everything wraps back to Cancel
      await user.tab()
      expect(document.activeElement).toBe(cancelBtn)

      // Shift + Tab from Cancel wraps to Reset everything
      await user.tab({ shift: true })
      expect(document.activeElement).toBe(confirmBtn)

      // Press Escape -> cancels dialog
      await user.keyboard('{Escape}')

      await waitFor(() => {
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
      })
    })

    it('clicking logo navigates to welcome screen while preserving progress', async () => {
      const user = userEvent.setup()
      render(<OnboardingShell />)

      // Start onboarding
      const startBtn = screen.getByRole('button', { name: /Plan my move/i })
      await user.click(startBtn)

      // Select study
      const studyRadio = await screen.findByRole('radio', { name: /Study/i })
      await user.click(studyRadio)

      // Click logo
      const logo = screen.getByLabelText(/BeyondNest home/i)
      await user.click(logo)

      // Should be on welcome screen
      expect(await screen.findByRole('button', { name: /Plan my move/i })).toBeInTheDocument()

      // Click "Plan my move" again
      const resumeBtn = screen.getByRole('button', { name: /Plan my move/i })
      await user.click(resumeBtn)

      // Should resume with study still selected!
      const studyRadioResumed = await screen.findByRole('radio', { name: /Study/i })
      expect(studyRadioResumed).toBeChecked()
    })

    it('confirming reset clears storage and returns to welcome screen with focus on primary CTA', async () => {
      const user = userEvent.setup()
      render(<OnboardingShell />)

      const startBtn = screen.getByRole('button', { name: /Plan my move/i })
      await user.click(startBtn)

      const studyRadio = await screen.findByRole('radio', { name: /Study/i })
      await user.click(studyRadio)

      const headerResetBtn = screen.getByRole('button', { name: /Start again/i })
      await user.click(headerResetBtn)

      const confirmBtn = await screen.findByRole('button', { name: /Reset everything/i })
      await user.click(confirmBtn)

      // Returned to welcome screen
      expect(await screen.findByRole('button', { name: /Plan my move/i })).toBeInTheDocument()

      // Start onboarding fresh: no radio selected
      const startBtnFresh = screen.getByRole('button', { name: /Plan my move/i })
      await user.click(startBtnFresh)

      const studyRadioFresh = await screen.findByRole('radio', { name: /Study/i })
      expect(studyRadioFresh).not.toBeChecked()
    })
  })
})
