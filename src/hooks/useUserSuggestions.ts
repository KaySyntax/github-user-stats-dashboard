import { useEffect, useState } from 'react'
import { searchUsers, type GitHubSearchUser } from '../api/github'

export function useUserSuggestions(query: string) {
  const [suggestions, setSuggestions] = useState<GitHubSearchUser[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < 2) {
      setSuggestions([])
      return
    }

    const controller = new AbortController()
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const results = await searchUsers(trimmed)
        if (!controller.signal.aborted) setSuggestions(results)
      } catch {
        if (!controller.signal.aborted) setSuggestions([])
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }, 300)

    return () => {
      controller.abort()
      clearTimeout(timer)
    }
  }, [query])

  return { suggestions, loading }
}
