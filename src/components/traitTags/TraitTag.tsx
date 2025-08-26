import React, { useRef, useState } from 'react'
import './TraitTag.css'
import TraitTooltip from './TraitTooltip'

interface TraitTagProps {
  name: string
  state: 'include' | 'exclude' | 'unselected'
  onClick?: () => void
  description?: string
  className?: string
}

const TraitTag: React.FC<TraitTagProps> = ({ 
  name, 
  state, 
  onClick, 
  description,
  className = ''
}) => {
  const [showTooltip, setShowTooltip] = useState(false)
  const tagRef = useRef<HTMLElement>(null)
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleMouseEnter = () => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current)
    }
    tooltipTimeoutRef.current = setTimeout(() => setShowTooltip(true), 500)
  }

  const handleMouseLeave = () => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current)
    }
    setShowTooltip(false)
  }

  const getTagClass = () => {
    if (state === 'include') return 'interactive-base interactive-include tag-base'
    if (state === 'exclude') return 'interactive-base interactive-exclude tag-base'
    return 'interactive-base tag-base'
  }

  const TagElement = onClick ? 'button' : 'span'
  const tagProps = onClick ? { onClick } : {}

  return (
    <>
      <TagElement
        ref={tagRef as any}
        className={`${getTagClass()} ${className}`.trim()}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...tagProps}
      >
        {name}
      </TagElement>
      {description && (
        <TraitTooltip
          content={description}
          isVisible={showTooltip}
          targetRef={tagRef}
        />
      )}
    </>
  )
}

export default TraitTag
