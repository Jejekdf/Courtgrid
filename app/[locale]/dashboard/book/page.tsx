import { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import CustomerBookingWorkspace from "@/components/dashboard/CustomerBookingWorkspace";
import PageHeader from "@/components/ui/PageHeader";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("dashboard.book");
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
  };
}

export default async function CustomerBookPage() {
  const session = await auth();
  const t = await getTranslations("dashboard.book");

  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }

  return (
    <div className="space-y-8 max-w-7xl 2xl:max-w-[88rem] mx-auto text-zinc-950">
      {/* Shared Reusable PageHeader (Consistent with Admin) */}
      <PageHeader
        title={t("pageTitle")}
        description={t("pageDesc")}
      />

      <CustomerBookingWorkspace />
    </div>
  );
}
