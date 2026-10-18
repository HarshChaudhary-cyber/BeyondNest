import { describe, it, expect } from 'vitest'
import { getQuestionById } from '../config/questions'
import { findCountryByCode, searchCountries } from '../data/countries'

describe('Answer Validation Rules', () => {
  it('validates question 1 (relocation_purpose) correctly', () => {
    const q1 = getQuestionById('relocation_purpose')
    expect(q1).toBeDefined()

    // Valid values
    expect(q1?.validate('study')).toEqual({ valid: true })
    expect(q1?.validate('work')).toEqual({ valid: true })
    expect(q1?.validate('family')).toEqual({ valid: true })
    expect(q1?.validate('explore')).toEqual({ valid: true })

    // Invalid values
    expect(q1?.validate('')).toEqual({ valid: false, error: expect.any(String) })
    expect(q1?.validate('vacation')).toEqual({ valid: false, error: expect.any(String) })
    expect(q1?.validate(null)).toEqual({ valid: false, error: expect.any(String) })
    expect(q1?.validate(123)).toEqual({ valid: false, error: expect.any(String) })
  })

  it('validates question 2 (journey_stage) correctly', () => {
    const q2 = getQuestionById('journey_stage')
    expect(q2).toBeDefined()

    // Valid values
    expect(q2?.validate('exploring')).toEqual({ valid: true })
    expect(q2?.validate('preparing_apps')).toEqual({ valid: true })
    expect(q2?.validate('accepted_offer')).toEqual({ valid: true })
    expect(q2?.validate('preparing_leave')).toEqual({ valid: true })
    expect(q2?.validate('already_abroad')).toEqual({ valid: true })

    // Invalid values
    expect(q2?.validate('')).toEqual({ valid: false, error: expect.any(String) })
    expect(q2?.validate('unknown_stage')).toEqual({ valid: false, error: expect.any(String) })
    expect(q2?.validate(undefined)).toEqual({ valid: false, error: expect.any(String) })
  })

  it('validates question 3 (current_country) correctly', () => {
    const q3 = getQuestionById('current_country')
    expect(q3).toBeDefined()

    // Valid country object
    expect(q3?.validate({
      code: 'GB',
      name: 'United Kingdom',
      lat: 55.3781,
      lon: -3.4360,
      region: 'Europe'
    })).toEqual({ valid: true })

    // Invalid values
    expect(q3?.validate(null)).toEqual({ valid: false, error: expect.any(String) })
    expect(q3?.validate({})).toEqual({ valid: false, error: expect.any(String) })
    expect(q3?.validate({ code: 'GB' })).toEqual({ valid: false, error: expect.any(String) })
    expect(q3?.validate('United Kingdom')).toEqual({ valid: false, error: expect.any(String) })
  })

  it('searches and filters countries dataset reliably', () => {
    const uk = findCountryByCode('gb')
    expect(uk).toBeDefined()
    expect(uk?.name).toBe('United Kingdom')

    const searchResults = searchCountries('germ')
    expect(searchResults.some(c => c.name === 'Germany')).toBe(true)

    const codeResults = searchCountries('JP')
    expect(codeResults.some(c => c.code === 'JP' && c.name === 'Japan')).toBe(true)
  })
})
