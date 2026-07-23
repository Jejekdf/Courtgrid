"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const easeCustom = [0.16, 1, 0.3, 1] as const;

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    setMessage(null);

    try {
      const response = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal memproses permintaan.");
      }

      setStatus("success");
      setMessage("Tautan reset kata sandi telah dikirim ke email Anda.");
      setEmail("");
    } catch (error: any) {
      setStatus("error");
      setMessage(error.message || "Terjadi kesalahan yang tidak terduga.");
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
              className={`flex items-start gap-2.5 p-3 rounded-lg border text-xs font-medium overflow-hidden ${
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
          id="email"
          type="email"
          label="Alamat Email"
          placeholder="nama@domain.com"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === "loading" || status === "success"}
          required
        />

        <Button
          type="submit"
          variant="primary"
          size="default"
          isLoading={status === "loading"}
          disabled={status === "loading" || status === "success" || !email}
          className="w-full mt-2"
        >
          {status === "loading" ? "Mengirim..." : "Kirim Tautan Reset"}
        </Button>
      </form>
    </motion.div>
  );
}
