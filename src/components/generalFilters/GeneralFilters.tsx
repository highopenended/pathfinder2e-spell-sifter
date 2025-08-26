import React from 'react'
import './GeneralFilters.css'
import SearchFilter from './searchFilter/SearchFilter'
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
  return (
    <div className="general-filters">
      {/* Search Section */}
      <div className="filter-section">
        <SearchFilter
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          onSearch={onSearch}
        />
      </div>

      {/* Combined Filters Section - Rank, Traditions, and Type */}
      <div className="filter-section combined-section">
        <div className="filter-container">
          <RankFilter
            rankRange={rankRange}
            onRankChange={onRankChange}
          />
        </div>
        
        <div className="filter-container">
          <TraditionFilter
            traditionStates={traditionStates}
            onTraditionChange={onTraditionChange}
            traditionLogicMode={traditionLogicMode}
            onTraditionLogicChange={onTraditionLogicChange}
          />
        </div>
        
        <div className="filter-container">
          <TypeFilter
            spellTypeStates={spellTypeStates}
            onSpellTypeChange={onSpellTypeChange}
          />
        </div>
      </div>
    </div>
  )
}

export default GeneralFilters