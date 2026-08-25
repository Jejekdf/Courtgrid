-- Cover the voucher redemption count in the booking guard:
-- count(reservations where voucher_id = ? and status <> 'CANCELED')
CREATE INDEX "reservations_voucher_id_status_idx" ON "reservations"("voucher_id", "status");
