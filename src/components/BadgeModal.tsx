import { useEffect } from 'react'

interface BadgeData {
  id: string
  label: string
  description: string
  emoji: string
  color: string
}

interface BadgeModalProps {
  badge: BadgeData | null
  onClose: () => void
}

export function BadgeModal({ badge, onClose }: BadgeModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  if (!badge) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="badge-modal-content" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="badge-modal-icon">
          {badge.emoji}
        </div>
        <h3 className="badge-modal-title" style={{ color: badge.color }}>
          {badge.label}
        </h3>
        <p className="badge-modal-desc">
          {badge.description}
        </p>
      </div>
    </div>
  )
}
