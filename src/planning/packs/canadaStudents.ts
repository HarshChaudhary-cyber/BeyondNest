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
    OFFICIAL_RESOURCES.ca_ircc_financial_support,
    OFFICIAL_RESOURCES.ca_ircc_pal_guidance,
    OFFICIAL_RESOURCES.ca_ircc_border_arrival,
    OFFICIAL_RESOURCES.ca_educanada_portal,
    OFFICIAL_RESOURCES.ca_university_international_guide
  ],
  taskTemplates: [
    // 1. DLI Acceptance & Check PAL/TAL
    {
      id: 'ca_stu_dli_acceptance',
      title: (answers) => answers.university_name?.name 
        ? `Accept offer from ${answers.university_name.name} and check whether you need a Provincial Attestation Letter (PAL) or TAL` 
        : 'Accept offer from Designated Learning Institution (DLI) and check whether you need a Provincial Attestation Letter (PAL) or TAL',
      action: (answers) => `Confirm your offer of admission${answers.university_name?.name ? ` with ${answers.university_name.name}` : ''}, submit required tuition deposits, and consult official IRCC guidance to determine whether your program requires a Provincial Attestation Letter (PAL) or Territorial Attestation Letter (TAL), or if your study level (e.g. master's or doctoral degree) qualifies for an exemption.`,
      category: 'paperwork',
      phase: 'start_here',
      whyItAppears: () => 'IRCC requires most post-secondary study permit applicants to include a PAL or TAL from the province or territory where they study, with specific exemptions defined by federal regulations.',
      isDestinationSpecific: true,
      destinationCountry: 'CA',
      resourceIds: ['ca_ircc_pal_guidance', 'ca_educanada_portal'],
      suggestedTiming: () => 'Suggested: Follow the acceptance and deposit deadline stated in your DLI offer letter',
      prerequisiteTaskIds: [],
      isApplicable: (answers) => answers.destination_country?.code === 'CA' && answers.relocation_purpose === 'study' && answers.journey_stage !== 'already_abroad',
      computeContextKey: (answers) => `dest:CA|purp:study|uni:${answers.university_name?.name || 'undecided'}`
    },

    // 2. Financial Proof (No SDS, no hardcoded $20,635 figure)
    {
      id: 'ca_stu_financial_proof',
      title: 'Check IRCC financial support tables and gather proof of funds',
      action: (answers) => {
        const budgetNote = answers.living_budget?.amount 
          ? ` (your estimated monthly budget is ${answers.living_budget.currency} ${answers.living_budget.amount.toLocaleString()})`
          : ''
        return `Review IRCC's official financial requirements table to determine the exact living cost funds required for your study level and family size (separate from tuition fees). Assemble qualifying documentation such as bank statements, a Guaranteed Investment Certificate (GIC), scholarship award letters, or proof of paid tuition${budgetNote}.`
      },
      category: 'budget',
      phase: 'start_here',
      whyItAppears: () => 'IRCC mandates that international students demonstrate sufficient funds to pay for tuition, living costs for themselves and accompanying family members, and return transportation. Consult the official IRCC tables for current benchmarks.',
      isDestinationSpecific: true,
      destinationCountry: 'CA',
      resourceIds: ['ca_ircc_financial_support'],
      suggestedTiming: () => 'Suggested: Assemble financial documents before submitting your study permit application',
      prerequisiteTaskIds: ['ca_stu_dli_acceptance'],
      isApplicable: (answers) => answers.destination_country?.code === 'CA' && answers.relocation_purpose === 'study' && answers.journey_stage !== 'already_abroad',
      computeContextKey: (answers) => `dest:CA|purp:study|bgt:${answers.living_budget?.amount || 'est'}`
    },

    // 3. Study Permit Application (Applicability check)
    {
      id: 'ca_stu_study_permit_application',
      title: 'Determine study permit requirements and submit online application to IRCC if applicable',
      action: (answers) => {
        if (answers.preparation_status?.includes('visa_permission')) {
          return 'Track your IRCC application status, verify receipt of your Port of Entry (POE) Letter of Introduction, and ensure your passport carries the required counterfoil visa sticker or electronic Travel Authorization (eTA).'
        }
        return 'Check whether your program length (more than 6 months) and circumstances require a study permit. If required, complete your online application via the IRCC secure portal with your DLI acceptance letter, PAL/TAL (or exemption proof), and financial documents, then book your biometric appointment.'
      },
      category: 'paperwork',
      phase: 'before_departure',
      whyItAppears: (answers) => answers.preparation_status?.includes('visa_permission')
        ? 'You indicated having applied for or received permission. Ensure your Port of Entry Letter of Introduction is formally issued, as an application in progress does not constitute entry approval.'
        : 'A study permit is generally mandatory for academic programs longer than six months in Canada. Processing times vary by country of residence.',
      isDestinationSpecific: true,
      destinationCountry: 'CA',
      resourceIds: ['ca_ircc_study_permit'],
      suggestedTiming: () => 'Suggested: Apply as early as possible after receiving your acceptance and PAL/TAL; check current IRCC processing times for your location before booking non-refundable travel',
      prerequisiteTaskIds: ['ca_stu_dli_acceptance', 'ca_stu_financial_proof'],
      isApplicable: (answers) => answers.destination_country?.code === 'CA' && answers.relocation_purpose === 'study' && answers.journey_stage !== 'already_abroad',
      computeContextKey: (answers) => `dest:CA|purp:study|visa:${answers.preparation_status?.includes('visa_permission') ? 'in_progress' : 'unapplied'}`
    },

    // 4. Health Insurance (Provincial and institutional differences)
    {
      id: 'ca_stu_health_insurance',
      title: 'Verify university and provincial health coverage requirements',
      action: (answers) => {
        if (answers.preparation_status?.includes('insurance')) {
          return 'Verify whether your existing policy meets mandatory university requirements, or if enrollment in your institution plan (e.g. UHIP in Ontario) is compulsory upon arrival.'
        }
        return 'Check health insurance rules for your institution and province (e.g. UHIP in Ontario, MSP in British Columbia, or institutional plans), and arrange emergency travel bridge coverage for travel days.'
      },
      category: 'insurance',
      phase: 'before_departure',
      whyItAppears: (answers) => answers.preparation_status?.includes('insurance')
        ? 'You indicated having insurance arranged. In Canada, healthcare is provincially governed, and universities typically require automatic enrollment in institutional plans regardless of private travel policies.'
        : 'Healthcare in Canada is provincially administered and foreign visitors are not covered by standard provincial Medicare upon arrival. Universities mandate comprehensive health coverage.',
      isDestinationSpecific: true,
      destinationCountry: 'CA',
      resourceIds: ['ca_university_international_guide'],
      suggestedTiming: () => 'Suggested: Confirm institutional health plan enrollment and arrange travel coverage prior to flight',
      prerequisiteTaskIds: ['ca_stu_dli_acceptance'],
      isApplicable: (answers) => answers.destination_country?.code === 'CA' && answers.relocation_purpose === 'study' && answers.journey_stage !== 'already_abroad',
      computeContextKey: (answers) => `dest:CA|purp:study|ins:${answers.preparation_status?.includes('insurance') ? 'arranged' : 'none'}`
    },

    // 5. Housing in Canada
    {
      id: 'ca_stu_housing_search',
      title: 'Apply for campus residence or secure verified temporary accommodation',
      action: (answers) => {
        if (answers.preparation_status?.includes('housing')) {
          return 'Confirm your lease or residence move-in date, review tenancy agreement rights, and arrange airport transit to your accommodation.'
        }
        return `Check university residence application deadlines, or reserve verified temporary accommodation (such as a serviced apartment or hotel)${answers.destination_city?.cityName ? ` in ${answers.destination_city.cityName}` : ''} for your initial 2–3 weeks to view long-term rentals in person.`
      },
      category: 'housing',
      phase: 'before_departure',
      whyItAppears: (answers) => answers.preparation_status?.includes('housing')
        ? 'You indicated housing is arranged. Confirming your lease documents and airport transit ensures a smooth arrival.'
        : 'Rental markets in Canadian metropolitan and university areas can be competitive. Temporary housing allows you to view apartments in person and avoid rental fraud.',
      isDestinationSpecific: true,
      destinationCountry: 'CA',
      resourceIds: ['ca_university_international_guide', 'ca_educanada_portal'],
      suggestedTiming: () => 'Suggested: Begin housing search once admitted; secure temporary lodging prior to departure',
      prerequisiteTaskIds: [],
      isApplicable: (answers) => answers.destination_country?.code === 'CA' && answers.relocation_purpose === 'study',
      computeContextKey: (answers) => `dest:CA|purp:study|housing:${answers.preparation_status?.includes('housing') ? 'arranged' : 'none'}|city:${answers.destination_city?.cityName || 'undecided'}`
    },

    // 6. Border Entry Preparation (Excluded if already abroad)
    {
      id: 'ca_stu_border_entry',
      title: 'Prepare port of entry documents for CBSA border processing',
      action: () => 'Carry original physical printouts of your IRCC Port of Entry Letter of Introduction, DLI Letter of Acceptance, proof of financial support, and passport in your carry-on luggage for the examining CBSA border services officer.',
      category: 'arrival',
      phase: 'arrival_settling',
      whyItAppears: () => 'Your physical study permit is issued by an immigration officer at your first Canadian port of entry airport, not mailed beforehand.',
      isDestinationSpecific: true,
      destinationCountry: 'CA',
      resourceIds: ['ca_ircc_border_arrival'],
      suggestedTiming: () => 'Suggested: Travel day / upon landing at your first Canadian airport of arrival',
      prerequisiteTaskIds: ['ca_stu_study_permit_application'],
      isApplicable: (answers) => answers.destination_country?.code === 'CA' && answers.relocation_purpose === 'study' && answers.journey_stage !== 'already_abroad',
      computeContextKey: (_answers) => `dest:CA|purp:study|border`
    },

    // 7. Social Insurance Number (SIN)
    {
      id: 'ca_stu_sin_number',
      title: 'Apply for your Social Insurance Number (SIN) with Service Canada',
      action: () => 'Take your passport and physical study permit to a Service Canada Centre or apply online to obtain your 9-digit Social Insurance Number (SIN).',
      category: 'arrival',
      phase: 'arrival_settling',
      whyItAppears: () => 'A Social Insurance Number (SIN) is required to work in Canada (on or off campus), receive university stipends, and file income tax returns.',
      isDestinationSpecific: true,
      destinationCountry: 'CA',
      resourceIds: ['ca_university_international_guide'],
      suggestedTiming: () => 'Suggested: Soon after arrival to enable on/off-campus employment and tax registration',
      prerequisiteTaskIds: ['ca_stu_border_entry'],
      isApplicable: (answers) => answers.destination_country?.code === 'CA' && answers.relocation_purpose === 'study',
      computeContextKey: (_answers) => `dest:CA|purp:study|sin`
    },

    // 8. Canadian Bank Account
    {
      id: 'ca_stu_canadian_bank',
      title: 'Open a Canadian student bank account and deposit funds',
      action: () => 'Visit a Canadian financial institution with your passport and study permit to set up a student checking account, set up Interac e-Transfers, and arrange any fund disbursements.',
      category: 'budget',
      phase: 'arrival_settling',
      whyItAppears: () => 'A local bank account avoids costly foreign exchange fees on everyday purchases, rent Interac e-Transfers, and mobile phone plans.',
      isDestinationSpecific: true,
      destinationCountry: 'CA',
      resourceIds: ['ca_university_international_guide'],
      suggestedTiming: () => 'Suggested: Early during your settling-in period to avoid foreign card transaction fees',
      prerequisiteTaskIds: ['ca_stu_border_entry'],
      isApplicable: (answers) => answers.destination_country?.code === 'CA' && answers.relocation_purpose === 'study',
      computeContextKey: (_answers) => `dest:CA|purp:study|bank`
    }
  ]
}
