"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { sendContactAction } from "@/features/contact/actions";
import { buildContactSchema, type ContactInput } from "@/features/contact/schemas";
import { useTranslations } from "next-intl";

export default function ContactForm() {
  const tVal = useTranslations("validation");
  const form = useForm<ContactInput>({
    resolver: zodResolver(buildContactSchema(tVal)),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(values: ContactInput) {
    setIsSubmitting(true);
    const result = await sendContactAction(values);
    setIsSubmitting(false);

    if (result.success) {
      toast.success(tVal("contactSendSuccess"), {
        description: tVal("contactSendSuccessDesc"),
      });
      form.reset();
    } else {
      toast.error(tVal("contactSendFailed"), {
        description: result.error,
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-zinc-950 font-semibold">Nama Lengkap</FormLabel>
              <FormControl>
                <Input placeholder="Masukkan Nama Lengkap Anda" {...field} className="bg-zinc-50/50" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-zinc-950 font-semibold">Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="nama@email.com" {...field} className="bg-zinc-50/50" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-zinc-950 font-semibold">Pesan Anda</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Tuliskan pertanyaan atau kendala Anda di sini..." 
                  className="min-h-30 resize-none bg-zinc-50/50" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" size="lg" disabled={isSubmitting} className="w-full sm:w-auto">
          {isSubmitting && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
          Kirim Pesan
          <Send className="ml-2 w-4 h-4" />
        </Button>
      </form>
    </Form>
  );
}
