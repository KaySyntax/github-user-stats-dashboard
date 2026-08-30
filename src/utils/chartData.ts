import type {
  ActivityPoint,
  ComparisonMetric,
  DashboardStats,
  EventTypeSlice,
  GitHubEvent,
  GitHubRepo,
  GitHubUser,
  HeatmapCell,
  LanguageSlice,
  RepoSizeEntry,
  RepoStarEntry,
  RepoTimelinePoint,
} from '../types/github'

const CHART_COLORS = [
  '#58a6ff',
  '#3fb950',
  '#d2a8ff',
  '#f778ba',
  '#ffa657',
  '#79c0ff',
  '#7ee787',
  '#ff7b72',
  '#a5d6ff',
  '#e3b341',
]

export { CHART_COLORS }

export function buildLanguageData(repos: GitHubRepo[]): LanguageSlice[] {
  const map = new Map<string, { repos: number }>()

  for (const repo of repos) {
    if (!repo.language || repo.fork) continue
    const entry = map.get(repo.language) ?? { repos: 0 }
    entry.repos++
    map.set(repo.language, entry)
  }

  return [...map.entries()]
    .map(([name, { repos }]) => ({ name, value: repos, repos }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8)
}

export function buildTopRepos(repos: GitHubRepo[]): RepoStarEntry[] {
  return [...repos]
    .filter((r) => !r.fork)
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 10)
    .map((r) => ({
      name: r.name.length > 18 ? `${r.name.slice(0, 16)}…` : r.name,
      stars: r.stargazers_count,
      forks: r.forks_count,
    }))
}

export function buildActivityData(events: GitHubEvent[]): ActivityPoint[] {
  const map = new Map<string, { pushes: number; commits: number; events: number }>()

  for (const event of events) {
    const date = event.created_at.slice(0, 10)
    const entry = map.get(date) ?? { pushes: 0, commits: 0, events: 0 }
    entry.events++
    if (event.type === 'PushEvent') {
      entry.pushes++
      entry.commits += event.payload.commits?.length ?? 0
    }
    map.set(date, entry)
  }

  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, stats]) => ({ date, ...stats }))
}

export function buildEventTypes(events: GitHubEvent[]): EventTypeSlice[] {
  const map = new Map<string, number>()

  for (const event of events) {
    const label = event.type.replace('Event', '')
    map.set(label, (map.get(label) ?? 0) + 1)
  }

  return [...map.entries()]
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)
}

export function buildRepoTimeline(repos: GitHubRepo[]): RepoTimelinePoint[] {
  const map = new Map<string, number>()

  for (const repo of repos) {
    if (repo.fork) continue
    const year = repo.created_at.slice(0, 4)
    map.set(year, (map.get(year) ?? 0) + 1)
  }

  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([year, count]) => ({ year, count }))
}

export function buildHeatmapData(events: GitHubEvent[], weeks = 16): HeatmapCell[] {
  const counts = new Map<string, number>()

  for (const event of events) {
    if (event.type !== 'PushEvent') continue
    const date = event.created_at.slice(0, 10)
    const commits = event.payload.commits?.length ?? 1
    counts.set(date, (counts.get(date) ?? 0) + commits)
  }

  const cells: HeatmapCell[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const totalDays = weeks * 7

  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const date = d.toISOString().slice(0, 10)
    const day = d.getDay()
    const week = Math.floor((totalDays - 1 - i) / 7)
    cells.push({
      date,
      count: counts.get(date) ?? 0,
      week,
      day,
    })
  }

  return cells
}

export function buildRepoSizes(repos: GitHubRepo[]): RepoSizeEntry[] {
  return [...repos]
    .filter((r) => !r.fork && r.size > 0)
    .sort((a, b) => b.size - a.size)
    .slice(0, 10)
    .map((r) => ({
      name: r.name.length > 18 ? `${r.name.slice(0, 16)}…` : r.name,
      sizeKb: r.size,
      sizeMb: Math.round((r.size / 1024) * 10) / 10,
    }))
}

export function buildComparisonMetrics(a: DashboardStats, b: DashboardStats): ComparisonMetric[] {
  return [
    { label: 'Public Repos', userA: a.user.public_repos, userB: b.user.public_repos },
    { label: 'Followers', userA: a.user.followers, userB: b.user.followers },
    { label: 'Total Stars', userA: a.totalStars, userB: b.totalStars },
    { label: 'Total Forks', userA: a.totalForks, userB: b.totalForks },
    { label: 'Recent Commits', userA: a.totalCommits, userB: b.totalCommits },
  ]
}

export function buildLanguageComparison(a: LanguageSlice[], b: LanguageSlice[]) {
  const langs = new Set([...a.map((l) => l.name), ...b.map((l) => l.name)])
  const mapA = new Map(a.map((l) => [l.name, l.value]))
  const mapB = new Map(b.map((l) => [l.name, l.value]))

  return [...langs]
    .map((name) => ({
      name,
      userA: mapA.get(name) ?? 0,
      userB: mapB.get(name) ?? 0,
    }))
    .sort((x, y) => Math.max(y.userA, y.userB) - Math.max(x.userA, x.userB))
    .slice(0, 8)
}

export function buildDashboardStats(
  user: GitHubUser,
  repos: GitHubRepo[],
  events: GitHubEvent[],
): DashboardStats {
  const ownRepos = repos.filter((r) => !r.fork)

  return {
    user,
    repos,
    events,
    languages: buildLanguageData(repos),
    topRepos: buildTopRepos(repos),
    activity: buildActivityData(events),
    eventTypes: buildEventTypes(events),
    repoTimeline: buildRepoTimeline(repos),
    heatmap: buildHeatmapData(events),
    repoSizes: buildRepoSizes(repos),
    totalStars: ownRepos.reduce((sum, r) => sum + r.stargazers_count, 0),
    totalForks: ownRepos.reduce((sum, r) => sum + r.forks_count, 0),
    totalCommits: events
      .filter((e) => e.type === 'PushEvent')
      .reduce((sum, e) => sum + (e.payload.commits?.length ?? 0), 0),
  }
}
