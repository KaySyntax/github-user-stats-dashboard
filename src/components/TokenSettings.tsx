import { useEffect, useState, type FormEvent } from 'react'
import { fetchRateLimit } from '../api/github'
import { useToken } from '../context/TokenContext'

export function TokenSettings() {
  const { token, source, hasToken, saveToken, clearToken } = useToken()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [rateLimit, setRateLimit] = useState<{ remaining: number; limit: number } | null>(null)

  useEffect(() => {
    if (!hasToken) {
      setRateLimit(null)
      return
    }
    fetchRateLimit().then((info) => {
      if (info) setRateLimit({ remaining: info.remaining, limit: info.limit })
    })
  }, [hasToken, token])

  function handleSave(e: FormEvent) {
    e.preventDefault()
    if (input.trim()) {
      saveToken(input)
      setInput('')
      setOpen(false)
    }
  }

  return (
    <div className="token-settings">
      <button
        type="button"
        className="token-toggle"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
          <path d="M12.5 1.5a5 5 0 0 0-5 5v3a5 5 0 0 0-2.5 4.3V17a2.5 2.5 0 0 0 2.5 2.5h10a2.5 2.5 0 0 0 2.5-2.5v-3.2a5 5 0 0 0-2.5-4.3V6.5a5 5 0 0 0-5-5zm-3 5a3 3 0 0 1 6 0v3H9.5V6.5zm-1 8.8a3 3 0 0 1 3-3h5a3 3 0 0 1 3 3V17a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-1.7z" />
        </svg>
        {hasToken ? (
          <span className="token-status active">
            PAT active
            {rateLimit && ` · ${rateLimit.remaining}/${rateLimit.limit}`}
          </span>
        ) : (
          <span className="token-status">Add PAT (60 req/hr)</span>
        )}
      </button>

      {open && (
        <div className="token-panel">
          {source === 'env' ? (
            <p className="token-note">
              Token loaded from <code>.env</code> — 5,000 req/hr limit active.
            </p>
          ) : (
            <form onSubmit={handleSave}>
              <label htmlFor="pat-input">GitHub Personal Access Token</label>
              <input
                id="pat-input"
                type="password"
                placeholder="ghp_xxxxxxxxxxxx"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                autoComplete="off"
                spellCheck={false}
              />
              <p className="token-hint">
                No scopes needed for public data. Stored locally in your browser.
                {' '}
                <a href="https://github.com/settings/tokens" target="_blank" rel="noreferrer">
                  Create token →
                </a>
              </p>
              <div className="token-actions">
                <button type="submit" disabled={!input.trim()}>
                  Save
                </button>
                {hasToken && source === 'local' && (
                  <button type="button" className="btn-ghost" onClick={clearToken}>
                    Remove
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
