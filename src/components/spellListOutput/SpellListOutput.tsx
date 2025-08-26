import React from 'react'
import './SpellListOutput.css'
import type { SpellWithJoins } from '../../types/spell'
import SpellCard from '../spellCards/SpellCard'

interface SpellListOutputProps {
  spells: SpellWithJoins[]
  loading: boolean
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

const SpellListOutput: React.FC<SpellListOutputProps> = ({ 
  spells, 
  loading, 
  currentPage, 
  totalPages, 
  onPageChange 
}) => {
  if (loading) {
    return (
      <div className="spell-list-output">
        <div className="loading">Searching...</div>
      </div>
    )
  }

  if (spells.length === 0) {
    return (
      <div className="spell-list-output">
        <div className="no-results">No spells found matching your criteria.</div>
      </div>
    )
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      onPageChange(newPage)
    }
  }

  return (
    <div className="spell-list-output">
      <div className="results-header">
        <h3>Results ({spells.length} spells)</h3>
        {totalPages > 1 && (
          <div className="pagination-info">
            Page {currentPage} of {totalPages}
          </div>
        )}
      </div>
      
      <div className="spell-list">
        {spells.map(spell => (
          <SpellCard key={spell.id} spell={spell} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pagination-controls">
          <button 
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="pagination-btn interactive-base interactive-secondary"
          >
            Previous
          </button>
          
          <div className="page-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`pagination-btn interactive-base interactive-secondary ${pageNum === currentPage ? 'active' : ''}`}
              >
                {pageNum}
              </button>
            ))}
          </div>
          
          <button 
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="pagination-btn interactive-base interactive-secondary"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default SpellListOutput
