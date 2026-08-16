"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { updatePassword } from "@/features/auth/actions";
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="currentPassword" className="text-xs font-bold text-zinc-700 font-sans">Password Saat Ini</Label>
        <Input
          id="currentPassword"
          type="password"
          {...register("currentPassword")}
          placeholder="••••••••"
          error={errors.currentPassword?.message}
          leftIcon={<Lock className="w-4 h-4 text-zinc-400" />}
          className="text-sm bg-zinc-50 border-zinc-200 rounded-xl"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="newPassword" className="text-xs font-bold text-zinc-700 font-sans">Password Baru</Label>
        <Input
          id="newPassword"
          type="password"
          {...register("newPassword")}
          placeholder="Min 8 karakter (1 besar, 1 kecil, 1 angka, 1 simbol)"
          error={errors.newPassword?.message}
          leftIcon={<Lock className="w-4 h-4 text-zinc-400" />}
          className="text-sm bg-zinc-50 border-zinc-200 rounded-xl"
        />
        {newPassword && (
          <div className="space-y-1.5 mt-2 bg-zinc-50 p-3 rounded-xl border border-zinc-200/60">
            {requirements.map((req) => (
              <div
                key={req.label}
                className={`flex items-center gap-2 text-sm transition-colors duration-200 font-mono ${
                  req.met ? "text-emerald-600 font-semibold" : "text-zinc-400"
                }`}
              >
                {req.met ? (
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 shrink-0" />
                )}
                <span>{req.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword" className="text-xs font-bold text-zinc-700 font-sans">Konfirmasi Password Baru</Label>
        <Input
          id="confirmPassword"
          type="password"
          {...register("confirmPassword")}
          placeholder="Ulangi password baru"
          error={errors.confirmPassword?.message}
          leftIcon={<ShieldCheck className="w-4 h-4 text-zinc-400" />}
          className="text-sm bg-zinc-50 border-zinc-200 rounded-xl"
        />
        {confirmPassword && !errors.confirmPassword && (
          <p className="text-sm text-emerald-600 font-mono mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Password cocok
          </p>
        )}
      </div>

      {serverError && (
        <p className="text-sm font-semibold text-red-500">{serverError}</p>
      )}

      <Button
        type="submit"
        isLoading={loading || isSubmitting}
        disabled={loading || isSubmitting || !isValid}
        className="w-full mt-2 bg-zinc-950 hover:bg-zinc-800 text-white font-bold h-11 text-xs rounded-xl shadow-xs cursor-pointer"
        leftIcon={<Lock className="w-4 h-4 text-white" />}
      >
        Ubah Password
      </Button>
    </form>
  );
}
