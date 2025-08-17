-- =========================
-- Populate Traditions Table
-- =========================

INSERT INTO traditions (name)
VALUES
  ('Arcane'),
  ('Divine'),
  ('Occult'),
  ('Primal')
ON CONFLICT (name) DO NOTHING;
