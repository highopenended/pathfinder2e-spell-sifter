import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import './DatabaseTest.css';

interface TestResult {
  success: string[];
  errors: string[];
  warnings: string[];
}

export const DatabaseTest: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const runDatabaseTest = async () => {
    setIsRunning(true);
    setResults(null);

    const testResults: TestResult = {
      success: [],
      errors: [],
      warnings: []
    };

    try {
      // Test 1: Basic table access
      console.log('📋 Testing Basic Table Access...');
      
      // Test spells table
      const { data: spells, error: spellsError } = await supabase
        .from('spells')
        .select('*')
        .limit(5);
      
      if (spellsError) {
        testResults.errors.push(`Spells table: ${spellsError.message}`);
      } else {
        testResults.success.push(`Spells table: ✅ Successfully fetched ${spells?.length || 0} records`);
      }

      // Test traditions table
      const { data: traditions, error: traditionsError } = await supabase
        .from('traditions')
        .select('*')
        .limit(5);
      
      if (traditionsError) {
        testResults.errors.push(`Traditions table: ${traditionsError.message}`);
      } else {
        testResults.success.push(`Traditions table: ✅ Successfully fetched ${traditions?.length || 0} records`);
      }

      // Test traits table
      const { data: traits, error: traitsError } = await supabase
        .from('traits')
        .select('*')
        .limit(5);
      
      if (traitsError) {
        testResults.errors.push(`Traits table: ${traitsError.message}`);
      } else {
        testResults.success.push(`Traits table: ✅ Successfully fetched ${traits?.length || 0} records`);
      }

      // Test sources table
      const { data: sources, error: sourcesError } = await supabase
        .from('sources')
        .select('*')
        .limit(5);
      
      if (sourcesError) {
        testResults.errors.push(`Sources table: ${sourcesError.message}`);
      } else {
        testResults.success.push(`Sources table: ✅ Successfully fetched ${sources?.length || 0} records`);
      }

      // Test 2: Join table access
      console.log('🔗 Testing Join Table Access...');
      
      // Test spell_traditions join table
      const { data: spellTraditions, error: stError } = await supabase
        .from('spell_traditions')
        .select('*')
        .limit(5);
      
      if (stError) {
        testResults.errors.push(`Spell_traditions table: ${stError.message}`);
      } else {
        testResults.success.push(`Spell_traditions table: ✅ Successfully fetched ${spellTraditions?.length || 0} records`);
      }

      // Test spell_traits join table
      const { data: spellTraits, error: sptError } = await supabase
        .from('spell_traits')
        .select('*')
        .limit(5);
      
      if (sptError) {
        testResults.errors.push(`Spell_traits table: ${sptError.message}`);
      } else {
        testResults.success.push(`Spell_traits table: ✅ Successfully fetched ${spellTraits?.length || 0} records`);
      }

      // Test 3: Extended view access
      console.log('👁️ Testing Extended View Access...');
      
      const { data: extendedSpells, error: viewError } = await supabase
        .from('v_spells_extended')
        .select('*')
        .limit(5);
      
      if (viewError) {
        testResults.errors.push(`Extended view: ${viewError.message}`);
      } else {
        testResults.success.push(`Extended view: ✅ Successfully fetched ${extendedSpells?.length || 0} records`);
      }

      // Test 4: Complex queries with joins
      console.log('🔄 Testing Complex Join Queries...');
      
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
        testResults.errors.push(`Spells with traditions join: ${swtError.message}`);
      } else {
        testResults.success.push(`Spells with traditions join: ✅ Successfully fetched ${spellsWithTraditions?.length || 0} records`);
      }

      // Test 5: Filtering and search
      console.log('🔍 Testing Filtering and Search...');
      
      // Test rank filtering
      const { data: rankFiltered, error: rankError } = await supabase
        .from('spells')
        .select('*')
        .eq('rank', 1)
        .limit(3);
      
      if (rankError) {
        testResults.errors.push(`Rank filtering: ${rankError.message}`);
      } else {
        testResults.success.push(`Rank filtering: ✅ Successfully fetched ${rankFiltered?.length || 0} rank 1 spells`);
      }

      // Test 6: Count queries
      console.log('📊 Testing Count Queries...');
      
      const { count: spellCount, error: countError } = await supabase
        .from('spells')
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        testResults.errors.push(`Count query: ${countError.message}`);
      } else {
        testResults.success.push(`Count query: ✅ Total spells in database: ${spellCount || 0}`);
      }

      // Test 7: Helper functions (if accessible)
      console.log('⚙️ Testing Helper Functions...');
      
      try {
        const { data: functionTest, error: funcError } = await supabase
          .rpc('fn_spell_ids_with_any_traits', { req_traits: ['Fire'] });
        
        if (funcError) {
          testResults.warnings.push(`Helper functions: ⚠️ ${funcError.message} (this might be expected for anon role)`);
        } else {
          testResults.success.push(`Helper functions: ✅ Successfully called fn_spell_ids_with_any_traits`);
        }
      } catch (error: any) {
        testResults.warnings.push(`Helper functions: ⚠️ ${error.message} (this might be expected for anon role)`);
      }

    } catch (error: any) {
      testResults.errors.push(`General error: ${error.message}`);
    }

    setResults(testResults);
    setIsRunning(false);
  };

  const getStatusIcon = () => {
    if (!results) return '🔍';
    if (results.errors.length === 0) return '✅';
    if (results.errors.length <= 2) return '⚠️';
    return '❌';
  };

  const getStatusText = () => {
    if (!results) return 'Ready to test';
    if (results.errors.length === 0) return 'All tests passed!';
    if (results.errors.length <= 2) return 'Most tests passed';
    return 'Multiple test failures';
  };

  return (
    <div className="database-test">
      <div className="test-header">
        <h3>Database Permissions Test</h3>
        <div className="test-status">
          <span className="status-icon">{getStatusIcon()}</span>
          <span className="status-text">{getStatusText()}</span>
        </div>
      </div>

      <button 
        onClick={runDatabaseTest} 
        disabled={isRunning}
        className="test-button"
      >
        {isRunning ? 'Running Tests...' : 'Run Database Test'}
      </button>

      {results && (
        <div className="test-results">
          <div className="results-summary">
            <div className="summary-item success">
              <span className="count">{results.success.length}</span>
              <span className="label">Successes</span>
            </div>
            <div className="summary-item warning">
              <span className="count">{results.warnings.length}</span>
              <span className="label">Warnings</span>
            </div>
            <div className="summary-item error">
              <span className="count">{results.errors.length}</span>
              <span className="label">Errors</span>
            </div>
          </div>

          <button 
            onClick={() => setShowDetails(!showDetails)}
            className="toggle-details"
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>

          {showDetails && (
            <div className="results-details">
              {results.success.length > 0 && (
                <div className="result-section success">
                  <h4>✅ Successes</h4>
                  <ul>
                    {results.success.map((msg, index) => (
                      <li key={index}>{msg}</li>
                    ))}
                  </ul>
                </div>
              )}

              {results.warnings.length > 0 && (
                <div className="result-section warning">
                  <h4>⚠️ Warnings</h4>
                  <ul>
                    {results.warnings.map((msg, index) => (
                      <li key={index}>{msg}</li>
                    ))}
                  </ul>
                </div>
              )}

              {results.errors.length > 0 && (
                <div className="result-section error">
                  <h4>❌ Errors</h4>
                  <ul>
                    {results.errors.map((msg, index) => (
                      <li key={index}>{msg}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="test-info">
        <p>This test verifies access to all database tables, join tables, views, and functions to ensure your RLS policies are working correctly.</p>
        <p>Check the browser console for detailed logging during the test.</p>
      </div>
    </div>
  );
};
