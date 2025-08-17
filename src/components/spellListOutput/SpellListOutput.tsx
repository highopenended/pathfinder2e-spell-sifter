import React from 'react'
import './SpellListOutput.css'

interface Spell {
  id: number
  name: string
  rank: number
  spell_type: string
  rarity: string
  save_type: string
  is_custom?: boolean
  is_favorite?: boolean
  traditions?: string[]
}

interface SpellListOutputProps {
  spells: Spell[]
  loading: boolean
}

const SpellListOutput: React.FC<SpellListOutputProps> = ({ spells, loading }) => {
  if (loading) {
    return (
      <div className="spell-list-output">
        <div className="loading">Searching...</div>
      </div>
    )
  }

  if (spells.length === 0) {
    return (
      <div className="spell-list-output">
        <div className="no-results">No spells found matching your criteria.</div>
      </div>
    )
  }

  return (
    <div className="spell-list-output">
      <div className="results-header">
        <h3>Results ({spells.length} spells)</h3>
      </div>
      <div className="spell-list">
        {spells.map(spell => (
          <div key={spell.id} className="spell-item">
            <div className="spell-name">{spell.name}</div>
            <div className="spell-details">
              {spell.rank === 0 ? 'Cantrip' : `Rank ${spell.rank}`} • {spell.spell_type} • {spell.rarity} • {spell.save_type}
              {spell.is_custom && <span className="custom-tag">Custom</span>}
            </div>
            {spell.traditions && spell.traditions.length > 0 && (
              <div className="spell-traditions">
                {spell.traditions.join(', ')}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default SpellListOutput
