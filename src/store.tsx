import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  interpret,
  uid,
  type Category,
  type Generation,
  type Mood,
  type OutputType,
  type Presence,
  type Profile,
  type Style,
  type Wish,
} from './domain'
import { limits } from './limits'
import { buildPreviewCreativeBrief } from './creative/preview'

const KEY = 'manifest.space'

export type Space = {
  profile: Profile
  wishes: Wish[]
  generations: Generation[]
}

export type VisionInput = {
  outputType: OutputType
  style: Style
  mood: Mood
  presence: Presence
}

export type WishInput = VisionInput & {
  title: string
  description: string
  category: Category
}

type Created =
  | { ok: true; wish: Wish; generation: Generation }
  | { ok: false; error: string }

type Envisioned = { ok: true; generation: Generation } | { ok: false; error: string }

export type RemoteGenerationIds = { wishId?: string; generationId: string; status?: Generation['status'] }

type StoreApi = {
  space: Space
  remaining: number
  createWish: (input: WishInput, remote?: RemoteGenerationIds) => Created
  envision: (wishId: string, input: VisionInput, remote?: RemoteGenerationIds) => Envisioned
  updateWish: (
    id: string,
    patch: Partial<Pick<Wish, 'title' | 'description' | 'category'>>,
  ) => void
  deleteWish: (id: string) => void
  completeGeneration: (id: string) => void
  toggleFavorite: (id: string) => void
  updateProfile: (patch: Partial<Profile>) => void
  clearSpace: () => void
}

const StoreContext = createContext<StoreApi | null>(null)

function emptySpace(): Space {
  let timezone = 'UTC'
  try {
    timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  } catch {
    timezone = 'UTC'
  }
  return {
    profile: { displayName: '', language: 'en', timezone },
    wishes: [],
    generations: [],
  }
}

function read(): Space {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return emptySpace()
    const parsed = JSON.parse(raw) as Partial<Space>
    const base = emptySpace()
    if (!parsed || !Array.isArray(parsed.wishes) || !Array.isArray(parsed.generations)) {
      return base
    }
    return {
      profile: { ...base.profile, ...parsed.profile },
      wishes: parsed.wishes,
      generations: parsed.generations,
    }
  } catch {
    return emptySpace()
  }
}

function persist(space: Space) {
  localStorage.setItem(KEY, JSON.stringify(space))
}

const held = 'This space is holding as many visions as it can for now.'

export function StoreProvider({ children }: { children: ReactNode }) {
  const [space, setSpace] = useState(read)
  const spaceRef = useRef(space)
  spaceRef.current = space

  const replace = useCallback((next: Space) => {
    spaceRef.current = next
    persist(next)
    setSpace(next)
  }, [])

  const createWish = useCallback(
    (input: WishInput, remote?: RemoteGenerationIds): Created => {
      const current = spaceRef.current
      if (current.generations.length >= limits.freeGenerations) {
        return { ok: false, error: held }
      }
      const now = new Date().toISOString()
      const description = input.description.trim()
      const wish: Wish = {
        id: remote?.wishId ?? uid(),
        title: input.title.trim() || interpret(input).title,
        description,
        category: input.category,
        status: 'active',
        createdAt: now,
        updatedAt: now,
      }
      const generation: Generation = {
        id: remote?.generationId ?? uid(),
        wishId: wish.id,
        outputType: input.outputType,
        status: remote?.status ?? (remote ? 'pending' : 'processing'),
        style: input.style,
        mood: input.mood,
        presence: input.presence,
        concept: interpret({ ...input, title: wish.title, description }),
        creativeBrief: buildPreviewCreativeBrief({
          wish: { title: wish.title, description, category: wish.category },
          outputType: input.outputType,
          style: input.style,
          mood: input.mood,
          presence: input.presence,
        }),
        favorite: false,
        createdAt: now,
      }
      replace({
        ...current,
        wishes: [wish, ...current.wishes],
        generations: [generation, ...current.generations],
      })
      return { ok: true, wish, generation }
    },
    [replace],
  )

  const envision = useCallback(
    (wishId: string, input: VisionInput, remote?: RemoteGenerationIds): Envisioned => {
      const current = spaceRef.current
      const wish = current.wishes.find((item) => item.id === wishId)
      if (!wish) return { ok: false, error: 'That wish is no longer here.' }
      if (current.generations.length >= limits.freeGenerations) {
        return { ok: false, error: held }
      }
      const now = new Date().toISOString()
      const generation: Generation = {
        id: uid(),
        wishId: wish.id,
        outputType: input.outputType,
        status: 'processing',
        style: input.style,
        mood: input.mood,
        presence: input.presence,
        concept: interpret({
          description: wish.description,
          category: wish.category,
          style: input.style,
          mood: input.mood,
          title: wish.title,
        }),
        creativeBrief: buildPreviewCreativeBrief({
          wish: { title: wish.title, description: wish.description, category: wish.category },
          outputType: input.outputType,
          style: input.style,
          mood: input.mood,
          presence: input.presence,
        }),
        favorite: false,
        createdAt: now,
      }
      replace({
        ...current,
        generations: [generation, ...current.generations],
      })
      return { ok: true, generation }
    },
    [replace],
  )

  const updateWish = useCallback(
    (id: string, patch: Partial<Pick<Wish, 'title' | 'description' | 'category'>>) => {
      const current = spaceRef.current
      replace({
        ...current,
        wishes: current.wishes.map((wish) =>
          wish.id === id
            ? { ...wish, ...patch, updatedAt: new Date().toISOString() }
            : wish,
        ),
      })
    },
    [replace],
  )

  const deleteWish = useCallback(
    (id: string) => {
      const current = spaceRef.current
      replace({
        ...current,
        wishes: current.wishes.filter((wish) => wish.id !== id),
        generations: current.generations.filter((item) => item.wishId !== id),
      })
    },
    [replace],
  )

  const completeGeneration = useCallback(
    (id: string) => {
      const current = spaceRef.current
      replace({
        ...current,
        generations: current.generations.map((item) =>
          item.id === id && item.status === 'processing'
            ? { ...item, status: 'completed', completedAt: new Date().toISOString() }
            : item,
        ),
      })
    },
    [replace],
  )

  const toggleFavorite = useCallback(
    (id: string) => {
      const current = spaceRef.current
      replace({
        ...current,
        generations: current.generations.map((item) =>
          item.id === id ? { ...item, favorite: !item.favorite } : item,
        ),
      })
    },
    [replace],
  )

  const updateProfile = useCallback(
    (patch: Partial<Profile>) => {
      const current = spaceRef.current
      replace({ ...current, profile: { ...current.profile, ...patch } })
    },
    [replace],
  )

  const clearSpace = useCallback(() => {
    const timezone = spaceRef.current.profile.timezone
    replace({ ...emptySpace(), profile: { displayName: '', language: 'en', timezone } })
  }, [replace])

  const value = useMemo<StoreApi>(
    () => ({
      space,
      remaining: Math.max(0, limits.freeGenerations - space.generations.length),
      createWish,
      envision,
      updateWish,
      deleteWish,
      completeGeneration,
      toggleFavorite,
      updateProfile,
      clearSpace,
    }),
    [
      space,
      createWish,
      envision,
      updateWish,
      deleteWish,
      completeGeneration,
      toggleFavorite,
      updateProfile,
      clearSpace,
    ],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const store = useContext(StoreContext)
  if (!store) throw new Error('useStore must be used within StoreProvider')
  return store
}
