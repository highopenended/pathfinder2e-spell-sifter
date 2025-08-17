import React from 'react'
import './SpellNameSearch.css'

interface SpellNameSearchProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  onSearch: () => void
}

const SpellNameSearch: React.FC<SpellNameSearchProps> = ({
  searchTerm,
  onSearchChange,
  onSearch
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch()
    }
  }

  return (
    <div className="spell-name-search">
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
  )
}

export default SpellNameSearch
