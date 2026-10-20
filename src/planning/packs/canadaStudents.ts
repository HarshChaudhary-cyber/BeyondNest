import type { DestinationPack } from '../types'
import { OFFICIAL_RESOURCES } from '../resources'

export const canadaStudentsPack: DestinationPack = {
  id: 'pack_canada_students',
  destinationCountry: 'CA',
  purpose: 'study',
  title: 'Canada — International Student Preparation Pack',
  description: 'Curated official preparation tasks and verified statutory requirements for international students moving to Canada.',
  resources: [
    OFFICIAL_RESOURCES.ca_ircc_study_permit,
    OFFICIAL_RESOURCES.ca_ircc_border_arrival,
    OFFICIAL_RESOURCES.ca_educanada_portal,
    OFFICIAL_RESOURCES.ca_university_international_guide
  ],
  taskTemplates: [
    // 1. DLI Acceptance & PAL
    {
      id: 'ca_stu_dli_acceptance',
      title: (answers) => answers.university_name?.name 
        ? `Accept offer from ${answers.university_name.name} and secure Provincial Attestation Letter (PAL)` 
        : 'Accept offer from Designated Learning Institution (DLI) and obtain Provincial Attestation Letter (PAL)',
      action: (answers) => `Confirm your acceptance offer${answers.university_name?.name ? ` with ${answers.university_name.name}` : ''}, submit tuition deposit, and request your official Provincial Attestation Letter (PAL) required for study permit processing.`,
      category: 'paperwork',
      phase: 'start_here',
      whyItAppears: () => 'IRCC requires both an official Letter of Acceptance from an approved Designated Learning Institution (DLI) and a provincial attestation letter (PAL) before processing study permit applications.',
      isDestinationSpecific: true,
      destinationCountry: 'CA',
      resourceIds: ['ca_ircc_study_permit', 'ca_educanada_portal'],
      suggestedTiming: () => 'Suggested: Immediately upon offer receipt (4–6 months prior to session start)',
      prerequisiteTaskIds: [],
      isApplicable: (answers) => answers.destination_country?.code === 'CA' && answers.relocation_purpose === 'study' && answers.journey_stage !== 'already_abroad',
      computeContextKey: (answers) => `dest:CA|purp:study|uni:${answers.university_name?.name || 'undecided'}`
    },

    // 2. Financial Proof
    {
      id: 'ca_stu_financial_proof',
      title: 'Assemble IRCC proof of financial support',
      action: (answers) => {
        const budgetNote = answers.living_budget?.amount 
          ? ` (your estimated monthly budget is ${answers.living_budget.currency} ${answers.living_budget.amount.toLocaleString()})`
          : ''
        return `Gather official bank statements, Guaranteed Investment Certificate (GIC) if using Student Direct Stream, scholarship award letters, or proof of paid tuition to satisfy IRCC minimum financial criteria${budgetNote}.`
      },
      category: 'budget',
      phase: 'start_here',
      whyItAppears: () => 'Canada requires international students to demonstrate sufficient funds to pay for first-year tuition plus federal living expense minimums ($20,635+ for single applicants).',
      isDestinationSpecific: true,
      destinationCountry: 'CA',
      resourceIds: ['ca_ircc_study_permit'],
      suggestedTiming: () => 'Suggested: 3–4 months prior to departure',
      prerequisiteTaskIds: ['ca_stu_dli_acceptance'],
      isApplicable: (answers) => answers.destination_country?.code === 'CA' && answers.relocation_purpose === 'study' && answers.journey_stage !== 'already_abroad',
      computeContextKey: (answers) => `dest:CA|purp:study|bgt:${answers.living_budget?.amount || 'est'}`
    },

    // 3. Study Permit Application
    {
      id: 'ca_stu_study_permit_application',
      title: 'Submit online study permit application to IRCC',
      action: (answers) => {
        if (answers.preparation_status?.includes('visa_permission')) {
          return 'Track your IRCC application status, verify receipt of your Port of Entry Letter of Introduction, and ensure your passport carries the required counterfoil visa or electronic Travel Authorization (eTA).'
        }
        return 'Complete your online application via the IRCC secure account portal, submit your DLI acceptance letter, PAL, financial proof, and book your biometric appointment at a local Visa Application Centre (VAC).'
      },
      category: 'paperwork',
      phase: 'before_departure',
      whyItAppears: (answers) => answers.preparation_status?.includes('visa_permission')
        ? 'You indicated having applied for or received permission. Ensure your Port of Entry Letter of Introduction is issued and stored for border arrival.'
        : 'A study permit is mandatory for any degree program longer than six months in Canada. Processing times vary by country of residence.',
      isDestinationSpecific: true,
      destinationCountry: 'CA',
      resourceIds: ['ca_ircc_study_permit'],
      suggestedTiming: () => 'Suggested: 3–4 months before your intended flight date',
      prerequisiteTaskIds: ['ca_stu_dli_acceptance', 'ca_stu_financial_proof'],
      isApplicable: (answers) => answers.destination_country?.code === 'CA' && answers.relocation_purpose === 'study' && answers.journey_stage !== 'already_abroad',
      computeContextKey: (answers) => `dest:CA|purp:study|visa:${answers.preparation_status?.includes('visa_permission') ? 'in_progress' : 'unapplied'}`
    },

    // 4. Health Insurance
    {
      id: 'ca_stu_health_insurance',
      title: 'Verify university and provincial health coverage (e.g. UHIP)',
      action: (answers) => {
        if (answers.preparation_status?.includes('insurance')) {
          return 'Verify whether your existing policy meets mandatory university requirements, or if enrollment in your institution plan (e.g. UHIP in Ontario) is compulsory upon arrival.'
        }
        return 'Review your Canadian university international health insurance plan (such as UHIP in Ontario or provincial coverage in BC) and arrange emergency travel bridge coverage for transit days.'
      },
      category: 'insurance',
      phase: 'before_departure',
      whyItAppears: (answers) => answers.preparation_status?.includes('insurance')
        ? 'You indicated having insurance arranged. In Canada, healthcare is provincially governed, and universities typically require automatic enrollment in institutional plans regardless of private travel policies.'
        : 'Canada does not offer free healthcare to foreign travelers. Medical treatment without insurance is extremely costly, and Canadian universities require mandatory health plan enrollment.',
      isDestinationSpecific: true,
      destinationCountry: 'CA',
      resourceIds: ['ca_university_international_guide'],
      suggestedTiming: () => 'Suggested: 1 month before departure',
      prerequisiteTaskIds: ['ca_stu_dli_acceptance'],
      isApplicable: (answers) => answers.destination_country?.code === 'CA' && answers.relocation_purpose === 'study' && answers.journey_stage !== 'already_abroad',
      computeContextKey: (answers) => `dest:CA|purp:study|ins:${answers.preparation_status?.includes('insurance') ? 'arranged' : 'none'}`
    },

    // 5. Housing in Canada
    {
      id: 'ca_stu_housing_search',
      title: 'Apply for campus residence or secure verified temporary off-campus accommodation',
      action: (answers) => {
        if (answers.preparation_status?.includes('housing')) {
          return 'Confirm your lease or residence move-in date, review tenancy agreement rights, and arrange airport transit to your accommodation.'
        }
        return `Apply for university student residence deadlines, or reserve verified temporary lodging (serviced flat or hotel)${answers.destination_city?.cityName ? ` in ${answers.destination_city.cityName}` : ''} for your initial 2–3 weeks.`
      },
      category: 'housing',
      phase: 'before_departure',
      whyItAppears: (answers) => answers.preparation_status?.includes('housing')
        ? 'You indicated housing is arranged. Confirming your lease documents and airport transit ensures a smooth arrival.'
        : 'Rental markets in Canadian metropolitan and university areas (e.g. Toronto, Vancouver, Montreal) are competitive. Temporary housing allows you to view apartments in person and avoid rental fraud.',
      isDestinationSpecific: true,
      destinationCountry: 'CA',
      resourceIds: ['ca_university_international_guide', 'ca_educanada_portal'],
      suggestedTiming: () => 'Suggested: 2–3 months before arrival',
      prerequisiteTaskIds: [],
      isApplicable: (answers) => answers.destination_country?.code === 'CA' && answers.relocation_purpose === 'study',
      computeContextKey: (answers) => `dest:CA|purp:study|housing:${answers.preparation_status?.includes('housing') ? 'arranged' : 'none'}|city:${answers.destination_city?.cityName || 'undecided'}`
    },

    // 6. Border Entry Preparation
    {
      id: 'ca_stu_border_entry',
      title: 'Prepare port of entry documents for CBSA border processing',
      action: () => 'Carry original physical printouts of your IRCC Port of Entry Letter of Introduction, DLI Letter of Acceptance, proof of financial support, and passport in your carry-on luggage for the examining CBSA border services officer.',
      category: 'arrival',
      phase: 'arrival_settling',
      whyItAppears: () => 'Your actual physical study permit is printed by an immigration officer at your first Canadian port of entry airport, not mailed beforehand.',
      isDestinationSpecific: true,
      destinationCountry: 'CA',
      resourceIds: ['ca_ircc_border_arrival'],
      suggestedTiming: () => 'Suggested: Travel day / upon landing at Canadian port of entry',
      prerequisiteTaskIds: ['ca_stu_study_permit_application'],
      isApplicable: (answers) => answers.destination_country?.code === 'CA' && answers.relocation_purpose === 'study',
      computeContextKey: (_answers) => `dest:CA|purp:study|border`
    },

    // 7. Social Insurance Number (SIN)
    {
      id: 'ca_stu_sin_number',
      title: 'Apply for your Social Insurance Number (SIN) at Service Canada',
      action: () => 'Take your passport and physical study permit to a Service Canada Centre or apply online to obtain your 9-digit Social Insurance Number (SIN).',
      category: 'arrival',
      phase: 'arrival_settling',
      whyItAppears: () => 'A Social Insurance Number (SIN) is legally required to work in Canada (on or off campus), receive university student stipends, and file income tax returns.',
      isDestinationSpecific: true,
      destinationCountry: 'CA',
      resourceIds: ['ca_university_international_guide'],
      suggestedTiming: () => 'Suggested: Within your first 10 days of arrival',
      prerequisiteTaskIds: ['ca_stu_border_entry'],
      isApplicable: (answers) => answers.destination_country?.code === 'CA' && answers.relocation_purpose === 'study',
      computeContextKey: (_answers) => `dest:CA|purp:study|sin`
    },

    // 8. Canadian Bank Account
    {
      id: 'ca_stu_canadian_bank',
      title: 'Open a Canadian student bank account and deposit funds',
      action: () => 'Book an appointment at a major Canadian bank with your passport and study permit to set up a no-fee student checking account and access any GIC disbursements.',
      category: 'budget',
      phase: 'arrival_settling',
      whyItAppears: () => 'A local bank account avoids costly foreign exchange fees on everyday purchases, rent Interac e-Transfers, and mobile phone plans.',
      isDestinationSpecific: true,
      destinationCountry: 'CA',
      resourceIds: ['ca_university_international_guide'],
      suggestedTiming: () => 'Suggested: Within your first week of arrival',
      prerequisiteTaskIds: ['ca_stu_border_entry'],
      isApplicable: (answers) => answers.destination_country?.code === 'CA' && answers.relocation_purpose === 'study',
      computeContextKey: (_answers) => `dest:CA|purp:study|bank`
    }
  ]
}
