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

function isCategory(value: string | null): value is Category {
  return categories.includes(value as Category)
}

export function Compose() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const store = useStore()
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
  const [outputType, setOutputType] = useState<OutputType>('video')
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

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    const feeling = { outputType, style, mood, presence }
    if (existing) {
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
    const result = store.createWish({
      ...feeling,
      description: text,
      category,
      title: title.trim() || suggestion,
    })
    if (!result.ok) {
      setError(result.error)
      return
    }
    navigate(`/generating/${result.generation.id}`)
  }

  return (
    <Page>
      <p className="kicker">{existing ? 'Another vision' : 'Your wish'}</p>
      <h1 className="mt-3 font-serif text-5xl leading-tight text-plum">
        {existing ? existing.title : 'What do you want to bring into your life?'}
      </h1>

      <form onSubmit={onSubmit} className="mt-10 space-y-12">
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
                onClick={() => setOutputType(item.id)}
                data-on={item.id === outputType}
                className="rounded-2xl border border-champagne px-4 py-4 text-left data-[on=true]:border-gold data-[on=true]:bg-champagne/40"
              >
                <span className="block font-serif text-2xl text-plum">{item.label}</span>
                <span className="mt-1 block text-sm text-ink/65">{item.hint}</span>
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
          <button className="btn" type="submit" disabled={store.remaining === 0}>
            Bring It to Life
          </button>
        </div>
      </form>
    </Page>
  )
}
