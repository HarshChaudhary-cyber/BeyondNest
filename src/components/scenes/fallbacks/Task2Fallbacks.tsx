import React from 'react'
import type { OnboardingAnswers } from '../../../store/types'

const fallbackContainerStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  minHeight: '260px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px',
  background: 'radial-gradient(circle at center, #F0F9FF 0%, #E0F2FE 100%)',
  borderRadius: '20px'
}

// 1. Citizenship Fallback
export const FallbackCitizenship: React.FC<{ answers?: OnboardingAnswers }> = ({ answers }) => {
  const isSkipped = answers?.citizenship?.skipped
  const count = answers?.citizenship?.codes?.length || 0

  return (
    <div style={fallbackContainerStyle} role="img" aria-label="Illustration of a passport and globe">
      <svg width="180" height="150" viewBox="0 0 180 150" fill="none">
        {/* Globe Silhouette */}
        <circle cx="65" cy="80" r="45" fill="#BAE6FD" stroke="#0284C7" strokeWidth="2" />
        <ellipse cx="65" cy="80" rx="45" ry="18" fill="none" stroke="#0284C7" strokeWidth="1.5" strokeDasharray="3 3" />
        {/* Passport Book */}
        <rect x="95" y="40" width="60" height="85" rx="6" fill="#0F172A" stroke="#334155" strokeWidth="2" />
        <rect x="100" y="45" width="50" height="75" rx="4" fill="#1E293B" />
        <circle cx="125" cy="72" r="14" fill="none" stroke="#F59E0B" strokeWidth="2" />
        <line x1="125" y1="58" x2="125" y2="86" stroke="#F59E0B" strokeWidth="1.5" />
        <line x1="111" y1="72" x2="139" y2="72" stroke="#F59E0B" strokeWidth="1.5" />
        <rect x="110" y="96" width="30" height="4" rx="2" fill="#F59E0B" opacity="0.8" />
      </svg>
      <span style={{ marginTop: '12px', fontSize: '13px', fontWeight: 600, color: '#0369A1' }}>
        {isSkipped ? 'Citizenship skipped for now' : count > 0 ? `${count} passport(s) selected` : 'Passports and official entry'}
      </span>
    </div>
  )
}

// 2. Destination Globe Fallback
export const FallbackDestinationGlobe: React.FC<{ answers?: OnboardingAnswers }> = ({ answers }) => {
  const isExplore = answers?.destination_country && 'explore' in answers.destination_country
  const destName = answers?.destination_country && 'name' in answers.destination_country 
    ? answers.destination_country.name 
    : undefined

  return (
    <div style={fallbackContainerStyle} role="img" aria-label="Illustration of destination globe with route">
      <svg width="180" height="150" viewBox="0 0 180 150" fill="none">
        <circle cx="90" cy="75" r="50" fill="#BAE6FD" stroke="#0284C7" strokeWidth="2" />
        <path d="M 50 85 Q 90 20 130 65" stroke="#F59E0B" strokeWidth="2.5" strokeDasharray="4 4" fill="none" />
        <circle cx="50" cy="85" r="5" fill="#14B8A6" />
        <circle cx="130" cy="65" r="6" fill="#F59E0B" />
      </svg>
      <span style={{ marginTop: '12px', fontSize: '13px', fontWeight: 600, color: '#0369A1' }}>
        {isExplore ? 'Exploring destinations' : destName ? `Destination: ${destName}` : 'Select your destination'}
      </span>
    </div>
  )
}

// 3. City Fallback
export const FallbackCity: React.FC<{ answers?: OnboardingAnswers }> = ({ answers }) => {
  const city = answers?.destination_city?.cityName || (answers?.destination_city?.notDecided ? 'Exploring cities' : 'Target city')

  return (
    <div style={fallbackContainerStyle} role="img" aria-label="Illustration of miniature city skyline">
      <svg width="180" height="140" viewBox="0 0 180 140" fill="none">
        <ellipse cx="90" cy="115" rx="70" ry="16" fill="#CBD5E1" />
        {/* Buildings */}
        <rect x="45" y="65" width="22" height="50" rx="2" fill="#0D9488" />
        <rect x="72" y="45" width="26" height="70" rx="3" fill="#0284C7" />
        <rect x="103" y="60" width="20" height="55" rx="2" fill="#14B8A6" />
        <rect x="127" y="75" width="18" height="40" rx="2" fill="#38BDF8" />
        {/* Pin */}
        <path d="M 85 20 C 80 20 76 24 76 29 C 76 37 85 45 85 45 C 85 45 94 37 94 29 C 94 24 90 20 85 20 Z" fill="#F59E0B" />
        <circle cx="85" cy="28" r="3" fill="#FFFFFF" />
      </svg>
      <span style={{ marginTop: '10px', fontSize: '13px', fontWeight: 600, color: '#0369A1' }}>
        {city}
      </span>
    </div>
  )
}

