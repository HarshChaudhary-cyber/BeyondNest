/**
 * BeyondNest Sovereign Citizenship and Passport-Issuing Authorities Dataset
 * 
 * SELECTION POLICY & LIMITATIONS:
 * 1. Distinction from Territorial Residence:
 *    The residence-country dataset (COUNTRIES) contains 202 entities, including dependent territories
 *    and special administrative regions (e.g., Greenland, Bermuda, Cayman Islands, Puerto Rico).
 *    However, territories do not constitute distinct sovereign nationalities or independent
 *    passport-issuing authorities under international law:
 *    - Greenlandic residents hold Danish passports (Kingdom of Denmark).
 *    - Puerto Rican residents hold United States passports.
 *    - Bermuda and Cayman Islands residents hold British passports (British Overseas Territories / British Citizen).
 *    - Macao and Hong Kong residents hold PRC passports or SAR passports under Chinese nationality law.
 * 
 * 2. Scope:
 *    This dataset represents internationally recognized sovereign states that issue passports
 *    conferring citizenship for international travel (193 UN members + Vatican City + Palestine + Taiwan).
 *    We store sovereign nationality codes and descriptive nationality adjectives to help users easily
 *    search either by country name (e.g., "Germany") or demonym/nationality (e.g., "German").
 * 
 * 3. Privacy & Sensitivity:
 *    We collect only citizenship / nationality selections to identify bilateral entry agreements,
 *    visa-free access, and working holiday eligibility. We DO NOT collect passport numbers, issuance dates,
 *    or identity documents.
 */

export interface CitizenshipOption {
  code: string          // ISO 3166-1 alpha-2 sovereign code
  countryName: string   // Sovereign state name
  nationality: string   // Demonym / citizenship description
}

