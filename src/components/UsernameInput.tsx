import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { useUserSuggestions } from '../hooks/useUserSuggestions'

interface UsernameInputProps {
  id: string
  value: string
  onChange: (value: string) => void
  onSelect?: (username: string) => void
  placeholder?: string
  disabled?: boolean
}

export function UsernameInput({
  id,
  value,
  onChange,
  onSelect,
  placeholder = 'Username or display name…',
  disabled = false,
}: UsernameInputProps) {
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState(-1)
  const wrapRef = useRef<HTMLDivElement>(null)
  const { suggestions, loading: suggesting } = useUserSuggestions(value)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  function select(username: string) {
    onChange(username)
    onSelect?.(username)
    setOpen(false)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!open || suggestions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlight((h) => Math.min(h + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlight((h) => Math.max(h - 1, 0))
    } else if (e.key === 'Enter' && highlight >= 0 && suggestions[highlight]) {
      e.preventDefault()
      select(suggestions[highlight].login)
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  const showDropdown = open && value.trim().length >= 2 && (suggestions.length > 0 || suggesting)

  return (
    <div className="search-input-wrap" ref={wrapRef}>
      <svg className="search-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C8.01 14 6 11.99 6 9.5S8.01 5 10.5 5 15 7.01 15 9.5 12.99 14 10.5 14z"
          fill="currentColor"
        />
      </svg>
      <input
        id={id}
        type="text"
        role="combobox"
        aria-expanded={showDropdown}
        aria-autocomplete="list"
        aria-controls={`${id}-listbox`}
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          setOpen(true)
          setHighlight(-1)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        spellCheck={false}
        autoComplete="off"
      />

      {showDropdown && (
        <ul id={`${id}-listbox`} className="suggestions-dropdown" role="listbox">
          {suggesting && suggestions.length === 0 && (
            <li className="suggestion-item muted">Searching…</li>
          )}
          {suggestions.map((user, i) => (
            <li key={user.login} role="option" aria-selected={i === highlight}>
              <button
                type="button"
                className={`suggestion-item${i === highlight ? ' highlighted' : ''}`}
                onMouseDown={() => select(user.login)}
              >
                <img src={user.avatar_url} alt="" width={32} height={32} />
                <span className="suggestion-text">
                  {user.name && <span className="suggestion-name">{user.name}</span>}
                  <span className="suggestion-login">@{user.login}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
