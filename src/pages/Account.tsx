import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Page } from '../components/Page'
import { useAuth } from '../auth'
import { useStore } from '../store'

type Mode = 'signin' | 'signup' | 'reset'

export function Account() {
  const { space, updateProfile, clearSpace } = useStore()
  const auth = useAuth()
  const [mode, setMode] = useState<Mode>('signin')
  const [name, setName] = useState(space.profile.displayName)
  const [timezone, setTimezone] = useState(space.profile.timezone)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [saved, setSaved] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  function saveProfile(event: FormEvent) {
    event.preventDefault()
    updateProfile({ displayName: name.trim(), timezone: timezone.trim() || 'UTC', language: 'en' })
    setSaved(true)
  }

  async function submitAuth(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setMessage('')
    try {
      if (mode === 'signin') {
        await auth.signInWithPassword(email.trim(), password)
        setMessage('You’re signed in.')
      } else if (mode === 'signup') {
        const needsConfirmation = await auth.createAccount(email.trim(), password, name.trim())
        setMessage(needsConfirmation ? 'Check your inbox for a confirmation link, then return here to sign in.' : 'Your account is ready.')
      } else {
        await auth.requestPasswordReset(email.trim())
        setMessage('If an account exists for that email, a password reset link is on its way.')
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  async function leaveAccount() {
    setError('')
    try {
      await auth.signOutUser()
      setMessage('You’ve signed out.')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not sign out.')
    }
  }

  return (
    <Page width="max-w-xl">
      <p className="kicker">Account</p>
      <h1 className="mt-3 font-serif text-5xl text-plum">The one who wishes.</h1>

      {auth.configured ? (
        <section className="mt-8 border-y border-champagne py-7">
          {auth.loading ? (
            <p className="text-sm text-ink/60">Opening your space…</p>
          ) : auth.session ? (
            <>
              <p className="text-sm text-ink/60">Signed in as</p>
              <p className="mt-1 font-serif text-2xl text-plum">{auth.session.user.email}</p>
              <button type="button" className="btn-ghost mt-5" onClick={() => void leaveAccount()}>Sign out</button>
            </>
          ) : (
            <>
              <div className="flex flex-wrap gap-4 text-sm">
                <button type="button" onClick={() => { setMode('signin'); setMessage(''); setError('') }} className={mode === 'signin' ? 'text-plum underline underline-offset-4' : 'text-ink/50'}>Sign in</button>
                <button type="button" onClick={() => { setMode('signup'); setMessage(''); setError('') }} className={mode === 'signup' ? 'text-plum underline underline-offset-4' : 'text-ink/50'}>Create account</button>
                <button type="button" onClick={() => { setMode('reset'); setMessage(''); setError('') }} className={mode === 'reset' ? 'text-plum underline underline-offset-4' : 'text-ink/50'}>Reset password</button>
              </div>
              <form onSubmit={(event) => void submitAuth(event)} className="mt-7 space-y-5">
                {mode === 'signup' && (
                  <label className="block text-sm text-ink/60">Name
                    <input required maxLength={80} value={name} onChange={(event) => setName(event.target.value)} className="mt-2 w-full border-b border-champagne bg-transparent py-2 text-plum focus:border-gold focus:outline-none" />
                  </label>
                )}
                <label className="block text-sm text-ink/60">Email
                  <input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full border-b border-champagne bg-transparent py-2 text-plum focus:border-gold focus:outline-none" />
                </label>
                {mode !== 'reset' && (
                  <label className="block text-sm text-ink/60">Password
                    <input required minLength={8} type="password" autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full border-b border-champagne bg-transparent py-2 text-plum focus:border-gold focus:outline-none" />
                    <span className="mt-1 block text-xs text-ink/40">At least 8 characters.</span>
                  </label>
                )}
                <button disabled={busy} className="btn disabled:opacity-50" type="submit">
                  {busy ? 'One moment…' : mode === 'signin' ? 'Sign in' : mode === 'signup' ? 'Create account' : 'Send reset link'}
                </button>
              </form>
              {message && <p role="status" className="mt-4 text-sm text-ink/70">{message}</p>}
              {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
            </>
          )}
        </section>
      ) : (
        <p className="mt-6 text-sm leading-relaxed text-ink/65">
          Sign-in is ready to connect. Add the Supabase project URL and public anon key to your local environment to enable accounts. Your current wishes remain stored on this device.
        </p>
      )}

      <form onSubmit={saveProfile} className="mt-10 space-y-6">
        <h2 className="font-serif text-3xl text-plum">Your space</h2>
        <label className="block">
          <span className="mb-2 block text-sm text-ink/60">Name</span>
          <input value={name} onChange={(event) => { setName(event.target.value); setSaved(false) }} placeholder="What should the room call you?" className="w-full border-b border-champagne bg-transparent py-2 font-serif text-2xl text-plum placeholder:text-ink/30 focus:border-gold focus:outline-none" />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm text-ink/60">Language</span>
          <select value={space.profile.language} onChange={() => updateProfile({ language: 'en' })} className="w-full border-b border-champagne bg-transparent py-2 text-plum focus:border-gold focus:outline-none">
            <option value="en">English</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm text-ink/60">Timezone</span>
          <input value={timezone} onChange={(event) => { setTimezone(event.target.value); setSaved(false) }} className="w-full border-b border-champagne bg-transparent py-2 text-plum focus:border-gold focus:outline-none" />
        </label>
        <button className="btn" type="submit">Keep profile</button>
        {saved && <p className="text-sm text-ink/60">Kept on this device.</p>}
      </form>

      <div className="mt-20 border-t border-champagne pt-8">
        <h2 className="font-serif text-3xl text-plum">Leave the space</h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-ink/70">This erases the wishes and visions kept in this browser. It cannot be undone.</p>
        {confirming ? (
          <button type="button" className="btn mt-6" onClick={clearSpace}>Yes, erase it</button>
        ) : (
          <button type="button" className="btn-ghost mt-6" onClick={() => setConfirming(true)}>Erase this space</button>
        )}
      </div>
      <p className="mt-8 text-xs text-ink/45">{auth.session ? 'Your Wishes and saved visions are synchronized with your account.' : 'Your signed-out prototype space is kept on this device.'} <Link to="/manifest" className="underline underline-offset-4">Return to My Manifest</Link>.</p>
    </Page>
  )
}
