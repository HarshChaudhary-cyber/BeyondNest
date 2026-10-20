import React, { useState } from 'react'
import { Header } from '../common/Header/Header'
import { ConfirmResetDialog } from '../common/ConfirmResetDialog/ConfirmResetDialog'
import { WelcomeScreen } from './WelcomeScreen'
import { QuestionScreen } from './QuestionScreen'
import { SummaryScreen } from './SummaryScreen'
import { MovingPlanScreen } from '../plan/MovingPlanScreen'
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
    storageStatus,
    setAnswer,
    startOnboarding,
    navigateToWelcome,
    navigateToPlan,
    navigateToSummary,
    goToNextQuestion,
    goToPreviousQuestion,
    editAnswer,
    resetOnboarding
  } = useOnboardingStore()

  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)
  const [resetTriggerElement, setResetTriggerElement] = useState<HTMLElement | null>(null)

  const isFlowActive = screen.type === 'question' || screen.type === 'summary' || screen.type === 'plan'

  const handleRequestReset = (trigger?: HTMLElement | null) => {
    setResetTriggerElement(trigger || (document.activeElement as HTMLElement | null))
    setIsResetDialogOpen(true)
  }

  return (
    <div className={styles.shell}>
      <div 
        className={styles.contentWrapper}
        inert={isResetDialogOpen ? true : undefined}
        aria-hidden={isResetDialogOpen ? true : undefined}
      >
        <Header 
          showReset={isFlowActive} 
          onReset={(e) => handleRequestReset(e?.currentTarget)}
          onLogoClick={navigateToWelcome}
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
              storageStatus={storageStatus}
              onEditAnswer={editAnswer}
              onStartAgain={handleRequestReset}
              onViewPlan={navigateToPlan}
            />
          )}

          {screen.type === 'plan' && (
            <MovingPlanScreen
              answers={answers}
              onEditProfile={navigateToSummary}
              onReturnToReview={navigateToSummary}
              onEditQuestion={editAnswer}
            />
          )}
        </div>

        <footer className={styles.footer}>
          <span>© {CURRENT_YEAR} {BRAND.name}. {BRAND.tagline}</span>
          <div className={styles.footerLinks}>
            <span>Adaptive Relocation Preparation</span>
            <span>•</span>
            <span>Privacy Conscious (Local Only)</span>
          </div>
        </footer>
      </div>

      <ConfirmResetDialog
        isOpen={isResetDialogOpen}
        triggerElement={resetTriggerElement}
        onConfirm={() => {
          setIsResetDialogOpen(false)
          resetOnboarding()
        }}
        onCancel={() => {
          setIsResetDialogOpen(false)
        }}
      />
    </div>
  )
}
