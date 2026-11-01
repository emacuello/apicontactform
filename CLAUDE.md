# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Backend for the portfolio contact form: a NestJS 11 API that saves submissions to Postgres and publishes an event to RabbitMQ. A separate service consumes that event and sends the email. User-facing messages are in Spanish.

## Commands

pnpm only (`packageManager` in package.json); Node 24 (`engines`).

```bash
pnpm start:dev           # watch mode
pnpm build               # nest build -> dist/
pnpm lint                # eslint --fix (prettier rule is disabled)
pnpm test                # jest unit tests (rootDir: src, *.spec.ts), ESM via --experimental-vm-modules
pnpm test -- src/contact/contact.service.spec.ts   # single file
pnpm test -- -t "should be defined"                # by test name
pnpm test:e2e            # test/jest-e2e.json
```

`pnpm-workspace.yaml` holds `allowBuilds` (install-script approvals for pnpm).

## Environment

There is no `.env` in the repo. `src/config/env.ts` loads `dotenv` and validates `process.env` with Joi **at import time**, so anything that imports `envs` throws on load if a variable is missing. That includes tests: `contact.controller.spec.ts` fails with `"HOST_REDIS" is required` when no env is set.

Required: `PORT`, `DB_URL`, `HOST_RMQ`, `QUEUE_RMQ`, `CUSTOM_HEADER_KEY`, `CUSTOM_HEADER_VALUE`, `JWT_SECRET`, `CAPTCHA_SECRET`, `CAPTCHA_URL`, and `HOST_REDIS`/`PORT_REDIS`/`PASSWORD_REDIS`. The Redis variables are required even though no code uses Redis (`ioredis` is installed but never imported).

## Architecture

Request flow, all in `src/contact/`:

1. `POST /contact/form-token`: `CustomHeaderGuard` checks that the header named by `CUSTOM_HEADER_KEY` equals `CUSTOM_HEADER_VALUE`. It returns a JWT valid for 60s with payload `{ purpose: QUEUE_RMQ }`.
2. `POST /contact`: guards run in order `JwtGuard` → `RateLimitGuard` → `CaptchaGuard`.
   - `JwtGuard` checks the custom header again, plus `Authorization: Bearer <token>` with a matching `purpose`.
   - `CaptchaGuard` verifies the `turnstile-response` header against Cloudflare Turnstile (`CAPTCHA_URL`). It takes the client IP from `cf-connecting-ip` or `x-forwarded-for`.
3. `ContactService.create` saves a `Contact` row, including the client IP, then emits to RMQ through the `CONTACT_SERVICE` ClientProxy. The pattern is `{ cmd: 'createMailContact2' }` when `subject` is present and `{ cmd: 'createMailContact' }` otherwise. These pattern names are a contract with the mail consumer. An RMQ emit failure is logged and swallowed, so the response still succeeds.

Rate limiting is `guards/rateLimit.guard.ts`: 5 requests per 60s per handler+IP, in memory per instance, applied per route through `@UseGuards`. It replaced `@nestjs/throttler`, which is CommonJS (see ESM below). `JwtModule` is registered `global: true` inside `ContactModule`. In `main.ts`, the global `ValidationPipe` is set to `whitelist` + `transform`, and CORS is open.

Config (`src/config/`):
- `config.database.ts` registers the TypeORM options as the `database` namespace. `typeorm.module.ts` spreads them into `forRootAsync`.
- Entities and migrations are globbed from `dist/`. They only load from compiled output, so the app has to be built (`nest start` does this).
- `synchronize` is off and there is no migrations folder, so the app does not manage the schema.

## ESM

The package is `"type": "module"` and tsconfig uses `module: nodenext`, so relative imports need the `.js` extension (Jest maps it back via `moduleNameMapper`). Reason: NestJS 12 is ESM-only, and Vercel's Node launcher hooks `require` and does not support `require(esm)`. Any CommonJS dependency that `require`s `@nestjs/*` crashes on Vercel with `ERR_REQUIRE_ESM` even though it works locally.

## Tests

The specs are Nest CLI scaffolding and currently fail:
- `contact.service.spec.ts`: no mocks for the TypeORM repository or the `CONTACT_SERVICE` client.
- `contact.controller.spec.ts`: env validation fails on import, and `JwtService` is missing.
- e2e: expects `'Hello World!'`, but `AppService` returns `'Hello World! Contact Form Back - emacuello'`. It also needs a real DB and RMQ.

## Deployment

A push to `main` runs `.github/workflows/main.yml`: Node 24, `pnpm install --frozen-lockfile`, build, then deploy to Vercel prod (project `contact-form-api`, domain `api-contacto.emacuello.dev`) with `amondnet/vercel-action`. The Vercel project has no Git integration; the action is the only deploy path. `vercel.json` uses the legacy `builds` config with `@vercel/node` on `dist/main.js` and sends all routes to it. The `Dockerfile` is a separate multi-stage build on node:24-alpine with pnpm via corepack (dumb-init, non-root user, port 3000).
