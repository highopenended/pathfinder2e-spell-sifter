import React from 'react'
import './SearchFilter.css'

interface SearchFilterProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  onSearch: () => void
}

const SearchFilter: React.FC<SearchFilterProps> = ({
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
    <div className="search-filter">
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
  )
}

export default SearchFilter
