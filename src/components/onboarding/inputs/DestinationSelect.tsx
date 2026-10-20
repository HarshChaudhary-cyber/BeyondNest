import React from 'react'
import { Compass } from 'lucide-react'
import type { DestinationCountryAnswer, CountryInfo } from '../../../store/types'
import { CountryCombobox } from '../../common/CountryCombobox/CountryCombobox'
import styles from './DestinationSelect.module.css'

export interface DestinationSelectProps {
  value?: DestinationCountryAnswer
  onChange: (value: DestinationCountryAnswer | undefined) => void
  error?: string
}

export const DestinationSelect: React.FC<DestinationSelectProps> = ({
  value,
  onChange,
  error
}) => {
  const isExploring = Boolean(value && 'explore' in value && value.explore)
  const selectedCountry = value && !('explore' in value && value.explore) && 'code' in value
    ? (value as CountryInfo)
    : undefined

  const handleSelectCountry = (country: CountryInfo) => {
    onChange(country)
  }

  const handleSelectExplore = () => {
    if (isExploring) {
      onChange(undefined)
    } else {
      onChange({ explore: true })
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.countrySection}>
        <span className={styles.sectionLabel}>Select destination country or territory</span>
        <CountryCombobox
          value={selectedCountry}
          onChange={handleSelectCountry}
          onClear={() => onChange(undefined)}
          error={!isExploring ? error : undefined}
        />
      </div>

      <div className={styles.divider}>
        <span className={styles.dividerText}>or</span>
      </div>

      <button
        type="button"
        onClick={handleSelectExplore}
        className={`${styles.exploreCard} ${isExploring ? styles.exploreCardSelected : ''}`}
        aria-pressed={isExploring}
      >
        <div className={styles.exploreIconWrapper}>
          <Compass size={22} className={styles.exploreIcon} />
        </div>
        <div className={styles.exploreContent}>
          <span className={styles.exploreTitle}>Help me explore destinations</span>
          <span className={styles.exploreDesc}>
            Undecided on a specific country? We will guide you based on your study, work, and lifestyle priorities.
          </span>
        </div>
        {isExploring && (
          <span className={styles.selectedBadge}>Selected</span>
        )}
      </button>
    </div>
  )
}
