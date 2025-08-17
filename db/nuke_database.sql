-- =========================
-- NUKE DATABASE - DROP EVERYTHING
-- =========================
-- Run this in Supabase SQL Editor to completely reset your database

-- Drop all tables (in dependency order)
DROP TABLE IF EXISTS spell_traits_helper CASCADE;
DROP TABLE IF EXISTS spell_traditions_helper CASCADE;
DROP TABLE IF EXISTS spell_traits CASCADE;
DROP TABLE IF EXISTS spell_traditions CASCADE;
DROP TABLE IF EXISTS spells CASCADE;
DROP TABLE IF EXISTS traits CASCADE;
DROP TABLE IF EXISTS traditions CASCADE;
DROP TABLE IF EXISTS sources CASCADE;

-- Drop all functions
DROP FUNCTION IF EXISTS set_updated_at() CASCADE;

-- Drop all enums
DROP TYPE IF EXISTS save_type_enum CASCADE;
DROP TYPE IF EXISTS spell_type_enum CASCADE;
DROP TYPE IF EXISTS rarity_type_enum CASCADE;
DROP TYPE IF EXISTS action_category_enum CASCADE;

-- Drop any views that might exist
DROP VIEW IF EXISTS spell_details CASCADE;
DROP VIEW IF EXISTS spell_tradition_lookup CASCADE;
DROP VIEW IF EXISTS spell_trait_lookup CASCADE;

-- Reset sequences (if any exist)
-- Note: These will be recreated when you run migrations again
-- DROP SEQUENCE IF EXISTS sources_id_seq CASCADE;
-- DROP SEQUENCE IF EXISTS traditions_id_seq CASCADE;
-- DROP SEQUENCE IF EXISTS traits_id_seq CASCADE;
-- DROP SEQUENCE IF EXISTS spells_id_seq CASCADE;

-- Verify everything is gone
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public';

SELECT 
    typname,
    typtype
FROM pg_type 
WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
AND typtype = 'e';
