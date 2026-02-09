# CareCircle

CareCircle is a warm, mobile-first care coordination app for families caring for aging parents.

It includes a landing page plus a demo dashboard featuring:
- Medication tracking (with an interactive daily checklist)
- Caregiver schedule (weekly calendar)
- Care log feed (with category filters)
- Appointments (upcoming vs past)
- Team management (members + emergency contacts)
- Settings (profile, billing placeholder, notification toggles)

## Tech Stack
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Supabase (client libs included; auth wiring is UI-only for now)
- Stripe (placeholder wiring)

## Getting Started

### 1) Install dependencies
```bash
npm install
```

### 2) Environment variables
Copy `.env.example` to `.env.local` and fill in values as needed:
```bash
cp .env.example .env.local
```

### 3) Run the dev server
```bash
npm run dev
```

Then open http://localhost:3000

## Demo Auth / Middleware
Dashboard routes (`/dashboard/*`) are protected by `src/middleware.ts`.

For now, it checks for a `cc_demo_session` cookie. To access the dashboard in development, set the cookie in your browser:
- Open DevTools → Application → Cookies
- Add a cookie named `cc_demo_session` with any value

(Real Supabase auth wiring can replace this later.)

## Project Structure
- `src/app/` — Next.js App Router pages
- `src/components/` — UI + layout + landing components
- `src/lib/demo-data.ts` — rich demo data used across the dashboard
- `src/types/` — shared TypeScript types

## Scripts
- `npm run dev` — start development server
- `npm run build` — production build
- `npm run start` — start production server
- `npm run lint` — run lint
