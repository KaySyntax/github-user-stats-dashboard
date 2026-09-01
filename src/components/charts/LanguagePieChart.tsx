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
import { getDevIconUrl } from '../../utils/devicons'

interface LanguagePieChartProps {
  data: LanguageSlice[]
}

export function LanguagePieChart({ data }: LanguagePieChartProps) {
  if (data.length === 0) {
    return <p className="empty-chart">No language data available</p>
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
        <defs>
          <filter id="pieShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000000" floodOpacity="0.4" />
          </filter>
        </defs>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={4}
          stroke="none"
          style={{ filter: 'url(#pieShadow)' }}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: 'rgba(22, 27, 34, 0.8)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8,
            color: '#e6edf3',
          }}
          formatter={(value, name) => [`${value} repos`, name]}
        />
        <Legend
          verticalAlign="bottom"
          formatter={(value: string) => {
            const iconUrl = getDevIconUrl(value)
            return (
              <span style={{ color: '#8b949e', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                {iconUrl && <img src={iconUrl} alt="" width={14} height={14} style={{ verticalAlign: 'middle' }} />}
                {value}
              </span>
            )
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

