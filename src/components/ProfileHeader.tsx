import { useState } from 'react'
import { Book, Users, Star, GitFork, Terminal, MapPin, Building2, Calendar, Camera } from 'lucide-react'
import type { DashboardStats } from '../types/github'
import { determinePersona, generateBadges } from '../utils/persona'
import { ShareModal } from './ShareModal'
import { BadgeModal } from './BadgeModal'

interface ProfileHeaderProps {
  stats: DashboardStats
  aiTitle?: string
}

export function ProfileHeader({ stats, aiTitle }: ProfileHeaderProps) {
  const { user, totalStars, totalForks, totalCommits } = stats
  
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [selectedBadge, setSelectedBadge] = useState<any | null>(null)
  
  const persona = determinePersona(stats)
  const badges = generateBadges(stats)

  const joined = new Date(user.created_at).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <>
      <header className="profile-header glass-panel">
        <div className="profile-header-main">
          <img src={user.avatar_url} alt="" className="avatar" width={96} height={96} crossOrigin="anonymous" />
          <div className="profile-info">
            <div className="profile-title">
              <h2>{user.name ?? user.login}</h2>
              <a href={user.html_url} target="_blank" rel="noreferrer" className="username">
                @{user.login}
              </a>
              <span className="persona-tag">
                <span className="persona-emoji">{persona.emoji}</span>
                {persona.title}
              </span>
            </div>
            {user.bio && <p className="bio">{user.bio}</p>}
            <div className="profile-meta">
              {user.location && <span><MapPin size={14} /> {user.location}</span>}
              {user.company && <span><Building2 size={14} /> {user.company}</span>}
              <span><Calendar size={14} /> Joined {joined}</span>
            </div>
            
            {badges.length > 0 && (
              <div className="profile-badges">
                {badges.map(badge => (
                  <button 
                    key={badge.id} 
                    className="badge" 
                    title="Click to view details"
                    onClick={() => setSelectedBadge(badge)}
                    style={{ 
                      borderColor: badge.color, 
                      color: badge.color, 
                      boxShadow: `0 0 10px ${badge.color}20`,
                      cursor: 'pointer',
                      background: 'rgba(0,0,0,0.2)'
                    }}
                  >
                    <span className="badge-emoji">{badge.emoji}</span>
                    {badge.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="profile-actions">
          <div className="profile-stats grid-stats">
            <div className="stat-pill">
              <Book size={16} className="stat-icon" />
              <div className="stat-value">
                <strong>{user.public_repos}</strong>
                <span>Repos</span>
              </div>
            </div>
            <div className="stat-pill">
              <Users size={16} className="stat-icon" />
              <div className="stat-value">
                <strong>{user.followers.toLocaleString()}</strong>
                <span>Followers</span>
              </div>
            </div>
            <div className="stat-pill">
              <Star size={16} className="stat-icon text-yellow" />
              <div className="stat-value">
                <strong>{totalStars.toLocaleString()}</strong>
                <span>Stars</span>
              </div>
            </div>
            <div className="stat-pill">
              <GitFork size={16} className="stat-icon" />
              <div className="stat-value">
                <strong>{totalForks.toLocaleString()}</strong>
                <span>Forks</span>
              </div>
            </div>
            <div className="stat-pill">
              <Terminal size={16} className="stat-icon text-green" />
              <div className="stat-value">
                <strong>{totalCommits.toLocaleString()}</strong>
                <span>Recent commits</span>
              </div>
            </div>
          </div>
          
          <button 
            type="button" 
            className="export-btn magnetic-cta" 
            onClick={() => setIsShareModalOpen(true)}
          >
            <Camera size={16} /> Export Card
          </button>
        </div>
      </header>

      <ShareModal 
        stats={stats} 
        aiTitle={aiTitle}
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
      />

      <BadgeModal 
        badge={selectedBadge}
        onClose={() => setSelectedBadge(null)}
      />
    </>
  )
}
