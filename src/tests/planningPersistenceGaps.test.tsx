import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import type { OnboardingAnswers } from '../store/types'
import { generatePersonalisedPlan } from '../planning/engine'
import { loadPlanProgress, savePlanProgress } from '../planning/storage'
import { MovingPlanScreen } from '../components/plan/MovingPlanScreen'
import { findCountryByCode } from '../data/countries'

const countryDE = findCountryByCode('DE')!
const countryCA = findCountryByCode('CA')!

describe('Task 3.2: Close Remaining Plan-Persistence Gaps', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  // 1. Destination Transitions & Preventing Completion Resurrection
  describe('1. Destination Transitions & Preventing Completion Resurrection', () => {
    const deAnswers: OnboardingAnswers = {
      relocation_purpose: 'study',
      destination_country: countryDE,
      destination_city: { cityName: 'Berlin' },
      journey_stage: 'accepted_offer',
      companions: 'solo'
    }

    const undecidedAnswers: OnboardingAnswers = {
      relocation_purpose: 'study',
      destination: { explore: true },
      destination_country: { explore: true },
      journey_stage: 'exploring',
      companions: 'solo'
    }

    const caAnswers: OnboardingAnswers = {
      relocation_purpose: 'study',
      destination_country: countryCA,
      destination_city: { cityName: 'Toronto' },
      journey_stage: 'accepted_offer',
      companions: 'solo'
    }

    it('prevents completion resurrection on: Germany → undecided → Canada → Germany', async () => {
      // Step 1: Initial Germany plan and complete housing search
      const { plan: dePlan1, updatedProgress: deProgress1 } = generatePersonalisedPlan(deAnswers)
      const housingTask = dePlan1.allTasks.find(t => t.id === 'de_stu_housing_search')!
      expect(housingTask).toBeDefined()

      const deStateWithHousing = {
        ...deProgress1,
        tasks: {
          ...deProgress1.tasks,
          [housingTask.id]: {
            completed: true,
            completedAt: new Date().toISOString(),
            contextKey: housingTask.contextKey
          }
        }
      }
      savePlanProgress(deStateWithHousing)

      // Step 2: Transition to Undecided ({ explore: true })
      const storedAfterDE = loadPlanProgress()
      const { plan: undecidedPlan, updatedProgress: undecidedProgress } = generatePersonalisedPlan(
        undecidedAnswers,
        storedAfterDE
      )
      savePlanProgress(undecidedProgress)

      expect(undecidedPlan.isUndecided).toBe(true)
      // Destination-dependent DE tasks must be invalidated
      expect(undecidedProgress.tasks['de_stu_housing_search'].completed).toBe(false)

      // Step 3: Transition to Canada
      const storedAfterUndecided = loadPlanProgress()
      const { plan: caPlan, updatedProgress: caProgress } = generatePersonalisedPlan(
        caAnswers,
        storedAfterUndecided
      )

      // Inactive historical DE records must remain invalidated
      expect(caProgress.tasks['de_stu_housing_search'].completed).toBe(false)

      // Complete a Canada task (e.g. SIN)
      const sinTask = caPlan.allTasks.find(t => t.id === 'ca_stu_sin_number')!
      const caStateWithSin = {
        ...caProgress,
        tasks: {
          ...caProgress.tasks,
          [sinTask.id]: {
            completed: true,
            completedAt: new Date().toISOString(),
            contextKey: sinTask.contextKey
          }
        }
      }
      savePlanProgress(caStateWithSin)

      // Step 4: Return to Germany
      const storedAfterCA = loadPlanProgress()
      const { plan: dePlanReturned, updatedProgress: deProgressReturned } = generatePersonalisedPlan(
        deAnswers,
        storedAfterCA
      )
      savePlanProgress(deProgressReturned)

      // Crucial: The Germany housing task MUST NOT resurrect as completed!
      const returnedHousing = dePlanReturned.allTasks.find(t => t.id === 'de_stu_housing_search')!
      expect(returnedHousing.isCompleted).toBe(false)
      expect(deProgressReturned.tasks['de_stu_housing_search'].completed).toBe(false)

      // Canada task left its context and must also be invalidated
      expect(deProgressReturned.tasks['ca_stu_sin_number'].completed).toBe(false)

      // Step 5: Render MovingPlanScreen and verify 1-click completion works
      render(
        <MovingPlanScreen
          answers={deAnswers}
          onEditProfile={() => {}}
          onReturnToReview={() => {}}
        />
      )

      const doneButtons = screen.getAllByRole('button', { name: /Mark .*halls of residence.* as complete/i })
      expect(doneButtons.length).toBeGreaterThan(0)
      fireEvent.click(doneButtons[0])

      // Reconciled in exactly one click
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Reopen task .*halls of residence.*/i })).toBeInTheDocument()
      })
      const reloaded = loadPlanProgress()
      expect(reloaded.tasks['de_stu_housing_search'].completed).toBe(true)
    })

    it('prevents completion resurrection on: Germany → undecided → Germany', () => {
      // Step 1: Complete housing search in Germany
      const { plan: dePlan, updatedProgress } = generatePersonalisedPlan(deAnswers)
      const housingTask = dePlan.allTasks.find(t => t.id === 'de_stu_housing_search')!

      savePlanProgress({
        ...updatedProgress,
        tasks: {
          ...updatedProgress.tasks,
          [housingTask.id]: {
            completed: true,
            completedAt: new Date().toISOString(),
            contextKey: housingTask.contextKey
          }
        }
      })

      // Step 2: Switch to Undecided
      const { updatedProgress: undecidedProgress } = generatePersonalisedPlan(
        undecidedAnswers,
        loadPlanProgress()
      )
      savePlanProgress(undecidedProgress)
      expect(undecidedProgress.tasks['de_stu_housing_search'].completed).toBe(false)

      // Step 3: Switch back to Germany
      const { plan: returnedPlan, updatedProgress: returnedProgress } = generatePersonalisedPlan(
        deAnswers,
        loadPlanProgress()
      )

      const returnedHousing = returnedPlan.allTasks.find(t => t.id === 'de_stu_housing_search')!
      expect(returnedHousing.isCompleted).toBe(false)
      expect(returnedProgress.tasks['de_stu_housing_search'].completed).toBe(false)
    })

    it('prevents completion resurrection on direct destination switch: Germany → Canada → Germany', () => {
      // Step 1: Germany housing completed
      const { plan: dePlan, updatedProgress } = generatePersonalisedPlan(deAnswers)
      const housingTask = dePlan.allTasks.find(t => t.id === 'de_stu_housing_search')!

      savePlanProgress({
        ...updatedProgress,
        tasks: {
          ...updatedProgress.tasks,
          [housingTask.id]: {
            completed: true,
            completedAt: new Date().toISOString(),
            contextKey: housingTask.contextKey
          }
        }
      })

      // Step 2: Direct switch to Canada
      const { updatedProgress: caProgress } = generatePersonalisedPlan(caAnswers, loadPlanProgress())
      savePlanProgress(caProgress)
      expect(caProgress.tasks['de_stu_housing_search'].completed).toBe(false)

      // Step 3: Direct switch back to Germany
      const { plan: returnedPlan, updatedProgress: returnedProgress } = generatePersonalisedPlan(
        deAnswers,
        loadPlanProgress()
      )

      const returnedHousing = returnedPlan.allTasks.find(t => t.id === 'de_stu_housing_search')!
      expect(returnedHousing.isCompleted).toBe(false)
      expect(returnedProgress.tasks['de_stu_housing_search'].completed).toBe(false)
    })

    it('preserves valid task completion across browser refresh without resurrection', () => {
      // 1. Initial Germany plan with housing completed
      const { plan: dePlan, updatedProgress } = generatePersonalisedPlan(deAnswers)
      const housingTask = dePlan.allTasks.find(t => t.id === 'de_stu_housing_search')!

      const savedState = {
        ...updatedProgress,
        tasks: {
          ...updatedProgress.tasks,
          [housingTask.id]: {
            completed: true,
            completedAt: new Date().toISOString(),
            contextKey: housingTask.contextKey
          }
        }
      }
      savePlanProgress(savedState)

      // 2. Refresh while still in Germany -> remains completed
      const refreshInDE = loadPlanProgress()
      const { plan: refreshedDE } = generatePersonalisedPlan(deAnswers, refreshInDE)
      expect(refreshedDE.allTasks.find(t => t.id === 'de_stu_housing_search')!.isCompleted).toBe(true)

      // 3. User updates destination to undecided, refreshes
      const { updatedProgress: undecidedProgress } = generatePersonalisedPlan(undecidedAnswers, refreshInDE)
      savePlanProgress(undecidedProgress)

      const refreshInUndecided = loadPlanProgress()
      expect(refreshInUndecided.tasks['de_stu_housing_search'].completed).toBe(false)

      // 4. User returns to Germany after refresh
      const { plan: returnedAfterRefresh } = generatePersonalisedPlan(deAnswers, refreshInUndecided)
      expect(returnedAfterRefresh.allTasks.find(t => t.id === 'de_stu_housing_search')!.isCompleted).toBe(false)
    })
  })

  // 2. Preservation of Independent General-Task Progress
  describe('2. Preservation of Independent General-Task Progress', () => {
    it('preserves genuinely unchanged general tasks across destination and explore changes', () => {
      // Non-pack country (e.g. France) uses general tasks
      const countryFR = findCountryByCode('FR')!
      const frAnswers: OnboardingAnswers = {
        relocation_purpose: 'work',
        destination_country: countryFR,
        journey_stage: 'exploring',
        companions: 'solo'
      }

      const { plan: frPlan, updatedProgress: frProgress } = generatePersonalisedPlan(frAnswers)
      const vitalDocsTask = frPlan.allTasks.find(t => t.id === 'gen_vital_documents')!
      expect(vitalDocsTask).toBeDefined()

      // Mark general task completed
      savePlanProgress({
        ...frProgress,
        tasks: {
          ...frProgress.tasks,
          [vitalDocsTask.id]: {
            completed: true,
            completedAt: new Date().toISOString(),
            contextKey: vitalDocsTask.contextKey
          }
        }
      })

      // Switch destination to Italy (another general country) with same purpose/stage
      const countryIT = findCountryByCode('IT')!
      const itAnswers: OnboardingAnswers = {
        ...frAnswers,
        destination_country: countryIT
      }

      const { plan: itPlan, updatedProgress: itProgress } = generatePersonalisedPlan(
        itAnswers,
        loadPlanProgress()
      )

      // General vital documents task does NOT depend on destination country code, so it remains completed!
      const itVitalTask = itPlan.allTasks.find(t => t.id === 'gen_vital_documents')!
      expect(itVitalTask.isCompleted).toBe(true)
      expect(itProgress.tasks['gen_vital_documents'].completed).toBe(true)
    })
  })

  // 3. Honest Storage Status Reporting and Failure Handling
  describe('3. Honest Storage Status Reporting & Save Failure Handling', () => {
    const answers: OnboardingAnswers = {
      relocation_purpose: 'study',
      destination_country: countryDE,
      journey_stage: 'accepted_offer',
      companions: 'solo'
    }

    it('reports initial reconciliation save failure honestly and shows in-memory warning', async () => {
      // Simulate storage failure during initial render / mount
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceededError: Local storage full')
      })

      render(
        <MovingPlanScreen
          answers={answers}
          onEditProfile={() => {}}
          onReturnToReview={() => {}}
        />
      )

      // Storage badge must indicate in-memory only, not saved
      await waitFor(() => {
        expect(screen.getByRole('status')).toHaveTextContent(/In-memory only \(storage unavailable\)/i)
      })

      // Clear warning alert must be presented
      expect(screen.getByRole('alert')).toHaveTextContent(/Storage Unavailable: Plan changes could not be saved/i)

      // Usable plan progress is preserved in memory
      expect(screen.getByText('Your Personalised Moving Plan')).toBeInTheDocument()
      expect(screen.getByText(/Overall Preparation Progress/i)).toBeInTheDocument()
    })

    it('reports profile-change save failure honestly and preserves in-memory progress', async () => {
      // Start with working storage
      const { rerender } = render(
        <MovingPlanScreen
          answers={answers}
          onEditProfile={() => {}}
          onReturnToReview={() => {}}
        />
      )

      await waitFor(() => {
        expect(screen.getByRole('status')).toHaveTextContent(/Saved to browser storage/i)
      })

      // Now storage fails on profile change
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Storage write failed')
      })

      // Answers change (profile update)
      const updatedAnswers: OnboardingAnswers = {
        ...answers,
        destination_city: { cityName: 'Munich' }
      }

      rerender(
        <MovingPlanScreen
          answers={updatedAnswers}
          onEditProfile={() => {}}
          onReturnToReview={() => {}}
        />
      )

      // Storage badge must update to error warning
      await waitFor(() => {
        expect(screen.getByRole('status')).toHaveTextContent(/In-memory only \(storage unavailable\)/i)
      })
      expect(screen.getByRole('alert')).toHaveTextContent(/Storage Unavailable/i)
    })

    it('recovers from storage failure when a subsequent save succeeds', async () => {
      // Initially failing storage
      const mockSetItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Transient storage failure')
      })

      render(
        <MovingPlanScreen
          answers={answers}
          onEditProfile={() => {}}
          onReturnToReview={() => {}}
        />
      )

      await waitFor(() => {
        expect(screen.getByRole('status')).toHaveTextContent(/In-memory only \(storage unavailable\)/i)
      })
      expect(screen.getByRole('alert')).toBeInTheDocument()

      // Restore storage to working state
      mockSetItem.mockRestore()

      // User performs a task toggle
      const doneButtons = screen.getAllByRole('button', { name: /Mark .* as complete/i })
      fireEvent.click(doneButtons[0])

      // Successful write clears warning and updates badge to saved
      await waitFor(() => {
        expect(screen.getByRole('status')).toHaveTextContent(/Saved to browser storage/i)
      })
      expect(screen.queryByRole('alert', { name: /Storage Unavailable/i })).not.toBeInTheDocument()
    })
  })

  // 4. StrictMode and Remount Behaviour
  describe('4. StrictMode and Component Remounts', () => {
    const answers: OnboardingAnswers = {
      relocation_purpose: 'study',
      destination_country: countryDE,
      journey_stage: 'accepted_offer',
      companions: 'solo'
    }

    it('mounts cleanly under React.StrictMode without infinite loops or duplicate notices', async () => {
      const { unmount } = render(
        <React.StrictMode>
          <MovingPlanScreen
            answers={answers}
            onEditProfile={() => {}}
            onReturnToReview={() => {}}
          />
        </React.StrictMode>
      )

      await waitFor(() => {
        expect(screen.getByRole('status')).toHaveTextContent(/Saved to browser storage/i)
      })

      // Toggle a task under StrictMode
      const doneButtons = screen.getAllByRole('button', { name: /Mark .* as complete/i })
      fireEvent.click(doneButtons[0])

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Reopen task .*/i })).toBeInTheDocument()
      })

      // Unmount and remount (simulating React remounting / navigation)
      unmount()

      render(
        <React.StrictMode>
          <MovingPlanScreen
            answers={answers}
            onEditProfile={() => {}}
            onReturnToReview={() => {}}
          />
        </React.StrictMode>
      )

      // Verified: task remains completed without duplicate notices
      expect(screen.getByRole('button', { name: /Reopen task .*/i })).toBeInTheDocument()
    })
  })
})
