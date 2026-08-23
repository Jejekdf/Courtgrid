"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { updateProfile, uploadAvatarAction } from "@/features/auth/actions";
import { Save, User, Mail, Camera, Loader2 } from "lucide-react";
import Image from "next/image";
import { createUpdateProfileSchema, type UpdateProfileInput } from "@/lib/zod";
import { useTranslations } from "next-intl";

export default function ProfileForm({
  user,
}: {
  user: { name: string; email: string; image: string };
}) {
  const tVal = useTranslations("validation");
  const tForm = useTranslations("dashboard.forms");
  const tAuth = useTranslations("auth");
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
    resolver: zodResolver(createUpdateProfileSchema(tVal)),
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
      toast.error(tVal("imageInvalidType"));
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error(tVal("imageTooLarge"));
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
      {/* Avatar Upload Container */}
      <div className="flex items-center gap-4 pb-4 border-b border-zinc-100">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploadingAvatar}
          className="relative group shrink-0 cursor-pointer"
        >
          {avatarPreview ? (
            <Image
              src={avatarPreview}
              alt="Avatar"
              width={64}
              height={64}
              unoptimized
              className="size-16 rounded-2xl object-cover border border-zinc-200 shadow-xs"
            />
          ) : (
            <div className="size-16 rounded-2xl bg-zinc-950 text-white font-bold flex items-center justify-center text-base shadow-xs">
              {userInitial}
            </div>
          )}
          <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover-fine:opacity-100 flex items-center justify-center transition-opacity">
            {isUploadingAvatar ? (
              <Loader2 className="size-5 text-white animate-spin" />
            ) : (
              <Camera className="size-5 text-white" />
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
          <p className="text-sm font-extrabold text-zinc-950">{user.name || "Pelanggan"}</p>
          <p className="text-sm text-zinc-400 font-mono">{user.email}</p>
          <p className="text-sm text-zinc-400 mt-1 font-mono">{tForm("avatarHint")}</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="name" className="text-xs font-medium uppercase tracking-wider text-zinc-500 font-mono">{tForm("fullName")}</Label>
        <Input
          id="name"
          {...register("name")}
          placeholder={tAuth("register.namaPlaceholder")}
          error={errors.name?.message}
          leftIcon={<User className="size-4 text-zinc-400" />}
          className="text-sm bg-zinc-50 border-zinc-200 rounded-xl"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-xs font-medium uppercase tracking-wider text-zinc-500 font-mono">{tForm("email")}</Label>
        <Input
          id="email"
          type="email"
          {...register("email")}
          placeholder="nama@email.com"
          error={errors.email?.message}
          leftIcon={<Mail className="size-4 text-zinc-400" />}
          className="text-sm bg-zinc-50 border-zinc-200 rounded-xl"
        />
      </div>

      {serverError && (
        <p className="text-sm font-semibold text-red-500">{serverError}</p>
      )}

      <Button
        type="submit"
        isLoading={loading || isSubmitting}
        disabled={loading || isSubmitting || !isValid}
        className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-bold h-11 text-sm rounded-xl shadow-xs cursor-pointer"
        leftIcon={<Save className="size-4 text-white" />}
      >
        {tForm("saveProfile")}
      </Button>
    </form>
  );
}
