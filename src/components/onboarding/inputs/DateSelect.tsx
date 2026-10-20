import React from 'react'
import { Calendar } from 'lucide-react'
import type { MoveDateAnswer } from '../../../store/types'
import styles from './DateSelect.module.css'

export interface DateSelectProps {
  value?: MoveDateAnswer
  onChange: (value: MoveDateAnswer) => void
  isAlreadyAbroad?: boolean
  error?: string
}

const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' }
]

const CURRENT_YEAR = new Date().getFullYear()

export const DateSelect: React.FC<DateSelectProps> = ({
  value = {},
  onChange,
  isAlreadyAbroad = false,
  error
}) => {
  const currentYear = CURRENT_YEAR
  const isFlexible = isAlreadyAbroad ? Boolean(value.preferNotToSay) : Boolean(value.notSureYet)

  // Generate range of years:
  // For already abroad: last 10 years up to current year
  // For planning: current year up to next 10 years
  const yearOptions: number[] = []
  if (isAlreadyAbroad) {
    for (let y = currentYear; y >= currentYear - 10; y--) {
      yearOptions.push(y)
    }
  } else {
    for (let y = currentYear; y <= currentYear + 10; y++) {
      yearOptions.push(y)
    }
  }

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const month = parseInt(e.target.value, 10)
    onChange({
      year: value.year || currentYear,
      month,
      notSureYet: false,
      preferNotToSay: false
    })
  }

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const year = parseInt(e.target.value, 10)
    onChange({
      year,
      month: value.month || 1,
      notSureYet: false,
      preferNotToSay: false
    })
  }

  const handleToggleFlexible = () => {
    if (isFlexible) {
      onChange({ year: currentYear, month: new Date().getMonth() + 1 })
    } else {
      if (isAlreadyAbroad) {
        onChange({ preferNotToSay: true })
      } else {
        onChange({ notSureYet: true })
      }
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.selectsRow}>
        <div className={styles.fieldGroup}>
          <label htmlFor="date-month-select" className={styles.label}>Month</label>
          <div className={styles.selectWrapper}>
            <Calendar size={18} className={styles.fieldIcon} aria-hidden="true" />
            <select
              id="date-month-select"
              value={value.month || ''}
              onChange={handleMonthChange}
              disabled={isFlexible}
              aria-invalid={Boolean(error)}
              className={`${styles.select} ${error ? styles.selectError : ''} ${isFlexible ? styles.disabledSelect : ''}`}
            >
              <option value="">Select month...</option>
              {MONTHS.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="date-year-select" className={styles.label}>Year</label>
          <div className={styles.selectWrapper}>
            <select
              id="date-year-select"
              value={value.year || ''}
              onChange={handleYearChange}
              disabled={isFlexible}
              aria-invalid={Boolean(error)}
              className={`${styles.select} ${error ? styles.selectError : ''} ${isFlexible ? styles.disabledSelect : ''}`}
            >
              <option value="">Select year...</option>
              {yearOptions.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className={styles.toggleRow}>
        <label htmlFor="date-flexible-checkbox" className={styles.toggleLabel}>
          <input
            type="checkbox"
            id="date-flexible-checkbox"
            checked={isFlexible}
            onChange={handleToggleFlexible}
            className={styles.checkbox}
          />
          <span>{isAlreadyAbroad ? "Prefer not to say" : "Not sure yet"}</span>
        </label>
      </div>

      <p className={styles.helperText}>
        {isAlreadyAbroad
          ? "Tell us when you arrived abroad, or choose prefer not to say."
          : "Select your expected move month and year. Current month is allowed; past months are not."}
      </p>
    </div>
  )
}
