# Product Requirements Document (PRD) - CourtGrid

## 1. Project Context
Web-based sports court reservation system for SM Sport Center (2 Futsal Courts, 3 Badminton Courts). This document serves as a strict reference guide (Context/Instructions) for AI Agents to build the application according to the Program Analyst certification requirements (FR.IA.04A) while maintaining modern architecture standards.

## 2. Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Database:** PostgreSQL (via Supabase)
- **ORM:** Prisma
- **Authentication:** NextAuth.js (Credentials, Google OAuth, Facebook OAuth)
- **Payment Gateway:** Stripe (Test Mode / Checkout Sessions)
- **Styling:** Tailwind CSS v4 (Premium Light Mode Theme)
- **Language:** TypeScript
- **Design Pattern:** Atomic Design Principles for UI Components

## 3. User Roles & Permissions
1. **Customer:** 
   - Register & Login (via traditional Email/Password, Google OAuth, or Facebook OAuth).
   - View real-time court availability & schedules.
   - Make a reservation (select date, time, and court type).
   - Pay the 50% Down Payment (DP) automatically via Stripe Checkout Gateway.
   - Cancel reservations (according to policy) & view reservation history.
2. **Admin:**
   - Login via Admin credentials.
   - Manage (CRUD) court & customer data.
   - Manage reservations (including reservation search function).
   - View automated DP payment statuses (Verified by Stripe).
   - Print court usage reports (daily/monthly).

## 4. Database Schema Requirements (Prisma)
The AI Agent must generate a robust Prisma schema (`schema.prisma`) that supports NextAuth and Stripe integrations.
- `User`: id, name, email, email_verified, password_hash (optional for OAuth), role (ADMIN/CUSTOMER).
- `Account`: Standard NextAuth table (id, user_id, provider, providerAccountId, access_token, etc.).
- `Session`: Standard NextAuth table (id, sessionToken, user_id, expires).
- `VerificationToken`: Standard NextAuth table (identifier, token, expires).
- `Court`: id, name, type (FUTSAL/BADMINTON), price_per_hour, is_active.
- `Reservation`: id, user_id, court_id, date, start_time, end_time, total_price, status (PENDING/DP_PAID/CANCELED/DONE), **stripe_session_id** (String, optional).
- `Payment`: id, reservation_id, dp_amount, status (PENDING/VERIFIED).

## 5. Core Features & Task Breakdown for AI Agent

### Phase 1: Auth & Database Setup
- [ ] Initialize the Prisma schema including NextAuth required models and Stripe fields, then push to Supabase.
- [ ] Set up NextAuth.js with `CredentialsProvider`, `GoogleProvider`, and `FacebookProvider` using `PrismaAdapter`.
- [ ] Build unified Login & Register UI pages supporting social logins using Atomic Design components.

### Phase 2: Core Reservation Logic (Critical Path)
- [ ] Create the Court List & Availability Schedule UI (Grid or Calendar view).
- [ ] Create the Reservation Form UI.
- [ ] **CRITICAL TASK (Validation):** Implement strict backend logic to prevent *Double Booking*. The system MUST reject the request if the `court_id` on the specified `date` and `start_time` to `end_time` range already holds a PENDING or DP_PAID status. (Certification priority).

### Phase 3: Payment (Stripe) & Admin Workspace
- [ ] **Customer Page:** Implement Stripe Checkout API Route (`/api/checkout/route.ts`) to handle the 50% DP payment process.
- [ ] **Webhook API Route:** Create a Webhook (`/api/webhook/route.ts`) to listen for Stripe's `checkout.session.completed` event and automatically update the `Reservation` and `Payment` status to `DP_PAID` / `VERIFIED`.
- [ ] **Admin Page:** Build a Dashboard to view automated payment statuses. Include a clear "Verified by Stripe" UI badge to satisfy the payment verification criteria for the FR.IA.04A assessment.
- [ ] **Admin Page:** Implement court data management (CRUD operations).

### Phase 4: Reporting & Optimization
- [ ] Admin Page: Daily/monthly reservation report summary feature.
- [ ] Implement the Print Report feature (Print-friendly UI / PDF generation).
- [ ] **Performance:** Apply database indexing on the schedule search columns (date & time) in Prisma to prevent query bottlenecks during double-booking validations.

## 6. Testing & Debugging Directives
The AI Agent must assist in drafting the following test scripts/logic as per FR.IA.04A instructions:
1. **Unit Testing:**
   - Scenario 1: Correct credentials login -> Successfully logged in.
   - Scenario 2: Incorrect credentials login -> Error message displayed.
   - Scenario 3: Valid reservation -> Data successfully saved to the database.
2. **Integration Testing:**
   - End-to-end scenario: `Login -> Search Court -> Create Reservation -> Stripe Checkout -> Webhook Success -> Verify appearance in Admin Report`.
3. **Debugging Case (Simulation):**
   - Inject a bug scenario where the *double booking* validation fails, then document the debugging process and fix to fulfill the certification requirements.