"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Eye, EyeOff, CheckCircle2, XCircle, LogIn } from "lucide-react";
import { login } from "@/features/auth/actions";
import { loginSchema, LoginInput } from "@/lib/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import SocialAuthButtons from "@/components/ui/SocialAuthButtons";

const easeCustom = [0.16, 1, 0.3, 1] as const;

const inputLabelClass = "text-xs font-medium uppercase tracking-wider text-zinc-500";

export default function LoginForm() {
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: { email: "", password: "" },
  });

  const password = form.watch("password", "");

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam === "OAuthAccountNotLinked") {
      toast.error("Email ini sudah terdaftar sebagai Admin via password. Silakan masuk menggunakan Email & Password.");
    } else if (errorParam === "CallbackRouteError" || errorParam === "Configuration") {
      toast.error("Gagal melakukan login OAuth sosial. Silakan masuk menggunakan Email & Password.");
    } else if (errorParam) {
      toast.error("Terjadi kesalahan otentikasi. Silakan masuk menggunakan Email & Password.");
    }
  }, [searchParams]);

  const requirements = [
    { label: "Minimal 8 karakter", met: password.length >= 8 },
    { label: "1 huruf besar (A-Z)", met: /[A-Z]/.test(password) },
    { label: "1 huruf kecil (a-z)", met: /[a-z]/.test(password) },
    { label: "1 angka (0-9)", met: /[0-9]/.test(password) },
    { label: "1 karakter spesial (!@#$%^&*)", met: /[^A-Za-z0-9]/.test(password) },
  ];

  const onSubmit = async (data: LoginInput) => {
    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("password", data.password);

    try {
      const result = await login(undefined, formData);

      if (result && typeof result === "object" && result.success) {
        toast.success("Berhasil masuk. Mengalihkan ke halaman utama...");
        window.location.href = result.redirectTo;
        return;
      }

      if (result && typeof result === "object" && result.error) {
        toast.error(result.error);
        return;
      }

      toast.error("Terjadi kesalahan saat masuk. Silakan coba lagi.");
    } catch {
      toast.error("Terjadi kesalahan saat masuk. Silakan coba lagi.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: easeCustom }}
      className="space-y-4 text-left"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className={inputLabelClass}>Alamat Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="nama@email.com"
                    autoComplete="email"
                    error={!!fieldState.error}
                    className="border-zinc-200"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className={inputLabelClass}>Kata Sandi</FormLabel>
                <FormControl>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    error={!!fieldState.error}
                    className="border-zinc-200"
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
                    {...field}
                  />
                </FormControl>
                <FormMessage />

                {password.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-1.5 mt-2 bg-zinc-50 p-3 rounded-lg border border-zinc-200/60"
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
                    className="text-sm font-medium text-zinc-500 hover:text-zinc-950 transition-colors"
                  >
                    Lupa Kata Sandi?
                  </Link>
                </div>
              </FormItem>
            )}
          />

          <Button
            type="submit"
            variant="primary"
            size="default"
            isLoading={form.formState.isSubmitting}
            className="w-full mt-2"
            leftIcon={<LogIn className="w-4 h-4 text-white" />}
          >
            Masuk Ke Akun
          </Button>
        </form>
      </Form>

      <SocialAuthButtons isLoading={form.formState.isSubmitting} />
    </motion.div>
  );
}