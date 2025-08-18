// Database row type - matches the spells table structure exactly
export interface SpellRow {
  id: number
  name: string
  rank: number
  spell_type: 'Cantrip' | 'Spell' | 'Focus' | 'Ritual'
  save_type: 'Fortitude' | 'Reflex' | 'Will' | 'None'
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Unique'
  action_category: 'None' | 'Free' | 'Reaction' | 'Activity'
  actions_min: number | null
  actions_max: number | null
  description: string | null
  source_id: number | null
  created_at: string
  updated_at: string
}

// Enriched model with related data from join tables
export interface SpellDetail extends SpellRow {
  traits: { id: number; name: string }[]
  traditions: { id: number; name: string }[]
  source?: {
    id: number
    book: string
    page: number | null
  }
}
