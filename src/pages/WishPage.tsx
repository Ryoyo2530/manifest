import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Page } from '../components/Page'
import { Vision } from '../components/Vision'
import { categories, formatDate, formats, type Category } from '../domain'
import { useStore } from '../store'

export function WishPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { space, updateWish, deleteWish } = useStore()
  const wish = space.wishes.find((item) => item.id === id)
  const pieces = space.generations.filter((item) => item.wishId === id)
  const [editing, setEditing] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [title, setTitle] = useState(wish?.title ?? '')
  const [description, setDescription] = useState(wish?.description ?? '')
  const [category, setCategory] = useState<Category>(wish?.category ?? 'Other')

  useEffect(() => {
    if (!wish) return
    setTitle(wish.title)
    setDescription(wish.description)
    setCategory(wish.category)
    setEditing(false)
    setConfirming(false)
  }, [wish])

  if (!wish) {
    return (
      <Page>
        <p className="font-serif text-4xl text-plum">This wish has left the space.</p>
        <Link to="/manifest" className="btn mt-8">
          My Manifest
        </Link>
      </Page>
    )
  }

  async function save() {
    const nextTitle = title.trim()
    const nextDescription = description.trim()
    if (!nextTitle || !nextDescription) return
    setSaving(true)
    setError('')
    try {
      await updateWish(wish!.id, { title: nextTitle, description: nextDescription, category })
      setEditing(false)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'The Wish could not be saved.')
    } finally {
      setSaving(false)
    }
  }

  async function remove() {
    setSaving(true)
    setError('')
    try {
      await deleteWish(wish!.id)
      navigate('/manifest')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'The Wish could not be deleted.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Page>
      <p className="kicker">{wish.category}</p>
      {editing ? (
        <div className="mt-4 space-y-5">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full border-b border-champagne bg-transparent font-serif text-4xl text-plum focus:border-gold focus:outline-none"
          />
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
            className="w-full resize-none bg-transparent text-lg leading-relaxed text-ink focus:outline-none"
          />
          <div className="flex flex-wrap gap-2">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                data-on={item === category}
                className="chip"
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <button type="button" className="btn" onClick={() => void save()} disabled={saving}>
              Save the wish
            </button>
            <button type="button" className="btn-ghost" onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <h1 className="mt-3 font-serif text-5xl leading-tight text-plum">{wish.title}</h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink/80">{wish.description}</p>
          <p className="mt-4 text-sm text-ink/50">{formatDate(wish.createdAt)}</p>
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <button type="button" className="underline decoration-gold/70 underline-offset-4" onClick={() => {
              setTitle(wish.title)
              setDescription(wish.description)
              setCategory(wish.category)
              setEditing(true)
            }}>
              Edit
            </button>
            {confirming ? (
              <button type="button" className="text-plum underline decoration-gold/70 underline-offset-4" onClick={() => void remove()} disabled={saving}>
                Yes, let it go
              </button>
            ) : (
              <button type="button" className="underline decoration-gold/70 underline-offset-4" onClick={() => setConfirming(true)}>
                Delete
              </button>
            )}
          </div>
        </>
      )}

      <Link to={`/wishes/${wish.id}/envision`} className="btn mt-10">
        Another vision
      </Link>

      {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}

      {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}

      <section className="mt-14">
        {pieces.length === 0 ? (
          <p className="font-serif text-2xl italic text-ink/60">No visions yet.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {pieces.map((item) => (
              <li key={item.id}>
                <Link to={item.status === 'completed' ? `/generations/${item.id}` : `/generating/${item.id}`}>
                  <div className="aspect-[9/16]">
                    <Vision
                      palette={item.concept.palette}
                      caption={
                        item.status === 'processing'
                          ? 'Forming'
                          : formats.find((format) => format.id === item.outputType)?.label
                      }
                    />
                  </div>
                  <p className="mt-2 text-sm text-ink/60">
                    {item.favorite ? 'Kept · ' : ''}
                    {formatDate(item.createdAt)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Page>
  )
}
