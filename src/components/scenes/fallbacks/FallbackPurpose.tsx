import React from 'react'
import type { RelocationPurpose } from '../../../store/types'

interface FallbackPurposeProps {
  selectedPurpose?: RelocationPurpose
}

export const FallbackPurpose: React.FC<FallbackPurposeProps> = ({ selectedPurpose }) => {
  const items = [
    { id: 'study', label: 'Study', icon: '🎓', active: selectedPurpose === 'study' },
    { id: 'work', label: 'Work', icon: '💼', active: selectedPurpose === 'work' },
    { id: 'family', label: 'Family', icon: '🏡', active: selectedPurpose === 'family' },
    { id: 'explore', label: 'Explore', icon: '🧭', active: selectedPurpose === 'explore' },
  ]

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '16px',
      padding: '32px',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {items.map(item => (
        <div 
          key={item.id}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            borderRadius: '16px',
            backgroundColor: item.active ? '#CCFBF1' : '#FFFFFF',
            border: item.active ? '2px solid #0D9488' : '1px solid #E2E8F0',
            transform: item.active ? 'translateY(-6px)' : 'none',
            boxShadow: item.active ? '0 10px 20px rgba(13, 148, 136, 0.15)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <span style={{ fontSize: '38px', marginBottom: '8px' }}>{item.icon}</span>
          <span style={{ fontWeight: 600, color: item.active ? '#0F766E' : '#334155' }}>{item.label}</span>
        </div>
      ))}
    </div>
  )
}
