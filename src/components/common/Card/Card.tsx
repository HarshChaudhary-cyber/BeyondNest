import React, { type ChangeEvent } from 'react'
import styles from './Card.module.css'

export interface CardProps {
  id: string
  label: string
  description?: string
  badge?: string
  selected: boolean
  onClick: () => void
  name?: string
  disabled?: boolean
}

export const Card: React.FC<CardProps> = ({
  id,
  label,
  description,
  badge,
  selected,
  onClick,
  name = 'onboarding-choice',
  disabled = false,
}) => {
  const inputId = `card-input-${id}`
  const descId = description ? `card-desc-${id}` : undefined

  // Native radio semantics: single callback on genuine change
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!disabled && e.target.checked && !selected) {
      onClick()
    }
  }

  return (
    <label
      htmlFor={inputId}
      id={`card-${id}`}
      className={`${styles.card} ${selected ? styles.selected : ''} ${disabled ? styles.disabled : ''}`}
    >
      <input
        type="radio"
        id={inputId}
        name={name}
        value={id}
        checked={selected}
        aria-checked={selected}
        onChange={handleChange}
        disabled={disabled}
        aria-describedby={descId}
        className={styles.nativeRadio}
      />

      <div className={styles.indicator} aria-hidden="true">
        {selected && <div className={styles.indicatorDot} />}
      </div>

      <div className={styles.content}>
        <div className={styles.headerRow}>
          <span className={styles.label}>{label}</span>
          {badge && (
            <span className={styles.badge} aria-hidden="true">
              {badge}
            </span>
          )}
        </div>
        {description && (
          <p id={descId} className={styles.description}>
            {description}
          </p>
        )}
      </div>
    </label>
  )
}
