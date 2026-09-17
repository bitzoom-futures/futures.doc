import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

export interface UserInfo {
  email: string
  token: string
  avatar: string
}

interface UserContextValue {
  user: UserInfo | null
  /** Raw JWT without Bearer prefix */
  rawToken: string
  setUser: (user: UserInfo | null) => void
  logout: () => void
}

const STORAGE_KEY = 'user'

function readUser(): UserInfo | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (parsed?.token?.trim()) return parsed
    }
  } catch { /* ignore */ }
  return null
}

const UserContext = createContext<UserContextValue>({
  user: null,
  rawToken: '',
  setUser: () => {},
  logout: () => {},
})

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<UserInfo | null>(() => {
    // Lazy init — read from localStorage immediately (client-side only)
    if (typeof window !== 'undefined') {
      return readUser()
    }
    return null
  })

  // Listen for cross-tab changes
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setUserState(e.newValue ? readUser() : null)
      }
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  const setUser = useCallback((u: UserInfo | null) => {
    setUserState(u)
    if (u?.token?.trim()) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setUserState(null)
  }, [])

  const rawToken = user?.token?.replace(/^Bearer\s+/i, '') || ''

  return (
    <UserContext.Provider value={{ user, rawToken, setUser, logout }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  return useContext(UserContext)
}
