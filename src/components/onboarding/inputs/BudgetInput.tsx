import React from 'react'
import { Wallet, HelpCircle } from 'lucide-react'
import type { LivingBudgetAnswer } from '../../../store/types'
import styles from './BudgetInput.module.css'

export interface BudgetInputProps {
  value?: LivingBudgetAnswer
  onChange: (value: LivingBudgetAnswer) => void
  error?: string
}

const COMMON_CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar (USD)' },
  { code: 'EUR', symbol: '€', name: 'Euro (EUR)' },
  { code: 'GBP', symbol: '£', name: 'British Pound (GBP)' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar (CAD)' },
  { code: 'AUD', symbol: 'AU$', name: 'Australian Dollar (AUD)' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen (JPY)' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc (CHF)' },
  { code: 'SGD', symbol: 'SG$', name: 'Singapore Dollar (SGD)' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar (NZD)' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee (INR)' }
]

export const BudgetInput: React.FC<BudgetInputProps> = ({
  value = { currency: 'USD' },
  onChange,
  error
}) => {
  const isHelpEstimate = Boolean(value.helpEstimate)
  const currency = value.currency || 'USD'
  const amountStr = value.amount !== undefined ? String(value.amount) : ''

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({
      ...value,
      currency: e.target.value,
      helpEstimate: false
    })
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    if (raw === '') {
      onChange({
        currency,
        amount: undefined,
        helpEstimate: false
      })
      return
    }
    const parsed = parseFloat(raw)
    onChange({
      currency,
      amount: isNaN(parsed) ? undefined : parsed,
      helpEstimate: false
    })
  }

  const handleToggleHelpEstimate = () => {
    if (isHelpEstimate) {
      onChange({ currency, amount: undefined, helpEstimate: false })
    } else {
      onChange({ currency, amount: undefined, helpEstimate: true })
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.inputRow}>
        {/* Currency Select */}
        <div className={styles.currencyWrapper}>
          <label htmlFor="budget-currency-select" className={styles.label}>Currency</label>
          <select
            id="budget-currency-select"
            value={currency}
            onChange={handleCurrencyChange}
            disabled={isHelpEstimate}
            className={`${styles.select} ${isHelpEstimate ? styles.disabledControl : ''}`}
          >
            {COMMON_CURRENCIES.map(c => (
              <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
            ))}
          </select>
        </div>

        {/* Amount Input */}
        <div className={styles.amountWrapper}>
          <label htmlFor="budget-amount-input" className={styles.label}>Monthly Amount</label>
          <div className={styles.fieldWrapper}>
            <Wallet size={18} className={styles.walletIcon} aria-hidden="true" />
            <input
              id="budget-amount-input"
              type="number"
              min="1"
              step="any"
              value={amountStr}
              onChange={handleAmountChange}
              placeholder="e.g. 1800"
              disabled={isHelpEstimate}
              aria-invalid={Boolean(error)}
              className={`${styles.input} ${error ? styles.inputError : ''} ${isHelpEstimate ? styles.disabledControl : ''}`}
            />
          </div>
        </div>
      </div>

      {/* Help me estimate checkbox */}
      <div className={styles.toggleRow}>
        <label htmlFor="budget-help-estimate-checkbox" className={styles.toggleLabel}>
          <input
            type="checkbox"
            id="budget-help-estimate-checkbox"
            checked={isHelpEstimate}
            onChange={handleToggleHelpEstimate}
            className={styles.checkbox}
          />
          <span>Help me estimate my living budget</span>
        </label>
      </div>

      <div className={styles.explainerNote}>
        <HelpCircle size={16} className={styles.noteIcon} aria-hidden="true" />
        <p>
          Exclude tuition fees and one-time moving costs. This represents ongoing daily living expenses (rent, food, transit, utilities).
        </p>
      </div>
    </div>
  )
}
