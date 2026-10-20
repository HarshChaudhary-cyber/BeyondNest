import React from 'react'
import { X, Route } from 'lucide-react'
import type { BackpackingDestinationsAnswer, CountryInfo } from '../../../store/types'
import { CountryCombobox } from '../../common/CountryCombobox/CountryCombobox'
import styles from './BackpackingSelect.module.css'

export interface BackpackingSelectProps {
  value?: BackpackingDestinationsAnswer
  onChange: (value: BackpackingDestinationsAnswer) => void
  error?: string
}

export const BackpackingSelect: React.FC<BackpackingSelectProps> = ({
  value = { destinations: [] },
  onChange,
  error
}) => {
  const isPlanRoute = Boolean(value.planRouteForMe)
  const destinations = value.destinations || []

  const handleAddCountry = (country: CountryInfo) => {
    // Avoid immediate duplicate additions, but append in exact selection order
    if (destinations.some(d => d.code === country.code)) return
    onChange({
      destinations: [...destinations, country],
      planRouteForMe: false
    })
  }

  const handleRemoveIndex = (index: number) => {
    const next = [...destinations]
    next.splice(index, 1)
    onChange({
      destinations: next,
      planRouteForMe: false
    })
  }

  const handleTogglePlanRoute = () => {
    if (isPlanRoute) {
      onChange({ destinations: [], planRouteForMe: false })
    } else {
      onChange({ destinations: [], planRouteForMe: true })
    }
  }

  return (
    <div className={styles.container}>
      {/* Country Adder */}
      <div className={styles.adderSection}>
        <span className={styles.sectionLabel}>Add a country to your tentative route</span>
        <CountryCombobox
          onChange={handleAddCountry}
          disabled={isPlanRoute}
          error={error}
        />
      </div>

      {/* Ordered Route List */}
      {destinations.length > 0 && !isPlanRoute && (
        <div className={styles.routeSection}>
          <span className={styles.routeHeader}>Your Tentative Route ({destinations.length} stop{destinations.length > 1 ? 's' : ''}):</span>
          <ol className={styles.routeList}>
            {destinations.map((dest, idx) => (
              <li key={`${dest.code}-${idx}`} className={styles.routeItem}>
                <div className={styles.stopNumber}>{idx + 1}</div>
                <div className={styles.stopDetails}>
                  <span className={styles.stopName}>{dest.name}</span>
                  <span className={styles.stopRegion}>{dest.region}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveIndex(idx)}
                  aria-label={`Remove ${dest.name} from route`}
                  className={styles.removeStopBtn}
                >
                  <X size={16} />
                </button>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Plan route for me option */}
      <button
        type="button"
        onClick={handleTogglePlanRoute}
        className={`${styles.planCard} ${isPlanRoute ? styles.planCardSelected : ''}`}
        aria-pressed={isPlanRoute}
      >
        <Route size={20} className={styles.planIcon} />
        <div className={styles.planContent}>
          <span className={styles.planTitle}>Help me plan my route</span>
          <span className={styles.planDesc}>
            Not sure where to begin? We’ll help you sketch an itinerary based on visa reciprocity and seasons.
          </span>
        </div>
      </button>

      <p className={styles.helperText}>
        Selection order is preserved as your tentative user-defined route. All selections work cleanly from these controls without needing to rotate the 3D globe.
      </p>
    </div>
  )
}
