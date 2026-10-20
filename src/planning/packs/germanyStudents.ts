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
      action: (answers) => `Verify your letter of admission (Zulassungsbescheid)${answers.university_name?.name ? ` from ${answers.university_name.name}` : ''}, pay the mandatory semester contribution (Semesterbeitrag), and submit required certified documents before the enrolment deadline.`,
      category: 'paperwork',
      phase: 'start_here',
      whyItAppears: () => 'Formal university admission in Germany is the necessary prerequisite before you can confirm enrolment, obtain health insurance notifications, or apply for a student visa.',
      isDestinationSpecific: true,
      destinationCountry: 'DE',
      resourceIds: ['de_daad_admission'],
      suggestedTiming: () => 'Suggested: Follow the deadline specified in your admission offer (Zulassungsbescheid)',
      prerequisiteTaskIds: [],
      isApplicable: (answers) => answers.destination_country?.code === 'DE' && answers.relocation_purpose === 'study' && answers.journey_stage !== 'already_abroad',
      computeContextKey: (answers) => `dest:DE|purp:study|uni:${answers.university_name?.name || 'undecided'}`
    },

    // 2. Proof of Financial Resources (Applicability check: Blocked Account vs Alternatives)
    {
      id: 'de_stu_blocked_account',
      title: 'Check financial proof requirements for your citizenship and circumstances',
      action: (answers) => {
        const budgetText = answers.living_budget?.amount 
          ? ` (your estimated monthly budget is ${answers.living_budget.currency} ${answers.living_budget.amount.toLocaleString()})`
          : ''
        return `Verify which proof of financial resources applies to you: while many non-EU/EEA students open a blocked account (Sperrkonto), recognized scholarships (e.g. DAAD), official declarations of commitment (Verpflichtungserklärung), or parental income records may also satisfy requirements${budgetText}. EU/EEA citizens do not need a blocked account.`
      },
      category: 'budget',
      phase: 'start_here',
      whyItAppears: () => 'German immigration regulations require non-EU/EEA students to prove adequate financial resources before visa issuance. Different pathways exist depending on citizenship and funding source.',
      isDestinationSpecific: true,
      destinationCountry: 'DE',
      resourceIds: ['de_make_it_in_germany_study_visa'],
      suggestedTiming: () => 'Suggested: Arrange proof of financing before your visa appointment or enrolment deadline',
      prerequisiteTaskIds: ['de_stu_admission_acceptance'],
      isApplicable: (answers) => answers.destination_country?.code === 'DE' && answers.relocation_purpose === 'study' && answers.journey_stage !== 'already_abroad',
      computeContextKey: (answers) => `dest:DE|purp:study|bgt:${answers.living_budget?.amount || 'est'}`
    },

    // 3. Health Insurance (EHIC vs Statutory GKV & M10)
    {
      id: 'de_stu_health_insurance',
      title: 'Verify German student health insurance requirements and obtain electronic notification (M10)',
      action: (answers) => {
        if (answers.preparation_status?.includes('insurance')) {
          return 'Contact a German statutory health insurance provider (Krankenkasse) to submit your existing policy details and ensure they electronically transmit registration notification M10 directly to your university.'
        }
        return 'Confirm your healthcare coverage: students under 30 typically enroll in German statutory health insurance (GKV), while EU/EEA students holding an EHIC can obtain a statutory exemption certificate. In all cases, your insurer must transmit electronic notification M10 directly to your university for enrolment.'
      },
      category: 'insurance',
      phase: 'before_departure',
      whyItAppears: (answers) => answers.preparation_status?.includes('insurance')
        ? 'You indicated having insurance arranged. In Germany, university enrolment requires statutory electronic reporting (M10 notification) from a German public health insurer confirming your coverage meets federal mandates.'
        : 'German federal law mandates health insurance for all university students. Proof of insurance via electronic notification M10 is legally required for enrolment.',
      isDestinationSpecific: true,
      destinationCountry: 'DE',
      resourceIds: ['de_make_it_in_germany_study_visa'],
      suggestedTiming: () => 'Suggested: Secure coverage and request M10 electronic transmission prior to university enrolment',
      prerequisiteTaskIds: ['de_stu_admission_acceptance'],
      isApplicable: (answers) => answers.destination_country?.code === 'DE' && answers.relocation_purpose === 'study' && answers.journey_stage !== 'already_abroad',
      computeContextKey: (answers) => `dest:DE|purp:study|ins:${answers.preparation_status?.includes('insurance') ? 'arranged' : 'none'}`
    },

    // 4. Visa Application (Applicability check based on citizenship)
    {
      id: 'de_stu_visa_application',
      title: 'Determine visa requirements for your citizenship and attend appointment if required',
      action: (answers) => {
        if (answers.preparation_status?.includes('visa_permission')) {
          return 'Track your visa application with the German embassy or consulate, verify that your entry visa category D sticker has valid travel dates, and assemble supporting documents for border inspection.'
        }
        return 'Check whether your citizenship requires an entry visa: EU/EEA/Swiss citizens do not need a visa; citizens of select countries (e.g. US, Canada, UK, Australia, Japan, South Korea) can enter visa-free and apply for a residence permit locally; other third-country nationals must schedule a national visa appointment (Visum zu Studienzwecken) at a German diplomatic mission or partner centre (VFS/TLScontact).'
      },
      category: 'paperwork',
      phase: 'before_departure',
      whyItAppears: (answers) => answers.preparation_status?.includes('visa_permission')
        ? 'You noted having applied for or received permission. Ensure your visa is formally issued, as a submitted application does not guarantee border entry.'
        : 'Entry visa regulations in Germany depend on your citizenship. Verifying requirements early ensures sufficient time for consular appointment scheduling.',
      isDestinationSpecific: true,
      destinationCountry: 'DE',
      resourceIds: ['de_auswaertiges_amt_visa', 'de_make_it_in_germany_study_visa'],
      suggestedTiming: () => 'Suggested: Check consular wait times at your local mission and apply as early as permitted before travel',
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
      suggestedTiming: () => 'Suggested: Apply for student dormitories as early as possible and arrange interim lodging before travel',
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
      suggestedTiming: () => 'Suggested: Under German law (§ 17 BMG), register within 14 days of moving into permanent accommodation',
      prerequisiteTaskIds: ['de_stu_housing_search'],
      isApplicable: (answers) => answers.destination_country?.code === 'DE' && answers.relocation_purpose === 'study',
      computeContextKey: (answers) => `dest:DE|purp:study|city:${answers.destination_city?.cityName || 'undecided'}`
    },

    // 7. Local Bank Checking Account
    {
      id: 'de_stu_bank_account',
      title: 'Open a German checking account (Girokonto) and unlock disbursements if applicable',
      action: () => 'Open a student checking account at a German retail or direct bank with your passport and Meldebestätigung, then set up SEPA direct debits for rent and health insurance, or provide your IBAN to your blocked account provider if applicable.',
      category: 'budget',
      phase: 'arrival_settling',
      whyItAppears: () => 'German recurring payments—including monthly rent, health insurance contributions, mobile contracts, and blocked account payouts—operate through direct SEPA debit from a German Girokonto.',
      isDestinationSpecific: true,
      destinationCountry: 'DE',
      resourceIds: ['de_make_it_in_germany_study_visa'],
      suggestedTiming: () => 'Suggested: After completing municipal address registration (Meldebestätigung)',
      prerequisiteTaskIds: ['de_stu_anmeldung_city_reg'],
      isApplicable: (answers) => answers.destination_country?.code === 'DE' && answers.relocation_purpose === 'study',
      computeContextKey: (_answers) => `dest:DE|purp:study|bank`
    },

    // 8. Electronic Residence Permit (Applicability check)
    {
      id: 'de_stu_residence_permit',
      title: 'Determine residence permit requirements and apply at Ausländerbehörde if applicable',
      action: () => 'Non-EU/EEA students residing in Germany for degree studies must apply for an electronic residence permit (§ 16b AufenthG) at their local immigration authority (Ausländerbehörde) before their entry visa or 90-day visa-free stay expires. EU/EEA/Swiss citizens have freedom of movement and do not need a residence permit.',
      category: 'paperwork',
      phase: 'arrival_settling',
      whyItAppears: () => 'German entry visas are issued for 3 to 6 months. International students from outside the EU/EEA must apply for a formal student residence permit (§ 16b AufenthG) for the duration of their studies.',
      isDestinationSpecific: true,
      destinationCountry: 'DE',
      resourceIds: ['de_make_it_in_germany_study_visa'],
      suggestedTiming: () => 'Suggested: Schedule appointment well before your entry visa or 90-day visa-free stay expires',
      prerequisiteTaskIds: ['de_stu_anmeldung_city_reg', 'de_stu_bank_account'],
      isApplicable: (answers) => answers.destination_country?.code === 'DE' && answers.relocation_purpose === 'study',
      computeContextKey: (_answers) => `dest:DE|purp:study|residence`
    }
  ]
}
