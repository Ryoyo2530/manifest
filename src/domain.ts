/**
 * The creative grammar of Manifest.
 *
 * Wish → intent → feeling → concept → the piece the person keeps.
 * `interpret` is the seam. A model can replace its body later;
 * the rest of the space should keep speaking in concepts, not prompts.
 *
 * Daily Manifest can later follow a wish. No extra fields until that ritual exists.
 */

import type { CreativeBrief } from './creative/types'

export const categories = [
  'Wealth & Abundance',
  'Love & Relationships',
  'Career & Success',
  'Health & Wellbeing',
  'Dream Lifestyle',
  'Travel & Adventure',
  'Self-Growth',
  'Other',
] as const

export type Category = (typeof categories)[number]

export const styles = ['Cinematic', 'Dreamy', 'Luxury', 'Romantic', 'Ethereal'] as const
export type Style = (typeof styles)[number]

export const moods = ['Peaceful', 'Confident', 'Excited', 'Loved', 'Abundant'] as const
export type Mood = (typeof moods)[number]

export const presences = [
  { id: 'environment', label: 'Only the place' },
  { id: 'pov', label: 'Through my eyes' },
  { id: 'self', label: 'Include me' },
] as const

export type Presence = (typeof presences)[number]['id']

export const formats = [
  { id: 'video', label: 'Video', hint: 'A short vision to stay inside.' },
  { id: 'image', label: 'Image', hint: 'A single scene to return to.' },
  { id: 'audio', label: 'Audio', hint: 'An affirmation to hear again.' },
] as const

export type OutputType = (typeof formats)[number]['id']

export type GenerationStatus = 'pending' | 'processing' | 'completed' | 'failed'

export type Palette = {
  a: string
  b: string
  c: string
  ink: string
}

export type Concept = {
  title: string
  scene: string
  atmosphere: string
  tone: Mood
  affirmation: string
  palette: Palette
}

export type Wish = {
  id: string
  title: string
  description: string
  category: Category
  status: 'active'
  createdAt: string
  updatedAt: string
}

export type Generation = {
  id: string
  wishId: string
  outputType: OutputType
  status: GenerationStatus
  style: Style
  mood: Mood
  presence: Presence
  concept: Concept
  /** Versioned, provider-neutral interpretation captured when this generation was created. */
  creativeBrief?: CreativeBrief
  favorite: boolean
  createdAt: string
  completedAt?: string
  errorMessage?: string
}

export type Profile = {
  displayName: string
  language: 'en'
  timezone: string
}

export const examples: { title: string; description: string; category: Category }[] = [
  {
    title: 'A quiet life in Paris',
    description:
      'I want to live in a beautiful apartment in Paris, with a peaceful and luxurious life.',
    category: 'Dream Lifestyle',
  },
  {
    title: 'Financially free',
    description: 'I want to become financially independent and live with a sense of ease.',
    category: 'Wealth & Abundance',
  },
  {
    title: 'A love that understands',
    description: 'I want to meet someone who truly loves and understands me.',
    category: 'Love & Relationships',
  },
]

const palettes: Record<Category, Palette> = {
  'Wealth & Abundance': { a: '#F3E6C8', b: '#C6A15B', c: '#E7C9B4', ink: '#463344' },
  'Love & Relationships': { a: '#F6E4E0', b: '#E8C4C2', c: '#C6A15B', ink: '#463344' },
  'Career & Success': { a: '#5C4454', b: '#463344', c: '#C6A15B', ink: '#F7F1E8' },
  'Health & Wellbeing': { a: '#F7F1E8', b: '#E4D8C4', c: '#C5B9D9', ink: '#382F35' },
  'Dream Lifestyle': { a: '#F6E7EA', b: '#E8C4C2', c: '#C5B9D9', ink: '#463344' },
  'Travel & Adventure': { a: '#D9D0E8', b: '#8E82A8', c: '#E9D9B5', ink: '#2C2430' },
  'Self-Growth': { a: '#E7E0F0', b: '#C5B9D9', c: '#E9D9B5', ink: '#382F35' },
  Other: { a: '#F7F1E8', b: '#E9D9B5', c: '#E8C4C2', ink: '#382F35' },
}

