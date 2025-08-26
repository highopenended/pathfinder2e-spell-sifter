import React, { useState, useRef, useEffect } from 'react'
import './GeneralFilter.css'
import '../traitTags/TraitTag.css'
import AndOrBtnGroup from '../andOrBtnGroup/AndOrBtnGroup'
import type { TraditionState } from '../../App'

interface GeneralFilterProps {
  // SpellNameSearch props
  searchTerm: string
  onSearchChange: (value: string) => void
  onSearch: () => void
  
  // TraditionFilter props
  traditionStates: Record<string, TraditionState>
  onTraditionChange: (tradition: string, state: TraditionState) => void
  traditionLogicMode: 'AND' | 'OR'
  onTraditionLogicChange: (mode: 'AND' | 'OR') => void
  
  // RankFilter props
  rankRange: { min: number; max: number }
  onRankChange: (type: 'min' | 'max', value: number) => void
}

const GeneralFilter: React.FC<GeneralFilterProps> = ({
  searchTerm,
  onSearchChange,
  onSearch,
  traditionStates,
  onTraditionChange,
  traditionLogicMode,
  onTraditionLogicChange,
  rankRange,
  onRankChange
}) => {
  // Rank filter state (copied from RankFilter component)
  const [minInput, setMinInput] = useState(rankRange.min.toString())
  const [maxInput, setMaxInput] = useState(rankRange.max.toString())
  const minInputRef = useRef<HTMLInputElement>(null)
  const maxInputRef = useRef<HTMLInputElement>(null)

  // Update local input state when prop changes
  useEffect(() => {
    setMinInput(rankRange.min.toString())
    setMaxInput(rankRange.max.toString())
  }, [rankRange])

  // Search functionality (copied from SpellNameSearch)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch()
    }
  }

  // Tradition functionality (copied from TraditionFilter)
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

  // Rank functionality (copied from RankFilter)
  const handleMinChange = (value: string) => {
    setMinInput(value)
  }

  const handleMaxChange = (value: string) => {
    setMaxInput(value)
  }

  const handleMinBlur = () => {
    const numValue = parseInt(minInput, 10)
    if (!isNaN(numValue)) {
      onRankChange('min', numValue)
    } else {
      setMinInput(rankRange.min.toString())
    }
  }

  const handleMaxBlur = () => {
    const numValue = parseInt(maxInput, 10)
    if (!isNaN(numValue)) {
      onRankChange('max', numValue)
    } else {
      setMaxInput(rankRange.max.toString())
    }
  }

  const handleRankKeyDown = (e: React.KeyboardEvent, type: 'min' | 'max') => {
    if (e.key === 'Enter') {
      if (e.currentTarget instanceof HTMLInputElement) {
        e.currentTarget.blur()
      }
    }
  }

  return (
    <div className="general-filter">
      {/* Search Section */}
      <div className="filter-section">
        <div className="search-row">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search spells..."
            className="search-input"
          />
          <button onClick={onSearch} className="search-btn">
            Search
          </button>
        </div>
      </div>

      {/* Traditions Section */}
      <div className="filter-section">
        <div className="tradition-row">
          <span className="filter-label">Traditions:</span>
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
          <AndOrBtnGroup 
            logicMode={traditionLogicMode}
            onLogicChange={onTraditionLogicChange}
          />
        </div>
      </div>

      {/* Rank Section */}
      <div className="filter-section">
        <div className="rank-row">
          <span className="filter-label">Spell Rank:</span>
          <div className="rank-inputs">
            <input
              ref={minInputRef}
              type="number"
              value={minInput}
              onChange={(e) => handleMinChange(e.target.value)}
              onBlur={handleMinBlur}
              onKeyDown={(e) => handleRankKeyDown(e, 'min')}
              min="1"
              max="10"
              className="rank-input"
            />
            <span className="rank-separator">to</span>
            <input
              ref={maxInputRef}
              type="number"
              value={maxInput}
              onChange={(e) => handleMaxChange(e.target.value)}
              onBlur={handleMaxBlur}
              onKeyDown={(e) => handleRankKeyDown(e, 'max')}
              min="1"
              max="10"
              className="rank-input"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default GeneralFilter
