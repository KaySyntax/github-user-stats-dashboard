import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { EventTypeSlice } from '../../types/github'
import { CHART_COLORS } from '../../utils/chartData'

interface EventTypesChartProps {
  data: EventTypeSlice[]
}

export function EventTypesChart({ data }: EventTypesChartProps) {
  if (data.length === 0) {
    return <p className="empty-chart">No event data available</p>
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
        <XAxis
          dataKey="type"
          stroke="#8b949e"
          tick={{ fill: '#8b949e', fontSize: 11 }}
          angle={-30}
          textAnchor="end"
          height={60}
        />
        <YAxis stroke="#8b949e" tick={{ fill: '#8b949e', fontSize: 12 }} allowDecimals={false} />
        <Tooltip
          contentStyle={{
            background: '#161b22',
            border: '1px solid #30363d',
            borderRadius: 8,
            color: '#e6edf3',
          }}
          cursor={{ fill: 'rgba(88, 166, 255, 0.08)' }}
        />
        <Bar dataKey="count" name="Events" radius={[4, 4, 0, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}