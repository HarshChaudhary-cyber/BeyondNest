import React, { type KeyboardEvent } from 'react'
import styles from './Card.module.css'

export interface CardProps {
  id: string
  label: string
  description?: string
  badge?: string
  selected: boolean
  onClick: () => void
  name?: string
}

export const Card: React.FC<CardProps> = ({
  id,
  label,
  description,
  badge,
  selected,
  onClick,
}) => {
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      onClick()
    }
  }

  return (
    <div
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      id={`card-${id}`}
      className={`${styles.card} ${selected ? styles.selected : ''}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
    >
      <div className={styles.indicator} aria-hidden="true">
        {selected && <div className={styles.indicatorDot} />}
      </div>

      <div className={styles.content}>
        <div className={styles.headerRow}>
          <span className={styles.label}>{label}</span>
          {badge && <span className={styles.badge}>{badge}</span>}
        </div>
        {description && <p className={styles.description}>{description}</p>}
      </div>
    </div>
  )
}
