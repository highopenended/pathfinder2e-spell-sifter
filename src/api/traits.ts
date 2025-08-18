import { supabase } from '../lib/supabase'
import type { Trait } from '../types/trait'

let cachedTraits: Trait[] | null = null

export const fetchTraits = async (): Promise<Trait[]> => {
  if (cachedTraits) {
    return cachedTraits
  }

  try {
    const { data, error } = await supabase
      .from('traits')
      .select('id, name, description')
      .order('name')

    if (error) throw error

    cachedTraits = data || []
    return cachedTraits
  } catch (err) {
    console.error('Failed to fetch traits:', err)
    return []
  }
}
