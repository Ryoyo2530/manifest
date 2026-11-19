import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Halo } from '../components/Halo'
import { useStore } from '../store'

const lines = [
  'Reading the wish beneath your words…',
  'Finding the feeling you want to return to…',
  'Shaping a visual direction around your wish…',
  'Your concept is ready…',
]

export function Ritual() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { space, refreshGeneration } = useStore()
  const generation = space.generations.find((item) => item.id === id)
  const generationId = generation?.id
  const status = generation?.status
  const [line, setLine] = useState(0)

  useEffect(() => {
    if (!generationId) return
    if (status === 'completed') { navigate('/generations/' + generationId, { replace: true }); return }
    if (status === 'failed') return
    const beats = lines.map((_, index) => window.setTimeout(() => setLine(index), index * 1200))
    const poll = window.setInterval(() => { void refreshGeneration(generationId).catch(() => undefined) }, 3500)
    return () => { beats.forEach((beat) => window.clearTimeout(beat)); window.clearInterval(poll) }
  }, [generationId, status, refreshGeneration, navigate])

  if (!generation) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <p className="font-serif text-4xl text-plum">Nothing is forming here.</p>
        <Link to="/manifest" className="btn mt-8">
          My Manifest
        </Link>
      </div>
    )
  }

  if (generation.status === 'failed') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <p className="max-w-md font-serif text-4xl leading-tight text-plum">
          This concept didn’t come through. The wish is still here.
        </p>
        <Link to={`/wishes/${generation.wishId}`} className="btn mt-8">
          Return to the wish
        </Link>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/3 h-80 w-80 -translate-x-1/2 rounded-full bg-champagne/70 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-56 w-56 rounded-full bg-lavender/50 blur-3xl" />
      </div>
      <Halo className="drift relative h-56 w-56 text-gold/80" />
      <p className="kicker relative mt-10">Your vision is forming</p>
      <p className="rise relative mt-4 max-w-md font-serif text-3xl italic leading-snug text-plum md:text-4xl" aria-live="polite">
        {lines[line]}
      </p>
      <p className="relative mt-5 max-w-sm text-sm leading-relaxed text-ink/60">
        {generation.status === 'pending'
          ? 'Your image is being created. This may take a little while; stay here while it comes to life.'
          : 'Your image is being created and will appear here as soon as it is ready.'}
      </p>
      {generation.status === 'pending' && (
        <Link to={`/wishes/${generation.wishId}`} className="relative mt-8 text-sm text-plum underline decoration-gold/70 underline-offset-4">
          Return to your wish
        </Link>
      )}
    </div>
  )
}
