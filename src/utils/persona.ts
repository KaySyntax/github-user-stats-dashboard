import type { DashboardStats } from '../types/github'

export interface Badge {
  id: string
  label: string
  emoji: string
  description: string
  color: string
}

export interface Persona {
  title: string
  emoji: string
}

export function generateBadges(stats: DashboardStats): Badge[] {
  const badges: Badge[] = []

  // 1. Star Weaver (Lots of stars)
  if (stats.totalStars > 500) {
    badges.push({ id: 'star-lord', label: 'Star Lord', emoji: '🌟', description: 'Over 500 total stars', color: '#e3b341' }) // GitHub Yellow
  } else if (stats.totalStars > 50) {
    badges.push({ id: 'star-weaver', label: 'Star Weaver', emoji: '⭐', description: 'Over 50 total stars', color: '#d29922' }) // GitHub Muted Yellow
  }

  // 2. Polyglot (Many languages)
  if (stats.languages.length >= 8) {
    badges.push({ id: 'polyglot', label: 'Polyglot', emoji: '🌐', description: 'Uses 8+ programming languages', color: '#bc8cff' }) // GitHub Purple
  }

  // 3. Open Source Advocate (Lots of forks)
  if (stats.totalForks > 100) {
    badges.push({ id: 'os-legend', label: 'OS Legend', emoji: '👑', description: 'Projects highly forked', color: '#f85149' }) // GitHub Red
  } else if (stats.totalForks > 20) {
    badges.push({ id: 'os-advocate', label: 'Collaborator', emoji: '🤝', description: 'Projects often forked', color: '#da3633' }) // GitHub Muted Red
  }

  // 4. Heavy Committer
  if (stats.totalCommits > 500) {
    badges.push({ id: 'commit-machine', label: 'Machine', emoji: '⚙️', description: 'Massive commit volume', color: '#3fb950' }) // GitHub Green
  }

  // 5. Specialist (One language dominates)
  if (stats.languages.length > 0 && stats.languages[0].value > 70) {
    badges.push({ 
      id: 'specialist', 
      label: `${stats.languages[0].name} Master`, 
      emoji: '🎯', 
      description: `Over 70% of repos are ${stats.languages[0].name}`, 
      color: '#58a6ff' // GitHub Blue
    })
  }

  return badges
}

export function determinePersona(stats: DashboardStats): Persona {
  // Simple heuristic for primary persona title
  if (stats.totalStars > 1000) return { title: 'Open Source Titan', emoji: '🏛️' }
  if (stats.languages.length >= 10) return { title: 'Code Explorer', emoji: '🧭' }
  if (stats.totalCommits > 300) return { title: 'Relentless Builder', emoji: '🔨' }
  if (stats.languages[0]?.name === 'TypeScript' || stats.languages[0]?.name === 'JavaScript') return { title: 'Web Wizard', emoji: '🕸️' }
  if (stats.languages[0]?.name === 'Python') return { title: 'Data Charmer', emoji: '🐍' }
  if (stats.languages[0]?.name === 'Rust' || stats.languages[0]?.name === 'Go') return { title: 'Systems Sorcerer', emoji: '⚡' }
  
  return { title: 'Passionate Developer', emoji: '💻' }
}

