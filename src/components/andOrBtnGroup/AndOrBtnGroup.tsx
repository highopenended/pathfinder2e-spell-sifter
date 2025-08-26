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
    <div className="logic-segmented-control">
      <button 
        className={`logic-segment ${logicMode === 'AND' ? 'active' : ''}`}
        onClick={() => onLogicChange('AND')}
      >
        AND
      </button>
      <button 
        className={`logic-segment ${logicMode === 'OR' ? 'active' : ''}`}
        onClick={() => onLogicChange('OR')}
      >
        OR
      </button>
    </div>
  )
}

export default AndOrBtnGroup
