
-- Types
CREATE TYPE IF NOT EXISTS save_type_enum   AS ENUM ('Fortitude', 'Reflex', 'Will', 'None');
CREATE TYPE IF NOT EXISTS spell_type_enum  AS ENUM ('Cantrip', 'Spell', 'Focus', 'Ritual');
CREATE TYPE IF NOT EXISTS rarity_type_enum AS ENUM ('Common', 'Uncommon', 'Rare', 'Unique');

CREATE TYPE IF NOT EXISTS action_category_enum AS ENUM ('None', 'Free', 'Reaction', 'Activity');

-- TABLE: traits 
-- the master list of all traits
CREATE TABLE IF NOT EXISTS traits (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,   -- e.g., "Necromancy", "Negative", "Cantrip"
  description TEXT             -- long text from your traits JSON (optional)
);

-- TABLE:SOURCES
-- the books and adventure paths
CREATE TABLE IF NOT EXISTS sources (
  id SERIAL PRIMARY KEY,
  raw_text TEXT NOT NULL, 
  book TEXT,          -- "Secrets of Magic" | "Pathfinder #186: Ghost King’s Rage"
  page INT,           -- 75 (NULL if not present)
  notes TEXT         -- Notes if we need to add any
);

-- TABLE:TRADITIONS
-- (Arcane, Divine, Occult, Primal)
CREATE TABLE IF NOT EXISTS traditions (
  id   SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

-- TABLE:SPELLS
-- one spell per row
CREATE TABLE IF NOT EXISTS spells (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,

  -- Core fields you’ll filter on
  level INT NOT NULL CHECK (level BETWEEN 0 AND 10),
  spell_type  spell_type_enum  NOT NULL DEFAULT 'Spell',
  rarity      rarity_type_enum NOT NULL DEFAULT 'Common',
  save_type   save_type_enum   NOT NULL DEFAULT 'None',

  -- Actions (structured + raw, to handle weird cases like "1 to 3 actions")
  action_category action_category_enum NOT NULL DEFAULT 'Activity',
  actions_min INT CHECK (actions_min BETWEEN 0 AND 3),
  actions_max INT CHECK (actions_max BETWEEN 0 AND 3),
  actions_raw TEXT,  -- original text, e.g. "1 to 3 actions" (for weird cases)

  -- Descriptive text (PF2e is messy; keep these free-form)
  summary TEXT,
  range TEXT,
  area TEXT,
  duration TEXT,
  school TEXT,
  heighten_text TEXT,
  link TEXT,

  -- Link to the source row (book/page) we created earlier
  source_id INT REFERENCES sources(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()

);


-- JOIN TABLE: spell_traits
-- which traits each spell has
CREATE TABLE IF NOT EXISTS spell_traits (
  spell_id INT NOT NULL REFERENCES spells(id) ON DELETE CASCADE,
  trait_id INT NOT NULL REFERENCES traits(id) ON DELETE CASCADE,
  PRIMARY KEY (spell_id, trait_id)
);

-- Helpful indexes for filtering/search
CREATE INDEX IF NOT EXISTS idx_spell_traits_trait  ON spell_traits(trait_id);
CREATE INDEX IF NOT EXISTS idx_spell_traits_spell  ON spell_traits(spell_id);

-- JOIN TABLE: spell_traditions
-- which traditions each spell has
CREATE TABLE IF NOT EXISTS spell_traditions (
  spell_id     INT NOT NULL REFERENCES spells(id)     ON DELETE CASCADE,
  tradition_id INT NOT NULL REFERENCES traditions(id) ON DELETE CASCADE,
  PRIMARY KEY (spell_id, tradition_id)
);

-- Helpful indexes for filtering/search
CREATE INDEX IF NOT EXISTS idx_spell_traditions_spell     ON spell_traditions(spell_id);
CREATE INDEX IF NOT EXISTS idx_spell_traditions_tradition ON spell_traditions(tradition_id);


-- NOTE: Spell Components have been removed in the remaster, ignore entirely.