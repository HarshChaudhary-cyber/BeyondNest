import type { TaskTemplate } from '../types'

export const specialContextTasks: TaskTemplate[] = [
  // 1. Backpacking Itinerary & Entry Verification
  {
    id: 'bpk_itinerary_route_check',
    title: 'Review entry regulations, visa limits, and transit rules for each stop on your route',
    action: (answers) => {
      const bpk = answers.backpacking_destinations
      let routeSummary = ''
      if (bpk?.destinations && bpk.destinations.length > 0) {
        routeSummary = `: ${bpk.destinations.map((d, i) => `${i + 1}. ${d.name}`).join(' → ')}`
      } else if (bpk?.planRouteForMe) {
        routeSummary = ' across your prospective travel route'
      }
      return `Verify passport validity rules, bilateral visa exemptions, maximum allowable stay durations (e.g. Schengen 90/180 rule in Europe), and onward travel ticket requirements for each country on your route${routeSummary}.`
    },
    category: 'travel',
    phase: 'start_here',
    whyItAppears: () => 'Backpacking across multiple destinations requires confirming that stay limits and entry permissions in each country align with your planned travel itinerary.',
    isDestinationSpecific: false,
    resourceIds: ['gen_iata_travel_centre'],
    suggestedTiming: () => 'Suggested: 2–3 months before departure / before purchasing non-refundable transport',
    prerequisiteTaskIds: [],
    isApplicable: (answers) => answers.travel_style === 'backpacking' || answers.travel_style === 'mix',
    computeContextKey: (answers) => {
      const stops = answers.backpacking_destinations?.destinations?.map(d => d.code).join(',') || 'flexible'
      return `bpk:true|stops:${stops}`
    }
  },

  // 2. Backpacking Modular Gear & Health
  {
    id: 'bpk_gear_health_prep',
    title: 'Assemble modular lightweight gear, travel health kit, and emergency document copies',
    action: () => 'Pack durable lightweight luggage, universal power adapters, a basic first-aid kit with prescription medication documentation, and store secure encrypted digital copies of your passport and travel tickets.',
    category: 'travel',
    phase: 'before_departure',
    whyItAppears: () => 'Mobile backpacking across regional borders requires streamlined packing, compliant medication documentation, and digital backups in case physical documents are lost.',
    isDestinationSpecific: false,
    resourceIds: ['gen_who_travel_health'],
    suggestedTiming: () => 'Suggested: 2–3 weeks prior to departure',
    prerequisiteTaskIds: ['bpk_itinerary_route_check'],
    isApplicable: (answers) => answers.travel_style === 'backpacking' || answers.travel_style === 'mix',
    computeContextKey: () => 'bpk:gear'
  },

  // 3. Moving with Family
  {
    id: 'fam_household_prep',
    title: 'Coordinate family dependent visas, schooling documentation, and healthcare transfers',
    action: () => 'Obtain apostilled copies of marriage certificates and child birth certificates, assemble school transcripts with certified translations, and verify dependent work permissions or school registration deadlines.',
    category: 'daily_life',
    phase: 'before_departure',
    whyItAppears: () => 'Relocating with a partner or dependent children involves distinct legal dependencies, pediatric medical transfers, and local education enrolment timelines.',
    isDestinationSpecific: false,
    suggestedTiming: () => 'Suggested: 3–4 months prior to departure',
    prerequisiteTaskIds: [],
    isApplicable: (answers) => answers.companions === 'partner' || answers.companions === 'family',
    computeContextKey: (answers) => `comp:${answers.companions || 'solo'}`
  },

  // 4. Moving Solo (Community Building)
  {
    id: 'solo_community_building',
    title: 'Explore local interest clubs, newcomer meetups, and community networks',
    action: (answers) => {
      const city = answers.destination_city?.cityName ? ` in ${answers.destination_city.cityName}` : ''
      return `Identify university student societies, professional expat groups, language exchanges, or local sports and hobby communities${city} to build an initial social network.`
    },
    category: 'community',
    phase: 'arrival_settling',
    whyItAppears: () => 'Moving independently provides freedom, but establishing personal and professional connections early eases cultural adjustment and provides local support.',
    isDestinationSpecific: false,
    suggestedTiming: () => 'Suggested: 2–4 weeks before departure and during your first month',
    prerequisiteTaskIds: [],
    isApplicable: (answers) => answers.companions === 'solo',
    computeContextKey: (answers) => `comp:solo|city:${answers.destination_city?.cityName || 'none'}`
  },

  // 5. Already Abroad (Settling in)
  {
    id: 'abroad_settling_priorities',
    title: 'Finalize local administrative registrations, residency titles, and official IDs',
    action: (answers) => {
      const country = answers.current_country?.name || 'your current country'
      return `Verify that your local address registration, immigration residency permit, healthcare system enrollment, and tax identification numbers in ${country} are fully up to date.`
    },
    category: 'arrival',
    phase: 'arrival_settling',
    whyItAppears: () => 'Because you have already arrived abroad, your moving plan prioritises local administrative stability, legal compliance, and community roots over pre-departure tasks.',
    isDestinationSpecific: false,
    suggestedTiming: () => 'Suggested: Immediate ongoing priority',
    prerequisiteTaskIds: [],
    isApplicable: (answers) => answers.journey_stage === 'already_abroad',
    computeContextKey: (answers) => `stage:already_abroad|country:${answers.current_country?.code || 'unknown'}`
  },

  // 6. Skipped Citizenship Notice
  {
    id: 'cit_skipped_notice',
    title: 'Confirm visa requirements and entry regulations for your specific passport(s)',
    action: (answers) => {
      const dest = answers.destination_country && 'name' in answers.destination_country 
        ? answers.destination_country.name 
        : 'destination'
      return `Consult the official consulate or immigration authority for ${dest} and review the exact visa categories applicable to the citizenship and passport(s) you hold.`
    },
    category: 'paperwork',
    phase: 'start_here',
    whyItAppears: () => 'You skipped citizenship details during onboarding. Official entry criteria, visa eligibility, and processing timelines depend fundamentally on the passport(s) you hold.',
    isDestinationSpecific: false,
    resourceIds: ['gen_iata_travel_centre'],
    suggestedTiming: () => 'Suggested: Immediate next step',
    prerequisiteTaskIds: [],
    isApplicable: (answers) => Boolean(answers.citizenship?.skipped),
    computeContextKey: () => 'cit:skipped'
  },

  // 7. Ambiguous Visa Status Verification
  {
    id: 'visa_status_verification',
    title: 'Check your permission status, entry conditions, and remaining immigration steps',
    action: (answers) => {
      const dest = answers.destination_country && 'name' in answers.destination_country 
        ? answers.destination_country.name 
        : 'destination'
      return `Review your visa approval notification or application tracking status with ${dest} immigration authorities. Ensure you have physical approval letters, check permitted entry dates, and review conditions attached to your permission.`
    },
    category: 'paperwork',
    phase: 'before_departure',
    whyItAppears: () => 'You noted having applied for or received visa or residence permission. Verify that your visa is fully approved, note the entry window dates, and ensure you have all supporting documentation for border inspection.',
    isDestinationSpecific: false,
    suggestedTiming: () => 'Suggested: 1 month before departure / prior to booking non-refundable travel',
    prerequisiteTaskIds: [],
    isApplicable: (answers) => Boolean(answers.preparation_status?.includes('visa_permission')),
    computeContextKey: (answers) => `prep:visa_permission|dest:${answers.destination_country?.code || 'gen'}`
  },

  // 8. Living Budget Estimate Worksheet (when "Help me estimate" was selected)
  {
    id: 'bgt_estimate_worksheet',
    title: 'Build an estimated monthly living expense worksheet for your destination',
    action: (answers) => {
      const dest = answers.destination_country && 'name' in answers.destination_country 
        ? answers.destination_country.name 
        : 'your destination'
      return `Research local rent, groceries, public transit, mobile connectivity, and mandatory insurance costs in ${dest} to assemble a realistic monthly budget allocation.`
    },
    category: 'budget',
    phase: 'start_here',
    whyItAppears: () => 'You selected "Help me estimate" during onboarding. Constructing an expense worksheet based on published student or municipal benchmarks provides financial predictability without relying on artificial cost calculations.',
    isDestinationSpecific: false,
    suggestedTiming: () => 'Suggested: Initial planning phase',
    prerequisiteTaskIds: [],
    isApplicable: (answers) => Boolean(answers.living_budget?.helpEstimate),
    computeContextKey: (answers) => `bgt:helpEstimate|dest:${answers.destination_country?.code || 'explore'}`
  }
]
