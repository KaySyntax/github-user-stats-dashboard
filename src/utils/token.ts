const STORAGE_KEY = 'github-stats-pat'

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

export function setStoredToken(token: string): void {
  localStorage.setItem(STORAGE_KEY, token)
}

export function clearStoredToken(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function getEnvToken(): string | null {
  const token = import.meta.env.VITE_GITHUB_TOKEN
  return token?.trim() || null
}

export function getActiveToken(): string | null {
  return getEnvToken() ?? getStoredToken()
}

export type TokenSource = 'env' | 'local' | null

export function getTokenSource(): TokenSource {
  if (getEnvToken()) return 'env'
  if (getStoredToken()) return 'local'
  return null
}

/** True when PAT is baked in at build time — hide the settings UI for visitors */
export function isHostedToken(): boolean {
  return Boolean(getEnvToken())
}
