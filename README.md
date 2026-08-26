<div align="center">

# CourtGrid

**Sports Court Reservation Platform** — Futsal & Badminton booking for **SM Sport Center**

Built with Next.js 16, TypeScript, Supabase PostgreSQL, and Stripe.

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?logo=postgresql&logoColor=white)](https://supabase.com)
[![NextAuth](https://img.shields.io/badge/NextAuth-v5-000000?logo=auth0&logoColor=white)](https://next-auth.js.org)
[![Stripe](https://img.shields.io/badge/Stripe-635BFF?logo=stripe&logoColor=white)](https://stripe.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

</div>

---

## Overview

CourtGrid lets customers find an available futsal or badminton court, reserve a time slot, and pay a **50% down payment** through Stripe Checkout. A dedicated customer dashboard tracks bookings and e-tickets, while a full admin panel manages courts, reservations, customers, and venue settings.

Reservations follow a strict lifecycle (`PENDING → DP_PAID → DONE`, with `CANCELED` on timeout or self-cancel), enforced server-side with Zod validation, atomic double-booking checks, timezone-aware time slots (Asia/Jakarta), and a Stripe webhook that only fulfills **paid** checkouts.

## ✨ Features

- **Authentication** — Email/password with bcrypt + Google & Facebook OAuth via NextAuth v5 (JWT, role on token)
- **Reservation engine** — Court catalog, per-hour availability grid, and atomic double-booking prevention (half-open `[start, end)` + `@@unique` backstop)
- **Payments** — 50% down payment through Stripe Checkout, verified by signed webhook (`payment_status === "paid"`); voucher codes with `maxUses` guard and description
- **Customer dashboard** — Booking history, payment status, e-ticket QR, profile & password management
- **Admin panel** — Dashboard stats, courts CRUD (sharp WebP 1600px), reservation management, customer management, voucher management (`maxUses`/`description`), e-ticket scanning, venue settings
- **Email notifications** — Booking confirmation, payment success, password reset (Resend)
- **Ghost-booking cleanup** — Auto-cancels stale `PENDING` without Stripe session (single owner `autoCancelGhostBookings`)
- **Rate limiting & cache** — Upstash Redis on auth, password & search; Redis cache for customer reservations
- **RBAC** — Server-side guards (`verifyUserSession`) + middleware proxy: `/admin` for admins, `/dashboard` for customers
- **i18n** — `next-intl` id/en (817+ keys), casual `kamu` tone

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 16](https://nextjs.org) (App Router, RSC, Server Actions) |
| Language | TypeScript 5 (strict) |
| Database | PostgreSQL on [Supabase](https://supabase.com) |
| ORM | [Prisma 7](https://www.prisma.io) with `@prisma/adapter-pg` |
| Auth | [NextAuth v5](https://next-auth.js.org) (beta) + bcryptjs |
| Payments | [Stripe](https://stripe.com) Checkout + webhooks |
| Email | [Resend](https://resend.com) |
| UI | Tailwind CSS v4, [shadcn/ui](https://ui.shadcn.com) (Base UI + Radix), Framer Motion (`motion/react`), Recharts |
| State | Zustand, TanStack Query 5 |
| Validation | [Zod](https://zod.dev) v4 |
| Cache & Rate Limit | Upstash Redis (also `pnpm onlyBuiltDependencies` for sharp) |
| i18n | `next-intl` 4 + `nuqs` search params |
| Images | `sharp` 0.35 WebP (1600 court / 512 avatar / 2000 proof, `serverExternalPackages`) |
| Testing | `node:test` + `tsx` |

## 📁 Project Structure

```
app/[locale]/
├── (public)/            # Landing, courts, login, register, info pages (id/en)
├── (admin)/admin/       # Admin panel (courts, reservations, customers, vouchers, settings, eticket)
├── dashboard/           # Customer dashboard & booking workspace
└── api/                 # Route handlers: auth, courts, webhook
components/
├── ui/                  # shadcn/ui primitives (Base UI + Radix)
├── layout/              # Header, Footer, Hero
├── admin/               # Admin components
├── dashboard/           # Customer components
├── courts/              # Catalog & availability grid
└── auth/                # Auth forms
src/features/            # Feature slices: actions.ts, dal.ts, schemas.ts
├── auth/  reservations/  courts/  admin/  vouchers/  settings/
lib/                     # Singletons: prisma, stripe, resend, ratelimit, timezone, redis, supabase/storage (sharp 1600/512/2000 WebP)
prisma/                  # schema.prisma, migrations, seed.ts
messages/                # id.json & en.json (817+ keys, next-intl)
tests/ & __tests__/      # Unit & integration tests (node:test + tsx)
```

Data access flows through a **DAL layer** (`src/features/**/dal.ts`) — components never touch raw Prisma rows.

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 20
- pnpm ≥ 9.12.3 (`corepack enable` if needed)
- [Stripe CLI](https://docs.stripe.com/stripe-cli) (for local webhook testing)
- Accounts: Supabase, Stripe (test mode), Resend

### Setup

```bash
git clone https://github.com/Jejekdf/Courtgrid.git
cd Courtgrid
pnpm install
cp .env.example .env      # fill in credentials
```

### Database

```bash
pnpm prisma generate
pnpm prisma migrate status   # must be "up to date" — never migrate reset on pooler
pnpm prisma db seed          # admin account + 5 courts (SEED_DEMO=true for demo bookings)
```

### Run

```bash
pnpm dev               # http://localhost:3000
```

In a second terminal, forward Stripe webhooks locally:

```bash
stripe listen --forward-to localhost:3000/api/webhook
```

Copy the displayed `whsec_...` secret into `.env` as `STRIPE_WEBHOOK_SECRET`.

## ⚙️ Environment Variables

| Variable | Required | Description |
|----------|:--------:|-------------|
| `DATABASE_URL` | ✅ | Supabase PostgreSQL connection string |
| `DIRECT_URL` | ✅ | Direct connection for Prisma |
| `AUTH_URL` | ✅ | App URL (local: `http://localhost:3000`) |
| `AUTH_SECRET` | ✅ | NextAuth secret (`openssl rand -base64 32`) |
| `STRIPE_SECRET_KEY` | ✅ | `sk_test_...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅ | `pk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | ✅ | `whsec_...` |
| `RESEND_API_KEY` | ✅ | `re_...` |
| `RESEND_FROM_EMAIL` | ✅ | Sender address |
| `NEXT_PUBLIC_APP_URL` | ✅ | Public app URL |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | ❌ | Google OAuth |
| `FACEBOOK_CLIENT_ID` / `FACEBOOK_CLIENT_SECRET` | ❌ | Facebook OAuth |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | ❌ | Rate limit & cache |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAMA` | ❌ | Seed super admin |
| `SEED_DEMO` | ❌ | `"true"` to seed demo data |

## 🗺 Routes (prefixed with `/id` or `/en`)

| URL | Description |
|-----|-------------|
| `/` | Landing page |
| `/courts` | Court catalog & availability (public, with `?search` & `?type`) |
| `/login` · `/register` | Sign in / create account |
| `/forgot-password` · `/reset-password` | Password recovery |
| `/dashboard` | Customer dashboard |
| `/dashboard/book` | Booking workspace (`?courtId=` preselect) |
| `/dashboard/reservations` | Booking history & e-tickets |
| `/dashboard/settings` | Profile & password |
| `/admin` | Admin dashboard |
| `/admin/courts` · `/admin/reservations` · `/admin/customers` · `/admin/vouchers` · `/admin/settings` · `/admin/eticket/[id]` | Admin management |

Topbar search: customer `?courtId` shortcut, admin `?search` + `/eticket/[id]` deep link. Notifications poll every 30s.

## 🧪 Testing

```bash
npm run lint          # ESLint
npx tsc --noEmit      # Type-check
npm test              # node:test suite
```

Coverage highlights (Acceptance Criteria from the PRD):

- **AC-LOGIN-1/2** — correct credentials pass; wrong password rejected with no session
- **AC-BOOK-1** — valid future booking accepted; past-date / malformed input rejected
- **FIX-H2** — Asia/Jakarta timezone boundary: rejects past date and today's elapsed hour
- **F6** — overlapping slots rejected, adjacent slots allowed (half-open intervals)
- **PAY-1** — deposit = `ceil(total * dp%)`, default 50%
- **FIX-H4** — ghost-cancel: stale `PENDING` without Stripe session is canceled; live checkout is never released

## ☁️ Deployment (Vercel)

This repo is deployed on **Vercel** (`warmindo` team, `courtgrid` project):

1. Push to `main` → Vercel auto-builds via `pnpm install` (uses `pnpm-lock.yaml` + `pnpm-workspace.yaml` `onlyBuiltDependencies` for `sharp`) then `pnpm vercel-build` (`prisma generate && next build` with Turbopack).
2. Add every variable from `.env.example` in Vercel → Settings → Environment Variables.
3. Deploy.

Post-deploy checklist:

- Set `AUTH_URL` and `NEXT_PUBLIC_APP_URL` to your Vercel domain.
- Register `/api/webhook` in the [Stripe Dashboard](https://dashboard.stripe.com/webhooks) (`whsec_...`).
- Verify your sending domain in the [Resend Dashboard](https://resend.com/domains).
- Ensure Supabase buckets `court-images` and `avatars` are **Public** (for `getPublicUrl`) and `payment-proofs` stays private.
- Check `pnpm` is detected (presence of `pnpm-lock.yaml`); `sharp` must show no `allow-scripts` warning beyond the 7 expected.

## 📜 Scripts

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Start dev server |
| `pnpm build` | Production build (also `vercel-build`) |
| `pnpm start` | Run production build |
| `pnpm lint` | ESLint |
| `pnpm test` | Run unit tests |
| `pnpm db:studio` | Prisma Studio |
| `pnpm db:test` | Verify DB connection |
| `pnpm prisma migrate status` | Must be up to date — never `migrate reset` on pooler |

## 📄 License

Created by **Randi Maulana** for competency certification.