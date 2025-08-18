import React, { useState, useEffect, useMemo } from 'react'
import './TraitFilter.css'
import { fetchTraits } from '../../api/traits'
import { type Trait } from '../../types/trait'

export type TraitState = 'unselected' | 'include' | 'exclude'

interface TraitFilterProps {
  traitStates: Record<string, TraitState>
  onTraitChange: (trait: string, state: TraitState) => void
  logicMode: 'AND' | 'OR'
  onLogicChange: (mode: 'AND' | 'OR') => void
}

const TraitFilter: React.FC<TraitFilterProps> = ({
  traitStates,
  onTraitChange,
  logicMode,
  onLogicChange
}) => {
  const [traits, setTraits] = useState<Trait[]>([])
  const [loading, setLoading] = useState(true)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const loadTraits = async () => {
      setLoading(true)
      try {
        const traitsData = await fetchTraits()
        setTraits(traitsData)
      } catch (err) {
        console.error('Failed to load traits:', err)
      } finally {
        setLoading(false)
      }
    }

    loadTraits()
  }, [])

  const toggleTrait = (traitName: string) => {
    const current = traitStates[traitName] || 'unselected'
    let next: TraitState
    
    if (current === 'unselected') {
      next = 'include'
    } else if (current === 'include') {
      next = 'exclude'
    } else {
      next = 'unselected'
    }
    
    // If the trait is going to unselected, remove it from state entirely
    if (next === 'unselected') {
      onTraitChange(traitName, 'unselected') // This will trigger removal in parent
    } else {
      onTraitChange(traitName, next)
    }
  }

  const getTraitClass = (traitName: string) => {
    const state = traitStates[traitName] || 'unselected'
    if (state === 'include') return 'tag-base tag-include'
    if (state === 'exclude') return 'tag-base tag-exclude'
    return 'tag-base'
  }

  const clearAllTraits = () => {
    traits.forEach(trait => {
      if (traitStates[trait.name] && traitStates[trait.name] !== 'unselected') {
        onTraitChange(trait.name, 'unselected')
      }
    })
  }

  // Filter traits based on search term
  const filteredTraits = useMemo(() => {
    if (!searchTerm.trim()) return traits
    
    return traits.filter(trait => 
      trait.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [traits, searchTerm])

  // Sort traits: active ones first (sorted alphabetically), then inactive ones (sorted alphabetically)
  const sortedTraits = useMemo(() => {
    return [...filteredTraits].sort((a, b) => {
      const aState = traitStates[a.name] || 'unselected'
      const bState = traitStates[b.name] || 'unselected'
      
      // Active traits (include/exclude) come first
      const aActive = aState !== 'unselected'
      const bActive = bState !== 'unselected'
      
      if (aActive && !bActive) return -1
      if (!aActive && bActive) return 1
      
      // If both are active, sort alphabetically
      if (aActive && bActive) {
        return a.name.localeCompare(b.name)
      }
      
      // If both are inactive, sort alphabetically
      return a.name.localeCompare(b.name)
    })
  }, [filteredTraits, traitStates])

  const activeTraitCount = Object.values(traitStates).filter(state => state !== 'unselected').length

  if (loading) {
    return (
      <div className="trait-filter">
        <div className="trait-header">
          <span className="trait-label">Traits:</span>
          <button className="collapse-btn" disabled>
            Loading...
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="trait-filter">
      <div className="trait-header">
        <span className="trait-label">
          Traits: {activeTraitCount > 0 && `(${activeTraitCount} active)`}
        </span>
        <div className="header-controls">
          <div className="logic-toggle">
            <button 
              className={`btn-base ${logicMode === 'AND' ? 'btn-primary' : ''}`}
              onClick={() => onLogicChange('AND')}
            >
              AND
            </button>
            <button 
              className={`btn-base ${logicMode === 'OR' ? 'btn-primary' : ''}`}
              onClick={() => onLogicChange('OR')}
            >
              OR
            </button>
          </div>
          <button 
            className="btn-base btn-neutral"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? '▼' : '▲'}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <>
          <div className="trait-controls">
            <div className="search-container">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search traits..."
                className="trait-search-input"
              />
            </div>
            <button 
              onClick={clearAllTraits}
              className="btn-base btn-danger"
              disabled={activeTraitCount === 0}
            >
              Clear All
            </button>
          </div>

          <div className="trait-pills-container">
            <div className="trait-pills">
              {sortedTraits.map(trait => (
                <button
                  key={trait.id}
                  className={getTraitClass(trait.name)}
                  onClick={() => toggleTrait(trait.name)}
                  title={trait.description}
                >
                  {trait.name}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default TraitFilter
