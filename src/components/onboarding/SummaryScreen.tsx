import React, { useEffect } from 'react'
import { 
  GraduationCap, 
  Briefcase, 
  HeartHandshake, 
  Compass, 
  MapPin, 
  RotateCcw, 
  Edit3, 
  Sparkles,
  Milestone,
  CheckCircle2
} from 'lucide-react'
import confetti from 'canvas-confetti'
import { BRAND } from '../../config/brand'
import { FEATURE_FLAGS } from '../../config/featureFlags'
import { getQuestionById } from '../../config/questions'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import type { OnboardingAnswers, QuestionId } from '../../store/types'
import { Button } from '../common/Button/Button'
import styles from './SummaryScreen.module.css'

export interface SummaryScreenProps {
  answers: OnboardingAnswers
  onEditAnswer: (questionId: QuestionId) => void
  onStartAgain: () => void
}

export const SummaryScreen: React.FC<SummaryScreenProps> = ({
  answers,
  onEditAnswer,
  onStartAgain,
}) => {
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    if (prefersReducedMotion) {
      if (typeof confetti.reset === 'function') {
        confetti.reset()
      }
      return
    }

    if (FEATURE_FLAGS.enableConfettiOnCompletion && typeof window !== 'undefined') {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.65 },
          colors: ['#0D9488', '#38BDF8', '#F59E0B', '#14B8A6']
        })
      } catch {
        // Safe fallback if canvas is restricted
      }
    }

    return () => {
      if (typeof confetti.reset === 'function') {
        confetti.reset()
      }
    }
  }, [prefersReducedMotion])

  // Resolve Human Labels by stable Question IDs (not array positions)
  const purposeQuestion = getQuestionById('relocation_purpose')
  const stageQuestion = getQuestionById('journey_stage')
  const purposeOption = purposeQuestion?.options?.find(o => o.id === answers.relocation_purpose)
  const stageOption = stageQuestion?.options?.find(o => o.id === answers.journey_stage)
  const country = answers.current_country

  const getPurposeIcon = () => {
    switch (answers.relocation_purpose) {
      case 'study': return <GraduationCap size={22} />
      case 'work': return <Briefcase size={22} />
      case 'family': return <HeartHandshake size={22} />
      case 'explore': return <Compass size={22} />
      default: return <Compass size={22} />
    }
  }

  return (
    <main className={styles.wrapper}>
      <article className={styles.card} aria-label="Onboarding Preview Summary">
        {/* Travel Luggage Tag Header */}
        <div className={styles.luggageTagTop}>
          <div className={styles.luggageEyelet} aria-hidden="true" title="Luggage Tag Eyelet" />
          <div className={styles.milestoneBadge}>
            <CheckCircle2 size={16} />
            <span>{BRAND.summary.badge}</span>
          </div>
        </div>

        <div className={styles.headerText}>
          <h1 className={styles.headline}>
            {BRAND.summary.headline}
          </h1>
          <p className={styles.supportingText}>
            {BRAND.summary.supportingText}
          </p>
        </div>

        {/* 3 Answer Summary Cards */}
        <div className={styles.summaryList} role="list" aria-label="Your captured responses">
          {/* Answer 1: Purpose */}
          <div className={styles.summaryItem} role="listitem">
            <div className={styles.itemLeft}>
              <div className={styles.itemIcon} aria-hidden="true">
                {getPurposeIcon()}
              </div>
              <div className={styles.itemDetails}>
                <span className={styles.itemCategory}>{BRAND.summary.purposeLabel}</span>
                <span className={styles.itemValue}>{purposeOption?.label || 'Not specified'}</span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEditAnswer('relocation_purpose')}
              iconLeft={<Edit3 size={14} />}
              aria-label={`Edit ${BRAND.summary.purposeLabel}`}
            >
              Edit
            </Button>
          </div>

          {/* Answer 2: Journey Stage */}
          <div className={styles.summaryItem} role="listitem">
            <div className={styles.itemLeft}>
              <div className={styles.itemIcon} aria-hidden="true">
                <Milestone size={22} />
              </div>
              <div className={styles.itemDetails}>
                <span className={styles.itemCategory}>{BRAND.summary.stageLabel}</span>
                <span className={styles.itemValue}>{stageOption?.label || 'Not specified'}</span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEditAnswer('journey_stage')}
              iconLeft={<Edit3 size={14} />}
              aria-label={`Edit ${BRAND.summary.stageLabel}`}
            >
              Edit
            </Button>
          </div>

          {/* Answer 3: Current Country */}
          <div className={styles.summaryItem} role="listitem">
            <div className={styles.itemLeft}>
              <div className={styles.itemIcon} aria-hidden="true">
                <MapPin size={22} />
              </div>
              <div className={styles.itemDetails}>
                <span className={styles.itemCategory}>{BRAND.summary.countryLabel}</span>
                <span className={styles.itemValue}>
                  {country ? `${country.name} (${country.code})` : 'Not specified'}
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEditAnswer('current_country')}
              iconLeft={<Edit3 size={14} />}
              aria-label={`Edit ${BRAND.summary.countryLabel}`}
            >
              Edit
            </Button>
          </div>
        </div>

        {/* Roadmap & Extension Point Note */}
        <div className={styles.roadmapBox}>
          <div className={styles.roadmapTitle}>
            <Sparkles size={16} color="#0D9488" />
            <span>Upcoming Milestones</span>
          </div>
          <p className={styles.roadmapDesc}>
            {BRAND.summary.nextMilestoneNote}
          </p>
        </div>

        {/* Action Controls */}
        <div className={styles.actionsRow}>
          <Button
            variant="secondary"
            size="md"
            onClick={onStartAgain}
            iconLeft={<RotateCcw size={16} />}
            id="start-again-button"
          >
            {BRAND.navigation.startAgain}
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => onEditAnswer('relocation_purpose')}
            iconLeft={<Edit3 size={16} />}
            id="edit-answers-button"
          >
            {BRAND.navigation.editAnswers}
          </Button>
        </div>
      </article>
    </main>
  )
}
