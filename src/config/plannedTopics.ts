/**
 * BeyondNest Future Onboarding Topics Roadmap
 * Recorded for architectural planning and milestone progression without implementing unused features.
 */

export interface PlannedTopic {
  id: string
  title: string
  description: string
  plannedMilestone: 'Milestone 2' | 'Milestone 3' | 'Milestone 4'
  category: 'Identity' | 'Destination' | 'Timeline' | 'Logistics' | 'Finances' | 'Community'
}

export const PLANNED_TOPICS: PlannedTopic[] = [
  {
    id: 'citizenship_passports',
    title: 'Citizenship & Passports',
    description: 'Current passport(s) held, dual citizenship status, and visa-free travel privileges.',
    plannedMilestone: 'Milestone 2',
    category: 'Identity'
  },
  {
    id: 'destination_country',
    title: 'Destination Country',
    description: 'Target country of relocation or shortlist of prospective countries.',
    plannedMilestone: 'Milestone 2',
    category: 'Destination'
  },
  {
    id: 'destination_city',
    title: 'Specific City or Region',
    description: 'Specific metropolis, university town, regional hub, or open to recommendations.',
    plannedMilestone: 'Milestone 2',
    category: 'Destination'
  },
  {
    id: 'target_move_date',
    title: 'Estimated Move Date',
    description: 'Target departure month, quarter, season, or flexible timeline.',
    plannedMilestone: 'Milestone 2',
    category: 'Timeline'
  },
  {
    id: 'stay_duration',
    title: 'Intended Stay Duration',
    description: 'Short term (< 1 year), medium term (1-3 years), or long-term permanent settlement.',
    plannedMilestone: 'Milestone 3',
    category: 'Timeline'
  },
  {
    id: 'lifestyle_mode',
    title: 'Backpacking vs. Settling',
    description: 'Nomadic slow travel, multi-hostel backpacking, or establishing a settled apartment.',
    plannedMilestone: 'Milestone 3',
    category: 'Logistics'
  },
  {
    id: 'multiple_destinations',
    title: 'Single vs. Multi-destination Route',
    description: 'Single-country relocation or multi-stop global itinerary / working holiday hops.',
    plannedMilestone: 'Milestone 3',
    category: 'Destination'
  },
  {
    id: 'travel_companions',
    title: 'Companions & Family',
    description: 'Solo move, with a romantic partner, with dependent children, or bringing pets.',
    plannedMilestone: 'Milestone 3',
    category: 'Identity'
  },
  {
    id: 'relocation_budget',
    title: 'Relocation & Savings Budget',
    description: 'Initial relocation fund, monthly cost-of-living expectations, emergency buffer.',
    plannedMilestone: 'Milestone 4',
    category: 'Finances'
  },
  {
    id: 'housing_arrangements',
    title: 'Initial Housing Arrangements',
    description: 'Temporary Airbnb/hotel, student dorm, lease contract prior to arrival, or homestay.',
    plannedMilestone: 'Milestone 4',
    category: 'Logistics'
  },
  {
    id: 'top_priorities',
    title: 'Personal Priorities & Concerns',
    description: 'Healthcare, safety, expat community, tax optimization, climate, or career growth.',
    plannedMilestone: 'Milestone 4',
    category: 'Logistics'
  }
]
