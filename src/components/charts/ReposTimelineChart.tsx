import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { RepoTimelinePoint } from '../../types/github'

interface ReposTimelineChartProps {
  data: RepoTimelinePoint[]
}

export function ReposTimelineChart({ data }: ReposTimelineChartProps) {
  if (data.length === 0) {
    return <p className="empty-chart">No repository timeline data</p>
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
        <XAxis dataKey="year" stroke="#8b949e" tick={{ fill: '#8b949e', fontSize: 12 }} />
        <YAxis stroke="#8b949e" tick={{ fill: '#8b949e', fontSize: 12 }} allowDecimals={false} />
        <Tooltip
          contentStyle={{
            background: '#161b22',
            border: '1px solid #30363d',
            borderRadius: 8,
            color: '#e6edf3',
          }}
          cursor={{ fill: 'rgba(210, 168, 255, 0.08)' }}
          formatter={(value) => [`${value} repos`, 'Created']}
        />
        <Bar dataKey="count" name="Repos created" fill="#d2a8ff" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
