# My Manifest cloud persistence

Signed-in sessions load Wishes, Generations, and saved/favorite state from the authenticated Cloudflare Worker API. The Worker forwards the user's Supabase access token to PostgREST, so row-level security remains the ownership boundary.

## Routes added
- `GET /api/space`: load the authenticated user's Wishes, Generations, and Favorites.
- `PATCH /api/wishes/:id`: update title, description, and category.
- `DELETE /api/wishes/:id`: delete a Wish; related generations and favorites cascade through the schema.
- `POST /api/favorites/:generationId`: keep a generation.
- `DELETE /api/favorites/:generationId`: remove it from Keeps.

Signed-in changes are sent to the API before the local view is updated. Signing out clears signed-in data from the browser space. Signed-out prototype data remains device-local and is not automatically imported into an account in this increment.

Set `VITE_MANIFEST_API_URL` to the deployed Worker origin. Worker configuration is described in [GENERATION-API.md](./GENERATION-API.md). No provider is invoked; pending generations remain pending.
