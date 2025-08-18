import React from 'react'
import './TinyTraitTag.css'

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
  const getTagClass = () => {
    if (state === 'include') return 'tiny-tag-base tiny-tag-include'
    if (state === 'exclude') return 'tiny-tag-base tiny-tag-exclude'
    if (state === 'readonly') return 'tiny-tag-base tiny-tag-readonly'
    return 'tiny-tag-base'
  }

  return (
    <span
      className={`${getTagClass()} ${className}`.trim()}
      title={description}
    >
      {name}
    </span>
  )
}

export default TinyTraitTag
