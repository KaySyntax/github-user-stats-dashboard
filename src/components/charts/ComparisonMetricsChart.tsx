import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ComparisonMetric } from '../../types/github'

interface ComparisonMetricsChartProps {
  data: ComparisonMetric[]
  labelA: string
  labelB: string
}

export function ComparisonMetricsChart({ data, labelA, labelB }: ComparisonMetricsChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical" margin={{ left: 16, right: 16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#21262d" horizontal={false} />
        <XAxis type="number" stroke="#8b949e" tick={{ fill: '#8b949e', fontSize: 12 }} />
        <YAxis
          type="category"
          dataKey="label"
          width={110}
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
          cursor={{ fill: 'rgba(88, 166, 255, 0.08)' }}
        />
        <Legend formatter={(value) => <span style={{ color: '#8b949e' }}>{value}</span>} />
        <Bar dataKey="userA" name={labelA} fill="#58a6ff" radius={[0, 4, 4, 0]} />
        <Bar dataKey="userB" name={labelB} fill="#3fb950" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
