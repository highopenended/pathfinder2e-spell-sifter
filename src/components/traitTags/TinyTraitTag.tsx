import React, { useRef, useState } from 'react'
import './TinyTraitTag.css'
import TraitTooltip from './TraitTooltip'

interface TinyTraitTagProps {
  name: string
  state?: 'include' | 'exclude' | 'unselected' | 'readonly'
  description?: string
  className?: string
}

const TinyTraitTag: React.FC<TinyTraitTagProps> = ({ 
  name, 
  state = 'unselected',
  description,
  className = ''
}) => {
  const [showTooltip, setShowTooltip] = useState(false)
  const tagRef = useRef<HTMLSpanElement>(null)

  const getTagClass = () => {
    if (state === 'include') return 'tiny-tag-base tiny-tag-include'
    if (state === 'exclude') return 'tiny-tag-base tiny-tag-exclude'
    if (state === 'readonly') return 'tiny-tag-base tiny-tag-readonly'
    return 'tiny-tag-base'
  }

  return (
    <>
      <span
        ref={tagRef}
        className={`${getTagClass()} ${className}`.trim()}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {name}
      </span>
      {description && description.trim() !== '' && (
        <TraitTooltip
          content={description}
          isVisible={showTooltip}
          targetRef={tagRef}
        />
      )}
    </>
  )
}

export default TinyTraitTag
