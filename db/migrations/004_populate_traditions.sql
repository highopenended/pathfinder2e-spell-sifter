-- =========================
-- Populate Traditions Table
-- =========================

-- Insert the four basic traditions from Pathfinder 2e
INSERT INTO traditions (name) VALUES 
  ('Arcane'),
  ('Divine'), 
  ('Occult'),
  ('Primal')
ON CONFLICT (name) DO NOTHING;

-- Note: You can add more traditions later by running:
-- INSERT INTO traditions (name) VALUES ('Your New Tradition') ON CONFLICT (name) DO NOTHING;
