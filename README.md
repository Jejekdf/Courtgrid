# CourtGrid — Sport Center Reservation App

A web platform for sports field reservations (Futsal & Badminton) at **SM Sport Center**. Built with Next.js 16 (App Router), Supabase PostgreSQL, NextAuth v5, Stripe payments, and Resend email notifications.

---

## Key Features

- **Authentication** — Login/Register with email and password, plus Google and Facebook OAuth.
- **Online Reservations** — Select a court, date, and time slot, then pay a 50% down payment through Stripe Checkout.
- **Customer Dashboard** — Booking history, payment status, and e-ticket access.
- **Admin Panel** — Manage courts, reservations, customers, and venue settings.
- **Email Notifications** — Booking confirmation and payment success emails via Resend.
- **Stripe Webhook** — Automatically updates reservation status when a payment succeeds.
- **Ghost Booking Cleanup** — Cancels stale pending reservations that remain unpaid beyond the allowed window.
- **Role-Based Access Control** — Separate admin and customer routes enforced by a central Next.js proxy.
- **Input Validation** — Server-side Zod schemas protect all mutations.

---

## Tech Stack

| Area | Technology |
|------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Database | PostgreSQL (Supabase) |
| ORM | Prisma 7 |
| Authentication | NextAuth v5 (Credentials + OAuth) |
| Payments | Stripe |
| Email | Resend |
| UI | Tailwind CSS v4, Shadcn UI, Framer Motion |
| Validation | React Hook Form + Zod |

---

## Prerequisites

Make sure the following tools are installed:

| Tool | Minimum Version | Check Command |
|------|---------------|---------------|
| Node.js | >= 20 | `node -v` |
| npm | >= 10 | `npm -v` |
| Stripe CLI | latest | `stripe --version` |

You also need accounts with:
- **Supabase** — https://supabase.com for PostgreSQL hosting.
- **Stripe** — https://stripe.com for payment processing in test mode.
- **Resend** — https://resend.com for transactional email delivery.
- **Google Cloud Console** — optional, for Google OAuth.
- **Meta for Developers** — optional, for Facebook OAuth.

---

## Local Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd sport-center-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Copy `.env.example` to `.env` and fill in your credentials.

### 4. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Sync schema to Supabase
npx prisma db push

# Seed admin and initial court data
npx tsx prisma/seed.ts
```

### 5. Start Development Server

```bash
npm run dev
```

Open http://localhost:3000.

### 6. Stripe Webhook Listener (separate terminal)

```bash
stripe listen --forward-to localhost:3000/api/webhook --latest
```

Copy the displayed webhook signing secret and add it to `.env` as `STRIPE_WEBHOOK_SECRET`.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Supabase PostgreSQL connection string |
| `DIRECT_URL` | Yes | Direct database connection for Prisma |
| `AUTH_URL` | Yes | Application URL. For localhost: `http://localhost:3000` |
| `AUTH_SECRET` | Yes | NextAuth session encryption secret. Generate with: `openssl rand -base64 32` |
| `STRIPE_SECRET_KEY` | Yes | Stripe secret key in test mode. Format: `sk_test_...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Stripe publishable key in test mode. Format: `pk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Yes | Webhook signing secret from Stripe CLI. Format: `whsec_...` |
| `RESEND_API_KEY` | Yes | Resend API key. Format: `re_...` |
| `RESEND_FROM_EMAIL` | Yes | Sender email address. Example: `CourtGrid <noreply@courtgrid.com>` |
| `NEXT_PUBLIC_APP_URL` | Yes | Public application URL. For localhost: `http://localhost:3000` |
| `GOOGLE_CLIENT_ID` | No | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth client secret |
| `FACEBOOK_CLIENT_ID` | No | Facebook OAuth client ID |
| `FACEBOOK_CLIENT_SECRET` | No | Facebook OAuth client secret |
| `ADMIN_EMAIL` | No | Default admin email for seed. Default: `admin@courtgrid.com` |
| `ADMIN_PASSWORD` | No | Default admin password for seed. Default: `CHANGE_ME_use_strong_password` |
| `ADMIN_NAMA` | No | Default admin name for seed. Default: `CourtGrid Superadmin` |
| `SEED_DEMO` | No | Set to `"true"` to create dev customer + demo reservations. Default: `false` |

