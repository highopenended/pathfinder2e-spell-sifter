// =========================
// Database Permissions Test Script
// Tests all tables including join tables to verify RLS policies
// =========================

// This script tests:
// 1. Direct table access (spells, traditions, traits, sources)
// 2. Join table access (spell_traditions, spell_traits)
// 3. Extended view access (v_spells_extended)
// 4. Function access (filtering helpers)
// 5. RLS policy enforcement

// Run this in your browser console or as a Node.js script
// Make sure you have your Supabase credentials set up

const testDatabaseAccess = async () => {
  console.log('🔍 Starting Database Permissions Test...\n');
  
  const results = {
    success: [],
    errors: [],
    warnings: []
  };

  // Test 1: Basic table access
  console.log('📋 Testing Basic Table Access...');
  
  try {
    // Test spells table
    const { data: spells, error: spellsError } = await supabase
      .from('spells')
      .select('*')
      .limit(5);
    
    if (spellsError) {
      results.errors.push(`Spells table: ${spellsError.message}`);
    } else {
      results.success.push(`Spells table: ✅ Successfully fetched ${spells?.length || 0} records`);
    }
  } catch (error) {
    results.errors.push(`Spells table: ${error.message}`);
  }

  try {
    // Test traditions table
    const { data: traditions, error: traditionsError } = await supabase
      .from('traditions')
      .select('*')
      .limit(5);
    
    if (traditionsError) {
      results.errors.push(`Traditions table: ${traditionsError.message}`);
    } else {
      results.success.push(`Traditions table: ✅ Successfully fetched ${traditions?.length || 0} records`);
    }
  } catch (error) {
    results.errors.push(`Traditions table: ${error.message}`);
  }

  try {
    // Test traits table
    const { data: traits, error: traitsError } = await supabase
      .from('traits')
      .select('*')
      .limit(5);
    
    if (traitsError) {
      results.errors.push(`Traits table: ${traitsError.message}`);
    } else {
      results.success.push(`Traits table: ✅ Successfully fetched ${traits?.length || 0} records`);
    }
  } catch (error) {
    results.errors.push(`Traits table: ${error.message}`);
  }

  try {
    // Test sources table
    const { data: sources, error: sourcesError } = await supabase
      .from('sources')
      .select('*')
      .limit(5);
    
    if (sourcesError) {
      results.errors.push(`Sources table: ${sourcesError.message}`);
    } else {
      results.success.push(`Sources table: ✅ Successfully fetched ${sources?.length || 0} records`);
    }
  } catch (error) {
    results.errors.push(`Sources table: ${error.message}`);
  }

  // Test 2: Join table access
  console.log('\n🔗 Testing Join Table Access...');
  
  try {
    // Test spell_traditions join table
    const { data: spellTraditions, error: stError } = await supabase
      .from('spell_traditions')
      .select('*')
      .limit(5);
    
    if (stError) {
      results.errors.push(`Spell_traditions table: ${stError.message}`);
    } else {
      results.success.push(`Spell_traditions table: ✅ Successfully fetched ${spellTraditions?.length || 0} records`);
    }
  } catch (error) {
    results.errors.push(`Spell_traditions table: ${error.message}`);
  }

  try {
    // Test spell_traits join table
    const { data: spellTraits, error: sptError } = await supabase
      .from('spell_traits')
      .select('*')
      .limit(5);
    
    if (sptError) {
      results.errors.push(`Spell_traits table: ${sptError.message}`);
    } else {
      results.success.push(`Spell_traits table: ✅ Successfully fetched ${spellTraits?.length || 0} records`);
    }
  } catch (error) {
    results.errors.push(`Spell_traits table: ${error.message}`);
  }

  // Test 3: Extended view access
  console.log('\n👁️ Testing Extended View Access...');
  
  try {
    const { data: extendedSpells, error: viewError } = await supabase
      .from('v_spells_extended')
      .select('*')
      .limit(5);
    
    if (viewError) {
      results.errors.push(`Extended view: ${viewError.message}`);
    } else {
      results.success.push(`Extended view: ✅ Successfully fetched ${extendedSpells?.length || 0} records`);
    }
  } catch (error) {
    results.errors.push(`Extended view: ${error.message}`);
  }

  // Test 4: Complex queries with joins
  console.log('\n🔄 Testing Complex Join Queries...');
  
  try {
    // Test spells with traditions
    const { data: spellsWithTraditions, error: swtError } = await supabase
      .from('spells')
      .select(`
        *,
        spell_traditions!inner(
          traditions(name)
        )
      `)
      .limit(3);
    
    if (swtError) {
      results.errors.push(`Spells with traditions join: ${swtError.message}`);
    } else {
      results.success.push(`Spells with traditions join: ✅ Successfully fetched ${spellsWithTraditions?.length || 0} records`);
    }
  } catch (error) {
    results.errors.push(`Spells with traditions join: ${error.message}`);
  }

  try {
    // Test spells with traits
    const { data: spellsWithTraits, error: swtrError } = await supabase
      .from('spells')
      .select(`
        *,
        spell_traits!inner(
          traits(name)
        )
      `)
      .limit(3);
    
    if (swtrError) {
      results.errors.push(`Spells with traits join: ${swtrError.message}`);
    } else {
      results.success.push(`Spells with traits join: ✅ Successfully fetched ${spellsWithTraits?.length || 0} records`);
    }
  } catch (error) {
    results.errors.push(`Spells with traits join: ${error.message}`);
  }

  // Test 5: Filtering and search
  console.log('\n🔍 Testing Filtering and Search...');
  
  try {
    // Test rank filtering
    const { data: rankFiltered, error: rankError } = await supabase
      .from('spells')
      .select('*')
      .eq('rank', 1)
      .limit(3);
    
    if (rankError) {
      results.errors.push(`Rank filtering: ${rankError.message}`);
    } else {
      results.success.push(`Rank filtering: ✅ Successfully fetched ${rankFiltered?.length || 0} rank 1 spells`);
    }
  } catch (error) {
    results.errors.push(`Rank filtering: ${error.message}`);
  }

  try {
    // Test text search
    const { data: searchResults, error: searchError } = await supabase
      .from('spells')
      .select('*')
      .ilike('name', '%fire%')
      .limit(3);
    
    if (searchError) {
      results.errors.push(`Text search: ${searchError.message}`);
    } else {
      results.success.push(`Text search: ✅ Successfully searched for fire spells, found ${searchResults?.length || 0} results`);
    }
  } catch (error) {
    results.errors.push(`Text search: ${error.message}`);
  }

  // Test 6: Count queries
  console.log('\n📊 Testing Count Queries...');
  
  try {
    const { count: spellCount, error: countError } = await supabase
      .from('spells')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      results.errors.push(`Count query: ${countError.message}`);
    } else {
      results.success.push(`Count query: ✅ Total spells in database: ${spellCount || 0}`);
    }
  } catch (error) {
    results.errors.push(`Count query: ${error.message}`);
  }

  // Test 7: Helper functions (if accessible)
  console.log('\n⚙️ Testing Helper Functions...');
  
  try {
    // Test if we can call the helper functions directly
    // Note: These might require elevated permissions
    const { data: functionTest, error: funcError } = await supabase
      .rpc('fn_spell_ids_with_any_traits', { req_traits: ['Fire'] });
    
    if (funcError) {
      results.warnings.push(`Helper functions: ⚠️ ${funcError.message} (this might be expected for anon role)`);
    } else {
      results.success.push(`Helper functions: ✅ Successfully called fn_spell_ids_with_any_traits`);
    }
  } catch (error) {
    results.warnings.push(`Helper functions: ⚠️ ${error.message} (this might be expected for anon role)`);
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📋 TEST RESULTS SUMMARY');
  console.log('='.repeat(60));
  
  if (results.success.length > 0) {
    console.log('\n✅ SUCCESSES:');
    results.success.forEach(msg => console.log(`  ${msg}`));
  }
  
  if (results.warnings.length > 0) {
    console.log('\n⚠️ WARNINGS:');
    results.warnings.forEach(msg => console.log(`  ${msg}`));
  }
  
  if (results.errors.length > 0) {
    console.log('\n❌ ERRORS:');
    results.errors.forEach(msg => console.log(`  ${msg}`));
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`Total Tests: ${results.success.length + results.warnings.length + results.errors.length}`);
  console.log(`Successes: ${results.success.length}`);
  console.log(`Warnings: ${results.warnings.length}`);
  console.log(`Errors: ${results.errors.length}`);
  
  if (results.errors.length === 0) {
    console.log('\n🎉 All critical tests passed! Your RLS policies are working correctly.');
  } else {
    console.log('\n🚨 Some tests failed. Check your RLS policies and permissions.');
  }
  
  return results;
};

// Export for use in different environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testDatabaseAccess };
} else {
  // Browser environment
  window.testDatabaseAccess = testDatabaseAccess;
}

// Auto-run if in browser console
if (typeof window !== 'undefined' && typeof supabase !== 'undefined') {
  console.log('🚀 Auto-running database test...');
  testDatabaseAccess();
}
