export interface Env {
  SUPABASE_URL: string
  SUPABASE_ANON_KEY: string
  ALLOWED_ORIGIN: string
}

type OutputType = 'video' | 'image' | 'audio'
type Style = 'Cinematic' | 'Dreamy' | 'Luxury' | 'Romantic' | 'Ethereal'
type Mood = 'Peaceful' | 'Confident' | 'Excited' | 'Loved' | 'Abundant'
type Presence = 'environment' | 'pov' | 'self'

type CreateGenerationBody = {
  wish_id: string
  output_type: OutputType
  style: Style
  mood: Mood
  presence: Presence
  creative_brief: Record<string, unknown>
  idempotency_key: string
}

const jsonHeaders = { 'Content-Type': 'application/json; charset=utf-8' }
const outputs: OutputType[] = ['video', 'image', 'audio']
const styles: Style[] = ['Cinematic', 'Dreamy', 'Luxury', 'Romantic', 'Ethereal']
const moods: Mood[] = ['Peaceful', 'Confident', 'Excited', 'Loved', 'Abundant']
const presences: Presence[] = ['environment', 'pov', 'self']

function response(request: Request, env: Env, body: unknown, status = 200) {
  const origin = request.headers.get('Origin')
  const allowedOrigin = origin === env.ALLOWED_ORIGIN ? origin : 'null'
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...jsonHeaders,
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type, Idempotency-Key',
      'Vary': 'Origin',
      'Cache-Control': 'no-store',
    },
  })
}

function bearer(request: Request) {
  const value = request.headers.get('Authorization') || ''
  return value.startsWith('Bearer ') ? value.slice(7) : ''
}

async function supabase<T>(
  env: Env,
  path: string,
  token: string,
  init: RequestInit = {},
): Promise<{ ok: boolean; status: number; data: T | null }> {
  const base = env.SUPABASE_URL.replace(/\/$/, '')
  const result = await fetch(`${base}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: env.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  })
  const data = await result.json().catch(() => null) as T | null
  return { ok: result.ok, status: result.status, data }
}

async function authenticate(env: Env, token: string) {
  if (!token) return null
  const result = await fetch(`${env.SUPABASE_URL.replace(/\/$/, '')}/auth/v1/user`, {
    headers: {
      apikey: env.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`,
    },
  })
  if (!result.ok) return null
  const user = await result.json() as { id?: string }
  return user.id ? user : null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function validBody(value: unknown): value is CreateGenerationBody {
  if (!isRecord(value)) return false
  return typeof value.wish_id === 'string'
    && /^[0-9a-f-]{36}$/i.test(value.wish_id)
    && outputs.includes(value.output_type as OutputType)
    && styles.includes(value.style as Style)
    && moods.includes(value.mood as Mood)
    && presences.includes(value.presence as Presence)
    && isRecord(value.creative_brief)
    && value.creative_brief.schemaVersion === '1.0'
    && typeof value.idempotency_key === 'string'
    && value.idempotency_key.length >= 8
    && value.idempotency_key.length <= 128
}

async function handle(request: Request, env: Env): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': request.headers.get('Origin') === env.ALLOWED_ORIGIN ? env.ALLOWED_ORIGIN : 'null',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type, Idempotency-Key',
        'Vary': 'Origin',
      },
    })
  }

  const url = new URL(request.url)
  const token = bearer(request)
  if (!token) return response(request, env, { error: 'unauthorized', message: 'Sign in to create or view a generation.' }, 401)

  const user = await authenticate(env, token)
  if (!user) return response(request, env, { error: 'unauthorized', message: 'Your session is invalid or expired.' }, 401)

  if (request.method === 'POST' && url.pathname === '/api/generations') {
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return response(request, env, { error: 'invalid_json', message: 'Request body must be valid JSON.' }, 400)
    }
    if (!validBody(body)) {
      return response(request, env, { error: 'invalid_request', message: 'Generation input is incomplete or invalid.' }, 400)
    }

    const wish = await supabase<{ id: string }[]>(env,
      `wishes?id=eq.${encodeURIComponent(body.wish_id)}&select=id&limit=1`, token)
    if (!wish.ok) return response(request, env, { error: 'database_error', message: 'Could not verify the Wish.' }, 502)
    if (!wish.data?.length) return response(request, env, { error: 'wish_not_found', message: 'This Wish does not exist in your space.' }, 404)

    const inputSnapshot = {
      wish_id: body.wish_id,
      output_type: body.output_type,
      style: body.style,
      mood: body.mood,
      presence: body.presence,
    }
    const created = await supabase<Record<string, unknown>[]>(env, 'generations?select=*', token, {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({
        wish_id: body.wish_id,
        output_type: body.output_type,
        status: 'pending',
        style: body.style,
        mood: body.mood,
        presence: body.presence,
        input_snapshot: inputSnapshot,
        creative_brief: body.creative_brief,
        idempotency_key: body.idempotency_key,
      }),
    })

    if (created.ok && created.data?.[0]) {
      return response(request, env, { generation: created.data[0], accepted: true }, 202)
    }

    // A repeated idempotency key returns the original task rather than creating a duplicate.
    if (created.status === 409 || (created.ok && !created.data?.length)) {
      const existing = await supabase<Record<string, unknown>[]>(env,
        `generations? idempotency_key=eq.${encodeURIComponent(body.idempotency_key)}&select=*&limit=1`.replace('? ', '?'), token)
      if (existing.ok && existing.data?.[0]) {
        return response(request, env, { generation: existing.data[0], accepted: true, reused: true }, 200)
      }
    }

    return response(request, env, { error: 'generation_create_failed', message: 'The generation task could not be saved.' }, created.status >= 400 ? created.status : 502)
  }

  const match = url.pathname.match(/^\/api\/generations\/([0-9a-f-]{36})$/i)
  if (request.method === 'GET' && match) {
    const result = await supabase<Record<string, unknown>[]>(env,
      `generations?id=eq.${encodeURIComponent(match[1])}&select=*&limit=1`, token)
    if (!result.ok) return response(request, env, { error: 'database_error', message: 'Could not load this generation.' }, 502)
    if (!result.data?.length) return response(request, env, { error: 'generation_not_found', message: 'This generation does not exist in your space.' }, 404)
    return response(request, env, { generation: result.data[0] })
  }

  return response(request, env, { error: 'not_found', message: 'Route not found.' }, 404)
}

export default {
  fetch(request: Request, env: Env): Promise<Response> {
    return handle(request, env)
  },
}
