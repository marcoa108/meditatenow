# MeditateNow (Web)

Responsive web app for dynamically generated Sahaja Yoga meditations.

## Stack
- Next.js 14 (App Router) + TypeScript + Tailwind
- Auth: NextAuth (Credentials) + email verification (Resend)
- DB/ORM: Prisma + SQLite (dev)
- i18n: next-intl (EN only for now)

## Local setup
1. Install Node.js (LTS 18+ recommended) and npm.
2. Install deps:
   `
   cd web
   npm install
   `
3. Env:
   Copy .env.example to .env and fill values.
   - RESEND_API_KEY (optional in dev; links will log to console)
4. DB:
   `
   npx prisma migrate dev --name init
   npx prisma db seed
   `
5. Run:
   `
   npm run dev
   `

## App routes
- / Home: Journey + 4 actions
- /auth/signup, /auth/signin
- /onboarding
- /meditate/feel-sahaj, /meditate/new
- /history, /community, /settings

## Notes
- Audio catalog is mocked; player will support sequential playback and silence inserts. Placeholder audio to be added.
- Beginner course placeholders: Meditation n.1, n.2, n.3… (to be defined).
