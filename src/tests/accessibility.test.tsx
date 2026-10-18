import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Card } from '../components/common/Card/Card'
import { CountryCombobox } from '../components/common/CountryCombobox/CountryCombobox'
import { QuestionScreen } from '../components/onboarding/QuestionScreen'
import { SummaryScreen } from '../components/onboarding/SummaryScreen'
import { QUESTIONS } from '../config/questions'
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

describe('Keyboard Accessibility and ARIA Semantics', () => {
  it('renders Card with accessible native radio input semantics and visible labels', () => {
    const handleClick = vi.fn()
    const { rerender } = render(
      <Card
        id="study"
        name="test-question"
        label="Study"
        description="Higher education and student exchange"
        badge="Education"
        selected={false}
        onClick={handleClick}
      />
    )

    const radioInput = screen.getByRole('radio', { name: /Study/i })
    expect(radioInput).toBeInTheDocument()
    expect(radioInput).not.toBeChecked()
    expect(radioInput).toHaveAttribute('aria-checked', 'false')
    expect(radioInput).toHaveAttribute('name', 'test-question')

    // Clicking unselected radio input triggers selection callback
    fireEvent.click(radioInput)
    expect(handleClick).toHaveBeenCalledTimes(1)

    // When already selected, subsequent clicks do not dispatch duplicate changes
    rerender(
      <Card
        id="study"
        name="test-question"
        label="Study"
        description="Higher education and student exchange"
        badge="Education"
        selected={true}
        onClick={handleClick}
      />
    )
    expect(radioInput).toBeChecked()
    expect(radioInput).toHaveAttribute('aria-checked', 'true')
    fireEvent.click(radioInput)
    expect(handleClick).toHaveBeenCalledTimes(1) // Still 1
  })

  it('supports Arrow key navigation across single_choice options in QuestionScreen', () => {
    const handleAnswerChange = vi.fn()
    const question1 = QUESTIONS[0] // relocation_purpose with options: study, work, family, explore

    render(
      <QuestionScreen
        question={question1}
        stepNumber={1}
        totalSteps={3}
        answers={{ relocation_purpose: 'study' }}
        validationError={null}
        onAnswerChange={handleAnswerChange}
        onNext={vi.fn()}
        onPrevious={vi.fn()}
      />
    )

    const radiogroup = screen.getByRole('radiogroup')
    expect(radiogroup).toBeInTheDocument()

    // Press ArrowDown to advance from 'study' to 'work'
    fireEvent.keyDown(radiogroup, { key: 'ArrowDown' })
    expect(handleAnswerChange).toHaveBeenCalledWith('relocation_purpose', 'work')

    // Press ArrowUp to move backwards
    fireEvent.keyDown(radiogroup, { key: 'ArrowUp' })
    expect(handleAnswerChange).toHaveBeenCalledWith('relocation_purpose', 'explore')
  })

  it('manages CountryCombobox dropdown state, outside clicks, and container blur appropriately', async () => {
    const handleChange = vi.fn()
    const { container } = render(
      <div>
        <div data-testid="outside-element">Outside</div>
        <CountryCombobox
          onChange={handleChange}
        />
      </div>
    )

    const input = screen.getByRole('combobox')
    expect(input).toHaveAttribute('aria-expanded', 'false')
    // aria-activedescendant must NOT be set when closed
    expect(input).not.toHaveAttribute('aria-activedescendant')

    // Focus input to open listbox
    fireEvent.focus(input)
    expect(input).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('listbox')).toBeInTheDocument()

    // Escape closes the listbox
    fireEvent.keyDown(input, { key: 'Escape' })
    expect(input).toHaveAttribute('aria-expanded', 'false')
    expect(input).not.toHaveAttribute('aria-activedescendant')

    // Reopen and click outside to dismiss
    fireEvent.focus(input)
    expect(input).toHaveAttribute('aria-expanded', 'true')

    const outside = screen.getByTestId('outside-element')
    fireEvent.mouseDown(outside)
    expect(input).toHaveAttribute('aria-expanded', 'false')

    // Blur focus outside container
    fireEvent.focus(input)
    expect(input).toHaveAttribute('aria-expanded', 'true')
    const wrapper = container.querySelector('[role="combobox"]')?.closest('div')
    fireEvent.blur(wrapper!, { relatedTarget: outside })
    expect(input).toHaveAttribute('aria-expanded', 'false')
  })

  it('handles zero search results safely and does not assign invalid aria-activedescendant', () => {
    render(
      <CountryCombobox
        onChange={vi.fn()}
      />
    )

    const input = screen.getByRole('combobox')
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'XYZNonExistentCountry' } })

    // No matching results message displayed
    expect(screen.getByText('No matching country found.')).toBeInTheDocument()
    // aria-activedescendant must be undefined when no options match
    expect(input).not.toHaveAttribute('aria-activedescendant')

    // Pressing Enter does not trigger selection or error
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(screen.queryByRole('option')).not.toBeInTheDocument()
  })

  it('associates validation errors with CountryCombobox input using aria-describedby and aria-invalid', () => {
    const errorMessage = 'Please select a valid origin country'
    render(
      <CountryCombobox
        onChange={vi.fn()}
        error={errorMessage}
      />
    )

    const input = screen.getByRole('combobox')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    
    const describedById = input.getAttribute('aria-describedby')
    expect(describedById).toBeTruthy()

    const errorElement = screen.getByRole('alert')
    expect(errorElement).toHaveAttribute('id', describedById!)
    expect(errorElement).toHaveTextContent(errorMessage)
  })
})

describe('Reduced Motion and Fragility Removal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('resolves summary screen question labels by stable ID and renders correctly', () => {
    render(
      <SummaryScreen
        answers={{
          relocation_purpose: 'work',
          journey_stage: 'exploring',
          current_country: {
            code: 'IN',
            name: 'India',
            lat: 20.5937,
            lon: 78.9629,
            region: 'Asia'
          }
        }}
        onEditAnswer={vi.fn()}
        onStartAgain={vi.fn()}
      />
    )

    // Check that human labels from stable question definition are rendered
    expect(screen.getByText('Work')).toBeInTheDocument()
    expect(screen.getByText('Just exploring')).toBeInTheDocument()
    expect(screen.getByText('India (IN)')).toBeInTheDocument()
  })

  it('cleans up confetti effects on unmount', () => {
    const { unmount } = render(
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

    unmount()
    expect(getConfettiResetMock()).toHaveBeenCalled()
  })
})
