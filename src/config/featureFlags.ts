/**
 * BeyondNest Feature Flags
 */

export interface FeatureFlags {
  enable3DScenes: boolean
  enableSmoothTransitions: boolean
  persistProgressLocally: boolean
  enableLuggageTagAccents: boolean
  enableConfettiOnCompletion: boolean
  debugMode: boolean
}

export const FEATURE_FLAGS: FeatureFlags = {
  enable3DScenes: true,
  enableSmoothTransitions: true,
  persistProgressLocally: true,
  enableLuggageTagAccents: true,
  enableConfettiOnCompletion: true,
  debugMode: false,
}
