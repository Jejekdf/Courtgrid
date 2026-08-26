<div align="center">

# CourtGrid

**Sports Court Reservation Platform** — Futsal & Badminton booking system for **SM Sport Center**.

Built with Next.js 16 (App Router), React 19, TypeScript, PostgreSQL (Supabase), Prisma 7, NextAuth v5, and Stripe.

[![Next.js](https://img.shields.io/badge/Next.js-16.2-000000?logo=next.js&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Prisma](https://img.shields.io/badge/Prisma-7.8-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?logo=postgresql&logoColor=white)](https://supabase.com)
[![NextAuth](https://img.shields.io/badge/NextAuth.js-v5_Beta-000000?logo=auth0&logoColor=white)](https://next-auth.js.org)
[![Stripe](https://img.shields.io/badge/Stripe-Checkout-635BFF?logo=stripe&logoColor=white)](https://stripe.com)
[![Upstash](https://img.shields.io/badge/Upstash-Redis_%26_Ratelimit-00E599?logo=redis&logoColor=black)](https://upstash.com)

</div>

---

## 📌 Overview

**CourtGrid** is a full-stack court booking and management platform designed for sports facilities. It enables customers to check real-time court availability, book hourly slots for futsal and badminton, apply discount vouchers, and secure reservations via **50% Down Payment (DP)** through Stripe Checkout.

The application features role-based access control (RBAC), a customer portal with e-tickets and booking history, and a back-office administration panel for court catalog management, financial reports, voucher controls, and real-time e-ticket QR verification.

---

## 🏗 Key Architecture & Engineering Highlights

- **Atomic Double-Booking Prevention**: Enforces slot availability on half-open intervals `[start_time, end_time)`. Database-level backstop with `@@unique([courtId, date, startTime])` in PostgreSQL catches concurrent race conditions (Prisma `P2002`).
- **Server-Authoritative Timezone Handling**: All availability computations and past-date/hour validations are strictly evaluated in **Asia/Jakarta (WIB, UTC+7)** on the server.
- **Single-Owner Ghost Booking Auto-Cancel**: Automated cleanup routine (`autoCancelGhostBookings`) cancels stale `PENDING` bookings that exceed the timeout (`autoCancelTimeout`, default 15 mins) and lack an active `stripeSessionId`, ensuring active checkouts are never prematurely released.
- **Strict Payment & Webhook Lifecycle**: Reservation state machine: `PENDING → DP_PAID → DONE` or `CANCELED`. Stripe webhooks verify HMAC signatures and fulfill bookings only when `event.type === "checkout.session.completed"` AND `payment_status === "paid"`.
- **Data Access Layer (DAL) & Server Actions**: All mutations use Next.js Server Actions with Zod schema validation, session authentication, and transactional execution (`$transaction`). Components consume read-only DTOs through `src/features/**/dal.ts` with React `cache()`.
- **Pre-Upload WebP Image Optimization**: Client uploads (courts, avatars, payment proofs) pass through server-side `sharp` processing pipelines to resize and re-encode to WebP before persistence in Supabase Storage buckets.
- **Rate Limiting & Performance Caching**: Protected public and auth mutations utilize `@upstash/ratelimit` with Redis sliding window rate-limiting. High-frequency queries leverage Upstash Redis caching.
- **Dual-Locale Internationalization (i18n)**: Powered by `next-intl` (Indonesian `id-ID` default, English `en-US`), covering all UI surfaces, schemas, and notifications.

---

## 🛠 Tech Stack

| Domain | Technology | Description |
|---|---|---|
| **Framework** | [Next.js 16](https://nextjs.org) (App Router) | React Server Components (RSC), Server Actions, Turbopack |
| **Language** | [TypeScript 5](https://www.typescriptlang.org) | Strict mode typing across all DAL, actions, and schemas |
| **Frontend UI** | [Tailwind CSS v4](https://tailwindcss.com), [shadcn/ui](https://ui.shadcn.com) | Modern design system, Radix UI & Base UI primitives |
| **Animations & Charts** | [Motion](https://motion.dev), [Recharts](https://recharts.org) | Fluid UI transitions and admin financial dashboard analytics |
| **Database & ORM** | [PostgreSQL (Supabase)](https://supabase.com), [Prisma 7](https://www.prisma.io) | Relational database with `@prisma/adapter-pg` driver pooler |
| **Authentication** | [NextAuth.js v5](https://next-auth.js.org) (Beta) | JWT session strategy, Credentials (bcryptjs), Google & Facebook OAuth |
| **Payments** | [Stripe](https://stripe.com) | Stripe Checkout Sessions and signed webhook fulfillment |
| **Storage** | [Supabase Storage](https://supabase.com/storage), [Sharp](https://sharp.pixelplumbing.com) | WebP image optimization for courts, avatars, and payment proofs |
| **Caching & Rate Limit** | [Upstash Redis](https://upstash.com) | Sliding window rate limiter & customer reservation cache |
| **Transactional Email** | [Resend](https://resend.com) | Booking confirmation, payment receipts, and password resets |
| **Validation & State** | [Zod v4](https://zod.dev), [Zustand](https://zustand.docs.pmnd.rs), [TanStack Query 5](https://tanstack.com/query) | Runtime validation, client state, and asynchronous data fetching |
| **Testing** | Node.js Test Runner (`node:test`) + `tsx` | Unit and integration test suite |

---

## 📁 Project Structure

```
sport-center-app/
├── app/
│   ├── [locale]/
│   │   ├── (public)/          # Public routes (Landing, /courts, /login, /register, /faq, etc.)
│   │   ├── (admin)/admin/     # Super Admin portal (/courts, /reservations, /customers, /vouchers, /settings, /eticket)
│   │   ├── dashboard/         # Customer portal (/book, /reservations, /settings)
│   │   ├── layout.tsx         # Root locale layout with next-intl provider
│   │   └── error.tsx          # Global localized error boundary
│   └── api/
│       ├── auth/[...nextauth]/# NextAuth API route handler
│       ├── courts/            # Public courts REST endpoint
│       └── webhook/           # Stripe signed webhook ingestion endpoint
├── components/
│   ├── ui/                    # shadcn/ui & Radix/Base UI components
│   ├── layout/                # Header, Footer, Hero, Navigation
│   ├── admin/                 # Admin panels, stats charts, management tables
│   ├── dashboard/             # Customer reservation cards, e-ticket view
│   ├── courts/                # Court catalog, slot picker, availability grid
│   └── auth/                  # Login, registration, password recovery forms
├── src/
│   ├── features/              # Modular feature slices (actions.ts, dal.ts, schemas.ts)
│   │   ├── admin/             # Admin metrics, user management, court ops
│   │   ├── auth/              # Auth actions, credentials, password reset
│   │   ├── courts/            # Court fetching, availability engine
│   │   ├── notifications/     # Notification dispatching
│   │   ├── reservations/      # Booking workflow, Stripe session creation, auto-cancel
│   │   ├── settings/          # Venue operational configuration
│   │   └── vouchers/          # Voucher validation and redemption logic
│   └── stores/                # Zustand global client state slices
├── lib/                       # Singletons & Shared Utilities
│   ├── prisma.ts              # PrismaClient instance with @prisma/adapter-pg
│   ├── stripe.ts              # Stripe SDK client singleton
│   ├── resend.ts              # Resend email client singleton
│   ├── redis.ts               # Upstash Redis client
│   ├── ratelimit.ts           # Upstash rate limiters
│   ├── timezone.ts            # Asia/Jakarta date & boundary utilities
│   ├── zod.ts                 # Localized Zod validation schemas
│   └── supabase/              # Supabase admin client & Sharp image pipeline
├── messages/                  # i18n localization dictionary files (id.json, en.json)
├── prisma/
│   ├── schema.prisma          # Database models, enums, indexes, constraints
│   ├── migrations/            # SQL migration history
│   └── seed.ts                # Database seed script (Venue, Admin, Courts, Demo data)
├── scripts/                   # Utility and diagnostic scripts (test-db.ts)
├── tests/ & __tests__/        # Acceptance criteria, timezone, and double-booking tests
├── .env.example               # Template for environment variables
└── package.json               # Dependencies and build scripts
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 20.x
- **pnpm** ≥ 9.12.x (`corepack enable` recommended)
- **PostgreSQL Database** (Supabase instance)
- **Stripe Account** & [Stripe CLI](https://docs.stripe.com/stripe-cli) (for local webhook testing)
- **Resend Account** (for transactional emails)
- **Upstash Redis** (for rate limiting and cache)

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/Jejekdf/Courtgrid.git
cd Courtgrid
pnpm install
```

### 2. Configure Environment Variables

Copy the example environment file and provide your credentials:

```bash
cp .env.example .env
```

### 3. Database Migration & Seeding

Generate the Prisma client, verify schema status, and run the idempotent seed script:

```bash
pnpm prisma generate
pnpm prisma migrate status
pnpm prisma db seed
```

> **Note**: Setting `SEED_DEMO="true"` in `.env` seeds a sample customer account and pre-paid bookings for local testing.

### 4. Run Development Server

```bash
pnpm dev
```

The application will be accessible at `http://localhost:3000`.

### 5. Listen for Stripe Webhooks (Local Testing)

In a separate terminal, forward Stripe events to your local endpoint:

```bash
stripe listen --forward-to localhost:3000/api/webhook
```

Copy the printed webhook signing secret (`whsec_...`) and set it as `STRIPE_WEBHOOK_SECRET` in `.env`.

---

## ⚙️ Environment Variables Reference

| Variable | Required | Description |
|---|:---:|---|
| `DATABASE_URL` | ✅ | Supabase PostgreSQL pooled connection URL |
| `DIRECT_URL` | ✅ | Supabase PostgreSQL direct connection URL |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project API URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anonymous public key |
| `SUPABASE_SECRET_KEY` | ✅ | Supabase service-role key (used for storage upload bypass) |
| `AUTH_URL` | ✅ | Application canonical URL (`http://localhost:3000` for local dev) |
| `AUTH_SECRET` | ✅ | NextAuth encryption secret (`openssl rand -base64 32`) |
| `STRIPE_SECRET_KEY` | ✅ | Stripe secret API key (`sk_test_...`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅ | Stripe publishable key (`pk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | ✅ | Stripe webhook signing secret (`whsec_...`) |
| `RESEND_API_KEY` | ✅ | Resend API key (`re_...`) |
| `RESEND_FROM_EMAIL` | ✅ | Verified sender email address |
| `NEXT_PUBLIC_APP_URL` | ✅ | Public application URL |
| `UPSTASH_REDIS_REST_URL` | ❌ | Upstash Redis REST endpoint for cache & rate limit |
| `UPSTASH_REDIS_REST_TOKEN` | ❌ | Upstash Redis REST token |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | ❌ | Google OAuth credentials |
| `FACEBOOK_CLIENT_ID` / `FACEBOOK_CLIENT_SECRET` | ❌ | Facebook OAuth credentials |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAMA` | ❌ | Initial Super Admin credentials for seeding |
| `SEED_DEMO` | ❌ | `"true"` to generate demo bookings on seed |

---

## 🗺 Application Routes & Access Control

All user-facing routes are localized under `/[locale]` (`/id` or `/en`).

### Public Routes
- `/` — Landing page with hero, features, court preview, and pricing.
- `/courts` — Public court catalog with search and type filters.
- `/login` · `/register` — Authentication entry points.
- `/forgot-password` · `/reset-password` — Password recovery flow.
- `/about` · `/faq` · `/terms` · `/privacy` — Informational and legal pages.

### Customer Portal (`Role: CUSTOMER`)
- `/dashboard` — Overview of upcoming bookings, quick actions, and stats.
- `/dashboard/book` — Interactive court booking workspace and slot selector.
- `/dashboard/reservations` — Reservation history, payment status, and digital QR e-tickets.
- `/dashboard/settings` — Profile details, avatar upload, and password change.

### Super Admin Portal (`Role: ADMIN`)
- `/admin` — Revenue metrics, booking statistics, and operational overview.
- `/admin/courts` — Court CRUD management and photo upload.
- `/admin/reservations` — Complete reservation log, manual status controls, and check-in.
- `/admin/customers` — Customer directory and booking statistics.
- `/admin/vouchers` — Promo code creation with usage limits and discount thresholds.
- `/admin/eticket/[id]` — E-ticket QR verification and check-in scanner.
- `/admin/settings` — Venue operational hours, contact info, down payment %, and auto-cancel timeout.

---

## 🧪 Testing & Quality Assurance

The test suite validates authentication, business logic boundaries, timezone handling, double-booking prevention, and ghost booking auto-cancellation.

```bash
# Run unit and integration tests
pnpm test

# Run TypeScript static type check
npx tsc --noEmit

# Run ESLint validation
pnpm lint

# Test database connection pool
pnpm db:test
```

### Verified QA Scenarios
- **AC-LOGIN-1/2**: Valid credentials yield an authenticated session; invalid credentials return structured error without token generation.
- **AC-BOOK-1**: Future slot reservations succeed; past dates and elapsed hours in `Asia/Jakarta` are strictly rejected.
- **Double-Booking Prevention**: Half-open intervals prevent overlapping bookings while allowing contiguous adjacent bookings.
- **Ghost Reservation Cancellation**: Stale `PENDING` bookings without Stripe sessions are reclaimed after timeout; active checkouts remain protected.
- **Webhook Gating**: Booking fulfillment only executes when Stripe `payment_status` is verified as `"paid"`.

---

## ☁️ Deployment (Vercel)

1. **Build Command**: Set build command to `pnpm vercel-build` (`prisma generate && next build`).
2. **Environment Variables**: Add all mandatory variables from `.env.example` into Vercel Project Settings.
3. **Supabase Storage Configuration**:
   - Ensure `court-images` and `avatars` buckets are set to **Public**.
   - Ensure `payment-proofs` bucket is set to **Private** (accessed via signed URLs).
4. **Stripe Webhook Configuration**:
   - Register `https://your-domain.com/api/webhook` in the Stripe Dashboard with events: `checkout.session.completed`, `checkout.session.expired`.
   - Update `STRIPE_WEBHOOK_SECRET` with the production webhook secret.
5. **Resend Domain Verification**:
   - Verify your custom domain DNS records in the Resend Dashboard and update `RESEND_FROM_EMAIL`.

---

## 📜 Available Scripts

| Command | Action |
|---|---|
| `pnpm dev` | Starts the Next.js development server |
| `pnpm build` | Compiles the production build |
| `pnpm start` | Starts the production server |
| `pnpm vercel-build` | Generates Prisma Client and triggers Next.js production build |
| `pnpm lint` | Runs ESLint analysis |
| `pnpm test` | Executes the test suite with `node:test` and `tsx` |
| `pnpm db:test` | Verifies PostgreSQL pooler connection |
| `pnpm db:studio` | Launches Prisma Studio GUI |

---

## 📄 License & Attribution

Distributed under the [MIT License](file:///home/randimaulana/Documents/sport-center-app/LICENSE). Developed by **Randi Maulana** for SM Sport Center.