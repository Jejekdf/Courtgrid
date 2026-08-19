"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { createRegisterSchema, RegisterInput } from "@/lib/zod";
import { registerUser } from "@/features/auth/actions";
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

const easeCustom = [0.16, 1, 0.3, 1] as const;

const inputLabelClass = "text-xs font-medium uppercase tracking-wider text-zinc-500";

export default function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const t = useTranslations("auth.register");
  const tVal = useTranslations("validation");

  const form = useForm<RegisterInput>({
    resolver: zodResolver(createRegisterSchema(tVal)),
    mode: "onChange",
    defaultValues: { nama: "", email: "", no_hp: "", password: "", confirmPassword: "" },
  });

  const watchPassword = useWatch({ control: form.control, name: "password", defaultValue: "" });

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
    formData.append("no_hp", data.no_hp);
    formData.append("password", data.password);
    formData.append("confirmPassword", data.confirmPassword);

    const result = await registerUser(formData);

    if (!result.success) {
      toast.error(result.error || t("toastError"));
      return;
    }

    toast.success(result.message || t("toastSuccess"));
    setTimeout(() => {
      router.push("/login");
    }, 2000);
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
            name="no_hp"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className={inputLabelClass}>{t("noHp")}</FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    placeholder={t("noHpPlaceholder")}
                    autoComplete="tel"
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
                <FormLabel className={inputLabelClass}>{t("password")}</FormLabel>
                <FormControl>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    error={!!fieldState.error}
                    className="border-zinc-200"
                    rightElement={
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="text-zinc-400 hover:text-zinc-950 transition-colors focus:outline-none p-2 h-11 sm:h-10 flex items-center justify-center cursor-pointer"
                        aria-label={showPassword ? t("hidePassword") : t("showPassword")}
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
                    className="border-zinc-200"
                    rightElement={
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        className="text-zinc-400 hover:text-zinc-950 transition-colors focus:outline-none p-2 h-11 sm:h-10 flex items-center justify-center cursor-pointer"
                        aria-label={
                          showConfirmPassword ? t("hideConfirm") : t("showConfirm")
                        }
                      >
                        {showConfirmPassword ? (
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
              </FormItem>
            )}
          />

          <Button
            type="submit"
            variant="primary"
            size="default"
            isLoading={form.formState.isSubmitting}
            className="w-full mt-2"
            leftIcon={<UserPlus className="w-4 h-4 text-white" />}
          >
            {t("submit")}
          </Button>
        </form>
      </Form>

      <SocialAuthButtons isLoading={form.formState.isSubmitting} />
    </motion.div>
  );
}