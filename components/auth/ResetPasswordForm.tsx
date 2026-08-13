"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { resetPasswordAction } from "@/features/auth/actions";

const easeCustom = [0.16, 1, 0.3, 1] as const;

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  if (!token) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-start gap-2">
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
        <p>Token reset password tidak ditemukan atau tidak valid. Silakan ajukan permintaan ulang di halaman Lupa Password.</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) return;

    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("Konfirmasi password tidak cocok dengan password baru.");
      return;
    }

    if (password.length < 8) {
      setStatus("error");
      setMessage("Password minimal harus 8 karakter.");
      return;
    }

    setStatus("loading");
    setMessage(null);

    try {
      const result = await resetPasswordAction({ token, newPassword: password });

      if (!result.success) {
        throw new Error(result.error);
      }

      setStatus("success");
      setMessage("Kata sandi berhasil diubah! Mengalihkan ke halaman login...");
      
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Terjadi kesalahan yang tidak terduga.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: easeCustom }}
      className="space-y-4 text-left"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Status banner */}
        <AnimatePresence mode="wait">
          {message && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -6 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -6 }}
              transition={{ duration: 0.3, ease: easeCustom }}
              aria-live="polite"
              className={`flex items-start gap-2.5 p-3 rounded-lg border text-sm font-medium overflow-hidden ${
                status === "success" 
                  ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                  : "bg-red-50 border-red-200 text-red-500"
              }`}
            >
              {status === "success" ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-500" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-500" />
              )}
              <span>{message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <Input
          id="password"
          type={showPassword ? "text" : "password"}
          label="Password Baru"
          placeholder="Min. 8 karakter"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={status === "loading" || status === "success"}
          required
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
        />

        <Input
          id="confirmPassword"
          type={showConfirmPassword ? "text" : "password"}
          label="Konfirmasi Password Baru"
          placeholder="Ulangi password baru"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={status === "loading" || status === "success"}
          required
          rightElement={
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="text-zinc-400 hover:text-zinc-950 transition-colors focus:outline-none p-2 h-11 sm:h-10 flex items-center justify-center cursor-pointer"
              aria-label={showConfirmPassword ? "Sembunyikan password" : "Tampilkan password"}
            >
              {showConfirmPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>
          }
        />

        <Button
          type="submit"
          variant="primary"
          size="default"
          isLoading={status === "loading"}
          disabled={status === "loading" || status === "success" || !password || !confirmPassword}
          className="w-full mt-2"
        >
          {status === "loading" ? "Menyimpan..." : "Simpan Password Baru"}
        </Button>
      </form>
    </motion.div>
  );
}
