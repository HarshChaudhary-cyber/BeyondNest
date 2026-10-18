import { describe, it, expect, beforeEach } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { App } from '../App'
import { BRAND } from '../config/brand'

describe('Onboarding Flow Navigation Integration', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('navigates from Welcome screen through all 3 questions to Summary screen and allows editing', async () => {
    render(<App />)

    // 1. Welcome Screen
    expect(screen.getByText(BRAND.welcome.headline)).toBeInTheDocument()
    const startButton = screen.getByRole('button', { name: new RegExp(BRAND.welcome.primaryButton, 'i') })
    expect(startButton).toBeInTheDocument()

    // Click Start
    fireEvent.click(startButton)

    // 2. Question 1: What brings you to a new country?
    await waitFor(() => {
      expect(screen.getByText('What brings you to a new country?')).toBeInTheDocument()
    })
    expect(screen.getByText('Preview step 1 of 3')).toBeInTheDocument()

    // Try to continue without selecting
    const continueBtn1 = screen.getByRole('button', { name: new RegExp(BRAND.navigation.continue, 'i') })
    fireEvent.click(continueBtn1)

    // Should display validation error
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Please select what brings you to a new country')
    })

    // Select "Study"
    const studyCard = screen.getByRole('radio', { name: /Study/i })
    fireEvent.click(studyCard)
    expect(studyCard).toHaveAttribute('aria-checked', 'true')

    // Click Continue
    fireEvent.click(continueBtn1)

    // 3. Question 2: Where are you in your journey?
    await waitFor(() => {
      expect(screen.getByText('Where are you in your journey?')).toBeInTheDocument()
    })
    expect(screen.getByText('Preview step 2 of 3')).toBeInTheDocument()

    // Test Back button
    const backBtn2 = screen.getByRole('button', { name: new RegExp(BRAND.navigation.back, 'i') })
    fireEvent.click(backBtn2)

    // Should return to Question 1 with Study still selected
    await waitFor(() => {
      expect(screen.getByText('What brings you to a new country?')).toBeInTheDocument()
    })
    expect(screen.getByRole('radio', { name: /Study/i })).toHaveAttribute('aria-checked', 'true')

    // Go forward again to Question 2
    fireEvent.click(screen.getByRole('button', { name: new RegExp(BRAND.navigation.continue, 'i') }))

    await waitFor(() => {
      expect(screen.getByText('Where are you in your journey?')).toBeInTheDocument()
    })

    // Select "Accepted / offer received"
    const acceptedCard = screen.getByRole('radio', { name: /Accepted \/ offer received/i })
    fireEvent.click(acceptedCard)

    // Continue to Question 3
    const continueBtn2 = screen.getByRole('button', { name: new RegExp(BRAND.navigation.continue, 'i') })
    fireEvent.click(continueBtn2)

    // 4. Question 3: Where do you currently live?
    await waitFor(() => {
      expect(screen.getByText('Where do you currently live?')).toBeInTheDocument()
    })
    expect(screen.getByText('Preview step 3 of 3')).toBeInTheDocument()

    // Select country in combobox
    const countryInput = screen.getByRole('combobox')
    fireEvent.focus(countryInput)
    fireEvent.change(countryInput, { target: { value: 'Japan' } })

    // Wait for option to appear and click it
    await waitFor(() => {
      expect(screen.getByRole('option', { name: /Japan/i })).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole('option', { name: /Japan/i }))

    // Continue to Summary
    const continueBtn3 = screen.getByRole('button', { name: new RegExp(BRAND.navigation.continue, 'i') })
    fireEvent.click(continueBtn3)

    // 5. Summary Screen: Your journey is taking shape.
    await waitFor(() => {
      expect(screen.getByText(BRAND.summary.headline)).toBeInTheDocument()
    })

    // Check summarized answers
    expect(screen.getByText('Study')).toBeInTheDocument()
    expect(screen.getByText('Accepted / offer received')).toBeInTheDocument()
    expect(screen.getByText('Japan (JP)')).toBeInTheDocument()

    // 6. Test Edit Answers
    const editPurposeBtn = screen.getByRole('button', { name: /Edit Purpose for Moving/i })
    fireEvent.click(editPurposeBtn)

    // Should return to Question 1
    await waitFor(() => {
      expect(screen.getByText('What brings you to a new country?')).toBeInTheDocument()
    })

    // Change purpose to Work
    const workCard = screen.getByRole('radio', { name: /^Work/i })
    fireEvent.click(workCard)
    expect(workCard).toHaveAttribute('aria-checked', 'true')

    // 7. Test Reset / Start Again
    const headerResetBtn = screen.getByRole('button', { name: new RegExp(BRAND.navigation.startAgain, 'i') })
    fireEvent.click(headerResetBtn)

    // Should return to Welcome screen
    await waitFor(() => {
      expect(screen.getByText(BRAND.welcome.headline)).toBeInTheDocument()
    })
  })
})
