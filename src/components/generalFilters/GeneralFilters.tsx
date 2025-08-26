import React from 'react'
import './GeneralFilters.css'
import RankFilter from './rankFilter/RankFilter'
import TraditionFilter from './traditionFilter/TraditionFilter'
import TypeFilter from './typeFilter/TypeFilter'
import type { TraditionState } from '../../App'

interface GeneralFiltersProps {
  // SearchFilter props
  searchTerm: string
  onSearchChange: (value: string) => void
  onSearch: () => void
  
  // TraditionFilter props
  traditionStates: Record<string, TraditionState>
  onTraditionChange: (tradition: string, state: TraditionState) => void
  traditionLogicMode: 'AND' | 'OR'
  onTraditionLogicChange: (mode: 'AND' | 'OR') => void
  
  // TypeFilter props
  spellTypeStates: Record<string, boolean>
  onSpellTypeChange: (spellType: string, selected: boolean) => void
  
  // RankFilter props
  rankRange: { min: number; max: number }
  onRankChange: (type: 'min' | 'max', value: number) => void
}

const GeneralFilters: React.FC<GeneralFiltersProps> = ({
  searchTerm,
  onSearchChange,
  onSearch,
  traditionStates,
  onTraditionChange,
  traditionLogicMode,
  onTraditionLogicChange,
  spellTypeStates,
  onSpellTypeChange,
  rankRange,
  onRankChange
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch()
    }
  }

  return (
    <div className="general-filters">
      {/* Search Input - col-span-8 desktop, col-span-12 mobile */}
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search spells..."
        className="search-input grid-col-8"
      />
      
      {/* Search Button - col-span-4 desktop, col-span-12 mobile */}
      <button 
        onClick={onSearch} 
        className="search-btn interactive-base interactive-primary grid-col-4"
      >
        Search
      </button>

      {/* Rank Filter - col-span-4 desktop, col-span-12 mobile */}
      <div className="grid-col-4">
        <RankFilter
          rankRange={rankRange}
          onRankChange={onRankChange}
        />
      </div>
      
      {/* Traditions Filter - col-span-8 desktop, col-span-12 mobile */}
      <div className="grid-col-8">
        <TraditionFilter
          traditionStates={traditionStates}
          onTraditionChange={onTraditionChange}
          traditionLogicMode={traditionLogicMode}
          onTraditionLogicChange={onTraditionLogicChange}
        />
      </div>
      
      {/* Spell Types Filter - col-span-12 all breakpoints */}
      <div className="grid-col-12">
        <TypeFilter
          spellTypeStates={spellTypeStates}
          onSpellTypeChange={onSpellTypeChange}
        />
      </div>
    </div>
  )
}

export default GeneralFilters