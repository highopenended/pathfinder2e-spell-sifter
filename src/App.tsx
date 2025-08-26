import React, { useState, useEffect } from 'react'
import './App.css'
import GeneralFilters from './components/generalFilters/GeneralFilters'
import TraitFilter from './components/traitFilter/TraitFilter'
import SpellListOutput from './components/spellListOutput/SpellListOutput'
import { DatabaseTest } from './components/databaseTest/DatabaseTest'
import { fetchSpellCount, fetchSpellsWithTraits, fetchFilteredSpellCount } from './api/spells'
import type { SpellWithJoins } from './types/spell'

// State type definitions - centralized here for easy testing
export type TraditionState = 'unselected' | 'include' | 'exclude'
export type TraitState = 'unselected' | 'include' | 'exclude'

function App() {
  const [searchTerm, setSearchTerm] = useState('')
  const [traditionStates, setTraditionStates] = useState<Record<string, TraditionState>>({
    'Arcane': 'unselected',
    'Divine': 'unselected',
    'Occult': 'unselected',
    'Primal': 'unselected'
  })
  const [traitStates, setTraitStates] = useState<Record<string, TraitState>>({})
  const [traditionLogicMode, setTraditionLogicMode] = useState<'AND' | 'OR'>('OR')
  const [traitLogicMode, setTraitLogicMode] = useState<'AND' | 'OR'>('OR')
  const [rankRange, setRankRange] = useState<{ min: number; max: number }>({ min: 1, max: 10 })
  const [loading, setLoading] = useState(false)
  const [spells, setSpells] = useState<SpellWithJoins[]>([])
  const [spellCount, setSpellCount] = useState<number | null>(null)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const SPELLS_PER_PAGE = 10

  // Debug: Fetch spell count on component mount
  useEffect(() => {
    const getSpellCount = async () => {
      try {
        const count = await fetchSpellCount()
        setSpellCount(count)
        if (count) {
          setTotalPages(Math.ceil(count / SPELLS_PER_PAGE))
        }
      } catch (err) {
        console.error('Failed to fetch spell count:', err)
      }
    }

    getSpellCount()
  }, [])

  const handleSearch = async () => {
    setLoading(true)
    setCurrentPage(1) // Reset to first page on new search
    
    try {
      // Pass all search criteria to the API function
      const offset = (1 - 1) * SPELLS_PER_PAGE // First page
      const spellsData = await fetchSpellsWithTraits({
        limit: SPELLS_PER_PAGE,
        offset: offset,
        searchTerm: searchTerm,
        traditionStates: traditionStates,
        traitStates: traitStates,
        traditionLogicMode: traditionLogicMode,
        traitLogicMode: traitLogicMode,
        rankRange: rankRange
      })
      
      setSpells(spellsData)
      
      // Get filtered count for proper pagination
      const filteredCount = await fetchFilteredSpellCount({
        searchTerm: searchTerm,
        traditionStates: traditionStates,
        traitStates: traitStates,
        traditionLogicMode: traditionLogicMode,
        traitLogicMode: traitLogicMode,
        rankRange: rankRange
      })
      
      if (filteredCount !== null) {
        setTotalPages(Math.ceil(filteredCount / SPELLS_PER_PAGE))
      }
    } catch (err) {
      console.error('Failed to fetch spells:', err)
      setSpells([])
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = async (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return
    
    setCurrentPage(newPage)
    setLoading(true)
    
    try {
      const offset = (newPage - 1) * SPELLS_PER_PAGE
      const spellsData = await fetchSpellsWithTraits({
        limit: SPELLS_PER_PAGE,
        offset: offset,
        searchTerm: searchTerm,
        traditionStates: traditionStates,
        traitStates: traitStates,
        traditionLogicMode: traditionLogicMode,
        traitLogicMode: traitLogicMode,
        rankRange: rankRange
      })
      
      setSpells(spellsData)
    } catch (err) {
      console.error('Failed to fetch spells for page', newPage, ':', err)
    } finally {
      setLoading(false)
    }
  }

  const handleTraditionChange = (tradition: string, state: TraditionState) => {
    setTraditionStates(prev => ({
      ...prev,
      [tradition]: state
    }))
  }

  const handleTraitChange = (trait: string, state: TraitState) => {
    
    setTraitStates(prev => {
      // If the trait is going to unselected, remove it from state entirely
      if (state === 'unselected') {
        const newState = { ...prev }
        delete newState[trait]
        return newState
      }
      
      // Otherwise, update the trait state
      const newState = {
        ...prev,
        [trait]: state
      }
      return newState
    })
  }

  const handleRankChange = (type: 'min' | 'max', value: number) => {
    setRankRange(prev => {
      let newMin = prev.min
      let newMax = prev.max
      
      if (type === 'min') {
        newMin = Math.max(1, Math.min(10, value))
        if (newMin > prev.max) {
          newMax = newMin
        }
      } else {
        newMax = Math.max(1, Math.min(10, value))
        if (newMax < prev.min) {
          newMin = newMax
        }
      }
      
      return { min: newMin, max: newMax }
    })
  }

  return (
    <div className="App">
      <h1>Spell Sifter</h1>
      
      <div className="app-layout">
        {/* Left side - Search Criteria */}
        <div className="search-criteria">
          <div className="column-container">
            <div className="section-box">
              <GeneralFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onSearch={handleSearch}
                traditionStates={traditionStates}
                onTraditionChange={handleTraditionChange}
                traditionLogicMode={traditionLogicMode}
                onTraditionLogicChange={setTraditionLogicMode}
                rankRange={rankRange}
                onRankChange={handleRankChange}
              />
            </div>
            <div className="section-box">
              <TraitFilter
                traitStates={traitStates}
                onTraitChange={handleTraitChange}
                logicMode={traitLogicMode}
                onLogicChange={setTraitLogicMode}
              />
            </div>
            <div className="section-box">
              <DatabaseTest />
            </div>
          </div>
        </div>

        {/* Right side - Results */}
        <div className="results-section">
          <div className="column-container">
            <div className="section-box">
              <SpellListOutput
                spells={spells}
                loading={loading}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
