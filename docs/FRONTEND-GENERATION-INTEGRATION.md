# Frontend generation API integration

For signed-in users, Create Wish persists the Wish and Generation through the Cloudflare Worker before entering the ritual.

Set `VITE_MANIFEST_API_URL` to the deployed Worker origin and configure Worker secrets/vars as described in [GENERATION-API.md](./GENERATION-API.md).

- `POST /api/wishes` creates a user-owned Wish and returns its database UUID.
- `POST /api/generations` creates a pending Generation linked to that Wish.
- The browser sends the current Supabase access token; the Worker validates it and forwards it to Supabase so RLS remains authoritative.
- Signed-out prototype use remains local and keeps the concept-preview behavior.

Existing pre-integration Wishes remain local-only. Re-envisioning one while signed in will fail until that Wish has been persisted; full My Manifest synchronization is a separate persistence increment. A pending Generation is only a stored request. No AI provider is called in this increment.
