import { useEffect, useRef, useState } from 'react'
import * as htmlToImage from 'html-to-image'
import download from 'downloadjs'
import { Download, Share2, X, Copy, Check } from 'lucide-react'
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
  const [copied, setCopied] = useState(false)
  const [avatarDataUrl, setAvatarDataUrl] = useState<string>('')
  
  const { user, totalStars, languages } = stats

  useEffect(() => {
    // Pre-load avatar as base64 to bypass html-to-image CORS issues
    async function loadAvatar() {
      try {
        const res = await fetch(user.avatar_url)
        const blob = await res.blob()
        const reader = new FileReader()
        reader.onloadend = () => setAvatarDataUrl(reader.result as string)
        reader.readAsDataURL(blob)
      } catch {
        setAvatarDataUrl(user.avatar_url)
      }
    }
    loadAvatar()
  }, [user.avatar_url])

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

  /** Generate a JPEG blob of the card (JPEG is more compatible with social apps) */
  const generateCardBlob = async (): Promise<Blob> => {
    if (!cardRef.current) throw new Error('Card ref missing')
    await new Promise((resolve) => setTimeout(resolve, 200))
    const dataUrl = await htmlToImage.toJpeg(cardRef.current, {
      pixelRatio: 2,
      backgroundColor: '#0d1117',
      quality: 0.92,
    })
    const res = await fetch(dataUrl)
    return res.blob()
  }

  const handleDownload = async () => {
    if (!cardRef.current) return
    setExporting(true)
    try {
      const blob = await generateCardBlob()
      const dataUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `${user.login}-github-wrapped.jpg`
      a.click()
      URL.revokeObjectURL(dataUrl)
    } catch (err) {
      console.error('Download failed', err)
    } finally {
      setExporting(false)
    }
  }

  const handleShare = async () => {
    if (!cardRef.current) return
    setExporting(true)
    try {
      const blob = await generateCardBlob()
      const file = new File([blob], `${user.login}-github-wrapped.jpg`, { 
        type: 'image/jpeg',
        lastModified: Date.now(),
      })
      
      // Check if sharing files is supported at all
      if (navigator.canShare && !navigator.canShare({ files: [file] })) {
        // Fallback: download the image instead
        download(URL.createObjectURL(blob), `${user.login}-github-wrapped.jpg`)
        return
      }

      // Share with ONLY the file — no text, no title, no url.
      // Snapchat, Instagram, and other picky apps reject mixed payloads.
      await navigator.share({ files: [file] })
    } catch (err: any) {
      // AbortError means user dismissed the share sheet — not a real error
      if (err?.name !== 'AbortError') {
        console.error('Share failed, falling back to download', err)
        try {
          const blob = await generateCardBlob()
          download(URL.createObjectURL(blob), `${user.login}-github-wrapped.jpg`)
        } catch { /* silent */ }
      }
    } finally {
      setExporting(false)
    }
  }

  const handleCopyImage = async () => {
    if (!cardRef.current) return
    setExporting(true)
    try {
      // Use PNG for clipboard (clipboard API requires PNG)
      const dataUrl = await htmlToImage.toPng(cardRef.current, {
        pixelRatio: 2,
        backgroundColor: '#0d1117',
      })
      const res = await fetch(dataUrl)
      const blob = await res.blob()
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ])
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Copy failed', err)
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
            <img src={avatarDataUrl || user.avatar_url} alt="" className="share-card-avatar-large" />
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
            onClick={handleDownload}
            disabled={exporting}
          >
            <Download size={18} />
            {exporting ? '...' : 'Save'}
          </button>
          <button 
            className="btn-secondary"
            onClick={handleCopyImage}
            disabled={exporting}
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
          {typeof navigator.share === 'function' && (
            <button 
              className="btn-primary" 
              onClick={handleShare}
              disabled={exporting}
            >
              <Share2 size={18} />
              Share
            </button>
          )}
        </div>

        <p className="share-tip">
          Snapchat not working? Use <strong>Copy</strong>, then paste directly into your Snap.
        </p>
        
        <button className="btn-close" onClick={onClose} disabled={exporting}>
          <X size={24} />
        </button>
      </div>
    </div>
  )
}
