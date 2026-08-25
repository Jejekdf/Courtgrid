import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );
}

/**
 * Downscale and re-encode an upload to WebP before it reaches Supabase.
 *
 * Phone photos arrive as multi-MB JPEG/PNG; storing them raw makes every
 * upload slow and forces the Next image optimizer to pull the full blob
 * from storage on first render. A 1600px q80 WebP is typically 50-100x
 * smaller with no visible loss for court photos.
 */
async function optimizeImage(
  file: File,
  maxWidth: number,
  quality: number
): Promise<Buffer> {
  const buffer = Buffer.from(await file.arrayBuffer());
  return sharp(buffer)
    .rotate() // bake EXIF orientation into pixels
    .resize({ width: maxWidth, withoutEnlargement: true })
    .webp({ quality })
    .toBuffer();
}

export async function uploadPaymentProof(reservationId: string, file: File) {
  const supabase = createAdminClient();

  // Keep proofs readable (receipts, transfer screenshots) — mild compression only.
  const optimized = await optimizeImage(file, 2000, 85);
  const path = `${reservationId}/proof.webp`;

  const { error } = await supabase.storage
    .from("payment-proofs")
    .upload(path, optimized, { upsert: true, contentType: "image/webp" });

  if (error) {
    throw new Error(error.message);
  }

  return path;
}

export async function getPaymentProofSignedUrl(path: string, expiresIn = 3600): Promise<string | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from("payment-proofs")
    .createSignedUrl(path, expiresIn);

  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}

export async function uploadAvatar(userId: string, file: File) {
  const supabase = createAdminClient();

  const optimized = await optimizeImage(file, 512, 80);
  const path = `${userId}/avatar.webp`;

  const { error } = await supabase.storage
    .from("avatars")
    .upload(path, optimized, { upsert: true, contentType: "image/webp" });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadCourtImage(file: File) {
  const supabase = createAdminClient();

  const optimized = await optimizeImage(file, 1600, 80);
  // Fresh filename per upload so the Next image optimizer never serves a
  // stale cached transform of the old picture under the same URL.
  const fileName = `court-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.webp`;
  const path = `courts/${fileName}`;

  // No bucket fallback: silently landing court photos in a possibly
  // private bucket produced 403 URLs that never rendered. Fail loud instead.
  const { error } = await supabase.storage
    .from("court-images")
    .upload(path, optimized, { upsert: true, contentType: "image/webp" });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from("court-images").getPublicUrl(path);
  return data.publicUrl;
}
