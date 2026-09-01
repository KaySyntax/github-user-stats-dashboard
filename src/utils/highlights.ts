import type { DashboardStats, GitHubEvent, HeatmapCell } from '../types/github'



/**
 * Find the longest consecutive streak of days with at least 1 commit.
 */
export function calculateLongestStreak(heatmap: HeatmapCell[]): number {
  // Sort cells by date
  const sorted = [...heatmap].sort((a, b) => a.date.localeCompare(b.date))

  let maxStreak = 0
  let currentStreak = 0

  for (const cell of sorted) {
    if (cell.count > 0) {
      currentStreak++
      maxStreak = Math.max(maxStreak, currentStreak)
    } else {
      currentStreak = 0
    }
  }

  return maxStreak
}

/**
 * Find the month with the most commits from event data.
 */
export function calculateBiggestMonth(events: GitHubEvent[]): string {
  const monthCounts = new Map<string, number>()

  for (const event of events) {
    if (event.type !== 'PushEvent') continue
    const commits = event.payload.commits?.length ?? 1
    const date = new Date(event.created_at)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    monthCounts.set(key, (monthCounts.get(key) ?? 0) + commits)
  }

  if (monthCounts.size === 0) return 'N/A'

  const [bestKey] = [...monthCounts.entries()].sort((a, b) => b[1] - a[1])[0]
  const [year, month] = bestKey.split('-')
  const date = new Date(Number(year), Number(month) - 1)
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

/**
 * Find the most common day of the week for coding activity.
 */
export function calculateBusiestDay(events: GitHubEvent[]): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const counts = new Array(7).fill(0)

  for (const event of events) {
    const day = new Date(event.created_at).getDay()
    counts[day]++
  }

  const maxIdx = counts.indexOf(Math.max(...counts))
  return days[maxIdx]
}

/**
 * Determine the user's primary coding time window.
 */
export function calculateCodingEra(events: GitHubEvent[]): string {
  const buckets = { morning: 0, afternoon: 0, evening: 0, night: 0 }

  for (const event of events) {
    const hour = new Date(event.created_at).getHours()
    if (hour >= 5 && hour < 12) buckets.morning++
    else if (hour >= 12 && hour < 17) buckets.afternoon++
    else if (hour >= 17 && hour < 21) buckets.evening++
    else buckets.night++
  }

  const max = Math.max(...Object.values(buckets))
  if (buckets.night === max) return 'Night Owl 🦉'
  if (buckets.morning === max) return 'Early Bird 🐦'
  if (buckets.afternoon === max) return 'Afternoon Coder ☀️'
  return 'Evening Hacker 🌙'
}

/**
 * Get the most popular (highest starred) repo name.
 */
export function getMostPopularRepo(stats: DashboardStats): string {
  if (stats.topRepos.length === 0) return 'N/A'
  return stats.topRepos[0].name
}
