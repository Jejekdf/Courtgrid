import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );
}

export async function uploadPaymentProof(reservationId: string, file: File) {
  const supabase = createAdminClient();
  const extension = file.name.split(".").pop() || "jpg";
  const path = `${reservationId}/proof.${extension}`;

  const { error } = await supabase.storage
    .from("payment-proofs")
    .upload(path, file, { upsert: true, contentType: file.type });

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
  const extension = file.name.split(".").pop() || "jpg";
  const path = `${userId}/avatar.${extension}`;

  const { error } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true, contentType: file.type });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadCourtImage(file: File) {
  const supabase = createAdminClient();
  const fileExt = file.name.split(".").pop() || "png";
  const fileName = `court-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
  const path = `courts/${fileName}`;

  const { error } = await supabase.storage
    .from("court-images")
    .upload(path, file, { upsert: true, contentType: file.type });

  if (error) {
    const { error: fallbackError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, contentType: file.type });

    if (fallbackError) {
      throw new Error(error.message);
    }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    return data.publicUrl;
  }

  const { data } = supabase.storage.from("court-images").getPublicUrl(path);
  return data.publicUrl;
}
