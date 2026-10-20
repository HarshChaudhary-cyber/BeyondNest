import type { DestinationPack } from '../types'
import { OFFICIAL_RESOURCES } from '../resources'

export const germanyStudentsPack: DestinationPack = {
  id: 'pack_germany_students',
  destinationCountry: 'DE',
  purpose: 'study',
  title: 'Germany — International Student Preparation Pack',
  description: 'Curated official preparation tasks and verified statutory requirements for international students moving to Germany.',
  resources: [
    OFFICIAL_RESOURCES.de_daad_admission,
    OFFICIAL_RESOURCES.de_make_it_in_germany_study_visa,
    OFFICIAL_RESOURCES.de_auswaertiges_amt_visa,
    OFFICIAL_RESOURCES.de_dsw_student_housing
  ],
  taskTemplates: [
    // 1. Admission Offer & Enrolment
    {
      id: 'de_stu_admission_acceptance',
      title: (answers) => answers.university_name?.name 
        ? `Confirm admission and complete enrolment at ${answers.university_name.name}` 
        : 'Confirm university admission offer and submit formal enrolment (Immatrikulation)',
      action: (answers) => `Verify your letter of admission (Zulassungsbescheid)${answers.university_name?.name ? ` from ${answers.university_name.name}` : ''}, pay the mandatory semester fee (Semesterbeitrag), and submit required certified documents before the enrolment deadline.`,
      category: 'paperwork',
      phase: 'start_here',
      whyItAppears: () => 'Formal university admission in Germany is the mandatory legal prerequisite before you can apply for a national student visa or open a blocked account.',
      isDestinationSpecific: true,
      destinationCountry: 'DE',
      resourceIds: ['de_daad_admission'],
      suggestedTiming: () => 'Suggested: Immediately upon receiving your admission letter (typically 3–5 months before semester start)',
      prerequisiteTaskIds: [],
      isApplicable: (answers) => answers.destination_country?.code === 'DE' && answers.relocation_purpose === 'study' && answers.journey_stage !== 'already_abroad',
      computeContextKey: (answers) => `dest:DE|purp:study|uni:${answers.university_name?.name || 'undecided'}`
    },

    // 2. Blocked Account / Proof of Financial Resources
    {
      id: 'de_stu_blocked_account',
      title: 'Set up German proof of financial resources (Blocked Account / Sperrkonto)',
      action: (answers) => {
        const budgetText = answers.living_budget?.amount 
          ? ` (your estimated monthly budget is ${answers.living_budget.currency} ${answers.living_budget.amount.toLocaleString()})`
          : ''
        return `Open a federally certified blocked account (Sperrkonto) with a recognized provider or secure an official formal obligation (Verpflichtungserklärung) to satisfy the statutory annual living cost requirement${budgetText}.`
      },
      category: 'budget',
      phase: 'start_here',
      whyItAppears: () => 'German immigration law requires all non-EU/EEA international students to prove adequate financial resources for their first year of study before issuing a student visa.',
      isDestinationSpecific: true,
      destinationCountry: 'DE',
      resourceIds: ['de_make_it_in_germany_study_visa'],
      suggestedTiming: () => 'Suggested: 2–3 months before your scheduled visa appointment',
      prerequisiteTaskIds: ['de_stu_admission_acceptance'],
      isApplicable: (answers) => answers.destination_country?.code === 'DE' && answers.relocation_purpose === 'study' && answers.journey_stage !== 'already_abroad',
      computeContextKey: (answers) => `dest:DE|purp:study|bgt:${answers.living_budget?.amount || 'est'}`
    },

    // 3. Health Insurance
    {
      id: 'de_stu_health_insurance',
      title: 'Obtain statutory German student health insurance (Gesetzliche Krankenversicherung)',
      action: (answers) => {
        if (answers.preparation_status?.includes('insurance')) {
          return 'Contact a German statutory health insurance fund (e.g. TK, Barmer, AOK) to submit your existing insurance details and receive your electronic insurance certificate (M10) for university enrolment.'
        }
        return 'Enroll with a German public health insurance provider (Krankenkasse) or obtain an official exemption certificate if you hold eligible statutory European health coverage (EHIC).'
      },
      category: 'insurance',
      phase: 'before_departure',
      whyItAppears: (answers) => answers.preparation_status?.includes('insurance')
        ? 'You indicated having insurance arranged. In Germany, university enrolment requires statutory electronic reporting (M10 notification) from a German public health insurance provider confirming your coverage meets federal mandates.'
        : 'German federal law mandates that all enrolled university students have comprehensive health insurance coverage. Proof of insurance is required for both visa issuance and university enrolment.',
      isDestinationSpecific: true,
      destinationCountry: 'DE',
      resourceIds: ['de_make_it_in_germany_study_visa'],
      suggestedTiming: () => 'Suggested: 1–2 months prior to visa interview and enrolment',
      prerequisiteTaskIds: ['de_stu_admission_acceptance'],
      isApplicable: (answers) => answers.destination_country?.code === 'DE' && answers.relocation_purpose === 'study' && answers.journey_stage !== 'already_abroad',
      computeContextKey: (answers) => `dest:DE|purp:study|ins:${answers.preparation_status?.includes('insurance') ? 'arranged' : 'none'}`
    },

    // 4. Visa Application
    {
      id: 'de_stu_visa_application',
      title: 'Schedule and attend national student visa appointment (Visum zu Studienzwecken)',
      action: (answers) => {
        if (answers.preparation_status?.includes('visa_permission')) {
          return 'Verify your visa approval notice, check entry validity windows on your visa sticker, and assemble physical originals of your admission letter and blocked account confirmation for border inspection.'
        }
        return 'Book a national visa appointment at your local German embassy, consulate, or official partner centre (e.g. VFS/TLScontact), compile your application dossier, and submit biometric data.'
      },
      category: 'paperwork',
      phase: 'before_departure',
      whyItAppears: (answers) => answers.preparation_status?.includes('visa_permission')
        ? 'You noted having applied for or received permission. Ensure your visa is formally issued, check valid entry dates, and pack supporting paperwork for entry border control.'
        : 'Third-country nationals intending to study in Germany require a national category D entry visa before arrival. Processing times vary widely by consular post.',
      isDestinationSpecific: true,
      destinationCountry: 'DE',
      resourceIds: ['de_auswaertiges_amt_visa', 'de_make_it_in_germany_study_visa'],
      suggestedTiming: () => 'Suggested: 2–3 months before target relocation date',
      prerequisiteTaskIds: ['de_stu_admission_acceptance', 'de_stu_blocked_account', 'de_stu_health_insurance'],
      isApplicable: (answers) => answers.destination_country?.code === 'DE' && answers.relocation_purpose === 'study' && answers.journey_stage !== 'already_abroad',
      computeContextKey: (answers) => `dest:DE|purp:study|visa:${answers.preparation_status?.includes('visa_permission') ? 'in_progress' : 'unapplied'}`
    },

    // 5. Housing in Germany
    {
      id: 'de_stu_housing_search',
      title: 'Apply for Studierendenwerk halls of residence and secure temporary accommodation',
      action: (answers) => {
        const cityText = answers.destination_city?.cityName ? ` in ${answers.destination_city.cityName}` : ''
        if (answers.preparation_status?.includes('housing')) {
          return `Confirm your tenancy agreement, key collection arrangements${cityText}, and obtain the mandatory landlord confirmation slip (Wohnungsgeberbestätigung) needed for municipal registration.`
        }
        return `Submit online applications for local Studierendenwerk student halls immediately${cityText}, and book verified temporary accommodation (such as a hostel, serviced flat, or interim sublet) for your initial 2–4 weeks.`
      },
      category: 'housing',
      phase: 'before_departure',
      whyItAppears: (answers) => answers.preparation_status?.includes('housing')
        ? 'You indicated housing is arranged. In Germany, landlords must provide a formal Wohnungsgeberbestätigung form confirming your move-in date for city registration.'
        : 'Student housing in German university cities is in extremely high demand. Arranging verified temporary accommodation gives you a legal base to inspect long-term flatshares (WGs) in person and avoid online rental scams.',
      isDestinationSpecific: true,
      destinationCountry: 'DE',
      resourceIds: ['de_dsw_student_housing'],
      suggestedTiming: () => 'Suggested: Immediately upon receiving university offer / 2–3 months before arrival',
      prerequisiteTaskIds: [],
      isApplicable: (answers) => answers.destination_country?.code === 'DE' && answers.relocation_purpose === 'study',
      computeContextKey: (answers) => `dest:DE|purp:study|housing:${answers.preparation_status?.includes('housing') ? 'arranged' : 'none'}|city:${answers.destination_city?.cityName || 'undecided'}`
    },

    // 6. Address Registration (Anmeldung)
    {
      id: 'de_stu_anmeldung_city_reg',
      title: 'Complete mandatory municipal address registration (Anmeldung beim Bürgeramt)',
      action: () => 'Book an appointment at your local citizens registration office (Bürgeramt/Bürgerbüro) and bring your passport, lease agreement, and landlord confirmation slip (Wohnungsgeberbestätigung) to register within 14 days of moving into an address.',
      category: 'arrival',
      phase: 'arrival_settling',
      whyItAppears: () => 'Under the German Federal Act on Registration (Bundesmeldegesetz), all residents must register their address within 14 days of moving in. Your registration certificate (Meldebestätigung) is required to open a bank account, get a tax ID, and apply for a residence permit.',
      isDestinationSpecific: true,
      destinationCountry: 'DE',
      resourceIds: ['de_dsw_student_housing'],
      suggestedTiming: () => 'Suggested: Within first 14 days after moving into permanent accommodation',
      prerequisiteTaskIds: ['de_stu_housing_search'],
      isApplicable: (answers) => answers.destination_country?.code === 'DE' && answers.relocation_purpose === 'study',
      computeContextKey: (answers) => `dest:DE|purp:study|city:${answers.destination_city?.cityName || 'undecided'}`
    },

    // 7. Local Bank Checking Account
    {
      id: 'de_stu_bank_account',
      title: 'Open a German checking account (Girokonto) and unlock blocked account disbursements',
      action: () => 'Open a student checking account at a German retail or direct bank with your passport and Meldebestätigung, then submit your new IBAN to your blocked account provider to initiate monthly allowance disbursements.',
      category: 'budget',
      phase: 'arrival_settling',
      whyItAppears: () => 'German recurring payments—including monthly rent, health insurance contributions, mobile contracts, and blocked account payouts—operate through direct SEPA debit from a German Girokonto.',
      isDestinationSpecific: true,
      destinationCountry: 'DE',
      resourceIds: ['de_make_it_in_germany_study_visa'],
      suggestedTiming: () => 'Suggested: Within your first 2 weeks after municipal registration',
      prerequisiteTaskIds: ['de_stu_anmeldung_city_reg'],
      isApplicable: (answers) => answers.destination_country?.code === 'DE' && answers.relocation_purpose === 'study',
      computeContextKey: (_answers) => `dest:DE|purp:study|bank`
    },

    // 8. Electronic Residence Permit (Aufenthaltstitel)
    {
      id: 'de_stu_residence_permit',
      title: 'Apply for your electronic student residence permit (Aufenthaltstitel) at Ausländerbehörde',
      action: () => 'Schedule an in-person appointment with your local immigration authority (Ausländerbehörde) before your entry visa expires to convert your visa into a multi-year electronic residence title (eAT).',
      category: 'paperwork',
      phase: 'arrival_settling',
      whyItAppears: () => 'German entry visas are issued for 3 to 6 months. International students must apply for a formal student residence permit (§ 16b AufenthG) for the duration of their degree studies.',
      isDestinationSpecific: true,
      destinationCountry: 'DE',
      resourceIds: ['de_make_it_in_germany_study_visa'],
      suggestedTiming: () => 'Suggested: 4–6 weeks after arrival, well before your entry visa expires',
      prerequisiteTaskIds: ['de_stu_anmeldung_city_reg', 'de_stu_bank_account'],
      isApplicable: (answers) => answers.destination_country?.code === 'DE' && answers.relocation_purpose === 'study',
      computeContextKey: (_answers) => `dest:DE|purp:study|residence`
    }
  ]
}
