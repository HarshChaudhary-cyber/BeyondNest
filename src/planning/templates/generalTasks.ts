import type { TaskTemplate } from '../types'

export const generalTasks: TaskTemplate[] = [
  // 1. Consulate / Official Visa Investigation (only when no destination pack exists)
  {
    id: 'gen_visa_consulate_research',
    title: (answers) => {
      const country = answers.destination_country && 'name' in answers.destination_country 
        ? answers.destination_country.name 
        : 'destination'
      return `Investigate official visa requirements with ${country} immigration authorities`
    },
    action: (answers) => {
      const country = answers.destination_country && 'name' in answers.destination_country 
        ? answers.destination_country.name 
        : 'your target country'
      const purpose = answers.relocation_purpose ? ` for ${answers.relocation_purpose}` : ''
      return `Consult the official embassy or national immigration portal for ${country} to verify entry visa types${purpose}, required processing times, and biometric submission standards.`
    },
    category: 'paperwork',
    phase: 'start_here',
    whyItAppears: (answers) => {
      const country = answers.destination_country && 'name' in answers.destination_country 
        ? answers.destination_country.name 
        : 'your target destination'
      return `BeyondNest provides curated resource packs for Germany and Canada students, with additional countries in development. For ${country}, consulting official consular sources ensures you receive authoritative, up-to-date entry guidelines without applying another country's rules.`
    },
    isDestinationSpecific: false,
    resourceIds: ['gen_iata_travel_centre'],
    suggestedTiming: () => 'Suggested: Check official consular processing times for your destination before booking non-refundable travel',
    prerequisiteTaskIds: [],
    isApplicable: (answers) => {
      const isSpecific = Boolean(answers.destination_country && 'code' in answers.destination_country && answers.destination_country.code)
      const hasPack = answers.destination_country?.code === 'DE' || answers.destination_country?.code === 'CA'
      const isStudent = answers.relocation_purpose === 'study'
      return isSpecific && !(hasPack && isStudent) && answers.journey_stage !== 'already_abroad'
    },
    computeContextKey: (answers) => `dest:${answers.destination_country?.code || 'none'}|purp:${answers.relocation_purpose || 'gen'}`
  },

  // 2. Vital Personal Documents (Avoid universal apostille mandate)
  {
    id: 'gen_vital_documents',
    title: 'Check document verification, translation, and legalisation requirements',
    action: (answers) => {
      const country = answers.destination_country && 'name' in answers.destination_country 
        ? ` for ${answers.destination_country.name}`
        : ''
      return `Determine which personal documents (such as birth certificates, academic diplomas, and background checks) require certified translations or legalisation (such as an apostille or consular authentication) for your target destination, as rules vary by bilateral treaties${country}.`
    },
    category: 'paperwork',
    phase: 'start_here',
    whyItAppears: () => 'International administrative bodies, employers, and landlords require verified personal documentation. Sourcing certified translations and authentications often requires several weeks in your home country.',
    isDestinationSpecific: false,
    suggestedTiming: () => 'Suggested: Check document processing times in your home country before departure',
    prerequisiteTaskIds: [],
    isApplicable: (answers) => answers.journey_stage !== 'already_abroad',
    computeContextKey: (answers) => `docs:vital|stage:${answers.journey_stage || 'gen'}`
  },

  // 3. Housing in Destination (General)
  {
    id: 'gen_housing_preparation',
    title: (answers) => {
      const country = answers.destination_country && 'name' in answers.destination_country 
        ? answers.destination_country.name 
        : 'destination'
      return answers.preparation_status?.includes('housing')
        ? `Confirm arrival logistics with your housing provider in ${country}`
        : `Research ${country} rental customs and secure verified temporary lodging`
    },
    action: (answers) => {
      const country = answers.destination_country && 'name' in answers.destination_country 
        ? answers.destination_country.name 
        : 'your destination'
      if (answers.preparation_status?.includes('housing')) {
        return `Confirm move-in dates, key handover protocols, utility connection policies, and security deposit terms with your accommodation provider in ${country}.`
      }
      return `Learn typical lease agreements, tenant rights, and upfront deposit rules in ${country}. Book verified temporary accommodation (such as a licensed serviced apartment or hotel) for your initial 2–4 weeks to inspect permanent homes in person.`
    },
    category: 'housing',
    phase: 'before_departure',
    whyItAppears: (answers) => answers.preparation_status?.includes('housing')
      ? 'You indicated having housing arranged. Confirming arrival timing, keys, and inventory protocols prevents last-minute access hurdles.'
      : 'Securing temporary accommodation avoids remote rental fraud and provides an immediate local base while searching for a long-term home.',
    isDestinationSpecific: false,
    suggestedTiming: () => 'Suggested: Confirm arrival logistics and secure temporary housing before departure',
    prerequisiteTaskIds: [],
    isApplicable: (answers) => {
      const isSpecific = Boolean(answers.destination_country && 'code' in answers.destination_country && answers.destination_country.code)
      const hasPack = (answers.destination_country?.code === 'DE' || answers.destination_country?.code === 'CA') && answers.relocation_purpose === 'study'
      return isSpecific && !hasPack && answers.journey_stage !== 'already_abroad'
    },
    computeContextKey: (answers) => `dest:${answers.destination_country?.code || 'none'}|housing:${answers.preparation_status?.includes('housing') ? 'arranged' : 'none'}|city:${answers.destination_city?.cityName || 'undecided'}`
  },

  // 4. Transitional Health & Travel Insurance (General)
  {
    id: 'gen_travel_health_insurance',
    title: 'Arrange transitional international health and travel coverage',
    action: (answers) => {
      if (answers.preparation_status?.includes('insurance')) {
        return 'Verify that your existing insurance covers medical repatriation, emergency hospitalization, and pre-existing conditions until you are officially enrolled in local healthcare.'
      }
      return 'Obtain international health and travel insurance that takes effect on your departure date and covers medical evacuation, emergency inpatient care, and travel delays until local coverage begins.'
    },
    category: 'insurance',
    phase: 'before_departure',
    whyItAppears: (answers) => answers.preparation_status?.includes('insurance')
      ? 'You indicated having insurance arranged. Healthcare access rules differ widely between nations, so confirming policy dates, coverage minimums, and exclusions ensures no coverage gaps during transit.'
      : 'Foreign healthcare systems can be extraordinarily expensive for uninsured newcomers. Transitional travel medical coverage protects against emergency medical expenses from day one.',
    isDestinationSpecific: false,
    resourceIds: ['gen_who_travel_health'],
    suggestedTiming: () => 'Suggested: Arrange coverage effective from your departure date',
    prerequisiteTaskIds: [],
    isApplicable: (answers) => {
      const hasPack = (answers.destination_country?.code === 'DE' || answers.destination_country?.code === 'CA') && answers.relocation_purpose === 'study'
      return !hasPack && answers.journey_stage !== 'already_abroad'
    },
    computeContextKey: (answers) => `ins:${answers.preparation_status?.includes('insurance') ? 'arranged' : 'none'}`
  },

  // 5. Financial & Banking Setup (General)
  {
    id: 'gen_financial_banking_setup',
    title: 'Prepare low-fee international payment methods and notify your bank',
    action: (answers) => {
      const budgetText = answers.living_budget?.amount 
        ? ` aligned with your ${answers.living_budget.currency} ${answers.living_budget.amount.toLocaleString()} estimated monthly budget`
        : ''
      return `Notify your domestic bank of upcoming international relocation, obtain low-fee international payment methods (such as multi-currency accounts or cards with zero foreign exchange fees), and ensure access to initial transition reserves${budgetText}.`
    },
    category: 'budget',
    phase: 'before_departure',
    whyItAppears: () => 'Setting up a local bank account in a new country can take several days or weeks after arrival. Having reliable, low-fee foreign payment methods guarantees access to funds upon landing.',
    isDestinationSpecific: false,
    suggestedTiming: () => 'Suggested: Notify bank and set up travel payment methods prior to departure',
    prerequisiteTaskIds: [],
    isApplicable: (answers) => {
      const hasPack = (answers.destination_country?.code === 'DE' || answers.destination_country?.code === 'CA') && answers.relocation_purpose === 'study'
      return !hasPack && answers.journey_stage !== 'already_abroad'
    },
    computeContextKey: (answers) => `bgt:${answers.living_budget?.amount || 'none'}|curr:${answers.living_budget?.currency || 'none'}`
  },

  // 6. Customs & Luggage Packing
  {
    id: 'gen_customs_packing',
    title: 'Review destination customs duty allowances and pack essential luggage',
    action: (answers) => {
      const country = answers.destination_country && 'name' in answers.destination_country 
        ? answers.destination_country.name 
        : 'destination'
      return `Check ${country} border customs declarations for prescription medications, electronics, and currency limits. Pack essential documents, transitional clothing, and adapter plugs in your carry-on bag.`
    },
    category: 'travel',
    phase: 'before_departure',
    whyItAppears: () => 'Customs regulations on restricted personal goods, medication allowances, and duty exemptions vary by country. Packing critical documents in carry-on prevents issues if checked baggage is delayed.',
    isDestinationSpecific: false,
    resourceIds: ['gen_who_travel_health', 'gen_iata_travel_centre'],
    suggestedTiming: () => 'Suggested: Review customs guidelines and pack essential carry-on items before travel',
    prerequisiteTaskIds: [],
    isApplicable: (answers) => answers.journey_stage !== 'already_abroad',
    computeContextKey: (answers) => `dest:${answers.destination_country?.code || 'gen'}|packing`
  },

  // 7. Arrival Municipal Registration (General)
  {
    id: 'gen_arrival_registration',
    title: (answers) => {
      const country = answers.destination_country && 'name' in answers.destination_country 
        ? answers.destination_country.name 
        : 'destination'
      return `Complete local residence registration and immigration reporting in ${country}`
    },
    action: (answers) => {
      const country = answers.destination_country && 'name' in answers.destination_country 
        ? answers.destination_country.name 
        : 'your destination'
      return `Visit the local municipal office, town hall, or immigration reporting center in ${country} to formally register your address and initiate local tax or healthcare registration.`
    },
    category: 'arrival',
    phase: 'arrival_settling',
    whyItAppears: () => 'Most countries mandate official residency registration shortly after taking up physical residence. Your registration proof is essential for opening bank accounts and legal residency confirmation.',
    isDestinationSpecific: false,
    suggestedTiming: () => 'Suggested: Check local reporting deadlines upon arrival in your destination municipality',
    prerequisiteTaskIds: [],
    isApplicable: (answers) => {
      const isSpecific = Boolean(answers.destination_country && 'code' in answers.destination_country && answers.destination_country.code)
      const hasPack = (answers.destination_country?.code === 'DE' || answers.destination_country?.code === 'CA') && answers.relocation_purpose === 'study'
      return isSpecific && !hasPack
    },
    computeContextKey: (answers) => `dest:${answers.destination_country?.code || 'none'}|city:${answers.destination_city?.cityName || 'undecided'}|reg`
  }
]
