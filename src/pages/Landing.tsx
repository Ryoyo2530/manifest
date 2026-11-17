import { Link } from 'react-router-dom'
import { Header } from '../components/Header'
import { Vision } from '../components/Vision'
import { examples, interpret } from '../domain'

const steps = [
  {
    n: '01',
    title: 'Write Your Wish',
    text: 'Say it in your own words. A sentence is enough.',
  },
  {
    n: '02',
    title: 'Bring It to Life',
    text: 'A vision, an image, or a voice — shaped around what you asked for.',
  },
  {
    n: '03',
    title: 'Revisit Your Manifestation',
    text: 'It waits in your space, ready when you want the feeling again.',
  },
]

export function Landing() {
  return (
    <div>
      <section className="relative min-h-screen overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 top-16 h-80 w-80 rounded-full bg-blush/70 blur-3xl" />
          <div className="absolute right-0 top-24 h-96 w-96 rounded-full bg-lavender/60 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-champagne/80 blur-3xl" />
        </div>
        <span className="pointer-events-none absolute left-5 top-5 h-10 w-10 border-l border-t border-gold/70 md:left-8 md:top-8" />
        <span className="pointer-events-none absolute right-5 top-5 h-10 w-10 border-r border-t border-gold/70 md:right-8 md:top-8" />
        <span className="pointer-events-none absolute bottom-5 left-5 h-10 w-10 border-b border-l border-gold/70 md:bottom-8 md:left-8" />
        <span className="pointer-events-none absolute bottom-5 right-5 h-10 w-10 border-b border-r border-gold/70 md:bottom-8 md:right-8" />

        <Header showAccount={false} />

        <div className="rise relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-4xl flex-col items-center justify-center px-6 pb-20 text-center">
          <p className="kicker">A personal manifestation space</p>
          <h1 className="mt-6 font-serif text-5xl leading-[0.92] text-plum sm:text-7xl md:text-8xl">
            Your Dreams,
            <br />
            <span className="italic">In Motion.</span>
          </h1>
          <p className="mt-8 max-w-md text-lg leading-relaxed text-ink/80">
            Turn the life you imagine into something you can see, feel, and experience.
          </p>
          <div className="mt-10 flex flex-col items-center gap-5">
            <Link to="/create" className="btn">
              Create Your Wish
            </Link>
            <a href="#experience" className="text-sm text-plum/80 underline decoration-gold/70 underline-offset-4">
              Discover the Experience
            </a>
          </div>
        </div>
      </section>

      <section id="experience" className="mx-auto max-w-5xl px-6 py-24 md:py-32">
        <p className="kicker">How it works</p>
        <ol className="mt-10 divide-y divide-champagne border-y border-champagne">
          {steps.map((step) => (
            <li key={step.n} className="grid gap-3 py-8 md:grid-cols-[6rem_1fr_1.4fr] md:items-baseline">
              <span className="font-serif text-2xl italic text-gold">{step.n}</span>
              <h2 className="font-serif text-4xl text-plum">{step.title}</h2>
              <p className="text-ink/75">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-24">
        <p className="kicker">Example manifestations</p>
        <h2 className="mt-4 max-w-xl font-serif text-4xl text-plum md:text-5xl">
          A glimpse of the feeling. Yours will be made from your words.
        </h2>
        <ul className="mt-10 grid gap-6 md:grid-cols-3">
          {examples.map((example) => {
            const concept = interpret({
              description: example.description,
              category: example.category,
              style: 'Dreamy',
              mood: 'Peaceful',
              title: example.title,
            })
            const query = new URLSearchParams({
              wish: example.description,
              category: example.category,
            })
            return (
              <li key={example.title}>
                <Link to={`/create?${query.toString()}`} className="group block">
                  <div className="aspect-[9/16] transition duration-500 group-hover:scale-[1.01]">
                    <Vision palette={concept.palette} caption={example.title} />
                  </div>
                  <p className="mt-4 text-sm text-ink/60">{example.category}</p>
                </Link>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="mx-auto max-w-2xl px-6 py-16 text-center md:py-24">
        <p className="kicker">Daily Manifest</p>
        <h2 className="mt-4 font-serif text-4xl text-plum md:text-5xl">A note, each morning.</h2>
        <p className="mt-6 text-lg leading-relaxed text-ink/75">
          Soon, the wish you keep closest can meet you once a day — a sentence, an image, a
          feeling to begin with. Not a new life every morning. Just a return.
        </p>
      </section>

      <footer className="border-t border-champagne px-6 py-10">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 text-sm text-ink/70 md:flex-row md:items-center md:justify-between">
          <p className="font-serif text-xl italic text-plum">Manifest</p>
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            <Link to="/about">About</Link>
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/contact">Contact</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
