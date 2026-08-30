import { COMPARE_SUGGESTIONS, POPULAR_SUGGESTIONS, TRENDING_THIS_WEEK } from '../data/suggestions'

interface HomePageProps {
  mode: 'single' | 'compare'
  onSearch: (username: string) => void
  onCompare: (userA: string, userB: string) => void
}

export function HomePage({ mode, onSearch, onCompare }: HomePageProps) {
  if (mode === 'compare') {
    return (
      <div className="home-page">
        <div className="home-hero">
          <div className="home-icon">⚔️</div>
          <h2>Compare two developers</h2>
          <p>
            Enter two usernames above to see head-to-head stats, language overlap,
            and who leads in stars, forks, and activity.
          </p>
        </div>

        <section className="home-section">
          <h3>Popular matchups</h3>
          <div className="compare-suggestions">
            {COMPARE_SUGGESTIONS.map(([a, b]) => (
              <button
                key={`${a}-${b}`}
                type="button"
                className="compare-chip"
                onClick={() => onCompare(a, b)}
              >
                <span>@{a}</span>
                <span className="vs">vs</span>
                <span>@{b}</span>
              </button>
            ))}
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="home-page">
      <div className="home-hero">
        <div className="home-icon">📊</div>
        <h2>Explore any developer&apos;s GitHub habits</h2>
        <p>
          Search a username above — or pick a trending profile below — to unlock
          language breakdowns, contribution heatmaps, repo sizes, and more.
        </p>
      </div>

      <section className="home-section">
        <div className="section-heading">
          <h3>Trending this week</h3>
          <span className="section-badge">Popular profiles</span>
        </div>
        <div className="trending-grid">
          {TRENDING_THIS_WEEK.map((profile) => (
            <button
              key={profile.login}
              type="button"
              className="trending-card"
              onClick={() => onSearch(profile.login)}
            >
              <img
                src={`https://github.com/${profile.login}.png`}
                alt=""
                width={48}
                height={48}
                loading="lazy"
              />
              <div className="trending-info">
                <strong>{profile.name}</strong>
                <span className="trending-login">@{profile.login}</span>
                <span className="trending-tag">{profile.tag}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="home-section">
        <h3>Quick search</h3>
        <div className="suggestions">
          {POPULAR_SUGGESTIONS.map((name) => (
            <button key={name} type="button" onClick={() => onSearch(name)}>
              @{name}
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
