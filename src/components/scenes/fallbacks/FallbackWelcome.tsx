import React from 'react'

export const FallbackWelcome: React.FC = () => {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg viewBox="0 0 400 400" width="85%" height="85%" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="200" cy="200" r="140" fill="url(#oceanGrad)" />
        <path d="M120 160 C150 140, 180 150, 190 190 C180 230, 130 220, 120 160 Z" fill="#14B8A6" opacity="0.9" />
        <path d="M220 140 C260 120, 300 150, 280 200 C250 220, 230 180, 220 140 Z" fill="#0D9488" opacity="0.9" />
        <path d="M160 240 C190 230, 230 260, 210 290 C180 300, 150 270, 160 240 Z" fill="#14B8A6" opacity="0.9" />
        {/* Flight path arc */}
        <path d="M110 210 C160 90, 250 90, 300 210" stroke="#38BDF8" strokeWidth="3" strokeDasharray="6 6" />
        {/* Airplane */}
        <g transform="translate(205, 95) rotate(15)">
          <path d="M-15 0 L15 0 L8 -12 L0 -12 L4 0 L-8 0 L-12 -6 L-15 -6 Z" fill="#FAF9F5" />
          <polygon points="4,0 8,-4 0,-4" fill="#0D9488" />
        </g>
        {/* Soft clouds */}
        <ellipse cx="140" cy="270" rx="35" ry="12" fill="#FFFFFF" opacity="0.4" />
        <ellipse cx="260" cy="140" rx="45" ry="14" fill="#FFFFFF" opacity="0.4" />
        <defs>
          <radialGradient id="oceanGrad" cx="0.4" cy="0.4" r="0.8">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#0F172A" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  )
}
