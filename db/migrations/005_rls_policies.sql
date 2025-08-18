-- =========================
-- Row Level Security Policies - Clean Slate
-- =========================

-- First, drop all existing policies to start fresh
DROP POLICY IF EXISTS "Allow public read access to spells" ON spells;
DROP POLICY IF EXISTS "Allow public read access to traditions" ON traditions;
DROP POLICY IF EXISTS "Allow public read access to traits" ON traits;
DROP POLICY IF EXISTS "Allow public read access to spell_traditions" ON spell_traditions;
DROP POLICY IF EXISTS "Allow public read access to spell_traits" ON spell_traits;
DROP POLICY IF EXISTS "Allow public read access to sources" ON sources;
DROP POLICY IF EXISTS "Allow anon read access to sources" ON sources;
DROP POLICY IF EXISTS "Allow anon read access to traits" ON traits;
DROP POLICY IF EXISTS "Allow anon read access to traditions" ON traditions;
DROP POLICY IF EXISTS "Allow anon read access to spells" ON spells;
DROP POLICY IF EXISTS "Allow anon read access to spell_traditions" ON spell_traditions;
DROP POLICY IF EXISTS "Allow anon read access to spell_traits" ON spell_traits;

-- Enable RLS on all tables
ALTER TABLE spells ENABLE ROW LEVEL SECURITY;
ALTER TABLE traditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE traits ENABLE ROW LEVEL SECURITY;
ALTER TABLE spell_traditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE spell_traits ENABLE ROW LEVEL SECURITY;
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;

-- Grant basic database permissions to anon and public roles
-- This allows the roles to access the tables (required for RLS to work)
GRANT SELECT ON spells TO anon;
GRANT SELECT ON spells TO public;
GRANT SELECT ON traditions TO anon;
GRANT SELECT ON traditions TO public;
GRANT SELECT ON traits TO anon;
GRANT SELECT ON traits TO public;
GRANT SELECT ON spell_traditions TO anon;
GRANT SELECT ON spell_traditions TO public;
GRANT SELECT ON spell_traits TO anon;
GRANT SELECT ON spell_traits TO public;
GRANT SELECT ON sources TO anon;
GRANT SELECT ON sources TO public;

-- Grant schema usage permissions
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO public;

-- Create fresh policies for both anon and public roles
-- This ensures the frontend (anon role) can access all data

-- Spells table - allow read access to both anon and public roles
CREATE POLICY "Allow anon read access to spells" ON spells
    FOR SELECT TO anon USING (true);

CREATE POLICY "Allow public read access to spells" ON spells
    FOR SELECT TO public USING (true);

-- Traditions table - allow read access to both anon and public roles
CREATE POLICY "Allow anon read access to traditions" ON traditions
    FOR SELECT TO anon USING (true);

CREATE POLICY "Allow public read access to traditions" ON traditions
    FOR SELECT TO public USING (true);

-- Traits table - allow read access to both anon and public roles
CREATE POLICY "Allow anon read access to traits" ON traits
    FOR SELECT TO anon USING (true);

CREATE POLICY "Allow public read access to traits" ON traits
    FOR SELECT TO public USING (true);

-- Spell traditions junction table - allow read access to both roles
CREATE POLICY "Allow anon read access to spell_traditions" ON spell_traditions
    FOR SELECT TO anon USING (true);

CREATE POLICY "Allow public read access to spell_traditions" ON spell_traditions
    FOR SELECT TO public USING (true);

-- Spell traits junction table - allow read access to both roles
CREATE POLICY "Allow anon read access to spell_traits" ON spell_traits
    FOR SELECT TO anon USING (true);

CREATE POLICY "Allow public read access to spell_traits" ON spell_traits
    FOR SELECT TO public USING (true);

-- Sources table - allow read access to both roles
CREATE POLICY "Allow anon read access to sources" ON sources
    FOR SELECT TO anon USING (true);

CREATE POLICY "Allow public read access to sources" ON sources
    FOR SELECT TO public USING (true);

-- Note: These policies allow both anon and public roles to READ the data
-- The anon role is what your frontend uses, so it needs explicit permission
-- If you need to restrict access later, you can modify these policies
-- or add additional policies for specific user roles

-- Grant permissions for views and functions
GRANT SELECT ON v_spells_extended TO anon;
GRANT SELECT ON v_spells_extended TO public;

-- Grant execute permissions for helper functions
GRANT EXECUTE ON FUNCTION fn_spell_ids_with_all_traits(TEXT[]) TO anon;
GRANT EXECUTE ON FUNCTION fn_spell_ids_with_any_traits(TEXT[]) TO anon;
GRANT EXECUTE ON FUNCTION fn_spell_ids_with_all_traditions(TEXT[]) TO anon;
GRANT EXECUTE ON FUNCTION fn_spell_ids_with_any_traditions(TEXT[]) TO anon;

GRANT EXECUTE ON FUNCTION fn_spell_ids_with_all_traits(TEXT[]) TO public;
GRANT EXECUTE ON FUNCTION fn_spell_ids_with_any_traits(TEXT[]) TO public;
GRANT EXECUTE ON FUNCTION fn_spell_ids_with_all_traditions(TEXT[]) TO public;
GRANT EXECUTE ON FUNCTION fn_spell_ids_with_any_traditions(TEXT[]) TO public;
