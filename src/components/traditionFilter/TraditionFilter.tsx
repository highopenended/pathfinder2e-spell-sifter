import React from 'react'
import './TraditionFilter.css'

export type TraditionState = 'unselected' | 'include' | 'exclude'

interface TraditionFilterProps {
  traditionStates: Record<string, TraditionState>
  onTraditionChange: (tradition: string, state: TraditionState) => void
  logicMode: 'AND' | 'OR'
  onLogicChange: (mode: 'AND' | 'OR') => void
}

const TraditionFilter: React.FC<TraditionFilterProps> = ({
  traditionStates,
  onTraditionChange,
  logicMode,
  onLogicChange
}) => {
  const traditions = ['Arcane', 'Divine', 'Occult', 'Primal']

  const toggleTradition = (tradition: string) => {
    const current = traditionStates[tradition]
    let next: TraditionState
    
    if (current === 'unselected') {
      next = 'include'
    } else if (current === 'include') {
      next = 'exclude'
    } else {
      next = 'unselected'
    }
    
    onTraditionChange(tradition, next)
  }

  const getTraditionClass = (tradition: string) => {
    const state = traditionStates[tradition]
    if (state === 'include') return 'tag-base tag-include'
    if (state === 'exclude') return 'tag-base tag-exclude'
    return 'tag-base'
  }

  return (
    <div className="tradition-filter">
      <div className="tradition-header">
        <span className="tradition-label">Traditions:</span>
        <div className="tradition-buttons">
          {traditions.map(tradition => (
            <button
              key={tradition}
              className={getTraditionClass(tradition)}
              onClick={() => toggleTradition(tradition)}
            >
              {tradition}
            </button>
          ))}
        </div>
        <div className="logic-toggle">
          <button 
            className={`btn-base ${logicMode === 'AND' ? 'btn-primary' : ''}`}
            onClick={() => onLogicChange('AND')}
          >
            AND
          </button>
          <button 
            className={`btn-base ${logicMode === 'OR' ? 'btn-primary' : ''}`}
            onClick={() => onLogicChange('OR')}
          >
            OR
          </button>
        </div>
      </div>
    </div>
  )
}

export default TraditionFilter
