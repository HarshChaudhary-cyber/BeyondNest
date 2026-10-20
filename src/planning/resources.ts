import type { OfficialResource } from './types'

export const OFFICIAL_RESOURCES: Record<string, OfficialResource> = {
  // -------------------------------------------------------------
  // Germany (Students)
  // -------------------------------------------------------------
  de_daad_admission: {
    id: 'de_daad_admission',
    title: 'DAAD — International Admission & University Entrance Qualification',
    url: 'https://www.daad.de/en/study-and-research-in-germany/plan-your-studies/requirements/',
    publisher: 'German Academic Exchange Service (DAAD)',
    destinationCountry: 'DE',
    topic: 'University admissions, uni-assist verification, Anabin credential equivalency',
    reviewedOn: 'October 2026',
    summary: 'Official advisory portal explaining admission prerequisites for German higher education. Outlines higher education entrance qualifications (HZB), the uni-assist preliminary review documentation (VPD) procedure, and German language certifications (TestDaF/DSH).',
    scopeAndLimitations: 'Covers academic entrance qualification and university admissions. Does not issue entry visas or evaluate residence permits.'
  },

  de_make_it_in_germany_study_visa: {
    id: 'de_make_it_in_germany_study_visa',
    title: 'Make it in Germany — National Visa for Studying & Blocked Account',
    url: 'https://www.make-it-in-germany.com/en/visa-residence/types/studying',
    publisher: 'Federal Ministry for Economic Affairs and Climate Action (BMWK) & Federal Employment Agency (BA)',
    destinationCountry: 'DE',
    topic: 'Student visa criteria, blocked account proof of financing (Sperrkonto), health insurance',
    reviewedOn: 'October 2026',
    summary: 'Official federal portal for international qualified individuals and students. Details national visa (Visum zu Studienzwecken) regulations, statutory monthly financial proof minimums (blocked account threshold), and student health insurance mandates.',
    scopeAndLimitations: 'Explains federal statutory requirements. Individual diplomatic missions and local foreigner authorities (Ausländerbehörde) maintain specific local scheduling and filing procedures.'
  },

  de_auswaertiges_amt_visa: {
    id: 'de_auswaertiges_amt_visa',
    title: 'Federal Foreign Office (Auswärtiges Amt) — National Visa Regulations & Consulates',
    url: 'https://www.auswaertiges-amt.de/en/visa-service/buergerservice/faq',
    publisher: 'Federal Foreign Office of Germany (Auswärtiges Amt)',
    destinationCountry: 'DE',
    topic: 'Consular visa appointments, biometric submission, entry validity windows',
    reviewedOn: 'October 2026',
    summary: 'Federal consular directory and FAQ explaining national visa application procedures at German diplomatic missions abroad, appointment lead times, and biometric requirements.',
    scopeAndLimitations: 'Governs entry visa processing prior to departure. Long-term residence permits (Aufenthaltstitel) must be obtained after arrival in Germany.'
  },

  de_dsw_student_housing: {
    id: 'de_dsw_student_housing',
    title: 'Deutsches Studierendenwerk (DSW) — Accommodation & Living in Germany',
    url: 'https://www.studierendenwerk.de/en/',
    publisher: 'Deutsches Studierendenwerk (DSW)',
    destinationCountry: 'DE',
    topic: 'Student halls of residence, flatshares (WG), address registration (Anmeldung)',
    reviewedOn: 'October 2026',
    summary: 'Umbrella organization for German student services organizations. Details public student dorm applications, semester contributions, private flatshares (WGs), and mandatory municipal address registration (Anmeldung beim Bürgeramt) within 14 days of move-in.',
    scopeAndLimitations: 'DSW does not guarantee dorm placement. Rooms are limited and waitlists in major student cities can exceed one semester.'
  },

  // -------------------------------------------------------------
  // Canada (Students)
  // -------------------------------------------------------------
  ca_ircc_study_permit: {
    id: 'ca_ircc_study_permit',
    title: 'IRCC — Study Permit: About the Process, Eligibility & PAL',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit.html',
    publisher: 'Immigration, Refugees and Citizenship Canada (IRCC)',
    destinationCountry: 'CA',
    topic: 'Study permit applications, DLI letter of acceptance, Provincial Attestation Letter (PAL), financial proof',
    reviewedOn: 'October 2026',
    summary: 'Official federal immigration authority guidance on study permits. Details mandatory acceptance from Designated Learning Institutions (DLIs), Provincial Attestation Letters (PAL), proof of financial support, and online submission requirements.',
    scopeAndLimitations: 'Defines federal legal admissibility. Does not guarantee permit approval or institutional university admission.'
  },

  ca_ircc_border_arrival: {
    id: 'ca_ircc_border_arrival',
    title: 'IRCC & CBSA — Prepare for Arrival: Border Services and Mandatory Documents',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit/prepare-arrival.html',
    publisher: 'Immigration, Refugees and Citizenship Canada (IRCC) & Canada Border Services Agency (CBSA)',
    destinationCountry: 'CA',
    topic: 'Port of entry inspection, letter of introduction, border officer interview',
    reviewedOn: 'October 2026',
    summary: 'Official instructions for international students entering Canada. Details physical document carrying requirements (Port of Entry Letter of Introduction, DLI letter, proof of funds) for border processing.',
    scopeAndLimitations: 'Physical study permits are issued at the port of entry at the discretion of the examining CBSA border services officer.'
  },

  ca_educanada_portal: {
    id: 'ca_educanada_portal',
    title: 'EduCanada — Official Government of Canada International Student Portal',
    url: 'https://www.educanada.ca/',
    publisher: 'Global Affairs Canada',
    destinationCountry: 'CA',
    topic: 'Designated learning institutions, living cost estimates, working while studying',
    reviewedOn: 'October 2026',
    summary: 'Official federal portal for international education in Canada. Provides accredited post-secondary institution directories, provincial cost-of-living overviews, and student work regulations.',
    scopeAndLimitations: 'Educational planning and provincial system overviews. Immigration rules and official visa processing are governed exclusively by IRCC.'
  },

  ca_university_international_guide: {
    id: 'ca_university_international_guide',
    title: 'Canadian University International Services & Pre-Arrival Guide',
    url: 'https://internationalexperience.utoronto.ca/',
    publisher: 'Canadian University International Student Services',
    destinationCountry: 'CA',
    topic: 'University Health Insurance Plan (UHIP), course enrolment, student housing, Social Insurance Number (SIN)',
    reviewedOn: 'October 2026',
    summary: 'Comprehensive institutional pre-arrival guidance for incoming international students. Details mandatory university health insurance (UHIP or provincial equivalents), residence options, and obtaining a Social Insurance Number (SIN) for on/off-campus employment.',
    scopeAndLimitations: 'Institutional guidance. Specific healthcare plans, deadlines, and residence availability vary across Canadian universities and provinces.'
  },

  // -------------------------------------------------------------
  // International / Global Guidance
  // -------------------------------------------------------------
  gen_who_travel_health: {
    id: 'gen_who_travel_health',
    title: 'WHO — International Travel and Health Guidance',
    url: 'https://www.who.int/travel-advice',
    publisher: 'World Health Organization (WHO)',
    topic: 'International travel immunizations, medication transport, health records',
    reviewedOn: 'October 2026',
    summary: 'Global public health guidelines covering routine and travel vaccinations, country-specific health notices, medication carrying rules, and medical record preparation.',
    scopeAndLimitations: 'Public health recommendations only. Specific border health mandates are enacted by destination sovereign governments.'
  },

  gen_iata_travel_centre: {
    id: 'gen_iata_travel_centre',
    title: 'IATA Travel Centre — International Passport, Visa & Health Regulations',
    url: 'https://www.iatatravelcentre.com/',
    publisher: 'International Air Transport Association (IATA)',
    topic: 'Passport validity standards, airline transit requirements, customs allowances',
    reviewedOn: 'October 2026',
    summary: 'Aviation industry reference for passport validity rules (e.g. 6-month validity rules), transit visa requirements, and baggage customs restrictions.',
    scopeAndLimitations: 'Standard airline boarding regulations. Destination sovereign immigration authorities make all final entry determinations.'
  }
}

export function getOfficialResourceById(id: string): OfficialResource | undefined {
  return OFFICIAL_RESOURCES[id]
}
