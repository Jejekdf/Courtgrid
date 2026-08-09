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

  const { data } = supabase.storage.from("payment-proofs").getPublicUrl(path);
  return data.publicUrl;
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
