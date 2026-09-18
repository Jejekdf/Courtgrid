"use client";

import { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryState } from "nuqs";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Eye, EyeOff, UserPlus, Mail, ArrowLeft, RotateCw, CheckCircle2 } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { createRegisterSchema, RegisterInput } from "@/lib/zod";
import { registerUser, verifyRegisterOtp, resendRegisterOtp } from "@/features/auth/actions";
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
import { PasswordStrengthIndicator } from "@/components/auth/PasswordStrengthIndicator";
import { OtpInput } from "@/components/auth/OtpInput";

const easeCustom = [0.16, 1, 0.3, 1] as const;

const inputLabelClass = "text-xs sm:text-sm lg:text-sm font-bold uppercase tracking-wider text-zinc-700";

export default function RegisterForm() {
  const router = useRouter();
  const [callbackUrl] = useQueryState("callbackUrl");
  const [step, setStep] = useState<"form" | "otp">("form");
  const [pendingEmail, setPendingEmail] = useState("");
  const [otpValue, setOtpValue] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const canResend = countdown === 0;
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const t = useTranslations("auth.register");
  const tVal = useTranslations("validation");

  const form = useForm<RegisterInput>({
    resolver: zodResolver(createRegisterSchema(tVal)),
    mode: "onBlur",
    defaultValues: { nama: "", email: "", password: "", confirmPassword: "" },
  });

  const watchPassword = useWatch({ control: form.control, name: "password", defaultValue: "" });

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (step === "otp" && countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [step, countdown]);

  // Real-time password criteria verification
  const passwordCriteria = [
    { label: t("criteriaMin"), valid: watchPassword.length >= 8 },
    { label: t("criteriaUpper"), valid: /[A-Z]/.test(watchPassword) },
    { label: t("criteriaLower"), valid: /[a-z]/.test(watchPassword) },
    { label: t("criteriaDigit"), valid: /[0-9]/.test(watchPassword) },
    { label: t("criteriaSpecial"), valid: /[^A-Za-z0-9]/.test(watchPassword) },
  ];

  const metCount = passwordCriteria.filter((c) => c.valid).length;

  const getStrengthInfo = () => {
    if (!watchPassword) return { label: "", percent: 0, color: "bg-zinc-200", textColor: "text-zinc-400" };
    if (metCount <= 2) return { label: t("strengthWeak"), percent: 25, color: "bg-red-500", textColor: "text-red-500" };
    if (metCount <= 4) return { label: t("strengthMedium"), percent: 65, color: "bg-amber-500", textColor: "text-amber-600" };
    return { label: t("strengthStrong"), percent: 100, color: "bg-emerald-600", textColor: "text-emerald-600" };
  };

  const strength = getStrengthInfo();

  const onSubmit = async (data: RegisterInput) => {
    const formData = new FormData();
    formData.append("nama", data.nama);
    formData.append("email", data.email);
    formData.append("password", data.password);
    formData.append("confirmPassword", data.confirmPassword);

    const result = await registerUser(formData);

    if (!result.success) {
      toast.error(result.error || t("toastError"));
      return;
    }

    if (result.requiresOtp) {
      toast.success(result.message || t("otpSent"));
      setPendingEmail(result.email || data.email);
      setStep("otp");
      setCountdown(60);
      setOtpValue("");
      return;
    }

    toast.success(result.message || t("toastSuccess"));
    const target = callbackUrl ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/login";
    router.push(target);
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (otpValue.length !== 6 || isVerifying) return;

    setIsVerifying(true);
    try {
      const res = await verifyRegisterOtp(pendingEmail, otpValue);
      if (!res.success) {
        toast.error(res.error || t("toastError"));
        setIsVerifying(false);
        return;
      }

      toast.success(res.message || t("otpSuccess"));
      const target = callbackUrl ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/login";
      router.push(target);
    } catch {
      toast.error(t("toastError"));
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend || isResending) return;
    setIsResending(true);
    try {
      const res = await resendRegisterOtp(pendingEmail);
      if (!res.success) {
        toast.error(res.error || t("toastError"));
      } else {
        toast.success(res.message || t("otpResent"));
        setCountdown(60);
      }
    } catch {
      toast.error(t("toastError"));
    } finally {
      setIsResending(false);
    }
  };

  if (step === "otp") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25, ease: easeCustom }}
        className="space-y-4 text-center py-2"
      >
        <div className="flex flex-col items-center space-y-2">
          <div className="size-12 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600 shadow-xs">
            <Mail className="size-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-950 tracking-tight">
            {t("otpTitle")}
          </h2>
          <p className="text-sm text-zinc-600 max-w-sm mx-auto leading-relaxed">
            {t("otpDesc")}{" "}
            <span className="font-semibold text-zinc-950">{pendingEmail}</span>
          </p>
        </div>

        <form onSubmit={handleVerifyOtp} className="space-y-4 pt-2">
          <OtpInput
            value={otpValue}
            onChange={setOtpValue}
            ariaLabel={t("otpInputLabel")}
          />

          <Button
            type="submit"
            variant="primary"
            size="default"
            disabled={otpValue.length !== 6}
            isLoading={isVerifying}
            className="w-full min-h-12 h-12 lg:min-h-13 lg:h-13 text-base lg:text-lg font-bold rounded-xl"
            leftIcon={<CheckCircle2 className="size-4.5 text-white" />}
          >
            {isVerifying ? t("otpVerifying") : t("otpVerifyButton")}
          </Button>
        </form>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs sm:text-sm">
          <button
            type="button"
            onClick={() => setStep("form")}
            className="inline-flex items-center gap-1.5 font-medium text-zinc-600 hover:text-zinc-950 transition-colors cursor-pointer"
          >
            <ArrowLeft className="size-3.5" />
            {t("otpChangeEmail")}
          </button>

          <div className="flex items-center gap-1">
            {canResend ? (
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isResending}
                className="inline-flex items-center gap-1.5 font-bold text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer disabled:opacity-50"
              >
                <RotateCw className={`size-3.5 ${isResending ? "animate-spin" : ""}`} />
                {isResending ? t("otpResending") : t("otpResendButton")}
              </button>
            ) : (
              <span className="text-zinc-600 font-mono text-xs">
                {t("otpResendWait")} {countdown}s
              </span>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: easeCustom }}
      className="space-y-3 text-left"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="nama"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className={inputLabelClass}>{t("nama")}</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder={t("namaPlaceholder")}
                      autoComplete="name"
                      error={!!fieldState.error}
                      className="border-zinc-200 min-h-12 h-12 lg:min-h-13 lg:h-13 text-base rounded-xl px-4"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className={inputLabelClass}>{t("email")}</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="nama@email.com"
                      autoComplete="email"
                      error={!!fieldState.error}
                      className="border-zinc-200 min-h-12 h-12 lg:min-h-13 lg:h-13 text-base rounded-xl px-4"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="password"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className={inputLabelClass}>{t("password")}</FormLabel>
                <FormControl>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    error={!!fieldState.error}
                    className="border-zinc-200 min-h-12 h-12 lg:min-h-13 lg:h-13 text-base rounded-xl px-4"
                    rightElement={
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="text-zinc-400 hover:text-zinc-950 transition-colors focus:outline-hidden p-2.5 h-12 lg:h-13 flex items-center justify-center cursor-pointer"
                        aria-label={showPassword ? t("hidePassword") : t("showPassword")}
                      >
                        {showPassword ? (
                          <Eye className="size-4.5" />
                        ) : (
                          <EyeOff className="size-4.5" />
                        )}
                      </button>
                    }
                    {...field}
                  />
                </FormControl>
                <FormMessage />

                {watchPassword.length > 0 && (
                  <PasswordStrengthIndicator
                    strengthLabel={t("strengthLabel")}
                    strength={strength}
                    criteria={passwordCriteria}
                  />
                )}
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className={inputLabelClass}>{t("confirmPassword")}</FormLabel>
                <FormControl>
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    error={!!fieldState.error}
                    className="border-zinc-200 min-h-12 h-12 lg:min-h-13 lg:h-13 text-base rounded-xl px-4"
                    rightElement={
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        className="text-zinc-400 hover:text-zinc-950 transition-colors focus:outline-hidden p-2.5 h-12 lg:h-13 flex items-center justify-center cursor-pointer"
                        aria-label={
                          showConfirmPassword ? t("hideConfirm") : t("showConfirm")
                        }
                      >
                        {showConfirmPassword ? (
                          <Eye className="size-4.5" />
                        ) : (
                          <EyeOff className="size-4.5" />
                        )}
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
            className="w-full mt-2 min-h-12 h-12 lg:min-h-13 lg:h-13 text-base lg:text-lg font-bold rounded-xl"
            leftIcon={<UserPlus className="size-4.5 text-white" />}
          >
            {t("submit")}
          </Button>
        </form>
      </Form>

      <SocialAuthButtons isLoading={form.formState.isSubmitting} callbackUrl={callbackUrl ?? undefined} />
    </motion.div>
  );
}