import { useState, type FormEvent } from 'react'
import { Page } from '../components/Page'
import { useStore } from '../store'

export function Account() {
  const { space, updateProfile, clearSpace } = useStore()
  const [name, setName] = useState(space.profile.displayName)
  const [timezone, setTimezone] = useState(space.profile.timezone)
  const [confirming, setConfirming] = useState(false)
  const [saved, setSaved] = useState(false)

  function save(event: FormEvent) {
    event.preventDefault()
    updateProfile({
      displayName: name.trim(),
      timezone: timezone.trim() || 'UTC',
      language: 'en',
    })
    setSaved(true)
  }

  return (
    <Page width="max-w-xl">
      <p className="kicker">Account</p>
      <h1 className="mt-3 font-serif text-5xl text-plum">The one who wishes.</h1>
      <p className="mt-5 leading-relaxed text-ink/75">
        For now, this space lives on this device. A sign-in will arrive when the wishes need to
        travel with you.
      </p>

      <form onSubmit={save} className="mt-10 space-y-6">
        <label className="block">
          <span className="mb-2 block text-sm text-ink/60">Name</span>
          <input
            value={name}
            onChange={(event) => {
              setName(event.target.value)
              setSaved(false)
            }}
            placeholder="What should the room call you?"
            className="w-full border-b border-champagne bg-transparent py-2 font-serif text-2xl text-plum placeholder:text-ink/30 focus:border-gold focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm text-ink/60">Language</span>
          <select
            value={space.profile.language}
            onChange={() => updateProfile({ language: 'en' })}
            className="w-full border-b border-champagne bg-transparent py-2 text-plum focus:border-gold focus:outline-none"
          >
            <option value="en">English</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm text-ink/60">Timezone</span>
          <input
            value={timezone}
            onChange={(event) => {
              setTimezone(event.target.value)
              setSaved(false)
            }}
            className="w-full border-b border-champagne bg-transparent py-2 text-plum focus:border-gold focus:outline-none"
          />
        </label>
        <button className="btn" type="submit">
          Keep
        </button>
        {saved && <p className="text-sm text-ink/60">Kept on this device.</p>}
      </form>

      <div className="mt-20 border-t border-champagne pt-8">
        <h2 className="font-serif text-3xl text-plum">Leave the space</h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-ink/70">
          This erases the wishes and visions kept in this browser. It cannot be undone.
        </p>
        {confirming ? (
          <button type="button" className="btn mt-6" onClick={clearSpace}>
            Yes, erase it
          </button>
        ) : (
          <button type="button" className="btn-ghost mt-6" onClick={() => setConfirming(true)}>
            Erase this space
          </button>
        )}
      </div>
    </Page>
  )
}
