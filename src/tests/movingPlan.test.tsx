import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { generatePersonalisedPlan } from '../planning/engine'
import { findMatchingDestinationPack } from '../planning/packs'
import { OFFICIAL_RESOURCES } from '../planning/resources'
import { loadPlanProgress, savePlanProgress, STORAGE_KEY_PLAN_V1 } from '../planning/storage'
import { OnboardingShell } from '../components/onboarding/OnboardingShell'
import { STORAGE_KEY_V2 } from '../store/onboardingStore'
import type { OnboardingAnswers } from '../store/types'

describe('BeyondNest Task 3: Source-Backed Personalised Moving Plans', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  // 1. Germany Student Plan
  describe('1. International Student Planning for Germany', () => {
    const answers: OnboardingAnswers = {
      relocation_purpose: 'study',
      journey_stage: 'accepted_offer',
      destination_country: { code: 'DE', name: 'Germany', lat: 51.1657, lon: 10.4515, region: 'Europe' },
      destination_city: { cityName: 'Munich' },
      study_level: 'masters',
      university_name: { name: 'Technical University of Munich' },
      preparation_status: ['admission_enrolment'],
      first_priority: ['paperwork', 'housing']
    }

    it('matches curated Germany student pack and includes statutory requirements', () => {
      const pack = findMatchingDestinationPack(answers)
      expect(pack).toBeDefined()
      expect(pack?.id).toBe('pack_germany_students')
      expect(pack?.destinationCountry).toBe('DE')

      const { plan } = generatePersonalisedPlan(answers)
      expect(plan.hasDestinationPack).toBe(true)
      expect(plan.destinationTitle).toBe('Germany')

      // Check key Germany-specific tasks
      const taskIds = plan.allTasks.map(t => t.id)
      expect(taskIds).toContain('de_stu_admission_acceptance')
      expect(taskIds).toContain('de_stu_blocked_account')
      expect(taskIds).toContain('de_stu_health_insurance')
      expect(taskIds).toContain('de_stu_visa_application')
      expect(taskIds).toContain('de_stu_housing_search')
      expect(taskIds).toContain('de_stu_anmeldung_city_reg')
      expect(taskIds).toContain('de_stu_bank_account')
      expect(taskIds).toContain('de_stu_residence_permit')

      // Verify personalized wording
      const admissionTask = plan.allTasks.find(t => t.id === 'de_stu_admission_acceptance')
      expect(admissionTask?.title).toContain('Technical University of Munich')

      const housingTask = plan.allTasks.find(t => t.id === 'de_stu_housing_search')
      expect(housingTask?.action).toContain('Munich')
    })

    it('links verified official German resources with review dates and limitations', () => {
      const { plan } = generatePersonalisedPlan(answers)
      const resourceIds = plan.allTasks.flatMap(t => t.resources.map(r => r.id))
      
      expect(resourceIds).toContain('de_make_it_in_germany_study_visa')
      expect(resourceIds).toContain('de_daad_admission')
      expect(resourceIds).toContain('de_dsw_student_housing')
      expect(resourceIds).toContain('de_auswaertiges_amt_visa')

      const mig = OFFICIAL_RESOURCES.de_make_it_in_germany_study_visa
      expect(mig.publisher).toContain('BMWK')
      expect(mig.reviewedOn).toBe('October 2026')
      expect(mig.url).toContain('make-it-in-germany.com')
      expect(mig.scopeAndLimitations).toBeTruthy()
    })
  })

  // 2. Canada Student Plan
  describe('2. International Student Planning for Canada', () => {
    const answers: OnboardingAnswers = {
      relocation_purpose: 'study',
      journey_stage: 'preparing_apps',
      destination_country: { code: 'CA', name: 'Canada', lat: 56.1304, lon: -106.3468, region: 'Americas' },
      destination_city: { cityName: 'Toronto' },
      study_level: 'bachelors',
      university_name: { name: 'University of Toronto' },
      preparation_status: [],
      first_priority: ['paperwork', 'budget']
    }

    it('matches curated Canada student pack and includes statutory study permit tasks', () => {
      const pack = findMatchingDestinationPack(answers)
      expect(pack).toBeDefined()
      expect(pack?.id).toBe('pack_canada_students')
      expect(pack?.destinationCountry).toBe('CA')

      const { plan } = generatePersonalisedPlan(answers)
      expect(plan.hasDestinationPack).toBe(true)
      expect(plan.destinationTitle).toBe('Canada')

      const taskIds = plan.allTasks.map(t => t.id)
      expect(taskIds).toContain('ca_stu_dli_acceptance')
      expect(taskIds).toContain('ca_stu_financial_proof')
      expect(taskIds).toContain('ca_stu_study_permit_application')
      expect(taskIds).toContain('ca_stu_health_insurance')
      expect(taskIds).toContain('ca_stu_housing_search')
      expect(taskIds).toContain('ca_stu_border_entry')
      expect(taskIds).toContain('ca_stu_sin_number')
      expect(taskIds).toContain('ca_stu_canadian_bank')

      // Verify Provincial Attestation Letter (PAL) requirement mentioned
      const dliTask = plan.allTasks.find(t => t.id === 'ca_stu_dli_acceptance')
      expect(dliTask?.title).toContain('Provincial Attestation Letter (PAL)')
    })

    it('links official Canadian IRCC and EduCanada resources', () => {
      const ircc = OFFICIAL_RESOURCES.ca_ircc_study_permit
      expect(ircc.publisher).toBe('Immigration, Refugees and Citizenship Canada (IRCC)')
      expect(ircc.reviewedOn).toBe('October 2026')
      expect(ircc.url).toContain('canada.ca')
    })
  })

  // 3. Unsupported Destination Fallback
  describe('3. Unsupported Destination Fallback', () => {
    const answers: OnboardingAnswers = {
      relocation_purpose: 'work',
      journey_stage: 'preparing_apps',
      destination_country: { code: 'FR', name: 'France', lat: 46.2276, lon: 2.2137, region: 'Europe' },
      destination_city: { cityName: 'Paris' },
      work_status: 'interviewing',
      preparation_status: [],
      first_priority: ['paperwork']
    }

    it('generates useful general preparation tasks and clearly indicates lack of destination pack', () => {
      const pack = findMatchingDestinationPack(answers)
      expect(pack).toBeUndefined()

      const { plan } = generatePersonalisedPlan(answers)
      expect(plan.hasDestinationPack).toBe(false)
      expect(plan.destinationTitle).toBe('France')
      expect(plan.destinationPackNotice).toContain('A curated destination pack is not yet available for France')

      // Verifies general preparation tasks are generated
      const taskIds = plan.allTasks.map(t => t.id)
      expect(taskIds).toContain('gen_visa_consulate_research')
      expect(taskIds).toContain('gen_vital_documents')
      expect(taskIds).toContain('gen_housing_preparation')
      expect(taskIds).toContain('gen_travel_health_insurance')
      expect(taskIds).toContain('gen_financial_banking_setup')

      // Verifies it does not silently inject Germany or Canada pack tasks
      expect(taskIds).not.toContain('de_stu_blocked_account')
      expect(taskIds).not.toContain('ca_stu_study_permit_application')
    })
  })

  // 4. Undecided Destinations Research
  describe('4. Undecided Destination Research', () => {
    const answers: OnboardingAnswers = {
      relocation_purpose: 'explore',
      journey_stage: 'exploring',
      destination_country: { explore: true },
      destination_priorities: ['study_opportunities', 'living_costs'],
      preparation_status: ['nothing_yet'],
      first_priority: ['whole_process']
    }

    it('generates research tasks reflecting user stated priorities without invented rankings', () => {
      const { plan } = generatePersonalisedPlan(answers)
      expect(plan.hasDestinationPack).toBe(false)
      expect(plan.destinationTitle).toBe('Exploring destinations')

      const taskIds = plan.allTasks.map(t => t.id)
      expect(taskIds).toContain('res_compare_destinations_priorities')
      expect(taskIds).toContain('res_budget_benchmark')
      expect(taskIds).toContain('res_passport_entry_check')
      expect(taskIds).toContain('res_housing_rental_customs')

      const priorityTask = plan.allTasks.find(t => t.id === 'res_compare_destinations_priorities')
      expect(priorityTask?.action).toContain('Quality education & study opportunities')
      expect(priorityTask?.action).toContain('Affordable living expenses & housing')

      // Must not fabricate a visa eligibility or suitability percentage
      expect(priorityTask?.action).not.toContain('%')
    })
  })

  // 5. Already-Abroad Priorities
  describe('5. Already Abroad Priorities', () => {
    const answers: OnboardingAnswers = {
      relocation_purpose: 'study',
      journey_stage: 'already_abroad',
      destination_country: { code: 'DE', name: 'Germany', lat: 51.1657, lon: 10.4515, region: 'Europe' },
      destination_city: { cityName: 'Berlin' },
      origin_country_abroad: { code: 'IN', name: 'India', lat: 20.5937, lon: 78.9629, region: 'Asia' },
      preparation_status: ['admission_enrolment'],
      first_priority: ['housing', 'language_daily_life']
    }

    it('prioritises settling-in tasks and does not treat pre-departure actions as urgent', () => {
      const { plan } = generatePersonalisedPlan(answers)
      const nextThreeTasks = plan.nextThreeTasks
      
      // Settling-in tasks should be present
      const taskIds = plan.allTasks.map(t => t.id)
      expect(taskIds).toContain('abroad_settling_priorities')

      // Next three tasks should prioritize settling in or current local needs
      const nextPhases = nextThreeTasks.map(t => t.phase)
      expect(nextPhases.some(p => p === 'arrival_settling' || p === 'start_here')).toBe(true)

      // Suggested timing for pre-departure should reflect already being abroad
      const preDepartureTasks = plan.allTasks.filter(t => t.phase === 'before_departure')
      for (const t of preDepartureTasks) {
        expect(t.suggestedTiming).not.toContain('Urgent')
      }
    })
  })

  // 6. Backpacking Route Order
  describe('6. Backpacking Route Order and Relevant Tasks', () => {
    const answers: OnboardingAnswers = {
      relocation_purpose: 'explore',
      journey_stage: 'exploring',
      travel_style: 'backpacking',
      backpacking_destinations: {
        destinations: [
          { code: 'JP', name: 'Japan', lat: 36.2048, lon: 138.2529, region: 'Asia' },
          { code: 'VN', name: 'Vietnam', lat: 14.0583, lon: 108.2772, region: 'Asia' },
          { code: 'TH', name: 'Thailand', lat: 15.87, lon: 100.9925, region: 'Asia' }
        ]
      },
      preparation_status: [],
      first_priority: ['paperwork', 'budget']
    }

    it('preserves user route sequence and includes gear and entry checks for each stop', () => {
      const { plan } = generatePersonalisedPlan(answers)
      const taskIds = plan.allTasks.map(t => t.id)
      
      expect(taskIds).toContain('bpk_itinerary_route_check')
      expect(taskIds).toContain('bpk_gear_health_prep')

      const routeTask = plan.allTasks.find(t => t.id === 'bpk_itinerary_route_check')
      expect(routeTask?.action).toContain('1. Japan → 2. Vietnam → 3. Thailand')
    })
  })

  // 7. Skipped Citizenship
  describe('7. Skipped Citizenship Notice', () => {
    const answers: OnboardingAnswers = {
      relocation_purpose: 'work',
      journey_stage: 'exploring',
      citizenship: { codes: [], skipped: true },
      destination_country: { code: 'DE', name: 'Germany', lat: 51.1657, lon: 10.4515, region: 'Europe' },
      preparation_status: []
    }

    it('generates task explaining that entry guidance requires citizenship verification', () => {
      const { plan } = generatePersonalisedPlan(answers)
      const taskIds = plan.allTasks.map(t => t.id)
      
      expect(taskIds).toContain('cit_skipped_notice')
      const citTask = plan.allTasks.find(t => t.id === 'cit_skipped_notice')
      expect(citTask?.whyItAppears).toContain('skipped citizenship')
      expect(citTask?.title).toContain('Confirm visa requirements')
    })
  })

  // 8. Task Prerequisites and Priority Ordering
  describe('8. Task Prerequisites and Priority Ordering', () => {
    const answers: OnboardingAnswers = {
      relocation_purpose: 'study',
      journey_stage: 'preparing_apps',
      destination_country: { code: 'DE', name: 'Germany', lat: 51.1657, lon: 10.4515, region: 'Europe' },
      destination_city: { cityName: 'Berlin' },
      study_level: 'masters',
      preparation_status: [],
      first_priority: ['paperwork']
    }

    it('never ranks a dependent task ahead of an unmet prerequisite', () => {
      const { plan } = generatePersonalisedPlan(answers)
      const nextThreeTasks = plan.nextThreeTasks

      // In Germany pack, de_stu_visa_application requires admission, blocked account, and health insurance
      const visaTask = plan.allTasks.find(t => t.id === 'de_stu_visa_application')
      expect(visaTask?.prerequisiteTaskIds).toContain('de_stu_admission_acceptance')
      expect(visaTask?.prerequisiteTaskIds).toContain('de_stu_blocked_account')

      // With neither admission nor blocked account completed, visa appointment must NOT be in next 3
      const nextIds = nextThreeTasks.map(t => t.id)
      expect(nextIds).not.toContain('de_stu_visa_application')

      // Admission and blocked account should be present in early actionable tasks
      expect(nextIds).toContain('de_stu_admission_acceptance')
    })
  })

  // 9. Ambiguous Visa-Preparation Status
  describe('9. Ambiguous Visa-Preparation Status', () => {
    const answers: OnboardingAnswers = {
      relocation_purpose: 'study',
      journey_stage: 'preparing_leave',
      destination_country: { code: 'DE', name: 'Germany', lat: 51.1657, lon: 10.4515, region: 'Europe' },
      destination_city: { cityName: 'Frankfurt' },
      preparation_status: ['visa_permission'], // User ticked this checkbox
      first_priority: ['housing']
    }

    it('does not assume visa approval and keeps verification task', () => {
      const { plan } = generatePersonalisedPlan(answers)
      const taskIds = plan.allTasks.map(t => t.id)
      
      expect(taskIds).toContain('visa_status_verification')
      const visaCheck = plan.allTasks.find(t => t.id === 'visa_status_verification')
      expect(visaCheck?.title).toContain('Check your permission status')
      expect(visaCheck?.action).toContain('application tracking status')
    })
  })

  // 10. Completion Persistence and Reopening
  describe('10. Completion Persistence and Reopening', () => {
    it('persists task completion and allows reopening', () => {
      const initial = loadPlanProgress()
      expect(Object.keys(initial.tasks).length).toBe(0)

      savePlanProgress({
        version: 1,
        updatedAt: new Date().toISOString(),
        tasks: {
          'de_stu_admission_acceptance': {
            completed: true,
            completedAt: new Date().toISOString(),
            contextKey: 'dest:DE|purp:study|adm'
          }
        }
      })

      const reloaded = loadPlanProgress()
      expect(reloaded.tasks['de_stu_admission_acceptance']?.completed).toBe(true)

      // Reopen task
      savePlanProgress({
        ...reloaded,
        tasks: {
          ...reloaded.tasks,
          'de_stu_admission_acceptance': {
            completed: false,
            contextKey: 'dest:DE|purp:study|adm'
          }
        }
      })

      const reloaded2 = loadPlanProgress()
      expect(reloaded2.tasks['de_stu_admission_acceptance']?.completed).toBe(false)
    })
  })

  // 11. Destination Change Context Invalidation
  describe('11. Destination Changes Invalidate Context-Dependent Completion', () => {
    it('invalidates German housing task completion when destination changes to Canada', () => {
      // 1. Initial Germany answers with completed housing task
      const germanyAnswers: OnboardingAnswers = {
        relocation_purpose: 'study',
        journey_stage: 'accepted_offer',
        destination_country: { code: 'DE', name: 'Germany', lat: 51.1657, lon: 10.4515, region: 'Europe' },
        destination_city: { cityName: 'Munich' },
        study_level: 'masters',
        preparation_status: ['admission_enrolment']
      }

      const storedProgress = {
        version: 1,
        updatedAt: new Date().toISOString(),
        tasks: {
          // Housing task completed in Germany context
          'de_stu_housing_search': {
            completed: true,
            completedAt: new Date().toISOString(),
            contextKey: 'dest:DE|purp:study|housing:none|city:Munich'
          },
          // General vital records apostille (country-agnostic)
          'gen_vital_documents': {
            completed: true,
            completedAt: new Date().toISOString(),
            contextKey: 'docs:vital|stage:accepted_offer'
          }
        }
      }

      // Verify Germany plan recognizes de_stu_housing_search as completed
      const resDE = generatePersonalisedPlan(germanyAnswers, storedProgress)
      const deHousing = resDE.plan.allTasks.find(t => t.id === 'de_stu_housing_search')
      expect(deHousing?.isCompleted).toBe(true)

      // 2. User changes destination to Canada
      const canadaAnswers: OnboardingAnswers = {
        ...germanyAnswers,
        destination_country: { code: 'CA', name: 'Canada', lat: 56.1304, lon: -106.3468, region: 'Americas' },
        destination_city: { cityName: 'Toronto' }
      }

      const resCA = generatePersonalisedPlan(canadaAnswers, storedProgress)

      // Germany housing is no longer in Canada plan
      const deHousingInCA = resCA.plan.allTasks.find(t => t.id === 'de_stu_housing_search')
      expect(deHousingInCA).toBeUndefined()

      // Canada housing task must NOT inherit completion from Germany housing
      const caHousing = resCA.plan.allTasks.find(t => t.id === 'ca_stu_housing_search')
      expect(caHousing?.isCompleted).toBe(false)

      // General task whose context key is unchanged preserves completion
      const apostille = resCA.plan.allTasks.find(t => t.id === 'gen_vital_documents')
      if (apostille) {
        expect(apostille.isCompleted).toBe(true)
      }
    })
  })

  // 12. Invalid / Corrupted Storage Recovery
  describe('12. Corrupted Saved Plan Progress Recovery', () => {
    it('safely recovers when localStorage contains corrupted JSON or invalid schema', () => {
      localStorage.setItem(STORAGE_KEY_PLAN_V1, 'invalid{{{json')
      const recovered = loadPlanProgress()
      expect(recovered.version).toBe(1)
      expect(Object.keys(recovered.tasks).length).toBe(0)

      // Unknown version number should also safely reset
      localStorage.setItem(STORAGE_KEY_PLAN_V1, JSON.stringify({ version: 999, tasks: 'garbage' }))
      const recoveredVersion = loadPlanProgress()
      expect(recoveredVersion.version).toBe(1)
      expect(Object.keys(recoveredVersion.tasks).length).toBe(0)
    })
  })

  // 13. Functional Review -> Plan -> Edit Navigation Flow
  describe('13. Functional Review → Plan → Edit → Updated Plan Navigation', () => {
    it('allows opening moving plan from review screen and returning to edit answers', async () => {
      const user = userEvent.setup()

      // Seed completed onboarding state
      const completedState = {
        version: 2,
        updatedAt: new Date().toISOString(),
        answers: {
          relocation_purpose: 'study',
          journey_stage: 'accepted_offer',
          current_country: { code: 'US', name: 'United States', lat: 37.0902, lon: -95.7129, region: 'Americas' },
          citizenship: { codes: ['US'] },
          destination_country: { code: 'DE', name: 'Germany', lat: 51.1657, lon: 10.4515, region: 'Europe' },
          destination_city: { cityName: 'Berlin' },
          study_level: 'masters',
          university_name: { name: 'Free University of Berlin' },
          move_date: { notSureYet: true },
          planned_duration: '1_to_2_years',
          travel_style: 'settling',
          companions: 'solo',
          living_budget: { currency: 'EUR', amount: 1200 },
          preparation_status: ['admission_enrolment'],
          first_priority: ['housing', 'paperwork']
        },
        currentQuestionId: 'relocation_purpose',
        isCompleted: true,
        storageStatus: 'saved'
      }

      localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(completedState))

      render(<OnboardingShell />)

      // 1. We are on Summary review screen
      expect(await screen.findByRole('article', { name: /Onboarding Complete Review/i })).toBeInTheDocument()

      // 2. Find and click "View my moving plan" CTA
      const viewPlanBtn = screen.getByRole('button', { name: /View my moving plan/i })
      expect(viewPlanBtn).toBeInTheDocument()
      await user.click(viewPlanBtn)

      // 3. We are on Moving Plan screen
      expect(await screen.findByRole('article', { name: /Personalised Moving Plan/i })).toBeInTheDocument()
      expect(screen.getByText('Your Personalised Moving Plan')).toBeInTheDocument()
      expect(screen.getByText('Germany')).toBeInTheDocument()
      expect(screen.getByText('Your Next 3 Actionable Priorities')).toBeInTheDocument()

      // 4. Click "Back to profile review"
      const backToReviewBtn = screen.getByRole('button', { name: /Back to profile review/i })
      await user.click(backToReviewBtn)

      // 5. Returned to Summary review screen
      expect(await screen.findByRole('article', { name: /Onboarding Complete Review/i })).toBeInTheDocument()
    })
  })

  // 14. Reset Dialog Background Inertness
  describe('14. Reset-Dialog Isolation and Background Inertness', () => {
    it('sets inert attribute on background content when reset dialog is open', async () => {
      const user = userEvent.setup()

      const state = {
        version: 2,
        updatedAt: new Date().toISOString(),
        answers: {
          relocation_purpose: 'study'
        },
        currentQuestionId: 'relocation_purpose',
        isCompleted: false
      }
      localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(state))

      render(<OnboardingShell />)

      const contentWrapper = document.querySelector('div[class*="_contentWrapper_"]')
      expect(contentWrapper).not.toHaveAttribute('inert')
      expect(contentWrapper).not.toHaveAttribute('aria-hidden')

      // Click Start again in header
      const headerResetBtn = screen.getByRole('button', { name: /Start again/i })
      await user.click(headerResetBtn)

      // Dialog is open
      const dialog = await screen.findByRole('alertdialog')
      expect(dialog).toBeInTheDocument()

      // Background contentWrapper must have inert and aria-hidden
      expect(contentWrapper).toHaveAttribute('inert')
      expect(contentWrapper).toHaveAttribute('aria-hidden', 'true')

      // Dismiss dialog with Cancel
      const cancelBtn = screen.getByRole('button', { name: /Cancel/i })
      await user.click(cancelBtn)

      await waitFor(() => {
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
      })

      // Inert attribute removed after dialog closes
      expect(contentWrapper).not.toHaveAttribute('inert')
      expect(contentWrapper).not.toHaveAttribute('aria-hidden')
    })
  })
})
