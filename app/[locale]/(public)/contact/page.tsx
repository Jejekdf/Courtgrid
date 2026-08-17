import { Metadata } from "next";
import PageWrapper from "@/components/ui/PageWrapper";
import ContactForm from "@/components/ContactForm";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as "id" | "en", namespace: "contact" });
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as "id" | "en", namespace: "contact" });

  const channelList = [
    {
      icon: MapPin,
      title: t("channel1Title"),
      desc: t("channel1Desc"),
    },
    {
      icon: Phone,
      title: t("channel2Title"),
      desc: t("channel2Desc"),
      mono: true,
    },
    {
      icon: Clock,
      title: t("channel3Title"),
      desc: t("channel3Desc"),
    },
  ];

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 bg-[var(--background)] text-zinc-950">
      <PageWrapper className="max-w-4xl mx-auto space-y-10">
        {/* Document Header */}
        <header className="border-b border-zinc-200 pb-6 space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
            <span>{t("breadcrumbCompany")}</span>
            <span>/</span>
            <span className="text-zinc-950 font-semibold">{t("breadcrumbContact")}</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950">
            {t("title")}
          </h1>
          <p className="text-base text-zinc-600 leading-relaxed max-w-xl">
            {t("description")}
          </p>
        </header>

        {/* 2-Column Baseline Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Channels List */}
          <div className="md:col-span-5 space-y-6">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-500 block">
              {t("channelsTitle")}
            </span>
            <div className="divide-y divide-zinc-200 border-t border-b border-zinc-200">
              {channelList.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="py-4 space-y-1">
                    <div className="flex items-center gap-2 text-sm font-semibold text-zinc-950">
                      <Icon className="w-4 h-4 text-zinc-900 shrink-0" />
                      <span>{item.title}</span>
                    </div>
                    <p className={`text-sm text-zinc-600 pl-6 leading-relaxed ${item.mono ? "font-mono font-medium" : ""}`}>
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Contact Form Section */}
          <div className="md:col-span-7 space-y-4 p-6 bg-white rounded-xl border border-zinc-200 shadow-xs">
            <div className="flex items-center gap-2 border-b border-zinc-200 pb-3">
              <Mail className="w-4 h-4 text-zinc-900" />
              <span className="text-xs font-medium uppercase tracking-wider text-zinc-950">{t("sendMessageTitle")}</span>
            </div>
            <ContactForm />
          </div>
        </div>
      </PageWrapper>
    </div>
  );
}
