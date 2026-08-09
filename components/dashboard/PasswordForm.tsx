"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { updatePassword } from "@/actions/profile";
import { Lock, ShieldCheck, CheckCircle2, XCircle } from "lucide-react";
import { updatePasswordSchema } from "@/lib/zod";

export default function PasswordForm() {
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm<{
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }>({
    resolver: zodResolver(updatePasswordSchema),
    mode: "onChange",
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPassword = watch("newPassword", "");
  const confirmPassword = watch("confirmPassword", "");

  const requirements = [
    { label: "Minimal 8 karakter", met: newPassword.length >= 8 },
    { label: "1 huruf besar (A-Z)", met: /[A-Z]/.test(newPassword) },
    { label: "1 huruf kecil (a-z)", met: /[a-z]/.test(newPassword) },
    { label: "1 angka (0-9)", met: /[0-9]/.test(newPassword) },
    { label: "1 karakter spesial (!@#$%^&*)", met: /[^A-Za-z0-9]/.test(newPassword) },
  ];

  async function onSubmit(data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) {
    setLoading(true);
    setServerError(null);

    const formData = new FormData();
    formData.append("currentPassword", data.currentPassword);
    formData.append("newPassword", data.newPassword);
    formData.append("confirmPassword", data.confirmPassword);

    const result = await updatePassword(formData);
    setLoading(false);

    if (result.success) {
      toast.success(result.message);
    } else {
      setServerError(result.error || null);
      toast.error(result.error || "Gagal mengubah password.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="currentPassword">Password Saat Ini</Label>
        <Input
          id="currentPassword"
          type="password"
          {...register("currentPassword")}
          placeholder="••••••••"
          error={errors.currentPassword?.message}
          leftIcon={<Lock className="w-4 h-4 text-zinc-400" />}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="newPassword">Password Baru</Label>
        <Input
          id="newPassword"
          type="password"
          {...register("newPassword")}
          placeholder="Min 8 karakter (1 besar, 1 kecil, 1 angka, 1 simbol)"
          error={errors.newPassword?.message}
          leftIcon={<Lock className="w-4 h-4 text-zinc-400" />}
        />
        {newPassword && (
          <div className="space-y-1.5 mt-2">
            {requirements.map((req) => (
              <div
                key={req.label}
                className={`flex items-center gap-2 text-xs transition-colors duration-200 ${
                  req.met ? "text-emerald-600" : "text-zinc-400"
                }`}
              >
                {req.met ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <XCircle className="w-3.5 h-3.5" />
                )}
                <span className={req.met ? "font-medium" : ""}>{req.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
        <Input
          id="confirmPassword"
          type="password"
          {...register("confirmPassword")}
          placeholder="Ulangi password baru"
          error={errors.confirmPassword?.message}
          leftIcon={<ShieldCheck className="w-4 h-4 text-zinc-400" />}
        />
        {confirmPassword && !errors.confirmPassword && (
          <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Password cocok
          </p>
        )}
      </div>

      {serverError && (
        <p className="text-xs font-semibold text-red-500">{serverError}</p>
      )}

      <Button
        type="submit"
        isLoading={loading || isSubmitting}
        disabled={loading || isSubmitting || !isValid}
        className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
        leftIcon={<Lock className="w-4 h-4" />}
      >
        Ubah Password
      </Button>
    </form>
  );
}
