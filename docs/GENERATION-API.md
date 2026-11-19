# Generation API (first backend increment)

This Worker creates and reads durable Generation records. It does **not** call an image, video, or audio provider yet. A successful create response means the request was accepted and stored with `pending` status; it is not a claim that media generation has started.

## Routes

### `POST /api/wishes`

Requires `Authorization: Bearer <Supabase access token>`. Accepts `{ "title": "...", "description": "...", "category": "Love & Relationships" }`, validates the five supported Wish categories, and creates a user-owned Wish. Returns `201` and the created Wish. The authenticated user ID is assigned by the Worker; the browser cannot choose an owner.

### `POST /api/generations`

Requires `Authorization: Bearer <Supabase access token>`.

Request:

```json
{
  "wish_id": "UUID",
  "output_type": "image",
  "style": "Dreamy",
  "mood": "Peaceful",
  "presence": "environment",
  "creative_brief": { "schemaVersion": "1.0" },
  "idempotency_key": "client-generated-stable-key"
}
```

The Worker validates the session through Supabase Auth, checks that the Wish is visible under the caller's RLS context, and inserts a Generation using the same user token. The database RLS policy remains the ownership boundary. Repeating a request with the same idempotency key returns the existing task.

Responses: `202` for a newly accepted task, `200` for an idempotent replay, `400` invalid input, `401` invalid session, `404` Wish not found, and `5xx` for infrastructure errors.

### `GET /api/generations/:id`

Requires the same bearer token and returns the task only when it is visible to the caller under RLS.

## Configure and deploy

1. In Cloudflare, create a Worker named `manifest-api`.
2. Set Worker secrets:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY` (public anon/publishable key; use a Worker secret for configuration hygiene)
3. Set `ALLOWED_ORIGIN` in `wrangler.toml` to the actual Pages origin (no trailing slash).
4. Install Wrangler locally and deploy:

```bash
npm install --save-dev wrangler
npx wrangler deploy
```

Do not set a Supabase service-role key. The Worker forwards the user's access token to PostgREST, so Supabase RLS enforces ownership. The next increment will connect the frontend to these endpoints and add a real provider/queue adapter; until then the existing local concept-preview flow remains unchanged.
