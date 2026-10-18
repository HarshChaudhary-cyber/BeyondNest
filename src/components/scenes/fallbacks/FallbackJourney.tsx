import React from 'react'
import type { JourneyStage } from '../../../store/types'

interface FallbackJourneyProps {
  selectedStage?: JourneyStage
}

const STAGES: { id: JourneyStage; label: string }[] = [
  { id: 'exploring', label: 'Exploring' },
  { id: 'preparing_apps', label: 'Applications' },
  { id: 'accepted_offer', label: 'Accepted' },
  { id: 'preparing_leave', label: 'Packing' },
  { id: 'already_abroad', label: 'Abroad' }
]

export const FallbackJourney: React.FC<FallbackJourneyProps> = ({ selectedStage }) => {
  const activeIndex = STAGES.findIndex(s => s.id === selectedStage)

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '90%', maxWidth: '400px' }}>
        {STAGES.map((stage, idx) => {
          const isPassed = activeIndex >= idx
          const isCurrent = activeIndex === idx

          return (
            <React.Fragment key={stage.id}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <div style={{
                  width: isCurrent ? '36px' : '28px',
                  height: isCurrent ? '36px' : '28px',
                  borderRadius: '50%',
                  backgroundColor: isCurrent ? '#0D9488' : isPassed ? '#14B8A6' : '#E2E8F0',
                  color: isPassed ? '#FFFFFF' : '#64748B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '13px',
                  border: isCurrent ? '3px solid #CCFBF1' : 'none',
                  transition: 'all 0.2s ease'
                }}>
                  {idx + 1}
                </div>
                <span style={{ fontSize: '11px', fontWeight: isCurrent ? 700 : 500, color: isCurrent ? '#0D9488' : '#64748B' }}>
                  {stage.label}
                </span>
              </div>
              {idx < STAGES.length - 1 && (
                <div style={{
                  flex: 1,
                  height: '4px',
                  backgroundColor: activeIndex > idx ? '#14B8A6' : '#E2E8F0',
                  borderRadius: '2px',
                  marginBottom: '18px'
                }} />
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}
