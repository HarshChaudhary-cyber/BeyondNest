import React, { useState, useId, useRef } from 'react'
import { Search, X, ShieldAlert, Check } from 'lucide-react'
import { searchCitizenships, findCitizenshipByCode } from '../../../data/citizenships'
import type { CitizenshipAnswer } from '../../../store/types'
import styles from './CitizenshipSelect.module.css'

export interface CitizenshipSelectProps {
  value?: CitizenshipAnswer
  onChange: (value: CitizenshipAnswer) => void
  error?: string
}

export const CitizenshipSelect: React.FC<CitizenshipSelectProps> = ({
  value = { codes: [] },
  onChange,
  error
}) => {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const inputId = useId()
  const listboxId = useId()
  const containerRef = useRef<HTMLDivElement>(null)

  const isSkipped = Boolean(value.skipped)
  const selectedCodes = value.codes || []

  const filteredOptions = searchCitizenships(query).slice(0, 15)

  const handleSelectCode = (code: string) => {
    if (selectedCodes.includes(code)) {
      // Remove
      const nextCodes = selectedCodes.filter(c => c !== code)
      onChange({ codes: nextCodes, skipped: false })
    } else {
      // Add
      onChange({ codes: [...selectedCodes, code], skipped: false })
    }
    setQuery('')
    setIsOpen(false)
  }

  const handleRemoveCode = (code: string) => {
    const nextCodes = selectedCodes.filter(c => c !== code)
    onChange({ codes: nextCodes, skipped: false })
  }

  const handleToggleSkip = () => {
    if (isSkipped) {
      onChange({ codes: [], skipped: false })
    } else {
      onChange({ codes: [], skipped: true })
      setQuery('')
      setIsOpen(false)
    }
  }

  return (
    <div className={styles.container} ref={containerRef}>
      {/* Selected Chips */}
      {selectedCodes.length > 0 && !isSkipped && (
        <div className={styles.chipsRow} aria-label="Selected citizenships">
          {selectedCodes.map(code => {
            const cit = findCitizenshipByCode(code)
            if (!cit) return null
            return (
              <span key={code} className={styles.chip}>
                <span>{cit.countryName} ({cit.nationality})</span>
                <button
                  type="button"
                  onClick={() => handleRemoveCode(code)}
                  aria-label={`Remove ${cit.countryName} citizenship`}
                  className={styles.chipRemoveBtn}
                >
                  <X size={14} />
                </button>
              </span>
            )
          })}
        </div>
      )}

      {/* Search Input */}
      <div className={styles.inputWrapper}>
        <Search size={18} className={styles.searchIcon} aria-hidden="true" />
        <input
          id={inputId}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search by country or nationality (e.g. Canadian, German, India)..."
          disabled={isSkipped}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls={listboxId}
          aria-invalid={Boolean(error)}
          className={`${styles.input} ${error ? styles.inputError : ''} ${isSkipped ? styles.disabledInput : ''}`}
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('')
              setIsOpen(false)
            }}
            aria-label="Clear search query"
            className={styles.clearBtn}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Filtered Dropdown */}
      {isOpen && !isSkipped && (
        <ul id={listboxId} role="listbox" className={styles.dropdown} tabIndex={-1}>
          {filteredOptions.length === 0 ? (
            <li className={styles.noResults} role="status">
              No matching sovereign citizenship authorities found.
            </li>
          ) : (
            filteredOptions.map((opt) => {
              const isSelected = selectedCodes.includes(opt.code)
              return (
                <li
                  key={opt.code}
                  role="option"
                  aria-selected={isSelected}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    handleSelectCode(opt.code)
                  }}
                  className={`${styles.option} ${isSelected ? styles.optionSelected : ''}`}
                >
                  <div className={styles.optionDetails}>
                    <span className={styles.optionCountry}>{opt.countryName}</span>
                    <span className={styles.optionNationality}>{opt.nationality}</span>
                  </div>
                  {isSelected && <Check size={16} className={styles.checkIcon} />}
                </li>
              )
            })
          )}
        </ul>
      )}

      {/* Skip for now option */}
      <div className={styles.skipRow}>
        <label htmlFor="skip-citizenship-checkbox" className={styles.skipLabel}>
          <input
            type="checkbox"
            id="skip-citizenship-checkbox"
            checked={isSkipped}
            onChange={handleToggleSkip}
            className={styles.skipCheckbox}
          />
          <span>Skip for now</span>
        </label>
      </div>

      {/* Explainer Note */}
      <div className={styles.explainerNote}>
        <ShieldAlert size={16} className={styles.shieldIcon} aria-hidden="true" />
        <p>
          This helps us find relevant official entry guidance later. We collect citizenship selections only, never passport numbers or documents.
        </p>
      </div>
    </div>
  )
}
