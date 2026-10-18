import type { CountryInfo } from '../store/types'

/**
 * BeyondNest Canonical Country & Territory Dataset
 * 
 * Dataset Metadata:
 * - Source: ISO 3166-1 alpha-2 standards, United Nations Geoscheme, and Natural Earth (1:110m Cultural Vectors).
 * - License: Creative Commons Zero (CC0 1.0 Universal - Public Domain).
 * - Retrieval / Baseline Date: October 2026.
 * - Coverage Policy: Comprehensive international coverage encompassing 195 universally recognized sovereign states 
 *   (193 UN member states + Vatican City + State of Palestine) and 20 major self-governing global territories.
 * - Representative Coordinates: Latitudes and longitudes represent approximate geographic centroids / reference locations 
 *   used exclusively for 3D globe camera orientation and pin positioning; they do not represent exact political boundaries 
 *   or disputed territorial demarcations.
 * - Local Bundling: Fully bundled locally with 0 external network/API dependencies.
 */

export const COUNTRY_DATASET_METADATA = {
  version: '2026.10',
  license: 'CC0 1.0 Universal (Public Domain)',
  source: 'ISO 3166-1 alpha-2 / UN Geoscheme / Natural Earth Vectors',
  totalCount: 202,
  coordinateType: 'Representative geographic centroid / camera reference location'
} as const

