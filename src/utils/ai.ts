import type { DashboardStats } from '../types/github'

export interface AiInsight {
  title: string
  summary: string
}

export async function generateAiInsights(stats: DashboardStats): Promise<AiInsight> {
  const fallback: AiInsight = {
    title: 'The Developer',
    summary: "Wow, these stats are off the charts! Our AI tried to analyze them, but got a bit overwhelmed. Keep up the amazing coding!"
  }

  try {
    // OPTIMIZATION: Reduce the payload size sent to Netlify functions to prevent timeouts and 413s
    const optimizedStats = {
      ...stats,
      repos: [...stats.repos]
        .sort((a, b) => b.stargazers_count - a.stargazers_count)
        .slice(0, 15),
      events: [] 
    };

    const res = await fetch('/.netlify/functions/gemini-summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(optimizedStats)
    })

    if (!res.ok) {
      throw new Error('Failed to fetch AI insights')
    }

    const data = await res.json()
    return {
      title: data.title || fallback.title,
      summary: data.summary || fallback.summary,
    }
  } catch (error) {
    console.error('Error fetching AI insights from backend:', error)
    return fallback
  }
}



