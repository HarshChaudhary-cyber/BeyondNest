import React from 'react'
import { Header } from '../common/Header/Header'
import { WelcomeScreen } from './WelcomeScreen'
import { QuestionScreen } from './QuestionScreen'
import { SummaryScreen } from './SummaryScreen'
import { useOnboardingStore } from '../../store/onboardingStore'
import { BRAND } from '../../config/brand'
import styles from './OnboardingShell.module.css'

const CURRENT_YEAR = new Date().getFullYear()

export const OnboardingShell: React.FC = () => {
  const {
    screen,
    answers,
    currentQuestion,
    currentStepNumber,
    totalSteps,
    validationError,
    setAnswer,
    startOnboarding,
    goToNextQuestion,
    goToPreviousQuestion,
    editAnswer,
    resetOnboarding
  } = useOnboardingStore()

  const isFlowActive = screen.type === 'question' || screen.type === 'summary'

  return (
    <div className={styles.shell}>
      <Header 
        showReset={isFlowActive} 
        onReset={resetOnboarding}
        onLogoClick={resetOnboarding}
      />

      <div className={styles.mainContent}>
        {screen.type === 'welcome' && (
          <WelcomeScreen
            answers={answers}
            onStart={startOnboarding}
          />
        )}

        {screen.type === 'question' && currentQuestion && (
          <QuestionScreen
            question={currentQuestion}
            stepNumber={currentStepNumber}
            totalSteps={totalSteps}
            answers={answers}
            validationError={validationError}
            onAnswerChange={setAnswer}
            onNext={goToNextQuestion}
            onPrevious={goToPreviousQuestion}
          />
        )}

        {screen.type === 'summary' && (
          <SummaryScreen
            answers={answers}
            onEditAnswer={editAnswer}
            onStartAgain={resetOnboarding}
          />
        )}
      </div>

      <footer className={styles.footer}>
        <span>© {CURRENT_YEAR} {BRAND.name}. {BRAND.tagline}</span>
        <div className={styles.footerLinks}>
          <span>Milestone 1 Preview</span>
          <span>•</span>
          <span>Privacy Conscious (Local Only)</span>
        </div>
      </footer>
    </div>
  )
}
