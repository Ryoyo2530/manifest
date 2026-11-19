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
  'Love & Connection',
  'Career & Abundance',
  'Wellbeing & Growth',
  'Lifestyle & Adventure',
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
    category: 'Lifestyle & Adventure',
  },
  {
    title: 'Financially free',
    description: 'I want to become financially independent and live with a sense of ease.',
    category: 'Career & Abundance',
  },
  {
    title: 'A love that understands',
    description: 'I want to meet someone who truly loves and understands me.',
    category: 'Love & Connection',
  },
]

const palettes: Record<Category, Palette> = {
  'Love & Connection': { a: '#F6E4E0', b: '#E8C4C2', c: '#C6A15B', ink: '#463344' },
  'Career & Abundance': { a: '#F3E6C8', b: '#C6A15B', c: '#5C4454', ink: '#463344' },
  'Wellbeing & Growth': { a: '#F7F1E8', b: '#E4D8C4', c: '#C5B9D9', ink: '#382F35' },
  'Lifestyle & Adventure': { a: '#D9D0E8', b: '#C5B9D9', c: '#E9D9B5', ink: '#2C2430' },
  Other: { a: '#F7F1E8', b: '#E9D9B5', c: '#E8C4C2', ink: '#382F35' },
}

const scenes: Record<Category, string> = {
  'Love & Connection': 'A shared quiet moment: two cups on a windowsill, a street just after rain, and nowhere else to be.',
  'Career & Abundance': 'A beautiful, considered space with room to create, contribute, and live with ease.',
  'Wellbeing & Growth': 'Morning light on linen. A glass of water. The body easy in its own rhythm.',
  'Lifestyle & Adventure': 'An open horizon: a home or destination that feels unmistakably yours.',
  Other: 'A softly lit threshold, with room enough for whatever you are wishing toward.',
}

const atmospheres: Record<Category, string> = {
  'Love & Connection': 'Blush, candle warmth, the feeling of being seen and chosen.',
  'Career & Abundance': 'Champagne gold, deep plum, and a sense of possibility without hurry.',
  'Wellbeing & Growth': 'Ivory and pale light. Breath, self-trust, and enough stillness.',
  'Lifestyle & Adventure': 'Lavender dusk, warm ivory, and an open horizon.',
  Other: 'Champagne and dusk, held open.',
}

const affirmations: Record<Category, string> = {
  'Love & Connection': 'I am worthy of connection that feels safe, genuine, and beautiful.',
  'Career & Abundance': 'I move toward meaningful work and a life with room to flourish.',
  'Wellbeing & Growth': 'I am becoming someone I can trust, one true day at a time.',
  'Lifestyle & Adventure': 'I am open to a life that feels expansive, meaningful, and my own.',
  Other: 'What I long for has a place here, and so do I.',
}

const styleLine:const styleLine: Record<Style, string> = {
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

const dayLines =const dayLines = [
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

export function normalizeCategory(value: string): Category {
  if (categories.includes(value as Category)) return value as Category
  switch (value) {
    case 'Wealth & Abundance':
    case 'Career & Success':
      return 'Career & Abundance'
    case 'Love & Relationships':
      return 'Love & Connection'
    case 'Health & Wellbeing':
    case 'Self-Growth':
      return 'Wellbeing & Growth'
    case 'Dream Lifestyle':
    case 'Travel & Adventure':
      return 'Lifestyle & Adventure'
    default:
      return 'Other'
  }
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
