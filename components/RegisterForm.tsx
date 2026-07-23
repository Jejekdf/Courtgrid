"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, AlertCircle, CheckCircle2, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { registerSchema, RegisterInput } from "@/lib/zod";
import { registerUser } from "@/actions/auth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import SocialAuthButtons from "@/components/ui/SocialAuthButtons";

const easeCustom = [0.16, 1, 0.3, 1] as const;

export default function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverSuccess, setServerSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
  });

  const watchPassword = watch("password", "");

  // Real-time password criteria verification
  const passwordCriteria = [
    { label: "Minimal 8 Karakter", valid: watchPassword.length >= 8 },
    { label: "Minimal 1 Huruf Besar (A-Z)", valid: /[A-Z]/.test(watchPassword) },
    { label: "Minimal 1 Huruf Kecil (a-z)", valid: /[a-z]/.test(watchPassword) },
    { label: "Minimal 1 Angka (0-9)", valid: /[0-9]/.test(watchPassword) },
    { label: "Minimal 1 Karakter Spesial (!@#$%)", valid: /[^A-Za-z0-9]/.test(watchPassword) },
  ];

  const metCount = passwordCriteria.filter((c) => c.valid).length;

  const getStrengthInfo = () => {
    if (!watchPassword) return { label: "", percent: 0, color: "bg-zinc-200", textColor: "text-zinc-400" };
    if (metCount <= 2) return { label: "Lemah", percent: 25, color: "bg-red-500", textColor: "text-red-500" };
    if (metCount <= 4) return { label: "Sedang", percent: 65, color: "bg-amber-500", textColor: "text-amber-600" };
    return { label: "Kuat", percent: 100, color: "bg-emerald-600", textColor: "text-emerald-600" };
  };

  const strength = getStrengthInfo();

  const onSubmit = async (data: RegisterInput) => {
    setServerError(null);
    setServerSuccess(null);

    const formData = new FormData();
    formData.append("nama", data.nama);
    formData.append("email", data.email);
    formData.append("no_hp", data.no_hp);
    formData.append("password", data.password);
    formData.append("confirmPassword", data.confirmPassword);

    const result = await registerUser(formData);

    if (!result.success) {
      setServerError(result.error || "Terjadi kesalahan saat mendaftar.");
    } else {
      setServerSuccess(result.message || "Pendaftaran berhasil! Mengalihkan ke halaman masuk...");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: easeCustom }}
      className="space-y-4 text-left"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Alert Banners */}
        <AnimatePresence mode="wait">
          {serverError && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -6 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -6 }}
              transition={{ duration: 0.3, ease: easeCustom }}
              aria-live="polite"
              className="flex items-start gap-2.5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-500 text-xs font-medium overflow-hidden"
            >
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-500" />
              <span>{serverError}</span>
            </motion.div>
          )}

          {serverSuccess && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -6 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -6 }}
              transition={{ duration: 0.3, ease: easeCustom }}
              aria-live="polite"
              className="flex items-start gap-2.5 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium overflow-hidden"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{serverSuccess}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Nama Lengkap */}
        <Input
          id="nama"
          type="text"
          label="Nama Lengkap"
          placeholder="Randi Maulana"
          autoComplete="name"
          error={errors.nama?.message}
          {...register("nama")}
        />

        {/* Email Address */}
        <Input
          id="email"
          type="email"
          label="Email Address"
          placeholder="nama@domain.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />

        {/* Nomor HP */}
        <Input
          id="no_hp"
          type="tel"
          label="Nomor WhatsApp / HP"
          placeholder="081234567890"
          autoComplete="tel"
          error={errors.no_hp?.message}
          {...register("no_hp")}
        />

        {/* Password Field */}
        <div className="space-y-2">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            label="Password"
            placeholder="••••••••"
            autoComplete="new-password"
            error={errors.password?.message}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-zinc-400 hover:text-zinc-950 transition-colors focus:outline-none p-1 cursor-pointer"
                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              >
                {showPassword ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
              </button>
            }
            {...register("password")}
          />

          {/* Real-time Password Strength Meter */}
          {watchPassword.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.2 }}
              className="space-y-2 p-3 rounded-lg bg-zinc-50 border border-zinc-200"
            >
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-500">Kekuatan Password:</span>
                <span className={`font-semibold ${strength.textColor}`}>
                  {strength.label}
                </span>
              </div>

              {/* Strength Bar */}
              <div className="h-1.5 w-full bg-zinc-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${strength.color}`}
                  style={{ width: `${strength.percent}%` }}
                />
              </div>

              {/* Criteria Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 text-[11px]">
                {passwordCriteria.map((c, i) => (
                  <div
                    key={i}
                    className={`flex items-center space-x-1.5 transition-colors ${
                      c.valid ? "text-emerald-600 font-medium" : "text-zinc-400"
                    }`}
                  >
                    {c.valid ? (
                      <Check className="h-3 w-3 shrink-0 text-emerald-600" />
                    ) : (
                      <div className="h-1.5 w-1.5 rounded-full bg-zinc-300 mx-0.5 shrink-0" />
                    )}
                    <span>{c.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Confirm Password Field */}
        <Input
          id="confirmPassword"
          type={showConfirmPassword ? "text" : "password"}
          label="Konfirmasi Password"
          placeholder="••••••••"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          rightElement={
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="text-zinc-400 hover:text-zinc-950 transition-colors focus:outline-none p-1 cursor-pointer"
              aria-label={
                showConfirmPassword ? "Sembunyikan konfirmasi password" : "Tampilkan konfirmasi password"
              }
            >
              {showConfirmPassword ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </button>
          }
          {...register("confirmPassword")}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="default"
          isLoading={isSubmitting}
          className="w-full mt-2"
        >
          Buat Akun Sekarang
        </Button>
      </form>

      {/* Social OAuth Providers */}
      <SocialAuthButtons isLoading={isSubmitting} />
    </motion.div>
  );
}
