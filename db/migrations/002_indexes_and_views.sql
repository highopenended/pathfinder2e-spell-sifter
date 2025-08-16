-- Common filter indexes for the UI
CREATE INDEX IF NOT EXISTS idx_spells_level        ON spells(level);
CREATE INDEX IF NOT EXISTS idx_spells_save_type    ON spells(save_type);
CREATE INDEX IF NOT EXISTS idx_spells_rarity       ON spells(rarity);
CREATE INDEX IF NOT EXISTS idx_spells_action_ctgry ON spells(action_category);

-- Optional: quick lookup by name
CREATE INDEX IF NOT EXISTS idx_spells_name         ON spells(name);

-- Optional: source-based filters
CREATE INDEX IF NOT EXISTS idx_spells_source_id    ON spells(source_id);

-- ----------
-- Views
-- ----------
-- Simple list for tables/grids
CREATE OR REPLACE VIEW v_spell_search AS
SELECT
  s.id,
  s.name,
  s.level,
  s.spell_type,
  s.rarity,
  s.save_type
FROM spells s;

-- Flattened view: one row per spell with arrays of traits/traditions
CREATE OR REPLACE VIEW v_spell_flat AS
SELECT
  s.id,
  s.name,
  s.level,
  s.spell_type,
  s.rarity,
  s.save_type,
  s.action_category,
  s.actions_min,
  s.actions_max,
  s.actions_raw,
  s.summary,
  s.range,
  s.area,
  s.duration,
  s.school,
  s.heighten_text,
  s.link,
  s.source_id,
  ARRAY(
    SELECT t.name
    FROM spell_traits st
    JOIN traits t ON t.id = st.trait_id
    WHERE st.spell_id = s.id
    ORDER BY t.name
  ) AS traits,
  ARRAY(
    SELECT tr.name
    FROM spell_traditions st
    JOIN traditions tr ON tr.id = st.tradition_id
    WHERE st.spell_id = s.id
    ORDER BY tr.name
  ) AS traditions
FROM spells s;