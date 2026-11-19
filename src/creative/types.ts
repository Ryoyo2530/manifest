import type { Category, Mood, OutputType, Presence, Style } from '../domain'

export type CreativeBrief = {
  schemaVersion: '1.0'
  source: 'template-preview'
  wish: {
    title: string
    description: string
    category: Category
  }
  intent: {
    statement: string
    desiredOutcome: string
  }
  emotionalDirection: {
    primaryMood: Mood
    keywords: string[]
  }
  scene: {
    setting: string
    narrative: string
  }
  subject: {
    presence: Presence
    direction: string
  }
  visualDirection: {
    style: Style
    palette: { a: string; b: string; c: string; ink: string }
    composition: string
    camera: string
    lighting: string
    motion: string
  }
  affirmation: string
  output: {
    type: OutputType
    aspectRatio: string
    targetDurationSeconds: number | null
  }
  constraints: {
    preserve: string[]
    avoid: string[]
  }
}

export type CreativeBriefInput = {
  wish: {
    title: string
    description: string
    category: Category
  }
  outputType: OutputType
  style: Style
  mood: Mood
  presence: Presence
}
