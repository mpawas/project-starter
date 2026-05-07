# NestJS RBAC Boilerplate

Production-ready NestJS backend starter with:

- JWT authentication (access + refresh token)
- Role-based authorization guards
- Prisma ORM + PostgreSQL
- Global validation, logging interceptor, response interceptor, and exception filter

## Setup

```bash
npm install
cp .env.example .env
```

## Environment

Required env variables:

- `DATABASE_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`

Optional:

- `PORT` (default `3000`)
- `JWT_ACCESS_EXPIRES_IN` (default `15m`)
- `JWT_REFRESH_EXPIRES_IN` (default `7d`)

## Database

```bash
npm run prisma:migrate -- --name init
npm run prisma:seed
```

## Run

```bash
npm run start:dev
```

## Publish

Set the package name in `package.json`, then:

```bash
npm run build
npm publish --access public
```

## API Endpoints

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `GET /users/:id` (admin only)
- `PATCH /users/:id/roles` (admin only)
- `GET /roles` (admin only)
- `GET /health`
