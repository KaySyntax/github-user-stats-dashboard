import type { DashboardStats } from '../types/github'

export interface GitHubSearchUser {
  login: string
  name: string | null
  avatar_url: string
  html_url: string
}

export async function searchUsers(query: string): Promise<GitHubSearchUser[]> {
  if (query.length < 2) return []
  const res = await fetch(`/.netlify/functions/github-stats?action=search&query=${encodeURIComponent(query)}`)
  if (!res.ok) {
    throw new Error('Search failed')
  }
  return await res.json()
}

export async function fetchUserStats(query: string): Promise<DashboardStats> {
  const res = await fetch(`/.netlify/functions/github-stats?action=stats&username=${encodeURIComponent(query)}`)
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.error || `Error fetching stats (${res.status})`)
  }
  
  return await res.json()
}
