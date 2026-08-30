import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ActivityPoint } from '../../types/github'

interface ActivityAreaChartProps {
  data: ActivityPoint[]
}

function formatDate(date: string) {
  const d = new Date(date + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function ActivityAreaChart({ data }: ActivityAreaChartProps) {
  if (data.length === 0) {
    return <p className="empty-chart">No recent activity found</p>
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="commitsGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#58a6ff" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#58a6ff" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="pushesGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3fb950" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#3fb950" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
        <XAxis
          dataKey="date"
          tickFormatter={formatDate}
          stroke="#8b949e"
          tick={{ fill: '#8b949e', fontSize: 11 }}
          interval="preserveStartEnd"
        />
        <YAxis stroke="#8b949e" tick={{ fill: '#8b949e', fontSize: 12 }} allowDecimals={false} />
        <Tooltip
          contentStyle={{
            background: '#161b22',
            border: '1px solid #30363d',
            borderRadius: 8,
            color: '#e6edf3',
          }}
          labelFormatter={(label) => formatDate(String(label))}
        />
        <Area
          type="monotone"
          dataKey="commits"
          name="Commits"
          stroke="#58a6ff"
          fill="url(#commitsGrad)"
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="pushes"
          name="Pushes"
          stroke="#3fb950"
          fill="url(#pushesGrad)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
