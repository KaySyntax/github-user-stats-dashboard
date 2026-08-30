import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  clearStoredToken,
  getActiveToken,
  getTokenSource,
  setStoredToken,
  type TokenSource,
} from '../utils/token'

interface TokenContextValue {
  token: string | null
  source: TokenSource
  hasToken: boolean
  saveToken: (token: string) => void
  clearToken: () => void
}

const TokenContext = createContext<TokenContextValue | null>(null)

export function TokenProvider({ children }: { children: ReactNode }) {
  const [storedVersion, setStoredVersion] = useState(0)

  const value = useMemo<TokenContextValue>(() => {
    void storedVersion
    const source = getTokenSource()
    const token = getActiveToken()

    return {
      token,
      source,
      hasToken: Boolean(token),
      saveToken: (pat: string) => {
        setStoredToken(pat.trim())
        setStoredVersion((v) => v + 1)
      },
      clearToken: () => {
        clearStoredToken()
        setStoredVersion((v) => v + 1)
      },
    }
  }, [storedVersion])

  return <TokenContext.Provider value={value}>{children}</TokenContext.Provider>
}

export function useToken() {
  const ctx = useContext(TokenContext)
  if (!ctx) throw new Error('useToken must be used within TokenProvider')
  return ctx
}