---

## Database Schema

PostgreSQL models exposed through Prisma:

- **User** — customer and admin accounts
- **Court** — futsal and badminton courts with hourly pricing
- **Venue** — venue metadata linked to courts
- **Reservation** — bookings with status lifecycle: `PENDING`, `DP_PAID`, `CANCELED`, `DONE`
- **Payment** — down-payment records tied to reservations
- **Setting** — single-row venue-wide configuration
- **Voucher** — optional discount codes
- **PasswordResetToken** — time-bound password reset tokens
- **Account**, **Session**, **VerificationToken** — NextAuth tables

To inspect data visually:

```bash
npx prisma studio
```

---


## Run Development

### Full Development Setup

Anda butuh **2 terminal** berjalan bersamaan:

**Terminal 1 — Next.js Dev Server:**

```bash
npm run dev
```

**Terminal 2 — Stripe CLI Webhook Listener:**

```bash
stripe listen --forward-to localhost:3000/api/webhook --latest
```

### Key Routes

| URL | Description |
|-----|-------------|
| `http://localhost:3000` | Public landing page |
| `http://localhost:3000/login` | Login |
| `http://localhost:3000/register` | Register |
| `http://localhost:3000/dashboard` | Customer dashboard |
| `http://localhost:3000/dashboard/book` | Reservation form |
| `http://localhost:3000/dashboard/reservations` | Booking history |
| `http://localhost:3000/admin` | Admin dashboard |
| `http://localhost:3000/admin/reservations` | Manage reservations |
| `http://localhost:3000/admin/courts` | Manage courts |
| `http://localhost:3000/admin/customers` | Manage customers |
| `http://localhost:3000/admin/settings` | Venue settings |
| `http://localhost:3000/dev-test` | Email testing page |

### Seed Admin Credentials

- **Email:** `admin@courtgrid.com`
- **Password:** `CHANGE_ME_use_strong_password`

---

## Testing Checklist

### 1. Registration & Login

- [ ] Open `http://localhost:3000/register`
- [ ] Create a new account
- [ ] Verify confirmation email via Resend
- [ ] Log in at `http://localhost:3000/login`

### 2. Reservations & Payments

- [ ] Log in as customer
- [ ] Open `http://localhost:3000/dashboard/book`
- [ ] Select court, date, and time
- [ ] Click "Pay with Stripe"
- [ ] Complete payment using Stripe test card `4242 4242 4242 4242`
- [ ] Verify `checkout.session.completed` appears in Stripe CLI logs
- [ ] Confirm reservation status changes to `DP_PAID`
- [ ] Check payment success email

### 3. Customer Dashboard

- [ ] Verify booking totals and upcoming reservations appear
- [ ] Confirm new reservations show the correct payment status

### 4. Admin Panel

- [ ] Log in as admin
- [ ] Verify dashboard stats load
- [ ] Manage courts, reservations, and customers

### 5. Email Testing

- [ ] Open `/dev-test`
- [ ] Send each email template
- [ ] Confirm delivery in Resend dashboard or inbox

---

## Build & Deploy

### Production Build

```bash
npm run build
```

### Production Server

```bash
npm start
```

### Deploy to Vercel

1. Push the repository to GitHub.
2. Create a new project in Vercel.
3. Import the repository.
4. Set all environment variables in the Vercel dashboard.
5. Deploy.

Register the `/api/webhook` endpoint in Stripe Dashboard and verify your sending domain in Resend before going live.

---

## Troubleshooting

### Port 3000 is already in use

```bash
lsof -i :3000
kill -9 <PID>
```

### Database connection error

- Verify `DATABASE_URL` in `.env` is correct and the Supabase project is active.
- Check whether your IP is allowlisted in Supabase Dashboard → Settings → Network.
- Run `npx prisma db push` to ensure the schema is in sync.

