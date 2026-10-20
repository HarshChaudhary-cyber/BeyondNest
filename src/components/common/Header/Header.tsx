import React from 'react'
import { Compass, RotateCcw } from 'lucide-react'
import { BRAND } from '../../../config/brand'
import { Button } from '../Button/Button'
import styles from './Header.module.css'

export interface HeaderProps {
  showReset?: boolean
  onReset?: (e?: React.MouseEvent<HTMLElement>) => void
  onLogoClick?: () => void
}

export const Header: React.FC<HeaderProps> = ({
  showReset = false,
  onReset,
  onLogoClick,
}) => {
  return (
    <header className={styles.header}>
      <div 
        className={styles.brandLink} 
        onClick={onLogoClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onLogoClick?.()
          }
        }}
        aria-label={`${BRAND.name} home`}
      >
        <div className={styles.logoIcon}>
          <Compass size={22} />
        </div>
        <div className={styles.brandText}>
          <span className={styles.brandName}>{BRAND.name}</span>
          <span className={styles.tagline}>{BRAND.tagline}</span>
        </div>
      </div>

      <div className={styles.actions}>
        <div className={styles.milestonePill} title="Milestone 2 Adaptive">
          <span>🏷️ Milestone 2 Adaptive</span>
        </div>

        {showReset && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            iconLeft={<RotateCcw size={14} />}
            aria-label={BRAND.navigation.startAgain}
            id="header-start-again-button"
          >
            {BRAND.navigation.startAgain}
          </Button>
        )}
      </div>
    </header>
  )
}
