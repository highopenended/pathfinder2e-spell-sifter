// Database enum types - matches the enums defined in 001_create_enums.sql
export const SaveType = {
  Fortitude: 'Fortitude',
  Reflex: 'Reflex',
  Will: 'Will',
  None: 'None'
} as const

export const SpellType = {
  Cantrip: 'Cantrip',
  Spell: 'Spell',
  Focus: 'Focus',
  Ritual: 'Ritual'
} as const

export const RarityType = {
  Common: 'Common',
  Uncommon: 'Uncommon',
  Rare: 'Rare',
  Unique: 'Unique'
} as const

export const ActionCategory = {
  None: 'None',
  Free: 'Free',
  Reaction: 'Reaction',
  Activity: 'Activity'
} as const

// Type exports for use in interfaces
export type SaveType = typeof SaveType[keyof typeof SaveType]
export type SpellType = typeof SpellType[keyof typeof SpellType]
export type RarityType = typeof RarityType[keyof typeof RarityType]
export type ActionCategory = typeof ActionCategory[keyof typeof ActionCategory]
