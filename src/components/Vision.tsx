import type { OutputType, Palette } from '../domain'
import { Halo } from './Halo'

export function Vision({
  palette,
  format = 'image',
  caption,
  affirmation,
  revealed = false,
  onReveal,
}: {
  palette: Palette
  format?: OutputType
  caption?: string
  affirmation?: string
  revealed?: boolean
  onReveal?: () => void
}) {
  const showWords = format === 'audio' || revealed
  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{
        background: `radial-gradient(120% 90% at 50% 18%, ${palette.a}, ${palette.b} 58%, ${palette.c})`,
        color: palette.ink,
      }}
    >
      <Halo className={`absolute left-1/2 top-[36%] w-[78%] -translate-x-1/2 -translate-y-1/2 ${format === 'audio' ? 'drift' : ''}`} />
      {format !== 'image' && onReveal && !revealed && (
        <button
          type="button"
          onClick={onReveal}
          className="absolute left-1/2 top-[36%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-current/40 px-5 py-2 text-xs uppercase tracking-[0.18em]"
        >
          {format === 'video' ? 'Play' : 'Listen'}
        </button>
      )}
      {showWords && affirmation && (
        <p className="absolute inset-x-6 bottom-16 text-center font-serif text-xl italic leading-snug md:text-2xl">
          {affirmation}
        </p>
      )}
      {caption && (
        <p className="absolute inset-x-5 bottom-5 text-center font-serif text-2xl leading-tight">
          {caption}
        </p>
      )}
      {revealed && format === 'video' && (
        <span className="draw absolute inset-x-8 bottom-6 h-px bg-current" />
      )}
    </div>
  )
}
