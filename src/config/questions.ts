import type { 
  QuestionDefinition, 
  OnboardingAnswers, 
  QuestionId, 
  QuestionOption,
  CountryInfo,
  CitizenshipAnswer,
  DestinationCountryAnswer,
  DestinationCityAnswer,
  MoveDateAnswer,
  BackpackingDestinationsAnswer,
  LivingBudgetAnswer,
  UniversityNameAnswer
} from '../store/types'

/**
 * BeyondNest Question Registry
 * 
 * Configurable, typed question registry with declarative visibility,
 * validation, dynamic copy adaptation (e.g., for already-abroad users),
 * and dependency invalidation policies.
 */

export const QUESTIONS: QuestionDefinition[] = [
  // 1. Relocation Purpose
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

  // 2. Journey Stage
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

  // 3. Current Country
  {
    id: 'current_country',
    order: 3,
    title: (answers) => answers.journey_stage === 'already_abroad' ? 'Where do you currently live?' : 'Where do you currently live?',
    subtitle: (answers) => answers.journey_stage === 'already_abroad' 
      ? 'Select the country where you are currently living abroad.' 
      : 'We use your current country to determine relevant visa pathways and travel logistics.',
    type: 'country_select',
    sceneId: 'country_globe_scene',
    isRequired: true,
    validate: (val) => {
      if (!val || typeof val !== 'object') {
        return { valid: false, error: 'Please select the country where you currently live.' }
      }
      const country = val as Partial<CountryInfo>
      if (!country.code || !country.name) {
        return { valid: false, error: 'Please choose a valid country from the list.' }
      }
      return { valid: true }
    }
  },

  // 4. Citizenship
  {
    id: 'citizenship',
    order: 4,
    title: 'Which country’s passport do you hold?',
    subtitle: 'This helps us find relevant official entry guidance later.',
    helperText: 'Select all passports you hold, or choose skip for now. We collect citizenship selections only, never passport numbers or documents.',
    type: 'citizenship_select',
    sceneId: 'citizenship_scene',
    isRequired: true,
    validate: (val) => {
      if (!val || typeof val !== 'object') {
        return { valid: false, error: 'Please select your citizenship or choose "Skip for now".' }
      }
      const ans = val as Partial<CitizenshipAnswer>
      if (ans.skipped === true) {
        return { valid: true }
      }
      if (Array.isArray(ans.codes) && ans.codes.length > 0) {
        return { valid: true }
      }
      return { valid: false, error: 'Please select at least one citizenship, or choose "Skip for now".' }
    }
  },

  // 5. Destination Country
  {
    id: 'destination_country',
    order: 5,
    title: (answers) => answers.journey_stage === 'already_abroad' 
      ? 'Which country did you move to?' 
      : 'Where would you like to move?',
    subtitle: (answers) => answers.journey_stage === 'already_abroad'
      ? 'Confirm your destination country abroad. You can adjust this if needed.'
      : 'Select your prospective destination country, or choose to explore destinations.',
    type: 'destination_country_select',
    sceneId: 'destination_globe_scene',
    isRequired: true,
    validate: (val) => {
      if (!val || typeof val !== 'object') {
        return { valid: false, error: 'Please choose a destination or select "Help me explore destinations".' }
      }
      const ans = val as Partial<DestinationCountryAnswer>
      if ('explore' in ans && ans.explore === true) {
        return { valid: true }
      }
      if ('code' in ans && ans.code && 'name' in ans && ans.name) {
        return { valid: true }
      }
      return { valid: false, error: 'Please choose a valid destination or select "Help me explore destinations".' }
    }
  },

  // 6. Optional Origin for Already-Abroad Users
  {
    id: 'origin_country_abroad',
    order: 6,
    title: 'Where did you move from?',
    subtitle: 'Optional: Sharing your previous home helps us understand your move without assuming a route.',
    type: 'country_select',
    sceneId: 'destination_globe_scene',
    isRequired: false,
    isVisible: (answers) => answers.journey_stage === 'already_abroad',
    validate: (val) => {
      if (!val) return { valid: true } // Optional
      if (typeof val === 'object') {
        if ('preferNotToSay' in val && (val as { preferNotToSay: boolean }).preferNotToSay) return { valid: true }
        const c = val as Partial<CountryInfo>
        if (c.code && c.name) return { valid: true }
      }
      return { valid: false, error: 'Please select a valid origin country or skip.' }
    }
  },

  // 7. Destination City (applicable only when destination is a specific country, not explore)
  {
    id: 'destination_city',
    order: 7,
    title: (answers) => answers.journey_stage === 'already_abroad' 
      ? 'Which city do you live in?' 
      : 'Do you have a city in mind?',
    subtitle: (answers) => answers.journey_stage === 'already_abroad'
      ? 'Enter your current city abroad or choose "Not decided yet".'
      : 'Enter your target city or choose "Not decided yet".',
    type: 'city_input',
    sceneId: 'city_scene',
    isRequired: true,
    isVisible: (answers) => {
      const dest = answers.destination_country
      return Boolean(dest && typeof dest === 'object' && !('explore' in dest && dest.explore) && 'code' in dest && dest.code)
    },
    validate: (val) => {
      if (!val || typeof val !== 'object') {
        return { valid: false, error: 'Please enter a city or select "Not decided yet".' }
      }
      const ans = val as Partial<DestinationCityAnswer>
      if (ans.notDecided === true) return { valid: true }
      if (typeof ans.cityName === 'string' && ans.cityName.trim().length > 0) return { valid: true }
      return { valid: false, error: 'Please enter a city or select "Not decided yet".' }
    }
  },

  // 8. Destination Priorities (applicable only when exploring destinations)
  {
    id: 'destination_priorities',
    order: 8,
    title: 'What matters most when choosing a destination?',
    subtitle: 'Select up to three priorities to help us discover matching destinations later.',
    type: 'multi_choice',
    maxSelections: 3,
    sceneId: 'priorities_compass_scene',
    isRequired: true,
    isVisible: (answers) => {
      const dest = answers.destination_country
      return Boolean(dest && typeof dest === 'object' && 'explore' in dest && dest.explore)
    },
    options: [
      {
        id: 'study_opportunities',
        label: 'Study opportunities',
        description: 'World-class universities, student culture, and academic growth.',
        badge: 'Education',
        iconName: 'GraduationCap'
      },
      {
        id: 'work_opportunities',
        label: 'Work opportunities',
        description: 'Dynamic job market, startup culture, and career development.',
        badge: 'Career',
        iconName: 'Briefcase'
      },
      {
        id: 'living_costs',
        label: 'Living costs',
        description: 'Affordable rent, accessible daily expenses, and good value.',
        badge: 'Finances',
        iconName: 'Coins'
      },
      {
        id: 'language',
        label: 'Language',
        description: 'Locations matching languages you speak or wish to learn.',
        badge: 'Culture',
        iconName: 'Languages'
      },
      {
        id: 'family_connections',
        label: 'Family connections',
        description: 'Proximity to relatives, community roots, or familiar support.',
        badge: 'Family',
        iconName: 'HeartHandshake'
      },
      {
        id: 'lifestyle_community',
        label: 'Lifestyle and community',
        description: 'Vibrant outdoor life, safety, welcoming culture, and climate.',
        badge: 'Lifestyle',
        iconName: 'SunMedium'
      }
    ],
    validate: (val) => {
      if (!Array.isArray(val) || val.length === 0) {
        return { valid: false, error: 'Please select at least one priority.' }
      }
      if (val.length > 3) {
        return { valid: false, error: 'You can select a maximum of three priorities.' }
      }
      return { valid: true }
    }
  },

  // 9. Move or Arrival Date
  {
    id: 'move_date',
    order: 9,
    title: (answers) => answers.journey_stage === 'already_abroad' 
      ? 'When did you arrive?' 
      : 'When are you planning to move?',
    subtitle: (answers) => answers.journey_stage === 'already_abroad'
      ? 'Select your arrival month and year, or choose "Prefer not to say".'
      : 'Select your target move month and year, or choose "Not sure yet".',
    type: 'date_select',
    sceneId: 'calendar_suitcase_scene',
    isRequired: true,
    validate: (val, answers) => {
      if (!val || typeof val !== 'object') {
        return { valid: false, error: 'Please choose a date or select flexible options.' }
      }
      const ans = val as Partial<MoveDateAnswer>
      const isAlreadyAbroad = answers?.journey_stage === 'already_abroad'

      if (isAlreadyAbroad && ans.preferNotToSay) {
        return { valid: true }
      }
      if (!isAlreadyAbroad && ans.notSureYet) {
        return { valid: true }
      }

      if (!ans.year || !ans.month || ans.month < 1 || ans.month > 12) {
        return { valid: false, error: 'Please select both a valid month and year.' }
      }

      // Local calendar boundaries
      const now = new Date()
      const currentYear = now.getFullYear()
      const currentMonth = now.getMonth() + 1 // 1-indexed

      if (isAlreadyAbroad) {
        // Arrival month cannot be in the future
        if (ans.year > currentYear || (ans.year === currentYear && ans.month > currentMonth)) {
          return { valid: false, error: 'Arrival date cannot be in the future.' }
        }
      } else {
        // Future move cannot be before current month
        if (ans.year < currentYear || (ans.year === currentYear && ans.month < currentMonth)) {
          return { valid: false, error: 'Planning date cannot be in the past.' }
        }
      }

      return { valid: true }
    }
  },

  // 10. Stay Duration
  {
    id: 'planned_duration',
    order: 10,
    title: 'How long do you expect to stay?',
    subtitle: 'This helps guide packing, visa considerations, and banking setups.',
    type: 'single_choice',
    sceneId: 'timeline_scene',
    isRequired: true,
    options: [
      {
        id: 'under_6_months',
        label: 'Under 6 months',
        description: 'Short exchange, seasonal term, or initial exploratory visit.',
        badge: 'Short stay',
        iconName: 'Clock'
      },
      {
        id: '6_to_12_months',
        label: '6–12 months',
        description: 'One-year study program, working holiday, or trial contract.',
        badge: '1 year',
        iconName: 'Calendar'
      },
      {
        id: '1_to_2_years',
        label: '1–2 years',
        description: 'Degree program, multi-year assignment, or extended transition.',
        badge: 'Multi-year',
        iconName: 'CalendarRange'
      },
      {
        id: 'more_than_2_years',
        label: 'More than 2 years',
        description: 'Long-term career relocation or permanent settlement.',
        badge: 'Long-term',
        iconName: 'Home'
      },
      {
        id: 'not_sure',
        label: 'Not sure yet',
        description: 'Keeping options open as your journey unfolds.',
        badge: 'Flexible',
        iconName: 'Compass'
      }
    ],
    validate: (val) => {
      const allowed = ['under_6_months', '6_to_12_months', '1_to_2_years', 'more_than_2_years', 'not_sure']
      if (!val || typeof val !== 'string' || !allowed.includes(val)) {
        return { valid: false, error: 'Please choose your expected duration.' }
      }
      return { valid: true }
    }
  },

  // 11. Travel Style
  {
    id: 'travel_style',
    order: 11,
    title: (answers) => answers.journey_stage === 'already_abroad' 
      ? 'How did you travel?' 
      : 'How are you planning to travel?',
    subtitle: (answers) => answers.journey_stage === 'already_abroad'
      ? 'Choose the style that matches your relocation experience.'
      : 'Choose whether you plan to settle in one place or explore multiple destinations.',
    type: 'single_choice',
    sceneId: 'travel_style_scene',
    isRequired: true,
    options: [
      {
        id: 'backpacking',
        label: 'Backpacking',
        description: 'Travelling light and exploring multiple places.',
        badge: 'Mobile',
        iconName: 'Compass'
      },
      {
        id: 'settling',
        label: 'Moving to one place',
        description: 'Settling in a particular city.',
        badge: 'Settled',
        iconName: 'Home'
      },
      {
        id: 'mix',
        label: 'A mix of both',
        description: 'Travelling across regions before establishing a home base.',
        badge: 'Hybrid',
        iconName: 'Sparkles'
      },
      {
        id: 'not_sure',
        label: 'Not sure yet',
        description: 'Open to discovering what feels right.',
        badge: 'Undecided',
        iconName: 'HelpCircle'
      }
    ],
    validate: (val) => {
      const allowed = ['backpacking', 'settling', 'mix', 'not_sure']
      if (!val || typeof val !== 'string' || !allowed.includes(val)) {
        return { valid: false, error: 'Please select your travel style.' }
      }
      return { valid: true }
    }
  },

  // 12. Backpacking Destinations (applicable when backpacking or a mix)
  {
    id: 'backpacking_destinations',
    order: 12,
    title: 'Which countries would you like to visit?',
    subtitle: 'Select countries in order to sketch your tentative route, or request route assistance.',
    helperText: 'Selection order is preserved as your tentative user-defined route. All selections work cleanly without needing to manipulate the 3D globe.',
    type: 'backpacking_destinations_select',
    sceneId: 'backpacking_globe_scene',
    isRequired: true,
    isVisible: (answers) => answers.travel_style === 'backpacking' || answers.travel_style === 'mix',
    validate: (val) => {
      if (!val || typeof val !== 'object') {
        return { valid: false, error: 'Please select destinations or choose "Help me plan my route".' }
      }
      const ans = val as Partial<BackpackingDestinationsAnswer>
      if (ans.planRouteForMe === true) return { valid: true }
      if (Array.isArray(ans.destinations) && ans.destinations.length > 0) return { valid: true }
      return { valid: false, error: 'Please select at least one country or choose "Help me plan my route".' }
    }
  },

  // 13. Companions
  {
    id: 'companions',
    order: 13,
    title: (answers) => answers.journey_stage === 'already_abroad' 
      ? 'Who moved with you?' 
      : 'Who is moving with you?',
    subtitle: 'Understanding your party ensures everyone’s visa and logistical needs are met.',
    type: 'single_choice',
    sceneId: 'companions_scene',
    isRequired: true,
    options: [
      {
        id: 'solo',
        label: 'Just me',
        description: 'Travelling independently and building new connections on the road.',
        badge: 'Solo',
        iconName: 'User'
      },
      {
        id: 'partner',
        label: 'Partner',
        description: 'Moving with a spouse or partner.',
        badge: 'Duo',
        iconName: 'Users'
      },
      {
        id: 'family',
        label: 'Family',
        description: 'Relocating with children or multi-generational family members.',
        badge: 'Family',
        iconName: 'HeartHandshake'
      },
      {
        id: 'friends',
        label: 'Friends',
        description: 'Travelling or co-living with friends or colleagues.',
        badge: 'Group',
        iconName: 'Users2'
      }
    ],
    validate: (val) => {
      const allowed = ['solo', 'partner', 'family', 'friends']
      if (!val || typeof val !== 'string' || !allowed.includes(val)) {
        return { valid: false, error: 'Please select who is moving with you.' }
      }
      return { valid: true }
    }
  },

  // 14. Living Budget
  {
    id: 'living_budget',
    order: 14,
    title: 'What is your estimated monthly living budget?',
    subtitle: 'Exclude tuition fees and one-time moving costs.',
    helperText: 'Enter a positive monthly living amount in your chosen currency, or choose "Help me estimate".',
    type: 'budget_input',
    sceneId: 'budget_wallet_scene',
    isRequired: true,
    validate: (val) => {
      if (!val || typeof val !== 'object') {
        return { valid: false, error: 'Please enter an estimated monthly budget or choose "Help me estimate".' }
      }
      const ans = val as Partial<LivingBudgetAnswer>
      if (ans.helpEstimate === true) return { valid: true }
      if (typeof ans.amount === 'number' && !isNaN(ans.amount) && ans.amount > 0 && typeof ans.currency === 'string' && ans.currency.length > 0) {
        return { valid: true }
      }
      return { valid: false, error: 'Please enter a valid positive monthly amount or select "Help me estimate".' }
    }
  },

  // 15. Student Branch: Study Level
  {
    id: 'study_level',
    order: 15,
    title: (answers) => answers.journey_stage === 'already_abroad' 
      ? 'What level are you studying?' 
      : 'What level will you study?',
    subtitle: 'Select your degree or educational program level.',
    type: 'single_choice',
    sceneId: 'campus_scene',
    isRequired: true,
    isVisible: (answers) => answers.relocation_purpose === 'study',
    options: [
      { id: 'language_prep', label: 'Language / preparation course', badge: 'Pathway' },
      { id: 'bachelors', label: 'Bachelor’s', badge: 'Undergraduate' },
      { id: 'masters', label: 'Master’s', badge: 'Postgraduate' },
      { id: 'doctorate', label: 'Doctorate', badge: 'PhD / Research' },
      { id: 'exchange_short', label: 'Exchange / short course', badge: 'Short-term' },
      { id: 'other', label: 'Other', badge: 'Specialist' },
      { id: 'not_sure', label: 'Not sure yet', badge: 'Exploring' }
    ],
    validate: (val) => {
      const allowed = ['language_prep', 'bachelors', 'masters', 'doctorate', 'exchange_short', 'other', 'not_sure']
      if (!val || typeof val !== 'string' || !allowed.includes(val)) {
        return { valid: false, error: 'Please select your study level.' }
      }
      return { valid: true }
    }
  },

  // 16. Student Branch: University Name
  {
    id: 'university_name',
    order: 16,
    title: (answers) => answers.journey_stage === 'already_abroad' 
      ? 'Which university do you attend?' 
      : 'Which university will you attend?',
    subtitle: 'Enter the institution name or select "Not decided yet".',
    type: 'university_input',
    sceneId: 'campus_scene',
    isRequired: true,
    isVisible: (answers) => answers.relocation_purpose === 'study',
    validate: (val) => {
      if (!val || typeof val !== 'object') {
        return { valid: false, error: 'Please enter a university name or select "Not decided yet".' }
      }
      const ans = val as Partial<UniversityNameAnswer>
      if (ans.notDecided === true) return { valid: true }
      if (typeof ans.name === 'string' && ans.name.trim().length > 0) return { valid: true }
      return { valid: false, error: 'Please enter a university name or select "Not decided yet".' }
    }
  },

  // 17. Work Branch: Work Status
  {
    id: 'work_status',
    order: 17,
    title: (answers) => answers.journey_stage === 'already_abroad' 
      ? 'What is your current work situation?' 
      : 'Do you already have a job offer?',
    subtitle: (answers) => answers.journey_stage === 'already_abroad'
      ? 'Select your current employment situation abroad.'
      : 'Job confirmation shapes visa processing timelines and sponsorship requirements.',
    type: 'single_choice',
    sceneId: 'workspace_scene',
    isRequired: true,
    isVisible: (answers) => answers.relocation_purpose === 'work',
    options: (answers) => {
      if (answers.journey_stage === 'already_abroad') {
        return [
          { id: 'employed', label: 'Employed', description: 'Currently working in a local or remote role.', badge: 'Employed' },
          { id: 'starting_soon', label: 'Starting a confirmed role', description: 'Offer in hand, starting work soon.', badge: 'Confirmed' },
          { id: 'looking', label: 'Looking for work', description: 'Actively searching and interviewing.', badge: 'Job seeker' },
          { id: 'other', label: 'Other / prefer not to say', description: 'Freelance, sabbatical, or personal.', badge: 'Flexible' }
        ]
      }
      return [
        { id: 'yes_offer', label: 'Yes', description: 'Offer letter signed or employment contract in place.', badge: 'Offer secured' },
        { id: 'interviewing', label: 'Applying / interviewing', description: 'Engaged in recruitment processes or sending applications.', badge: 'In progress' },
        { id: 'not_yet', label: 'Not yet', description: 'Have not begun actively applying for overseas roles.', badge: 'Early stage' },
        { id: 'not_applicable', label: 'Not applicable', description: 'Remote worker, transferring with current employer, or self-employed.', badge: 'Other' }
      ]
    },
    validate: (val, answers) => {
      const preparingAllowed = ['yes_offer', 'interviewing', 'not_yet', 'not_applicable']
      const abroadAllowed = ['employed', 'starting_soon', 'looking', 'other']
      const allowed = answers?.journey_stage === 'already_abroad' ? abroadAllowed : preparingAllowed

      if (!val || typeof val !== 'string' || !allowed.includes(val)) {
        return { valid: false, error: 'Please select your work situation.' }
      }
      return { valid: true }
    }
  },

  // 18. Preparation Status
  {
    id: 'preparation_status',
    order: 18,
    title: 'What have you already arranged?',
    subtitle: 'Select everything currently in place. "Nothing yet" cannot be combined with other items.',
    type: 'multi_choice',
    sceneId: 'packing_suitcase_scene',
    isRequired: true,
    options: (answers) => {
      const opts: QuestionOption[] = []
      if (answers.relocation_purpose === 'study') {
        opts.push({
          id: 'admission_enrolment',
          label: 'Admission / enrolment',
          description: 'Confirmed acceptance or university enrolment in hand.',
          badge: 'Study'
        })
      }
      if (answers.relocation_purpose === 'work' && answers.journey_stage !== 'already_abroad') {
        opts.push({
          id: 'job_offer',
          label: 'Job offer',
          description: 'Confirmed employment offer or transfer agreement.',
          badge: 'Work'
        })
      }
      opts.push({
        id: 'visa_permission',
        label: 'Relevant visa or residence permission',
        description: 'Visa granted, submitted, or residence rights established.',
        badge: 'Legal'
      })
      opts.push({
        id: 'housing',
        label: 'Housing',
        description: 'Apartment leased, dorm room secured, or temporary stay booked.',
        badge: 'Shelter'
      })
      opts.push({
        id: 'insurance',
        label: 'Insurance',
        description: 'Health, travel, or international coverage arranged.',
        badge: 'Safety'
      })
      if (answers.journey_stage !== 'already_abroad') {
        opts.push({
          id: 'travel_booking',
          label: 'Travel booking',
          description: 'Flights, train passes, or transit tickets booked.',
          badge: 'Travel'
        })
      }
      opts.push({
        id: 'nothing_yet',
        label: 'Nothing yet',
        description: 'Just getting started on preparations — and that is completely fine.',
        badge: 'Starting out'
      })
      return opts
    },
    validate: (val) => {
      if (!Array.isArray(val) || val.length === 0) {
        return { valid: false, error: 'Please select at least one item, or choose "Nothing yet".' }
      }
      if (val.includes('nothing_yet') && val.length > 1) {
        return { valid: false, error: '"Nothing yet" cannot be selected together with other arranged items.' }
      }
      return { valid: true }
    }
  },

  // 19. First Priorities
  {
    id: 'first_priority',
    order: 19,
    title: 'What would you like help with first?',
    subtitle: 'Select up to three areas where you would like initial guidance.',
    type: 'multi_choice',
    maxSelections: 3,
    sceneId: 'neighbourhood_priorities_scene',
    isRequired: true,
    options: [
      {
        id: 'paperwork',
        label: 'Paperwork',
        description: 'Visas, residence permits, embassy steps, and document authentication.',
        badge: 'Official',
        iconName: 'FileCheck'
      },
      {
        id: 'housing',
        label: 'Housing',
        description: 'Finding neighbourhoods, rental deposits, lease terms, and utilities.',
        badge: 'Living',
        iconName: 'Home'
      },
      {
        id: 'budget',
        label: 'Budget',
        description: 'Living costs, international banking, money transfers, and savings.',
        badge: 'Finances',
        iconName: 'Wallet'
      },
      {
        id: 'language_daily_life',
        label: 'Language and daily life',
        description: 'Local phrases, public transport, SIM cards, groceries, and customs.',
        badge: 'Daily life',
        iconName: 'Languages'
      },
      {
        id: 'meeting_people',
        label: 'Meeting people',
        description: 'Connecting with fellow expats, community groups, and local activities.',
        badge: 'Social',
        iconName: 'Users'
      },
      {
        id: 'whole_process',
        label: 'Understanding the whole process',
        description: 'A structured, step-by-step master overview from planning to arrival.',
        badge: 'Strategy',
        iconName: 'Compass'
      }
    ],
    validate: (val) => {
      if (!Array.isArray(val) || val.length === 0) {
        return { valid: false, error: 'Please select at least one priority.' }
      }
      if (val.length > 3) {
        return { valid: false, error: 'You can select a maximum of three priorities.' }
      }
      return { valid: true }
    }
  }
]

