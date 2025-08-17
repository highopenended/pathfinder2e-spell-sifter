import React, { useState, useEffect } from 'react'
import './App.css'
import SpellNameSearch from './components/spellNameSearch/SpellNameSearch'
import TraditionFilter from './components/traditionFilter/TraditionFilter'
import type { TraditionState } from './components/traditionFilter/TraditionFilter'
import TraitFilter from './components/traitFilter/TraitFilter'
import type { TraitState } from './components/traitFilter/TraitFilter'
import SpellListOutput from './components/spellListOutput/SpellListOutput'
import { supabase } from './lib/supabase'

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
  const [spells, setSpells] = useState<any[]>([])
  const [spellCount, setSpellCount] = useState<number | null>(null)

  // Debug: Fetch spell count on component mount
  useEffect(() => {
    const fetchSpellCount = async () => {
      try {
        console.log('Fetching spell count...')
        const { count, error } = await supabase
          .from('spells')
          .select('*', { count: 'exact', head: true })

        if (error) {
          console.error('Error fetching spell count:', error)
        } else {
          console.log('Spell count:', count)
          setSpellCount(count)
        }
      } catch (err) {
        console.error('Failed to fetch spell count:', err)
      }
    }

    fetchSpellCount()
  }, [])

  const handleSearch = () => {
    console.log('Searching for:', searchTerm)
    console.log('Tradition states:', traditionStates)
    console.log('Trait states:', traitStates)
    console.log('Tradition logic mode:', logicMode)
    console.log('Trait logic mode:', traitLogicMode)
    // TODO: Implement actual search logic
    
    console.log('______________________')
    
    // Mock data for now
    setLoading(true)
    setTimeout(() => {
      const mockSpells = [
        {
          id: 1,
          name: 'Fireball',
          rank: 3,
          spell_type: 'Spell',
          rarity: 'Common',
          save_type: 'Reflex',
          traditions: ['Arcane', 'Primal']
        },
        {
          id: 2,
          name: 'Heal',
          rank: 1,
          spell_type: 'Spell',
          rarity: 'Common',
          save_type: 'None',
          traditions: ['Divine', 'Primal']
        },
        {
          id: 3,
          name: 'Detect Magic',
          rank: 1,
          spell_type: 'Cantrip',
          rarity: 'Common',
          save_type: 'None',
          traditions: ['Arcane', 'Divine', 'Occult', 'Primal']
        }
      ]
      setSpells(mockSpells)
      setLoading(false)
    }, 1000)
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
      // If the trait is becoming unselected, remove it from state entirely
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
      
      {/* Debug spell counter */}
      <div style={{ 
        background: '#f8f9fa', 
        padding: '10px', 
        marginBottom: '20px', 
        borderRadius: '6px',
        border: '2px solid #dee2e6',
        textAlign: 'center'
      }}>
        <strong>Debug:</strong> Database contains {spellCount !== null ? spellCount : 'loading...'} spells
      </div>

      <SpellNameSearch
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSearch={handleSearch}
      />
      <TraditionFilter
        traditionStates={traditionStates}
        onTraditionChange={handleTraditionChange}
        logicMode={logicMode}
        onLogicChange={setLogicMode}
      />
      <TraitFilter
        traitStates={traitStates}
        onTraitChange={handleTraitChange}
        logicMode={traitLogicMode}
        onLogicChange={setTraitLogicMode}
      />
      <SpellListOutput
        spells={spells}
        loading={loading}
      />
    </div>
  )
}

export default App
