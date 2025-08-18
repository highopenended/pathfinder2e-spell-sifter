import React, { useState, useEffect, useMemo } from 'react'
import './TraitFilter.css'
import '../traitTags/TraitTag.css'
import { fetchTraits } from '../../api/traits'
import { type Trait } from '../../types/trait'
import AndOrBtnGroup from '../andOrBtnGroup/AndOrBtnGroup'
import TraitTag from '../traitTags/TraitTag'
import TinyTraitTag from '../traitTags/TinyTraitTag'
import type { TraitState } from '../../App'

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

  const activeTraitCount = Object.values(traitStates).filter(state => state !== 'unselected').length

  // Create summary display for active traits
  const traitSummary = useMemo(() => {
    const includeTraits: string[] = []
    const excludeTraits: string[] = []
    
    Object.entries(traitStates).forEach(([traitName, state]) => {
      if (state === 'include') {
        includeTraits.push(traitName)
      } else if (state === 'exclude') {
        excludeTraits.push(traitName)
      }
    })
    
    // Sort alphabetically
    includeTraits.sort()
    excludeTraits.sort()
    
    return { includeTraits, excludeTraits }
  }, [traitStates])

  const renderTraitSummary = (traits: string[], state: 'include' | 'exclude', maxVisible: number = 5) => {
    if (traits.length === 0) return null
    
    const visibleTraits = traits.slice(0, maxVisible)
    const remainingCount = traits.length - maxVisible
    
    return (
      <div className="tiny-trait-pills">
        {visibleTraits.map(traitName => (
          <TinyTraitTag
            key={traitName}
            name={traitName}
            state={state}
          />
        ))}
        {remainingCount > 0 && (
          <TinyTraitTag
            name={`+${remainingCount} others`}
            state={state}
          />
        )}
      </div>
    )
  }

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
          <AndOrBtnGroup 
            logicMode={logicMode}
            onLogicChange={onLogicChange}
          />
          <button 
            className="btn-base btn-neutral"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? '▼' : '▲'}
          </button>
        </div>
      </div>

      {/* Trait Summary Display */}
      <div className="trait-summary">
        <div className="summary-section">
          <span className="summary-label">Include:</span>
          {renderTraitSummary(traitSummary.includeTraits, 'include')}
        </div>
        <div className="summary-section">
          <span className="summary-label">Exclude:</span>
          {renderTraitSummary(traitSummary.excludeTraits, 'exclude')}
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
              {filteredTraits.map(trait => (
                <TraitTag
                  key={trait.id}
                  name={trait.name}
                  state={traitStates[trait.name] || 'unselected'}
                  onClick={() => toggleTrait(trait.name)}
                  description={trait.description}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default TraitFilter
