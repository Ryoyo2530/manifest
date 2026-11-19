# Supabase setup

This increment adds email/password authentication and the initial relational schema. Wish and generation data remain in the existing local prototype store for now; cloud persistence and migration of local data are a separate follow-up.

## 1. Create a project and configure local development

Create a Supabase project. In **Project Settings → API**, copy the Project URL and public anon/publishable key.

```bash
cp .env.example .env
```

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, then restart Vite.

Only the public anon/publishable key belongs in a browser app. Never put the `service_role` key in Vite variables or commit secrets.

## 2. Apply the schema

Apply `supabase/migrations/202611190001_initial_schema.sql` in the Supabase SQL Editor, or install the Supabase CLI and run:

```bash
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

The migration creates profiles, wishes, generations, media_assets, favorites, and usage_records. RLS is enabled on every table. Composite ownership foreign keys ensure a generation belongs to the same user as its Wish, and a media asset/favorite/usage record belongs to the same user as its Generation.

## 3. Configure email authentication

In **Authentication → URL Configuration**, set the Site URL to your deployed app and add local/deployment URLs to the redirect allow list.

In **Authentication → Providers → Email**, configure email confirmation according to your launch policy. If confirmation is enabled, sign-up displays a check-your-email message; the user can sign in after confirming.

Configure SMTP before production launch. Supabase's default email service is rate-limited and intended for evaluation.

## 4. What this PR implements

- Email/password sign-up and sign-in.
- Password reset email request.
- Sign-out and persisted/refreshable auth sessions.
- Profile bootstrap from Auth user metadata through a database trigger.
- Account page auth states and a no-configuration fallback for the existing local prototype.

## 5. Important boundaries

- Signing in does **not** yet sync existing local wishes across devices. The current Wish/Generation store remains localStorage until the next persistence PR.
- The password reset email is sent, but a dedicated reset-password callback page and password update flow are not included yet.
- Account deletion and email-change flows are not implemented.
- Before public launch, add automated RLS integration tests, production SMTP, CAPTCHA/rate-limit protections, and verified recovery redirects.
