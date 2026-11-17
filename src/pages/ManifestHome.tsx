import { Link } from 'react-router-dom'
import { Page } from '../components/Page'
import { Vision } from '../components/Vision'
import { formatDate, lineForToday } from '../domain'
import { useStore } from '../store'

export function ManifestHome() {
  const { space } = useStore()
  const { wishes, generations, profile } = space
  const kept = generations.filter((item) => item.favorite && item.status === 'completed')
  const recent = generations.filter((item) => item.status !== 'failed').slice(0, 6)

  return (
    <Page width="max-w-3xl">
      {profile.displayName && (
        <p className="kicker">{profile.displayName}’s space</p>
      )}
      <h1 className="mt-3 font-serif text-5xl leading-tight text-plum md:text-6xl">
        Your dreams deserve a space of their own.
      </h1>
      <p className="mt-5 max-w-lg text-lg text-ink/75">{lineForToday()}</p>
      <Link to="/create" className="btn mt-8">
        Create Your Wish
      </Link>

      <section className="mt-16">
        {wishes.length === 0 ? (
          <p className="border-t border-champagne pt-8 font-serif text-2xl italic text-ink/70">
            Nothing here yet. The first wish is how the room begins.
          </p>
        ) : (
          <ul className="border-t border-champagne">
            {wishes.map((wish) => {
              const pieces = generations.filter((item) => item.wishId === wish.id)
              const cover = pieces.find((item) => item.status === 'completed') ?? pieces[0]
              return (
                <li key={wish.id} className="border-b border-champagne">
                  <Link to={`/wishes/${wish.id}`} className="grid grid-cols-[5.5rem_1fr] gap-4 py-6 sm:grid-cols-[6.5rem_1fr]">
                    <div className="aspect-[9/16]">
                      {cover && <Vision palette={cover.concept.palette} />}
                    </div>
                    <div className="min-w-0">
                      <p className="kicker">{wish.category}</p>
                      <h2 className="mt-2 font-serif text-3xl leading-tight text-plum">{wish.title}</h2>
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink/70">
                        {wish.description}
                      </p>
                      <p className="mt-3 text-xs tracking-wide text-ink/50">
                        {pieces.length === 1 ? '1 vision' : `${pieces.length} visions`}
                        {' · '}
                        {formatDate(wish.createdAt)}
                      </p>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {recent.length > 0 && (
        <Shelf title="Recent" items={recent} />
      )}
      {kept.length > 0 && <Shelf title="Kept close" items={kept} />}
    </Page>
  )
}

function Shelf({
  title,
  items,
}: {
  title: string
  items: ReturnType<typeof useStore>['space']['generations']
}) {
  return (
    <section className="mt-16">
      <h2 className="font-serif text-3xl text-plum">{title}</h2>
      <ul className="mt-6 flex gap-4 overflow-x-auto pb-2">
        {items.map((item) => (
          <li key={item.id} className="w-36 shrink-0">
            <Link to={item.status === 'completed' ? `/generations/${item.id}` : `/generating/${item.id}`}>
              <div className="aspect-[9/16]">
                <Vision palette={item.concept.palette} caption={item.status === 'processing' ? 'Forming' : undefined} />
              </div>
              <p className="mt-2 line-clamp-2 font-serif text-lg leading-tight text-plum">
                {item.concept.title}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
