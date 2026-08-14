"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
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
import { resetPasswordAction } from "@/features/auth/actions";
import { resetPasswordSchema, ResetPasswordInput } from "@/lib/zod";

const easeCustom = [0.16, 1, 0.3, 1] as const;

const inputLabelClass = "text-xs font-medium uppercase tracking-wider text-zinc-500";

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
    defaultValues: { password: "", confirmPassword: "" },
  });

  useEffect(() => {
    if (!token) {
      toast.error("Token reset password tidak ditemukan atau tidak valid. Silakan ajukan permintaan ulang di halaman Lupa Password.");
    }
  }, [token]);

  if (!token) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-start gap-2">
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
        <p>Token reset password tidak ditemukan atau tidak valid. Silakan ajukan permintaan ulang di halaman Lupa Password.</p>
      </div>
    );
  }

  const onSubmit = async (data: ResetPasswordInput) => {
    try {
      const result = await resetPasswordAction({ token, newPassword: data.password });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Kata sandi berhasil diubah! Mengalihkan ke halaman login...");
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch {
      toast.error("Terjadi kesalahan yang tidak terduga.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: easeCustom }}
      className="space-y-4 text-left"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className={inputLabelClass}>Password Baru</FormLabel>
                <FormControl>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 8 karakter"
                    autoComplete="new-password"
                    disabled={form.formState.isSubmitting}
                    error={!!fieldState.error}
                    className="border-zinc-200"
                    rightElement={
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="text-zinc-400 hover:text-zinc-950 transition-colors focus:outline-none p-2 h-11 sm:h-10 flex items-center justify-center cursor-pointer"
                        aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                      >
                        {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                    }
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className={inputLabelClass}>Konfirmasi Password Baru</FormLabel>
                <FormControl>
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Ulangi password baru"
                    autoComplete="new-password"
                    disabled={form.formState.isSubmitting}
                    error={!!fieldState.error}
                    className="border-zinc-200"
                    rightElement={
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        className="text-zinc-400 hover:text-zinc-950 transition-colors focus:outline-none p-2 h-11 sm:h-10 flex items-center justify-center cursor-pointer"
                        aria-label={showConfirmPassword ? "Sembunyikan konfirmasi password" : "Tampilkan konfirmasi password"}
                      >
                        {showConfirmPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                    }
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            variant="primary"
            size="default"
            isLoading={form.formState.isSubmitting}
            disabled={form.formState.isSubmitting}
            className="w-full mt-2"
          >
            {form.formState.isSubmitting ? "Menyimpan..." : "Simpan Password Baru"}
          </Button>
        </form>
      </Form>
    </motion.div>
  );
}