// 4. Priorities Compass Fallback
export const FallbackPrioritiesCompass: React.FC<{ answers?: OnboardingAnswers }> = ({ answers }) => {
  const count = answers?.destination_priorities?.length || 0

  return (
    <div style={fallbackContainerStyle} role="img" aria-label="Illustration of compass navigation">
      <svg width="160" height="150" viewBox="0 0 160 150" fill="none">
        <circle cx="80" cy="75" r="48" fill="#FFFFFF" stroke="#0D9488" strokeWidth="2.5" />
        <circle cx="80" cy="75" r="42" fill="none" stroke="#BAE6FD" strokeWidth="1" strokeDasharray="3 3" />
        <polygon points="80,35 87,75 80,70 73,75" fill="#E11D48" />
        <polygon points="80,115 87,75 80,80 73,75" fill="#334155" />
        <circle cx="80" cy="75" r="4" fill="#F59E0B" />
      </svg>
      <span style={{ marginTop: '10px', fontSize: '13px', fontWeight: 600, color: '#0369A1' }}>
        {count > 0 ? `${count} priority area(s) guiding your move` : 'Discover matching destinations'}
      </span>
    </div>
  )
}

// 5. Calendar Suitcase Fallback
export const FallbackCalendarSuitcase: React.FC = () => (
  <div style={fallbackContainerStyle} role="img" aria-label="Illustration of calendar and suitcase">
    <svg width="180" height="140" viewBox="0 0 180 140" fill="none">
      {/* Calendar */}
      <rect x="35" y="35" width="60" height="65" rx="6" fill="#FFFFFF" stroke="#0284C7" strokeWidth="2" />
      <rect x="35" y="35" width="60" height="18" fill="#0284C7" />
      <circle cx="48" cy="65" r="3" fill="#0D9488" />
      <circle cx="65" cy="65" r="3" fill="#0D9488" />
      <circle cx="82" cy="65" r="3" fill="#F59E0B" />
      <circle cx="48" cy="80" r="3" fill="#0D9488" />
      <circle cx="65" cy="80" r="3" fill="#0D9488" />
      {/* Suitcase */}
      <rect x="105" y="55" width="45" height="50" rx="6" fill="#0D9488" stroke="#0F766E" strokeWidth="2" />
      <rect x="120" y="43" width="15" height="12" rx="3" fill="none" stroke="#0F766E" strokeWidth="2" />
      <line x1="105" y1="80" x2="150" y2="80" stroke="#14B8A6" strokeWidth="2" />
    </svg>
    <span style={{ marginTop: '10px', fontSize: '13px', fontWeight: 600, color: '#0369A1' }}>
      Target moving timeline
    </span>
  </div>
)

// 6. Timeline Fallback
export const FallbackTimeline: React.FC = () => (
  <div style={fallbackContainerStyle} role="img" aria-label="Illustration of stay duration timeline">
    <svg width="180" height="130" viewBox="0 0 180 130" fill="none">
      <line x1="25" y1="65" x2="155" y2="65" stroke="#0284C7" strokeWidth="4" strokeLinecap="round" />
      <circle cx="40" cy="65" r="8" fill="#14B8A6" stroke="#FFFFFF" strokeWidth="2" />
      <circle cx="80" cy="65" r="8" fill="#0284C7" stroke="#FFFFFF" strokeWidth="2" />
      <circle cx="120" cy="65" r="8" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="2" />
      <circle cx="150" cy="65" r="6" fill="#94A3B8" />
    </svg>
    <span style={{ marginTop: '10px', fontSize: '13px', fontWeight: 600, color: '#0369A1' }}>
      Stay duration timeline
    </span>
  </div>
)

