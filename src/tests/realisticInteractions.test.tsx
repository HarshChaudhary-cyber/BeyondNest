import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, within, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Card } from '../components/common/Card/Card'
import { CountryCombobox } from '../components/common/CountryCombobox/CountryCombobox'
import { QuestionScreen } from '../components/onboarding/QuestionScreen'
import { SummaryScreen } from '../components/onboarding/SummaryScreen'
import { QUESTIONS } from '../config/questions'
import { COUNTRIES, COUNTRY_DATASET_METADATA } from '../data/countries'
import confetti from 'canvas-confetti'

// Mock canvas-confetti
vi.mock('canvas-confetti', () => {
  const fn = vi.fn() as unknown as { (): void; reset: ReturnType<typeof vi.fn> }
  fn.reset = vi.fn()
  return { default: fn }
})

const getConfettiResetMock = () => {
  return (confetti as unknown as { reset: ReturnType<typeof vi.fn> }).reset
}

describe('Task 1.2: Realistic User Interactions with user-event', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('focuses combobox input, searches, and reliably clicks a country option with mouse/pointer', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()

    render(
      <div>
        <div data-testid="outside">Outside Area</div>
        <CountryCombobox onChange={handleChange} />
      </div>
    )

    const input = screen.getByRole('combobox')
    await user.click(input)
    expect(input).toHaveAttribute('aria-expanded', 'true')

    await user.type(input, 'Japan')
    const option = await screen.findByRole('option', { name: /Japan/i })
    expect(option).toBeInTheDocument()

    // Clicking option must select country despite blur dismissal
    await user.click(option)
    expect(handleChange).toHaveBeenCalledTimes(1)
    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 'JP',
        name: 'Japan'
      })
    )

    // Dropdown should close after selection
    expect(input).toHaveAttribute('aria-expanded', 'false')
  })

  it('supports keyboard country selection and outside dismissal', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()

    render(
      <div>
        <button data-testid="outside-button">Outside Button</button>
        <CountryCombobox onChange={handleChange} />
      </div>
    )

    const input = screen.getByRole('combobox')

    // 1. Keyboard selection: focus, ArrowDown, and Enter
    await user.click(input)
    expect(input).toHaveAttribute('aria-expanded', 'true')

    // Navigate to second option and hit Enter
    await user.keyboard('{ArrowDown}{Enter}')
    expect(handleChange).toHaveBeenCalledTimes(1)
    expect(input).toHaveAttribute('aria-expanded', 'false')

    // 2. Outside dismissal: open listbox, then click outside
    await user.click(input)
    expect(input).toHaveAttribute('aria-expanded', 'true')

    const outsideBtn = screen.getByTestId('outside-button')
    await user.click(outsideBtn)
    expect(input).toHaveAttribute('aria-expanded', 'false')
  })

  it('selects radio through its label, input directly, Space, and Arrow keys with one callback per genuine change', async () => {
    const user = userEvent.setup()
    const handleAnswerChange = vi.fn()
    const question1 = QUESTIONS[0] // relocation_purpose: study, work, family, explore

    const StatefulQuestionScreen = () => {
      const [answers, setAnswers] = React.useState<Record<string, unknown>>({})
      return (
        <QuestionScreen
          question={question1}
          stepNumber={1}
          totalSteps={3}
          answers={answers}
          validationError={null}
          onAnswerChange={(qId, val) => {
            handleAnswerChange(qId, val)
            setAnswers(prev => ({ ...prev, [qId]: val }))
          }}
          onNext={vi.fn()}
          onPrevious={vi.fn()}
        />
      )
    }

    render(<StatefulQuestionScreen />)

    // 1. Select through label click
    const studyLabel = within(screen.getByRole('radiogroup')).getByText('Study')
    await user.click(studyLabel)
    expect(handleAnswerChange).toHaveBeenCalledTimes(1)
    expect(handleAnswerChange).toHaveBeenLastCalledWith('relocation_purpose', 'study')

    // Clicking already selected choice should NOT fire another callback
    await user.click(studyLabel)
    expect(handleAnswerChange).toHaveBeenCalledTimes(1) // Still 1

    // 2. Select through input click directly
    const workRadio = screen.getByRole('radio', { name: /^Work/i })
    await user.click(workRadio)
    expect(handleAnswerChange).toHaveBeenCalledTimes(2)
    expect(handleAnswerChange).toHaveBeenLastCalledWith('relocation_purpose', 'work')

    // Clicking already selected input should NOT fire another callback
    await user.click(workRadio)
    expect(handleAnswerChange).toHaveBeenCalledTimes(2) // Still 2

    // 3. Select through Space on focused input
    const familyRadio = screen.getByRole('radio', { name: /^Join family/i })
    familyRadio.focus()
    expect(familyRadio).toHaveFocus()
    await user.keyboard(' ')
    expect(handleAnswerChange).toHaveBeenCalledTimes(3)
    expect(handleAnswerChange).toHaveBeenLastCalledWith('relocation_purpose', 'family')

    // Pressing Space again on already-checked radio should not trigger redundant callback
    await user.keyboard(' ')
    expect(handleAnswerChange).toHaveBeenCalledTimes(3) // Still 3

    // 4. Select through Arrow keys on radiogroup
    const radiogroup = screen.getByRole('radiogroup')
    radiogroup.focus()
    await user.keyboard('{ArrowDown}')
    expect(handleAnswerChange).toHaveBeenCalledTimes(4)
    expect(handleAnswerChange).toHaveBeenLastCalledWith('relocation_purpose', 'explore')
  })

  it('guarantees Card fires exactly one selection callback per changed choice', async () => {
    const user = userEvent.setup()
    const handleSelect = vi.fn()

    const { rerender } = render(
      <Card
        id="test-opt"
        name="test"
        label="Test Option"
        selected={false}
        onClick={handleSelect}
      />
    )

    const label = screen.getByText('Test Option')
    await user.click(label)
    expect(handleSelect).toHaveBeenCalledTimes(1)

    // Once selected, subsequent clicks do not dispatch changes
    rerender(
      <Card
        id="test-opt"
        name="test"
        label="Test Option"
        selected={true}
        onClick={handleSelect}
      />
    )

    await user.click(label)
    expect(handleSelect).toHaveBeenCalledTimes(1) // Still 1

    const input = screen.getByRole('radio', { name: 'Test Option' })
    await user.click(input)
    expect(handleSelect).toHaveBeenCalledTimes(1) // Still 1
  })
})

