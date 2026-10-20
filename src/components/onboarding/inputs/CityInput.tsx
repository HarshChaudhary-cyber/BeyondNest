import React, { useId } from 'react'
import { MapPin } from 'lucide-react'
import type { DestinationCityAnswer } from '../../../store/types'
import styles from './CityInput.module.css'

export interface CityInputProps {
  value?: DestinationCityAnswer
  onChange: (value: DestinationCityAnswer) => void
  isAlreadyAbroad?: boolean
  error?: string
}

export const CityInput: React.FC<CityInputProps> = ({
  value = {},
  onChange,
  isAlreadyAbroad = false,
  error
}) => {
  const inputId = useId()
  const isNotDecided = Boolean(value.notDecided)
  const cityName = value.cityName || ''

  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ cityName: e.target.value, notDecided: false })
  }

  const handleToggleNotDecided = () => {
    if (isNotDecided) {
      onChange({ cityName: '', notDecided: false })
    } else {
      onChange({ cityName: '', notDecided: true })
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.inputWrapper}>
        <MapPin size={18} className={styles.pinIcon} aria-hidden="true" />
        <input
          id={inputId}
          type="text"
          value={cityName}
          onChange={handleCityChange}
          placeholder={isAlreadyAbroad ? "e.g. London, Tokyo, Toronto..." : "e.g. Melbourne, Berlin, Vancouver..."}
          disabled={isNotDecided}
          aria-invalid={Boolean(error)}
          aria-label={isAlreadyAbroad ? "Which city do you live in?" : "Target city"}
          className={`${styles.input} ${error ? styles.inputError : ''} ${isNotDecided ? styles.disabledInput : ''}`}
        />
      </div>

      <div className={styles.toggleRow}>
        <label htmlFor="city-not-decided-checkbox" className={styles.toggleLabel}>
          <input
            type="checkbox"
            id="city-not-decided-checkbox"
            checked={isNotDecided}
            onChange={handleToggleNotDecided}
            className={styles.checkbox}
          />
          <span>{isAlreadyAbroad ? "Prefer not to specify city" : "Not decided yet / exploring cities"}</span>
        </label>
      </div>

      <p className={styles.helperText}>
        {isAlreadyAbroad
          ? "Enter your city of residence abroad, or leave flexible."
          : "Target cities help us pinpoint local housing and living expenses. You can change this at any time."}
      </p>
    </div>
  )
}