export function getQuestionById(id: string): QuestionDefinition | undefined {
  return QUESTIONS.find(q => q.id === id)
}

/**
 * Returns the ordered list of questions applicable to the current user's answers.
 */
export function getApplicableQuestions(answers: OnboardingAnswers): QuestionDefinition[] {
  return QUESTIONS.filter(q => {
    if (!q.isVisible) return true
    return q.isVisible(answers)
  })
}

/**
 * Resolves the next applicable question ID in dynamic flow.
 */
export function getNextQuestionId(currentId: string, answers: OnboardingAnswers): QuestionId | undefined {
  const applicable = getApplicableQuestions(answers)
  const index = applicable.findIndex(q => q.id === currentId)
  if (index === -1 || index >= applicable.length - 1) return undefined
  return applicable[index + 1].id
}

/**
 * Resolves the previous applicable question ID in dynamic flow.
 */
export function getPreviousQuestionId(currentId: string, answers: OnboardingAnswers): QuestionId | undefined {
  const applicable = getApplicableQuestions(answers)
  const index = applicable.findIndex(q => q.id === currentId)
  if (index <= 0) return undefined
  return applicable[index - 1].id
}

/**
 * Resolves dynamic title text.
 */
export function resolveQuestionTitle(q: QuestionDefinition, answers: OnboardingAnswers): string {
  if (typeof q.title === 'function') {
    return q.title(answers)
  }
  return q.title
}

/**
 * Resolves dynamic subtitle text.
 */
export function resolveQuestionSubtitle(q: QuestionDefinition, answers: OnboardingAnswers): string | undefined {
  if (typeof q.subtitle === 'function') {
    return q.subtitle(answers)
  }
  return q.subtitle
}

/**
 * Resolves dynamic question options.
 */
export function resolveQuestionOptions(q: QuestionDefinition, answers: OnboardingAnswers): QuestionOption[] {
  if (typeof q.options === 'function') {
    return q.options(answers)
  }
  return q.options || []
}
