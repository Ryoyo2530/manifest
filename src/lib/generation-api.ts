import type { AuthSession } from './supabase'
import type { Category, OutputType, Style, Mood, Presence } from '../domain'
import type { CreativeBrief } from '../creative/types'

const apiUrl = import.meta.env.VITE_MANIFEST_API_URL?.replace(/\/$/, '')

type RemoteWish = { id: string }
type RemoteGeneration = { id: string; wish_id: string; status: 'pending' | 'processing' | 'completed' | 'failed' }

function requireApiUrl() {
  if (!apiUrl) throw new Error('The Manifest API is not configured yet. Add VITE_MANIFEST_API_URL and try again.')
  return apiUrl
}

async function apiRequest<T>(session: AuthSession, path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${requireApiUrl()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  })
  const payload = await response.json().catch(() => ({})) as T & { message?: string; error?: string }
  if (!response.ok) throw new Error(payload.message || payload.error || 'The request could not be completed.')
  return payload
}

export async function createRemoteWish(session: AuthSession, wish: { title: string; description: string; category: Category }) {
  const result = await apiRequest<{ wish: RemoteWish }>(session, '/api/wishes', {
    method: 'POST', body: JSON.stringify(wish),
  })
  return result.wish
}

export async function createRemoteGeneration(session: AuthSession, input: {
  wishId: string; outputType: OutputType; style: Style; mood: Mood; presence: Presence; creativeBrief: CreativeBrief
}) {
  const idempotencyKey = crypto.randomUUID()
  const result = await apiRequest<{ generation: RemoteGeneration }>(session, '/api/generations', {
    method: 'POST',
    headers: { 'Idempotency-Key': idempotencyKey },
    body: JSON.stringify({
      wish_id: input.wishId, output_type: input.outputType, style: input.style,
      mood: input.mood, presence: input.presence, creative_brief: input.creativeBrief,
      idempotency_key: idempotencyKey,
    }),
  })
  return result.generation
}