// 7. Travel Style Fallback
export const FallbackTravelStyle: React.FC = () => (
  <div style={fallbackContainerStyle} role="img" aria-label="Illustration of backpack and luggage">
    <svg width="180" height="140" viewBox="0 0 180 140" fill="none">
      {/* Backpack */}
      <rect x="35" y="45" width="40" height="55" rx="10" fill="#0D9488" />
      <rect x="43" y="65" width="24" height="22" rx="4" fill="#14B8A6" />
      {/* Suitcase */}
      <rect x="95" y="40" width="50" height="65" rx="6" fill="#0284C7" />
      <line x1="95" y1="72" x2="145" y2="72" stroke="#38BDF8" strokeWidth="2" />
      <rect x="112" y="28" width="16" height="12" rx="3" fill="none" stroke="#0284C7" strokeWidth="2" />
    </svg>
    <span style={{ marginTop: '10px', fontSize: '13px', fontWeight: 600, color: '#0369A1' }}>
      Travel & living style
    </span>
  </div>
)

// 8. Backpacking Globe Fallback
export const FallbackBackpackingGlobe: React.FC<{ answers?: OnboardingAnswers }> = ({ answers }) => {
  const count = answers?.backpacking_destinations?.destinations?.length || 0

  return (
    <div style={fallbackContainerStyle} role="img" aria-label="Illustration of connected backpacking route on globe">
      <svg width="180" height="150" viewBox="0 0 180 150" fill="none">
        <circle cx="90" cy="75" r="50" fill="#BAE6FD" stroke="#0284C7" strokeWidth="2" />
        <path d="M 60 70 Q 90 40 120 60 T 110 100" stroke="#0D9488" strokeWidth="2" strokeDasharray="3 3" fill="none" />
        <circle cx="60" cy="70" r="4" fill="#0D9488" />
        <circle cx="120" cy="60" r="4" fill="#F59E0B" />
        <circle cx="110" cy="100" r="4" fill="#E11D48" />
      </svg>
      <span style={{ marginTop: '10px', fontSize: '13px', fontWeight: 600, color: '#0369A1' }}>
        {count > 0 ? `${count} stop(s) on your tentative route` : 'Backpacking route map'}
      </span>
    </div>
  )
}

// 9. Companions Fallback
export const FallbackCompanions: React.FC = () => (
  <div style={fallbackContainerStyle} role="img" aria-label="Illustration of travel party companions">
    <svg width="180" height="140" viewBox="0 0 180 140" fill="none">
      <circle cx="70" cy="55" r="14" fill="#0D9488" />
      <path d="M 50 100 C 50 82 60 75 70 75 C 80 75 90 82 90 100 Z" fill="#0D9488" />
      <circle cx="110" cy="58" r="12" fill="#0284C7" />
      <path d="M 94 100 C 94 85 102 79 110 79 C 118 79 126 85 126 100 Z" fill="#0284C7" />
    </svg>
    <span style={{ marginTop: '10px', fontSize: '13px', fontWeight: 600, color: '#0369A1' }}>
      Travel party and companions
    </span>
  </div>
)

// 10. Budget Wallet Fallback
export const FallbackBudgetWallet: React.FC = () => (
  <div style={fallbackContainerStyle} role="img" aria-label="Illustration of wallet and living budget">
    <svg width="180" height="140" viewBox="0 0 180 140" fill="none">
      <rect x="45" y="45" width="80" height="55" rx="8" fill="#0F766E" />
      <rect x="85" y="60" width="40" height="25" rx="4" fill="#14B8A6" />
      <circle cx="115" cy="72" r="4" fill="#F59E0B" />
      {/* Floating coin */}
      <circle cx="135" cy="40" r="12" fill="#F59E0B" stroke="#D97706" strokeWidth="2" />
      <text x="135" y="45" textAnchor="middle" fill="#FFFFFF" fontSize="14" fontWeight="bold">$</text>
    </svg>
    <span style={{ marginTop: '10px', fontSize: '13px', fontWeight: 600, color: '#0369A1' }}>
      Estimated monthly living budget
    </span>
  </div>
)

