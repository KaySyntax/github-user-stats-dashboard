import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { RepoStarEntry } from '../../types/github'

interface StarsBarChartProps {
  data: RepoStarEntry[]
}

const CustomYAxisTick = (props: any) => {
  const { x, y, payload } = props
  const value = payload.value
  const displayValue = value.length > 12 ? `${value.substring(0, 12)}...` : value

  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={4} textAnchor="end" fill="#c9d1d9" fontSize={12} style={{ cursor: 'pointer' }}>
        <title>{value}</title>
        {displayValue}
      </text>
    </g>
  )
}

export function StarsBarChart({ data }: StarsBarChartProps) {
  if (data.length === 0) {
    return <p className="empty-chart">No repository data available</p>
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} layout="vertical" margin={{ left: 100, right: 30, top: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
        <XAxis type="number" stroke="#8b949e" tick={{ fill: '#8b949e', fontSize: 12 }} />
        <YAxis
          type="category"
          dataKey="name"
          width={100}
          stroke="#8b949e"
          tick={<CustomYAxisTick />}
        />
        <Tooltip
          contentStyle={{
            background: 'rgba(22, 27, 34, 0.8)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8,
            color: '#c9d1d9',
          }}
          cursor={{ fill: 'rgba(88, 166, 255, 0.08)' }}
        />
        <Bar dataKey="stars" name="Stars" fill="#58a6ff" radius={[0, 4, 4, 0]} />
        <Bar dataKey="forks" name="Forks" fill="#3fb950" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
