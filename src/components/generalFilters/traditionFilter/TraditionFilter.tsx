import React from 'react'
import './TraditionFilter.css'
import '../../traitTags/TraitTag.css'
import AndOrBtnGroup from '../../andOrBtnGroup/AndOrBtnGroup'
import type { TraditionState } from '../../../App'

interface TraditionFilterProps {
  traditionStates: Record<string, TraditionState>
  onTraditionChange: (tradition: string, state: TraditionState) => void
  traditionLogicMode: 'AND' | 'OR'
  onTraditionLogicChange: (mode: 'AND' | 'OR') => void
}

const TraditionFilter: React.FC<TraditionFilterProps> = ({
  traditionStates,
  onTraditionChange,
  traditionLogicMode,
  onTraditionLogicChange
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
    if (state === 'include') return 'interactive-base interactive-include tag-button'
    if (state === 'exclude') return 'interactive-base interactive-exclude tag-button'
    return 'interactive-base tag-button'
  }

  return (
    <div className="filter-component">
      <div className="filter-header">
        <span className="filter-label">Traditions</span>
        <AndOrBtnGroup 
          logicMode={traditionLogicMode}
          onLogicChange={onTraditionLogicChange}
        />
      </div>
      <div className="filter-button-group">
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
    </div>
  )
}

export default TraditionFilter
