import { useEffect, useState } from 'react'
import { useAuth } from '../auth'
import { fetchRemoteGenerationImage } from '../lib/generation-api'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Page } from '../components/Page'
import { Vision } from '../components/Vision'
import { downloadKeepsake, sharePiece } from '../lib/keep'
import { useStore } from '../store'

export function Result() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { space, toggleFavorite } = useStore()
  const auth = useAuth()
  const [generatedImage, setGeneratedImage] = useState('')
  const generation = space.generations.find((item) => item.id === id)
  const wish = space.wishes.find((item) => item.id === generation?.wishId)
  const [revealed, setRevealed] = useState(false)
  const [note, setNote] = useState('')
  const [favoriteBusy, setFavoriteBusy] = useState(false)

  useEffect(() => {
    let active = true
    if (generation?.status === 'completed' && generation.outputType === 'image' && auth.session) {
      void fetchRemoteGenerationImage(auth.session, generation.id).then((url) => { if (active) setGeneratedImage(url); else URL.revokeObjectURL(url) }).catch(() => undefined)
    }
    return () => { active = false }
  }, [generation?.id, generation?.status, auth.session])

  useEffect(() => () => { if (generatedImage) URL.revokeObjectURL(generatedImage) }, [generatedImage])

  useEffect(() => {
    if (generation?.status === 'processing' || generation?.status === 'pending') {
      navigate(`/generating/${generation.id}`, { replace: true })
    }
  }, [generation, navigate])

  if (!generation || !wish) {
    return (
      <Page>
        <p className="font-serif text-4xl text-plum">This vision isn’t in the space.</p>
        <Link to="/manifest" className="btn mt-8">
          My Manifest
        </Link>
      </Page>
    )
  }

  const { concept } = generation
  const presenceLine =
    generation.presence === 'self'
      ? 'You are in this vision.'
      : generation.presence === 'pov'
        ? 'Seen through your eyes.'
        : ''

  async function onShare() {
    try {
      const outcome = await sharePiece(concept)
      setNote(outcome === 'copied' ? 'Affirmation copied, so you can keep it close.' : 'Shared.')
    } catch {
      setNote('It stayed here.')
    }
  }

  return (
    <Page width="max-w-xl">
      <p className="kicker">{wish.category}</p>
      <h1 className="mt-3 font-serif text-5xl leading-tight text-plum">{concept.title}</h1>
      <div className="mt-5 border-y border-champagne py-4">
        <p className="kicker">Concept preview</p>
        <p className="mt-2 text-sm leading-relaxed text-ink/70">
          {generatedImage ? 'Your image is ready.' : 'This is the creative direction for your wish. Your generated image will appear here when it is ready.'}
        </p>
      </div>

      {generatedImage ? <img src={generatedImage} alt={concept.title} className="mx-auto mt-8 max-h-[75vh] w-full rounded-2xl object-contain shadow-xl" /> : (
      <div className={`mx-auto mt-8 ${generation.outputType === 'audio' ? 'aspect-[4/5] max-w-md' : 'aspect-[9/16] max-w-sm'}`}>
        <Vision
          palette={concept.palette}
          format={generation.outputType}
          affirmation={concept.affirmation}
          revealed={revealed || generation.outputType === 'audio'}
          onReveal={() => setRevealed(true)}
        />
      </div>
      )}

      {generation.outputType === 'image' && (
        <p className="mt-8 text-center font-serif text-2xl italic leading-snug text-plum">
          {concept.affirmation}
        </p>
      )}

      <p className="mt-8 text-center leading-relaxed text-ink/75">{concept.scene}</p>
      <p className="mt-4 text-center text-sm text-ink/60">{concept.atmosphere}</p>
      <p className="kicker mt-6 text-center">{concept.tone}</p>
      {presenceLine && <p className="mt-3 text-center text-sm text-ink/60">{presenceLine}</p>}

      <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm">
        <button type="button" className="text-plum underline decoration-gold/70 underline-offset-4" onClick={() => { setFavoriteBusy(true); void toggleFavorite(generation.id).catch(() => setNote('This vision could not be saved just yet.')).finally(() => setFavoriteBusy(false)) }} disabled={favoriteBusy}>
          {generation.favorite ? 'Kept' : 'Keep'}
        </button>
        <button type="button" className="text-plum underline decoration-gold/70 underline-offset-4" onClick={onShare}>
          Share affirmation
        </button>
        <button
          type="button"
          className="text-plum underline decoration-gold/70 underline-offset-4"
          onClick={() => downloadKeepsake(concept, generation.outputType)}
        >
          Download concept card
        </button>
        <Link to={`/wishes/${wish.id}/envision`} className="text-plum underline decoration-gold/70 underline-offset-4">
          Another vision
        </Link>
        <Link to={`/wishes/${wish.id}`} className="text-plum underline decoration-gold/70 underline-offset-4">
          The wish
        </Link>
      </div>
      {note && <p className="mt-4 text-center text-sm text-ink/60">{note}</p>}
    </Page>
  )
}
