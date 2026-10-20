import React, { useState } from 'react'
import { Calculator, Check, Info, AlertTriangle } from 'lucide-react'
import { Button } from '../common/Button/Button'
import { SUPPORTED_CURRENCIES } from '../../data/currencies'
import { 
  loadWorksheetState, 
  saveWorksheetState, 
  WORKSHEET_ITEM_DEFINITIONS, 
  type StoredWorksheetState 
} from '../../planning/worksheetStorage'
import styles from './ExpenseWorksheet.module.css'

export interface ExpenseWorksheetProps {
  initialCurrency?: string
  initialAmount?: number
  onSaveEstimate?: (currency: string, total: number) => void
}

export const ExpenseWorksheet: React.FC<ExpenseWorksheetProps> = ({
  initialCurrency = 'EUR',
  onSaveEstimate
}) => {
  // Load saved worksheet state from validated local storage or start with blank defaults (amounts = 0)
  const [worksheetState, setWorksheetState] = useState<StoredWorksheetState>(() => {
    return loadWorksheetState(initialCurrency)
  })

  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleAmountChange = (id: string, valStr: string) => {
    const val = parseFloat(valStr)
    setWorksheetState(prev => ({
      ...prev,
      items: {
        ...prev.items,
        [id]: isNaN(val) || val < 0 ? 0 : val
      }
    }))
    setSaveStatus('idle')
  }

  // Changing currency updates only the currency denomination; it does not convert or scale amounts
  const handleCurrencyChange = (newCurrency: string) => {
    setWorksheetState(prev => ({
      ...prev,
      currency: newCurrency
    }))
    setSaveStatus('idle')
  }

  const totalMonthly = Object.values(worksheetState.items).reduce((sum, val) => sum + val, 0)

  const handleSave = () => {
    const success = saveWorksheetState(worksheetState)
    if (success) {
      setSaveStatus('success')
      onSaveEstimate?.(worksheetState.currency, totalMonthly)
      setTimeout(() => {
        setSaveStatus(prev => prev === 'success' ? 'idle' : prev)
      }, 4000)
    } else {
      setSaveStatus('error')
    }
  }

  return (
    <div className={styles.worksheetCard}>
      <div className={styles.header}>
        <div className={styles.iconBadge} aria-hidden="true">
          <Calculator size={20} />
        </div>
        <div>
          <h3 className={styles.title}>Estimated Monthly Living Expense Worksheet</h3>
          <p className={styles.subtitle}>
            Plan your monthly spending by research rather than relying on artificial living-cost numbers.
          </p>
        </div>
      </div>

      <div className={styles.notice}>
        <Info size={16} className={styles.noticeIcon} />
        <span>
          <strong>Research Guidance:</strong> BeyondNest does not fabricate living-cost figures. Use official student union benchmarks (e.g. Deutsches Studierendenwerk in Germany, EduCanada and IRCC tables in Canada) to plug in realistic figures for your specific town or city.
        </span>
      </div>

      <div className={styles.currencyRow}>
        <label htmlFor="worksheet-currency-select" className={styles.label}>
          Currency:
        </label>
        <select
          id="worksheet-currency-select"
          value={worksheetState.currency}
          onChange={(e) => handleCurrencyChange(e.target.value)}
          className={styles.currencySelect}
        >
          {SUPPORTED_CURRENCIES.map(c => (
            <option key={c.code} value={c.code}>
              {c.code} ({c.symbol}) — {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.itemsList}>
        {WORKSHEET_ITEM_DEFINITIONS.map(item => {
          const currentVal = worksheetState.items[item.id] ?? 0
          return (
            <div key={item.id} className={styles.itemRow}>
              <label htmlFor={`worksheet-item-${item.id}`} className={styles.itemLabel}>
                {item.label}
              </label>
              <div className={styles.inputWrapper}>
                <span className={styles.currencyPrefix}>{worksheetState.currency}</span>
                <input
                  id={`worksheet-item-${item.id}`}
                  type="number"
                  min="0"
                  step="10"
                  value={currentVal === 0 ? '' : currentVal}
                  onChange={(e) => handleAmountChange(item.id, e.target.value)}
                  className={styles.amountInput}
                  placeholder={item.placeholder}
                />
              </div>
            </div>
          )
        })}
      </div>

      <div className={styles.totalRow}>
        <div className={styles.totalLabel}>
          <span>Estimated Total Monthly Living Expenses:</span>
          <span className={styles.totalAmount}>
            {worksheetState.currency} {totalMonthly.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {saveStatus === 'success' && (
            <span className={`${styles.saveFeedback} ${styles.saveSuccess}`} role="status">
              <Check size={14} /> Saved to worksheet
            </span>
          )}
          {saveStatus === 'error' && (
            <span className={`${styles.saveFeedback} ${styles.saveError}`} role="alert">
              <AlertTriangle size={14} /> Storage unavailable — failed to save
            </span>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
          >
            Save this estimate
          </Button>
        </div>
      </div>
    </div>
  )
}
