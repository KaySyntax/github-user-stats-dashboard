export interface GitHubUser {
  login: string
  name: string | null
  avatar_url: string
  bio: string | null
  public_repos: number
  followers: number
  following: number
  created_at: string
  html_url: string
  location: string | null
  company: string | null
}

export interface GitHubRepo {
  id: number
  name: string
  full_name: string
  description: string | null
  language: string | null
  stargazers_count: number
  forks_count: number
  watchers_count: number
  open_issues_count: number
  created_at: string
  updated_at: string
  pushed_at: string
  size: number
  html_url: string
  fork: boolean
}

export interface GitHubEvent {
  id: string
  type: string
  created_at: string
  repo: { name: string }
  payload: {
    commits?: { sha: string; message: string }[]
    size?: number
    action?: string
  }
}

export interface LanguageSlice {
  name: string
  value: number
  repos: number
}

export interface RepoStarEntry {
  name: string
  stars: number
  forks: number
}

export interface ActivityPoint {
  date: string
  pushes: number
  commits: number
  events: number
}

export interface EventTypeSlice {
  type: string
  count: number
}

export interface RepoTimelinePoint {
  year: string
  count: number
}

export interface HeatmapCell {
  date: string
  count: number
  week: number
  day: number
}

export interface RepoSizeEntry {
  name: string
  sizeKb: number
  sizeMb: number
}

export interface ComparisonMetric {
  label: string
  userA: number
  userB: number
}

export interface DashboardStats {
  user: GitHubUser
  repos: GitHubRepo[]
  events: GitHubEvent[]
  languages: LanguageSlice[]
  topRepos: RepoStarEntry[]
  activity: ActivityPoint[]
  eventTypes: EventTypeSlice[]
  repoTimeline: RepoTimelinePoint[]
  heatmap: HeatmapCell[]
  repoSizes: RepoSizeEntry[]
  totalStars: number
  totalForks: number
  totalCommits: number
}
