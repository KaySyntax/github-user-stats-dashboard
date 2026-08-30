import { useState, type FormEvent } from 'react'
import { UsernameInput } from './UsernameInput'

interface CompareSearchBarProps {
  onCompare: (userA: string, userB: string) => void
  loading: boolean
}

export function CompareSearchBar({ onCompare, loading }: CompareSearchBarProps) {
  const [userA, setUserA] = useState('')
  const [userB, setUserB] = useState('')

  function handleCompare(e: FormEvent) {
    e.preventDefault()
    onCompare(userA.trim(), userB.trim())
  }

  return (
    <form className="compare-search" onSubmit={handleCompare}>
      <div className="compare-inputs">
        <UsernameInput
          id="compare-user-a"
          value={userA}
          onChange={setUserA}
          placeholder="Username or display name…"
          disabled={loading}
        />
        <span className="compare-vs">vs</span>
        <UsernameInput
          id="compare-user-b"
          value={userB}
          onChange={setUserB}
          placeholder="Username or display name…"
          disabled={loading}
        />
      </div>
      <button type="submit" className="compare-btn" disabled={loading || !userA.trim() || !userB.trim()}>
        {loading ? (
          <span className="btn-loading">
            <span className="spinner" />
            Comparing…
          </span>
        ) : (
          'Compare'
        )}
      </button>
    </form>
  )
}
