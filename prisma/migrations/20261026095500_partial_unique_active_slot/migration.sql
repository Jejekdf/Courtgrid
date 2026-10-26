-- Replace unconditional unique index with partial unique index on active booking statuses
-- Allows slots from CANCELED or DONE reservations to be booked again while still preventing double-booking (P2002)
DROP INDEX IF EXISTS "reservations_court_id_date_start_time_key";

CREATE UNIQUE INDEX "reservations_court_id_date_start_time_key"
ON "reservations"("court_id", "date", "start_time")
WHERE "status" IN ('PENDING', 'DP_PAID');
