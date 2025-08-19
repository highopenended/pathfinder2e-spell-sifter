import { supabase } from '../lib/supabase'
import type { SpellRow, SpellDetail, SpellWithJoins } from '../types/spell'
import type { TraditionState, TraitState } from '../App'
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
      return count as number
    }
  } catch (err) {
    console.error('Failed to fetch spell count:', err)
    return null
  }
}

// Fetch count of filtered spells
export const fetchFilteredSpellCount = async (options?: {
  searchTerm?: string
  traditionStates?: Record<string, TraditionState>
  traitStates?: Record<string, TraitState>
  traditionLogicMode?: 'AND' | 'OR'
  traitLogicMode?: 'AND' | 'OR'
  rankRange?: { min: number; max: number }
}): Promise<number | null> => {
  try {
    let query = supabase
      .from('v_spells_extended')
      .select('id', { count: 'exact', head: true })

    // Apply name search
    if (options?.searchTerm && options.searchTerm.trim()) {
      query = query.ilike('name', `%${options.searchTerm.trim()}%`)
    }

    // Apply tradition filtering
    if (options?.traditionStates) {
      const selectedTraditions = Object.entries(options.traditionStates)
        .filter(([_, state]) => state === 'include')
        .map(([name, _]) => name)

      if (selectedTraditions.length > 0) {
        if (options.traditionLogicMode === 'AND') {
          query = query.contains('tradition_names', selectedTraditions)
        } else {
          query = query.overlaps('tradition_names', selectedTraditions)
        }
      }
    }

    // Apply trait filtering
    if (options?.traitStates) {
      const selectedTraits = Object.entries(options.traitStates)
        .filter(([_, state]) => state === 'include')
        .map(([name, _]) => name)

      if (selectedTraits.length > 0) {
        if (options.traitLogicMode === 'AND') {
          query = query.contains('trait_names', selectedTraits)
        } else {
          query = query.overlaps('trait_names', selectedTraits)
        }
      }
    }

    // Apply rank range filtering
    if (options?.rankRange) {
      query = query.gte('rank', options.rankRange.min).lte('rank', options.rankRange.max)
    }

    const { count, error } = await query
    if (error) {
      console.error('Error fetching filtered spell count:', error)
      return null
    } else {
      return count as number
    }
  } catch (err) {
    console.error('Failed to fetch filtered spell count:', err)
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

// Fetch spells with traits for display in spell cards
export const fetchSpellsWithTraits = async (options?: {
  limit?: number
  offset?: number
  rank?: number
  spellType?: SpellType
  rarity?: RarityType
  // Search criteria
  searchTerm?: string
  traditionStates?: Record<string, TraditionState>
  traitStates?: Record<string, TraitState>
  traditionLogicMode?: 'AND' | 'OR'
  traitLogicMode?: 'AND' | 'OR'
  rankRange?: { min: number; max: number }
}): Promise<SpellWithJoins[]> => {
  try {
    // Use the optimized view instead of manual JOINs
    let query = supabase
      .from('v_spells_extended')
      .select('*')
      .order('name')

    // Apply pagination
    if (options?.limit) {
      query = query.limit(options.limit)
    }
    
    if (options?.offset) {
      query = query.range(options.offset, (options.offset + (options.limit || 50)) - 1)
    }
    
    // Apply basic filters
    if (options?.rank !== undefined) {
      query = query.eq('rank', options.rank)
    }
    
    if (options?.spellType) {
      query = query.eq('spell_type', options.spellType)
    }
    
    if (options?.rarity) {
      query = query.eq('rarity', options.rarity)
    }

    // Apply name search
    if (options?.searchTerm && options.searchTerm.trim()) {
      query = query.ilike('name', `%${options.searchTerm.trim()}%`)
    }

    // Apply tradition filtering
    if (options?.traditionStates) {
      const selectedTraditions = Object.entries(options.traditionStates)
        .filter(([_, state]) => state === 'include')
        .map(([name, _]) => name)

      if (selectedTraditions.length > 0) {
        if (options.traditionLogicMode === 'AND') {
          // ALL traditions (contains)
          query = query.contains('tradition_names', selectedTraditions)
        } else {
          // ANY traditions (overlaps)
          query = query.overlaps('tradition_names', selectedTraditions)
        }
      }
    }

    // Apply trait filtering
    if (options?.traitStates) {
      const selectedTraits = Object.entries(options.traitStates)
        .filter(([_, state]) => state === 'include')
        .map(([name, _]) => name)

      if (selectedTraits.length > 0) {
        if (options.traitLogicMode === 'AND') {
          // ALL traits (contains)
          query = query.contains('trait_names', selectedTraits)
        } else {
          // ALL traits (overlaps)
          query = query.overlaps('trait_names', selectedTraits)
        }
      }
    }

    // Apply rank range filtering
    if (options?.rankRange) {
      query = query.gte('rank', options.rankRange.min).lte('rank', options.rankRange.max)
    }

    const { data, error } = await query

    if (error) throw error

    // Fetch trait descriptions for all unique trait names
    const allTraitNames = [...new Set(
      (data || []).flatMap(spell => spell.trait_names || [])
    )]
    
    let traitDescriptions: Record<string, string> = {}
    if (allTraitNames.length > 0) {
      const { data: traitsData, error: traitsError } = await supabase
        .from('traits')
        .select('name, description')
        .in('name', allTraitNames)
      
      if (!traitsError && traitsData) {
        traitDescriptions = traitsData.reduce((acc, trait) => {
          acc[trait.name] = trait.description || 'No description available'
          return acc
        }, {} as Record<string, string>)
      }
    }

    // Transform the view data to match our SpellWithJoins interface
    return (data || []).map(spell => ({
      id: spell.id,
      name: spell.name,
      rank: spell.rank,
      spell_type: spell.spell_type,
      save_type: spell.save_type,
      rarity: spell.rarity,
      action_category: spell.action_category,
      actions_min: spell.actions_min,
      actions_max: spell.actions_max,
      description: spell.description,
      source_id: spell.source_id,
      created_at: spell.created_at,
      updated_at: spell.updated_at,
      spell_traits: spell.trait_names?.map((name: string, index: number) => ({
        traits: {
          id: spell.trait_ids?.[index] || 0,
          name: name,
          description: traitDescriptions[name] || 'No description available'
        }
      })) || [],
      spell_traditions: spell.tradition_names?.map((name: string, index: number) => ({
        traditions: {
          id: spell.tradition_ids?.[index] || 0,
          name: name
        }
      })) || [],
      sources: spell.book ? {
        id: spell.source_id || 0,
        book: spell.book,
        page: spell.page
      } : null
    })) as SpellWithJoins[]
  } catch (err) {
    console.error('Failed to fetch spells with traits:', err)
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
