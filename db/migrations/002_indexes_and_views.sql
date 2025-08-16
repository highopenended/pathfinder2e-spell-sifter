-- =========================
-- Indexes (query-tuning)
-- =========================

-- Canon (as you had)
CREATE INDEX IF NOT EXISTS idx_spells_rank          ON spells(rank);
CREATE INDEX IF NOT EXISTS idx_spells_save_type     ON spells(save_type);
CREATE INDEX IF NOT EXISTS idx_spells_rarity        ON spells(rarity);
CREATE INDEX IF NOT EXISTS idx_spells_action_ctgry  ON spells(action_category);
CREATE INDEX IF NOT EXISTS idx_spells_name          ON spells(name);
CREATE INDEX IF NOT EXISTS idx_spells_source_id     ON spells(source_id);

-- Customs (per-user; RLS adds owner_id = auth.uid() so lead with owner_id)
CREATE INDEX IF NOT EXISTS idx_user_spells_owner            ON user_spells(owner_id);
CREATE INDEX IF NOT EXISTS idx_user_spells_owner_rank       ON user_spells(owner_id, rank);
CREATE INDEX IF NOT EXISTS idx_user_spells_owner_type       ON user_spells(owner_id, spell_type);
CREATE INDEX IF NOT EXISTS idx_user_spells_owner_rarity     ON user_spells(owner_id, rarity);
CREATE INDEX IF NOT EXISTS idx_user_spells_owner_name       ON user_spells(owner_id, name);

-- Join tables for customs (mirror canon)
CREATE INDEX IF NOT EXISTS idx_user_spell_traits_spell      ON user_spell_traits(user_spell_id);
CREATE INDEX IF NOT EXISTS idx_user_spell_traits_trait      ON user_spell_traits(trait_id);
CREATE INDEX IF NOT EXISTS idx_user_spell_traditions_spell  ON user_spell_traditions(user_spell_id);
CREATE INDEX IF NOT EXISTS idx_user_spell_traditions_trad   ON user_spell_traditions(tradition_id);

-- Favorites (fast per-user lookups)
CREATE INDEX IF NOT EXISTS idx_user_favorites_owner         ON user_favorites(owner_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_spell         ON user_favorites(spell_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_spell    ON user_favorites(user_spell_id);


-- =========================
-- Views (canon-only, optional for admin/debug)
-- =========================

CREATE OR REPLACE VIEW v_spell_search AS
SELECT
  s.id,
  s.name,
  s.rank,
  s.spell_type,
  s.rarity,
  s.save_type
FROM spells s;

CREATE OR REPLACE VIEW v_spell_flat AS
SELECT
  s.id,
  s.name,
  s.rank,
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


-- =========================
-- Views (unified: canon + customs, per-user favorites)
-- =========================

-- Unified lightweight list for grids/search (use this in the app)
CREATE OR REPLACE VIEW v_spell_search_effective AS
SELECT
  s.id,
  s.name,
  s.rank,
  s.spell_type,
  s.rarity,
  s.save_type,
  false AS is_custom,
  EXISTS (
    SELECT 1
    FROM user_favorites uf
    WHERE uf.owner_id = auth.uid()
      AND uf.spell_id = s.id
  ) AS is_favorite
FROM spells s

UNION ALL

SELECT
  us.id,
  us.name,
  us.rank,
  us.spell_type,
  us.rarity,
  us.save_type,
  true AS is_custom,
  EXISTS (
    SELECT 1
    FROM user_favorites uf
    WHERE uf.owner_id = auth.uid()
      AND uf.user_spell_id = us.id
  ) AS is_favorite
FROM user_spells us;


-- Unified flat view with arrays (traits/traditions) + per-user favorites (use this in the app)
CREATE OR REPLACE VIEW v_spell_flat_effective AS
SELECT
  s.id,
  s.name,
  s.rank,
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
  false AS is_custom,
  EXISTS (
    SELECT 1
    FROM user_favorites uf
    WHERE uf.owner_id = auth.uid()
      AND uf.spell_id = s.id
  ) AS is_favorite,
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
FROM spells s

UNION ALL

SELECT
  us.id,
  us.name,
  us.rank,
  us.spell_type,
  us.rarity,
  us.save_type,
  us.action_category,
  us.actions_min,
  us.actions_max,
  us.actions_raw,
  us.summary,
  us.range,
  us.area,
  us.duration,
  us.school,
  us.heighten_text,
  us.link,
  NULL::INT AS source_id,
  true AS is_custom,
  EXISTS (
    SELECT 1
    FROM user_favorites uf
    WHERE uf.owner_id = auth.uid()
      AND uf.user_spell_id = us.id
  ) AS is_favorite,
  ARRAY(
    SELECT t.name
    FROM user_spell_traits ust
    JOIN traits t ON t.id = ust.trait_id
    WHERE ust.user_spell_id = us.id
    ORDER BY t.name
  ) AS traits,
  ARRAY(
    SELECT tr.name
    FROM user_spell_traditions ust
    JOIN traditions tr ON tr.id = ust.tradition_id
    WHERE ust.user_spell_id = us.id
    ORDER BY tr.name
  ) AS traditions
FROM user_spells us;
