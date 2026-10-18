import React, { useEffect, useRef } from 'react'
import { ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react'
import { BRAND } from '../../config/brand'
import type { QuestionDefinition, OnboardingAnswers, CountryInfo } from '../../store/types'
import { Card } from '../common/Card/Card'
import { Button } from '../common/Button/Button'
import { ProgressBar } from '../common/ProgressBar/ProgressBar'
import { CountryCombobox } from '../common/CountryCombobox/CountryCombobox'
import { CanvasContainer } from '../scenes/CanvasContainer'
import { getSceneConfig } from '../scenes/SceneRegistry'
import styles from './QuestionScreen.module.css'

export interface QuestionScreenProps {
  question: QuestionDefinition
  stepNumber: number
  totalSteps: number
  answers: OnboardingAnswers
  validationError: string | null
  onAnswerChange: (questionId: string, value: unknown) => void
  onNext: () => void
  onPrevious: () => void
}

export const QuestionScreen: React.FC<QuestionScreenProps> = ({
  question,
  stepNumber,
  totalSteps,
  answers,
  validationError,
  onAnswerChange,
  onNext,
  onPrevious,
}) => {
  const currentAnswer = answers[question.id]
  const sceneConfig = getSceneConfig(question.sceneId)
  const headingRef = useRef<HTMLHeadingElement>(null)

  // Focus the heading on question step change for screen reader clarity
  useEffect(() => {
    headingRef.current?.focus()
  }, [question.id])

  const handleRadioGroupKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (question.type !== 'single_choice' || !question.options || question.options.length === 0) return
    const options = question.options
    const currentIndex = options.findIndex((opt) => opt.id === currentAnswer)

    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault()
      const nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0
      const nextOption = options[nextIndex]
      onAnswerChange(question.id, nextOption.id)
      const input = document.getElementById(`card-input-${nextOption.id}`)
      input?.focus()
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault()
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1
      const prevOption = options[prevIndex]
      onAnswerChange(question.id, prevOption.id)
      const input = document.getElementById(`card-input-${prevOption.id}`)
      input?.focus()
    }
  }

  return (
    <main className={styles.wrapper}>
      <div className={styles.topBar}>
        <ProgressBar currentStep={stepNumber} totalSteps={totalSteps} />
      </div>

      <div className={styles.grid}>
        {/* Left Column: Accessible Question & Options */}
        <section className={styles.questionPanel} aria-labelledby={`q-title-${question.id}`}>
          <div className={styles.headerArea}>
            <h1
              id={`q-title-${question.id}`}
              ref={headingRef}
              tabIndex={-1}
              className={styles.title}
            >
              {question.title}
            </h1>
            {question.subtitle && (
              <p className={styles.subtitle}>{question.subtitle}</p>
            )}
          </div>

          {/* Validation Error Banner */}
          {validationError && (
            <div className={styles.errorAlert} role="alert" id={`q-error-${question.id}`}>
              <AlertCircle size={18} />
              <span>{validationError}</span>
            </div>
          )}

          {/* Question Input Type Routing */}
          {question.type === 'single_choice' && question.options && (
            <div 
              role="radiogroup" 
              aria-labelledby={`q-title-${question.id}`}
              className={styles.optionsGroup}
              onKeyDown={handleRadioGroupKeyDown}
            >
              {question.options.map((opt) => (
                <Card
                  key={opt.id}
                  id={opt.id}
                  name={question.id}
                  label={opt.label}
                  description={opt.description}
                  badge={opt.badge}
                  selected={currentAnswer === opt.id}
                  onClick={() => onAnswerChange(question.id, opt.id)}
                />
              ))}
            </div>
          )}

          {question.type === 'country_select' && (
            <CountryCombobox
              value={currentAnswer as CountryInfo | undefined}
              onChange={(country) => onAnswerChange(question.id, country)}
              onClear={() => onAnswerChange(question.id, undefined)}
              error={validationError || undefined}
            />
          )}

          {/* Navigation Controls */}
          <div className={styles.navRow}>
            <Button
              variant="secondary"
              size="md"
              onClick={onPrevious}
              iconLeft={<ArrowLeft size={18} />}
              id="back-button"
            >
              {BRAND.navigation.back}
            </Button>

            <Button
              variant="primary"
              size="md"
              onClick={onNext}
              iconRight={<ArrowRight size={18} />}
              id="continue-button"
            >
              {BRAND.navigation.continue}
            </Button>
          </div>
        </section>

        {/* Right Column: Reactive 3D Scene */}
        <aside className={styles.sceneArea}>
          <CanvasContainer fallback={sceneConfig.renderFallback({ answers })}>
            {({ paused, reducedMotion }) =>
              sceneConfig.renderScene({ answers, paused, reducedMotion })
            }
          </CanvasContainer>
        </aside>
      </div>
    </main>
  )
}
