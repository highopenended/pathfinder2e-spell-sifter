import { supabase } from '../lib/supabase'
import type { SpellRow, SpellDetail, SpellWithJoins } from '../types/spell'
import { SpellType, RarityType } from '../types/enums'

// Fetch total count of spells in database
export const fetchSpellCount = async (): Promise<number | null> => {
  try {
    const { count, error } = await supabase
      .from('spells')
      .select('*', { count: 'exact', head: true })
    if (error) {
      console.error('Error fetching spell count:', error)
      return null
    } else {
      console.log('Spell count:', count)
      return count as number
    }
  } catch (err) {
    console.error('Failed to fetch spell count:', err)
    return null
  }
}

// Fetch spells with basic filtering
export const fetchSpells = async (options?: {
  limit?: number
  offset?: number
  rank?: number
  spellType?: SpellType
  rarity?: RarityType
}): Promise<SpellRow[]> => {
  try {
    let query = supabase
      .from('spells')
      .select('*')
      .order('name')

    if (options?.limit) {
      query = query.limit(options.limit)
    }
    
    if (options?.offset) {
      query = query.range(options.offset, (options.offset + (options.limit || 50)) - 1)
    }
    
    if (options?.rank !== undefined) {
      query = query.eq('rank', options.rank)
    }
    
    if (options?.spellType) {
      query = query.eq('spell_type', options.spellType)
    }
    
    if (options?.rarity) {
      query = query.eq('rarity', options.rarity)
    }

    const { data, error } = await query

    if (error) throw error
    return (data || []) as SpellRow[]
  } catch (err) {
    console.error('Failed to fetch spells:', err)
    return []
  }
}

// Fetch spell by ID with full details (traits, traditions, source)
export const fetchSpellById = async (id: number): Promise<SpellDetail | null> => {
  try {
    const { data, error } = await supabase
      .from('spells')
      .select(`
        *,
        spell_traits!inner(
          traits(id, name)
        ),
        spell_traditions!inner(
          traditions(id, name)
        ),
        sources(id, book, page)
      `)
      .eq('id', id)
      .single<SpellWithJoins>()

    if (error) throw error

    if (!data) return null

    // Transform the data to match our SpellDetail interface
    const spell: SpellDetail = {
      ...data,
      traits: data.spell_traits.map((st) => st.traits),
      traditions: data.spell_traditions.map((st) => st.traditions),
      source: data.sources ? {
        id: data.sources.id,
        book: data.sources.book,
        page: data.sources.page
      } : undefined
    }

    return spell
  } catch (err) {
    console.error(`Failed to fetch spell ${id}:`, err)
    return null
  }
}
