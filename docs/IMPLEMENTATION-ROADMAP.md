# Manifest — Implementation Audit & Roadmap

**Audited:** 2026-11-19  
**Base:** `main` at `bc68e4e123be85ac701c81614c1ce14ba55690fa`  
**Product direction:** Personal Manifestation Space

## 1. Executive summary

The current repository is a polished frontend prototype with a coherent Wish-first information architecture. It already demonstrates the intended emotional tone and the primary interaction loop:

`Landing → Create Wish → Concept Flow → Result → My Manifest`

It is not yet a production generation application. Wish and generation data are stored in browser `localStorage`; the generation flow creates a deterministic concept from category presets and automatically completes after a short local timer. The result screen renders a designed concept card, not generated image, video, or audio media.

Keep the existing visual system and page structure. Build the production foundation incrementally rather than replacing the prototype.

## 2. Current implementation audit

| Area | Current state | Next action |
|---|---|---|
| Landing | Brand-led landing page, examples, CTA | Keep; refine after generation integration |
| My Manifest | Local Wish list and recent/favorite shelves | Keep; later move reads to authenticated API |
| Wish CRUD | Create, edit, delete, detail | Keep; add backend persistence and validation |
| Personalization | Style, mood, presence, output format | Keep the simple guided approach; add optional reference upload later |
| Concept interpretation | Category-based static scenes, palettes and affirmations | Replace with an AI-generated structured creative brief |
| Generation status | Local processing state and timed completion | Replace with persisted asynchronous jobs |
| Result | CSS concept visualization and affirmation | Replace/augment with actual media player or image viewer |
| Download | Exports a PNG concept card | Keep as a clearly labelled preview export until media exists |
| Persistence | `localStorage` key `manifest.space` | Replace with Supabase after auth and schema are ready |
| Authentication | No real authentication | Add Supabase Auth before public multi-user launch |
| Storage | No remote media storage | Add R2 or equivalent object storage |
| Tests / CI | No test or CI scripts in package.json | Add typecheck/build workflow first |

## 3. Important product and engineering findings

### 3.1 The Wish / Generation separation is already present

The domain model has separate `Wish` and `Generation` types, and a Wish can have multiple generations. Preserve this relationship. A generation should remain immutable in terms of its original inputs and creative brief, even if the Wish is edited later.

### 3.2 The current generation is a prototype simulation

`StoreProvider.createWish` and `envision` create local generation records. `Ritual` marks them completed after a fixed timer. There is no provider request, job ID, callback, media URL, or persistent remote asset.

This is acceptable for a clickable prototype, but the UI must identify the output as a concept preview until a real provider is connected. Do not describe the timer as AI generation progress.

### 3.3 Current interpretation is not sufficiently personalized

`interpret()` uses the Wish description to suggest a title, but the scene and affirmation are selected from static category dictionaries. The user's specific locations, people, lifestyle details, and emotional nuance are not carried through into the concept.

Replace this seam with a structured interpreter contract. It should accept the full Wish and personalization input, and return a validated creative brief. Keep provider-specific prompts out of React components.

### 3.4 Local storage is not a production persistence layer

The current app has no account boundary, server authorization, cross-device sync, or remote backup. Do not add API secrets or provider calls to the browser. Move user-owned data behind authenticated server APIs and database row-level security.

## 4. Recommended implementation sequence

### PR 1 — Make the prototype honest (this PR)

- Label current output as a concept preview.
- Remove misleading Play / Listen wording where no media exists.
- Label the download as a concept-card export.
- Document the current implementation and the production roadmap.

### PR 2 — Data and authentication foundation

- Add Supabase project configuration through environment variables.
- Add Supabase Auth and profile bootstrap.
- Add migrations for `profiles`, `wishes`, `generations`, `media_assets`, `favorites`, and `usage_records`.
- Add RLS policies and ownership tests.
- Migrate the store from localStorage to repository/service interfaces.
- Keep local demo mode only as an explicit development fallback.

### PR 3 — Personalized creative brief

- Define a versioned `CreativeBrief` schema.
- Include wish intent, desired emotional state, scene, subject/presence, visual direction, palette guidance, affirmation, and negative constraints.
- Add a server-side interpreter adapter.
- Validate model output and persist the brief with the generation record.
- Add representative tests for wealth, love, career, lifestyle, health, and ambiguous wishes.

### PR 4 — First real media generation path

- Start with one format and one provider; recommend image first for cost and iteration speed, while keeping video as the hero experience.
- Add an asynchronous generation job model with `pending / processing / completed / failed`.
- Persist provider job IDs and sanitized errors.
- Add webhook verification or bounded polling.
- Store completed media in object storage and save metadata in the database.
- Render actual media on the Result page.

### PR 5 — Video, audio, quotas, and release hardening

- Add video and audio adapters behind the same provider interface.
- Enforce quotas server-side and make costs configurable.
- Add retry policy, timeout handling, idempotency, and failure recovery.
- Add media retention and deletion behavior.
- Add analytics, error monitoring, privacy/terms pages, and mobile QA.

## 5. Proposed production data contracts

Keep the core objects conceptually separate:

- **Wish:** what the user wants to experience.
- **Generation:** one attempt to create a manifestation from a Wish and a specific set of inputs.
- **CreativeBrief:** the structured interpretation that guides media creation.
- **MediaAsset:** the actual generated file, with storage key, MIME type, dimensions, duration, and ownership.

Suggested generation fields to add as backend work begins:

- `input_snapshot` — immutable snapshot of Wish and personalization inputs
- `creative_brief` — validated structured interpretation
- `provider` and `provider_job_id`
- `status`, `error_code`, and sanitized `error_message`
- `created_at`, `started_at`, `completed_at`
- `idempotency_key`

A successful generation should not be considered complete until at least one valid media asset has been stored and associated with it. A concept-only preview is a separate prototype state.

## 6. Non-goals for the next implementation cycle

Do not build a public Discover feed, social graph, complex editor, daily email delivery, payment system, or multiple provider integrations yet.

Do not expose prompts, model names, or provider settings to end users.

Do not generate a new video automatically for every Wish until cost, latency, and quality have been measured.

## 7. Definition of done for the production generation milestone

- A user can create a Wish and start a generation from it.
- The server validates ownership and quota before provider submission.
- The job survives page refresh and navigation.
- The user sees truthful pending / processing / completed / failed states.
- Completion means a real media file exists in storage.
- The result is linked to the correct Wish and user.
- Failed or timed-out jobs can be retried without duplicate billing.
- No provider secret is present in frontend bundles.
- The generated media can be viewed or played on mobile and desktop.