describe('Task 1.2: Reduced-Motion Confetti Lifecycle', () => {
  let originalMatchMedia: typeof window.matchMedia

  beforeEach(() => {
    vi.clearAllMocks()
    originalMatchMedia = window.matchMedia
  })

  afterEach(() => {
    window.matchMedia = originalMatchMedia
  })

  it('does not run confetti if reduced-motion preference is enabled before mount', () => {
    // Mock matchMedia returning true for prefers-reduced-motion
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('prefers-reduced-motion: reduce'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    render(
      <SummaryScreen
        answers={{
          relocation_purpose: 'study',
          journey_stage: 'exploring',
          current_country: {
            code: 'CA',
            name: 'Canada',
            lat: 56.1304,
            lon: -106.3468,
            region: 'Americas'
          }
        }}
        onEditAnswer={vi.fn()}
        onStartAgain={vi.fn()}
      />
    )

    expect(confetti).not.toHaveBeenCalled()
    expect(getConfettiResetMock()).toHaveBeenCalled()
  })

  it('cleans up active confetti when reduced-motion preference changes at runtime', async () => {
    let changeHandler: ((e: MediaQueryListEvent) => void) | null = null

    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false, // Initially false (animations allowed)
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn((event: string, handler: (e: MediaQueryListEvent) => void) => {
        if (event === 'change') changeHandler = handler
      }),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    render(
      <SummaryScreen
        answers={{
          relocation_purpose: 'study',
          journey_stage: 'exploring',
          current_country: {
            code: 'CA',
            name: 'Canada',
            lat: 56.1304,
            lon: -106.3468,
            region: 'Americas'
          }
        }}
        onEditAnswer={vi.fn()}
        onStartAgain={vi.fn()}
      />
    )

    // Initially confetti runs
    expect(confetti).toHaveBeenCalled()
    const initialResetCount = getConfettiResetMock().mock.calls.length

    // Now trigger runtime preference change to reduce motion
    expect(changeHandler).toBeTruthy()
    act(() => {
      changeHandler!({ matches: true } as MediaQueryListEvent)
    })

    // confetti.reset must be called upon switching to reduced motion
    await waitFor(() => {
      expect(getConfettiResetMock().mock.calls.length).toBeGreaterThan(initialResetCount)
    })
  })
})

describe('Task 1.2: Country Dataset Integrity & Mathematical Consistency', () => {
  it('has consistent metadata dynamically derived from the dataset', () => {
    expect(COUNTRY_DATASET_METADATA.totalCount).toBe(COUNTRIES.length)
    expect(COUNTRIES.length).toBe(202)

    const breakdown = COUNTRY_DATASET_METADATA.breakdown
    expect(breakdown.unMemberStates).toBe(193)
    expect(breakdown.unObserverStates).toBe(2)
    expect(breakdown.territoriesAndSpecialRegions).toBe(7)
    expect(breakdown.totalCalculated).toBe(202)
    expect(breakdown.unMemberStates + breakdown.unObserverStates + breakdown.territoriesAndSpecialRegions).toBe(COUNTRIES.length)
  })

  it('documents distinct source URLs and appropriate licenses for all components', () => {
    expect(COUNTRY_DATASET_METADATA.sources).toHaveLength(3)
    const [isoSource, naturalEarthSource, unSource] = COUNTRY_DATASET_METADATA.sources

    expect(isoSource.url).toContain('iso.org')
    expect(naturalEarthSource.url).toContain('naturalearthdata.com')
    expect(unSource.url).toContain('unstats.un.org')

    expect(naturalEarthSource.licensing).toContain('Public Domain')
  })

  it('contains valid and finite coordinates for all entries', () => {
    const codes = new Set<string>()

    COUNTRIES.forEach(c => {
      expect(c.code).toMatch(/^[A-Z]{2}$/)
      expect(codes.has(c.code)).toBe(false)
      codes.add(c.code)

      expect(c.name.trim().length).toBeGreaterThan(0)
      expect(Number.isFinite(c.lat)).toBe(true)
      expect(Number.isFinite(c.lon)).toBe(true)
      expect(c.lat).toBeGreaterThanOrEqual(-90)
      expect(c.lat).toBeLessThanOrEqual(90)
      expect(c.lon).toBeGreaterThanOrEqual(-180)
      expect(c.lon).toBeLessThanOrEqual(180)
    })
  })
})
