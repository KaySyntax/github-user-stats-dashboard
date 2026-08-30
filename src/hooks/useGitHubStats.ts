import { useCallback, useState } from 'react'
import { fetchUserStats } from '../api/github'
import type { DashboardStats } from '../types/github'
import { buildDashboardStats } from '../utils/chartData'

interface UseGitHubStatsResult {
  stats: DashboardStats | null
  loading: boolean
  error: string | null
  username: string
  search: (username: string) => Promise<void>
  reset: () => void
}

export function useGitHubStats(): UseGitHubStatsResult {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [username, setUsername] = useState('')

  const search = useCallback(async (input: string) => {
    const trimmed = input.trim()
    if (!trimmed) return

    setLoading(true)
    setError(null)
    setUsername(trimmed)

    try {
      const { user, repos, events } = await fetchUserStats(trimmed)
      setStats(buildDashboardStats(user, repos, events))
      setUsername(user.login)
    } catch (err) {
      setStats(null)
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setStats(null)
    setLoading(false)
    setError(null)
    setUsername('')
  }, [])

  return { stats, loading, error, username, search, reset }
}

interface UseGitHubComparisonResult {
  statsA: DashboardStats | null
  statsB: DashboardStats | null
  loading: boolean
  error: string | null
  userA: string
  userB: string
  compare: (userA: string, userB: string) => Promise<void>
  reset: () => void
}

export function useGitHubComparison(): UseGitHubComparisonResult {
  const [statsA, setStatsA] = useState<DashboardStats | null>(null)
  const [statsB, setStatsB] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userA, setUserA] = useState('')
  const [userB, setUserB] = useState('')

  const compare = useCallback(async (a: string, b: string) => {
    const trimmedA = a.trim()
    const trimmedB = b.trim()
    if (!trimmedA || !trimmedB) return

    setLoading(true)
    setError(null)
    setUserA(trimmedA)
    setUserB(trimmedB)

    try {
      const [dataA, dataB] = await Promise.all([
        fetchUserStats(trimmedA),
        fetchUserStats(trimmedB),
      ])
      setStatsA(buildDashboardStats(dataA.user, dataA.repos, dataA.events))
      setStatsB(buildDashboardStats(dataB.user, dataB.repos, dataB.events))
      setUserA(dataA.user.login)
      setUserB(dataB.user.login)
    } catch (err) {
      setStatsA(null)
      setStatsB(null)
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setStatsA(null)
    setStatsB(null)
    setLoading(false)
    setError(null)
    setUserA('')
    setUserB('')
  }, [])

  return { statsA, statsB, loading, error, userA, userB, compare, reset }
}
