import { interpret } from '../domain'
import type { CreativeBrief, CreativeBriefInput } from './types'

const moodKeywords: Record<CreativeBriefInput['mood'], string[]> = {
  Peaceful: ['calm', 'ease', 'stillness'],
  Confident: ['self-trust', 'clarity', 'quiet strength'],
  Excited: ['possibility', 'anticipation', 'momentum'],
  Loved: ['belonging', 'tenderness', 'connection'],
  Abundant: ['openness', 'freedom', 'enoughness'],
}

const presenceDirections: Record<CreativeBriefInput['presence'], string> = {
  environment: 'Show the place and its atmosphere without depicting the user.',
  pov: 'Use a first-person point of view, as if the user is present behind the camera.',
  self: 'Leave a natural, believable place for the user to appear; do not invent their likeness.',
}

export function buildPreviewCreativeBrief(input: CreativeBriefInput): CreativeBrief {
  const concept = interpret({
    description: input.wish.description,
    category: input.wish.category,
    style: input.style,
    mood: input.mood,
    title: input.wish.title,
  })

  const aspectRatio = input.outputType === 'video' ? '9:16' : '4:5'
  const targetDurationSeconds = input.outputType === 'video' ? 15 : null

  return {
    schemaVersion: '1.0',
    source: 'template-preview',
    wish: { ...input.wish },
    intent: {
      statement: input.wish.description,
      desiredOutcome: `Create a personal visualization of “${input.wish.title}” that feels emotionally true to the wish.`,
    },
    emotionalDirection: {
      primaryMood: input.mood,
      keywords: moodKeywords[input.mood],
    },
    scene: {
      setting: concept.scene,
      narrative: `A visual moment inspired by this specific wish: ${input.wish.description}`,
    },
    subject: {
      presence: input.presence,
      direction: presenceDirections[input.presence],
    },
    visualDirection: {
      style: input.style,
      palette: concept.palette,
      composition: 'A clear focal subject, intentional negative space, and an editorial composition.',
      camera: input.outputType === 'video'
        ? 'A composed cinematic frame with restrained, stable camera movement.'
        : 'A considered still frame with a natural perspective.',
      lighting: concept.atmosphere,
      motion: input.outputType === 'video'
        ? 'Subtle environmental movement; avoid abrupt cuts and exaggerated motion.'
        : 'No motion required.',
    },
    affirmation: concept.affirmation,
    output: {
      type: input.outputType,
      aspectRatio,
      targetDurationSeconds,
    },
    constraints: {
      preserve: [
        'Keep the user’s original wish as the source of truth.',
        'Prioritize emotional resonance over generic motivational imagery.',
        'Do not imply that visualization guarantees real-world outcomes.',
      ],
      avoid: [
        'Generic stock-photo compositions.',
        'Unrequested people, relationships, locations, or luxury objects.',
        'Text rendered inside the generated image or video.',
      ],
    },
  }
}
