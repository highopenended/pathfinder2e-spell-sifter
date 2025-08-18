import React, { useState, useEffect } from 'react'
import './App.css'
import SpellNameSearch from './components/spellNameSearch/SpellNameSearch'
import TraditionFilter from './components/traditionFilter/TraditionFilter'
import type { TraditionState } from './components/traditionFilter/TraditionFilter'
import TraitFilter from './components/traitFilter/TraitFilter'
import type { TraitState } from './components/traitFilter/TraitFilter'
import SpellListOutput from './components/spellListOutput/SpellListOutput'
import { DatabaseTest } from './components/databaseTest/DatabaseTest'
import { fetchSpellCount, fetchSpellsWithTraits } from './api/spells'
import type { SpellWithJoins } from './types/spell'

function App() {
  const [searchTerm, setSearchTerm] = useState('')
  const [traditionStates, setTraditionStates] = useState<Record<string, TraditionState>>({
    'Arcane': 'unselected',
    'Divine': 'unselected',
    'Occult': 'unselected',
    'Primal': 'unselected'
  })
  const [traitStates, setTraitStates] = useState<Record<string, TraitState>>({})
  const [logicMode, setLogicMode] = useState<'AND' | 'OR'>('OR')
  const [traitLogicMode, setTraitLogicMode] = useState<'AND' | 'OR'>('OR')
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
    console.log('Searching for:', searchTerm)
    console.log('Tradition states:', traditionStates)
    console.log('Trait states:', traitStates)
    console.log('Tradition logic mode:', logicMode)
    console.log('Trait logic mode:', traitLogicMode)
    
    setLoading(true)
    setCurrentPage(1) // Reset to first page on new search
    
    try {
      // For now, just fetch basic spells with traits and pagination
      // TODO: Implement actual filtering logic in next step
      const offset = (1 - 1) * SPELLS_PER_PAGE // First page
      const spellsData = await fetchSpellsWithTraits({
        limit: SPELLS_PER_PAGE,
        offset: offset
      })
      
      setSpells(spellsData)
      
      // Update total pages based on filtered results
      // For now, using total spell count, but this will change when we implement filtering
      if (spellCount) {
        setTotalPages(Math.ceil(spellCount / SPELLS_PER_PAGE))
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
        offset: offset
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
    console.log(`Trait ${trait} changing to state: ${state}`)
    console.log('Previous traitStates:', traitStates)
    
    setTraitStates(prev => {
      // If the trait is going to unselected, remove it from state entirely
      if (state === 'unselected') {
        const newState = { ...prev }
        delete newState[trait]
        console.log('New traitStates (removed unselected):', newState)
        return newState
      }
      
      // Otherwise, update the trait state
      const newState = {
        ...prev,
        [trait]: state
      }
      console.log('New traitStates (updated):', newState)
      return newState
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
              <SpellNameSearch
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onSearch={handleSearch}
              />
        </div>
            <div className="section-box">
              <TraditionFilter
                traditionStates={traditionStates}
                onTraditionChange={handleTraditionChange}
                logicMode={logicMode}
                onLogicChange={setLogicMode}
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