// 11. Campus Fallback
export const FallbackCampus: React.FC = () => (
  <div style={fallbackContainerStyle} role="img" aria-label="Illustration of university campus and graduation cap">
    <svg width="180" height="140" viewBox="0 0 180 140" fill="none">
      {/* Campus columns */}
      <polygon points="90,40 40,60 140,60" fill="#0284C7" />
      <rect x="50" y="65" width="8" height="40" fill="#BAE6FD" />
      <rect x="72" y="65" width="8" height="40" fill="#BAE6FD" />
      <rect x="100" y="65" width="8" height="40" fill="#BAE6FD" />
      <rect x="122" y="65" width="8" height="40" fill="#BAE6FD" />
      <rect x="35" y="105" width="110" height="8" rx="2" fill="#0284C7" />
      {/* Cap */}
      <polygon points="90,20 65,30 90,40 115,30" fill="#0F172A" />
      <line x1="110" y1="32" x2="114" y2="46" stroke="#F59E0B" strokeWidth="2" />
    </svg>
    <span style={{ marginTop: '10px', fontSize: '13px', fontWeight: 600, color: '#0369A1' }}>
      Higher education & academic pathway
    </span>
  </div>
)

// 12. Workspace Fallback
export const FallbackWorkspace: React.FC = () => (
  <div style={fallbackContainerStyle} role="img" aria-label="Illustration of workspace desk and briefcase">
    <svg width="180" height="140" viewBox="0 0 180 140" fill="none">
      <rect x="35" y="75" width="80" height="8" rx="2" fill="#334155" />
      <line x1="45" y1="83" x2="45" y2="115" stroke="#334155" strokeWidth="3" />
      <line x1="105" y1="83" x2="105" y2="115" stroke="#334155" strokeWidth="3" />
      {/* Laptop */}
      <rect x="58" y="52" width="34" height="22" rx="2" fill="#0284C7" />
      {/* Briefcase */}
      <rect x="122" y="70" width="36" height="32" rx="4" fill="#0D9488" />
      <rect x="133" y="62" width="14" height="8" rx="2" fill="none" stroke="#0D9488" strokeWidth="2" />
    </svg>
    <span style={{ marginTop: '10px', fontSize: '13px', fontWeight: 600, color: '#0369A1' }}>
      Professional career abroad
    </span>
  </div>
)

// 13. Packing Suitcase Fallback
export const FallbackPackingSuitcase: React.FC<{ answers?: OnboardingAnswers }> = ({ answers }) => {
  const count = answers?.preparation_status?.length || 0

  return (
    <div style={fallbackContainerStyle} role="img" aria-label="Illustration of open luggage being packed">
      <svg width="180" height="140" viewBox="0 0 180 140" fill="none">
        <rect x="40" y="55" width="100" height="55" rx="6" fill="#0D9488" />
        <rect x="40" y="25" width="100" height="30" rx="4" fill="#14B8A6" stroke="#0F766E" strokeWidth="2" />
        <line x1="50" y1="65" x2="80" y2="65" stroke="#FFFFFF" strokeWidth="2" />
        <line x1="50" y1="75" x2="70" y2="75" stroke="#FFFFFF" strokeWidth="2" />
        <circle cx="110" cy="80" r="10" fill="#F59E0B" />
      </svg>
      <span style={{ marginTop: '10px', fontSize: '13px', fontWeight: 600, color: '#0369A1' }}>
        {count > 0 ? `${count} preparation item(s) in place` : 'Packing & arrangement checklist'}
      </span>
    </div>
  )
}

// 14. Neighbourhood Priorities Fallback
export const FallbackNeighbourhoodPriorities: React.FC<{ answers?: OnboardingAnswers }> = ({ answers }) => {
  const count = answers?.first_priority?.length || 0

  return (
    <div style={fallbackContainerStyle} role="img" aria-label="Illustration of local neighbourhood with highlighted beacon">
      <svg width="180" height="140" viewBox="0 0 180 140" fill="none">
        <ellipse cx="90" cy="115" rx="70" ry="16" fill="#E2E8F0" />
        {/* Houses */}
        <polygon points="55,60 35,75 75,75" fill="#0284C7" />
        <rect x="40" y="75" width="30" height="30" fill="#BAE6FD" />
        <polygon points="125,60 105,75 145,75" fill="#0D9488" />
        <rect x="110" y="75" width="30" height="30" fill="#99F6E4" />
        {/* Beacon */}
        <circle cx="90" cy="45" r="8" fill="#F59E0B" />
        <line x1="90" y1="53" x2="90" y2="105" stroke="#F59E0B" strokeWidth="2" strokeDasharray="3 2" />
      </svg>
      <span style={{ marginTop: '10px', fontSize: '13px', fontWeight: 600, color: '#0369A1' }}>
        {count > 0 ? `${count} priority area(s) to assist first` : 'Neighbourhood & daily setup'}
      </span>
    </div>
  )
}
