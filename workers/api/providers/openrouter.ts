export interface OpenRouterImageResult {
  bytes: ArrayBuffer
  mimeType: 'image/png' | 'image/jpeg' | 'image/webp'
  model: string
  cost?: number
}

export function buildImagePrompt(brief: Record<string, unknown>): string {
  const record = (value: unknown): Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value)
      ? value as Record<string, unknown>
      : {}
  const wish = record(brief.wish)
  const scene = record(brief.scene)
  const visual = record(brief.visualDirection)
  const emotion = record(brief.emotionalDirection)
  const subject = record(brief.subject)
  const palette = record(visual.palette)
  return [
    `Create a highly polished, emotionally resonant manifestation vision based on this wish: ${String(wish.title || '')}.`,
    String(wish.description || ''),
    `Scene: ${String(scene.setting || '')}. ${String(scene.narrative || '')}`,
    `Emotional direction: ${String(emotion.primaryMood || '')}; ${(Array.isArray(emotion.keywords) ? emotion.keywords : []).join(', ')}.`,
    `Visual style: ${String(visual.style || '')}. Palette: ${String(palette.a || '')}, ${String(palette.b || '')}, ${String(palette.c || '')}.`,
    `Composition: ${String(visual.composition || '')}. Camera: ${String(visual.camera || '')}. Lighting: ${String(visual.lighting || '')}.`,
    `Subject direction: ${String(subject.direction || '')}.`,
    `Affirmation and emotional subtext: ${String(brief.affirmation || '')}.`,
    'Create a coherent, premium editorial image with intentional art direction, natural anatomy, refined composition, beautiful lighting, and realistic material detail. No text, captions, watermarks, borders, or UI.',
  ].filter(Boolean).join('\n\n').slice(0, 12000)
}

export async function generateOpenRouterImage(
  apiKey: string,
  model: string,
  prompt: string,
  referer: string,
): Promise<OpenRouterImageResult> {
  const response = await fetch('https://openrouter.ai/api/v1/images', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': referer,
      'X-Title': 'Manifest',
    },
    body: JSON.stringify({ model, prompt, n: 1 }),
    signal: AbortSignal.timeout(110000),
  })
  if (!response.ok) {
    const detail = (await response.text()).slice(0, 1200)
    throw new Error(`OpenRouter returned ${response.status}: ${detail}`)
  }
  const payload = await response.json() as {
    data?: { b64_json?: string; media_type?: string }[]
    usage?: { cost?: number }
  }
  const image = payload.data?.[0]
  if (!image?.b64_json) throw new Error('OpenRouter response did not contain image data.')
  const mimeType = image.media_type || 'image/png'
  if (mimeType !== 'image/png' && mimeType !== 'image/jpeg' && mimeType !== 'image/webp') {
    throw new Error('OpenRouter returned an unsupported image format.')
  }
  const binary = atob(image.b64_json)
  if (binary.length > 20 * 1024 * 1024) throw new Error('Generated image exceeds the 20 MB storage limit.')
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index)
  return { bytes: bytes.buffer, mimeType, model, cost: payload.usage?.cost }
}
