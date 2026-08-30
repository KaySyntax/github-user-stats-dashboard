import type { ReactNode } from 'react'

interface StatCardProps {
  title: string
  subtitle?: string
  children: ReactNode
  className?: string
}

export function StatCard({ title, subtitle, children, className = '' }: StatCardProps) {
  return (
    <article className={`stat-card ${className}`}>
      <div className="stat-card-header">
        <h3>{title}</h3>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className="stat-card-body">{children}</div>
    </article>
  )
}
