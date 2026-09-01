import { useEffect, useRef, useState } from 'react'
import * as htmlToImage from 'html-to-image'
import download from 'downloadjs'
import { Download, Share2, X } from 'lucide-react'
import type { DashboardStats } from '../types/github'
import { getDevIconUrl } from '../utils/devicons'
import {
  calculateLongestStreak,
  calculateCodingEra,
  getMostPopularRepo,
} from '../utils/highlights'

interface ShareModalProps {
  stats: DashboardStats
  aiTitle?: string
  isOpen: boolean
  onClose: () => void
}

export function ShareModal({ stats, aiTitle, isOpen, onClose }: ShareModalProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [exporting, setExporting] = useState(false)
  
  const { user, totalStars, languages } = stats

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      window.addEventListener('keydown', handleEsc)
    }
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  if (!isOpen) return null

  // Compute highlights
  const longestStreak = calculateLongestStreak(stats.heatmap)
  const codingEra = calculateCodingEra(stats.events)
  const mostPopularRepo = getMostPopularRepo(stats)
  const topLanguages = languages.slice(0, 3)

  const handleExport = async (action: 'download' | 'share') => {
    if (!cardRef.current) return
    
    setExporting(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 200))
      
      const dataUrl = await htmlToImage.toPng(cardRef.current, {
        pixelRatio: 3,
        backgroundColor: '#0d1117',
      })
      
      if (action === 'share' && navigator.share) {
        const res = await fetch(dataUrl)
        const blob = await res.blob()
        const file = new File([blob], `${user.login}-github-wrapped.png`, { type: 'image/png' })
        
        await navigator.share({
          title: `${user.login}'s GitHub Wrapped`,
          text: `Check out my GitHub stats!`,
          files: [file]
        })
      } else {
        download(dataUrl, `${user.login}-github-wrapped.png`)
      }
    } catch (err) {
      console.error('Failed to export card', err)
      if (action === 'share') {
        try {
          const dataUrl = await htmlToImage.toPng(cardRef.current!, { pixelRatio: 3, backgroundColor: '#0d1117' })
          download(dataUrl, `${user.login}-github-wrapped.png`)
        } catch { /* silent fallback */ }
      }
    } finally {
      setExporting(false)
    }
  }

  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric'
  })

  const title = aiTitle || 'The Developer'

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="share-modal-container" onClick={(e) => e.stopPropagation()}>
        
        {/* The "Wrapped" Card — Airbuds.fm style */}
        <div className="share-card-preview" ref={cardRef}>
          
          <div className="share-card-top-accent"></div>

          {/* Header: Large Avatar + Name */}
          <div className="share-card-header">
            <img src={user.avatar_url} alt="" className="share-card-avatar-large" crossOrigin="anonymous" />
            <div className="share-card-user-info">
              <h2>{user.name || user.login}</h2>
              <p>@{user.login}</p>
            </div>
            <div className="share-card-badge-title">
              {title}
            </div>
          </div>

          <div className="share-card-content">
            {/* Top Stat: Most Popular Repo */}
            <div className="share-card-tile highlight-main">
              <span className="tile-label">Top Repository</span>
              <span className="tile-value-large">{mostPopularRepo}</span>
            </div>

            {/* Core Stats Row */}
            <div className="share-stats-tiles">
              <div className="share-card-tile">
                <span className="tile-value">{totalStars.toLocaleString()}</span>
                <span className="tile-label">Total Stars</span>
              </div>
              <div className="share-card-tile">
                <span className="tile-value">{user.public_repos}</span>
                <span className="tile-label">Repositories</span>
              </div>
            </div>

            {/* Top Languages */}
            <div className="share-card-tile languages-tile">
              <span className="tile-label">Top Languages</span>
              <div className="languages-logo-row" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                {topLanguages.map((lang) => (
                  getDevIconUrl(lang.name) ? (
                    <img key={lang.name} src={getDevIconUrl(lang.name)!} alt={lang.name} title={lang.name} width={32} height={32} className="language-icon-large" />
                  ) : (
                    <span key={lang.name} style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{lang.name}</span>
                  )
                ))}
              </div>
            </div>

            {/* Activity Highlights */}
            <div className="share-stats-tiles">
              <div className="share-card-tile">
                <span className="tile-value">{longestStreak}</span>
                <span className="tile-label">Day Streak</span>
              </div>
              <div className="share-card-tile">
                <span className="tile-value">{codingEra.split(' ')[0]}</span>
                <span className="tile-label">Vibe</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="share-footer">
            <div className="share-footer-brand">
              <span className="brand-dot"></span>
              git.stats
            </div>
            <div className="share-footer-date">{currentDate}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="share-actions">
          <button 
            className="btn-secondary" 
            onClick={() => handleExport('download')}
            disabled={exporting}
          >
            <Download size={18} />
            {exporting ? 'Saving...' : 'Save'}
          </button>
          <button 
            className="btn-primary" 
            onClick={() => handleExport('share')}
            disabled={exporting}
          >
            <Share2 size={18} />
            Share
          </button>
        </div>
        
        <button className="btn-close" onClick={onClose} disabled={exporting}>
          <X size={24} />
        </button>
      </div>
    </div>
  )
}
