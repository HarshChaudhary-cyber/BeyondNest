import React from 'react'
import styles from './ProgressBar.module.css'
import { BRAND } from '../../../config/brand'

export interface ProgressBarProps {
  currentStep: number
  totalSteps: number
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentStep,
  totalSteps,
}) => {
  const percentage = Math.round((currentStep / totalSteps) * 100)
  const ariaText = `${BRAND.navigation.stepProgressPrefix} ${currentStep} ${BRAND.navigation.stepProgressOf} ${totalSteps}`

  return (
    <div 
      className={styles.progressWrapper}
      role="progressbar"
      aria-valuenow={currentStep}
      aria-valuemin={1}
      aria-valuemax={totalSteps}
      aria-valuetext={ariaText}
    >
      <div className={styles.labelRow}>
        <span className={styles.stepTag}>
          <span className={styles.flightDot} aria-hidden="true" />
          {BRAND.navigation.stepProgressPrefix} {currentStep} {BRAND.navigation.stepProgressOf} {totalSteps}
        </span>
        <span>{percentage}%</span>
      </div>

      <div className={styles.track}>
        <div 
          className={styles.fill} 
          style={{ width: `${percentage}%` }} 
        />
      </div>
    </div>
  )
}
