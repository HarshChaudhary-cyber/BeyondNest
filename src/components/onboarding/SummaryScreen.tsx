import React, { useEffect, useState } from 'react'
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
  CheckCircle2,
  Calendar,
  Clock,
  Luggage,
  Users,
  Wallet,
  ShieldCheck,
  Building2,
  Plane,
  AlertTriangle,
  Check
} from 'lucide-react'
import confetti from 'canvas-confetti'
import { FEATURE_FLAGS } from '../../config/featureFlags'
import { 
  getQuestionById, 
  resolveQuestionOptions, 
  getApplicableQuestions 
} from '../../config/questions'
import { findCitizenshipByCode } from '../../data/citizenships'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import type { OnboardingAnswers, QuestionId, StorageStatus } from '../../store/types'
import { Button } from '../common/Button/Button'
import styles from './SummaryScreen.module.css'

export interface SummaryScreenProps {
  answers: OnboardingAnswers
  storageStatus?: StorageStatus
  onEditAnswer: (questionId: QuestionId) => void
  onStartAgain: () => void
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export const SummaryScreen: React.FC<SummaryScreenProps> = ({
  answers,
  storageStatus = 'saved',
  onEditAnswer,
  onStartAgain,
}) => {
  const prefersReducedMotion = useReducedMotion()
  const [showConfirmReset, setShowConfirmReset] = useState(false)

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
        // Safe fallback
      }
    }

    return () => {
      if (typeof confetti.reset === 'function') {
        confetti.reset()
      }
    }
  }, [prefersReducedMotion])

  const applicable = getApplicableQuestions(answers)
  const isQuestionApplicable = (id: QuestionId) => applicable.some(q => q.id === id)

  // 1. Your Journey Values
  const purposeQ = getQuestionById('relocation_purpose')
  const purposeOpts = purposeQ ? resolveQuestionOptions(purposeQ, answers) : []
  const purposeLabel = purposeOpts.find(o => o.id === answers.relocation_purpose)?.label || 'Not specified'

  const stageQ = getQuestionById('journey_stage')
  const stageOpts = stageQ ? resolveQuestionOptions(stageQ, answers) : []
  const stageLabel = stageOpts.find(o => o.id === answers.journey_stage)?.label || 'Not specified'

  const currentCountryLabel = answers.current_country 
    ? `${answers.current_country.name} (${answers.current_country.code})` 
    : 'Not specified'

  const citizenshipLabel = answers.citizenship?.skipped 
    ? 'Skipped for now' 
    : (answers.citizenship?.codes?.map(c => findCitizenshipByCode(c)?.nationality || c).join(', ') || 'Not specified')

  const originCountryLabel = answers.origin_country_abroad && 'preferNotToSay' in answers.origin_country_abroad
    ? 'Prefer not to say'
    : (answers.origin_country_abroad?.name ? `${answers.origin_country_abroad.name} (${answers.origin_country_abroad.code})` : 'Not specified')

  const studyLevelQ = getQuestionById('study_level')
  const studyLevelOpts = studyLevelQ ? resolveQuestionOptions(studyLevelQ, answers) : []
  const studyLevelLabel = studyLevelOpts.find(o => o.id === answers.study_level)?.label || 'Not specified'

  const universityLabel = answers.university_name?.notDecided
    ? 'Not decided yet'
    : (answers.university_name?.name || 'Not specified')

  const workStatusQ = getQuestionById('work_status')
  const workStatusOpts = workStatusQ ? resolveQuestionOptions(workStatusQ, answers) : []
  const workStatusLabel = workStatusOpts.find(o => o.id === answers.work_status)?.label || 'Not specified'

  // 2. Destination and Travel Style Values
  const destCountryLabel = answers.destination_country && 'explore' in answers.destination_country && answers.destination_country.explore
    ? 'Exploring destinations'
    : (answers.destination_country && 'name' in answers.destination_country 
        ? `${answers.destination_country.name} (${answers.destination_country.code})` 
        : 'Not specified')

  const cityLabel = answers.destination_city?.notDecided
    ? 'Not decided yet'
    : (answers.destination_city?.cityName || 'Not specified')

  const destPrioritiesQ = getQuestionById('destination_priorities')
  const destPrioritiesOpts = destPrioritiesQ ? resolveQuestionOptions(destPrioritiesQ, answers) : []
  const destPrioritiesLabel = Array.isArray(answers.destination_priorities)
    ? answers.destination_priorities.map(p => destPrioritiesOpts.find(o => o.id === p)?.label || p).join(', ')
    : 'Not specified'

  let moveDateLabel = 'Not specified'
  if (answers.move_date) {
    if (answers.move_date.notSureYet) moveDateLabel = 'Not sure yet'
    else if (answers.move_date.preferNotToSay) moveDateLabel = 'Prefer not to say'
    else if (answers.move_date.month && answers.move_date.year) {
      moveDateLabel = `${MONTH_NAMES[answers.move_date.month - 1]} ${answers.move_date.year}`
    }
  }

  const durationQ = getQuestionById('planned_duration')
  const durationOpts = durationQ ? resolveQuestionOptions(durationQ, answers) : []
  const durationLabel = durationOpts.find(o => o.id === answers.planned_duration)?.label || 'Not specified'

  const travelStyleQ = getQuestionById('travel_style')
  const travelStyleOpts = travelStyleQ ? resolveQuestionOptions(travelStyleQ, answers) : []
  const travelStyleLabel = travelStyleOpts.find(o => o.id === answers.travel_style)?.label || 'Not specified'

  let backpackingLabel = 'Not specified'
  if (answers.backpacking_destinations) {
    if (answers.backpacking_destinations.planRouteForMe) {
      backpackingLabel = 'Help me plan my route'
    } else if (answers.backpacking_destinations.destinations?.length) {
      backpackingLabel = answers.backpacking_destinations.destinations.map((d, i) => `${i + 1}. ${d.name}`).join(' → ')
    }
  }

  const companionsQ = getQuestionById('companions')
  const companionsOpts = companionsQ ? resolveQuestionOptions(companionsQ, answers) : []
  const companionsLabel = companionsOpts.find(o => o.id === answers.companions)?.label || 'Not specified'

  let budgetLabel = 'Not specified'
  if (answers.living_budget) {
    if (answers.living_budget.helpEstimate) budgetLabel = 'Help me estimate'
    else if (answers.living_budget.amount) {
      budgetLabel = `${answers.living_budget.currency} ${answers.living_budget.amount.toLocaleString()}`
    }
  }

  // 3. Preparation and Priorities Values
  const prepQ = getQuestionById('preparation_status')
  const prepOpts = prepQ ? resolveQuestionOptions(prepQ, answers) : []
  const prepLabel = Array.isArray(answers.preparation_status)
    ? answers.preparation_status.map(p => prepOpts.find(o => o.id === p)?.label || p).join(', ')
    : 'Not specified'

  const prioritiesQ = getQuestionById('first_priority')
  const prioritiesOpts = prioritiesQ ? resolveQuestionOptions(prioritiesQ, answers) : []
  const firstPriorityLabel = Array.isArray(answers.first_priority)
    ? answers.first_priority.map(p => prioritiesOpts.find(o => o.id === p)?.label || p).join(', ')
    : 'Not specified'

  return (
    <main className={styles.wrapper}>
      <article className={styles.card} aria-label="Onboarding Complete Review">
        {/* Travel Luggage Tag Header */}
        <div className={styles.luggageTagTop}>
          <div className={styles.luggageEyelet} aria-hidden="true" title="Luggage Tag Eyelet" />
          <div className={styles.tagRight}>
            {storageStatus === 'saved' && (
              <span className={`${styles.storageBadge} ${styles.storageSaved}`} role="status">
                <Check size={14} /> Saved locally
              </span>
            )}
            {storageStatus === 'error' && (
              <span className={`${styles.storageBadge} ${styles.storageError}`} role="status">
                <AlertTriangle size={14} /> Storage limited (in memory)
              </span>
            )}
            <div className={styles.milestoneBadge}>
              <CheckCircle2 size={16} />
              <span>Milestone 2 Complete</span>
            </div>
          </div>
        </div>

        <div className={styles.headerText}>
          <h1 className={styles.headline}>
            Your next chapter is taking shape.
          </h1>
          <p className={styles.supportingText}>
            We’ve captured your complete relocation profile. Review your answers below, make edits if anything changed, or start fresh anytime.
          </p>
        </div>

        <div className={styles.sectionsContainer}>
          {/* GROUP 1: Your Journey */}
          <section className={styles.groupSection} aria-labelledby="group-journey-title">
            <div className={styles.groupHeader}>
              <Compass size={20} color="#0D9488" aria-hidden="true" />
              <h2 id="group-journey-title" className={styles.groupTitle}>Your journey</h2>
            </div>

            <div className={styles.summaryList} role="list">
              {/* Purpose */}
              {isQuestionApplicable('relocation_purpose') && (
                <div className={styles.summaryItem} role="listitem">
                  <div className={styles.itemLeft}>
                    <div className={styles.itemIcon} aria-hidden="true">
                      <GraduationCap size={20} />
                    </div>
                    <div className={styles.itemDetails}>
                      <span className={styles.itemCategory}>Purpose for Moving</span>
                      <span className={styles.itemValue}>{purposeLabel}</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditAnswer('relocation_purpose')}
                    iconLeft={<Edit3 size={14} />}
                    aria-label="Edit Purpose for Moving"
                  >
                    Edit
                  </Button>
                </div>
              )}

              {/* Stage */}
              {isQuestionApplicable('journey_stage') && (
                <div className={styles.summaryItem} role="listitem">
                  <div className={styles.itemLeft}>
                    <div className={styles.itemIcon} aria-hidden="true">
                      <Milestone size={20} />
                    </div>
                    <div className={styles.itemDetails}>
                      <span className={styles.itemCategory}>Journey Stage</span>
                      <span className={styles.itemValue}>{stageLabel}</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditAnswer('journey_stage')}
                    iconLeft={<Edit3 size={14} />}
                    aria-label="Edit Journey Stage"
                  >
                    Edit
                  </Button>
                </div>
              )}

              {/* Current Residence */}
              {isQuestionApplicable('current_country') && (
                <div className={styles.summaryItem} role="listitem">
                  <div className={styles.itemLeft}>
                    <div className={styles.itemIcon} aria-hidden="true">
                      <MapPin size={20} />
                    </div>
                    <div className={styles.itemDetails}>
                      <span className={styles.itemCategory}>Current Country</span>
                      <span className={styles.itemValue}>{currentCountryLabel}</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditAnswer('current_country')}
                    iconLeft={<Edit3 size={14} />}
                    aria-label="Edit Current Country"
                  >
                    Edit
                  </Button>
                </div>
              )}

              {/* Citizenship */}
              {isQuestionApplicable('citizenship') && (
                <div className={styles.summaryItem} role="listitem">
                  <div className={styles.itemLeft}>
                    <div className={styles.itemIcon} aria-hidden="true">
                      <ShieldCheck size={20} />
                    </div>
                    <div className={styles.itemDetails}>
                      <span className={styles.itemCategory}>Passport / Citizenship</span>
                      <span className={styles.itemValue}>{citizenshipLabel}</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditAnswer('citizenship')}
                    iconLeft={<Edit3 size={14} />}
                    aria-label="Edit Passport Citizenship"
                  >
                    Edit
                  </Button>
                </div>
              )}

              {/* Origin Country (already abroad) */}
              {isQuestionApplicable('origin_country_abroad') && (
                <div className={styles.summaryItem} role="listitem">
                  <div className={styles.itemLeft}>
                    <div className={styles.itemIcon} aria-hidden="true">
                      <Plane size={20} />
                    </div>
                    <div className={styles.itemDetails}>
                      <span className={styles.itemCategory}>Moved From</span>
                      <span className={styles.itemValue}>{originCountryLabel}</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditAnswer('origin_country_abroad')}
                    iconLeft={<Edit3 size={14} />}
                    aria-label="Edit Moved From Country"
                  >
                    Edit
                  </Button>
                </div>
              )}

              {/* Student Details */}
              {isQuestionApplicable('study_level') && (
                <div className={styles.summaryItem} role="listitem">
                  <div className={styles.itemLeft}>
                    <div className={styles.itemIcon} aria-hidden="true">
                      <GraduationCap size={20} />
                    </div>
                    <div className={styles.itemDetails}>
                      <span className={styles.itemCategory}>Study Level</span>
                      <span className={styles.itemValue}>{studyLevelLabel}</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditAnswer('study_level')}
                    iconLeft={<Edit3 size={14} />}
                    aria-label="Edit Study Level"
                  >
                    Edit
                  </Button>
                </div>
              )}

              {isQuestionApplicable('university_name') && (
                <div className={styles.summaryItem} role="listitem">
                  <div className={styles.itemLeft}>
                    <div className={styles.itemIcon} aria-hidden="true">
                      <Building2 size={20} />
                    </div>
                    <div className={styles.itemDetails}>
                      <span className={styles.itemCategory}>University / Institution</span>
                      <span className={styles.itemValue}>{universityLabel}</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditAnswer('university_name')}
                    iconLeft={<Edit3 size={14} />}
                    aria-label="Edit University"
                  >
                    Edit
                  </Button>
                </div>
              )}

              {/* Work Details */}
              {isQuestionApplicable('work_status') && (
                <div className={styles.summaryItem} role="listitem">
                  <div className={styles.itemLeft}>
                    <div className={styles.itemIcon} aria-hidden="true">
                      <Briefcase size={20} />
                    </div>
                    <div className={styles.itemDetails}>
                      <span className={styles.itemCategory}>Work Situation</span>
                      <span className={styles.itemValue}>{workStatusLabel}</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditAnswer('work_status')}
                    iconLeft={<Edit3 size={14} />}
                    aria-label="Edit Work Situation"
                  >
                    Edit
                  </Button>
                </div>
              )}
            </div>
          </section>

          {/* GROUP 2: Destination and Travel Style */}
          <section className={styles.groupSection} aria-labelledby="group-destination-title">
            <div className={styles.groupHeader}>
              <Plane size={20} color="#0D9488" aria-hidden="true" />
              <h2 id="group-destination-title" className={styles.groupTitle}>Destination and travel style</h2>
            </div>

            <div className={styles.summaryList} role="list">
              {/* Destination Country */}
              {isQuestionApplicable('destination_country') && (
                <div className={styles.summaryItem} role="listitem">
                  <div className={styles.itemLeft}>
                    <div className={styles.itemIcon} aria-hidden="true">
                      <MapPin size={20} />
                    </div>
                    <div className={styles.itemDetails}>
                      <span className={styles.itemCategory}>Destination</span>
                      <span className={styles.itemValue}>{destCountryLabel}</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditAnswer('destination_country')}
                    iconLeft={<Edit3 size={14} />}
                    aria-label="Edit Destination"
                  >
                    Edit
                  </Button>
                </div>
              )}

              {/* City */}
              {isQuestionApplicable('destination_city') && (
                <div className={styles.summaryItem} role="listitem">
                  <div className={styles.itemLeft}>
                    <div className={styles.itemIcon} aria-hidden="true">
                      <Building2 size={20} />
                    </div>
                    <div className={styles.itemDetails}>
                      <span className={styles.itemCategory}>City</span>
                      <span className={styles.itemValue}>{cityLabel}</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditAnswer('destination_city')}
                    iconLeft={<Edit3 size={14} />}
                    aria-label="Edit City"
                  >
                    Edit
                  </Button>
                </div>
              )}

              {/* Destination Priorities */}
              {isQuestionApplicable('destination_priorities') && (
                <div className={styles.summaryItem} role="listitem">
                  <div className={styles.itemLeft}>
                    <div className={styles.itemIcon} aria-hidden="true">
                      <Compass size={20} />
                    </div>
                    <div className={styles.itemDetails}>
                      <span className={styles.itemCategory}>Destination Priorities</span>
                      <span className={styles.itemValue}>{destPrioritiesLabel}</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditAnswer('destination_priorities')}
                    iconLeft={<Edit3 size={14} />}
                    aria-label="Edit Destination Priorities"
                  >
                    Edit
                  </Button>
                </div>
              )}

              {/* Move Date */}
              {isQuestionApplicable('move_date') && (
                <div className={styles.summaryItem} role="listitem">
                  <div className={styles.itemLeft}>
                    <div className={styles.itemIcon} aria-hidden="true">
                      <Calendar size={20} />
                    </div>
                    <div className={styles.itemDetails}>
                      <span className={styles.itemCategory}>Timeline</span>
                      <span className={styles.itemValue}>{moveDateLabel}</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditAnswer('move_date')}
                    iconLeft={<Edit3 size={14} />}
                    aria-label="Edit Timeline"
                  >
                    Edit
                  </Button>
                </div>
              )}

              {/* Duration */}
              {isQuestionApplicable('planned_duration') && (
                <div className={styles.summaryItem} role="listitem">
                  <div className={styles.itemLeft}>
                    <div className={styles.itemIcon} aria-hidden="true">
                      <Clock size={20} />
                    </div>
                    <div className={styles.itemDetails}>
                      <span className={styles.itemCategory}>Expected Stay</span>
                      <span className={styles.itemValue}>{durationLabel}</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditAnswer('planned_duration')}
                    iconLeft={<Edit3 size={14} />}
                    aria-label="Edit Expected Stay"
                  >
                    Edit
                  </Button>
                </div>
              )}

              {/* Travel Style */}
              {isQuestionApplicable('travel_style') && (
                <div className={styles.summaryItem} role="listitem">
                  <div className={styles.itemLeft}>
                    <div className={styles.itemIcon} aria-hidden="true">
                      <Luggage size={20} />
                    </div>
                    <div className={styles.itemDetails}>
                      <span className={styles.itemCategory}>Travel Style</span>
                      <span className={styles.itemValue}>{travelStyleLabel}</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditAnswer('travel_style')}
                    iconLeft={<Edit3 size={14} />}
                    aria-label="Edit Travel Style"
                  >
                    Edit
                  </Button>
                </div>
              )}

              {/* Backpacking Destinations */}
              {isQuestionApplicable('backpacking_destinations') && (
                <div className={styles.summaryItem} role="listitem">
                  <div className={styles.itemLeft}>
                    <div className={styles.itemIcon} aria-hidden="true">
                      <Compass size={20} />
                    </div>
                    <div className={styles.itemDetails}>
                      <span className={styles.itemCategory}>Backpacking Route</span>
                      <span className={styles.itemValue}>{backpackingLabel}</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditAnswer('backpacking_destinations')}
                    iconLeft={<Edit3 size={14} />}
                    aria-label="Edit Backpacking Route"
                  >
                    Edit
                  </Button>
                </div>
              )}

              {/* Companions */}
              {isQuestionApplicable('companions') && (
                <div className={styles.summaryItem} role="listitem">
                  <div className={styles.itemLeft}>
                    <div className={styles.itemIcon} aria-hidden="true">
                      <Users size={20} />
                    </div>
                    <div className={styles.itemDetails}>
                      <span className={styles.itemCategory}>Travel Party</span>
                      <span className={styles.itemValue}>{companionsLabel}</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditAnswer('companions')}
                    iconLeft={<Edit3 size={14} />}
                    aria-label="Edit Companions"
                  >
                    Edit
                  </Button>
                </div>
              )}

              {/* Living Budget */}
              {isQuestionApplicable('living_budget') && (
                <div className={styles.summaryItem} role="listitem">
                  <div className={styles.itemLeft}>
                    <div className={styles.itemIcon} aria-hidden="true">
                      <Wallet size={20} />
                    </div>
                    <div className={styles.itemDetails}>
                      <span className={styles.itemCategory}>Estimated Monthly Budget</span>
                      <span className={styles.itemValue}>{budgetLabel}</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditAnswer('living_budget')}
                    iconLeft={<Edit3 size={14} />}
                    aria-label="Edit Budget"
                  >
                    Edit
                  </Button>
                </div>
              )}
            </div>
          </section>

          {/* GROUP 3: Preparation and Priorities */}
          <section className={styles.groupSection} aria-labelledby="group-prep-title">
            <div className={styles.groupHeader}>
              <ShieldCheck size={20} color="#0D9488" aria-hidden="true" />
              <h2 id="group-prep-title" className={styles.groupTitle}>Preparation and priorities</h2>
            </div>

            <div className={styles.summaryList} role="list">
              {/* Preparation Status */}
              {isQuestionApplicable('preparation_status') && (
                <div className={styles.summaryItem} role="listitem">
                  <div className={styles.itemLeft}>
                    <div className={styles.itemIcon} aria-hidden="true">
                      <Luggage size={20} />
                    </div>
                    <div className={styles.itemDetails}>
                      <span className={styles.itemCategory}>Already Arranged</span>
                      <span className={styles.itemValue}>{prepLabel}</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditAnswer('preparation_status')}
                    iconLeft={<Edit3 size={14} />}
                    aria-label="Edit Arranged Items"
                  >
                    Edit
                  </Button>
                </div>
              )}

              {/* First Priorities */}
              {isQuestionApplicable('first_priority') && (
                <div className={styles.summaryItem} role="listitem">
                  <div className={styles.itemLeft}>
                    <div className={styles.itemIcon} aria-hidden="true">
                      <HeartHandshake size={20} />
                    </div>
                    <div className={styles.itemDetails}>
                      <span className={styles.itemCategory}>First Priorities for Support</span>
                      <span className={styles.itemValue}>{firstPriorityLabel}</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditAnswer('first_priority')}
                    iconLeft={<Edit3 size={14} />}
                    aria-label="Edit First Priorities"
                  >
                    Edit
                  </Button>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Milestone Note */}
        <div className={styles.roadmapBox}>
          <div className={styles.roadmapTitle}>
            <Sparkles size={18} color="#0D9488" />
            <span>Personalised Guidance in the Next Milestone</span>
          </div>
          <p className={styles.roadmapDesc}>
            Your profile is securely configured. In Milestone 3, we will introduce source-backed moving plans, official consular requirements, personalized timelines, and cost calculators based on your verified answers. No artificial suggestions or unverified estimates are shown here.
          </p>
        </div>

        {/* Action Controls */}
        <div className={styles.actionsRow}>
          <Button
            variant="secondary"
            size="md"
            onClick={() => setShowConfirmReset(true)}
            iconLeft={<RotateCcw size={16} />}
            id="start-again-button"
          >
            Start again
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => onEditAnswer('relocation_purpose')}
            iconLeft={<Edit3 size={16} />}
            id="edit-answers-button"
          >
            Edit answers
          </Button>
        </div>
      </article>

      {/* Confirmation Modal */}
      {showConfirmReset && (
        <div 
          className={styles.modalOverlay} 
          role="dialog" 
          aria-modal="true" 
          aria-labelledby="confirm-modal-title"
        >
          <div className={styles.modalCard}>
            <div className={styles.modalHeader}>
              <AlertTriangle size={24} color="#E11D48" />
              <h3 id="confirm-modal-title" className={styles.modalTitle}>Reset your journey?</h3>
            </div>
            <p className={styles.modalBody}>
              This will clear all your locally saved responses and return you to the welcome screen. This action cannot be undone.
            </p>
            <div className={styles.modalActions}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowConfirmReset(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setShowConfirmReset(false)
                  onStartAgain()
                }}
              >
                Reset everything
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
