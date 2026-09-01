import type { Handler } from '@netlify/functions'
import { buildDashboardStats } from '../../src/utils/chartData'
import type { GitHubEvent, GitHubRepo, GitHubUser } from '../../src/types/github'

const BASE_URL = 'https://api.github.com'
const GITHUB_PAT = process.env.GITHUB_PAT

function headers(): HeadersInit {
  return {
    Accept: 'application/vnd.github+json',
    ...(GITHUB_PAT ? { Authorization: `Bearer ${GITHUB_PAT}` } : {}),
  }
}

async function githubFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, { headers: headers() })
  if (!res.ok) {
    if (res.status === 404) throw new Error('User not found')
    if (res.status === 403) throw new Error('GitHub API rate limit exceeded or access forbidden')
    if (res.status === 401) throw new Error('Invalid GitHub PAT in server configuration')
    throw new Error(`GitHub API error (${res.status})`)
  }
  return (await res.json()) as T
}

async function searchUsersLight(query: string): Promise<{ login: string; avatar_url: string; html_url: string }[]> {
  if (query.length < 2) return []
  const data = await githubFetch<{ items: { login: string; avatar_url: string; html_url: string }[] }>(
    `/search/users?q=${encodeURIComponent(query)}&per_page=8&sort=followers`,
  )
  return data.items
}

async function fetchUser(username: string): Promise<GitHubUser> {
  return githubFetch<GitHubUser>(`/users/${encodeURIComponent(username)}`)
}

async function fetchRepos(username: string): Promise<GitHubRepo[]> {
  const repos: GitHubRepo[] = []
  let page = 1
  while (page <= 3) {
    const batch = await githubFetch<GitHubRepo[]>(
      `/users/${encodeURIComponent(username)}/repos?per_page=100&page=${page}&sort=updated`,
    )
    repos.push(...batch)
    if (batch.length < 100) break
    page++
  }
  return repos
}

async function fetchEvents(username: string): Promise<GitHubEvent[]> {
  return githubFetch<GitHubEvent[]>(
    `/users/${encodeURIComponent(username)}/events/public?per_page=100`,
  )
}

async function resolveUsername(query: string): Promise<string> {
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

  return items[0].login
}

export const handler: Handler = async (event) => {
  try {
    const action = event.queryStringParameters?.action
    const query = event.queryStringParameters?.query || event.queryStringParameters?.username

    if (!query) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing query parameter' }) }
    }

    // Endpoint 1: Search Autocomplete
    if (action === 'search') {
      const items = await searchUsersLight(query)
      // Enrich with name
      const enriched = await Promise.all(
        items.map(async (item) => {
          try {
            const user = await fetchUser(item.login)
            return { login: item.login, name: user.name, avatar_url: item.avatar_url, html_url: item.html_url }
          } catch {
            return { ...item, name: null }
          }
        })
      )
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(enriched),
      }
    }

    // Endpoint 2: Fetch Dashboard Stats
    if (action === 'stats') {
      const login = await resolveUsername(query)
      const [user, repos, events] = await Promise.all([
        fetchUser(login),
        fetchRepos(login),
        fetchEvents(login),
      ])
      
      const stats = buildDashboardStats(user, repos, events)
      
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stats),
      }
    }

    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid action' }) }
  } catch (error) {
    console.error('Netlify Function Error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error instanceof Error ? error.message : 'Internal Server Error' }),
    }
  }
}

