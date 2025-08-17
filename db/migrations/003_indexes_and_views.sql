-- =========================
-- Indexes (query-tuning)
-- =========================

-- Join tables
CREATE INDEX IF NOT EXISTS idx_spell_traits_trait          ON spell_traits(trait_id);
CREATE INDEX IF NOT EXISTS idx_spell_traits_spell          ON spell_traits(spell_id);
CREATE INDEX IF NOT EXISTS idx_spell_traditions_spell      ON spell_traditions(spell_id);
CREATE INDEX IF NOT EXISTS idx_spell_traditions_tradition  ON spell_traditions(tradition_id);

-- Spells: common filters
CREATE INDEX IF NOT EXISTS idx_spells_rank             ON spells(rank);
CREATE INDEX IF NOT EXISTS idx_spells_save_type        ON spells(save_type);
CREATE INDEX IF NOT EXISTS idx_spells_rarity           ON spells(rarity);
CREATE INDEX IF NOT EXISTS idx_spells_action_cat       ON spells(action_category);
CREATE INDEX IF NOT EXISTS idx_spells_name             ON spells(name);
CREATE INDEX IF NOT EXISTS idx_spells_source_id        ON spells(source_id);

-- Optional: case-insensitive name search/uniqueness helpers (comment out if unwanted)
-- CREATE EXTENSION IF NOT EXISTS citext;
-- ALTER TABLE spells ALTER COLUMN name TYPE citext;

-- =========================
-- Extended View (clean arrays, no NULLs)
-- =========================
CREATE OR REPLACE VIEW v_spells_extended AS
SELECT
  s.id,
  s.name,
  s.rank,
  s.spell_type,
  s.save_type,
  s.rarity,
  s.action_category,
  s.actions_min,
  s.actions_max,
  s.description,
  s.source_id,
  s.created_at,
  s.updated_at,
  ARRAY_REMOVE(
    ARRAY_AGG(DISTINCT t.name ORDER BY t.name) FILTER (WHERE t.name IS NOT NULL),
    NULL
  ) AS tradition_names,
  ARRAY_REMOVE(
    ARRAY_AGG(DISTINCT t.id ORDER BY t.id) FILTER (WHERE t.id IS NOT NULL),
    NULL
  ) AS tradition_ids,
  ARRAY_REMOVE(
    ARRAY_AGG(DISTINCT tr.name ORDER BY tr.name) FILTER (WHERE tr.name IS NOT NULL),
    NULL
  ) AS trait_names,
  ARRAY_REMOVE(
    ARRAY_AGG(DISTINCT tr.id ORDER BY tr.id) FILTER (WHERE tr.id IS NOT NULL),
    NULL
  ) AS trait_ids,
  src.book,
  src.page
FROM spells s
LEFT JOIN spell_traditions st ON s.id = st.spell_id
LEFT JOIN traditions t        ON st.tradition_id = t.id
LEFT JOIN spell_traits spt    ON s.id = spt.spell_id
LEFT JOIN traits tr           ON spt.trait_id = tr.id
LEFT JOIN sources src         ON s.source_id = src.id
GROUP BY
  s.id, s.name, s.rank, s.spell_type, s.save_type, s.rarity,
  s.action_category, s.actions_min, s.actions_max, s.description,
  s.source_id, s.created_at, s.updated_at, src.book, src.page;

-- =========================
-- Filtering helpers (replace parameterized views)
-- =========================

-- TRAITS: spells that have ALL requested trait NAMES
CREATE OR REPLACE FUNCTION fn_spell_ids_with_all_traits(req_traits TEXT[])
RETURNS TABLE (id INT)
LANGUAGE sql
AS $$
  SELECT s.id
  FROM spells s
  JOIN spell_traits st ON s.id = st.spell_id
  JOIN traits t ON st.trait_id = t.id
  WHERE t.name = ANY(req_traits)
  GROUP BY s.id
  HAVING COUNT(DISTINCT t.name) = COALESCE(array_length(req_traits, 1), 0);
$$;

-- TRAITS: spells that have ANY of the requested trait NAMES
CREATE OR REPLACE FUNCTION fn_spell_ids_with_any_traits(req_traits TEXT[])
RETURNS TABLE (id INT)
LANGUAGE sql
AS $$
  SELECT DISTINCT s.id
  FROM spells s
  JOIN spell_traits st ON s.id = st.spell_id
  JOIN traits t ON st.trait_id = t.id
  WHERE t.name = ANY(req_traits);
$$;

-- TRADITIONS: spells that have ALL requested tradition NAMES
CREATE OR REPLACE FUNCTION fn_spell_ids_with_all_traditions(req_trads TEXT[])
RETURNS TABLE (id INT)
LANGUAGE sql
AS $$
  SELECT s.id
  FROM spells s
  JOIN spell_traditions st ON s.id = st.spell_id
  JOIN traditions td ON st.tradition_id = td.id
  WHERE td.name = ANY(req_trads)
  GROUP BY s.id
  HAVING COUNT(DISTINCT td.name) = COALESCE(array_length(req_trads, 1), 0);
$$;

-- TRADITIONS: spells that have ANY of the requested tradition NAMES
CREATE OR REPLACE FUNCTION fn_spell_ids_with_any_traditions(req_trads TEXT[])
RETURNS TABLE (id INT)
LANGUAGE sql
AS $$
  SELECT DISTINCT s.id
  FROM spells s
  JOIN spell_traditions st ON s.id = st.spell_id
  JOIN traditions td ON st.tradition_id = td.id
  WHERE td.name = ANY(req_trads);
$$;

-- =========================
-- POST-MIGRATION SETUP STEPS
-- =========================
-- After running this migration, follow these steps in Supabase:

-- 1. Import CSV files in this order:
--    - traits.csv -> traits table
--    - sources.csv -> sources table  
--    - spells.csv -> spells table
--    - spell_traits_helper.csv -> spell_traits_helper table
--    - spell_traditions_helper.csv -> spell_traditions_helper table

-- 2. Populate join tables:
--    -- Populate spell_traditions from the helper table
--    INSERT INTO spell_traditions (spell_id, tradition_id)
--    SELECT s.id, t.id
--    FROM spells s
--    JOIN spell_traditions_helper sth ON sth.spell_name = s.name
--    JOIN traditions t ON t.name = sth.tradition_name;
--
--    -- Populate spell_traits from the helper table
--    INSERT INTO spell_traits (spell_id, trait_id)
--    SELECT s.id, t.id
--    FROM spells s
--    JOIN spell_traits_helper sth ON sth.spell_name = s.name
--    JOIN traits t ON t.name = sth.trait_name;

-- 3. Clean up helper tables:
--    DROP TABLE spell_traditions_helper;
--    DROP TABLE spell_traits_helper;
