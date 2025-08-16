-- Make sure the relevant tables have RLS ON
ALTER TABLE spells                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_spells            ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_spell_traits      ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_spell_traditions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites         ENABLE ROW LEVEL SECURITY;

-- Grant basic permissions to anon and authenticated roles
GRANT SELECT ON spells TO anon, authenticated;
GRANT SELECT ON traits TO anon, authenticated;
GRANT SELECT ON traditions TO anon, authenticated;
GRANT SELECT ON sources TO anon, authenticated;
GRANT SELECT ON spell_traits TO anon, authenticated;
GRANT SELECT ON spell_traditions TO anon, authenticated;

-- ================
-- Canonical spells
-- ================
-- Everyone (anon/authenticated) may READ canonical spells
DROP POLICY IF EXISTS spells_read_all ON spells;
CREATE POLICY spells_read_all
  ON spells FOR SELECT
  USING (true);

-- Prevent client-side writes to canonical (server/service role can still write)
REVOKE INSERT, UPDATE, DELETE ON spells FROM anon, authenticated;

-- ===================
-- User-owned: spells
-- ===================
-- Only the owner can see their own custom spells
DROP POLICY IF EXISTS user_spells_select_own ON user_spells;
CREATE POLICY user_spells_select_own
  ON user_spells FOR SELECT
  USING (owner_id = auth.uid());

-- Only the owner can insert (owner_id defaults to auth.uid(); WITH CHECK enforces it)
DROP POLICY IF EXISTS user_spells_insert_self ON user_spells;
CREATE POLICY user_spells_insert_self
  ON user_spells FOR INSERT
  WITH CHECK (owner_id = auth.uid());

-- Only the owner can update their rows
DROP POLICY IF EXISTS user_spells_update_own ON user_spells;
CREATE POLICY user_spells_update_own
  ON user_spells FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Only the owner can delete their rows
DROP POLICY IF EXISTS user_spells_delete_own ON user_spells;
CREATE POLICY user_spells_delete_own
  ON user_spells FOR DELETE
  USING (owner_id = auth.uid());

-- ====================================
-- User-owned: spell ↔ trait join table
-- ====================================
DROP POLICY IF EXISTS ust_select_own ON user_spell_traits;
CREATE POLICY ust_select_own
  ON user_spell_traits FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_spells us
      WHERE us.id = user_spell_traits.user_spell_id
        AND us.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS ust_insert_own ON user_spell_traits;
CREATE POLICY ust_insert_own
  ON user_spell_traits FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_spells us
      WHERE us.id = user_spell_traits.user_spell_id
        AND us.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS ust_update_own ON user_spell_traits;
CREATE POLICY ust_update_own
  ON user_spell_traits FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_spells us
      WHERE us.id = user_spell_traits.user_spell_id
        AND us.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_spells us
      WHERE us.id = user_spell_traits.user_spell_id
        AND us.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS ust_delete_own ON user_spell_traits;
CREATE POLICY ust_delete_own
  ON user_spell_traits FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_spells us
      WHERE us.id = user_spell_traits.user_spell_id
        AND us.owner_id = auth.uid()
    )
  );

-- ==========================================
-- User-owned: spell ↔ tradition join table
-- ==========================================
DROP POLICY IF EXISTS ustn_select_own ON user_spell_traditions;
CREATE POLICY ustn_select_own
  ON user_spell_traditions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_spells us
      WHERE us.id = user_spell_traditions.user_spell_id
        AND us.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS ustn_insert_own ON user_spell_traditions;
CREATE POLICY ustn_insert_own
  ON user_spell_traditions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_spells us
      WHERE us.id = user_spell_traditions.user_spell_id
        AND us.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS ustn_update_own ON user_spell_traditions;
CREATE POLICY ustn_update_own
  ON user_spell_traditions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_spells us
      WHERE us.id = user_spell_traditions.user_spell_id
        AND us.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_spells us
      WHERE us.id = user_spell_traditions.user_spell_id
        AND us.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS ustn_delete_own ON user_spell_traditions;
CREATE POLICY ustn_delete_own
  ON user_spell_traditions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_spells us
      WHERE us.id = user_spell_traditions.user_spell_id
        AND us.owner_id = auth.uid()
    )
  );

-- ===================
-- User-owned: favorites
-- ===================
DROP POLICY IF EXISTS fav_select_own ON user_favorites;
CREATE POLICY fav_select_own
  ON user_favorites FOR SELECT
  USING (owner_id = auth.uid());

DROP POLICY IF EXISTS fav_insert_self ON user_favorites;
CREATE POLICY fav_insert_self
  ON user_favorites FOR INSERT
  WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS fav_update_own ON user_favorites;
CREATE POLICY fav_update_own
  ON user_favorites FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS fav_delete_own ON user_favorites;
CREATE POLICY fav_delete_own
  ON user_favorites FOR DELETE
  USING (owner_id = auth.uid());
