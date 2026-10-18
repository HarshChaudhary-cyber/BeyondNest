import type { QuestionDefinition } from '../store/types'

export const QUESTIONS: QuestionDefinition[] = [
  {
    id: 'relocation_purpose',
    order: 1,
    title: 'What brings you to a new country?',
    subtitle: 'Choose the primary reason for your upcoming move abroad.',
    type: 'single_choice',
    sceneId: 'purpose_scene',
    isRequired: true,
    options: [
      {
        id: 'study',
        label: 'Study',
        description: 'Undergraduate, Master’s, PhD, language school, or student exchange.',
        badge: 'Education',
        iconName: 'GraduationCap'
      },
      {
        id: 'work',
        label: 'Work',
        description: 'New employment, internal transfer, remote freelance, or business expansion.',
        badge: 'Career',
        iconName: 'Briefcase'
      },
      {
        id: 'family',
        label: 'Join family',
        description: 'Moving to be with a partner, spouse, children, or family reunification.',
        badge: 'Family',
        iconName: 'HeartHandshake'
      },
      {
        id: 'explore',
        label: 'Explore my options',
        description: 'Working holiday, gap year, backpacking, sabbatical, or seeking a fresh start.',
        badge: 'Adventure',
        iconName: 'Compass'
      }
    ],
    validate: (val) => {
      const allowed = ['study', 'work', 'family', 'explore']
      if (!val || typeof val !== 'string' || !allowed.includes(val)) {
        return { valid: false, error: 'Please select what brings you to a new country.' }
      }
      return { valid: true }
    }
  },
  {
    id: 'journey_stage',
    order: 2,
    title: 'Where are you in your journey?',
    subtitle: 'This helps us understand how soon your transition will take place.',
    type: 'single_choice',
    sceneId: 'journey_scene',
    isRequired: true,
    options: [
      {
        id: 'exploring',
        label: 'Just exploring',
        description: 'Considering possibilities, researching visas, and dreaming of destinations.',
        badge: 'Stage 1',
        iconName: 'Compass'
      },
      {
        id: 'preparing_apps',
        label: 'Preparing applications',
        description: 'Drafting university admissions, job CVs, or embassy paperwork.',
        badge: 'Stage 2',
        iconName: 'FileText'
      },
      {
        id: 'accepted_offer',
        label: 'Accepted / offer received',
        description: 'Admission letter or employment contract confirmed; visa processing begins.',
        badge: 'Stage 3',
        iconName: 'CheckCircle2'
      },
      {
        id: 'preparing_leave',
        label: 'Preparing to leave',
        description: 'Tickets booked, packing luggage, arranging housing, and bidding farewell.',
        badge: 'Stage 4',
        iconName: 'PlaneTakeoff'
      },
      {
        id: 'already_abroad',
        label: 'Already abroad',
        description: 'Recently arrived in your new country and setting up daily life.',
        badge: 'Stage 5',
        iconName: 'Flag'
      }
    ],
    validate: (val) => {
      const allowed = ['exploring', 'preparing_apps', 'accepted_offer', 'preparing_leave', 'already_abroad']
      if (!val || typeof val !== 'string' || !allowed.includes(val)) {
        return { valid: false, error: 'Please choose your current journey stage.' }
      }
      return { valid: true }
    }
  },
  {
    id: 'current_country',
    order: 3,
    title: 'Where do you currently live?',
    subtitle: 'We use your origin country to determine relevant visa pathways and travel logistics.',
    type: 'country_select',
    sceneId: 'country_globe_scene',
    isRequired: true,
    validate: (val) => {
      if (!val || typeof val !== 'object') {
        return { valid: false, error: 'Please select the country where you currently reside.' }
      }
      const country = val as { code?: string; name?: string }
      if (!country.code || !country.name) {
        return { valid: false, error: 'Please choose a valid country from the list.' }
      }
      return { valid: true }
    }
  }
]

export function getQuestionById(id: string): QuestionDefinition | undefined {
  return QUESTIONS.find(q => q.id === id)
}

export function getNextQuestionId(currentId: string): string | undefined {
  const index = QUESTIONS.findIndex(q => q.id === currentId)
  if (index === -1 || index >= QUESTIONS.length - 1) return undefined
  return QUESTIONS[index + 1].id
}

export function getPreviousQuestionId(currentId: string): string | undefined {
  const index = QUESTIONS.findIndex(q => q.id === currentId)
  if (index <= 0) return undefined
  return QUESTIONS[index - 1].id
}
