"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { updateProfile, uploadAvatarAction } from "@/actions/profile";
import { Save, User, Mail, Camera, Loader2 } from "lucide-react";
import { updateProfileSchema, type UpdateProfileInput } from "@/lib/zod";

export default function ProfileForm({
  user,
}: {
  user: { name: string; email: string; image: string };
}) {
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.image || null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    mode: "onChange",
    defaultValues: {
      name: user.name,
      email: user.email,
    },
  });

  async function onSubmit(data: UpdateProfileInput) {
    setLoading(true);
    setServerError(null);

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("email", data.email);

    const result = await updateProfile(formData);
    setLoading(false);

    if (result.success) {
      toast.success(result.message);
    } else {
      setServerError(result.error || null);
      toast.error(result.error);
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar (JPG/PNG/WebP).");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 2MB.");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
    setIsUploadingAvatar(true);

    const formData = new FormData();
    formData.append("file", file);

    const result = await uploadAvatarAction(formData);
    setIsUploadingAvatar(false);

    if (result.success && result.url) {
      setAvatarPreview(result.url);
      toast.success(result.message);
    } else {
      setAvatarPreview(user.image || null);
      toast.error(result.error);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  const userInitial = user.name ? user.name.slice(0, 2).toUpperCase() : "US";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Avatar Upload */}
      <div className="flex items-center gap-4 pb-3 border-b border-zinc-100">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploadingAvatar}
          className="relative group shrink-0"
        >
          {avatarPreview ? (
            <img
              src={avatarPreview}
              alt="Avatar"
              className="w-16 h-16 rounded-full object-cover border-2 border-zinc-200"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center border-2 border-emerald-300 text-lg">
              {userInitial}
            </div>
          )}
          <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            {isUploadingAvatar ? (
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            ) : (
              <Camera className="w-5 h-5 text-white" />
            )}
          </div>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={handleAvatarChange}
        />
        <div>
          <p className="text-sm font-bold text-zinc-950">{user.name || "Pelanggan"}</p>
          <p className="text-xs text-zinc-400">{user.email}</p>
          <p className="text-xs text-zinc-400 mt-0.5">Klik avatar untuk mengganti foto</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="name">Nama Lengkap</Label>
        <Input
          id="name"
          {...register("name")}
          placeholder="Nama Lengkap"
          error={errors.name?.message}
          leftIcon={<User className="w-4 h-4 text-zinc-400" />}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">Alamat Email</Label>
        <Input
          id="email"
          type="email"
          {...register("email")}
          placeholder="nama@email.com"
          error={errors.email?.message}
          leftIcon={<Mail className="w-4 h-4 text-zinc-400" />}
        />
      </div>

      {serverError && (
        <p className="text-xs font-semibold text-red-500">{serverError}</p>
      )}

      <Button
        type="submit"
        isLoading={loading || isSubmitting}
        disabled={loading || isSubmitting || !isValid}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
        leftIcon={<Save className="w-4 h-4" />}
      >
        Simpan Perubahan Profil
      </Button>
    </form>
  );
}
