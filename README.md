# Aunty Eve's Place — Frontend

Next.js dashboard for daycare attendance.

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS + shadcn-style components
- Lucide icons · Framer Motion
- JWT auth via backend Google OAuth

## Local setup

1. Copy env and point at your API:

```bash
cp .env.local.example .env.local
```

2. Install and run:

```bash
npm install
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000)

## Backend requirements

Set these on **AEP-backend**:

```
FRONTEND_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000
```

OAuth callback redirects to `/auth/callback` with tokens, which are stored in `localStorage` and immediately stripped from the URL.

## Pages

| Route | Access |
|-------|--------|
| `/login` | Public |
| `/auth/callback` | OAuth return |
| `/attendance` | All staff |
| `/students` | Admin |
| `/teachers` | Admin |
| `/logs` | Admin |

## Deploy (Vercel)

1. Set `NEXT_PUBLIC_API_URL` to your Render API URL.
2. Set backend `FRONTEND_URL` and `CORS_ORIGINS` to your Vercel domain.
