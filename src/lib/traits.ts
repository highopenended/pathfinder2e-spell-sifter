import { supabase } from './supabase'

export interface Trait {
  id: number
  name: string
  description: string
}

let cachedTraits: Trait[] | null = null

export const fetchTraits = async (): Promise<Trait[]> => {
  if (cachedTraits) {
    return cachedTraits
  }

  try {
    console.log('Fetching traits from Supabase...')
    console.log('Supabase client:', supabase)
    
    const { data, error } = await supabase
      .from('traits')
      .select('id, name, description')
      .order('name')

    console.log('Supabase response:', { data, error })

    if (error) {
      console.error('Error fetching traits:', error)
      throw error
    }

    cachedTraits = data || []
    console.log('Successfully fetched traits:', cachedTraits.length)
    return cachedTraits
  } catch (err) {
    console.error('Failed to fetch traits:', err)
    return []
  }
}
