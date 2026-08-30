import type { GitHubUser } from '../types/github'

interface ProfileHeaderProps {
  user: GitHubUser
  totalStars: number
  totalForks: number
  totalCommits: number
}

export function ProfileHeader({ user, totalStars, totalForks, totalCommits }: ProfileHeaderProps) {
  const joined = new Date(user.created_at).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <header className="profile-header">
      <img src={user.avatar_url} alt="" className="avatar" width={96} height={96} />
      <div className="profile-info">
        <div className="profile-title">
          <h2>{user.name ?? user.login}</h2>
          <a href={user.html_url} target="_blank" rel="noreferrer" className="username">
            @{user.login}
          </a>
        </div>
        {user.bio && <p className="bio">{user.bio}</p>}
        <div className="profile-meta">
          {user.location && <span>📍 {user.location}</span>}
          {user.company && <span>🏢 {user.company}</span>}
          <span>📅 Joined {joined}</span>
        </div>
      </div>
      <div className="profile-stats">
        <div className="mini-stat">
          <strong>{user.public_repos}</strong>
          <span>Repos</span>
        </div>
        <div className="mini-stat">
          <strong>{user.followers.toLocaleString()}</strong>
          <span>Followers</span>
        </div>
        <div className="mini-stat">
          <strong>{totalStars.toLocaleString()}</strong>
          <span>Stars</span>
        </div>
        <div className="mini-stat">
          <strong>{totalForks.toLocaleString()}</strong>
          <span>Forks</span>
        </div>
        <div className="mini-stat">
          <strong>{totalCommits.toLocaleString()}</strong>
          <span>Recent commits</span>
        </div>
      </div>
    </header>
  )
}
