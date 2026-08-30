import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import type { LanguageSlice } from '../../types/github'
import { CHART_COLORS } from '../../utils/chartData'

interface LanguagePieChartProps {
  data: LanguageSlice[]
}

export function LanguagePieChart({ data }: LanguagePieChartProps) {
  if (data.length === 0) {
    return <p className="empty-chart">No language data available</p>
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          stroke="none"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: '#161b22',
            border: '1px solid #30363d',
            borderRadius: 8,
            color: '#e6edf3',
          }}
          formatter={(value, name) => [`${value} repos`, name]}
        />
        <Legend
          verticalAlign="bottom"
          formatter={(value) => <span style={{ color: '#8b949e' }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
