import React, { useEffect, useRef } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '../Button/Button'
import styles from './ConfirmResetDialog.module.css'

export interface ConfirmResetDialogProps {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
  triggerElement?: HTMLElement | null
}

export const ConfirmResetDialog: React.FC<ConfirmResetDialogProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  triggerElement
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const cancelButtonRef = useRef<HTMLButtonElement>(null)
  const confirmButtonRef = useRef<HTMLButtonElement>(null)
  const savedTriggerRef = useRef<HTMLElement | null>(null)

  // Track the triggering element for focus restoration
  useEffect(() => {
    if (isOpen) {
      savedTriggerRef.current = triggerElement || (document.activeElement as HTMLElement | null)
    }
  }, [isOpen, triggerElement])

  // Native dialog showModal / close lifecycle
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen) {
      if (typeof dialog.showModal === 'function') {
        try {
          if (!dialog.open) {
            dialog.showModal()
          }
        } catch {
          // Fallback if already open or in non-compliant environment
        }
      }
      if (!dialog.hasAttribute('open')) {
        dialog.setAttribute('open', '')
      }
    } else {
      if (typeof dialog.close === 'function') {
        try {
          if (dialog.open) {
            dialog.close()
          }
        } catch {
          // Fallback
        }
      }
      if (dialog.hasAttribute('open')) {
        dialog.removeAttribute('open')
      }
    }
  }, [isOpen])

  // Initial focus on Cancel button when opened
  useEffect(() => {
    if (!isOpen) return

    const timer = setTimeout(() => {
      cancelButtonRef.current?.focus()
    }, 20)

    return () => clearTimeout(timer)
  }, [isOpen])

  const handleCancel = React.useCallback(() => {
    onCancel()
    // Restore focus to the trigger element that initiated the reset request
    setTimeout(() => {
      savedTriggerRef.current?.focus()
    }, 10)
  }, [onCancel])

  const handleConfirm = React.useCallback(() => {
    onConfirm()
    // Move focus to primary call-to-action on the welcome screen
    setTimeout(() => {
      const planBtn = document.getElementById('plan-my-move-button')
      if (planBtn) {
        planBtn.focus()
      } else {
        document.querySelector('h1')?.focus()
      }
    }, 50)
  }, [onConfirm])

  // Keyboard accessibility: Escape to cancel, Tab loop focus trap
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        handleCancel()
        return
      }

      if (e.key === 'Tab') {
        const cancelBtn = cancelButtonRef.current
        const confirmBtn = confirmButtonRef.current

        if (!cancelBtn || !confirmBtn) return

        if (e.shiftKey) {
          // Shift + Tab: if on cancel, cycle to confirm
          if (document.activeElement === cancelBtn) {
            e.preventDefault()
            confirmBtn.focus()
          }
        } else {
          // Tab: if on confirm, cycle to cancel
          if (document.activeElement === confirmBtn) {
            e.preventDefault()
            cancelBtn.focus()
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleCancel])

  if (!isOpen) return null

  return (
    <div 
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleCancel()
        }
      }}
    >
      <dialog
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        className={styles.dialog}
        tabIndex={-1}
        onCancel={(e) => {
          e.preventDefault()
          handleCancel()
        }}
      >
        <div className={styles.header}>
          <div className={styles.iconWrapper} aria-hidden="true">
            <AlertTriangle size={22} />
          </div>
          <h2 id="confirm-dialog-title" className={styles.title}>
            Reset your journey?
          </h2>
        </div>

        <p id="confirm-dialog-description" className={styles.description}>
          This will clear all your locally saved responses and return you to the welcome screen. This action cannot be undone.
        </p>

        <div className={styles.actions}>
          <Button
            ref={cancelButtonRef}
            variant="secondary"
            size="md"
            onClick={handleCancel}
            id="cancel-reset-button"
          >
            Cancel
          </Button>

          <Button
            ref={confirmButtonRef}
            variant="primary"
            size="md"
            onClick={handleConfirm}
            id="confirm-reset-button"
          >
            Reset everything
          </Button>
        </div>
      </dialog>
    </div>
  )
}
