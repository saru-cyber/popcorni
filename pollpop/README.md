# PollPop

リアルタイム5択投票 SaaS（Free版 MVP）

## Setup

```bash
npm install
cp .env.local.example .env.local
# Edit .env.local with your Supabase URL + anon key
# Set NEXT_PUBLIC_APP_URL to your public site URL (local or Vercel)
```

1. Create a Supabase project
2. Run `supabase/schema.sql` in the SQL Editor
3. Enable Realtime for `polls` / `votes` (schema already adds them to the publication)
4. On Vercel, set env vars including `NEXT_PUBLIC_APP_URL=https://pollpop-ruddy.vercel.app`
5. Start the app:

```bash
npm run dev
```

Open [http://localhost:3002](http://localhost:3002)

Share / QR / OBS links use `NEXT_PUBLIC_APP_URL` when set, otherwise `window.location.origin`.

## Routes

| Path | Description |
|------|-------------|
| `/` | Create poll (guest, 1 active poll) |
| `/poll/[id]` | Voter UI + combo |
| `/poll/[id]/admin` | QR / share / live chart / close |
| `/poll/[id]/obs` | Transparent Animal Race for OBS |
