import { useState, type FormEvent } from 'react'
import { UsernameInput } from './UsernameInput'

interface SearchBarProps {
  onSearch: (username: string) => void
  loading: boolean
  placeholder?: string
  initialValue?: string
  id?: string
}

export function SearchBar({
  onSearch,
  loading,
  placeholder = 'Username or display name…',
  initialValue = '',
  id = 'username-search',
}: SearchBarProps) {
  const [value, setValue] = useState(initialValue)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onSearch(value)
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <UsernameInput
        id={id}
        value={value}
        onChange={setValue}
        onSelect={onSearch}
        placeholder={placeholder}
        disabled={loading}
      />
      <button type="submit" className="search-submit" disabled={loading || !value.trim()}>
        {loading ? (
          <span className="btn-loading">
            <span className="spinner" />
            Analyzing…
          </span>
        ) : (
          'Analyze'
        )}
      </button>
    </form>
  )
}
