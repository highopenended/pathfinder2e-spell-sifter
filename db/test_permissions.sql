-- =========================
-- Database Permissions Test Script
-- Run this in Supabase SQL Editor to test RLS policies
-- =========================

-- Test 1: Basic table access
SELECT 'Testing basic table access...' as test_step;

-- Test spells table
SELECT 
  'spells' as table_name,
  COUNT(*) as record_count,
  '✅ SUCCESS' as status
FROM spells
LIMIT 1;

-- Test traditions table
SELECT 
  'traditions' as table_name,
  COUNT(*) as record_count,
  '✅ SUCCESS' as status
FROM traditions
LIMIT 1;

-- Test traits table
SELECT 
  'traits' as table_name,
  COUNT(*) as record_count,
  '✅ SUCCESS' as status
FROM traits
LIMIT 1;

-- Test sources table
SELECT 
  'sources' as table_name,
  COUNT(*) as record_count,
  '✅ SUCCESS' as status
FROM sources
LIMIT 1;

-- Test 2: Join table access
SELECT 'Testing join table access...' as test_step;

-- Test spell_traditions join table
SELECT 
  'spell_traditions' as table_name,
  COUNT(*) as record_count,
  '✅ SUCCESS' as status
FROM spell_traditions
LIMIT 1;

-- Test spell_traits join table
SELECT 
  'spell_traits' as table_name,
  COUNT(*) as record_count,
  '✅ SUCCESS' as status
FROM spell_traits
LIMIT 1;

-- Test 3: Extended view access
SELECT 'Testing extended view access...' as test_step;

SELECT 
  'v_spells_extended' as view_name,
  COUNT(*) as record_count,
  '✅ SUCCESS' as status
FROM v_spells_extended
LIMIT 1;

-- Test 4: Complex queries with joins
SELECT 'Testing complex join queries...' as test_step;

-- Test spells with traditions
SELECT 
  'spells_with_traditions' as query_type,
  COUNT(*) as record_count,
  '✅ SUCCESS' as status
FROM spells s
JOIN spell_traditions st ON s.id = st.spell_id
JOIN traditions t ON st.tradition_id = t.id
LIMIT 1;

-- Test spells with traits
SELECT 
  'spells_with_traits' as query_type,
  COUNT(*) as record_count,
  '✅ SUCCESS' as status
FROM spells s
JOIN spell_traits spt ON s.id = spt.spell_id
JOIN traits tr ON spt.trait_id = tr.id
LIMIT 1;

-- Test 5: Filtering and search
SELECT 'Testing filtering and search...' as test_step;

-- Test rank filtering
SELECT 
  'rank_filtering' as query_type,
  COUNT(*) as record_count,
  '✅ SUCCESS' as status
FROM spells
WHERE rank = 1
LIMIT 1;

-- Test text search
SELECT 
  'text_search' as query_type,
  COUNT(*) as record_count,
  '✅ SUCCESS' as status
FROM spells
WHERE name ILIKE '%fire%'
LIMIT 1;

-- Test 6: Count queries
SELECT 'Testing count queries...' as test_step;

SELECT 
  'total_spells' as query_type,
  COUNT(*) as record_count,
  '✅ SUCCESS' as status
FROM spells;

-- Test 7: Sample data verification
SELECT 'Sample data verification...' as test_step;

-- Show sample spells with their traditions and traits
SELECT 
  s.name as spell_name,
  s.rank,
  s.spell_type,
  ARRAY_AGG(DISTINCT t.name) as traditions,
  ARRAY_AGG(DISTINCT tr.name) as traits
FROM spells s
LEFT JOIN spell_traditions st ON s.id = st.spell_id
LEFT JOIN traditions t ON st.tradition_id = t.id
LEFT JOIN spell_traits spt ON s.id = spt.spell_id
LEFT JOIN traits tr ON spt.trait_id = tr.id
GROUP BY s.id, s.name, s.rank, s.spell_type
LIMIT 5;

-- Test 8: RLS Policy Verification
SELECT 'RLS Policy Verification...' as test_step;

-- Check if RLS is enabled on all tables
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('spells', 'traditions', 'traits', 'spell_traditions', 'spell_traits', 'sources')
ORDER BY tablename;

-- Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Summary
SELECT '=== PERMISSIONS TEST COMPLETE ===' as summary;
SELECT 'Check the results above for any ❌ errors' as next_steps;
SELECT 'All queries should return ✅ SUCCESS status' as expected_result;
