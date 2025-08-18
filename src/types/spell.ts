import { SaveType, SpellType, RarityType, ActionCategory } from './enums'

// Database row type - matches the spells table structure exactly
export interface SpellRow {
  id: number
  name: string
  rank: number
  spell_type: SpellType
  save_type: SaveType
  rarity: RarityType
  action_category: ActionCategory
  actions_min: number | null
  actions_max: number | null
  description: string | null
  source_id: number | null
  created_at: string
  updated_at: string
}

// Raw Supabase join response - used internally for API functions
export interface SpellWithJoins extends SpellRow {
  spell_traits: Array<{
    traits: {
      id: number
      name: string
    }
  }>
  spell_traditions: Array<{
    traditions: {
      id: number
      name: string
    }
  }>
  sources: {
    id: number
    book: string
    page: number | null
  } | null
}

// Clean, user-friendly model - what we return from API functions
export interface SpellDetail extends SpellRow {
  traits: { id: number; name: string }[]
  traditions: { id: number; name: string }[]
  source?: {
    id: number
    book: string
    page: number | null
  }
}
