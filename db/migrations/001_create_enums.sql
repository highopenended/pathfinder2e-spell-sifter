-- =========================
-- Create Enums/Types
-- =========================
DO $$ BEGIN
    CREATE TYPE save_type_enum AS ENUM ('Fortitude', 'Reflex', 'Will', 'None');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE spell_type_enum AS ENUM ('Cantrip', 'Spell', 'Focus', 'Ritual');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE rarity_type_enum AS ENUM ('Common', 'Uncommon', 'Rare', 'Unique');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE action_category_enum AS ENUM ('None', 'Free', 'Reaction', 'Activity');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;