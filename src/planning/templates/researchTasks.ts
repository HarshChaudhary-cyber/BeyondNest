import type { TaskTemplate } from '../types'

const PRIORITY_LABELS: Record<string, string> = {
  study_opportunities: 'Quality education & study opportunities',
  work_opportunities: 'Employment & career prospects',
  living_costs: 'Affordable living expenses & housing',
  language: 'Language learning & communication ease',
  family_connections: 'Proximity to family & community roots',
  lifestyle_community: 'Safe, welcoming lifestyle & outdoor climate'
}

export const researchTasks: TaskTemplate[] = [
  // 1. Compare candidate countries against stated priorities
  {
    id: 'res_compare_destinations_priorities',
    title: 'Shortlist and evaluate candidate destinations against your core priorities',
    action: (answers) => {
      const priorityText = Array.isArray(answers.destination_priorities) && answers.destination_priorities.length > 0
        ? answers.destination_priorities.map(p => PRIORITY_LABELS[p] || p).join(', ')
        : 'your personal goals'
      return `Compare 2 to 3 prospective destination countries by evaluating how each supports your stated priorities: ${priorityText}. Research admission standards, work permit pathways, and cultural fit.`
    },
    category: 'paperwork',
    phase: 'start_here',
    whyItAppears: (answers) => {
      const count = answers.destination_priorities?.length || 0
      return `You chose to explore destination options and selected ${count} key priority areas. Structuring your evaluation criteria around these priorities provides a rational framework without relying on arbitrary country ranking lists.`
    },
    isDestinationSpecific: false,
    suggestedTiming: () => 'Suggested: Initial exploratory phase (6–12 months before move)',
    prerequisiteTaskIds: [],
    isApplicable: (answers) => Boolean(answers.destination_country && 'explore' in answers.destination_country && answers.destination_country.explore),
    computeContextKey: (answers) => `explore:true|priorities:${answers.destination_priorities?.slice().sort().join(',') || 'none'}`
  },

  // 2. Budget benchmarking
  {
    id: 'res_budget_benchmark',
    title: 'Benchmark estimated living expenses across candidate countries',
    action: (answers) => {
      const budgetNote = answers.living_budget?.amount
        ? ` with your estimated monthly budget of ${answers.living_budget.currency} ${answers.living_budget.amount.toLocaleString()}`
        : ' against typical international student/worker living expenses'
      return `Gather published living cost estimates from national universities, student welfare bodies, and official immigration financial proof requirements to benchmark affordability${budgetNote}.`
    },
    category: 'budget',
    phase: 'start_here',
    whyItAppears: () => 'Living expenses and required proof of funds vary significantly between destination countries and cities. Benchmarking official proof thresholds early prevents unexpected budget shortfalls.',
    isDestinationSpecific: false,
    suggestedTiming: () => 'Suggested: During destination shortlisting',
    prerequisiteTaskIds: [],
    isApplicable: (answers) => Boolean(answers.destination_country && 'explore' in answers.destination_country && answers.destination_country.explore),
    computeContextKey: (answers) => `explore:true|bgt:${answers.living_budget?.amount || 'est'}`
  },

  // 3. Passport entry regulations check
  {
    id: 'res_passport_entry_check',
    title: 'Verify visa routes and reciprocal entry agreements for your passport(s)',
    action: () => 'Check official consulate websites of shortlisted destinations to assess visa application timelines, working holiday agreements, and whether your passport qualifies for simplified visa processing.',
    category: 'paperwork',
    phase: 'start_here',
    whyItAppears: (answers) => answers.citizenship?.skipped
      ? 'Because you skipped citizenship questions, researching visa categories for your specific passport is a critical first step.'
      : 'Immigration treaties and visa requirements vary fundamentally based on passport citizenship.',
    isDestinationSpecific: false,
    resourceIds: ['gen_iata_travel_centre'],
    suggestedTiming: () => 'Suggested: Before committing to an application pathway',
    prerequisiteTaskIds: [],
    isApplicable: (answers) => Boolean(answers.destination_country && 'explore' in answers.destination_country && answers.destination_country.explore),
    computeContextKey: (answers) => `explore:true|cit:${answers.citizenship?.codes?.join(',') || (answers.citizenship?.skipped ? 'skipped' : 'none')}`
  },

  // 4. Rental customs and housing feasibility
  {
    id: 'res_housing_rental_customs',
    title: 'Research rental search norms, deposits, and tenant regulations across target regions',
    action: () => 'Investigate typical rental search timelines, guarantor rules, upfront deposit requirements, and university dormitory availability across candidate cities to ensure realistic accommodation planning.',
    category: 'housing',
    phase: 'before_departure',
    whyItAppears: () => 'Housing scarcity and lease customs differ widely across international metropolitan areas. Learning whether landlords require local guarantors or in-person viewings prevents arrival surprises.',
    isDestinationSpecific: false,
    suggestedTiming: () => 'Suggested: 3–6 months before planned relocation',
    prerequisiteTaskIds: ['res_compare_destinations_priorities'],
    isApplicable: (answers) => Boolean(answers.destination_country && 'explore' in answers.destination_country && answers.destination_country.explore),
    computeContextKey: () => 'explore:true|housing_research'
  }
]
