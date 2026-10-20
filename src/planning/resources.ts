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
    summary: 'Official advisory portal explaining academic admission prerequisites for German higher education. Outlines higher education entrance qualifications (HZB), the uni-assist preliminary review documentation (VPD) procedure, and German language certifications (TestDaF/DSH).',
    scopeAndLimitations: 'Covers academic entrance qualification and university admissions guidance. Does not issue visas, make residence permit evaluations, or determine individual financial aid.'
  },

  de_make_it_in_germany_study_visa: {
    id: 'de_make_it_in_germany_study_visa',
    title: 'Make it in Germany — National Visa for Studying & Proof of Financing',
    url: 'https://www.make-it-in-germany.com/en/visa-residence/types/studying',
    publisher: 'Federal Ministry for Economic Affairs and Climate Action (BMWK) & Federal Employment Agency (BA)',
    destinationCountry: 'DE',
    topic: 'Student visa criteria, proof of financial resources alternatives (Sperrkonto/scholarships), health insurance',
    reviewedOn: 'October 2026',
    summary: 'Federal Government portal for qualified international applicants. Explains legal framework for national student visas (Visum zu Studienzwecken), proof of financial resources options (blocked account, formal obligation, recognized scholarship), and student health insurance mandates.',
    scopeAndLimitations: 'Explains federal statutory guidelines. EU/EEA citizens do not require a visa or blocked account. Individual diplomatic missions and local foreigner authorities (Ausländerbehörde) maintain jurisdiction over local appointment slots and individual application decisions.'
  },

  de_auswaertiges_amt_visa: {
    id: 'de_auswaertiges_amt_visa',
    title: 'Federal Foreign Office (Auswärtiges Amt) — Visa Regulations & Consular Missions',
    url: 'https://www.auswaertiges-amt.de/en/visa-service/buergerservice/faq',
    publisher: 'Federal Foreign Office of Germany (Auswärtiges Amt)',
    destinationCountry: 'DE',
    topic: 'Consular visa appointments, biometric submission, entry validity windows',
    reviewedOn: 'October 2026',
    summary: 'Federal consular directory and FAQ explaining national visa application procedures at German diplomatic missions abroad, appointment lead times, biometric standards, and category D visa validity.',
    scopeAndLimitations: 'Governs entry visa processing prior to departure. Citizens of select nations (e.g. EU/EEA, US, Canada, UK, Australia, Japan, South Korea) can enter visa-free and obtain residence permits locally after arrival.'
  },

  de_dsw_student_housing: {
    id: 'de_dsw_student_housing',
    title: 'Deutsches Studierendenwerk (DSW) — Accommodation & Student Services in Germany',
    url: 'https://www.studierendenwerke.de/en/',
    publisher: 'Deutsches Studierendenwerk (DSW)',
    destinationCountry: 'DE',
    topic: 'Student halls of residence, flatshares (WG), address registration (Anmeldung)',
    reviewedOn: 'October 2026',
    summary: 'Umbrella organization for Germany\'s 57 local student services organizations (Studierendenwerke). Explains public student residence halls, private accommodation services, semester contributions, and mandatory municipal address registration (Anmeldung).',
    scopeAndLimitations: 'DSW does not allocate rooms directly; applications must be submitted directly to the specific local Studierendenwerk responsible for the university town. Rooms are in high demand and not guaranteed.'
  },

  // -------------------------------------------------------------
  // Canada (Students)
  // -------------------------------------------------------------
  ca_ircc_study_permit: {
    id: 'ca_ircc_study_permit',
    title: 'IRCC — Study Permit: About the Process & Eligibility',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit.html',
    publisher: 'Immigration, Refugees and Citizenship Canada (IRCC)',
    destinationCountry: 'CA',
    topic: 'Study permit applications, DLI letter of acceptance, eligibility criteria',
    reviewedOn: 'October 2026',
    summary: 'Official federal immigration authority guidance on study permits. Details acceptance from Designated Learning Institutions (DLIs), eligibility criteria, program duration thresholds, and online application procedures.',
    scopeAndLimitations: 'Defines federal statutory admissibility. Study permits are generally required for courses longer than 6 months. Does not guarantee permit issuance or institutional university admission.'
  },

  ca_ircc_financial_support: {
    id: 'ca_ircc_financial_support',
    title: 'IRCC — Study Permit: Proof of Financial Support Guide & Official Tables',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit/get-documents.html',
    publisher: 'Immigration, Refugees and Citizenship Canada (IRCC)',
    destinationCountry: 'CA',
    topic: 'Proof of financial support, official living expense tables, tuition payment proof',
    reviewedOn: 'October 2026',
    summary: 'Official IRCC document checklist and living expense fund tables. Outlines mandatory financial proof requirements for single applicants and accompanying family members (outside Quebec and within Quebec), tuition evidence, and accepted financial documentation formats.',
    scopeAndLimitations: 'Provides official baseline statutory criteria. Living costs vary across Canadian provinces and metropolitan areas. Does not include tuition amounts, which are determined by the individual institution.'
  },

  ca_ircc_pal_guidance: {
    id: 'ca_ircc_pal_guidance',
    title: 'IRCC — Study Permit: Provincial Attestation Letter (PAL/TAL) & Exemptions',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit/get-documents.html',
    publisher: 'Immigration, Refugees and Citizenship Canada (IRCC)',
    destinationCountry: 'CA',
    topic: 'Provincial Attestation Letter (PAL), Territorial Attestation Letter (TAL), study permit cap exemptions',
    reviewedOn: 'October 2026',
    summary: 'Federal immigration instructions for Provincial and Territorial Attestation Letters. Details which post-secondary programs require a PAL/TAL from the provincial government via the DLI, and outlines statutory exemption categories (such as master\'s/doctoral degree students, exchange students, and primary/secondary students).',
    scopeAndLimitations: 'Specifies federal application requirements. Provincial allocation caps, processing workflows, and deposit rules are administered individually by provinces and territories.'
  },

  ca_ircc_border_arrival: {
    id: 'ca_ircc_border_arrival',
    title: 'IRCC & CBSA — Prepare for Arrival: Border Services and Mandatory Documents',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit/prepare-arrival.html',
    publisher: 'Immigration, Refugees and Citizenship Canada (IRCC) & Canada Border Services Agency (CBSA)',
    destinationCountry: 'CA',
    topic: 'Port of entry inspection, letter of introduction, border officer examination',
    reviewedOn: 'October 2026',
    summary: 'Official instructions for international students entering Canada. Details physical carry-on document requirements (Port of Entry Letter of Introduction, DLI acceptance letter, proof of funds, passport) for examination by CBSA border services officers.',
    scopeAndLimitations: 'Physical study permits are issued at the port of entry at the discretion of the examining CBSA border services officer upon entry inspection.'
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
    title: 'University of Toronto — Centre for International Experience (Example Institutional Guide)',
    url: 'https://internationalexperience.utoronto.ca/',
    publisher: 'University of Toronto',
    destinationCountry: 'CA',
    topic: 'University Health Insurance Plan (UHIP), course enrolment, student housing, Social Insurance Number (SIN)',
    reviewedOn: 'October 2026',
    summary: 'Comprehensive institutional pre-arrival guidance for international students. Details mandatory university health insurance (UHIP in Ontario), student housing options, and applying for a Social Insurance Number (SIN).',
    scopeAndLimitations: 'Institutional example for University of Toronto students in Ontario. Healthcare plans (UHIP vs provincial plans like BC MSP), deadlines, and residence availability differ across universities and provinces. Students must consult their specific institution.'
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
    scopeAndLimitations: 'Public health recommendations only. Specific border health mandates and quarantine rules are enacted by destination sovereign governments.'
  },

  gen_iata_travel_centre: {
    id: 'gen_iata_travel_centre',
    title: 'IATA Travel Centre — International Passport, Visa & Health Regulations',
    url: 'https://www.iatatravelcentre.com/',
    publisher: 'International Air Transport Association (IATA)',
    topic: 'Passport validity standards, airline transit requirements, customs allowances',
    reviewedOn: 'October 2026',
    summary: 'Aviation industry reference for passport validity rules (e.g. 6-month validity standards), transit visa requirements, and baggage customs restrictions.',
    scopeAndLimitations: 'Standard airline boarding regulations. Destination sovereign immigration authorities make all final entry determinations.'
  }
}

export function getOfficialResourceById(id: string): OfficialResource | undefined {
  return OFFICIAL_RESOURCES[id]
}
