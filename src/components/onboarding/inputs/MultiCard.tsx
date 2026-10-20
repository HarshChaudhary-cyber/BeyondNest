import React, { type ChangeEvent } from 'react'
import { Check } from 'lucide-react'
import styles from './MultiCard.module.css'

export interface MultiCardProps {
  id: string
  label: string
  description?: string
  badge?: string
  selected: boolean
  onToggle: () => void
  disabled?: boolean
  name?: string
}

export const MultiCard: React.FC<MultiCardProps> = ({
  id,
  label,
  description,
  badge,
  selected,
  onToggle,
  disabled = false,
  name = 'multi-choice'
}) => {
  const inputId = `multicard-input-${id}`
  const descId = description ? `multicard-desc-${id}` : undefined

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!disabled) {
      e.stopPropagation()
      onToggle()
    }
  }

  return (
    <label
      htmlFor={inputId}
      id={`multicard-${id}`}
      className={`${styles.card} ${selected ? styles.selected : ''} ${disabled ? styles.disabled : ''}`}
    >
      <input
        type="checkbox"
        id={inputId}
        name={name}
        value={id}
        checked={selected}
        aria-checked={selected}
        onChange={handleChange}
        disabled={disabled}
        aria-describedby={descId}
        className={styles.nativeCheckbox}
      />

      <div className={styles.indicator} aria-hidden="true">
        {selected && <Check size={14} strokeWidth={3} />}
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
