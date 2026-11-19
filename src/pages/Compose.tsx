import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Page } from '../components/Page'
import {
  categories,
  formats,
  guessCategory,
  moods,
  presences,
  styles,
  suggestTitle,
  type Category,
  type Mood,
  type OutputType,
  type Presence,
  type Style,
} from '../domain'
import { useStore } from '../store'
import { useAuth } from '../auth'
import { buildPreviewCreativeBrief } from '../creative/preview'
import { createRemoteGeneration, createRemoteWish } from '../lib/generation-api'

function isCategory(value: string | null): value is Category {
  return categories.includes(value as Category)
}

export function Compose() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const store = useStore()
  const auth = useAuth()
  const [busy, setBusy] = useState(false)
  const existing = id ? store.space.wishes.find((wish) => wish.id === id) : undefined

  const seededWish = params.get('wish') ?? ''
  const seededCategory = params.get('category')

  const [description, setDescription] = useState(seededWish)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<Category>(
    isCategory(seededCategory) ? seededCategory : guessCategory(seededWish),
  )
  const [categoryTouched, setCategoryTouched] = useState(isCategory(seededCategory))
  const [style, setStyle] = useState<Style>('Dreamy')
  const [mood, setMood] = useState<Mood>('Peaceful')
  const [presence, setPresence] = useState<Presence>('environment')
  const [outputType, setOutputType] = useState<OutputType>('image')
  const [error, setError] = useState('')

  const suggestion = useMemo(
    () => suggestTitle(existing?.description ?? description, existing?.category ?? category),
    [description, category, existing],
  )

  if (id && !existing) {
    return (
      <Page>
        <p className="font-serif text-4xl text-plum">This wish has left the space.</p>
        <Link to="/manifest" className="btn mt-8">
          My Manifest
        </Link>
      </Page>
    )
  }

  function onDescription(value: string) {
    setDescription(value)
    if (!categoryTouched) setCategory(guessCategory(value))
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    setError('')
    try {
    const feeling = { outputType, style, mood, presence }
    if (existing) {
      if (auth.session) {
        const creativeBrief = buildPreviewCreativeBrief({ wish: { title: existing.title, description: existing.description, category: existing.category }, ...feeling })
        const remote = await createRemoteGeneration(auth.session, { wishId: existing.id, ...feeling, creativeBrief })
        const result = store.envision(existing.id, feeling, { generationId: remote.id, status: remote.status })
        if (!result.ok) { setError(result.error); return }
        navigate(`/generating/${result.generation.id}`)
        return
      }
      const result = store.envision(existing.id, feeling)
      if (!result.ok) {
        setError(result.error)
        return
      }
      navigate(`/generating/${result.generation.id}`)
      return
    }

    const text = description.trim()
    if (!text) {
      setError('Write the wish first. A sentence is enough.')
      return
    }
    const wishInput = { ...feeling, description: text, category, title: title.trim() || suggestion }
    if (auth.session) {
      const remoteWish = await createRemoteWish(auth.session, { title: wishInput.title, description: wishInput.description, category: wishInput.category })
      const creativeBrief = buildPreviewCreativeBrief({ wish: { title: wishInput.title, description: wishInput.description, category: wishInput.category }, ...feeling })
      const remoteGeneration = await createRemoteGeneration(auth.session, { wishId: remoteWish.id, ...feeling, creativeBrief })
      const result = store.createWish(wishInput, { wishId: remoteWish.id, generationId: remoteGeneration.id, status: remoteGeneration.status })
      if (!result.ok) { setError(result.error); return }
      navigate(`/generating/${result.generation.id}`)
      return
    }
    const result = store.createWish(wishInput)
    if (!result.ok) {
      setError(result.error)
      return
    }
    navigate(`/generating/${result.generation.id}`)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Your Wish could not be sent just yet.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Page>
      <p className="kicker">{existing ? 'Another vision' : 'Your wish'}</p>
      <h1 className="mt-3 font-serif text-5xl leading-tight text-plum">
        {existing ? existing.title : 'What do you want to bring into your life?'}
      </h1>

      <form onSubmit={(event) => void onSubmit(event)} className="mt-10 space-y-12">
        {existing ? (
          <blockquote className="border-l border-gold pl-5 font-serif text-2xl italic leading-snug text-ink/80">
            {existing.description}
          </blockquote>
        ) : (
          <label className="block">
            <span className="sr-only">Wish</span>
            <textarea
              value={description}
              onChange={(event) => onDescription(event.target.value)}
              rows={4}
              placeholder="I want to live a beautiful, abundant life…"
              className="w-full resize-none bg-transparent font-serif text-3xl leading-snug text-plum placeholder:text-ink/30 focus:outline-none"
            />
          </label>
        )}

        {!existing && (
          <fieldset className="space-y-6">
            <legend className="kicker">A little more, if you wish</legend>
            <label className="mt-4 block">
              <span className="mb-2 block text-sm text-ink/60">Title</span>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder={suggestion}
                className="w-full border-b border-champagne bg-transparent py-2 font-serif text-2xl text-plum placeholder:text-ink/35 focus:border-gold focus:outline-none"
              />
            </label>
            <div>
              <p className="mb-3 text-sm text-ink/60">Category</p>
              <div className="flex flex-wrap gap-2">
                {categories.map((item) => (
                  <button
                    key={item}
                    type="button"
                    data-on={item === category}
                    className="chip"
                    onClick={() => {
                      setCategoryTouched(true)
                      setCategory(item)
                    }}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </fieldset>
        )}

        <fieldset>
          <legend className="kicker">The feeling</legend>
          <div className="mt-4 flex flex-wrap gap-2">
            {styles.map((item) => (
              <button
                key={item}
                type="button"
                data-on={item === style}
                className="chip"
                onClick={() => setStyle(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {moods.map((item) => (
              <button
                key={item}
                type="button"
                data-on={item === mood}
                className="chip"
                onClick={() => setMood(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="kicker">The form</legend>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {formats.map((item) => (
              <button
                key={item.id}
                type="button"
                disabled={item.id !== 'image'}
                onClick={() => setOutputType(item.id)}
                data-on={item.id === outputType}
                className="rounded-2xl border border-champagne px-4 py-4 text-left data-[on=true]:border-gold data-[on=true]:bg-champagne/40"
              >
                <span className="block font-serif text-2xl text-plum">{item.label}</span>
                <span className="mt-1 block text-sm text-ink/65">{item.id === 'image' ? item.hint : 'Coming soon'}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="kicker">Who is in the scene</legend>
          <div className="mt-4 flex flex-wrap gap-2">
            {presences.map((item) => (
              <button
                key={item.id}
                type="button"
                data-on={item.id === presence}
                className="chip"
                onClick={() => setPresence(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
          {presence === 'self' && (
            <p className="mt-4 max-w-md text-sm leading-relaxed text-ink/65">
              You can continue without a portrait. A likeness can be added later, and only if you
              want it.
            </p>
          )}
        </fieldset>

        <div className="space-y-4">
          {store.remaining > 0 && store.remaining <= 3 && (
            <p className="text-sm text-ink/60">
              {store.remaining === 1
                ? 'One vision left in this first space.'
                : `${store.remaining} visions left in this first space.`}
            </p>
          )}
          {store.remaining === 0 && (
            <p className="max-w-md text-sm leading-relaxed text-plum">
              This space is holding as many visions as it can for now.
            </p>
          )}
          {error && <p className="text-sm text-plum">{error}</p>}
          <button className="btn" type="submit" disabled={store.remaining === 0 || busy}>
            {busy ? 'Holding your wish…' : 'Bring It to Life'}
          </button>
        </div>
      </form>
    </Page>
  )
}
