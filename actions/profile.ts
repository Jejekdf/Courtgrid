"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { updateProfileSchema, updatePasswordSchema } from "@/lib/zod";
import { uploadAvatar } from "@/lib/supabase/storage";

export async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    return { success: false, error: "Unauthorized" };
  }

  const rawInput = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    image: (formData.get("image") as string) || undefined,
  };

  const validation = updateProfileSchema.safeParse(rawInput);
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message };
  }

  const { name, email, image } = validation.data;

  try {
    if (email !== session.user.email) {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser && existingUser.id !== session.user.id) {
        return { success: false, error: "Email sudah digunakan oleh akun lain." };
      }
    }

    const { updateUserProfileDAL } = await import("@/features/auth/dal");
    await updateUserProfileDAL(session.user.id, { name, email, image });

    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/settings");
    return { success: true, message: "Profil akun berhasil diperbarui." };
  } catch (error) {
    console.error("Update profile error:", error);
    return { success: false, error: "Terjadi kesalahan server saat memperbarui profil." };
  }
}

export async function updatePassword(formData: FormData) {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    return { success: false, error: "Unauthorized" };
  }

  const rawInput = {
    currentPassword: formData.get("currentPassword") as string,
    newPassword: formData.get("newPassword") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const validation = updatePasswordSchema.safeParse(rawInput);
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message };
  }

  const { currentPassword, newPassword } = validation.data;

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { passwordHash: true },
    });

    if (!user || !user.passwordHash) {
      return { success: false, error: "Pengguna ini tidak memiliki password lokal (Gunakan login Social/OAuth)." };
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return { success: false, error: "Password saat ini salah." };
    }

    const newHashedPassword = await bcrypt.hash(newPassword, 10);

    const { changePasswordDAL } = await import("@/features/auth/dal");
    await changePasswordDAL(session.user.id, newHashedPassword);

    return { success: true, message: "Password berhasil diubah!" };
  } catch (error) {
    console.error("Update password error:", error);
    return { success: false, error: "Terjadi kesalahan server saat mengubah password." };
  }
}

export async function uploadAvatarAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) {
    return { success: false, error: "File gambar wajib diisi." };
  }

  if (!file.type.startsWith("image/")) {
    return { success: false, error: "File harus berupa gambar (JPG/PNG/WebP)." };
  }

  if (file.size > 2 * 1024 * 1024) {
    return { success: false, error: "Ukuran file maksimal 2MB." };
  }

  try {
    const url = await uploadAvatar(session.user.id, file);

    const { updateUserProfileDAL } = await import("@/features/auth/dal");
    await updateUserProfileDAL(session.user.id, {
      name: session.user.name || "",
      email: session.user.email || "",
      image: url,
    });

    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/settings");
    return { success: true, message: "Avatar berhasil diperbarui.", url };
  } catch (error) {
    console.error("Upload avatar error:", error);
    return { success: false, error: "Gagal mengupload avatar." };
  }
}
