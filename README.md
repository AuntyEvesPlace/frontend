# Aunty Eve's Place — Frontend

Next.js dashboard for daycare attendance.

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS + shadcn-style components
- Lucide icons · Framer Motion
- JWT auth via backend local login or Google / Microsoft / Yahoo OAuth

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

Username/password login posts to `POST /api/v1/auth/login` and stores the same JWT pair.

## Pages

| Route | Access |
|-------|--------|
| `/login` | Public — username/password form, then OAuth buttons |
| `/auth/callback` | OAuth return |
| `/attendance` | All staff — mark today; packed lunch here is one day only |
| `/calendar` | All staff — teachers read-only; admins edit holidays and weekly lunch rules |
| `/students` | Admin |
| `/teachers` | Admin — invite by email (OAuth) or username (generated password once); reset local passwords |
| `/logs` | Admin |

`/lunch-rules` redirects to `/calendar`.

## Attendance and calendar

**School days** show before/after 12, absent, packed lunch, and no lunch. **Holidays** hide packed lunch and no lunch; before/after 12 and absent stay.

Weekly packed-lunch rules are created on Calendar (search student by name, pick a weekday). Cancelling a rule from Calendar stops future weeks; unmarking lunch on Attendance only changes that calendar day.

## Deploy (Vercel)

1. Set `NEXT_PUBLIC_API_URL` to your Render API URL.
2. Set backend `FRONTEND_URL` and `CORS_ORIGINS` to your Vercel domain.
