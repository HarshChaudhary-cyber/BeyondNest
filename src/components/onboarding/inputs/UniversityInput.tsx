import React, { useId } from 'react'
import { GraduationCap } from 'lucide-react'
import type { UniversityNameAnswer } from '../../../store/types'
import styles from './UniversityInput.module.css'

export interface UniversityInputProps {
  value?: UniversityNameAnswer
  onChange: (value: UniversityNameAnswer) => void
  isAlreadyAbroad?: boolean
  error?: string
}

export const UniversityInput: React.FC<UniversityInputProps> = ({
  value = {},
  onChange,
  isAlreadyAbroad = false,
  error
}) => {
  const inputId = useId()
  const isNotDecided = Boolean(value.notDecided)
  const name = value.name || ''

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ name: e.target.value, notDecided: false })
  }

  const handleToggleNotDecided = () => {
    if (isNotDecided) {
      onChange({ name: '', notDecided: false })
    } else {
      onChange({ name: '', notDecided: true })
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.inputWrapper}>
        <GraduationCap size={18} className={styles.capIcon} aria-hidden="true" />
        <input
          id={inputId}
          type="text"
          value={name}
          onChange={handleNameChange}
          placeholder={isAlreadyAbroad ? "e.g. University of Melbourne, Sorbonne..." : "e.g. Oxford, McGill, TUM Munich..."}
          disabled={isNotDecided}
          aria-invalid={Boolean(error)}
          aria-label={isAlreadyAbroad ? "Which university do you attend?" : "Which university will you attend?"}
          className={`${styles.input} ${error ? styles.inputError : ''} ${isNotDecided ? styles.disabledInput : ''}`}
        />
      </div>

      <div className={styles.toggleRow}>
        <label htmlFor="uni-not-decided-checkbox" className={styles.toggleLabel}>
          <input
            type="checkbox"
            id="uni-not-decided-checkbox"
            checked={isNotDecided}
            onChange={handleToggleNotDecided}
            className={styles.checkbox}
          />
          <span>{isAlreadyAbroad ? "Prefer not to specify university" : "Not decided yet / exploring universities"}</span>
        </label>
      </div>

      <p className={styles.helperText}>
        {isAlreadyAbroad
          ? "We use your university to identify campus services and student support networks."
          : "Entering your university helps us find official admission timelines and housing options."}
      </p>
    </div>
  )
}
