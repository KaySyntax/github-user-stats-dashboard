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

export function RepoSizeChart({ data }: RepoSizeChartProps) {
  if (data.length === 0) {
    return <p className="empty-chart">No repository size data available</p>
  }

  // Ensure log scale doesn't break on 0 values
  const safeData = data.map(d => ({
    ...d,
    sizeMb: d.sizeMb <= 0 ? 0.01 : d.sizeMb
  }));

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={safeData} layout="vertical" margin={{ left: 100, right: 30, top: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
        <XAxis
          type="number"
          scale="log"
          domain={['auto', 'auto']}
          stroke="#8b949e"
          tick={{ fill: '#8b949e', fontSize: 12 }}
          tickFormatter={(v) => `${v} MB`}
        />
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
          formatter={(value) => [`${value} MB`, 'Size']}
          cursor={{ fill: 'rgba(255, 166, 87, 0.08)' }}
        />
        <Bar 
          dataKey="sizeMb" 
          name="Size (MB)" 
          fill="#d2a8ff" 
          radius={[0, 4, 4, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
