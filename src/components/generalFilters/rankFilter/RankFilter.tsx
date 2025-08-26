import React, { useState, useRef, useEffect } from 'react'
import './RankFilter.css'

interface RankFilterProps {
  rankRange: { min: number; max: number }
  onRankChange: (type: 'min' | 'max', value: number) => void
}

const RankFilter: React.FC<RankFilterProps> = ({
  rankRange,
  onRankChange
}) => {
  const [minInput, setMinInput] = useState(rankRange.min.toString())
  const [maxInput, setMaxInput] = useState(rankRange.max.toString())
  const minInputRef = useRef<HTMLInputElement>(null)
  const maxInputRef = useRef<HTMLInputElement>(null)

  // Update local input state when prop changes
  useEffect(() => {
    setMinInput(rankRange.min.toString())
    setMaxInput(rankRange.max.toString())
  }, [rankRange])

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (e.currentTarget instanceof HTMLInputElement) {
        e.currentTarget.blur()
      }
    }
  }

  return (
    <div className="rank-filter">
      <span className="filter-label">Spell Rank:</span>
      <div className="rank-inputs">
        <input
          ref={minInputRef}
          type="number"
          value={minInput}
          onChange={(e) => handleMinChange(e.target.value)}
          onBlur={handleMinBlur}
          onKeyDown={handleKeyDown}
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
          onKeyDown={handleKeyDown}
          min="1"
          max="10"
          className="rank-input"
        />
      </div>
    </div>
  )
}

export default RankFilter
