import React from 'react'
import './SpellCard.css'
import TinyTraitTag from '../traitTags/TinyTraitTag'
import type { SpellWithJoins } from '../../types/spell'

interface SpellCardProps {
  spell: SpellWithJoins
}

const SpellCard: React.FC<SpellCardProps> = ({ spell }) => {
  return (
    <div className="spell-card">
      <div className="spell-name">{spell.name}</div>
      <div className="spell-details">
        {spell.rank === 0 ? 'Cantrip' : `Rank ${spell.rank}`} • {spell.spell_type} • {spell.rarity} • {spell.save_type}
      </div>
      
      {spell.spell_traits && spell.spell_traits.length > 0 && (
        <div className="spell-traits tiny-trait-pills">
          {spell.spell_traits.map(({ traits }) => (
            <TinyTraitTag
              key={traits.id}
              name={traits.name}
              state="readonly"
              description={traits.description}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default SpellCard
