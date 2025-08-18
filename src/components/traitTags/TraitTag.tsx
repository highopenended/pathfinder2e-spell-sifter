import React from 'react'
import './TraitTag.css'

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
  const getTagClass = () => {
    if (state === 'include') return 'tag-base tag-include'
    if (state === 'exclude') return 'tag-base tag-exclude'
    return 'tag-base'
  }

  const TagElement = onClick ? 'button' : 'span'
  const tagProps = onClick ? { onClick } : {}

  return (
    <TagElement
      className={`${getTagClass()} ${className}`.trim()}
      title={description}
      {...tagProps}
    >
      {name}
    </TagElement>
  )
}

export default TraitTag
