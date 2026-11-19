const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '')
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const storageKey = 'manifest.supabase.session'

export type AuthUser = {
  id: string
  email?: string
  user_metadata?: { display_name?: string }
}

export type AuthSession = {
  access_token: string
  refresh_token: string
  expires_at?: number
  expires_in?: number
  token_type: string
  user: AuthUser
}

type AuthResponse = Partial<AuthSession> & { user?: AuthUser; msg?: string; message?: string; error_description?: string }

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

function requireConfig() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase is not configured. Add the public project URL and anon key to your environment.')
  }
  return { url: supabaseUrl, key: supabaseAnonKey }
}

export function clearStoredSession() {
  if (typeof window !== 'undefined') window.localStorage.removeItem(storageKey)
}

function saveSession(session: AuthSession | null) {
  if (typeof window === 'undefined') return
  if (session) window.localStorage.setItem(storageKey, JSON.stringify(session))
  else clearStoredSession()
}

export function readSession(): AuthSession | null {
  try {
    const raw = window.localStorage.getItem(storageKey)
    return raw ? (JSON.parse(raw) as AuthSession) : null
  } catch {
    clearStoredSession()
    return null
  }
}

async function request<T>(path: string, body?: Record<string, unknown>, token?: string): Promise<T> {
  const { url, key } = requireConfig()
  const response = await fetch(`${url}/auth/v1/${path}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: {
      apikey: key,
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  })
  const payload = (await response.json().catch(() => ({}))) as AuthResponse
  if (!response.ok) {
    throw new Error(payload.msg || payload.message || payload.error_description || 'Authentication request failed.')
  }
  return payload as T
}

function normalizeSession(payload: Partial<AuthSession>): AuthSession | null {
  if (!payload.access_token || !payload.refresh_token || !payload.user) return null
  return {
    access_token: payload.access_token,
    refresh_token: payload.refresh_token,
    token_type: payload.token_type || 'bearer',
    expires_in: payload.expires_in,
    expires_at: payload.expires_at || (payload.expires_in ? Math.floor(Date.now() / 1000) + payload.expires_in : undefined),
    user: payload.user,
  }
}

export async function signIn(email: string, password: string) {
  const payload = await request<AuthResponse>('token?grant_type=password', { email, password })
  const session = normalizeSession(payload)
  if (!session) throw new Error('Sign-in succeeded but no session was returned. Check your email confirmation settings.')
  saveSession(session)
  return session
}

export async function signUp(email: string, password: string, displayName: string) {
  const payload = await request<AuthResponse>('signup', {
    email,
    password,
    data: { display_name: displayName },
  })
  const session = normalizeSession(payload)
  if (session) saveSession(session)
  return { session, needsEmailConfirmation: !session && Boolean(payload.user) }
}

export async function sendPasswordReset(email: string) {
  await request('recover', { email })
}

export async function refreshSession(session: AuthSession) {
  const payload = await request<AuthResponse>('token?grant_type=refresh_token', {
    refresh_token: session.refresh_token,
  })
  const next = normalizeSession(payload)
  if (!next) throw new Error('Your session could not be refreshed. Please sign in again.')
  saveSession(next)
  return next
}

export async function signOut(session: AuthSession | null) {
  if (session) {
    try {
      await request('logout', {}, session.access_token)
    } finally {
      saveSession(null)
    }
  } else {
    saveSession(null)
  }
}
