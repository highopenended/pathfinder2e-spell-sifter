import React from 'react'
import './TypeFilter.css'
import '../../traitTags/TraitTag.css'

interface TypeFilterProps {
  spellTypeStates: Record<string, boolean>
  onSpellTypeChange: (spellType: string, selected: boolean) => void
}

const TypeFilter: React.FC<TypeFilterProps> = ({
  spellTypeStates,
  onSpellTypeChange
}) => {
  const spellTypes = ['Cantrips', 'Ranked', 'Focus']

  const toggleSpellType = (spellType: string) => {
    const current = spellTypeStates[spellType] || false
    onSpellTypeChange(spellType, !current)
  }

  const getSpellTypeClass = (spellType: string) => {
    const selected = spellTypeStates[spellType] || false
    return selected ? 'interactive-base interactive-include tag-button' : 'interactive-base tag-button'
  }

  return (
    <div className="filter-component">
      <div className="filter-header">
        <span className="filter-label">Spell Types</span>
      </div>
      <div className="filter-button-group">
        {spellTypes.map(spellType => (
          <button
            key={spellType}
            className={getSpellTypeClass(spellType)}
            onClick={() => toggleSpellType(spellType)}
          >
            {spellType}
          </button>
        ))}
      </div>
    </div>
  )
}

export default TypeFilter
