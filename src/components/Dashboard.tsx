import type { DashboardStats } from '../types/github'
import { ProfileHeader } from './ProfileHeader'
import { StatCard } from './StatCard'
import { ActivityAreaChart } from './charts/ActivityAreaChart'
import { ContributionHeatmap } from './charts/ContributionHeatmap'
import { EventTypesChart } from './charts/EventTypesChart'
import { LanguagePieChart } from './charts/LanguagePieChart'
import { RepoSizeChart } from './charts/RepoSizeChart'
import { ReposTimelineChart } from './charts/ReposTimelineChart'
import { StarsBarChart } from './charts/StarsBarChart'

interface DashboardProps {
  stats: DashboardStats
}

export function Dashboard({ stats }: DashboardProps) {
  return (
    <div className="dashboard">
      <ProfileHeader
        user={stats.user}
        totalStars={stats.totalStars}
        totalForks={stats.totalForks}
        totalCommits={stats.totalCommits}
      />

      <div className="charts-grid">
        <StatCard title="Contribution Heatmap" subtitle="Commit activity over the last 16 weeks" className="wide">
          <ContributionHeatmap data={stats.heatmap} />
        </StatCard>

        <StatCard title="Commit Activity" subtitle="Pushes & commits from recent public events">
          <ActivityAreaChart data={stats.activity} />
        </StatCard>

        <StatCard title="Language Breakdown" subtitle="Repos by primary language">
          <LanguagePieChart data={stats.languages} />
        </StatCard>

        <StatCard title="Top Repositories" subtitle="Stars & forks on original repos" className="wide">
          <StarsBarChart data={stats.topRepos} />
        </StatCard>

        <StatCard title="Repo Sizes" subtitle="Largest original repos by disk size">
          <RepoSizeChart data={stats.repoSizes} />
        </StatCard>

        <StatCard title="Activity Types" subtitle="Distribution of recent GitHub events">
          <EventTypesChart data={stats.eventTypes} />
        </StatCard>

        <StatCard title="Repos Over Time" subtitle="Original repos created per year">
          <ReposTimelineChart data={stats.repoTimeline} />
        </StatCard>
      </div>
    </div>
  )
}
