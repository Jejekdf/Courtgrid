-- Add composite primary key on verification_tokens (identifier, token) and remove duplicate unique index
ALTER TABLE "public"."verification_tokens"
ADD CONSTRAINT "verification_tokens_pkey" PRIMARY KEY ("identifier", "token");

DROP INDEX IF EXISTS "public"."verification_tokens_identifier_token_key";
