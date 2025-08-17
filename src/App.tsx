import { useState } from 'react'
import { supabase } from './lib/supabase'
import './App.css'

interface Spell {
  id: number
  name: string
  rank: number
  spell_type: string
  rarity: string
  save_type: string
  is_custom: boolean
  is_favorite: boolean
}

type TraditionState = 'unselected' | 'include' | 'exclude'

function App() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRank, setSelectedRank] = useState<string>('')
  const [selectedType, setSelectedType] = useState<string>('')
  const [selectedRarity, setSelectedRarity] = useState<string>('')
  const [selectedSave, setSelectedSave] = useState<string>('')
  const [traditionsLogic, setTraditionsLogic] = useState<'AND' | 'OR'>('OR')
  const [traditionStates, setTraditionStates] = useState<Record<string, TraditionState>>({
    'Arcane': 'unselected',
    'Divine': 'unselected',
    'Occult': 'unselected',
    'Primal': 'unselected'
  })
  const [spells, setSpells] = useState<Spell[]>([])
  const [loading, setLoading] = useState(false)

  const toggleTradition = (tradition: string) => {
    setTraditionStates(prev => {
      const current = prev[tradition]
      const next: Record<string, TraditionState> = { ...prev }
      
      if (current === 'unselected') {
        next[tradition] = 'include'
      } else if (current === 'include') {
        next[tradition] = 'exclude'
      } else {
        next[tradition] = 'unselected'
      }
      
      return next
    })
  }

  const searchSpells = async () => {
    setLoading(true)
    try {
      const activeTraditions = Object.entries(traditionStates).filter(([_, state]) => state !== 'unselected')
      const needsTraditions = activeTraditions.length > 0
      
      // Use the appropriate view based on whether we need tradition data
      const viewName = needsTraditions ? 'v_spell_flat_effective' : 'v_spell_search_effective'
      
      console.log('Using view:', viewName)
      console.log('Active traditions:', activeTraditions)
      
      let query = supabase
        .from(viewName)
        .select('*')
        .order('name')

      if (searchTerm.trim()) {
        query = query.ilike('name', `%${searchTerm}%`)
      }
      if (selectedRank !== '') {
        query = query.eq('rank', parseInt(selectedRank))
      }
      if (selectedType !== '') {
        query = query.eq('spell_type', selectedType)
      }
      if (selectedRarity !== '') {
        query = query.eq('rarity', selectedRarity)
      }
      if (selectedSave !== '') {
        query = query.eq('save_type', selectedSave)
      }

      const { data, error } = await query.limit(100)
      
      if (error) {
        console.error('Query error:', error)
        throw error
      }
      
      console.log('Raw data from view:', data)
      console.log('First spell sample:', data?.[0])
      
      let filteredData = data || []
      
      // Apply tradition filtering if needed
      if (needsTraditions) {
        console.log('Applying tradition filtering...')
        filteredData = filteredData.filter(spell => {
          const spellTraditions = spell.traditions || []
          console.log(`Spell ${spell.name} has traditions:`, spellTraditions)
          
          if (traditionsLogic === 'AND') {
            // All include conditions must be true, no exclude conditions can be true
            const includeTraditions = activeTraditions.filter(([_, state]) => state === 'include').map(([name]) => name)
            const excludeTraditions = activeTraditions.filter(([_, state]) => state === 'exclude').map(([name]) => name)
            
            const hasAllInclude = includeTraditions.every(t => spellTraditions.includes(t))
            const hasNoExclude = !excludeTraditions.some(t => spellTraditions.includes(t))
            
            console.log(`Include: ${includeTraditions}, Exclude: ${excludeTraditions}`)
            console.log(`Has all include: ${hasAllInclude}, Has no exclude: ${hasNoExclude}`)
            
            return hasAllInclude && hasNoExclude
          } else {
            // OR logic: at least one include condition must be true, no exclude conditions can be true
            const includeTraditions = activeTraditions.filter(([_, state]) => state === 'include').map(([name]) => name)
            const excludeTraditions = activeTraditions.filter(([_, state]) => state === 'exclude').map(([name]) => name)
            
            const hasAnyInclude = includeTraditions.length === 0 || includeTraditions.some(t => spellTraditions.includes(t))
            const hasNoExclude = !excludeTraditions.some(t => spellTraditions.includes(t))
            
            console.log(`Include: ${includeTraditions}, Exclude: ${excludeTraditions}`)
            console.log(`Has any include: ${hasAnyInclude}, Has no exclude: ${hasNoExclude}`)
            
            return hasAnyInclude && hasNoExclude
          }
        })
        
        console.log('After tradition filtering:', filteredData.length, 'spells')
      }
      
      setSpells(filteredData)
    } catch (err) {
      console.error('Search error:', err)
      setSpells([])
    } finally {
      setLoading(false)
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedRank('')
    setSelectedType('')
    setSelectedRarity('')
    setSelectedSave('')
    setTraditionStates({
      'Arcane': 'unselected',
      'Divine': 'unselected',
      'Occult': 'unselected',
      'Primal': 'unselected'
    })
    setSpells([])
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    searchSpells()
  }

  const getTraditionClass = (tradition: string) => {
    const state = traditionStates[tradition]
    if (state === 'include') return 'tradition-btn include'
    if (state === 'exclude') return 'tradition-btn exclude'
    return 'tradition-btn'
  }

  return (
    <div className="App">
      <div className="search-section">
        <div className="search-row">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchSpells()}
            placeholder="Search spells..."
            className="search-input"
          />
          <button onClick={searchSpells} disabled={loading} className="search-btn">
            {loading ? '...' : 'Search'}
          </button>
        </div>
        
        <div className="filters-row">
          <select value={selectedRank} onChange={(e) => setSelectedRank(e.target.value)} className="filter-select">
            <option value="">All Ranks</option>
            <option value="0">Cantrip</option>
            <option value="1">Rank 1</option>
            <option value="2">Rank 2</option>
            <option value="3">Rank 3</option>
            <option value="4">Rank 4</option>
            <option value="5">Rank 5</option>
            <option value="6">Rank 6</option>
            <option value="7">Rank 7</option>
            <option value="8">Rank 8</option>
            <option value="9">Rank 9</option>
            <option value="10">Rank 10</option>
          </select>
          
          <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="filter-select">
            <option value="">All Types</option>
            <option value="Cantrip">Cantrip</option>
            <option value="Spell">Spell</option>
            <option value="Focus">Focus</option>
            <option value="Ritual">Ritual</option>
          </select>
          
          <select value={selectedRarity} onChange={(e) => setSelectedRarity(e.target.value)} className="filter-select">
            <option value="">All Rarities</option>
            <option value="Common">Common</option>
            <option value="Uncommon">Uncommon</option>
            <option value="Rare">Rare</option>
            <option value="Unique">Unique</option>
          </select>
          
          <select value={selectedSave} onChange={(e) => setSelectedSave(e.target.value)} className="filter-select">
            <option value="">All Saves</option>
            <option value="None">No Save</option>
            <option value="Fortitude">Fortitude</option>
            <option value="Reflex">Reflex</option>
            <option value="Will">Will</option>
          </select>
          
          <button onClick={clearFilters} className="clear-btn">Clear</button>
                </div>

        <div className="traditions-section">
          <div className="traditions-header">
            <span className="traditions-label">Traditions:</span>
            <div className="logic-toggle">
              <button 
                className={`logic-btn ${traditionsLogic === 'AND' ? 'active' : ''}`}
                onClick={() => setTraditionsLogic('AND')}
              >
                AND
              </button>
              <button 
                className={`logic-btn ${traditionsLogic === 'OR' ? 'active' : ''}`}
                onClick={() => setTraditionsLogic('OR')}
              >
                OR
              </button>
            </div>
          </div>
          <div className="traditions-row">
            {Object.keys(traditionStates).map(tradition => (
              <button
                key={tradition}
                className={getTraditionClass(tradition)}
                onClick={() => toggleTradition(tradition)}
              >
                {tradition}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="results">
        {spells.map(spell => (
          <div key={spell.id} className="spell-item">
            <div className="spell-name">{spell.name}</div>
            <div className="spell-details">
              {spell.rank === 0 ? 'Cantrip' : `Rank ${spell.rank}`} • {spell.spell_type} • {spell.rarity} • {spell.save_type}
              {spell.is_custom && <span className="custom-tag">Custom</span>}
            </div>
      </div>
        ))}
      </div>
    </div>
  )
}

export default App
