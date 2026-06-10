# create-startup-file

Interactive CLI to scaffold a **NestJS RBAC backend + Next.js web app** with JWT auth, role guards, Drizzle ORM, PostgreSQL, and Swagger API docs.

## Features

Generated projects include:

- JWT authentication (access + refresh tokens)
- Role-based access control (RBAC)
- Drizzle ORM + PostgreSQL
- Swagger docs at `/api/docs`
- Next.js web app at `apps/web` with `main website` + `admin` routes in one app
- Admin-only route protection in web middleware based on authenticated role
- Global validation, logging, response transform, and exception filters

## Quick start

```bash
npx create-startup-file
```

Or with a project name:

```bash
npx create-startup-file my-admin-app
```

## Interactive prompts

The CLI asks for:

- **Project name** (root npm package name)
- **Version**
- **Description**
- **Author**
- **License** (MIT, Apache-2.0, ISC, UNLICENSED)
- **Keywords**
- **Target directory**

Package naming:

- Root package: `my-admin-app`
- Backend package: `my-admin-app-backend`
- Scoped example: `@acme/my-app` → `@acme/my-app-backend`

## Non-interactive mode

```bash
npx create-startup-file my-admin-app -y \
  --version 1.0.0 \
  --description "My admin API" \
  --author "Your Name" \
  --license MIT \
  --keywords "nestjs,rbac,api"
```

### CLI options

| Flag | Description |
|------|-------------|
| `-y`, `--yes` | Use defaults (requires project name) |
| `--version` | Project version (default: `1.0.0`) |
| `--description` | Project description |
| `--author` | Author name |
| `--license` | License identifier |
| `--keywords` | Comma-separated keywords |
| `--directory` | Output directory (default: project name) |
| `-h`, `--help` | Show help |

## After scaffolding

```bash
cd my-admin-app
npm run backend:install
npm run web:install
cp apps/backend/.env.example apps/backend/.env
cp apps/web/.env.example apps/web/.env
npm run backend:db:push
npm run backend:dev
npm run web:dev
```

Open API docs: `http://localhost:3000/api/docs`
Open web app: `http://localhost:3001`

## Web ↔ Backend auth flow

The web app does not call NestJS directly from the browser. It uses Next.js API routes as a proxy (BFF):

- `POST /api/auth/login` → proxies to backend `POST /auth/login`
- `POST /api/auth/refresh` → proxies to backend `POST /auth/refresh`
- `GET /api/auth/session` → reads access token and refreshes it when expired
- `GET /api/backend/*` → proxies authenticated requests to the backend with `Authorization: Bearer <accessToken>`

Access and refresh tokens are stored in httpOnly cookies. Admin routes are protected in `apps/web/proxy.ts` using backend JWT roles.

## Generated scripts

| Script | Description |
|--------|-------------|
| `npm run backend:install` | Install backend dependencies |
| `npm run web:install` | Install web dependencies |
| `npm run backend:dev` | Start backend in watch mode |
| `npm run web:dev` | Start Next.js web app |
| `npm run backend:build` | Build backend |
| `npm run web:build` | Build Next.js web app |
| `npm run web:start` | Start built Next.js web app |
| `npm run backend:test` | Run backend tests |
| `npm run backend:db:push` | Push Drizzle schema to database |
| `npm run backend:db:migrate` | Run Drizzle migrations |
| `npm run backend:db:generate` | Generate Drizzle migrations |
| `npm run backend:db:studio` | Open Drizzle Studio |

## Requirements

- Node.js `>=18`
- PostgreSQL database

## Environment variables

Configure `apps/backend/.env`:

- `DATABASE_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `PORT` (optional, default `3000`)

Configure `apps/web/.env`:

- `BACKEND_API_URL` (default `http://localhost:3000`)

## Local development (this repo)

```bash
npm install
npm run sync:template
npm run create:local
```

Publish flow:

```bash
npm version patch
npm publish --access public
```

## License

MIT
