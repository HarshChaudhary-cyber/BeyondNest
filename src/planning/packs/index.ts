import type { DestinationPack, OnboardingAnswers } from '../types'
import { germanyStudentsPack } from './germanyStudents'
import { canadaStudentsPack } from './canadaStudents'

export const DESTINATION_PACKS: DestinationPack[] = [
  germanyStudentsPack,
  canadaStudentsPack
]

/**
 * Finds a matching destination pack for the user's selected country and purpose.
 * Only returns a pack when destination and purpose explicitly match a curated pack.
 */
export function findMatchingDestinationPack(answers: OnboardingAnswers): DestinationPack | undefined {
  const destCountry = answers.destination_country
  if (!destCountry || 'explore' in destCountry || !destCountry.code) {
    return undefined
  }

  const purpose = answers.relocation_purpose
  if (!purpose) return undefined

  return DESTINATION_PACKS.find(
    pack => pack.destinationCountry === destCountry.code && pack.purpose === purpose
  )
}