### `STRIPE_WEBHOOK_SECRET` mismatch

- The secret changes each time `stripe listen` runs.
- Copy the new secret from the terminal and update `.env`.

### Emails are not sending

- Confirm `RESEND_API_KEY` is valid.
- For local testing, use `CourtGrid <onboarding@resend.dev>`.
- For production, verify your domain in Resend Dashboard.
- Check spam folders if emails are not visible.

### Tailwind build error

- Avoid empty Tailwind background-image patterns in non-source files.
- The JIT scanner scans the entire project tree.

### TypeScript errors after dependency updates

```bash
npx tsc --noEmit
```

Fix typing issues directly. Avoid `as any` or `@ts-ignore`.

---

## Project Structure

```
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed.ts              # Database seeder
├── src/features/
│   ├── auth/dal.ts          # Auth data access layer
│   ├── reservations/dal.ts  # Reservation data access layer
│   ├── reservations/actions.ts # Reservation server actions
│   ├── courts/dal.ts        # Court data access layer
│   ├── admin/dal.ts         # Admin data access layer
│   └── settings/dal.ts      # Settings data access layer
├── lib/
│   ├── prisma.ts            # Prisma client
│   ├── stripe.ts            # Stripe client
│   ├── resend.ts            # Resend email client
│   └── emails/templates.ts  # Email templates
├── components/
│   ├── ui/                  # Reusable UI primitives
│   ├── layout/              # Header, Footer, Hero
│   ├── admin/               # Admin panel components
│   ├── dashboard/           # Customer dashboard components
│   └── auth/                # Authentication form components
├── app/
│   ├── (public)/            # Public pages
│   ├── admin/               # Admin routes
│   ├── dashboard/           # Customer routes
│   └── api/                 # API routes including webhooks
├── actions/                 # Legacy server actions maintained for stability
├── DESIGN.md                # Design system and UI guidelines
├── PRODUCT.md               # Product positioning and direction
├── PRD.md                   # Product requirements document
└── CLAUDE.md                # AI assistant guide
```

### Data Flow

```
Client Component → Server Component → DAL → Prisma → PostgreSQL
```

Key conventions:
- Always access the database through DAL or server actions.
- Mutations require Zod validation and ownership/role checks.
- Never expose sensitive fields to client components.

---

## Useful Commands

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npx tsc --noEmit         # Type-check TypeScript
npx prisma generate      # Generate Prisma client
npx prisma db push       # Sync schema to database
npx prisma studio        # Open Prisma Studio
npx tsx prisma/seed.ts   # Seed database
```

---

## Documentation

- `PRODUCT.md` — product positioning, audience, and marketing voice (product direction; execution rules in `DESIGN.md`).
- `DESIGN.md` — design tokens, component patterns, and responsive behavior.
- `PRD.md` — product requirements and feature specifications.
- `CLAUDE.md` — AI assistant workflow and repository conventions.
- **Source code documentation** — all key server actions and data access layers expose TSDoc comments in English.

---

## Challenges & Solutions

| Challenge | Approach |
|-----------|----------|
| **NextAuth v5 server-action return shape** | `signIn("credentials", { redirect: false })` returns a URL string inside a server action rather than `{ ok: true }`. The login action now normalizes this shape and treats `?error=` as failure. |
| **Post-login cookie readiness** | Redirect happens only after the server action confirms success, avoiding stale `router.refresh()` timing issues. |
| **Admin auth control flow** | `checkAdmin()` was changed from throwing to returning structured success/error objects so non-admin calls return predictable API-shaped errors. |
| **User.email integrity** | `email` was made non-nullable in Prisma to prevent credential-login ambiguity; the schema was synced to the database. |
| **Ghost booking race condition** | Ghost booking cleanup narrows cancellation to pending reservations without a Stripe checkout session, reducing the chance of canceling an active payment. |
| **Submission hygiene** | A clean `.zip` was prepared excluding `.env`, `node_modules`, `.next`, `.git`, docs, and agent config folders. |

---

## License

This project was created by **Randi Maulana** for competency certification purposes.
