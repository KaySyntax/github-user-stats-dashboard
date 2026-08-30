import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { RepoSizeEntry } from '../../types/github'

interface RepoSizeChartProps {
  data: RepoSizeEntry[]
}

export function RepoSizeChart({ data }: RepoSizeChartProps) {
  if (data.length === 0) {
    return <p className="empty-chart">No repository size data available</p>
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#21262d" horizontal={false} />
        <XAxis
          type="number"
          stroke="#8b949e"
          tick={{ fill: '#8b949e', fontSize: 12 }}
          tickFormatter={(v) => `${v} MB`}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={100}
          stroke="#8b949e"
          tick={{ fill: '#c9d1d9', fontSize: 12 }}
        />
        <Tooltip
          contentStyle={{
            background: '#161b22',
            border: '1px solid #30363d',
            borderRadius: 8,
            color: '#e6edf3',
          }}
          formatter={(value) => [`${value} MB`, 'Size']}
          cursor={{ fill: 'rgba(255, 166, 87, 0.08)' }}
        />
        <Bar dataKey="sizeMb" name="Size (MB)" fill="#ffa657" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
