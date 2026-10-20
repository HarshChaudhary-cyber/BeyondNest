import React, { useState, useMemo, useCallback } from 'react'
import { 
  CheckCircle2, 
  Circle, 
  RotateCcw, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  Compass, 
  Calendar, 
  Info, 
  ArrowLeft, 
  Check, 
  Sparkles,
  BookOpen,
  FileCheck2,
  AlertTriangle
} from 'lucide-react'
import type { OnboardingAnswers, StorageStatus, QuestionId } from '../../store/types'
import type { JourneyPhase, TaskCategory, StoredPlanState } from '../../planning/types'
import { generatePersonalisedPlan } from '../../planning/engine'
import { loadPlanProgress, savePlanProgress, CURRENT_PLAN_SCHEMA_VERSION } from '../../planning/storage'
import { Button } from '../common/Button/Button'
import { ExpenseWorksheet } from './ExpenseWorksheet'
import { FallbackPackingSuitcase } from '../scenes/fallbacks/Task2Fallbacks'
import styles from './MovingPlanScreen.module.css'

export interface MovingPlanScreenProps {
  answers: OnboardingAnswers
  storageStatus?: StorageStatus
  onEditProfile: () => void
  onReturnToReview: () => void
  onStartAgain?: (trigger?: HTMLElement | null) => void
  onEditQuestion?: (questionId: QuestionId) => void
}

const CATEGORY_NAMES: Record<TaskCategory, string> = {
  paperwork: 'Paperwork & Legal',
  housing: 'Housing & Accommodation',
  budget: 'Budget & Finances',
  insurance: 'Health & Insurance',
  travel: 'Travel & Packing',
  arrival: 'Arrival & Registration',
  daily_life: 'Daily Life & Setup',
  community: 'Community & Connections'
}

const PHASE_NAMES: Record<JourneyPhase, string> = {
  start_here: '1. Start here',
  before_departure: '2. Before departure',
  arrival_settling: '3. Arrival & settling in'
}

function hasReconciledDifferences(a: StoredPlanState, b: StoredPlanState): boolean {
  if (a.destinationCode !== b.destinationCode) return true
  if ((a.invalidatedTasks?.length ?? 0) !== (b.invalidatedTasks?.length ?? 0)) return true
  const aKeys = Object.keys(a.tasks)
  const bKeys = Object.keys(b.tasks)
  if (aKeys.length !== bKeys.length) return true
  return aKeys.some(id => {
    const recA = a.tasks[id]
    const recB = b.tasks[id]
    return !recB || recA.completed !== recB.completed || recA.contextKey !== recB.contextKey
  })
}

