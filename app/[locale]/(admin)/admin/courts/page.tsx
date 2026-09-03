"use client";

import { useState } from "react";
import { useQueryState } from "nuqs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminGetCourts, adminDeleteCourt, adminToggleCourtActive } from "@/features/admin/actions";
import { courtKeys } from "@/lib/query-keys";
import { adminCourtsParsers } from "@/lib/search-params";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { CourtCard, type AdminCourt } from "@/components/admin/courts/CourtCard";
import { CourtFormDialog } from "@/components/admin/courts/CourtFormDialog";
import { CourtDeleteDialog } from "@/components/admin/courts/CourtDeleteDialog";

export default function AdminCourtsPage() {
  const t = useTranslations("admin.courts");
  const queryClient = useQueryClient();
  const [tab, setTab] = useQueryState("tab", adminCourtsParsers.tab.withOptions({ shallow: true }));
  const [search, setSearch] = useQueryState("search", adminCourtsParsers.search.withOptions({ shallow: true }));

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCourt, setEditingCourt] = useState<AdminCourt | null>(null);
  const [deletingCourtId, setDeletingCourtId] = useState<string | null>(null);

  const { data: courts = [], isLoading } = useQuery({
    queryKey: courtKeys.all,
    queryFn: async () => {
      const data = await adminGetCourts();
      return Array.isArray(data) ? (data as AdminCourt[]) : [];
    },
    staleTime: 10000,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminDeleteCourt(id),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: courtKeys.all });
        toast.success(t("deletedToast"));
      } else {
        toast.error(result.error || t("deletedFailToast"));
      }
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ court, isActive }: { court: AdminCourt; isActive: boolean }) => {
      const formData = new FormData();
      formData.append("isActive", isActive.toString());
      return adminToggleCourtActive(court.id, formData);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: courtKeys.all });
      toast.success(
        variables.isActive
          ? t("activatedToast", { name: variables.court.name })
          : t("deactivatedToast", { name: variables.court.name })
      );
    },
  });

  const openAdd = () => {
    setEditingCourt(null);
    setIsFormOpen(true);
  };

  const handleEdit = (court: AdminCourt) => {
    setEditingCourt(court);
    setIsFormOpen(true);
  };

  const filteredCourts = courts.filter((court) => {
    if (tab === "active") return court.isActive;
    if (tab === "inactive") return !court.isActive;
    return true;
  });

  return (
    <div className="space-y-8 max-w-7xl 2xl:max-w-[88rem] mx-auto text-zinc-950">
      <AdminHeader
        title={t("title")}
        description={t("desc")}
        actions={
          <button
            onClick={openAdd}
            className="px-4 py-2 text-sm font-semibold bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg transition-colors inline-flex items-center gap-1.5 shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>{t("addCourt")}</span>
          </button>
        }
      />

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 rounded-lg p-1">
          <button
            onClick={() => setTab("all")}
            className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${
              tab === "all" ? "bg-zinc-950 text-white" : "text-zinc-600 hover:bg-zinc-200/50"
            }`}
          >
            {t("tabAll", { count: courts.length })}
          </button>
          <button
            onClick={() => setTab("active")}
            className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${
              tab === "active" ? "bg-emerald-600 text-white" : "text-emerald-700 hover:bg-emerald-50"
            }`}
          >
            {t("tabActive")}
          </button>
          <button
            onClick={() => setTab("inactive")}
            className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${
              tab === "inactive" ? "bg-red-600 text-white" : "text-red-700 hover:bg-red-50"
            }`}
          >
            {t("tabInactive")}
          </button>
        </div>
        <div className="relative w-full sm:w-64">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchPlaceholder")}
            containerClassName="w-full"
            leftIcon={<Search className="size-4 text-zinc-400" />}
          />
        </div>
      </div>

      {/* Court Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full text-center text-sm text-zinc-400 py-12">{t("loading")}</div>
        ) : filteredCourts.length === 0 ? (
          <div className="col-span-full text-center text-xs text-zinc-400 bg-zinc-50/50 border border-dashed border-zinc-200 rounded-xl py-12">
            {t("emptyList")}
          </div>
        ) : (
          filteredCourts
            .filter((court) => court.name.toLowerCase().includes(search.toLowerCase()))
            .map((court) => (
              <CourtCard
                key={court.id}
                court={court}
                onToggleActive={(c) => toggleMutation.mutate({ court: c, isActive: !c.isActive })}
                onEdit={handleEdit}
                onDelete={(id) => setDeletingCourtId(id)}
              />
            ))
        )}
      </div>

      {/* Form Dialog for Create/Edit */}
      <CourtFormDialog
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        courtToEdit={editingCourt}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: courtKeys.all })}
      />

      {/* Delete Confirmation Dialog */}
      <CourtDeleteDialog
        isOpen={Boolean(deletingCourtId)}
        onOpenChange={(open) => !open && setDeletingCourtId(null)}
        onConfirm={() => {
          if (deletingCourtId) {
            deleteMutation.mutate(deletingCourtId);
            setDeletingCourtId(null);
          }
        }}
      />
    </div>
  );
}
