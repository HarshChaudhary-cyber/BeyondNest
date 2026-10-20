/**
 * BeyondNest Centralized 3D Scene Theme and Material Settings
 * 
 * Synchronized with CSS tokens defined in `src/styles/tokens.css`.
 * Acts as the single source of truth for WebGL 3D colors, lighting, and material properties.
 */

export const THEME_3D = {
  colors: {
    // Navy & Deep Space
    navyOceanDeep: '#0B1329',
    navyOceanMid: '#0F1E36',
    navy900: '#0F172A',
    navy800: '#1E293B',
    navy700: '#334155',
    navy400: '#94A3B8',
    navy200: '#E2E8F0',
    navy100: '#F1F5F9',

    // Sea Teal Accents
    seaTeal: '#0D9488',
    tealLand: '#0D9488',
    tealLandHighlight: '#14B8A6',
    tealLandStroke: '#2DD4BF',
    tealLightStroke: '#5EEAD4',
    tealDeep: '#0F766E',
    tealGlow: '#0D9488',
    tealPill: '#CCFBF1',
    tealSoft: '#F0FDFA',

    // Sky Blue Atmosphere
    skyAtmosphere: '#38BDF8',
    skyGrid: 'rgba(56, 189, 248, 0.08)',
    skyRimLight: '#38BDF8',

    // Warm Whites and Creams
    warmWhite: '#FAF9F5',
    pureWhite: '#FFFFFF',
    cream: '#FFFBEB',

    // Amber / Leather / Compass Accents
    warmAmber: '#F59E0B',
    amberGold: '#F59E0B',
    amberDark: '#B45309',
    amberDeep: '#78350F',
    brassCasing: '#D97706',
    windowGlow: '#FDE68A',

    // Coral / Pin Accents
    pinRed: '#E11D48',
    pinRedEmissive: '#BE123C',
    skinWarm: '#FFE4E6',
  },

  materials: {
    globeRoughness: 0.65,
    globeMetalness: 0.15,
    cloudsOpacity: 0.18,
    atmosphereHaloOpacity: 0.08,
    activeHighlightEmissiveIntensity: 0.35,
    pinPulseMinScale: 1.0,
    pinPulseMaxScale: 1.25,
  },

  lighting: {
    ambientColor: '#FAF9F5',
    ambientIntensity: 1.1,
    keyLightColor: '#FFFFFF',
    keyLightIntensity: 1.4,
    rimLightColor: '#38BDF8',
    rimLightIntensity: 0.8,
    bounceLightColor: '#2DD4BF',
    bounceLightIntensity: 0.4,
  }
} as const