export const CITIZENSHIP_OPTIONS: CitizenshipOption[] = [
  { code: 'AF', countryName: 'Afghanistan', nationality: 'Afghan' },
  { code: 'AL', countryName: 'Albania', nationality: 'Albanian' },
  { code: 'DZ', countryName: 'Algeria', nationality: 'Algerian' },
  { code: 'AD', countryName: 'Andorra', nationality: 'Andorran' },
  { code: 'AO', countryName: 'Angola', nationality: 'Angolan' },
  { code: 'AG', countryName: 'Antigua and Barbuda', nationality: 'Antiguan, Barbudan' },
  { code: 'AR', countryName: 'Argentina', nationality: 'Argentine' },
  { code: 'AM', countryName: 'Armenia', nationality: 'Armenian' },
  { code: 'AU', countryName: 'Australia', nationality: 'Australian' },
  { code: 'AT', countryName: 'Austria', nationality: 'Austrian' },
  { code: 'AZ', countryName: 'Azerbaijan', nationality: 'Azerbaijani' },
  { code: 'BS', countryName: 'Bahamas', nationality: 'Bahamian' },
  { code: 'BH', countryName: 'Bahrain', nationality: 'Bahraini' },
  { code: 'BD', countryName: 'Bangladesh', nationality: 'Bangladeshi' },
  { code: 'BB', countryName: 'Barbados', nationality: 'Barbadian' },
  { code: 'BY', countryName: 'Belarus', nationality: 'Belarusian' },
  { code: 'BE', countryName: 'Belgium', nationality: 'Belgian' },
  { code: 'BZ', countryName: 'Belize', nationality: 'Belizean' },
  { code: 'BJ', countryName: 'Benin', nationality: 'Beninese' },
  { code: 'BT', countryName: 'Bhutan', nationality: 'Bhutanese' },
  { code: 'BO', countryName: 'Bolivia', nationality: 'Bolivian' },
  { code: 'BA', countryName: 'Bosnia and Herzegovina', nationality: 'Bosnian, Herzegovinian' },
  { code: 'BW', countryName: 'Botswana', nationality: 'Motswana' },
  { code: 'BR', countryName: 'Brazil', nationality: 'Brazilian' },
  { code: 'BN', countryName: 'Brunei', nationality: 'Bruneian' },
  { code: 'BG', countryName: 'Bulgaria', nationality: 'Bulgarian' },
  { code: 'BF', countryName: 'Burkina Faso', nationality: 'Burkinabe' },
  { code: 'BI', countryName: 'Burundi', nationality: 'Burundian' },
  { code: 'CV', countryName: 'Cabo Verde', nationality: 'Cabo Verdean' },
  { code: 'KH', countryName: 'Cambodia', nationality: 'Cambodian' },
  { code: 'CM', countryName: 'Cameroon', nationality: 'Cameroonian' },
  { code: 'CA', countryName: 'Canada', nationality: 'Canadian' },
  { code: 'CF', countryName: 'Central African Republic', nationality: 'Central African' },
  { code: 'TD', countryName: 'Chad', nationality: 'Chadian' },
  { code: 'CL', countryName: 'Chile', nationality: 'Chilean' },
  { code: 'CN', countryName: 'China', nationality: 'Chinese' },
  { code: 'CO', countryName: 'Colombia', nationality: 'Colombian' },
  { code: 'KM', countryName: 'Comoros', nationality: 'Comorian' },
  { code: 'CG', countryName: 'Congo', nationality: 'Congolese' },
  { code: 'CD', countryName: 'Congo (DRC)', nationality: 'Congolese' },
  { code: 'CR', countryName: 'Costa Rica', nationality: 'Costa Rican' },
  { code: 'HR', countryName: 'Croatia', nationality: 'Croatian' },
  { code: 'CU', countryName: 'Cuba', nationality: 'Cuban' },
  { code: 'CY', countryName: 'Cyprus', nationality: 'Cypriot' },
  { code: 'CZ', countryName: 'Czech Republic', nationality: 'Czech' },
  { code: 'DK', countryName: 'Denmark', nationality: 'Danish' },
  { code: 'DJ', countryName: 'Djibouti', nationality: 'Djiboutian' },
  { code: 'DM', countryName: 'Dominica', nationality: 'Dominican' },
  { code: 'DO', countryName: 'Dominican Republic', nationality: 'Dominican' },
  { code: 'EC', countryName: 'Ecuador', nationality: 'Ecuadorian' },
  { code: 'EG', countryName: 'Egypt', nationality: 'Egyptian' },
  { code: 'SV', countryName: 'El Salvador', nationality: 'Salvadoran' },
  { code: 'GQ', countryName: 'Equatorial Guinea', nationality: 'Equatorial Guinean' },
  { code: 'ER', countryName: 'Eritrea', nationality: 'Eritrean' },
  { code: 'EE', countryName: 'Estonia', nationality: 'Estonian' },
  { code: 'SZ', countryName: 'Eswatini', nationality: 'Swazi' },
  { code: 'ET', countryName: 'Ethiopia', nationality: 'Ethiopian' },
  { code: 'FJ', countryName: 'Fiji', nationality: 'Fijian' },
  { code: 'FI', countryName: 'Finland', nationality: 'Finnish' },
  { code: 'FR', countryName: 'France', nationality: 'French' },
  { code: 'GA', countryName: 'Gabon', nationality: 'Gabonese' },
  { code: 'GM', countryName: 'Gambia', nationality: 'Gambian' },
  { code: 'GE', countryName: 'Georgia', nationality: 'Georgian' },
  { code: 'DE', countryName: 'Germany', nationality: 'German' },
  { code: 'GH', countryName: 'Ghana', nationality: 'Ghanaian' },
  { code: 'GR', countryName: 'Greece', nationality: 'Greek' },
  { code: 'GD', countryName: 'Grenada', nationality: 'Grenadian' },
  { code: 'GT', countryName: 'Guatemala', nationality: 'Guatemalan' },
  { code: 'GN', countryName: 'Guinea', nationality: 'Guinean' },
  { code: 'GW', countryName: 'Guinea-Bissau', nationality: 'Bissau-Guinean' },
  { code: 'GY', countryName: 'Guyana', nationality: 'Guyanese' },
  { code: 'HT', countryName: 'Haiti', nationality: 'Haitian' },
  { code: 'HN', countryName: 'Honduras', nationality: 'Honduran' },
  { code: 'HU', countryName: 'Hungary', nationality: 'Hungarian' },
  { code: 'IS', countryName: 'Iceland', nationality: 'Icelandic' },
  { code: 'IN', countryName: 'India', nationality: 'Indian' },
  { code: 'ID', countryName: 'Indonesia', nationality: 'Indonesian' },
  { code: 'IR', countryName: 'Iran', nationality: 'Iranian' },
  { code: 'IQ', countryName: 'Iraq', nationality: 'Iraqi' },
  { code: 'IE', countryName: 'Ireland', nationality: 'Irish' },
  { code: 'IL', countryName: 'Israel', nationality: 'Israeli' },
  { code: 'IT', countryName: 'Italy', nationality: 'Italian' },
  { code: 'JM', countryName: 'Jamaica', nationality: 'Jamaican' },
  { code: 'JP', countryName: 'Japan', nationality: 'Japanese' },
  { code: 'JO', countryName: 'Jordan', nationality: 'Jordanian' },
  { code: 'KZ', countryName: 'Kazakhstan', nationality: 'Kazakhstani' },
  { code: 'KE', countryName: 'Kenya', nationality: 'Kenyan' },
  { code: 'KI', countryName: 'Kiribati', nationality: 'I-Kiribati' },
  { code: 'KP', countryName: 'North Korea', nationality: 'North Korean' },
  { code: 'KR', countryName: 'South Korea', nationality: 'South Korean' },
  { code: 'KW', countryName: 'Kuwait', nationality: 'Kuwaiti' },
  { code: 'KG', countryName: 'Kyrgyzstan', nationality: 'Kyrgyzstani' },
  { code: 'LA', countryName: 'Laos', nationality: 'Laotian' },
  { code: 'LV', countryName: 'Latvia', nationality: 'Latvian' },
  { code: 'LB', countryName: 'Lebanon', nationality: 'Lebanese' },
  { code: 'LS', countryName: 'Lesotho', nationality: 'Basotho' },
  { code: 'LR', countryName: 'Liberia', nationality: 'Liberian' },
  { code: 'LY', countryName: 'Libya', nationality: 'Libyan' },
  { code: 'LI', countryName: 'Liechtenstein', nationality: 'Liechtensteiner' },
  { code: 'LT', countryName: 'Lithuania', nationality: 'Lithuanian' },
  { code: 'LU', countryName: 'Luxembourg', nationality: 'Luxembourger' },
  { code: 'MG', countryName: 'Madagascar', nationality: 'Malagasy' },
  { code: 'MW', countryName: 'Malawi', nationality: 'Malawian' },
  { code: 'MY', countryName: 'Malaysia', nationality: 'Malaysian' },
  { code: 'MV', countryName: 'Maldives', nationality: 'Maldivian' },
  { code: 'ML', countryName: 'Mali', nationality: 'Malian' },
  { code: 'MT', countryName: 'Malta', nationality: 'Maltese' },
  { code: 'MH', countryName: 'Marshall Islands', nationality: 'Marshallese' },
  { code: 'MR', countryName: 'Mauritania', nationality: 'Mauritanian' },
  { code: 'MU', countryName: 'Mauritius', nationality: 'Mauritian' },
  { code: 'MX', countryName: 'Mexico', nationality: 'Mexican' },
  { code: 'FM', countryName: 'Micronesia', nationality: 'Micronesian' },
  { code: 'MD', countryName: 'Moldova', nationality: 'Moldovan' },
  { code: 'MC', countryName: 'Monaco', nationality: 'Monegasque' },
  { code: 'MN', countryName: 'Mongolia', nationality: 'Mongolian' },
  { code: 'ME', countryName: 'Montenegro', nationality: 'Montenegrin' },
  { code: 'MA', countryName: 'Morocco', nationality: 'Moroccan' },
  { code: 'MZ', countryName: 'Mozambique', nationality: 'Mozambican' },
  { code: 'MM', countryName: 'Myanmar', nationality: 'Burmese' },
  { code: 'NA', countryName: 'Namibia', nationality: 'Namibian' },
  { code: 'NR', countryName: 'Nauru', nationality: 'Nauruan' },
  { code: 'NP', countryName: 'Nepal', nationality: 'Nepalese' },
  { code: 'NL', countryName: 'Netherlands', nationality: 'Dutch' },
  { code: 'NZ', countryName: 'New Zealand', nationality: 'New Zealander' },
  { code: 'NI', countryName: 'Nicaragua', nationality: 'Nicaraguan' },
  { code: 'NE', countryName: 'Niger', nationality: 'Nigerien' },
  { code: 'NG', countryName: 'Nigeria', nationality: 'Nigerian' },
  { code: 'MK', countryName: 'North Macedonia', nationality: 'Macedonian' },
  { code: 'NO', countryName: 'Norway', nationality: 'Norwegian' },
  { code: 'OM', countryName: 'Oman', nationality: 'Omani' },
  { code: 'PK', countryName: 'Pakistan', nationality: 'Pakistani' },
  { code: 'PW', countryName: 'Palau', nationality: 'Palauan' },
  { code: 'PS', countryName: 'Palestine', nationality: 'Palestinian' },
  { code: 'PA', countryName: 'Panama', nationality: 'Panamanian' },
  { code: 'PG', countryName: 'Papua New Guinea', nationality: 'Papua New Guinean' },
  { code: 'PY', countryName: 'Paraguay', nationality: 'Paraguayan' },
  { code: 'PE', countryName: 'Peru', nationality: 'Peruvian' },
  { code: 'PH', countryName: 'Philippines', nationality: 'Filipino' },
  { code: 'PL', countryName: 'Poland', nationality: 'Polish' },
  { code: 'PT', countryName: 'Portugal', nationality: 'Portuguese' },
  { code: 'QA', countryName: 'Qatar', nationality: 'Qatari' },
  { code: 'RO', countryName: 'Romania', nationality: 'Romanian' },
  { code: 'RU', countryName: 'Russia', nationality: 'Russian' },
  { code: 'RW', countryName: 'Rwanda', nationality: 'Rwandan' },
  { code: 'KN', countryName: 'Saint Kitts and Nevis', nationality: 'Kittitian, Nevisian' },
  { code: 'LC', countryName: 'Saint Lucia', nationality: 'Saint Lucian' },
  { code: 'VC', countryName: 'Saint Vincent and the Grenadines', nationality: 'Vincentian' },
  { code: 'WS', countryName: 'Samoa', nationality: 'Samoan' },
  { code: 'SM', countryName: 'San Marino', nationality: 'Sammarinese' },
  { code: 'ST', countryName: 'Sao Tome and Principe', nationality: 'Sao Tomean' },
  { code: 'SA', countryName: 'Saudi Arabia', nationality: 'Saudi' },
  { code: 'SN', countryName: 'Senegal', nationality: 'Senegalese' },
  { code: 'RS', countryName: 'Serbia', nationality: 'Serbian' },
  { code: 'SC', countryName: 'Seychelles', nationality: 'Seychellois' },
  { code: 'SL', countryName: 'Sierra Leone', nationality: 'Sierra Leonean' },
  { code: 'SG', countryName: 'Singapore', nationality: 'Singaporean' },
  { code: 'SK', countryName: 'Slovakia', nationality: 'Slovak' },
  { code: 'SI', countryName: 'Slovenia', nationality: 'Slovenian' },
  { code: 'SB', countryName: 'Solomon Islands', nationality: 'Solomon Islander' },
  { code: 'SO', countryName: 'Somalia', nationality: 'Somali' },
  { code: 'ZA', countryName: 'South Africa', nationality: 'South African' },
  { code: 'SS', countryName: 'South Sudan', nationality: 'South Sudanese' },
  { code: 'ES', countryName: 'Spain', nationality: 'Spanish' },
  { code: 'LK', countryName: 'Sri Lanka', nationality: 'Sri Lankan' },
  { code: 'SD', countryName: 'Sudan', nationality: 'Sudanese' },
  { code: 'SR', countryName: 'Suriname', nationality: 'Surinamese' },
  { code: 'SE', countryName: 'Sweden', nationality: 'Swedish' },
  { code: 'CH', countryName: 'Switzerland', nationality: 'Swiss' },
  { code: 'SY', countryName: 'Syria', nationality: 'Syrian' },
  { code: 'TW', countryName: 'Taiwan', nationality: 'Taiwanese' },
  { code: 'TJ', countryName: 'Tajikistan', nationality: 'Tajik' },
  { code: 'TZ', countryName: 'Tanzania', nationality: 'Tanzanian' },
  { code: 'TH', countryName: 'Thailand', nationality: 'Thai' },
  { code: 'TL', countryName: 'Timor-Leste', nationality: 'Timorese' },
  { code: 'TG', countryName: 'Togo', nationality: 'Togolese' },
  { code: 'TO', countryName: 'Tonga', nationality: 'Tongan' },
  { code: 'TT', countryName: 'Trinidad and Tobago', nationality: 'Trinidadian, Tobagonian' },
  { code: 'TN', countryName: 'Tunisia', nationality: 'Tunisian' },
  { code: 'TR', countryName: 'Turkey', nationality: 'Turkish' },
  { code: 'TM', countryName: 'Turkmenistan', nationality: 'Turkmen' },
  { code: 'TV', countryName: 'Tuvalu', nationality: 'Tuvaluan' },
  { code: 'UG', countryName: 'Uganda', nationality: 'Ugandan' },
  { code: 'UA', countryName: 'Ukraine', nationality: 'Ukrainian' },
  { code: 'AE', countryName: 'United Arab Emirates', nationality: 'Emirati' },
  { code: 'GB', countryName: 'United Kingdom', nationality: 'British' },
  { code: 'US', countryName: 'United States', nationality: 'American' },
  { code: 'UY', countryName: 'Uruguay', nationality: 'Uruguayan' },
  { code: 'UZ', countryName: 'Uzbekistan', nationality: 'Uzbek' },
  { code: 'VU', countryName: 'Vanuatu', nationality: 'Ni-Vanuatu' },
  { code: 'VA', countryName: 'Vatican City', nationality: 'Vatican' },
  { code: 'VE', countryName: 'Venezuela', nationality: 'Venezuelan' },
  { code: 'VN', countryName: 'Vietnam', nationality: 'Vietnamese' },
  { code: 'YE', countryName: 'Yemen', nationality: 'Yemeni' },
  { code: 'ZM', countryName: 'Zambia', nationality: 'Zambian' },
  { code: 'ZW', countryName: 'Zimbabwe', nationality: 'Zimbabwean' }
]

export function findCitizenshipByCode(code: string): CitizenshipOption | undefined {
  return CITIZENSHIP_OPTIONS.find(c => c.code.toUpperCase() === code.toUpperCase())
}

export function searchCitizenships(query: string): CitizenshipOption[] {
  const clean = query.trim().toLowerCase()
  if (!clean) return CITIZENSHIP_OPTIONS

  return CITIZENSHIP_OPTIONS.filter(c =>
    c.countryName.toLowerCase().includes(clean) ||
    c.nationality.toLowerCase().includes(clean) ||
    c.code.toLowerCase() === clean
  )
}
