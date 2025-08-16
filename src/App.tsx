import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import './App.css'

function App() {
  const [connectionStatus, setConnectionStatus] = useState<string>('Testing connection...')
  const [spellCount, setSpellCount] = useState<number | null>(null)
  const [debugInfo, setDebugInfo] = useState<string>('')

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    try {
      // Debug: Check environment variables
      const url = import.meta.env.VITE_SUPABASE_URL
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY
      
      setDebugInfo(`URL: ${url ? '✅ Set' : '❌ Missing'}\nKey: ${key ? '✅ Set' : '❌ Missing'}`)
      
      if (!url || !key) {
        setConnectionStatus('❌ Environment variables missing')
        return
      }

      // Test basic connection with a simpler query
      const { data, error } = await supabase
        .from('spells')
        .select('id')
        .limit(1)
      
      if (error) {
        setConnectionStatus(`❌ Connection failed: ${error.message}`)
        console.error('Supabase error:', error)
        return
      }

      setConnectionStatus('✅ Connected to Supabase!')
      
      // Get actual spell count
      const { count } = await supabase
        .from('spells')
        .select('*', { count: 'exact', head: true })
      
      setSpellCount(count)
      
    } catch (err) {
      setConnectionStatus(`❌ Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
      console.error('Full error:', err)
    }
  }

  return (
    <div className="App">
      <h1>Spell Sifter - Supabase Test</h1>
      
      <div className="connection-test">
        <h2>Database Connection Status</h2>
        <p>{connectionStatus}</p>
        
        {spellCount !== null && (
          <p>📚 Total spells in database: <strong>{spellCount}</strong></p>
        )}
        
        <button onClick={testConnection} className="test-button">
          Test Connection Again
        </button>
      </div>

      <div className="debug-info">
        <h3>Debug Info:</h3>
        <pre>{debugInfo}</pre>
      </div>

      <div className="instructions">
        <h3>Next Steps:</h3>
        <ol>
          <li>Make sure you have a <code>.env</code> file with your Supabase credentials</li>
          <li>Run your database migrations in Supabase dashboard</li>
          <li>Import your CSV data</li>
        </ol>
      </div>
    </div>
  )
}

export default App
