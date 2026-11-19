import type { AuthSession } from './supabase'
import { categories, interpret, type Category, type Generation, type Mood, type OutputType, type Presence, type Style, type Wish } from '../domain'
import type { CreativeBrief } from '../creative/types'
const apiUrl = import.meta.env.VITE_MANIFEST_API_URL?.replace(/\/$/, '')
type RemoteWish = { id: string; title: string; description: string; category: string; created_at: string; updated_at: string }
type RemoteGeneration = { id: string; wish_id: string; output_type: string; status: string; style: string | null; mood: string | null; presence: string | null; creative_brief?: CreativeBrief; created_at: string; completed_at?: string | null; error_message?: string | null }
type RemoteSpace = { wishes: RemoteWish[]; generations: RemoteGeneration[]; favorites: { generation_id: string }[] }
function requireApiUrl() {
  if (!apiUrl) throw new Error('The Manifest API is not configured yet. Add VITE_MANIFEST_API_URL and try again.')
  return apiUrl
}
async function apiRequest<T>(session: AuthSession, path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${requireApiUrl()}${path}`, { ...init, headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json', ...(init.headers || {}) } })
  const payload = await response.json().catch(() => ({})) as T & { message?: string; error?: string }
  if (!response.ok) throw new Error(payload.message || payload.error || 'The request could not be completed.')
  return payload
}
function isCategory(v: string): v is Category { return categories.includes(v as Category) }
function isStyle(v: string | null): v is Style { return v === 'Cinematic' || v === 'Dreamy' || v === 'Luxury' || v === 'Romantic' || v === 'Ethereal' }
function isMood(v: string | null): v is Mood { return v === 'Peaceful' || v === 'Confident' || v === 'Excited' || v === 'Loved' || v === 'Abundant' }
function isPresence(v: string | null): v is Presence { return v === 'environment' || v === 'pov' || v === 'self' }
function isOutput(v: string): v is OutputType { return v === 'video' || v === 'image' || v === 'audio' }
export async function loadRemoteSpace(session: AuthSession) {
  const data = await apiRequest<RemoteSpace>(session, '/api/space')
  const wishes: Wish[] = data.wishes.map((x) => ({ id: x.id, title: x.title, description: x.description, category: isCategory(x.category) ? x.category : 'Other', status: 'active', createdAt: x.created_at, updatedAt: x.updated_at }))
  const byId = new Map(wishes.map((x) => [x.id, x]))
  const kept = new Set(data.favorites.map((x) => x.generation_id))
  const generations: Generation[] = data.generations.flatMap((x) => {
    const wish = byId.get(x.wish_id)
    if (!wish || !isOutput(x.output_type)) return []
    const style: Style = isStyle(x.style) ? x.style : 'Dreamy'
    const mood: Mood = isMood(x.mood) ? x.mood : 'Peaceful'
    const presence: Presence = isPresence(x.presence) ? x.presence : 'environment'
    return [{ id: x.id, wishId: x.wish_id, outputType: x.output_type, status: x.status === 'completed' || x.status === 'failed' || x.status === 'processing' ? x.status : 'pending', style, mood, presence, concept: interpret({ title: wish.title, description: wish.description, category: wish.category, style, mood }), creativeBrief: x.creative_brief, favorite: kept.has(x.id), createdAt: x.created_at, completedAt: x.completed_at ?? undefined, errorMessage: x.error_message ?? undefined }]
  })
  return { wishes, generations }
}
export async function createRemoteWish(session: AuthSession, wish: { title: string; description: string; category: Category }) {
  return (await apiRequest<{ wish: { id: string } }>(session, '/api/wishes', { method: 'POST', body: JSON.stringify(wish) })).wish
}
export async function updateRemoteWish(session: AuthSession, id: string, wish: { title: string; description: string; category: Category }) {
  await apiRequest<{ wish: RemoteWish }>(session, `/api/wishes/${id}`, { method: 'PATCH', body: JSON.stringify(wish) })
}
export async function deleteRemoteWish(session: AuthSession, id: string) {
  await apiRequest<{ deleted: boolean }>(session, `/api/wishes/${id}`, { method: 'DELETE' })
}
export async function setRemoteFavorite(session: AuthSession, id: string, favorite: boolean) {
  await apiRequest<{ favorite: boolean }>(session, `/api/favorites/${id}`, { method: favorite ? 'POST' : 'DELETE' })
}
export async function refreshRemoteGeneration(session: AuthSession, id: string) {\n  return (await apiRequest<{ generation: { id: string; status: Generation['status']; error_message?: string | null } }>(session, '/api/generations/' + id)).generation\n}\nexport async function fetchRemoteGenerationImage(session: AuthSession, id: string) {\n  const response = await fetch(requireApiUrl() + '/api/generations/' + id + '/media', { headers: { Authorization: 'Bearer ' + session.access_token } })\n  if (!response.ok) throw new Error('The generated image is not ready yet.')\n  return URL.createObjectURL(await response.blob())\n}\nexport async function createRemoteGeneration(session: AuthSession, input: { wishId: string; outputType: OutputType; style: Style; mood: Mood; presence: Presence; creativeBrief: CreativeBrief }) {
  const key = crypto.randomUUID()
  const result = await apiRequest<{ generation: { id: string; wish_id: string; status: Generation['status'] } }>(session, '/api/generations', { method: 'POST', headers: { 'Idempotency-Key': key }, body: JSON.stringify({ wish_id: input.wishId, output_type: input.outputType, style: input.style, mood: input.mood, presence: input.presence, creative_brief: input.creativeBrief, idempotency_key: key }) })
  return result.generation
}
