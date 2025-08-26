import React, { useEffect, useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import './TraitTooltip.css'

interface TraitTooltipProps {
  content: string
  isVisible: boolean
  targetRef: React.RefObject<HTMLElement | HTMLButtonElement | HTMLSpanElement | null>
}

interface TooltipPosition {
  top: number
  left: number
  placement: 'top' | 'bottom'
}

const TraitTooltip: React.FC<TraitTooltipProps> = ({ content, isVisible, targetRef }) => {
  const [position, setPosition] = useState<TooltipPosition>({ top: 0, left: 0, placement: 'top' })
  const tooltipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isVisible && targetRef.current && tooltipRef.current) {
      const rect = targetRef.current.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      
      // Get actual tooltip dimensions after it's rendered
      const tooltipRect = tooltipRef.current.getBoundingClientRect()
      const tooltipWidth = tooltipRect.width
      const tooltipHeight = tooltipRect.height
      
      // Calculate horizontal position with clamping
      let left = rect.left + rect.width / 2
      if (left + tooltipWidth / 2 > viewportWidth) {
        left = viewportWidth - tooltipWidth / 2 - 10
      } else if (left - tooltipWidth / 2 < 0) {
        left = tooltipWidth / 2 + 10
      }
      
      // Default to top placement, only flip if insufficient space above
      const spaceAbove = rect.top
      const minSpaceNeeded = tooltipHeight + 10
      
      const placement = spaceAbove >= minSpaceNeeded ? 'top' : 'bottom'
      
      let top: number
      if (placement === 'top') {
        top = rect.top - tooltipHeight - 10
      } else {
        top = rect.bottom + 10
        // Ensure bottom placement doesn't go below viewport
        if (top + tooltipHeight > viewportHeight - 10) {
          top = viewportHeight - tooltipHeight - 10
        }
      }
      
      setPosition({ top, left, placement })
    }
  }, [isVisible, targetRef])

  if (!isVisible) return null

  return createPortal(
    <div 
      ref={tooltipRef}
      className={`trait-tooltip trait-tooltip--${position.placement}`}
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        transform: 'translateX(-50%)',
        pointerEvents: 'none'
      }}
    >
      <div className="trait-tooltip__content">
        {content}
      </div>
    </div>,
    document.body
  )
}

export default TraitTooltip
