<div align="center">

# CourtGrid

**Sports Court Reservation Platform**: Futsal and badminton booking system for sports centers.

Built with Next.js 16 (App Router), React 19, TypeScript, PostgreSQL (Supabase), Prisma 7, NextAuth v5, and Stripe.

[![Next.js](https://img.shields.io/badge/Next.js-16.2-000000?logo=next.js&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Prisma](https://img.shields.io/badge/Prisma-7.8-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?logo=postgresql&logoColor=white)](https://supabase.com)
[![NextAuth](https://img.shields.io/badge/NextAuth.js-v5_Beta-000000?logo=auth0&logoColor=white)](https://next-auth.js.org)
[![Stripe](https://img.shields.io/badge/Stripe-Checkout-635BFF?logo=stripe&logoColor=white)](https://stripe.com)
[![Playwright](https://img.shields.io/badge/Playwright-E2E-2EAD33?logo=playwright&logoColor=white)](https://playwright.dev)

</div>

---

## Overview

CourtGrid is an online court booking system for futsal and badminton facilities. It provides live court availability checks, hourly slot reservations with a 50% down payment via Stripe Checkout, and an admin management dashboard with QR e-ticket verification.

The platform includes role-based access control (Admin and Customer), digital e-tickets with real-time status tracking, automated slot locking, promo vouchers, and automated ghost-booking cancellation.

---

## Core Engineering Invariants

- **Atomic Double-Booking Prevention**: Court availability operates on half-open intervals `[start_time, end_time)`. A database-level unique constraint on `@@unique([courtId, date, startTime])` in PostgreSQL serves as a backstop, catching concurrent race conditions (`P2002`) atomically.
- **Server-Authoritative Timezone Handling**: All date math, past-slot rejections, and availability evaluations run strictly in **Asia/Jakarta (WIB, UTC+7)**. The server clock is authoritative; client-side timestamps are never trusted.
- **Single-Owner Ghost Booking Auto-Cancel**: Centralized cleanup routine cancels stale `PENDING` bookings that exceed the configured timeout (`Setting.autoCancelTimeout`, default 15 minutes) and lack a `stripeSessionId`. Active Stripe checkouts are never prematurely released.
- **Strict Payment & Webhook Lifecycle**: Reservation status transitions through `PENDING → DP_PAID → DONE` (or `CANCELED`). Webhook handlers verify Stripe HMAC signatures and fulfill bookings only when `event.type === "checkout.session.completed"` and `session.payment_status === "paid"`.
- **Data Access Layer (DAL) Isolation**: UI components never query Prisma directly. Mutations use Next.js Server Actions with Zod validation, session verification, and `$transaction` blocks. Read queries consume DTOs through `features/**/dal.ts` cached via React `cache()`.
- **Global Admin UI State**: Ticket scanner modal state is managed through a lightweight Zustand store (`stores/useBoundStore.ts`), allowing admins to open the scanner from any admin page or topbar without prop drilling or route changes.
- **Pre-Upload Image Pipeline**: User avatars and court photos pass through server-side `sharp` processing to convert and compress to WebP before storing in Supabase Storage buckets.
- **Rate Limiting & Protection**: Public mutation endpoints and court lookup endpoints are guarded by `@upstash/ratelimit` with Redis sliding window algorithms.

---

## Tech Stack

| Layer | Technology | Details |
|---|---|---|
| **Framework** | Next.js 16 (App Router) | React Server Components (RSC), Server Actions, Turbopack |
| **Language** | TypeScript 5 | Strict typing across DAL, actions, and schemas |
| **Styling & UI** | Tailwind CSS v4, Base UI, Radix UI | Utility-first styling, accessible primitives, and fluid Motion transitions |
| **Database & ORM** | PostgreSQL (Supabase), Prisma 7 | Schema models, relational constraints, `@prisma/adapter-pg` pooler |
| **Authentication** | NextAuth.js v5 (Beta) | JWT session strategy, Credentials (bcryptjs), Google & Facebook OAuth |
| **Payments** | Stripe Checkout | 50% down payment sessions with webhook signature validation |
| **State & Fetching** | TanStack Query 5, Nuqs, Zustand | Asynchronous query caching, URL search param state, and global admin modal state |
| **Storage** | Supabase Storage + Sharp | WebP image optimization for court pictures and user avatars |
| **Email & Caching** | Resend, Upstash Redis | Transactional booking receipts and sliding-window rate limiting |
| **Testing & Tooling** | Node Test Runner, Playwright, Bundle Analyzer | Unit tests (`node:test` via `tsx`), E2E browser tests, and Webpack bundle analysis |

---

## Project Structure

```
sport-center-app/
├── app/
│   ├── [locale]/
│   │   ├── (public)/          # Landing page, /courts, /about, /faq, auth forms
│   │   ├── (admin)/admin/     # Admin portal (/courts, /reservations, /customers, /vouchers, /settings)
│   │   ├── dashboard/         # Customer portal (/book, /reservations, /settings)
│   │   ├── layout.tsx         # Root locale layout with next-intl and providers
│   │   └── error.tsx          # Localized error boundary
│   └── api/
│       ├── auth/[...nextauth]/# NextAuth handler
│       ├── courts/            # Public courts REST endpoint with rate limiting
│       └── webhook/           # Stripe signed webhook ingestion
├── components/
│   ├── ui/                    # Base UI, Radix UI, and base primitives
│   ├── layout/                # Header, Footer, Hero, and Navigation
│   ├── admin/                 # Admin topbar, sidebar, revenue chart, management tables
│   ├── dashboard/             # Customer booking workspace, reservation tables, e-ticket cards
│   ├── courts/                # Court catalog, slot picker, availability grid
│   └── auth/                  # Login, registration, and password recovery forms
├── features/                  # Domain business logic (actions.ts, dal.ts, schemas.ts)
│   ├── admin/                 # Metrics, customer directory, court operations
│   ├── auth/                  # Session credentials and password reset actions
│   ├── courts/                # Availability engine and court queries
│   ├── reservations/          # Booking creation, Stripe checkout, auto-cancel
│   ├── settings/              # Operating hours, pricing, and timeout controls
│   └── vouchers/              # Promo code validation and discount math
├── stores/                    # Zustand store slices (useBoundStore.ts)
├── lib/                       # Singletons and utilities (prisma, stripe, resend, redis, ratelimit, timezone)
├── messages/                  # Localization files (id.json, en.json)
├── prisma/
│   ├── schema.prisma          # Database models, constraints, and indexes
│   ├── migrations/            # SQL migration history
│   └── seed.ts                # Idempotent seed script (Venue, Admin, Courts, Demo data)
├── tests/ & __tests__/        # Acceptance criteria, double-booking, and timezone test suites
│   └── e2e/                   # Playwright end-to-end smoke tests
├── scripts/                   # Database connectivity and diagnostic tools
├── playwright.config.ts       # Playwright configuration
├── next.config.ts             # Next.js configuration with bundle analyzer integration
└── package.json
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 20.x
- **pnpm** ≥ 9.x
- **PostgreSQL** database (Supabase instance)
- **Stripe Account** & [Stripe CLI](https://docs.stripe.com/stripe-cli) (for local webhooks)
- **Resend Account** (for transactional emails)
- **Upstash Redis** (optional for local dev, required for rate limiting in production)

### 1. Installation

```bash
git clone https://github.com/Jejekdf/Courtgrid.git
cd Courtgrid
pnpm install
```

### 2. Environment Setup

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

### 3. Database Initialization & Seeding

Generate the Prisma client, check migration status, and seed default records (Venue, Super Admin, and Courts):

```bash
pnpm prisma generate
pnpm prisma migrate status
pnpm prisma db seed
```

> To seed a demo customer account and test bookings, set `SEED_DEMO="true"` in your `.env`.

### 4. Start Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Local Stripe Webhooks (Optional)

To test Stripe payment completion locally, forward events with the Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/webhook
```

Copy the webhook secret (`whsec_...`) and update `STRIPE_WEBHOOK_SECRET` in your `.env`.

---

## Available Scripts

| Script | Purpose |
|---|---|
| `pnpm dev` | Starts Next.js development server with Turbopack |
| `pnpm build` | Compiles production application build |
| `pnpm start` | Starts Next.js production server |
| `pnpm vercel-build` | Generates Prisma client and builds application (for deployment) |
| `pnpm lint` | Runs ESLint validation |
| `pnpm test` | Runs unit and integration tests via `node:test` and `tsx` |
| `pnpm test:e2e` | Runs Playwright end-to-end smoke test suite |
| `pnpm analyze` | Runs Next.js build with Webpack bundle analysis |
| `pnpm db:test` | Tests PostgreSQL database pool connection |
| `pnpm db:studio` | Opens Prisma Studio GUI |

---

## Environment Variables Reference

| Variable | Required | Purpose |
|---|:---:|---|
| `DATABASE_URL` | Yes | Supabase PostgreSQL pooled connection string |
| `DIRECT_URL` | Yes | Supabase PostgreSQL direct connection string |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase API endpoint |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase public anonymous key |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes | Supabase publishable key |
| `SUPABASE_SECRET_KEY` | Yes | Supabase service-role secret key (storage admin) |
| `AUTH_URL` | Yes | App base URL (`http://localhost:3000` for local dev) |
| `AUTH_SECRET` | Yes | NextAuth secret key (`openssl rand -base64 32`) |
| `STRIPE_SECRET_KEY` | Yes | Stripe secret API key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe webhook signing secret |
| `RESEND_API_KEY` | Yes | Resend API key |
| `RESEND_FROM_EMAIL` | Yes | Verified sender email address |
| `NEXT_PUBLIC_APP_URL` | Yes | Public application URL for checkout callbacks |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAMA` | Seed | Credentials to initialize the Super Admin account during database seeding |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Optional | Upstash Redis connection (gracefully skipped if omitted in dev) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Optional | Google OAuth login provider |
| `FACEBOOK_CLIENT_ID` / `FACEBOOK_CLIENT_SECRET` | Optional | Facebook OAuth login provider |
| `SEED_DEMO` | Optional | Set to `"true"` to generate demo bookings during seed |

---

## Application Routes & Access Control

User routes are localized under `/[locale]` (`/id` default, `/en`).

### Public (`(public)`)
- `/` — Homepage with court previews, guide steps, and venue facilities.
- `/courts` — Public court catalog with type filtering and real-time slot checker.
- `/about` · `/faq` · `/terms` · `/privacy` — Information and terms.
- `/login` · `/register` · `/forgot-password` · `/reset-password` — Authentication flows.

### Customer Portal (`Role: CUSTOMER`)
- `/dashboard` — Active bookings overview, quick booking access, and stats.
- `/dashboard/book` — Interactive reservation workspace with court selector and slot picker.
- `/dashboard/reservations` — Booking history, payment settlement status, and QR e-tickets.
- `/dashboard/settings` — Profile settings, avatar upload, and password management.

### Super Admin Portal (`Role: ADMIN`)
- `/admin` — Revenue metrics, booking volume, and overview dashboard.
- `/admin/courts` — Court CRUD management with photo uploads.
- `/admin/reservations` — Reservation ledger, check-in controls, and manual cancellations.
- `/admin/customers` — Customer directory and reservation statistics.
- `/admin/vouchers` — Promo code configuration, discount rules, and usage caps.
- `/admin/settings` — Operational hours, down payment percentage, and auto-cancel timeout.

---

## License

Distributed under the [MIT License](LICENSE).