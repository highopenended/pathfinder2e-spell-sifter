-- =========================
-- Indexes (query-tuning)
-- =========================

-- Helpful indexes for filtering/search
CREATE INDEX IF NOT EXISTS idx_spell_traits_trait  ON spell_traits(trait_id);
CREATE INDEX IF NOT EXISTS idx_spell_traits_spell  ON spell_traits(spell_id);

-- Helpful indexes for filtering/search
CREATE INDEX IF NOT EXISTS idx_spell_traditions_spell     ON spell_traditions(spell_id);
CREATE INDEX IF NOT EXISTS idx_spell_traditions_tradition ON spell_traditions(tradition_id);

-- =========================
-- Views for Complex Filtering
-- =========================

-- Main spell view with all related data pre-joined
CREATE OR REPLACE VIEW v_spells_extended AS
SELECT 
  s.*,
  -- Aggregate traditions as arrays for easy filtering
  ARRAY_AGG(DISTINCT t.name ORDER BY t.name) AS tradition_names,
  ARRAY_AGG(DISTINCT t.id ORDER BY t.id) AS tradition_ids,
  -- Aggregate traits as arrays for easy filtering  
  ARRAY_AGG(DISTINCT tr.name ORDER BY tr.name) AS trait_names,
  ARRAY_AGG(DISTINCT tr.id ORDER BY tr.id) AS trait_ids,
  -- Source info
  src.book,
  src.page
FROM spells s
LEFT JOIN spell_traditions st ON s.id = st.spell_id
LEFT JOIN traditions t ON st.tradition_id = t.id
LEFT JOIN spell_traits spt ON s.id = spt.spell_id
LEFT JOIN traits tr ON spt.trait_id = tr.id
LEFT JOIN sources src ON s.source_id = src.id
GROUP BY s.id, src.book, src.page;

-- View for tradition-based filtering (AND logic)
CREATE OR REPLACE VIEW v_spells_tradition_and AS
SELECT DISTINCT s.id
FROM spells s
JOIN spell_traditions st ON s.id = st.spell_id
JOIN traditions t ON st.tradition_id = t.id
WHERE t.name = ANY($1) -- Array of required traditions
GROUP BY s.id
HAVING COUNT(DISTINCT t.name) = array_length($1, 1);

-- View for tradition-based filtering (OR logic)  
CREATE OR REPLACE VIEW v_spells_tradition_or AS
SELECT DISTINCT s.id
FROM spells s
JOIN spell_traditions st ON s.id = st.spell_id
JOIN traditions t ON st.tradition_id = t.id
WHERE t.name = ANY($1); -- Array of traditions (any match)

-- View for trait-based filtering (AND logic)
CREATE OR REPLACE VIEW v_spells_trait_and AS
SELECT DISTINCT s.id
FROM spells s
JOIN spell_traits st ON s.id = st.spell_id
JOIN traits t ON st.trait_id = t.id
WHERE t.name = ANY($1) -- Array of required traits
GROUP BY s.id
HAVING COUNT(DISTINCT t.name) = array_length($1, 1);

-- View for trait-based filtering (OR logic)
CREATE OR REPLACE VIEW v_spells_trait_or AS
SELECT DISTINCT s.id
FROM spells s
JOIN spell_traits st ON s.id = st.spell_id
JOIN traits t ON st.trait_id = t.id
WHERE t.name = ANY($1); -- Array of traits (any match)
