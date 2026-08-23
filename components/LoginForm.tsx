"use client";

import { useState, useEffect } from "react";
import { Link } from "@/i18n/navigation";
import { useQueryState, parseAsString } from "nuqs";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { login } from "@/features/auth/actions";
import { createLoginSchema, LoginInput } from "@/lib/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PasswordRequirements } from "@/components/auth/PasswordRequirements";
import SocialAuthButtons from "@/components/ui/SocialAuthButtons";

const easeCustom = [0.16, 1, 0.3, 1] as const;

const inputLabelClass = "text-xs font-medium uppercase tracking-wider text-zinc-500";

export default function LoginForm() {
  const [errorParam] = useQueryState("error", parseAsString);
  const [showPassword, setShowPassword] = useState(false);
  const t = useTranslations("auth.login");
  const tVal = useTranslations("validation");

  const form = useForm<LoginInput>({
    resolver: zodResolver(createLoginSchema(tVal)),
    mode: "onChange",
    defaultValues: { email: "", password: "" },
  });

  const password = useWatch({ control: form.control, name: "password", defaultValue: "" });

  useEffect(() => {
    if (errorParam === "OAuthAccountNotLinked") {
      toast.error(t("toastOAuthNotLinked"));
    } else if (errorParam === "CallbackRouteError" || errorParam === "Configuration") {
      toast.error(t("toastOAuthFailed"));
    } else if (errorParam) {
      toast.error(t("toastAuthError"));
    }
  }, [errorParam, t]);

  const requirements = [
    { label: t("reqMin"), met: password.length >= 8 },
    { label: t("reqUpper"), met: /[A-Z]/.test(password) },
    { label: t("reqLower"), met: /[a-z]/.test(password) },
    { label: t("reqDigit"), met: /[0-9]/.test(password) },
    { label: t("reqSpecial"), met: /[^A-Za-z0-9]/.test(password) },
  ];

  const onSubmit = async (data: LoginInput) => {
    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("password", data.password);

    try {
      const result = await login(undefined, formData);

      if (result && typeof result === "object" && result.success) {
        toast.success(t("toastSuccess"));
        window.location.assign(result.redirectTo);
        return;
      }

      if (result && typeof result === "object" && result.error) {
        toast.error(result.error);
        return;
      }

      toast.error(t("toastGenericError"));
    } catch {
      toast.error(t("toastGenericError"));
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
                <FormLabel className={inputLabelClass}>{t("email")}</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder={t("emailPlaceholder")}
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
                <FormLabel className={inputLabelClass}>{t("password")}</FormLabel>
                <FormControl>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder={t("passwordPlaceholder")}
                    autoComplete="current-password"
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

                {password.length > 0 && (
                  <PasswordRequirements requirements={requirements} />
                )}

                <div className="flex justify-end mt-1.5">
                  <Link
                    href="/forgot-password"
                    className="text-sm font-medium text-zinc-500 hover:text-zinc-950 transition-colors"
                  >
                    {t("forgotPassword")}
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
            leftIcon={<LogIn className="size-4 text-white" />}
          >
            {t("submit")}
          </Button>
        </form>
      </Form>

      <SocialAuthButtons isLoading={form.formState.isSubmitting} />
    </motion.div>
  );
}