import type { HeatmapCell } from '../../types/github'

interface ContributionHeatmapProps {
  data: HeatmapCell[]
}

function intensityClass(count: number): string {
  if (count === 0) return 'level-0'
  if (count <= 2) return 'level-1'
  if (count <= 5) return 'level-2'
  if (count <= 10) return 'level-3'
  return 'level-4'
}

const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', '']

export function ContributionHeatmap({ data }: ContributionHeatmapProps) {
  if (data.length === 0) {
    return <p className="empty-chart">No contribution data available</p>
  }

  const weeks = Math.max(...data.map((c) => c.week)) + 1
  const grid: (HeatmapCell | null)[][] = Array.from({ length: weeks }, () =>
    Array.from({ length: 7 }, () => null),
  )

  for (const cell of data) {
    grid[cell.week][cell.day] = cell
  }

  const total = data.reduce((sum, c) => sum + c.count, 0)

  return (
    <div className="heatmap">
      <div className="heatmap-header">
        <div className="heatmap-meta">
          <span>{total.toLocaleString()} commits in the last 16 weeks</span>
        </div>
      </div>

      <div className="heatmap-container">
        <div className="heatmap-scroll">
          <div className="heatmap-labels">
            {DAY_LABELS.map((label, i) => (
              <span key={i} className="heatmap-day-label">
                {label}
              </span>
            ))}
          </div>
          <div className="heatmap-grid-wrapper">
            <div className="heatmap-grid" style={{ gridTemplateColumns: `repeat(${weeks}, 1fr)` }}>
              {grid.map((week, wi) =>
                week.map((cell, di) => (
                  <div
                    key={`${wi}-${di}`}
                    className={`heatmap-cell ${cell ? intensityClass(cell.count) : 'level-0'}`}
                    title={cell ? `${cell.count} commits on ${cell.date}` : undefined}
                  />
                )),
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="heatmap-legend">
        <span>Less</span>
        {['level-0', 'level-1', 'level-2', 'level-3', 'level-4'].map((lvl) => (
          <div key={lvl} className={`heatmap-cell ${lvl}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  )
}
