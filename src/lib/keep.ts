import type { Concept, OutputType } from '../domain'

function wrap(ctx: CanvasRenderingContext2D, text: string, max: number) {
  const words = text.split(' ')
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const next = line ? `${line} ${word}` : word
    if (ctx.measureText(next).width > max && line) {
      lines.push(line)
      line = word
    } else {
      line = next
    }
  }
  if (line) lines.push(line)
  return lines
}

function slug(title: string) {
  const safe = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return safe || 'manifestation'
}

/** A keepsake image. Real media replaces this; the gesture of keeping stays. */
export async function downloadKeepsake(concept: Concept, format: OutputType) {
  await document.fonts.ready
  const canvas = document.createElement('canvas')
  canvas.width = 1080
  canvas.height = 1920
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const { palette } = concept
  const wash = ctx.createLinearGradient(0, 0, 1080, 1920)
  wash.addColorStop(0, palette.a)
  wash.addColorStop(0.55, palette.b)
  wash.addColorStop(1, palette.c)
  ctx.fillStyle = wash
  ctx.fillRect(0, 0, 1080, 1920)

  ctx.strokeStyle = palette.ink
  ctx.globalAlpha = 0.45
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(540, 760, 280, 0, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(540, 760, 200, 0, Math.PI * 2)
  ctx.stroke()
  ctx.globalAlpha = 1

  ctx.fillStyle = palette.ink
  ctx.textAlign = 'center'
  ctx.font = '500 28px "DM Sans", sans-serif'
  ctx.fillText('MANIFEST', 540, 220)
  ctx.font = '500 26px "DM Sans", sans-serif'
  ctx.globalAlpha = 0.7
  ctx.fillText(format.toUpperCase(), 540, 270)
  ctx.globalAlpha = 1

  ctx.font = '600 72px "Cormorant Garamond", Georgia, serif'
  const titleLines = wrap(ctx, concept.title, 820)
  titleLines.forEach((line, index) => {
    ctx.fillText(line, 540, 1180 + index * 84)
  })

  ctx.font = 'italic 500 46px "Cormorant Garamond", Georgia, serif'
  const words = wrap(ctx, concept.affirmation, 780)
  const start = 1180 + titleLines.length * 84 + 70
  words.forEach((line, index) => {
    ctx.fillText(line, 540, start + index * 64)
  })

  const link = document.createElement('a')
  link.href = canvas.toDataURL('image/png')
  link.download = `${slug(concept.title)}.png`
  link.click()
}

export async function sharePiece(concept: Concept) {
  const text = `${concept.affirmation}\n\n— ${concept.title}`
  if (navigator.share) {
    await navigator.share({ title: concept.title, text })
    return 'shared' as const
  }
  await navigator.clipboard.writeText(text)
  return 'copied' as const
}
