import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  isSupabaseConfigured,
  readSession,
  refreshSession,
  sendPasswordReset,
  signIn,
  signOut,
  signUp,
  type AuthSession,
} from '../lib/supabase'

type AuthContextValue = {
  configured: boolean
  session: AuthSession | null
  loading: boolean
  signInWithPassword: (email: string, password: string) => Promise<void>
  createAccount: (email: string, password: string, displayName: string) => Promise<boolean>
  requestPasswordReset: (email: string) => Promise<void>
  signOutUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function initialize() {
      const stored = readSession()
      if (!stored) {
        if (active) setLoading(false)
        return
      }
      const expiresAt = stored.expires_at ?? 0
      if (expiresAt > Math.floor(Date.now() / 1000) + 60) {
        if (active) setSession(stored)
      } else {
        try {
          const refreshed = await refreshSession(stored)
          if (active) setSession(refreshed)
        } catch {
          if (active) setSession(null)
        }
      }
      if (active) setLoading(false)
    }
    void initialize()
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!session?.expires_at) return
    const delay = Math.max(1000, (session.expires_at * 1000) - Date.now() - 60_000)
    const timer = window.setTimeout(async () => {
      try {
        setSession(await refreshSession(session))
      } catch {
        setSession(null)
      }
    }, delay)
    return () => window.clearTimeout(timer)
  }, [session])

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    setSession(await signIn(email, password))
  }, [])

  const createAccount = useCallback(async (email: string, password: string, displayName: string) => {
    const result = await signUp(email, password, displayName)
    if (result.session) setSession(result.session)
    return result.needsEmailConfirmation
  }, [])

  const requestPasswordReset = useCallback((email: string) => sendPasswordReset(email), [])

  const signOutUser = useCallback(async () => {
    await signOut(session)
    setSession(null)
  }, [session])

  const value = useMemo(() => ({
    configured: isSupabaseConfigured,
    session,
    loading,
    signInWithPassword,
    createAccount,
    requestPasswordReset,
    signOutUser,
  }), [session, loading, signInWithPassword, createAccount, requestPasswordReset, signOutUser])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
