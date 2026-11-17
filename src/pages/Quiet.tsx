import { Link, useLocation } from 'react-router-dom'
import { Page } from '../components/Page'

const pages = {
  about: {
    kicker: 'About',
    title: 'A room for what you are wishing.',
    paragraphs: [
      'Manifest is a personal place to turn a wish into something you can see, hear, and return to.',
      'It is not a promise that life will rearrange itself. It is a way to feel the future you are choosing — hopeful, specific, and yours.',
      'Write what you want. The space shapes it into a vision. You keep it, and you come back when you need the feeling again.',
    ],
  },
  privacy: {
    kicker: 'Privacy',
    title: 'Your wishes stay yours.',
    paragraphs: [
      'In this first frame of the space, wishes live on this device, in this browser. They are not sent anywhere.',
      'Nothing here is used for public promotion. When a portrait becomes possible, it will be optional, explained, and never required.',
      'You can erase the space from Account. Erasing removes the wishes and visions kept on this device.',
    ],
  },
  terms: {
    kicker: 'Terms',
    title: 'A way of looking, not a contract.',
    paragraphs: [
      'Manifest offers visualization, inspiration, and reflection. It does not predict your life, and it does not guarantee an outcome.',
      'You are welcome to wish freely. The space will not shape visions that are harmful, exploitative, or deceptive.',
      'What you receive is for you — a way of seeing, not a promise from the future.',
    ],
  },
  contact: {
    kicker: 'Contact',
    title: 'The door is here.',
    paragraphs: [
      'There is no public desk yet.',
      'When the space opens more widely, a way to write to us will live on this page. Until then, the wish itself is the note that matters.',
    ],
  },
} as const

export function Quiet() {
  const { pathname } = useLocation()
  const key = pathname.replace('/', '') as keyof typeof pages
  const page = pages[key] ?? pages.about

  return (
    <Page width="max-w-xl">
      <p className="kicker">{page.kicker}</p>
      <h1 className="mt-3 font-serif text-5xl leading-tight text-plum">{page.title}</h1>
      <div className="mt-8 space-y-5 text-lg leading-relaxed text-ink/80">
        {page.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      <Link to="/" className="mt-12 inline-block text-sm underline decoration-gold/70 underline-offset-4">
        Return home
      </Link>
    </Page>
  )
}

export function Missing() {
  return (
    <Page>
      <h1 className="font-serif text-5xl text-plum">This path doesn’t open.</h1>
      <Link to="/" className="btn mt-8">
        Return home
      </Link>
    </Page>
  )
}
