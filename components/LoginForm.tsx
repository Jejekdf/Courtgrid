"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { loginSchema, LoginInput } from "@/lib/zod";
import { authenticate } from "@/actions/auth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const easeCustom = [0.16, 1, 0.3, 1] as const;

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: LoginInput) => {
    setServerError(null);
    try {
      const formData = new FormData();
      formData.append("email", data.email);
      formData.append("password", data.password);

      const result = await authenticate(undefined, formData);
      if (result) {
        setServerError(result);
      }
    } catch (error) {
      // Re-throw Next.js redirect error so the router handles navigation
      throw error;
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: easeCustom }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 text-left"
    >
      {/* Server error alert banner */}
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
      </AnimatePresence>

      {/* Email Field */}
      <Input
        id="email"
        type="email"
        label="Email Address"
        placeholder="nama@domain.com"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />

      {/* Password Field */}
      <Input
        id="password"
        type={showPassword ? "text" : "password"}
        label="Password"
        placeholder="••••••••"
        autoComplete="current-password"
        error={errors.password?.message}
        rightElement={
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="text-zinc-400 hover:text-zinc-950 transition-colors focus:outline-none p-1"
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

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        size="default"
        isLoading={isSubmitting}
        className="w-full mt-2"
      >
        Masuk Ke Akun
      </Button>
    </motion.form>
  );
}
