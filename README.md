# WhatsApp Print Manager — Admin Portal

Admin portal built with Next.js (App Router) and Prisma. There is also an optional NestJS backend for running the API separately.

## Prerequisites
- Node.js 18+ (or 20)
- npm
- PostgreSQL (Supabase supported)

## Setup (Next.js app)
1. Install dependencies (from repo root):

```bash
npm install
```

2. Create a local env file by copying the example at [.env.local.example](.env.local.example) and filling in your values.

3. Set up the database (from repo root):

```bash
npx prisma migrate dev
```

4. Start the dev server:

```bash
npm run dev
```

Open http://localhost:3000

### Environment variables (Next.js app)
These are defined in [.env.local.example](.env.local.example).

| Name | Purpose |
| --- | --- |
| `DATABASE_URL` | Pooled connection string for runtime queries. Supabase pooler uses port 6543 with `pgbouncer=true`. |
| `DIRECT_URL` | Direct connection string for Prisma migrations (port 5432). |
| `JWT_SECRET` | Secret used to sign admin JWTs. |
| `ADMIN_USERNAME` | Default admin username. |
| `ADMIN_PASSWORD` | Default admin password. |

## Optional: Run the NestJS backend
From [backend/](backend/):

```bash
npm install
npm run start:dev
```

The backend reads its settings from [backend/.env.example](backend/.env.example). Create the backend dotenv file by copying that example and updating the values. The default port is 3001.

If you want the Next.js UI to call the Nest API instead of the built-in Next API routes, update the Axios base URL in [src/lib/api.ts](src/lib/api.ts) (for example, `http://localhost:3001`), or add a proxy in Next.

### Environment variables (NestJS backend)
These are defined in [backend/.env.example](backend/.env.example).

| Name | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres connection string. |
| `JWT_SECRET` | Secret used to sign tokens. |
| `ADMIN_USERNAME` | Default admin username. |
| `ADMIN_PASSWORD` | Default admin password. |
| `PORT` | Backend server port (default 3001). |

## Production
- Build Next.js: `npm run build`
- Start Next.js: `npm run start`
- For Vercel, add the same env variables in Project Settings.

## Notes
- Prisma schema: [prisma/schema.prisma](prisma/schema.prisma)
