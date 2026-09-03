import { useEffect, useRef, useState } from 'react'
import * as htmlToImage from 'html-to-image'
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

/**
 * Fetches any URL and returns it as a base64 data URL.
 * This is critical for html-to-image: external images cause CORS canvas tainting.
 */
async function toBase64(url: string): Promise<string> {
  try {
    const res = await fetch(url)
    const blob = await res.blob()
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch {
    return url // fallback to original URL
  }
}

export function ShareModal({ stats, aiTitle, isOpen, onClose }: ShareModalProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [exporting, setExporting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [avatarB64, setAvatarB64] = useState('')
  const [iconCache, setIconCache] = useState<Record<string, string>>({})
  const [imagesReady, setImagesReady] = useState(false)
  
  const { user, totalStars, languages } = stats
  const topLanguages = languages.slice(0, 3)

  // Pre-convert ALL external images to base64 on mount
  useEffect(() => {
    let cancelled = false

    async function preloadAll() {
      // 1. Avatar
      const avatarPromise = toBase64(user.avatar_url)
      
      // 2. Devicon logos
      const iconEntries: [string, string][] = []
      for (const lang of topLanguages) {
        const url = getDevIconUrl(lang.name)
        if (url) iconEntries.push([lang.name, url])
      }
      const iconPromises = iconEntries.map(async ([name, url]) => {
        const b64 = await toBase64(url)
        return [name, b64] as [string, string]
      })

      const [avatar, ...icons] = await Promise.all([avatarPromise, ...iconPromises])
      
      if (!cancelled) {
        setAvatarB64(avatar)
        const cache: Record<string, string> = {}
        for (const [name, b64] of icons) {
          cache[name] = b64
        }
        setIconCache(cache)
        setImagesReady(true)
      }
    }

    preloadAll()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  /** Generate a PNG blob of the card */
  const generatePngBlob = async (): Promise<Blob> => {
    if (!cardRef.current) throw new Error('Card ref missing')
    await new Promise((r) => setTimeout(r, 100))
    const dataUrl = await htmlToImage.toPng(cardRef.current, {
      pixelRatio: 2,
      backgroundColor: '#0d1117',
    })
    const res = await fetch(dataUrl)
    return res.blob()
  }

  /** Copy to clipboard — returns true on success */
  const copyToClipboard = async (blob: Blob): Promise<boolean> => {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ])
      return true
    } catch {
      return false
    }
  }

  const handleDownload = async () => {
    if (!cardRef.current) return
    setExporting(true)
    try {
      const blob = await generatePngBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${user.login}-github-wrapped.png`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Download failed', err)
    } finally {
      setExporting(false)
    }
  }

  /**
   * Airbuds-style share:
   * 1. Generate the image
   * 2. Copy it to clipboard FIRST  ← this is the trick
   * 3. Then open the OS share sheet
   * When Snapchat/Instagram opens, it detects clipboard content
   * and shows "Pasted from [your site]"
   */
  const handleShare = async () => {
    if (!cardRef.current) return
    setExporting(true)
    try {
      const blob = await generatePngBlob()
      
      // Step 1: Copy to clipboard FIRST (the Airbuds trick)
      await copyToClipboard(blob)

      // Step 2: Then open the native share sheet
      const file = new File([blob], `${user.login}-github-wrapped.png`, { 
        type: 'image/png',
        lastModified: Date.now(),
      })
      
      if (navigator.canShare && !navigator.canShare({ files: [file] })) {
        // Browser doesn't support file sharing, image is already on clipboard
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
        return
      }

      await navigator.share({ files: [file] })
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        console.error('Share failed', err)
        // Image is already on clipboard from step 1, so show copied state
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
      }
    } finally {
      setExporting(false)
    }
  }

  const handleCopyImage = async () => {
    if (!cardRef.current) return
    setExporting(true)
    try {
      const blob = await generatePngBlob()
      const ok = await copyToClipboard(blob)
      if (ok) {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
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
            <img src={avatarB64 || user.avatar_url} alt="" className="share-card-avatar-large" />
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

            {/* Top Languages — using pre-loaded base64 icons */}
            <div className="share-card-tile languages-tile">
              <span className="tile-label">Top Languages</span>
              <div className="languages-logo-row" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                {topLanguages.map((lang) => {
                  const b64Icon = iconCache[lang.name]
                  const fallbackUrl = getDevIconUrl(lang.name)
                  return b64Icon || fallbackUrl ? (
                    <img 
                      key={lang.name} 
                      src={b64Icon || fallbackUrl!} 
                      alt={lang.name} 
                      title={lang.name} 
                      width={32} 
                      height={32} 
                      className="language-icon-large" 
                    />
                  ) : (
                    <span key={lang.name} style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{lang.name}</span>
                  )
                })}
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
            disabled={exporting || !imagesReady}
          >
            <Download size={18} />
            {exporting ? '...' : 'Save'}
          </button>
          <button 
            className="btn-secondary"
            onClick={handleCopyImage}
            disabled={exporting || !imagesReady}
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
          {typeof navigator.share === 'function' && (
            <button 
              className="btn-primary" 
              onClick={handleShare}
              disabled={exporting || !imagesReady}
            >
              <Share2 size={18} />
              Share
            </button>
          )}
        </div>

        <p className="share-tip">
          Image is auto-copied to clipboard when sharing. Paste directly in any app!
        </p>
        
        <button className="btn-close" onClick={onClose} disabled={exporting}>
          <X size={24} />
        </button>
      </div>
    </div>
  )
}
