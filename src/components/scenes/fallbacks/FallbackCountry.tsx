import React from 'react'
import type { CountryInfo } from '../../../store/types'

interface FallbackCountryProps {
  selectedCountry?: CountryInfo
}

export const FallbackCountry: React.FC<FallbackCountryProps> = ({ selectedCountry }) => {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{
        width: '140px',
        height: '140px',
        borderRadius: '50%',
        backgroundColor: '#0F172A',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 12px 28px rgba(15, 23, 42, 0.15)',
        border: '4px solid #14B8A6',
        position: 'relative'
      }}>
        <span style={{ fontSize: '42px', marginBottom: '4px' }}>🌍</span>
        {selectedCountry ? (
          <div style={{
            position: 'absolute',
            bottom: '-12px',
            backgroundColor: '#0D9488',
            color: '#FFFFFF',
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 700,
            boxShadow: '0 4px 10px rgba(13, 148, 136, 0.3)'
          }}>
            📍 {selectedCountry.name}
          </div>
        ) : (
          <div style={{ color: '#94A3B8', fontSize: '11px', marginTop: '2px' }}>
            Select origin
          </div>
        )}
      </div>
    </div>
  )
}
