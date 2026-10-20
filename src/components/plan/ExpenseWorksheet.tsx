import React, { useState } from 'react'
import { Calculator, Check, Info } from 'lucide-react'
import { Button } from '../common/Button/Button'
import { SUPPORTED_CURRENCIES } from '../../data/currencies'
import styles from './ExpenseWorksheet.module.css'

export interface ExpenseItem {
  id: string
  label: string
  placeholder: number
  amount: number
}

export interface ExpenseWorksheetProps {
  initialCurrency?: string
  initialAmount?: number
  onSaveEstimate?: (currency: string, total: number) => void
}

const DEFAULT_ITEMS: ExpenseItem[] = [
  { id: 'rent', label: 'Rent & Accommodation (flatshare / room)', placeholder: 750, amount: 750 },
  { id: 'groceries', label: 'Groceries & Household Food', placeholder: 250, amount: 250 },
  { id: 'transit', label: 'Public Transit / Student Semester Pass', placeholder: 60, amount: 60 },
  { id: 'utilities', label: 'Mobile Connectivity & Utilities', placeholder: 50, amount: 50 },
  { id: 'insurance', label: 'Mandatory Health & Travel Insurance', placeholder: 120, amount: 120 },
  { id: 'leisure', label: 'Personal Expenses & Course Materials', placeholder: 150, amount: 150 }
]

export const ExpenseWorksheet: React.FC<ExpenseWorksheetProps> = ({
  initialCurrency = 'EUR',
  onSaveEstimate
}) => {
  const [currency, setCurrency] = useState<string>(initialCurrency)
  const [items, setItems] = useState<ExpenseItem[]>(DEFAULT_ITEMS)
  const [savedSuccess, setSavedSuccess] = useState(false)

  const handleAmountChange = (id: string, valStr: string) => {
    const val = parseFloat(valStr)
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, amount: isNaN(val) || val < 0 ? 0 : val }
      }
      return item
    }))
    setSavedSuccess(false)
  }

  const totalMonthly = items.reduce((sum, item) => sum + item.amount, 0)

  const handleSave = () => {
    onSaveEstimate?.(currency, totalMonthly)
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 3000)
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
          <strong>Research Guidance:</strong> BeyondNest does not fabricate living-cost figures. Use official student union benchmarks (e.g. Studierendenwerk in Germany, EduCanada in Canada) to plug in realistic figures for your specific town or city.
        </span>
      </div>

      <div className={styles.currencyRow}>
        <label htmlFor="worksheet-currency-select" className={styles.label}>
          Currency:
        </label>
        <select
          id="worksheet-currency-select"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
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
        {items.map(item => (
          <div key={item.id} className={styles.itemRow}>
            <label htmlFor={`worksheet-item-${item.id}`} className={styles.itemLabel}>
              {item.label}
            </label>
            <div className={styles.inputWrapper}>
              <span className={styles.currencyPrefix}>{currency}</span>
              <input
                id={`worksheet-item-${item.id}`}
                type="number"
                min="0"
                step="10"
                value={item.amount === 0 ? '' : item.amount}
                onChange={(e) => handleAmountChange(item.id, e.target.value)}
                className={styles.amountInput}
                placeholder={String(item.placeholder)}
              />
            </div>
          </div>
        ))}
      </div>

      <div className={styles.totalRow}>
        <div className={styles.totalLabel}>
          <span>Estimated Total Monthly Living Expenses:</span>
          <span className={styles.totalAmount}>
            {currency} {totalMonthly.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
          </span>
        </div>

        {onSaveEstimate && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            iconLeft={savedSuccess ? <Check size={14} color="#0D9488" /> : undefined}
          >
            {savedSuccess ? 'Saved to worksheet' : 'Save this estimate'}
          </Button>
        )}
      </div>
    </div>
  )
}
