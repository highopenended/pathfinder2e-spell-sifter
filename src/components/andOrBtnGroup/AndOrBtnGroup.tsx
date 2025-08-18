import React from 'react'
import './AndOrBtnGroup.css'

interface AndOrBtnGroupProps {
  logicMode: 'AND' | 'OR'
  onLogicChange: (mode: 'AND' | 'OR') => void
}

const AndOrBtnGroup: React.FC<AndOrBtnGroupProps> = ({
  logicMode,
  onLogicChange
}) => {
  return (
    <div className="logic-toggle">
      <button 
        className={`btn-base ${logicMode === 'AND' ? 'btn-primary' : ''}`}
        onClick={() => onLogicChange('AND')}
      >
        AND
      </button>
      <button 
        className={`btn-base ${logicMode === 'OR' ? 'btn-primary' : ''}`}
        onClick={() => onLogicChange('OR')}
      >
        OR
      </button>
    </div>
  )
}

export default AndOrBtnGroup
