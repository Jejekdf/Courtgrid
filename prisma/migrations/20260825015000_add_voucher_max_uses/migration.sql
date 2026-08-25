-- Add max_uses to vouchers: how many non-canceled reservations may redeem a code.
ALTER TABLE "vouchers" ADD COLUMN "max_uses" INTEGER NOT NULL DEFAULT 1;
