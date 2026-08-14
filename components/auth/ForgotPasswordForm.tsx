"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
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
import { forgotPasswordAction } from "@/features/auth/actions";
import { forgotPasswordSchema, ForgotPasswordInput } from "@/lib/zod";

const easeCustom = [0.16, 1, 0.3, 1] as const;

const inputLabelClass = "text-xs font-medium uppercase tracking-wider text-zinc-500";

export default function ForgotPasswordForm() {
  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onChange",
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    try {
      const result = await forgotPasswordAction({ email: data.email });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(result.message);
      form.reset();
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
            name="email"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className={inputLabelClass}>Alamat Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="nama@email.com"
                    autoComplete="email"
                    disabled={form.formState.isSubmitting}
                    error={!!fieldState.error}
                    className="border-zinc-200"
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
            {form.formState.isSubmitting ? "Mengirim..." : "Kirim Tautan Reset"}
          </Button>
        </form>
      </Form>
    </motion.div>
  );
}