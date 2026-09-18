-- Partial index for active slot overlap checks (F6 double booking prevention)
-- Only indexes PENDING and DP_PAID reservations, ignoring DONE and CANCELED
CREATE INDEX IF NOT EXISTS "reservations_active_slots_partial_idx"
ON "reservations"("court_id", "date", "start_time", "end_time")
WHERE "status" IN ('PENDING', 'DP_PAID');

-- Partial index for ghost booking cleanup (FIX-H4)
-- Only indexes stale unpaid pending reservations without a live Stripe session
CREATE INDEX IF NOT EXISTS "reservations_pending_ghost_partial_idx"
ON "reservations"("created_at")
WHERE "status" = 'PENDING' AND "stripe_session_id" IS NULL;
