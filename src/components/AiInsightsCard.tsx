import { useEffect, useState } from 'react'
import type { DashboardStats } from '../types/github'
import { generateAiInsights, type AiInsight } from '../utils/ai'
import { Sparkles } from 'lucide-react'

interface AiInsightsCardProps {
  stats: DashboardStats
  onTitleReady?: (title: string) => void
}

export function AiInsightsCard({ stats, onTitleReady }: AiInsightsCardProps) {
  const [insight, setInsight] = useState<AiInsight | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    
    generateAiInsights(stats).then((result) => {
      if (isMounted) {
        setInsight(result)
        setLoading(false)
        onTitleReady?.(result.title)
      }
    })

    return () => {
      isMounted = false
    }
  }, [stats])

  return (
    <div className="ai-insights-card glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
      <div className="ai-header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--accent-purple)' }}>
        <Sparkles size={20} />
        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>AI Persona Insight</h3>
      </div>
      
      {loading ? (
        <div className="ai-loading">
          <div className="skeleton-bar" />
          <div className="skeleton-bar" />
          <div className="skeleton-bar short" style={{ width: '60%' }} />
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem', fontStyle: 'italic' }}>
            Analyzing metrics... (this may take a few seconds during high demand)
          </p>
        </div>
      ) : insight ? (
        <div>
          <p style={{ margin: '0 0 0.75rem', fontSize: '1.15rem', fontWeight: 700, color: 'var(--accent-purple)' }}>
            "{insight.title}"
          </p>
          <p className="ai-text" style={{ margin: 0, lineHeight: 1.6, fontSize: '0.95rem', color: 'var(--text)' }}>
            {insight.summary}
          </p>
        </div>
      ) : null}
    </div>
  )
}

