# CourtGrid

Sistem reservasi lapangan olahraga (Futsal & Badminton) untuk **SM Sport Center**. Booking online, pembayaran DP 50% via Stripe, dashboard pelanggan, dan panel admin.

## Fitur

- Autentikasi email/password + Google & Facebook OAuth
- Pencarian lapangan, cek ketersediaan slot per jam, dan booking
- Pembayaran DP 50% melalui Stripe Checkout
- Dashboard pelanggan: riwayat booking, status pembayaran, e-ticket
- Panel admin: kelola lapangan, reservasi, pelanggan, dan pengaturan venue
- Notifikasi email (konfirmasi booking, pembayaran sukses, reset password)
- Webhook Stripe untuk update status pembayaran otomatis
- Ghost booking cleanup: batalkan reservasi PENDING yang belum dibayar melewati batas waktu
- Rate limiting pada endpoint autentikasi

## Tech Stack

| Area | Teknologi |
|------|-----------|
| Framework | Next.js 16 (App Router) |
| Bahasa | TypeScript |
| Database | PostgreSQL (Supabase) |
| ORM | Prisma 7 |
| Autentikasi | NextAuth v5 |
| Pembayaran | Stripe |
| Email | Resend |
| UI | Tailwind CSS v4, Shadcn UI, Framer Motion |
| Validasi | Zod |
| Cache & Rate Limit | Upstash Redis |

## Struktur Proyek

```
app/
  (public)/          Halaman publik (landing, login, courts, dll)
  (admin)/admin/     Panel admin
  dashboard/         Dashboard pelanggan
  api/               Route handlers (auth, courts, webhook)
components/
  ui/                Komponen UI dasar
  layout/            Header, Footer, Hero
  admin/             Komponen panel admin
  dashboard/         Komponen dashboard pelanggan
  courts/            Komponen pencarian & ketersediaan lapangan
  auth/              Form autentikasi
src/features/        Feature slice: actions.ts, dal.ts, schemas.ts
lib/                 Singletons: prisma, stripe, resend, ratelimit
prisma/              schema.prisma, migrations, seed.ts
tests/               Unit & integration tests (node:test)
```

## Menjalankan di Lokal

### 1. Prasyarat

- Node.js >= 20
- npm >= 10
- Akun Supabase (PostgreSQL), Stripe (test mode), Resend
- (Opsional) Kredensial Google & Facebook OAuth

### 2. Setup

```bash
git clone https://github.com/Jejekdf/Courtgrid.git
cd Courtgrid
npm install
cp .env.example .env   # isi kredensial
```

### 3. Database

```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

### 4. Jalankan

```bash
npm run dev
```

Buka http://localhost:3000. Webhook Stripe di terminal terpisah:

```bash
stripe listen --forward-to localhost:3000/api/webhook
```

Salin `whsec_...` yang tampil ke `.env` sebagai `STRIPE_WEBHOOK_SECRET`.

## Environment Variables

| Variable | Wajib | Keterangan |
|----------|-------|------------|
| `DATABASE_URL` | Ya | Supabase PostgreSQL connection string |
| `DIRECT_URL` | Ya | Koneksi langsung untuk Prisma |
| `AUTH_URL` | Ya | URL aplikasi (lokal: `http://localhost:3000`) |
| `AUTH_SECRET` | Ya | Secret sesi NextAuth (`openssl rand -base64 32`) |
| `STRIPE_SECRET_KEY` | Ya | Stripe secret key (`sk_test_...`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Ya | Stripe publishable key (`pk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | Ya | Webhook signing secret (`whsec_...`) |
| `RESEND_API_KEY` | Ya | Resend API key (`re_...`) |
| `RESEND_FROM_EMAIL` | Ya | Email pengirim |
| `NEXT_PUBLIC_APP_URL` | Ya | URL publik aplikasi |
| `GOOGLE_CLIENT_ID` | Tidak | Google OAuth |
| `GOOGLE_CLIENT_SECRET` | Tidak | Google OAuth |
| `FACEBOOK_CLIENT_ID` | Tidak | Facebook OAuth |
| `FACEBOOK_CLIENT_SECRET` | Tidak | Facebook OAuth |
| `UPSTASH_REDIS_REST_URL` | Tidak | Upstash Redis (rate limit & cache) |
| `UPSTASH_REDIS_REST_TOKEN` | Tidak | Upstash Redis |
| `ADMIN_EMAIL` | Tidak | Admin awal untuk seed |
| `ADMIN_PASSWORD` | Tidak | Password admin awal untuk seed |
| `ADMIN_NAMA` | Tidak | Nama admin awal |
| `SEED_DEMO` | Tidak | `"true"` untuk membuat data demo |

## Route Utama

| URL | Deskripsi |
|-----|-----------|
| `/` | Landing page |
| `/courts` | Daftar lapangan |
| `/login`, `/register` | Masuk / daftar |
| `/forgot-password`, `/reset-password` | Reset password |
| `/dashboard` | Dashboard pelanggan |
| `/dashboard/book` | Form reservasi |
| `/dashboard/reservations` | Riwayat booking |
| `/dashboard/settings` | Pengaturan akun |
| `/admin` | Dashboard admin |
| `/admin/courts` | Kelola lapangan |
| `/admin/reservations` | Kelola reservasi |
| `/admin/customers` | Kelola pelanggan |
| `/admin/settings` | Pengaturan venue |

## Script

```bash
npm run dev          # Development server
npm run build        # Build produksi
npm run start        # Jalankan build produksi
npm run lint         # ESLint
npm test             # Unit test (node:test)
npm run db:studio    # Prisma Studio
npm run db:test      # Tes koneksi database
```

## Testing

```bash
npm run lint
npx tsc --noEmit
npm test
```

Coverage utama: login (sukses/gagal), validasi booking (double-booking, timezone, past-date), ghost-cancel timeout, dan gating webhook `payment_status`.

## Deploy (Netlify)

1. Push repo ke GitHub.
2. Buat project baru di Netlify → **Import from Git**.
3. Pilih repo `Jejekdf/Courtgrid`.
4. Build command: `npm run build` (auto-detect Next.js).
5. Set semua environment variable dari `.env` di dashboard Netlify.
6. Deploy.

Setelah deploy:

- Atur `AUTH_URL` dan `NEXT_PUBLIC_APP_URL` ke domain Netlify.
- Daftarkan endpoint `/api/webhook` di Stripe Dashboard.
- Verifikasi domain pengirim di Resend Dashboard.

## Alur Data

```
Client Component → Server Component → DAL → Prisma → PostgreSQL
```

Konvensi:
- Akses database hanya lewat DAL atau server action.
- Semua mutasi divalidasi Zod + cek kepemilikan/peran.
- Tidak pernah ekspos field sensitif ke komponen client.

## Lisensi

Dibuat oleh **Randi Maulana** untuk keperluan sertifikasi kompetensi.
