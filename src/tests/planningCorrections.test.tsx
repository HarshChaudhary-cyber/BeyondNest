import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import type { OnboardingAnswers } from '../store/types'
import { generatePersonalisedPlan } from '../planning/engine'
import { loadPlanProgress, savePlanProgress, PLAN_STORAGE_KEY_V1 } from '../planning/storage'
import { 
  loadWorksheetState, 
  WORKSHEET_STORAGE_KEY_V1 
} from '../planning/worksheetStorage'
import { clearPersistedState, STORAGE_KEY_V2, STORAGE_KEY_V1 } from '../store/onboardingStore'
import { checkHasUnmetPrerequisites, selectNextThreeTasks } from '../planning/rules/priorities'
import { MovingPlanScreen } from '../components/plan/MovingPlanScreen'
import { ExpenseWorksheet } from '../components/plan/ExpenseWorksheet'
import { findCountryByCode } from '../data/countries'

const countryCA = findCountryByCode('CA')!
const countryDE = findCountryByCode('DE')!

describe('Task 3.1: Planning Content, Guidance & Persistence Corrections', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  // 1. Context Invalidation Followed by One-Click Completion
  describe('1. Context Invalidation Followed by One-Click Completion', () => {
    const initialAnswers: OnboardingAnswers = {
      relocation_purpose: 'study',
      destination_country: countryCA,
      destination_city: { cityName: 'Toronto' },
      journey_stage: 'accepted_offer',
      companions: 'solo'
    }

    it('allows a newly invalidated task to be completed in a single click', async () => {
      // 1. Initial plan generation and completion of housing task
      const { plan: plan1, updatedProgress: progress1 } = generatePersonalisedPlan(initialAnswers)
      const housingTask = plan1.allTasks.find(t => t.id === 'ca_stu_housing_search')!
      expect(housingTask).toBeDefined()

      // Save initial progress with housing completed
      const savedState = {
        ...progress1,
        tasks: {
          ...progress1.tasks,
          [housingTask.id]: {
            completed: true,
            completedAt: new Date().toISOString(),
            contextKey: housingTask.contextKey
          }
        }
      }
      savePlanProgress(savedState)

      // 2. City changes from Toronto to Vancouver in profile answers
      const updatedAnswers: OnboardingAnswers = {
        ...initialAnswers,
        destination_city: { cityName: 'Vancouver' }
      }

      // 3. Render MovingPlanScreen with updated answers
      render(
        <MovingPlanScreen
          answers={updatedAnswers}
          onEditProfile={() => {}}
          onReturnToReview={() => {}}
        />
      )

      // Housing card should be present and uncompleted (context changed)
      const housingCards = screen.getAllByRole('button', { name: /Mark .*Apply for campus residence.* as complete/i })
      expect(housingCards.length).toBeGreaterThan(0)

      // 4. Click ONCE to complete
      fireEvent.click(housingCards[0])

      // 5. Verify task is now completed in ONE click
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Reopen task .*Apply for campus residence.*/i })).toBeInTheDocument()
      })

      const reloadedProgress = loadPlanProgress()
      expect(reloadedProgress.tasks['ca_stu_housing_search'].completed).toBe(true)
      expect(reloadedProgress.tasks['ca_stu_housing_search'].contextKey).toContain('city:Vancouver')
    })
  })

  // 2. Persistence after Navigation and Refresh
  describe('2. Persistence After Navigation and Refresh', () => {
    const answers: OnboardingAnswers = {
      relocation_purpose: 'study',
      destination_country: countryDE,
      journey_stage: 'accepted_offer',
      companions: 'solo'
    }

    it('retains task completion through reload and component re-mounting', async () => {
      const { plan, updatedProgress } = generatePersonalisedPlan(answers)
      const admissionTask = plan.allTasks.find(t => t.id === 'de_stu_admission_acceptance')!

      // Complete admission task
      const updated = {
        ...updatedProgress,
        tasks: {
          ...updatedProgress.tasks,
          [admissionTask.id]: {
            completed: true,
            completedAt: new Date().toISOString(),
            contextKey: admissionTask.contextKey
          }
        }
      }
      savePlanProgress(updated)

      // Simulate refresh by loading freshly from localStorage
      const refreshedProgress = loadPlanProgress()
      expect(refreshedProgress.tasks['de_stu_admission_acceptance'].completed).toBe(true)

      // Render plan and verify completed section contains the task
      render(
        <MovingPlanScreen
          answers={answers}
          onEditProfile={() => {}}
          onReturnToReview={() => {}}
        />
      )

      expect(screen.getByText(/Completed Preparations \(1\)/i)).toBeInTheDocument()
    })
  })

  // 3. Returning to a Previous Destination (No Resurrection of Invalidated Completion)
  describe('3. Returning to a Previous Destination (No Resurrection)', () => {
    it('does not resurrect invalidated destination-specific tasks when returning to an earlier destination', () => {
      // 1. User starts with Germany (solo student)
      const deAnswers: OnboardingAnswers = {
        relocation_purpose: 'study',
        destination_country: countryDE,
        journey_stage: 'accepted_offer',
        companions: 'solo'
      }

      const { plan: dePlan, updatedProgress: deProgress } = generatePersonalisedPlan(deAnswers)
      const deHousingTask = dePlan.allTasks.find(t => t.id === 'de_stu_housing_search')!
      const soloCommunityTask = dePlan.allTasks.find(t => t.id === 'solo_community_building')!

      expect(deHousingTask).toBeDefined()
      expect(soloCommunityTask).toBeDefined()

      // Mark both German housing and solo community building complete
      const deSavedState = {
        ...deProgress,
        destinationCode: 'DE',
        tasks: {
          ...deProgress.tasks,
          [deHousingTask.id]: {
            completed: true,
            completedAt: new Date().toISOString(),
            contextKey: deHousingTask.contextKey
          },
          [soloCommunityTask.id]: {
            completed: true,
            completedAt: new Date().toISOString(),
            contextKey: soloCommunityTask.contextKey
          }
        }
      }
      savePlanProgress(deSavedState)

      // 2. User changes destination to Canada
      const caAnswers: OnboardingAnswers = {
        ...deAnswers,
        destination_country: countryCA
      }

      const { updatedProgress: caProgress } = generatePersonalisedPlan(caAnswers, deSavedState)
      // Save the reconciled state for Canada
      savePlanProgress(caProgress)

      // Verify German housing was invalidated, but solo community task retained completion
      expect(caProgress.tasks['de_stu_housing_search'].completed).toBe(false)
      expect(caProgress.tasks['solo_community_building'].completed).toBe(true)

      // 3. User returns to Germany!
      const { plan: dePlanReturn, updatedProgress: deReturnProgress } = generatePersonalisedPlan(deAnswers, caProgress)

      // The German housing task must NOT resurrect as completed!
      const returnHousingTask = dePlanReturn.allTasks.find(t => t.id === 'de_stu_housing_search')!
      expect(returnHousingTask.isCompleted).toBe(false)
      expect(deReturnProgress.tasks['de_stu_housing_search'].completed).toBe(false)

      // The general unchanged task must STILL be completed
      const returnSoloTask = dePlanReturn.allTasks.find(t => t.id === 'solo_community_building')!
      expect(returnSoloTask.isCompleted).toBe(true)
    })
  })

  // 4. Missing and Reopened Prerequisites
  describe('4. Missing and Reopened Prerequisites', () => {
    const answers: OnboardingAnswers = {
      relocation_purpose: 'study',
      destination_country: countryDE,
      journey_stage: 'accepted_offer',
      companions: 'solo'
    }

    it('blocks dependent tasks when a prerequisite is reopened', () => {
      const { plan } = generatePersonalisedPlan(answers)
      const admissionTask = plan.allTasks.find(t => t.id === 'de_stu_admission_acceptance')!
      const blockedAccountTask = plan.allTasks.find(t => t.id === 'de_stu_blocked_account')!

      // 1. With admission incomplete, blocked account has unmet prerequisites
      expect(checkHasUnmetPrerequisites(blockedAccountTask, plan.allTasks, answers)).toBe(true)

      // 2. Mark admission complete
      admissionTask.isCompleted = true
      expect(checkHasUnmetPrerequisites(blockedAccountTask, plan.allTasks, answers)).toBe(false)

      // 3. Reopen admission
      admissionTask.isCompleted = false
      expect(checkHasUnmetPrerequisites(blockedAccountTask, plan.allTasks, answers)).toBe(true)

      // Blocked account must not appear in next three actionable tasks when prerequisite is reopened
      const nextThree = selectNextThreeTasks(plan.allTasks, answers)
      expect(nextThree.some(t => t.id === 'de_stu_blocked_account')).toBe(false)
    })

    it('handles omitted earlier journey stages explicitly for already_abroad users without silently treating unknown missing prerequisites as satisfied', () => {
      const abroadAnswers: OnboardingAnswers = {
        relocation_purpose: 'study',
        destination_country: countryCA,
        journey_stage: 'already_abroad',
        companions: 'solo'
      }

      const { plan } = generatePersonalisedPlan(abroadAnswers)
      const sinTask = plan.allTasks.find(t => t.id === 'ca_stu_sin_number')!

      // Border entry task was omitted because user has already arrived abroad
      expect(plan.allTasks.some(t => t.id === 'ca_stu_border_entry')).toBe(false)

      // checkHasUnmetPrerequisites explicitly recognises the elapsed stage for already_abroad
      expect(checkHasUnmetPrerequisites(sinTask, plan.allTasks, abroadAnswers)).toBe(false)

      // But for an arbitrary unrecognised missing prerequisite task, it returns true (unmet)
      const fakeTask = {
        ...sinTask,
        prerequisiteTaskIds: ['non_existent_arbitrary_prereq_id']
      }
      expect(checkHasUnmetPrerequisites(fakeTask, plan.allTasks, abroadAnswers)).toBe(true)
    })
  })

  // 5. Blank Expense Worksheet Defaults, Saving, Restoration, and Failure Handling
  describe('5. Blank Expense Worksheet Defaults, Saving, Restoration, and Failure Handling', () => {
    it('starts with blank defaults (all amounts zero) and no invented numbers', () => {
      render(<ExpenseWorksheet initialCurrency="EUR" />)

      const rentInput = screen.getByLabelText(/Rent & Accommodation/i) as HTMLInputElement
      expect(rentInput.value).toBe('') // empty / 0, not 750

      const groceriesInput = screen.getByLabelText(/Groceries & Household/i) as HTMLInputElement
      expect(groceriesInput.value).toBe('')

      expect(screen.getByText(/EUR 0/)).toBeInTheDocument()
    })

    it('persists entered amounts, restores on reload, and reports save failures honestly', async () => {
      const { rerender } = render(<ExpenseWorksheet initialCurrency="EUR" onSaveEstimate={() => {}} />)

      const rentInput = screen.getByLabelText(/Rent & Accommodation/i)
      fireEvent.change(rentInput, { target: { value: '650' } })

      const saveBtn = screen.getByRole('button', { name: /Save this estimate/i })
      fireEvent.click(saveBtn)

      // Success feedback displayed
      await waitFor(() => {
        expect(screen.getByText(/Saved to worksheet/i)).toBeInTheDocument()
      })

      // Reload from storage
      const stored = loadWorksheetState()
      expect(stored.items['rent']).toBe(650)

      // Rerender component to simulate page reload
      rerender(<ExpenseWorksheet initialCurrency="EUR" onSaveEstimate={() => {}} />)
      const reloadedRent = screen.getByLabelText(/Rent & Accommodation/i) as HTMLInputElement
      expect(reloadedRent.value).toBe('650')

      // Simulate storage failure (e.g. QuotaExceededError or disabled)
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Storage quota exceeded')
      })

      fireEvent.change(reloadedRent, { target: { value: '700' } })
      fireEvent.click(screen.getByRole('button', { name: /Save this estimate/i }))

      // Must display honest failure alert and NOT claim success
      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/Storage unavailable — failed to save/i)
        expect(screen.queryByText(/Saved to worksheet/i)).not.toBeInTheDocument()
      })
    })

    it('changing currency updates denomination without performing artificial exchange-rate conversions', () => {
      render(<ExpenseWorksheet initialCurrency="EUR" />)

      const rentInput = screen.getByLabelText(/Rent & Accommodation/i)
      fireEvent.change(rentInput, { target: { value: '500' } })

      const currencySelect = screen.getByLabelText(/Currency:/i)
      fireEvent.change(currencySelect, { target: { value: 'CAD' } })

      // Amount entered should remain exactly 500, not scaled
      expect((rentInput as HTMLInputElement).value).toBe('500')
      expect(screen.getByText(/CAD 500/)).toBeInTheDocument()
    })
  })

  // 6. Reset Clearing Every BeyondNest Data Store
  describe('6. Reset Clearing Every BeyondNest Data Store', () => {
    it('clears onboarding v1, v2, moving-plan progress, and expense worksheet', () => {
      localStorage.setItem(STORAGE_KEY_V2, JSON.stringify({ answers: { test: true } }))
      localStorage.setItem(STORAGE_KEY_V1, JSON.stringify({ answers: { test: true } }))
      localStorage.setItem(PLAN_STORAGE_KEY_V1, JSON.stringify({ tasks: { test: true } }))
      localStorage.setItem(WORKSHEET_STORAGE_KEY_V1, JSON.stringify({ items: { rent: 500 } }))

      // Call clearPersistedState
      clearPersistedState()

      expect(localStorage.getItem(STORAGE_KEY_V2)).toBeNull()
      expect(localStorage.getItem(STORAGE_KEY_V1)).toBeNull()
      expect(localStorage.getItem(PLAN_STORAGE_KEY_V1)).toBeNull()
      expect(localStorage.getItem(WORKSHEET_STORAGE_KEY_V1)).toBeNull()
    })
  })

  // 7. Unsupported Storage Versions
  describe('7. Unsupported Storage Versions', () => {
    it('safely resets moving plan progress if schema version is unsupported', () => {
      localStorage.setItem(PLAN_STORAGE_KEY_V1, JSON.stringify({
        version: 999, // unsupported version
        tasks: { some_task: { completed: true, contextKey: 'xyz' } }
      }))

      const progress = loadPlanProgress()
      expect(progress.version).toBe(1)
      expect(Object.keys(progress.tasks).length).toBe(0)
    })

    it('safely resets expense worksheet if schema version is unsupported', () => {
      localStorage.setItem(WORKSHEET_STORAGE_KEY_V1, JSON.stringify({
        version: 999, // unsupported version
        items: { rent: 5000 }
      }))

      const state = loadWorksheetState()
      expect(state.version).toBe(1)
      expect(state.items['rent']).toBe(0)
    })
  })

  // 8. Content Audit: Conditional Guidance, No SDS, and PAL/TAL Exemption Instructions
  describe('8. Content Audit: Conditional Guidance, No SDS, and PAL/TAL Exemption Instructions', () => {
    it('removes Student Direct Stream advice and outdated hardcoded living cost figures from Canada pack', () => {
      const answers: OnboardingAnswers = {
        relocation_purpose: 'study',
        destination_country: countryCA,
        journey_stage: 'accepted_offer'
      }

      const { plan } = generatePersonalisedPlan(answers)
      const allActions = plan.allTasks.map(t => t.action).join(' ')
      const allWhys = plan.allTasks.map(t => t.whyItAppears).join(' ')

      // No SDS references
      expect(allActions).not.toContain('Student Direct Stream')
      expect(allWhys).not.toContain('Student Direct Stream')

      // No hardcoded $20,635 figure
      expect(allActions).not.toContain('20,635')
      expect(allWhys).not.toContain('20,635')

      // Financial proof links official IRCC tables
      const financialTask = plan.allTasks.find(t => t.id === 'ca_stu_financial_proof')!
      expect(financialTask.action).toContain('IRCC\'s official financial requirements table')
      expect(financialTask.resources.some(r => r.id === 'ca_ircc_financial_support')).toBe(true)
    })

    it('frames PAL/TAL instructions as checking requirements with exemption guidance', () => {
      const answers: OnboardingAnswers = {
        relocation_purpose: 'study',
        destination_country: countryCA,
        journey_stage: 'accepted_offer'
      }

      const { plan } = generatePersonalisedPlan(answers)
      const dliTask = plan.allTasks.find(t => t.id === 'ca_stu_dli_acceptance')!

      expect(dliTask.title).toContain('check whether you need a Provincial Attestation Letter (PAL)')
      expect(dliTask.action).toContain('qualifies for an exemption')
      expect(dliTask.whyItAppears).toContain('specific exemptions defined by federal regulations')
    })

    it('frames German student visa, blocked account, and residence permit tasks as applicability checks', () => {
      const answers: OnboardingAnswers = {
        relocation_purpose: 'study',
        destination_country: countryDE,
        journey_stage: 'accepted_offer'
      }

      const { plan } = generatePersonalisedPlan(answers)

      // Blocked account task mentions alternatives and EU/EEA exemption
      const blockedTask = plan.allTasks.find(t => t.id === 'de_stu_blocked_account')!
      expect(blockedTask.title).toContain('Check financial proof requirements for your citizenship')
      expect(blockedTask.action).toContain('EU/EEA citizens do not need a blocked account')

      // Visa task explains citizenship distinctions
      const visaTask = plan.allTasks.find(t => t.id === 'de_stu_visa_application')!
      expect(visaTask.title).toContain('Determine visa requirements for your citizenship')
      expect(visaTask.action).toContain('EU/EEA/Swiss citizens do not need a visa')

      // Residence permit clarifies EU/EEA freedom of movement
      const residenceTask = plan.allTasks.find(t => t.id === 'de_stu_residence_permit')!
      expect(residenceTask.action).toContain('EU/EEA/Swiss citizens have freedom of movement')
    })

    it('excludes border entry preparation for users who are already abroad', () => {
      const abroadAnswers: OnboardingAnswers = {
        relocation_purpose: 'study',
        destination_country: countryCA,
        journey_stage: 'already_abroad'
      }

      const { plan } = generatePersonalisedPlan(abroadAnswers)
      expect(plan.allTasks.some(t => t.id === 'ca_stu_border_entry')).toBe(false)
      expect(plan.allTasks.some(t => t.id === 'ca_stu_sin_number')).toBe(true)
    })
  })
})
