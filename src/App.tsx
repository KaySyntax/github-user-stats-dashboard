import { useCallback, useEffect, useRef, useState } from 'react'
import { CompareSearchBar } from './components/CompareSearchBar'
import { ComparisonDashboard } from './components/ComparisonDashboard'
import { Dashboard } from './components/Dashboard'
import { Footer } from './components/Footer'
import { HomePage } from './components/HomePage'
import { SearchBar } from './components/SearchBar'
import { useGitHubComparison, useGitHubStats } from './hooks/useGitHubStats'
import './App.css'

type Mode = 'single' | 'compare'

function App() {
  const [mode, setMode] = useState<Mode>('single')
  const [searchKey, setSearchKey] = useState(0)
  const { stats, loading, error, username, search, reset: resetSingle } = useGitHubStats()
  const {
    statsA,
    statsB,
    loading: comparing,
    error: compareError,
    userA,
    userB,
    compare,
    reset: resetCompare,
  } = useGitHubComparison()

  // Header auto-hide state
  const [headerVisible, setHeaderVisible] = useState(true)
  const [headerFocused, setHeaderFocused] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const activeError = mode === 'single' ? error : compareError
  const activeLoading = mode === 'single' ? loading : comparing
  const activeUser = mode === 'single' ? username : `${userA} vs ${userB}`

  const hasResults =
    mode === 'single' ? Boolean(stats) : Boolean(statsA && statsB)

  const showHome = !activeLoading && !hasResults

  // The header should auto-hide only when viewing results AND search isn't focused
  const shouldAutoHide = hasResults && !showHome

  // Show header when on home page or loading
  useEffect(() => {
    if (!shouldAutoHide) {
      setHeaderVisible(true)
    }
  }, [shouldAutoHide])

  // Auto-hide header after results load (with delay), but NOT if search is focused
  useEffect(() => {
    if (shouldAutoHide && !headerFocused) {
      hideTimeoutRef.current = setTimeout(() => {
        setHeaderVisible(false)
      }, 1500)
      return () => clearTimeout(hideTimeoutRef.current)
    }
  }, [shouldAutoHide, headerFocused])

  // Track scroll for header shadow
  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Keyboard shortcut: Ctrl+K or / to reveal header and focus search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable

      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setHeaderVisible(true)
        setTimeout(() => {
          const input = document.querySelector<HTMLInputElement>('.app-header .search-input-wrap input')
          input?.focus()
          input?.select()
        }, 50)
      } else if (e.key === '/' && !isInput) {
        e.preventDefault()
        setHeaderVisible(true)
        setTimeout(() => {
          const input = document.querySelector<HTMLInputElement>('.app-header .search-input-wrap input')
          input?.focus()
          input?.select()
        }, 50)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Track focus inside header — don't auto-hide while user is typing in search
  const handleHeaderFocusIn = useCallback(() => {
    setHeaderFocused(true)
    clearTimeout(hideTimeoutRef.current)
  }, [])

  const handleHeaderFocusOut = useCallback((e: React.FocusEvent) => {
    // Only unfocus if the new focus target is outside the header
    if (headerRef.current && !headerRef.current.contains(e.relatedTarget as Node)) {
      setHeaderFocused(false)
    }
  }, [])

  // Mouse enter trigger zone (top of viewport) to reveal header
  const handleTriggerEnter = useCallback(() => {
    if (shouldAutoHide) {
      clearTimeout(hideTimeoutRef.current)
      setHeaderVisible(true)
    }
  }, [shouldAutoHide])

  // Mouse leave header area to hide it again (only if search not focused)
  const handleHeaderLeave = useCallback(() => {
    if (shouldAutoHide && !headerFocused) {
      hideTimeoutRef.current = setTimeout(() => {
        setHeaderVisible(false)
      }, 400)
    }
  }, [shouldAutoHide, headerFocused])

  // Cancel hide when mouse re-enters header
  const handleHeaderEnter = useCallback(() => {
    clearTimeout(hideTimeoutRef.current)
  }, [])

  function goHome() {
    resetSingle()
    resetCompare()
    setSearchKey((k) => k + 1)
    setHeaderVisible(true)
    setHeaderFocused(false)
  }

  function handleModeChange(next: Mode) {
    setMode(next)
    goHome()
  }

  function handleSearch(username: string) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    search(username)
  }

  function handleCompare(userA: string, userB: string) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    compare(userA, userB)
  }

  const headerClasses = [
    'app-header',
    shouldAutoHide ? 'header-floating' : '',
    shouldAutoHide && !headerVisible ? 'header-collapsed' : '',
    scrolled ? 'header-scrolled' : '',
  ].filter(Boolean).join(' ')

  return (
    <div className="app">
      <div className="bg-glow" aria-hidden="true" />

      {/* Trigger zone: large invisible area at top that reveals header on hover */}
      {shouldAutoHide && !headerVisible && (
        <div
          className="header-trigger"
          onMouseEnter={handleTriggerEnter}
          aria-hidden="true"
        />
      )}

      <header
        ref={headerRef}
        className={headerClasses}
        onMouseEnter={handleHeaderEnter}
        onMouseLeave={handleHeaderLeave}
        onFocusCapture={handleHeaderFocusIn}
        onBlurCapture={handleHeaderFocusOut}
      >
        <div className="header-top">
          <button type="button" className="brand brand-btn" onClick={goHome} title="Back to home">
            <svg className="brand-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <div>
              <h1>GitHub Stats</h1>
              <p>Instant coding habit analytics for any public profile</p>
            </div>
          </button>
        </div>

        <div className="header-nav">
          <div className="mode-toggle" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'single'}
              className={mode === 'single' ? 'active' : ''}
              onClick={() => handleModeChange('single')}
            >
              Single User
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'compare'}
              className={mode === 'compare' ? 'active' : ''}
              onClick={() => handleModeChange('compare')}
            >
              Compare
            </button>
          </div>

          {!showHome && (
            <button type="button" className="home-btn" onClick={goHome}>
              ← Home
            </button>
          )}
        </div>

        {mode === 'single' ? (
          <SearchBar key={searchKey} onSearch={handleSearch} loading={loading} />
        ) : (
          <CompareSearchBar key={searchKey} onCompare={handleCompare} loading={comparing} />
        )}
      </header>

      <main className="app-main">
        {activeError && (
          <div className="error-banner" role="alert">
            <span>⚠️ {activeError}</span>
          </div>
        )}

        {activeLoading && (
          <div className="loading-state">
            <div className="loading-skeleton">
              <div className="skeleton-bar" />
              <div className="skeleton-bar short" />
              <div className="skeleton-bar" />
            </div>
            <p>
              Fetching data for <strong>{activeUser}</strong>…
            </p>
          </div>
        )}

        {showHome && <HomePage mode={mode} onSearch={handleSearch} onCompare={handleCompare} />}

        {mode === 'single' && !loading && stats && <Dashboard stats={stats} />}
        {mode === 'compare' && !comparing && statsA && statsB && (
          <ComparisonDashboard statsA={statsA} statsB={statsB} />
        )}
      </main>

      <Footer />
    </div>
  )
}

export default App
