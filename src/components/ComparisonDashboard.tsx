import type { DashboardStats } from '../types/github'
import { buildComparisonMetrics, buildLanguageComparison } from '../utils/chartData'
import { StatCard } from './StatCard'
import { ComparisonMetricsChart } from './charts/ComparisonMetricsChart'
import { LanguageComparisonChart } from './charts/LanguageComparisonChart'

interface ComparisonDashboardProps {
  statsA: DashboardStats
  statsB: DashboardStats
}

export function ComparisonDashboard({ statsA, statsB }: ComparisonDashboardProps) {
  const labelA = `@${statsA.user.login}`
  const labelB = `@${statsB.user.login}`
  const metrics = buildComparisonMetrics(statsA, statsB)
  const languages = buildLanguageComparison(statsA.languages, statsB.languages)

  return (
    <div className="comparison-dashboard">
      <div className="compare-headers">
        <div className="compare-user-card">
          <img src={statsA.user.avatar_url} alt="" width={64} height={64} />
          <div>
            <h2>{statsA.user.name ?? statsA.user.login}</h2>
            <a href={statsA.user.html_url} target="_blank" rel="noreferrer">
              @{statsA.user.login}
            </a>
          </div>
        </div>
        <div className="compare-divider">⚔️</div>
        <div className="compare-user-card">
          <img src={statsB.user.avatar_url} alt="" width={64} height={64} />
          <div>
            <h2>{statsB.user.name ?? statsB.user.login}</h2>
            <a href={statsB.user.html_url} target="_blank" rel="noreferrer">
              @{statsB.user.login}
            </a>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <StatCard title="Head-to-Head Stats" subtitle="Key metrics side by side" className="wide">
          <ComparisonMetricsChart data={metrics} labelA={labelA} labelB={labelB} />
        </StatCard>

        <StatCard title="Language Comparison" subtitle="Repos per language" className="wide">
          <LanguageComparisonChart data={languages} labelA={labelA} labelB={labelB} />
        </StatCard>

        <StatCard title="Quick Stats" subtitle="At-a-glance comparison">
          <div className="compare-table">
            <div className="compare-table-head">
              <span>Metric</span>
              <span>{labelA}</span>
              <span>{labelB}</span>
            </div>
            {metrics.map((m) => {
              const winnerA = m.userA > m.userB
              const winnerB = m.userB > m.userA
              return (
                <div key={m.label} className="compare-table-row">
                  <span className="metric-label">{m.label}</span>
                  <span className={winnerA ? 'winner' : ''}>{m.userA.toLocaleString()}</span>
                  <span className={winnerB ? 'winner' : ''}>{m.userB.toLocaleString()}</span>
                </div>
              )
            })}
          </div>
        </StatCard>

        <StatCard title="Top Language" subtitle="Most-used language per user">
          <div className="top-lang-compare">
            <div>
              <span className="lang-user">{labelA}</span>
              <strong>{statsA.languages[0]?.name ?? '—'}</strong>
              <span className="lang-count">
                {statsA.languages[0] ? `${statsA.languages[0].repos} repos` : ''}
              </span>
            </div>
            <div>
              <span className="lang-user">{labelB}</span>
              <strong>{statsB.languages[0]?.name ?? '—'}</strong>
              <span className="lang-count">
                {statsB.languages[0] ? `${statsB.languages[0].repos} repos` : ''}
              </span>
            </div>
          </div>
        </StatCard>
      </div>
    </div>
  )
}