const scenes: Record<Category, string> = {
  'Wealth & Abundance':
    'A quiet room of warm stone and late light. A table set for no one in particular, the city soft beyond the glass.',
  'Love & Relationships':
    'Two cups on a windowsill. A street just after rain. A hand resting near another, with nowhere else to be.',
  'Career & Success':
    'A long table, papers in a beautiful order, and a window onto work that actually matters.',
  'Health & Wellbeing':
    'Morning light on linen. A glass of water. The body easy in its own rhythm.',
  'Dream Lifestyle':
    'An apartment above a city you love. Curtains lifting. The afternoon entirely yours.',
  'Travel & Adventure':
    'A train window, an unfamiliar coast, a bag light enough to say yes.',
  'Self-Growth':
    'A mirror in kind light. A journal left open. The self arriving without being asked to hurry.',
  Other: 'A softly lit threshold, with room enough for whatever you are wishing toward.',
}

const atmospheres: Record<Category, string> = {
  'Wealth & Abundance': 'Champagne gold, pearl highlights, wealth that does not rush.',
  'Love & Relationships': 'Blush, candle warmth, the feeling of being chosen.',
  'Career & Success': 'Deep plum and gold. Poised, clear, luminous.',
  'Health & Wellbeing': 'Ivory and pale light. Breath, and enough stillness.',
  'Dream Lifestyle': 'Ivory, blush, and a thin line of gold.',
  'Travel & Adventure': 'Lavender dusk, salt air, an open horizon.',
  'Self-Growth': 'Soft lavender, warm ivory, a halo of quiet confidence.',
  Other: 'Champagne and dusk, held open.',
}

const affirmations: Record<Category, string> = {
  'Wealth & Abundance': 'I am at home in a life of ease, plenty, and open possibility.',
  'Love & Relationships': 'I am worthy of a love that feels safe, genuine, and beautiful.',
  'Career & Success': 'I move through my work with clarity, courage, and quiet authority.',
  'Health & Wellbeing': 'I am well. I am steady. My days have room to breathe.',
  'Dream Lifestyle': 'The life I imagine is already taking its place around me.',
  'Travel & Adventure': 'I am free to go, and free to be changed by what I find.',
  'Self-Growth': 'I am becoming someone I can trust, one true day at a time.',
  Other: 'What I long for has a place here, and so do I.',
}

const styleLine: Record<Style, string> = {
  Cinematic: 'Filmic light, a wide and steady frame.',
  Dreamy: 'Soft focus, as if remembered rather than recorded.',
  Luxury: 'Polished materials, nothing hurried.',
  Romantic: 'Close, warm, and a little rose-colored.',
  Ethereal: 'A halo of light, almost weightless.',
}

const defaultTitles: Record<Category, string> = {
  'Love & Connection': 'A love that feels like home',
  'Career & Abundance': 'A life of possibility',
  'Wellbeing & Growth': 'Becoming more myself',
  'Lifestyle & Adventure': 'The life I keep imagining',
  Other: 'What I am wishing for',
}

const categoryHints: [RegExp, Category][] = [
  [/love|relationship|partner|husband|wife|soulmate|marry|connection/i, 'Love & Connection'],
  [/career|job|business|success|successful|work|money|wealth|financial|abundant|income|luxury|luxurious/i, 'Career & Abundance'],
  [/health|healthy|energy|body|calm|peace|heal|confident|confidence|grow|growth|become|myself|self-love|self love/i, 'Wellbeing & Growth'],
  [/travel|journey|abroad|around the world|flight|paris|apartment|lifestyle|live in|adventure/i, 'Lifestyle & Adventure'],
]

const dayLines = [
  'What you return to becomes familiar.',
  'A wish grows clearer each time you look at it.',
  'You do not have to rush the life you are imagining.',
  'Stay with the feeling a moment longer than is comfortable.',
]

export function lineForToday() {
  const start = new Date(new Date().getFullYear(), 0, 0).getTime()
  const day = Math.floor((Date.now() - start) / 86_400_000)
  return dayLines[day % dayLines.length]
}

export function guessCategory(description: string): Category {
  const found = categoryHints.find(([pattern]) => pattern.test(description))
  return found?.[1] ?? 'Other'
}

export function suggestTitle(description: string, category: Category) {
  const cleaned = description
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/^(i want to|i wish to|i long to|i hope to)\s+/i, '')
    .replace(/[.。]$/, '')

  if (!cleaned || cleaned.length > 42) return defaultTitles[category]
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
}

export function interpret(input: {
  description: string
  category: Category
  style: Style
  mood: Mood
  title?: string
}): Concept {
  const title = input.title?.trim() || suggestTitle(input.description, input.category)
  return {
    title,
    scene: scenes[input.category],
    atmosphere: `${atmospheres[input.category]} ${styleLine[input.style]}`,
    tone: input.mood,
    affirmation: affirmations[input.category],
    palette: palettes[input.category],
  }
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function uid() {
  return crypto.randomUUID()
}
