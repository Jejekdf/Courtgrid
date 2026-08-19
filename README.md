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

- **Authentication** — Email/password with bcrypt + Google & Facebook OAuth via NextAuth v5
- **Reservation engine** — Court catalog, per-hour availability grid, and atomic double-booking prevention (half-open `[start, end)` intervals)
- **Payments** — 50% down payment through Stripe Checkout, verified by signed webhook (`payment_status === "paid"`)
- **Customer dashboard** — Booking history, payment status, e-ticket, profile & password management
- **Admin panel** — Dashboard stats, courts CRUD, reservation management, customer management, e-ticket scanning, venue settings
- **Email notifications** — Booking confirmation, payment success, password reset (Resend)
- **Ghost-booking cleanup** — Auto-cancels stale `PENDING` reservations that never opened a Stripe session
- **Rate limiting** — Upstash Redis on auth & password endpoints
- **RBAC** — Route-level guards in middleware (proxy): `/admin` for admins, `/dashboard` for customers

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
| UI | Tailwind CSS v4, [shadcn/ui](https://ui.shadcn.com), Framer Motion, Recharts |
| State | Zustand, TanStack Query |
| Validation | [Zod](https://zod.dev) v4 |
| Cache & Rate Limit | Upstash Redis |
| Testing | `node:test` + `tsx` |

## 📁 Project Structure

```
app/
├── (public)/            # Landing, courts, login, register, auth pages, info pages
├── (admin)/admin/       # Admin panel
├── dashboard/           # Customer dashboard & booking workspace
└── api/                 # Route handlers: auth, courts, webhook
components/
├── ui/                  # shadcn/ui primitives
├── layout/              # Header, Footer, Hero
├── admin/               # Admin components
├── dashboard/           # Customer components
├── courts/              # Catalog & availability grid
└── auth/                # Auth forms
src/features/            # Feature slices: actions.ts, dal.ts, schemas.ts
├── auth/                ├── reservations/
├── courts/              ├── admin/
└── settings/            └── notifications/
lib/                     # Singletons: prisma, stripe, resend, ratelimit, timezone
prisma/                  # schema.prisma, migrations, seed.ts
tests/                   # Unit & integration tests
```

Data access flows through a **DAL layer** (`src/features/**/dal.ts`) — components never touch raw Prisma rows.

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 20
- npm ≥ 10
- [Stripe CLI](https://docs.stripe.com/stripe-cli) (for local webhook testing)
- Accounts: Supabase, Stripe (test mode), Resend

### Setup

```bash
git clone https://github.com/Jejekdf/Courtgrid.git
cd Courtgrid
npm install
cp .env.example .env      # fill in credentials
```

### Database

```bash
npx prisma generate
npx prisma db push        # sync schema to Supabase
npx prisma db seed        # admin account + 5 courts
```

### Run

```bash
npm run dev               # http://localhost:3000
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

## 🗺 Routes

| URL | Description |
|-----|-------------|
| `/` | Landing page |
| `/courts` | Court catalog & availability |
| `/login` · `/register` | Sign in / create account |
| `/forgot-password` · `/reset-password` | Password recovery |
| `/dashboard` | Customer dashboard |
| `/dashboard/book` | Booking workspace |
| `/dashboard/reservations` | Booking history & e-tickets |
| `/dashboard/settings` | Profile & password |
| `/admin` | Admin dashboard |
| `/admin/courts` · `/admin/reservations` · `/admin/customers` · `/admin/settings` | Admin management |

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

## ☁️ Deployment

Deploy on [Netlify](https://www.netlify.com):

1. Push the repo to GitHub.
2. Netlify → **Add new site** → **Import from Git** → select `Jejekdf/Courtgrid`.
3. Build command: `npm run build` (Next.js auto-detected).
4. Add every environment variable from `.env` in the Netlify dashboard.
5. Deploy.

Post-deploy checklist:

- Set `AUTH_URL` and `NEXT_PUBLIC_APP_URL` to your Netlify domain.
- Register `/api/webhook` in the [Stripe Dashboard](https://dashboard.stripe.com/webhooks).
- Verify your sending domain in the [Resend Dashboard](https://resend.com/domains).

## 📜 Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Run production build |
| `npm run lint` | ESLint |
| `npm test` | Run unit tests |
| `npm run db:studio` | Prisma Studio |
| `npm run db:test` | Verify DB connection |

## 📄 License

Created by **Randi Maulana** for competency certification.