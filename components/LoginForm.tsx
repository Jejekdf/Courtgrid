"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, AlertCircle, CheckCircle2, XCircle, LogIn } from "lucide-react";
import { login } from "@/features/auth/actions";
import { loginSchema, LoginInput } from "@/lib/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SocialAuthButtons from "@/components/ui/SocialAuthButtons";

const easeCustom = [0.16, 1, 0.3, 1] as const;

export default function LoginForm() {
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam === "OAuthAccountNotLinked") {
      setServerError("Email ini sudah terdaftar sebagai Admin via password. Silakan masuk menggunakan Email & Password.");
    } else if (errorParam === "CallbackRouteError" || errorParam === "Configuration") {
      setServerError("Gagal melakukan login OAuth sosial. Silakan masuk menggunakan Email & Password.");
    } else if (errorParam) {
      setServerError("Terjadi kesalahan otentikasi. Silakan masuk menggunakan Email & Password.");
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const password = watch("password", "");

  const requirements = [
    { label: "Minimal 8 karakter", met: password.length >= 8 },
    { label: "1 huruf besar (A-Z)", met: /[A-Z]/.test(password) },
    { label: "1 huruf kecil (a-z)", met: /[a-z]/.test(password) },
    { label: "1 angka (0-9)", met: /[0-9]/.test(password) },
    { label: "1 karakter spesial (!@#$%^&*)", met: /[^A-Za-z0-9]/.test(password) },
  ];

  const onSubmit = async (data: LoginInput) => {
    setServerError(null);
    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("password", data.password);

    try {
      const result = await login(undefined, formData);

      if (result && typeof result === "object" && result.success) {
        window.location.href = result.redirectTo;
        return;
      }

      if (result && typeof result === "object" && result.error) {
        setServerError(result.error);
        return;
      }

      setServerError("Terjadi kesalahan saat masuk. Silakan coba lagi.");
    } catch {
      setServerError("Terjadi kesalahan saat masuk. Silakan coba lagi.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: easeCustom }}
      className="space-y-4 text-left"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Server error alert banner */}
        <AnimatePresence mode="wait">
          {serverError && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -6 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -6 }}
              transition={{ duration: 0.3, ease: easeCustom }}
              aria-live="polite"
              className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-mono font-medium overflow-hidden"
            >
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-500" />
              <span>{serverError}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Email Field */}
        <Input
          id="email"
          type="email"
          label="Alamat Email"
          placeholder="nama@email.com"
          autoComplete="email"
          error={errors.email?.message}
          className="text-sm bg-zinc-50 border-zinc-200 rounded-xl"
          {...register("email")}
        />

        {/* Password Field */}
        <div>
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            label="Kata Sandi"
            placeholder="••••••••"
            autoComplete="current-password"
            error={errors.password?.message}
          className="h-11 text-xs bg-zinc-50 border-zinc-200 rounded-xl"
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-zinc-400 hover:text-zinc-950 transition-colors focus:outline-none p-2 h-11 sm:h-10 flex items-center justify-center cursor-pointer"
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

          {/* Real-time password requirements */}
          {password.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.2 }}
              className="space-y-1.5 mt-2 bg-zinc-50 p-3 rounded-xl border border-zinc-200/60"
            >
              {requirements.map((req) => (
                <div
                  key={req.label}
                  className={`flex items-center gap-2 text-sm font-mono transition-colors duration-200 ${
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
            </motion.div>
          )}

          <div className="flex justify-end mt-1.5">
            <Link
              href="/forgot-password"
              className="text-sm font-mono font-medium text-zinc-500 hover:text-zinc-950 transition-colors"
            >
              Lupa Kata Sandi?
            </Link>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="default"
          isLoading={isSubmitting}
          className="w-full mt-2 bg-zinc-950 hover:bg-zinc-800 text-white font-bold h-11 text-xs rounded-xl shadow-xs cursor-pointer"
          leftIcon={<LogIn className="w-4 h-4 text-white" />}
        >
          Masuk Ke Akun
        </Button>
      </form>

      {/* Social OAuth Providers */}
      <SocialAuthButtons isLoading={isSubmitting} />
    </motion.div>
  );
}
