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

interface LanguageComparisonChartProps {
  data: { name: string; userA: number; userB: number }[]
  labelA: string
  labelB: string
}

export function LanguageComparisonChart({ data, labelA, labelB }: LanguageComparisonChartProps) {
  if (data.length === 0) {
    return <p className="empty-chart">No language data to compare</p>
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
        <XAxis
          dataKey="name"
          stroke="#8b949e"
          tick={{ fill: '#8b949e', fontSize: 11 }}
          angle={-25}
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
        <Legend formatter={(value) => <span style={{ color: '#8b949e' }}>{value}</span>} />
        <Bar dataKey="userA" name={labelA} fill="#58a6ff" radius={[4, 4, 0, 0]} />
        <Bar dataKey="userB" name={labelB} fill="#3fb950" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