export const MovingPlanScreen: React.FC<MovingPlanScreenProps> = ({
  answers,
  storageStatus = 'saved',
  onEditProfile,
  onReturnToReview,
  onStartAgain
}) => {
  // Load and reconcile plan state on initial mount
  const [storedProgress, setStoredProgress] = useState<StoredPlanState>(() => {
    const loaded = loadPlanProgress()
    const { updatedProgress } = generatePersonalisedPlan(answers, loaded)
    if (hasReconciledDifferences(loaded, updatedProgress)) {
      savePlanProgress(updatedProgress)
      return updatedProgress
    }
    return loaded
  })

  // Synchronize state directly when answers prop changes
  const [prevAnswers, setPrevAnswers] = useState(answers)
  if (answers !== prevAnswers) {
    setPrevAnswers(answers)
    const { updatedProgress } = generatePersonalisedPlan(answers, storedProgress)
    if (hasReconciledDifferences(storedProgress, updatedProgress)) {
      savePlanProgress(updatedProgress)
      setStoredProgress(updatedProgress)
    }
  }

  const [activeTab, setActiveTab] = useState<'all' | JourneyPhase>('all')
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({})
  const [planSaveStatus, setPlanSaveStatus] = useState<StorageStatus>(() => storageStatus)

  // Re-generate plan from currently reconciled progress
  const { plan } = useMemo(() => {
    return generatePersonalisedPlan(answers, storedProgress)
  }, [answers, storedProgress])

  // Toggle task completion from current reconciled task state (guarantees 1-click completion)
  const handleToggleTask = useCallback((taskId: string) => {
    const currentTask = plan.allTasks.find(t => t.id === taskId)
    const nextCompleted = currentTask ? !currentTask.isCompleted : !storedProgress.tasks[taskId]?.completed
    const contextKey = currentTask ? currentTask.contextKey : (storedProgress.tasks[taskId]?.contextKey || 'gen')
    const nowIso = new Date().toISOString()

    const nextProgress: StoredPlanState = {
      ...storedProgress,
      version: CURRENT_PLAN_SCHEMA_VERSION,
      updatedAt: nowIso,
      destinationCode: plan.destinationCode,
      tasks: {
        ...storedProgress.tasks,
        [taskId]: {
          completed: nextCompleted,
          completedAt: nextCompleted ? nowIso : undefined,
          contextKey
        }
      }
    }

    const ok = savePlanProgress(nextProgress)
    setPlanSaveStatus(ok ? 'saved' : 'error')
    setStoredProgress(nextProgress)
  }, [plan, storedProgress])

  const toggleExpand = (taskId: string) => {
    setExpandedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }))
  }

  // Filter tasks
  const filteredTasks = useMemo(() => {
    if (activeTab === 'all') return plan.allTasks
    return plan.allTasks.filter(t => t.phase === activeTab)
  }, [plan.allTasks, activeTab])

  const uncompletedFiltered = filteredTasks.filter(t => !t.isCompleted)
  const completedFiltered = filteredTasks.filter(t => t.isCompleted)

  const progressPercent = plan.totalCount > 0 
    ? Math.round((plan.completedCount / plan.totalCount) * 100) 
    : 0

  return (
    <main className={styles.wrapper}>
      <article className={styles.container} aria-label="Personalised Moving Plan">
        
        {/* Top Luggage Tag Header */}
        <div className={styles.luggageHeader}>
          <div className={styles.luggageEyelet} aria-hidden="true" />
          <div className={styles.headerMeta}>
            <span className={`${styles.storageBadge} ${planSaveStatus === 'saved' ? styles.storageSaved : styles.storageWarning}`} role="status">
              {planSaveStatus === 'saved' ? (
                <>
                  <Check size={14} /> Saved to browser storage
                </>
              ) : (
                <>
                  <AlertTriangle size={14} /> In-memory only (storage unavailable)
                </>
              )}
            </span>
            <div className={styles.planBadge}>
              <Compass size={15} />
              <span>Personalised Relocation Roadmap</span>
            </div>
          </div>
        </div>

        {/* Hero Title & Illustration Bar */}
        <div className={styles.heroRow}>
          <div className={styles.heroText}>
            <div className={styles.destinationEyebrow}>
              <span>{plan.destinationTitle}</span>
              {plan.hasDestinationPack && (
                <span className={styles.packTag}>Curated Destination Guide</span>
              )}
            </div>
            <h1 className={styles.headline}>
              Your Personalised Moving Plan
            </h1>
            <p className={styles.supportingText}>
              A practical, source-backed checklist tailored to your relocation profile. Review your next immediate actions, check official requirements, and track your transition.
            </p>
            <div className={styles.priorityFocus}>
              <Sparkles size={16} className={styles.focusIcon} />
              <span>{plan.priorityFocusExplanation}</span>
            </div>
          </div>

          <aside className={styles.illustrationArea} aria-hidden="true">
            <div className={styles.illustrationCard}>
              <FallbackPackingSuitcase />
            </div>
          </aside>
        </div>

        {/* Notices: Destination pack coverage or material changes */}
        {plan.destinationPackNotice && (
          <div className={styles.noticeBox} role="note">
            <Info size={18} className={styles.noticeIcon} />
            <div className={styles.noticeContent}>
              <strong>Coverage Scope:</strong> {plan.destinationPackNotice}
            </div>
          </div>
        )}

        {plan.materialChangeNotice && (
          <div className={styles.changeNoticeBox} role="alert">
            <Info size={18} className={styles.changeNoticeIcon} />
            <div className={styles.changeNoticeContent}>
              <strong>Profile Update Detected:</strong> {plan.materialChangeNotice}
            </div>
          </div>
        )}

        {/* Progress Tracker Card */}
        <section className={styles.progressCard} aria-label="Preparation Progress">
          <div className={styles.progressInfo}>
            <span className={styles.progressLabel}>
              Overall Preparation Progress
            </span>
            <span className={styles.progressNumbers}>
              <strong>{plan.completedCount}</strong> of {plan.totalCount} actions completed ({progressPercent}%)
            </span>
          </div>
          <div className={styles.progressBar} role="progressbar" aria-valuenow={plan.completedCount} aria-valuemin={0} aria-valuemax={plan.totalCount}>
            <div 
              className={styles.progressFill} 
              style={{ width: `${progressPercent}%` }} 
            />
          </div>
        </section>

        {/* SECTION: Next Three Actionable Actions */}
        {plan.nextThreeTasks.length > 0 && (
          <section className={styles.nextActionsSection} aria-labelledby="next-actions-title">
            <div className={styles.sectionHeading}>
              <div className={styles.headingIcon} aria-hidden="true">
                <FileCheck2 size={20} />
              </div>
              <div>
                <h2 id="next-actions-title" className={styles.sectionTitle}>
                  Your Next 3 Actionable Priorities
                </h2>
                <p className={styles.sectionSubtitle}>
                  Identified by your timeline, journey stage, and immediate prerequisites.
                </p>
              </div>
            </div>

            <div className={styles.nextGrid}>
              {plan.nextThreeTasks.map((task, idx) => (
                <div key={task.id} className={styles.nextCard}>
                  <div className={styles.nextCardHeader}>
                    <span className={styles.actionNumber}>Step {idx + 1}</span>
                    <span className={styles.categoryBadge}>{CATEGORY_NAMES[task.category] || task.category}</span>
                  </div>

                  <h3 className={styles.nextCardTitle}>{task.title}</h3>
                  <p className={styles.nextCardAction}>{task.action}</p>

                  <div className={styles.nextCardFooter}>
                    <span className={styles.timingPill}>
                      <Calendar size={13} /> {task.suggestedTiming}
                    </span>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleToggleTask(task.id)}
                      iconLeft={<Check size={14} />}
                      aria-label={`Mark "${task.title}" as complete`}
                    >
                      Done
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SECTION: Complete Categorized Checklist */}
        <section className={styles.allTasksSection} aria-labelledby="all-tasks-title">
          <div className={styles.sectionHeading}>
            <div className={styles.headingIcon} aria-hidden="true">
              <BookOpen size={20} />
            </div>
            <div>
              <h2 id="all-tasks-title" className={styles.sectionTitle}>
                Full Relocation Checklist
              </h2>
              <p className={styles.sectionSubtitle}>
                Detailed actions with official source references and explanations.
              </p>
            </div>
          </div>

          {/* Phase Filter Tabs */}
          <div className={styles.tabBar} role="tablist" aria-label="Filter tasks by phase">
            <button
              role="tab"
              aria-selected={activeTab === 'all'}
              className={`${styles.tabButton} ${activeTab === 'all' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All Actions ({plan.totalCount})
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'start_here'}
              className={`${styles.tabButton} ${activeTab === 'start_here' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('start_here')}
            >
              Phase 1: Start Here
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'before_departure'}
              className={`${styles.tabButton} ${activeTab === 'before_departure' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('before_departure')}
            >
              Phase 2: Before Departure
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'arrival_settling'}
              className={`${styles.tabButton} ${activeTab === 'arrival_settling' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('arrival_settling')}
            >
              Phase 3: Arrival & Settling
            </button>
          </div>

          {/* Uncompleted Task List */}
          <div className={styles.taskList} role="list">
            {uncompletedFiltered.map(task => {
              const isExpanded = Boolean(expandedTasks[task.id])

              return (
                <div 
                  key={task.id} 
                  className={`${styles.taskItem} ${task.isCompleted ? styles.taskCompleted : ''}`}
                  role="listitem"
                >
                  <div className={styles.taskMain}>
                    <button
                      className={styles.checkboxBtn}
                      onClick={() => handleToggleTask(task.id)}
                      aria-label={`Mark "${task.title}" as complete`}
                      title="Toggle completion"
                    >
                      <Circle size={22} className={styles.circleIcon} />
                    </button>

                    <div className={styles.taskTextContent}>
                      <div className={styles.taskTagsRow}>
                        <span className={styles.categoryBadge}>
                          {CATEGORY_NAMES[task.category] || task.category}
                        </span>
                        <span className={styles.phaseBadge}>
                          {PHASE_NAMES[task.phase] || task.phase}
                        </span>
                        {task.isDestinationSpecific ? (
                          <span className={styles.destSpecificBadge}>
                            {task.destinationCountry === 'DE' ? '🇩🇪 Germany-Specific Guide' : '🇨🇦 Canada-Specific Guide'}
                          </span>
                        ) : (
                          <span className={styles.generalBadge}>
                            General Preparation Guidance
                          </span>
                        )}
                        {task.isArrangedAlready && (
                          <span className={styles.arrangedBadge}>
                            Arranged during onboarding
                          </span>
                        )}
                      </div>

                      <h3 className={styles.taskTitle}>{task.title}</h3>
                      <p className={styles.taskAction}>{task.action}</p>

                      <div className={styles.taskMetaRow}>
                        <span className={styles.timingPill}>
                          <Calendar size={13} /> {task.suggestedTiming}
                        </span>

                        <button
                          className={styles.expandToggle}
                          onClick={() => toggleExpand(task.id)}
                          aria-expanded={isExpanded}
                        >
                          <span>{isExpanded ? 'Hide explanation & sources' : 'Why this appears & official links'}</span>
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Details Drawer */}
                  {isExpanded && (
                    <div className={styles.expandedDetails}>
                      <div className={styles.whyBox}>
                        <strong>Why this appears for you:</strong>
                        <p>{task.whyItAppears}</p>
                      </div>

                      {/* Official Resources */}
                      {task.resources.length > 0 && (
                        <div className={styles.resourcesBox}>
                          <div className={styles.resourcesHeader}>
                            <Compass size={15} color="#0D9488" />
                            <span>Verified Official Government & Institutional Sources:</span>
                          </div>

                          <div className={styles.resourceList}>
                            {task.resources.map(res => (
                              <div key={res.id} className={styles.resourceCard}>
                                <div className={styles.resourceTop}>
                                  <a
                                    href={res.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.resourceLink}
                                  >
                                    <span>{res.title}</span>
                                    <ExternalLink size={14} />
                                  </a>
                                  <span className={styles.publisherBadge}>{res.publisher}</span>
                                </div>
                                <p className={styles.resourceSummary}>{res.summary}</p>
                                <div className={styles.resourceReview}>
                                  <span>Reviewed on: {res.reviewedOn}</span>
                                  <span>•</span>
                                  <span>{res.scopeAndLimitations}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Embedded Worksheet for budget estimation */}
                      {task.id === 'bgt_estimate_worksheet' && (
                        <ExpenseWorksheet initialCurrency={answers.living_budget?.currency || 'EUR'} />
                      )}
                    </div>
                  )}
                </div>
              )
            })}

            {uncompletedFiltered.length === 0 && (
              <div className={styles.emptyState}>
                <CheckCircle2 size={32} color="#0D9488" />
                <p>All actions in this phase have been marked completed!</p>
              </div>
            )}
          </div>

          {/* Completed Tasks Subsection */}
          {completedFiltered.length > 0 && (
            <div className={styles.completedSection}>
              <h3 className={styles.completedHeading}>
                Completed Preparations ({completedFiltered.length})
              </h3>
              <div className={styles.taskList} role="list">
                {completedFiltered.map(task => (
                  <div key={task.id} className={`${styles.taskItem} ${styles.taskCompleted}`} role="listitem">
                    <div className={styles.taskMain}>
                      <button
                        className={styles.checkboxBtn}
                        onClick={() => handleToggleTask(task.id)}
                        aria-label={`Reopen task "${task.title}"`}
                        title="Click to reopen"
                      >
                        <CheckCircle2 size={22} className={styles.checkDoneIcon} />
                      </button>

                      <div className={styles.taskTextContent}>
                        <h4 className={styles.taskTitleDone}>{task.title}</h4>
                        <span className={styles.timingDone}>Completed</span>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleTask(task.id)}
                      >
                        Reopen
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Bottom Actions Bar */}
        <div className={styles.bottomNav}>
          <Button
            variant="secondary"
            size="md"
            onClick={onReturnToReview}
            iconLeft={<ArrowLeft size={16} />}
            id="return-to-review-button"
          >
            Back to profile review
          </Button>

          <div className={styles.rightNavButtons}>
            <Button
              variant="outline"
              size="md"
              onClick={onEditProfile}
              id="edit-profile-button"
            >
              Edit answers
            </Button>

            <Button
              variant="secondary"
              size="md"
              onClick={(e) => onStartAgain?.(e.currentTarget)}
              iconLeft={<RotateCcw size={16} />}
              id="plan-start-again-button"
            >
              Start again
            </Button>
          </div>
        </div>

      </article>
    </main>
  )
}
