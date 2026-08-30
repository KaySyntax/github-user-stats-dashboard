import type { GitHubEvent, GitHubRepo, GitHubUser } from '../types/github'
import { getActiveToken } from '../utils/token'

const BASE_URL = 'https://api.github.com'

export interface GitHubSearchUser {
  login: string
  name: string | null
  avatar_url: string
  html_url: string
}

export interface RateLimitInfo {
  limit: number
  remaining: number
  reset: Date
}

function headers(): HeadersInit {
  const token = getActiveToken()
  return {
    Accept: 'application/vnd.github+json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export function parseRateLimit(res: Response): RateLimitInfo | null {
  const limit = res.headers.get('X-RateLimit-Limit')
  const remaining = res.headers.get('X-RateLimit-Remaining')
  const reset = res.headers.get('X-RateLimit-Reset')
  if (!limit || !remaining || !reset) return null
  return {
    limit: Number(limit),
    remaining: Number(remaining),
    reset: new Date(Number(reset) * 1000),
  }
}

async function githubFetch<T>(path: string): Promise<{ data: T; rateLimit: RateLimitInfo | null }> {
  const res = await fetch(`${BASE_URL}${path}`, { headers: headers() })
  const rateLimit = parseRateLimit(res)

  if (!res.ok) {
    if (res.status === 404) throw new Error('User not found')
    if (res.status === 403) {
      if (rateLimit?.remaining === 0) {
        const resetTime = rateLimit.reset.toLocaleTimeString()
        throw new Error(`GitHub rate limit exceeded. Resets at ${resetTime}`)
      }
      throw new Error('Access forbidden — profile may be private')
    }
    if (res.status === 401) throw new Error('Invalid token — check your PAT in settings')
    throw new Error(`GitHub API error (${res.status})`)
  }

  const data = (await res.json()) as T
  return { data, rateLimit }
}

async function githubGet<T>(path: string): Promise<T> {
  const { data } = await githubFetch<T>(path)
  return data
}

export async function fetchRateLimit(): Promise<RateLimitInfo | null> {
  const res = await fetch(`${BASE_URL}/rate_limit`, { headers: headers() })
  if (!res.ok) return null
  const json = (await res.json()) as { rate: { limit: number; remaining: number; reset: number } }
  return {
    limit: json.rate.limit,
    remaining: json.rate.remaining,
    reset: new Date(json.rate.reset * 1000),
  }
}

async function searchUsersLight(
  query: string,
): Promise<{ login: string; avatar_url: string; html_url: string }[]> {
  if (query.length < 2) return []
  const { data } = await githubFetch<{ items: { login: string; avatar_url: string; html_url: string }[] }>(
    `/search/users?q=${encodeURIComponent(query)}&per_page=8&sort=followers`,
  )
  return data.items
}

async function enrichSearchResults(
  items: { login: string; avatar_url: string; html_url: string }[],
): Promise<GitHubSearchUser[]> {
  return Promise.all(
    items.map(async (item) => {
      try {
        const user = await fetchUser(item.login)
        return { login: item.login, name: user.name, avatar_url: item.avatar_url, html_url: item.html_url }
      } catch {
        return { ...item, name: null }
      }
    }),
  )
}

export async function searchUsers(query: string): Promise<GitHubSearchUser[]> {
  const items = await searchUsersLight(query)
  return enrichSearchResults(items)
}

export async function resolveUsername(query: string): Promise<string> {
  const trimmed = query.trim()
  if (!trimmed) throw new Error('Enter a username or display name')

  if (!/\s/.test(trimmed)) {
    try {
      const user = await fetchUser(trimmed)
      return user.login
    } catch (err) {
      if (!(err instanceof Error && err.message === 'User not found')) throw err
    }
  }

  const items = await searchUsersLight(trimmed)
  if (items.length === 0) throw new Error('User not found')

  const lower = trimmed.toLowerCase()
  const loginMatch = items.find((u) => u.login.toLowerCase() === lower)
  if (loginMatch) return loginMatch.login

  const enriched = await enrichSearchResults(items.slice(0, 6))
  const exact = enriched.find((u) => u.name?.toLowerCase() === lower)
  if (exact) return exact.login

  const partial = enriched.find((u) => u.name?.toLowerCase().includes(lower))
  if (partial) return partial.login

  return items[0].login
}

export async function fetchUser(username: string): Promise<GitHubUser> {
  return githubGet<GitHubUser>(`/users/${encodeURIComponent(username)}`)
}

export async function fetchRepos(username: string): Promise<GitHubRepo[]> {
  const repos: GitHubRepo[] = []
  let page = 1

  while (page <= 3) {
    const batch = await githubGet<GitHubRepo[]>(
      `/users/${encodeURIComponent(username)}/repos?per_page=100&page=${page}&sort=updated`,
    )
    repos.push(...batch)
    if (batch.length < 100) break
    page++
  }

  return repos
}

export async function fetchEvents(username: string): Promise<GitHubEvent[]> {
  return githubGet<GitHubEvent[]>(
    `/users/${encodeURIComponent(username)}/events/public?per_page=100`,
  )
}

export async function fetchUserStats(query: string) {
  const login = await resolveUsername(query)
  const [user, repos, events] = await Promise.all([
    fetchUser(login),
    fetchRepos(login),
    fetchEvents(login),
  ])
  return { user, repos, events }
}
