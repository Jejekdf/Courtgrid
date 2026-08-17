"use client";

import PageWrapper from "@/components/ui/PageWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Briefcase,
  Send,
  CheckCircle2,
  MapPin,
  Clock,
  ChevronRight,
  Mail,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function CareersPageContent() {
  const t = useTranslations("careers");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [applicantName, setApplicantName] = useState("");
  const [applicantEmail, setApplicantEmail] = useState("");
  const [applicantPortfolio, setApplicantPortfolio] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const prospectiveRoles = [
    {
      id: "eng-1",
      title: t("role1Title"),
      department: t("role1Dept"),
      location: t("role1Loc"),
      type: t("role1Type"),
      tags: ["Next.js 16", "TypeScript", "Prisma", "PostgreSQL"],
    },
    {
      id: "prod-1",
      title: t("role2Title"),
      department: t("role2Dept"),
      location: t("role2Loc"),
      type: t("role2Type"),
      tags: ["Figma", "Design Systems", "Prototyping"],
    },
    {
      id: "ops-1",
      title: t("role3Title"),
      department: t("role3Dept"),
      location: t("role3Loc"),
      type: t("role3Type"),
      tags: ["Partnership", "Venue Mgmt", "Growth"],
    },
  ];

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      toast.success(t("toastSuccess"));
    }, 1000);
  };

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 bg-[var(--background)] text-zinc-950">
      <PageWrapper className="max-w-5xl mx-auto space-y-10">
        {/* Document Header */}
        <header className="border-b border-zinc-200 pb-6 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-400">
            <span>{t("breadcrumbCompany")}</span>
            <span>/</span>
            <span className="text-zinc-950 font-semibold">{t("breadcrumbCareers")}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-950">
            {t("title")}
          </h1>
          <p className="text-sm text-zinc-600 leading-relaxed max-w-xl">
            {t("description")}
          </p>
        </header>

        {/* Roles List (Baseline-UI Divide List) */}
        <section className="space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            {t("activeRolesTitle")}
          </span>

          <div className="divide-y divide-zinc-200 border-t border-b border-zinc-200">
            {prospectiveRoles.map((role) => (
              <div key={role.id} className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-zinc-950">{role.title}</h3>
                    <span className="px-2 py-0.5 text-[11px] font-semibold bg-zinc-100/80 text-zinc-700 rounded border border-zinc-200">
                      {role.department}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-zinc-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                      {role.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-zinc-400" />
                      {role.type}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {role.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 bg-zinc-50 text-zinc-600 text-[11px] font-mono rounded border border-zinc-200">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <Dialog>
                  <DialogTrigger
                    onClick={() => setSelectedRole(role.title)}
                    className="inline-flex items-center justify-center rounded-lg border border-zinc-200 bg-[var(--background)] min-h-11 px-4 py-2 text-sm font-semibold text-zinc-950 hover-fine:bg-zinc-950 hover-fine:text-white transition-colors shrink-0 group cursor-pointer"
                  >
                    <span>{t("sendProfileBtn")}</span>
                    <ChevronRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover-fine:translate-x-0.5" />
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[440px]">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2 text-base font-bold">
                        <Briefcase className="w-4 h-4 text-zinc-950" />
                        <span>{t("dialogTitle")} {selectedRole || role.title}</span>
                      </DialogTitle>
                      <DialogDescription className="text-sm text-zinc-500">
                        {t("dialogDesc")}
                      </DialogDescription>
                    </DialogHeader>

                    {isSubmitted ? (
                      <div className="py-6 text-center space-y-3">
                        <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                        <h4 className="font-bold text-zinc-950 text-sm">{t("submittedTitle")}</h4>
                        <p className="text-sm text-zinc-500">
                          {t("submittedDesc")}
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => setIsSubmitted(false)}
                          className="mt-2 text-sm min-h-11"
                        >
                          {t("closeBtn")}
                        </Button>
                      </div>
                    ) : (
                      <form onSubmit={handleApplySubmit} className="space-y-3 pt-2">
                        <Input
                          label={t("fullNameLabel")}
                          placeholder={t("fullNamePlaceholder")}
                          value={applicantName}
                          onChange={(e) => setApplicantName(e.target.value)}
                          required
                        />
                        <Input
                          label={t("emailLabel")}
                          type="email"
                          placeholder={t("emailPlaceholder")}
                          value={applicantEmail}
                          onChange={(e) => setApplicantEmail(e.target.value)}
                          required
                        />
                        <Input
                          label={t("portfolioLabel")}
                          placeholder={t("portfolioPlaceholder")}
                          value={applicantPortfolio}
                          onChange={(e) => setApplicantPortfolio(e.target.value)}
                          required
                        />
                        <Button
                          type="submit"
                          isLoading={isSubmitting}
                          disabled={isSubmitting}
                          className="w-full mt-3 bg-zinc-950 hover-fine:bg-zinc-800 text-white text-sm font-semibold min-h-11"
                          leftIcon={<Send className="w-3.5 h-3.5" />}
                        >
                          {t("submitAppBtn")}
                        </Button>
                      </form>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            ))}
          </div>
        </section>

        {/* Direct Application Block */}
        <section className="bg-zinc-950 rounded-xl p-6 text-white space-y-3 border border-zinc-800">
          <h3 className="text-base font-bold">{t("spontaneousTitle")}</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            {t("spontaneousDesc")}
          </p>
          <a href="mailto:careers@courtgrid.com" className="inline-block pt-1">
            <Button className="bg-white text-zinc-950 hover-fine:bg-zinc-100 text-sm font-semibold min-h-11" leftIcon={<Mail className="w-3.5 h-3.5" />}>
              careers@courtgrid.com
            </Button>
          </a>
        </section>
      </PageWrapper>
    </div>
  );
}
