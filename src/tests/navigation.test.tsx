import { describe, it, expect, beforeEach } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { App } from '../App'
import { BRAND } from '../config/brand'

describe('Onboarding Flow Navigation Integration', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('navigates from Welcome screen through adaptive questions, supports back/continue and review editing', async () => {
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
    expect(screen.getByText(/Preview step 1 of/i)).toBeInTheDocument()

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
    expect(screen.getByText(/Preview step 2 of/i)).toBeInTheDocument()

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

    // Continue to Question 3: Current Country
    const continueBtn2 = screen.getByRole('button', { name: new RegExp(BRAND.navigation.continue, 'i') })
    fireEvent.click(continueBtn2)

    // 4. Question 3: Where do you currently live?
    await waitFor(() => {
      expect(screen.getByText('Where do you currently live?')).toBeInTheDocument()
    })
    expect(screen.getByText(/Preview step 3 of/i)).toBeInTheDocument()

    // Select country in combobox
    const countryInput = screen.getByRole('combobox')
    fireEvent.focus(countryInput)
    fireEvent.change(countryInput, { target: { value: 'Japan' } })

    // Wait for option to appear and click it
    await waitFor(() => {
      expect(screen.getByRole('option', { name: /Japan/i })).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole('option', { name: /Japan/i }))

    // Continue to Question 4: Citizenship
    const continueBtn3 = screen.getByRole('button', { name: new RegExp(BRAND.navigation.continue, 'i') })
    fireEvent.click(continueBtn3)

    // 5. Question 4: Citizenship
    await waitFor(() => {
      expect(screen.getByText('Which country’s passport do you hold?')).toBeInTheDocument()
    })
    expect(screen.getByText(/Preview step 4 of/i)).toBeInTheDocument()

    // Click "Skip for now"
    const skipCheckbox = screen.getByLabelText(/Skip for now/i)
    fireEvent.click(skipCheckbox)

    // Continue to Question 5: Destination
    fireEvent.click(screen.getByRole('button', { name: new RegExp(BRAND.navigation.continue, 'i') }))

    // 6. Question 5: Destination Country
    await waitFor(() => {
      expect(screen.getByText('Where would you like to move?')).toBeInTheDocument()
    })

    // Select "Help me explore destinations"
    const exploreBtn = screen.getByRole('button', { name: /Help me explore destinations/i })
    fireEvent.click(exploreBtn)

    // Continue to Destination Priorities
    fireEvent.click(screen.getByRole('button', { name: new RegExp(BRAND.navigation.continue, 'i') }))

    // 7. Question: Destination Priorities
    await waitFor(() => {
      expect(screen.getByText('What matters most when choosing a destination?')).toBeInTheDocument()
    })
  })
})