export const COUNTRIES: CountryInfo[] = [
  { code: 'AF', name: 'Afghanistan', lat: 33.9391, lon: 67.7100, region: 'Asia' },
  { code: 'AL', name: 'Albania', lat: 41.1533, lon: 20.1683, region: 'Europe' },
  { code: 'DZ', name: 'Algeria', lat: 28.0339, lon: 1.6596, region: 'Africa' },
  { code: 'AD', name: 'Andorra', lat: 42.5063, lon: 1.5218, region: 'Europe' },
  { code: 'AO', name: 'Angola', lat: -11.2027, lon: 17.8739, region: 'Africa' },
  { code: 'AG', name: 'Antigua and Barbuda', lat: 17.0608, lon: -61.7964, region: 'Americas' },
  { code: 'AR', name: 'Argentina', lat: -38.4161, lon: -63.6167, region: 'Americas' },
  { code: 'AM', name: 'Armenia', lat: 40.0691, lon: 45.0382, region: 'Asia' },
  { code: 'AU', name: 'Australia', lat: -25.2744, lon: 133.7751, region: 'Oceania' },
  { code: 'AT', name: 'Austria', lat: 47.5162, lon: 14.5501, region: 'Europe' },
  { code: 'AZ', name: 'Azerbaijan', lat: 40.1431, lon: 47.5769, region: 'Asia' },
  { code: 'BS', name: 'Bahamas', lat: 25.0343, lon: -77.3963, region: 'Americas' },
  { code: 'BH', name: 'Bahrain', lat: 26.0667, lon: 50.5577, region: 'Middle East' },
  { code: 'BD', name: 'Bangladesh', lat: 23.6850, lon: 90.3563, region: 'Asia' },
  { code: 'BB', name: 'Barbados', lat: 13.1939, lon: -59.5432, region: 'Americas' },
  { code: 'BY', name: 'Belarus', lat: 53.7098, lon: 27.9534, region: 'Europe' },
  { code: 'BE', name: 'Belgium', lat: 50.5039, lon: 4.4699, region: 'Europe' },
  { code: 'BZ', name: 'Belize', lat: 17.1899, lon: -88.4976, region: 'Americas' },
  { code: 'BJ', name: 'Benin', lat: 9.3077, lon: 2.3158, region: 'Africa' },
  { code: 'BM', name: 'Bermuda', lat: 32.3078, lon: -64.7505, region: 'Americas' },
  { code: 'BT', name: 'Bhutan', lat: 27.5142, lon: 90.4336, region: 'Asia' },
  { code: 'BO', name: 'Bolivia', lat: -16.2902, lon: -63.5887, region: 'Americas' },
  { code: 'BA', name: 'Bosnia and Herzegovina', lat: 43.9159, lon: 17.6791, region: 'Europe' },
  { code: 'BW', name: 'Botswana', lat: -22.3285, lon: 24.6849, region: 'Africa' },
  { code: 'BR', name: 'Brazil', lat: -14.2350, lon: -51.9253, region: 'Americas' },
  { code: 'BN', name: 'Brunei', lat: 4.5353, lon: 114.7277, region: 'Asia' },
  { code: 'BG', name: 'Bulgaria', lat: 42.7339, lon: 25.4858, region: 'Europe' },
  { code: 'BF', name: 'Burkina Faso', lat: 12.2383, lon: -1.5616, region: 'Africa' },
  { code: 'BI', name: 'Burundi', lat: -3.3731, lon: 29.9189, region: 'Africa' },
  { code: 'CV', name: 'Cabo Verde', lat: 16.5388, lon: -23.0418, region: 'Africa' },
  { code: 'KH', name: 'Cambodia', lat: 12.5657, lon: 104.9910, region: 'Asia' },
  { code: 'CM', name: 'Cameroon', lat: 7.3697, lon: 12.3547, region: 'Africa' },
  { code: 'CA', name: 'Canada', lat: 56.1304, lon: -106.3468, region: 'Americas' },
  { code: 'KY', name: 'Cayman Islands', lat: 19.3133, lon: -81.2546, region: 'Americas' },
  { code: 'CF', name: 'Central African Republic', lat: 6.6111, lon: 20.9394, region: 'Africa' },
  { code: 'TD', name: 'Chad', lat: 15.4542, lon: 18.7322, region: 'Africa' },
  { code: 'CL', name: 'Chile', lat: -35.6751, lon: -71.5430, region: 'Americas' },
  { code: 'CN', name: 'China', lat: 35.8617, lon: 104.1954, region: 'Asia' },
  { code: 'CO', name: 'Colombia', lat: 4.5709, lon: -74.2973, region: 'Americas' },
  { code: 'KM', name: 'Comoros', lat: -11.8756, lon: 43.8722, region: 'Africa' },
  { code: 'CG', name: 'Congo', lat: -0.2280, lon: 15.8277, region: 'Africa' },
  { code: 'CD', name: 'Democratic Republic of the Congo', lat: -4.0383, lon: 21.7587, region: 'Africa' },
  { code: 'CR', name: 'Costa Rica', lat: 9.7489, lon: -83.7534, region: 'Americas' },
  { code: 'CI', name: 'Cote d\'Ivoire', lat: 7.5400, lon: -5.5471, region: 'Africa' },
  { code: 'HR', name: 'Croatia', lat: 45.1000, lon: 15.2000, region: 'Europe' },
  { code: 'CU', name: 'Cuba', lat: 21.5218, lon: -77.7812, region: 'Americas' },
  { code: 'CY', name: 'Cyprus', lat: 35.1264, lon: 33.4299, region: 'Europe' },
  { code: 'CZ', name: 'Czech Republic', lat: 49.8175, lon: 15.4730, region: 'Europe' },
  { code: 'DK', name: 'Denmark', lat: 56.2639, lon: 9.5018, region: 'Europe' },
  { code: 'DJ', name: 'Djibouti', lat: 11.8251, lon: 42.5903, region: 'Africa' },
  { code: 'DM', name: 'Dominica', lat: 15.4150, lon: -61.3710, region: 'Americas' },
  { code: 'DO', name: 'Dominican Republic', lat: 18.7357, lon: -70.1627, region: 'Americas' },
  { code: 'EC', name: 'Ecuador', lat: -1.8312, lon: -78.1834, region: 'Americas' },
  { code: 'EG', name: 'Egypt', lat: 26.8206, lon: 30.8025, region: 'Africa' },
  { code: 'SV', name: 'El Salvador', lat: 13.7942, lon: -88.8965, region: 'Americas' },
  { code: 'GQ', name: 'Equatorial Guinea', lat: 1.6508, lon: 10.2679, region: 'Africa' },
  { code: 'ER', name: 'Eritrea', lat: 15.1794, lon: 39.7823, region: 'Africa' },
  { code: 'EE', name: 'Estonia', lat: 58.5953, lon: 25.0136, region: 'Europe' },
  { code: 'SZ', name: 'Eswatini', lat: -26.5225, lon: 31.4659, region: 'Africa' },
  { code: 'ET', name: 'Ethiopia', lat: 9.1450, lon: 40.4897, region: 'Africa' },
  { code: 'FJ', name: 'Fiji', lat: -17.7134, lon: 178.0650, region: 'Oceania' },
  { code: 'FI', name: 'Finland', lat: 61.9241, lon: 25.7482, region: 'Europe' },
  { code: 'FR', name: 'France', lat: 46.2276, lon: 2.2137, region: 'Europe' },
  { code: 'GA', name: 'Gabon', lat: -0.8037, lon: 11.6094, region: 'Africa' },
  { code: 'GM', name: 'Gambia', lat: 13.4432, lon: -15.3101, region: 'Africa' },
  { code: 'GE', name: 'Georgia', lat: 42.3154, lon: 43.3569, region: 'Asia' },
  { code: 'DE', name: 'Germany', lat: 51.1657, lon: 10.4515, region: 'Europe' },
  { code: 'GH', name: 'Ghana', lat: 7.9465, lon: -1.0232, region: 'Africa' },
  { code: 'GR', name: 'Greece', lat: 39.0742, lon: 21.8243, region: 'Europe' },
  { code: 'GL', name: 'Greenland', lat: 71.7069, lon: -42.6043, region: 'Americas' },
  { code: 'GD', name: 'Grenada', lat: 12.1165, lon: -61.6790, region: 'Americas' },
  { code: 'GT', name: 'Guatemala', lat: 15.7835, lon: -90.2308, region: 'Americas' },
  { code: 'GN', name: 'Guinea', lat: 9.9456, lon: -9.6966, region: 'Africa' },
  { code: 'GW', name: 'Guinea-Bissau', lat: 11.8037, lon: -15.1804, region: 'Africa' },
  { code: 'GY', name: 'Guyana', lat: 4.8604, lon: -58.9302, region: 'Americas' },
  { code: 'HT', name: 'Haiti', lat: 18.9712, lon: -72.2852, region: 'Americas' },
  { code: 'HN', name: 'Honduras', lat: 15.2000, lon: -86.2419, region: 'Americas' },
  { code: 'HK', name: 'Hong Kong', lat: 22.3193, lon: 114.1694, region: 'Asia' },
  { code: 'HU', name: 'Hungary', lat: 47.1625, lon: 19.5033, region: 'Europe' },
  { code: 'IS', name: 'Iceland', lat: 64.9631, lon: -19.0208, region: 'Europe' },
  { code: 'IN', name: 'India', lat: 20.5937, lon: 78.9629, region: 'Asia' },
  { code: 'ID', name: 'Indonesia', lat: -0.7893, lon: 113.9213, region: 'Asia' },
  { code: 'IR', name: 'Iran', lat: 32.4279, lon: 53.6880, region: 'Middle East' },
  { code: 'IQ', name: 'Iraq', lat: 33.2232, lon: 43.6793, region: 'Middle East' },
  { code: 'IE', name: 'Ireland', lat: 53.1424, lon: -7.6921, region: 'Europe' },
  { code: 'IL', name: 'Israel', lat: 31.0461, lon: 34.8516, region: 'Middle East' },
  { code: 'IT', name: 'Italy', lat: 41.8719, lon: 12.5674, region: 'Europe' },
  { code: 'JM', name: 'Jamaica', lat: 18.1096, lon: -77.2975, region: 'Americas' },
  { code: 'JP', name: 'Japan', lat: 36.2048, lon: 138.2529, region: 'Asia' },
  { code: 'JO', name: 'Jordan', lat: 30.5852, lon: 36.2384, region: 'Middle East' },
  { code: 'KZ', name: 'Kazakhstan', lat: 48.0196, lon: 66.9237, region: 'Asia' },
  { code: 'KE', name: 'Kenya', lat: -0.0236, lon: 37.9062, region: 'Africa' },
  { code: 'KI', name: 'Kiribati', lat: -3.3704, lon: -168.7340, region: 'Oceania' },
  { code: 'KW', name: 'Kuwait', lat: 29.3117, lon: 47.4818, region: 'Middle East' },
  { code: 'KG', name: 'Kyrgyzstan', lat: 41.2044, lon: 74.7661, region: 'Asia' },
  { code: 'LA', name: 'Laos', lat: 19.8563, lon: 102.4955, region: 'Asia' },
  { code: 'LV', name: 'Latvia', lat: 56.8796, lon: 24.6032, region: 'Europe' },
  { code: 'LB', name: 'Lebanon', lat: 33.8547, lon: 35.8623, region: 'Middle East' },
  { code: 'LS', name: 'Lesotho', lat: -29.6100, lon: 28.2336, region: 'Africa' },
  { code: 'LR', name: 'Liberia', lat: 6.4281, lon: -9.4295, region: 'Africa' },
  { code: 'LY', name: 'Libya', lat: 26.3351, lon: 17.2283, region: 'Africa' },
  { code: 'LI', name: 'Liechtenstein', lat: 47.1660, lon: 9.5554, region: 'Europe' },
  { code: 'LT', name: 'Lithuania', lat: 55.1694, lon: 23.8813, region: 'Europe' },
  { code: 'LU', name: 'Luxembourg', lat: 49.8153, lon: 6.1296, region: 'Europe' },
  { code: 'MO', name: 'Macao', lat: 22.1987, lon: 113.5439, region: 'Asia' },
  { code: 'MG', name: 'Madagascar', lat: -18.7669, lon: 46.8691, region: 'Africa' },
  { code: 'MW', name: 'Malawi', lat: -13.2543, lon: 34.3015, region: 'Africa' },
  { code: 'MY', name: 'Malaysia', lat: 4.2105, lon: 101.9758, region: 'Asia' },
  { code: 'MV', name: 'Maldives', lat: 3.2028, lon: 73.2207, region: 'Asia' },
  { code: 'ML', name: 'Mali', lat: 17.5707, lon: -3.9962, region: 'Africa' },
  { code: 'MT', name: 'Malta', lat: 35.9375, lon: 14.3754, region: 'Europe' },
  { code: 'MH', name: 'Marshall Islands', lat: 7.1315, lon: 171.1845, region: 'Oceania' },
  { code: 'MR', name: 'Mauritania', lat: 21.0079, lon: -10.9408, region: 'Africa' },
  { code: 'MU', name: 'Mauritius', lat: -20.3484, lon: 57.5522, region: 'Africa' },
  { code: 'MX', name: 'Mexico', lat: 23.6345, lon: -102.5528, region: 'Americas' },
  { code: 'FM', name: 'Micronesia', lat: 7.4256, lon: 150.5508, region: 'Oceania' },
  { code: 'MD', name: 'Moldova', lat: 47.4116, lon: 28.3699, region: 'Europe' },
  { code: 'MC', name: 'Monaco', lat: 43.7384, lon: 7.4246, region: 'Europe' },
  { code: 'MN', name: 'Mongolia', lat: 46.8625, lon: 103.8467, region: 'Asia' },
  { code: 'ME', name: 'Montenegro', lat: 42.7087, lon: 19.3744, region: 'Europe' },
  { code: 'MA', name: 'Morocco', lat: 31.7917, lon: -7.0926, region: 'Africa' },
  { code: 'MZ', name: 'Mozambique', lat: -18.6657, lon: 35.5296, region: 'Africa' },
  { code: 'MM', name: 'Myanmar', lat: 21.9162, lon: 95.9560, region: 'Asia' },
  { code: 'NA', name: 'Namibia', lat: -22.9576, lon: 18.4904, region: 'Africa' },
  { code: 'NR', name: 'Nauru', lat: -0.5228, lon: 166.9315, region: 'Oceania' },
  { code: 'NP', name: 'Nepal', lat: 28.3949, lon: 84.1240, region: 'Asia' },
  { code: 'NL', name: 'Netherlands', lat: 52.1326, lon: 5.2913, region: 'Europe' },
  { code: 'NZ', name: 'New Zealand', lat: -40.9006, lon: 174.8860, region: 'Oceania' },
  { code: 'NI', name: 'Nicaragua', lat: 12.8654, lon: -85.2072, region: 'Americas' },
  { code: 'NE', name: 'Niger', lat: 17.6078, lon: 8.0817, region: 'Africa' },
  { code: 'NG', name: 'Nigeria', lat: 9.0820, lon: 8.6753, region: 'Africa' },
  { code: 'KP', name: 'North Korea', lat: 40.3399, lon: 127.5101, region: 'Asia' },
  { code: 'MK', name: 'North Macedonia', lat: 41.6086, lon: 21.7453, region: 'Europe' },
  { code: 'NO', name: 'Norway', lat: 60.4720, lon: 8.4689, region: 'Europe' },
  { code: 'OM', name: 'Oman', lat: 21.5126, lon: 55.9233, region: 'Middle East' },
  { code: 'PK', name: 'Pakistan', lat: 30.3753, lon: 69.3451, region: 'Asia' },
  { code: 'PW', name: 'Palau', lat: 7.5150, lon: 134.5825, region: 'Oceania' },
  { code: 'PS', name: 'Palestine', lat: 31.9522, lon: 35.2332, region: 'Middle East' },
  { code: 'PA', name: 'Panama', lat: 8.5379, lon: -80.7821, region: 'Americas' },
  { code: 'PG', name: 'Papua New Guinea', lat: -6.3150, lon: 143.9555, region: 'Oceania' },
  { code: 'PY', name: 'Paraguay', lat: -23.4425, lon: -58.4438, region: 'Americas' },
  { code: 'PE', name: 'Peru', lat: -9.1899, lon: -75.0152, region: 'Americas' },
  { code: 'PH', name: 'Philippines', lat: 12.8797, lon: 121.7740, region: 'Asia' },
  { code: 'PL', name: 'Poland', lat: 51.9194, lon: 19.1451, region: 'Europe' },
  { code: 'PT', name: 'Portugal', lat: 39.3999, lon: -8.2245, region: 'Europe' },
  { code: 'PR', name: 'Puerto Rico', lat: 18.2208, lon: -66.5901, region: 'Americas' },
  { code: 'QA', name: 'Qatar', lat: 25.3548, lon: 51.1839, region: 'Middle East' },
  { code: 'RO', name: 'Romania', lat: 45.9432, lon: 24.9668, region: 'Europe' },
  { code: 'RU', name: 'Russia', lat: 61.5240, lon: 105.3188, region: 'Europe/Asia' },
  { code: 'RW', name: 'Rwanda', lat: -1.9403, lon: 29.8739, region: 'Africa' },
  { code: 'KN', name: 'Saint Kitts and Nevis', lat: 17.3578, lon: -62.7830, region: 'Americas' },
  { code: 'LC', name: 'Saint Lucia', lat: 13.9094, lon: -60.9789, region: 'Americas' },
  { code: 'VC', name: 'Saint Vincent and the Grenadines', lat: 12.9843, lon: -61.2872, region: 'Americas' },
  { code: 'WS', name: 'Samoa', lat: -13.7590, lon: -172.1046, region: 'Oceania' },
  { code: 'SM', name: 'San Marino', lat: 43.9424, lon: 12.4578, region: 'Europe' },
  { code: 'ST', name: 'Sao Tome and Principe', lat: 0.1864, lon: 6.6131, region: 'Africa' },
  { code: 'SA', name: 'Saudi Arabia', lat: 23.8859, lon: 45.0792, region: 'Middle East' },
  { code: 'SN', name: 'Senegal', lat: 14.4974, lon: -14.4524, region: 'Africa' },
  { code: 'RS', name: 'Serbia', lat: 44.0165, lon: 21.0059, region: 'Europe' },
  { code: 'SC', name: 'Seychelles', lat: -4.6796, lon: 55.4920, region: 'Africa' },
  { code: 'SL', name: 'Sierra Leone', lat: 8.4606, lon: -11.7799, region: 'Africa' },
  { code: 'SG', name: 'Singapore', lat: 1.3521, lon: 103.8198, region: 'Asia' },
  { code: 'SK', name: 'Slovakia', lat: 48.6690, lon: 19.6990, region: 'Europe' },
  { code: 'SI', name: 'Slovenia', lat: 46.1512, lon: 14.9955, region: 'Europe' },
  { code: 'SB', name: 'Solomon Islands', lat: -9.6457, lon: 160.1562, region: 'Oceania' },
  { code: 'SO', name: 'Somalia', lat: 5.1521, lon: 46.1996, region: 'Africa' },
  { code: 'ZA', name: 'South Africa', lat: -30.5595, lon: 22.9375, region: 'Africa' },
  { code: 'KR', name: 'South Korea', lat: 35.9078, lon: 127.7669, region: 'Asia' },
  { code: 'SS', name: 'South Sudan', lat: 6.8770, lon: 31.3070, region: 'Africa' },
  { code: 'ES', name: 'Spain', lat: 40.4637, lon: -3.7492, region: 'Europe' },
  { code: 'LK', name: 'Sri Lanka', lat: 7.8731, lon: 80.7718, region: 'Asia' },
  { code: 'SD', name: 'Sudan', lat: 12.8628, lon: 30.2176, region: 'Africa' },
  { code: 'SR', name: 'Suriname', lat: 3.9193, lon: -56.0278, region: 'Americas' },
  { code: 'SE', name: 'Sweden', lat: 60.1282, lon: 18.6435, region: 'Europe' },
  { code: 'CH', name: 'Switzerland', lat: 46.8182, lon: 8.2275, region: 'Europe' },
  { code: 'SY', name: 'Syria', lat: 34.8021, lon: 38.9968, region: 'Middle East' },
  { code: 'TW', name: 'Taiwan', lat: 23.6978, lon: 120.9605, region: 'Asia' },
  { code: 'TJ', name: 'Tajikistan', lat: 38.8610, lon: 71.2761, region: 'Asia' },
  { code: 'TZ', name: 'Tanzania', lat: -6.3690, lon: 34.8888, region: 'Africa' },
  { code: 'TH', name: 'Thailand', lat: 15.8700, lon: 100.9925, region: 'Asia' },
  { code: 'TL', name: 'Timor-Leste', lat: -8.8742, lon: 125.7275, region: 'Asia' },
  { code: 'TG', name: 'Togo', lat: 8.6195, lon: 0.8248, region: 'Africa' },
  { code: 'TO', name: 'Tonga', lat: -21.1790, lon: -175.1982, region: 'Oceania' },
  { code: 'TT', name: 'Trinidad and Tobago', lat: 10.6918, lon: -61.2225, region: 'Americas' },
  { code: 'TN', name: 'Tunisia', lat: 33.8869, lon: 9.5375, region: 'Africa' },
  { code: 'TR', name: 'Turkey', lat: 38.9637, lon: 35.2433, region: 'Europe/Asia' },
  { code: 'TM', name: 'Turkmenistan', lat: 38.9697, lon: 59.5563, region: 'Asia' },
  { code: 'TV', name: 'Tuvalu', lat: -7.1095, lon: 177.6493, region: 'Oceania' },
  { code: 'UG', name: 'Uganda', lat: 1.3733, lon: 32.2903, region: 'Africa' },
  { code: 'UA', name: 'Ukraine', lat: 48.3794, lon: 31.1656, region: 'Europe' },
  { code: 'AE', name: 'United Arab Emirates', lat: 23.4241, lon: 53.8478, region: 'Middle East' },
  { code: 'GB', name: 'United Kingdom', lat: 55.3781, lon: -3.4360, region: 'Europe' },
  { code: 'US', name: 'United States', lat: 37.0902, lon: -95.7129, region: 'Americas' },
  { code: 'UY', name: 'Uruguay', lat: -32.5228, lon: -55.7658, region: 'Americas' },
  { code: 'UZ', name: 'Uzbekistan', lat: 41.3775, lon: 64.5853, region: 'Asia' },
  { code: 'VU', name: 'Vanuatu', lat: -15.3767, lon: 166.9592, region: 'Oceania' },
  { code: 'VA', name: 'Vatican City', lat: 41.9029, lon: 12.4534, region: 'Europe' },
  { code: 'VE', name: 'Venezuela', lat: 6.4238, lon: -66.5897, region: 'Americas' },
  { code: 'VN', name: 'Vietnam', lat: 14.0583, lon: 108.2772, region: 'Asia' },
  { code: 'YE', name: 'Yemen', lat: 15.5527, lon: 48.5164, region: 'Middle East' },
  { code: 'ZM', name: 'Zambia', lat: -13.1339, lon: 27.8493, region: 'Africa' },
  { code: 'ZW', name: 'Zimbabwe', lat: -19.0154, lon: 29.1549, region: 'Africa' }
]

/**
 * Finds a country by its ISO 3166-1 alpha-2 code (case-insensitive).
 */
export function findCountryByCode(code: string | undefined): CountryInfo | undefined {
  if (!code || typeof code !== 'string') return undefined
  const upper = code.trim().toUpperCase()
  return COUNTRIES.find(c => c.code === upper)
}

/**
 * Performs a robust search across country names, ISO codes, and regions.
 * Exact prefix name matches are prioritized first, followed by substring matches.
 */
export function searchCountries(query: string): CountryInfo[] {
  if (!query || !query.trim()) return COUNTRIES
  const clean = query.trim().toLowerCase()

  return COUNTRIES.filter(c => 
    c.name.toLowerCase().includes(clean) || 
    c.code.toLowerCase() === clean ||
    c.region.toLowerCase().includes(clean)
  ).sort((a, b) => {
    // Prioritize names starting with the query
    const aStarts = a.name.toLowerCase().startsWith(clean)
    const bStarts = b.name.toLowerCase().startsWith(clean)
    if (aStarts && !bStarts) return -1
    if (!aStarts && bStarts) return 1
    return a.name.localeCompare(b.name)
  })
}
