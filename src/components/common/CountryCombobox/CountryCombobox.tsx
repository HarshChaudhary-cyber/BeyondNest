import React, { useState, useRef, useEffect, useId, type KeyboardEvent, type FocusEvent } from 'react'
import { Search, X, Check, MapPin } from 'lucide-react'
import type { CountryInfo } from '../../../store/types'
import { searchCountries } from '../../../data/countries'
import styles from './CountryCombobox.module.css'

export interface CountryComboboxProps {
  value?: CountryInfo
  onChange: (country: CountryInfo) => void
  onClear?: () => void
  disabled?: boolean
  error?: string
}

export const CountryCombobox: React.FC<CountryComboboxProps> = ({
  value,
  onChange,
  onClear,
  disabled = false,
  error
}) => {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listboxRef = useRef<HTMLUListElement>(null)
  const isInteractingWithListboxRef = useRef(false)
  const comboboxId = useId()
  const listboxId = `country-listbox-${comboboxId}`
  const errorId = error ? `country-error-${comboboxId}` : undefined

  const filteredCountries = searchCountries(query)

  // Close combobox when clicking outside
  useEffect(() => {
    const handlePointerDownOutside = (event: MouseEvent | TouchEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setHighlightedIndex(-1)
      }
    }

    const handleGlobalPointerUp = () => {
      isInteractingWithListboxRef.current = false
    }

    document.addEventListener('mousedown', handlePointerDownOutside)
    document.addEventListener('touchstart', handlePointerDownOutside)
    document.addEventListener('pointerup', handleGlobalPointerUp)
    document.addEventListener('mouseup', handleGlobalPointerUp)
    document.addEventListener('touchend', handleGlobalPointerUp)
    return () => {
      document.removeEventListener('mousedown', handlePointerDownOutside)
      document.removeEventListener('touchstart', handlePointerDownOutside)
      document.removeEventListener('pointerup', handleGlobalPointerUp)
      document.removeEventListener('mouseup', handleGlobalPointerUp)
      document.removeEventListener('touchend', handleGlobalPointerUp)
    }
  }, [])

  // Close combobox when focus leaves the component container, guarding against option click race
  const handleContainerBlur = (e: FocusEvent<HTMLDivElement>) => {
    if (isInteractingWithListboxRef.current) {
      return
    }
    if (!wrapperRef.current?.contains(e.relatedTarget as Node)) {
      setIsOpen(false)
      setHighlightedIndex(-1)
    }
  }

  // Scroll active option into view
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listboxRef.current) {
      const activeElement = listboxRef.current.children[highlightedIndex] as HTMLElement
      if (activeElement && typeof activeElement.scrollIntoView === 'function') {
        activeElement.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [isOpen, highlightedIndex])

  const handleSelect = (country: CountryInfo) => {
    onChange(country)
    setQuery('')
    setIsOpen(false)
    setHighlightedIndex(-1)
  }

  const handleClear = () => {
    setQuery('')
    setIsOpen(false)
    setHighlightedIndex(-1)
    if (onClear) onClear()
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return

    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') {
        e.preventDefault()
        setIsOpen(true)
        setHighlightedIndex(filteredCountries.length > 0 ? 0 : -1)
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        if (filteredCountries.length > 0) {
          setHighlightedIndex(prev => (prev < filteredCountries.length - 1 ? prev + 1 : 0))
        }
        break
      case 'ArrowUp':
        e.preventDefault()
        if (filteredCountries.length > 0) {
          setHighlightedIndex(prev => (prev > 0 ? prev - 1 : filteredCountries.length - 1))
        }
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0 && highlightedIndex < filteredCountries.length) {
          handleSelect(filteredCountries[highlightedIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        setHighlightedIndex(-1)
        break
      case 'Home':
        e.preventDefault()
        if (filteredCountries.length > 0) {
          setHighlightedIndex(0)
        }
        break
      case 'End':
        e.preventDefault()
        if (filteredCountries.length > 0) {
          setHighlightedIndex(filteredCountries.length - 1)
        }
        break
    }
  }

  const hasActiveOption = isOpen && highlightedIndex >= 0 && highlightedIndex < filteredCountries.length
  const activeDescendantId = hasActiveOption
    ? `country-opt-${comboboxId}-${highlightedIndex}`
    : undefined

  return (
    <div
      ref={wrapperRef}
      className={styles.comboboxWrapper}
      onBlur={handleContainerBlur}
    >
      <label htmlFor={`input-${comboboxId}`} className="sr-only">
        Search and select current country
      </label>

      <div className={styles.inputContainer}>
        <span className={styles.searchIcon} aria-hidden="true">
          <Search size={18} />
        </span>

        <input
          ref={inputRef}
          id={`input-${comboboxId}`}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-activedescendant={activeDescendantId}
          aria-invalid={Boolean(error)}
          aria-describedby={errorId}
          className={styles.input}
          placeholder={value ? `Selected: ${value.name} (type to change)` : 'Type your country name or code...'}
          value={query}
          onChange={(e) => {
            const nextQuery = e.target.value
            setQuery(nextQuery)
            setIsOpen(true)
            const matches = searchCountries(nextQuery)
            setHighlightedIndex(matches.length > 0 ? 0 : -1)
          }}
          onFocus={() => {
            setIsOpen(true)
            setHighlightedIndex(filteredCountries.length > 0 ? 0 : -1)
          }}
          onClick={() => {
            setIsOpen(true)
            setHighlightedIndex(filteredCountries.length > 0 ? 0 : -1)
          }}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />

        {(query || value) && (
          <button
            type="button"
            className={styles.clearButton}
            onClick={handleClear}
            aria-label="Clear country selection"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Selected Country Badge */}
      {value && !isOpen && (
        <div className={styles.selectedPill}>
          <div className={styles.selectedContent}>
            <MapPin size={18} color="#0D9488" />
            <strong>{value.name}</strong>
            <span className={styles.selectedBadge}>{value.code}</span>
            <span className={styles.region}>• {value.region}</span>
          </div>
          <span style={{ fontSize: '13px', color: '#0F766E' }}>Globe updated</span>
        </div>
      )}

      {/* Dropdown Listbox */}
      {isOpen && (
        <ul
          ref={listboxRef}
          id={listboxId}
          role="listbox"
          aria-label="Country list"
          className={styles.listbox}
        >
          {filteredCountries.length > 0 ? (
            filteredCountries.map((c, index) => {
              const isSelected = value?.code === c.code
              const isHighlighted = highlightedIndex === index

              return (
                <li
                  key={c.code}
                  id={`country-opt-${comboboxId}-${index}`}
                  role="option"
                  aria-selected={isSelected}
                  className={`${styles.option} ${isHighlighted ? styles.optionHighlighted : ''} ${
                    isSelected ? styles.optionSelected : ''
                  }`}
                  onPointerDown={(e) => {
                    e.preventDefault()
                    isInteractingWithListboxRef.current = true
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    isInteractingWithListboxRef.current = true
                  }}
                  onClick={() => {
                    isInteractingWithListboxRef.current = false
                    handleSelect(c)
                  }}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  <div className={styles.countryInfo}>
                    <span className={styles.countryCode}>{c.code}</span>
                    <span>{c.name}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className={styles.region}>{c.region}</span>
                    {isSelected && <Check size={16} color="#0D9488" />}
                  </div>
                </li>
              )
            })
          ) : (
            <li className={styles.noResults} role="status">
              No matching country found.
            </li>
          )}
        </ul>
      )}

      {error && (
        <div
          id={errorId}
          role="alert"
          style={{ color: '#E11D48', fontSize: '13px', fontWeight: 600 }}
        >
          {error}
        </div>
      )}
    </div>
  )
}

