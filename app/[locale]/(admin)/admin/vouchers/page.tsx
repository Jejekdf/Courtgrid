"use client";

import { useState } from "react";
import { useDebouncedCallback } from "@react-hookz/web";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Plus, Pencil, Trash2, Search, Power, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { formatRupiah } from "@/lib/utils";
import {
  adminGetVouchers,
  adminDeleteVoucher,
  adminToggleVoucherActive,
} from "@/features/vouchers/actions";
import { VoucherFormDialog, type AdminVoucher } from "@/components/admin/vouchers/VoucherFormDialog";

export default function AdminVouchersPage() {
  const t = useTranslations("admin.vouchers");
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [searchDraft, setSearchDraft] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<AdminVoucher | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AdminVoucher | null>(null);

  const [initialExpiresAt, setInitialExpiresAt] = useState("");

  const debouncedSetSearch = useDebouncedCallback(
    (value: string) => {
      setSearch(value);
    },
    [setSearch],
    300
  );

  const { data: vouchers = [], isLoading } = useQuery({
    queryKey: ["admin", "vouchers"],
    queryFn: async () => {
      const data = await adminGetVouchers();
      return data as unknown as AdminVoucher[];
    },
  });

  const openAdd = () => {
    setEditing(null);
    setInitialExpiresAt(new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10));
    setIsDialogOpen(true);
  };

  const openEdit = (v: AdminVoucher) => {
    setEditing(v);
    setInitialExpiresAt(new Date(v.expiresAt).toISOString().slice(0, 10));
    setIsDialogOpen(true);
  };

  const filtered = vouchers.filter((v) =>
    v.code.toLowerCase().includes(search.toLowerCase()) ||
    (v.description || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full flex flex-col gap-8 text-zinc-950">
      <AdminHeader
        title={t("title")}
        description={t("desc")}
        actions={
          <Button onClick={openAdd} className="bg-zinc-950 text-white text-sm font-semibold min-h-10 px-3.5" leftIcon={<Plus className="size-4" />}>
            {t("addVoucher")}
          </Button>
        }
      />

      <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-xs">
        <div className="relative max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
          <Input
            value={searchDraft}
            onChange={(e) => {
              const val = e.target.value;
              setSearchDraft(val);
              debouncedSetSearch(val);
            }}
            placeholder={t("searchPlaceholder")}
            className="pl-10 h-10 text-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-zinc-400 font-mono">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center gap-3">
            <div className="size-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-500">
              <Tag className="size-6 text-zinc-400" />
            </div>
            <div className="flex flex-col gap-1 max-w-xs">
              <p className="font-heading font-bold text-base text-zinc-950 text-balance">
                {search ? t("noResults") : t("empty")}
              </p>
              <p className="text-xs sm:text-sm text-zinc-500 font-sans text-pretty">
                {search
                  ? "Coba kata kunci lain untuk mencari kode voucher."
                  : "Buat kode voucher diskon pertama Anda untuk promosi pelanggan."}
              </p>
            </div>
            {search ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSearchDraft("");
                  setSearch("");
                }}
                className="mt-1"
              >
                Reset Pencarian
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={openAdd}
                className="mt-1 bg-zinc-950 text-white"
                leftIcon={<Plus className="size-4" />}
              >
                {t("addVoucher")}
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Mobile Cards (sm:hidden) */}
            <div className="divide-y divide-zinc-100 sm:hidden">
              {filtered.map((v) => (
                <div key={v.id} className="p-4 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-mono font-bold text-sm text-zinc-950 flex items-center gap-1.5">
                        <Tag className="size-3.5 text-zinc-400" />
                        <span>{v.code}</span>
                      </div>
                      {v.description && (
                        <p className="text-xs text-zinc-500 mt-0.5">{v.description}</p>
                      )}
                    </div>
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-md text-[0.6875rem] font-bold uppercase border shrink-0 ${
                        v.isActive
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-zinc-100 text-zinc-600 border-zinc-200"
                      }`}
                    >
                      {v.isActive ? t("active") : t("inactive")}
                    </span>
                  </div>

                  <div className="bg-zinc-50/70 border border-zinc-100 rounded-lg p-2.5 flex flex-col gap-1 text-xs text-zinc-700">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">{t("colDiscount")}</span>
                      <span className="font-bold text-zinc-950 font-mono">{v.discountPct}%</span>
                    </div>
                    {v.maxDiscount ? (
                      <div className="flex justify-between">
                        <span className="text-zinc-500">{t("colMaxDiscount")}</span>
                        <span className="font-semibold text-zinc-800 font-mono">{formatRupiah(v.maxDiscount)}</span>
                      </div>
                    ) : null}
                    <div className="flex justify-between font-mono text-[0.6875rem] text-zinc-500 pt-0.5 border-t border-zinc-100">
                      <span>{t("colExpires")}: {new Date(v.expiresAt).toLocaleDateString("id-ID")}</span>
                      <span>{t("colUses")}: {v.maxUses}x</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-1 pt-1 border-t border-zinc-100">
                    <button
                      onClick={async () => {
                        await adminToggleVoucherActive(v.id, !v.isActive);
                        queryClient.invalidateQueries({ queryKey: ["admin", "vouchers"] });
                      }}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        v.isActive
                          ? "text-emerald-600 hover:bg-emerald-50 border-emerald-200"
                          : "text-zinc-400 hover:bg-zinc-100 border-zinc-200"
                      }`}
                      title={v.isActive ? t("inactive") : t("active")}
                    >
                      <Power className="size-4" />
                    </button>
                    <button
                      onClick={() => openEdit(v)}
                      className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-600 border border-zinc-200 transition-colors"
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      onClick={() => {
                        setPendingDelete(v);
                        setIsDeleteOpen(true);
                      }}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 border border-red-200 transition-colors"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table (hidden sm:block) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-zinc-200/80 bg-zinc-50/50 text-[0.6875rem] font-bold uppercase text-zinc-500">
                    <th className="p-4 pl-6">{t("colCode")}</th>
                    <th className="p-4">{t("colDiscount")}</th>
                    <th className="p-4">{t("colMaxDiscount")}</th>
                    <th className="p-4">{t("colMinSpend")}</th>
                    <th className="p-4">{t("colExpires")}</th>
                    <th className="p-4">{t("colUses")}</th>
                    <th className="p-4">{t("colStatus")}</th>
                    <th className="p-4 pr-6 text-right">{t("colAction")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/60 text-sm">
                  {filtered.map((v) => (
                    <tr key={v.id} className="hover:bg-zinc-50/50 transition-colors group">
                      <td className="p-4 pl-6">
                      <div className="font-mono font-bold text-zinc-950 flex items-center gap-2">
                        <Tag className="size-3.5 text-zinc-400" />
                        <span>{v.code}</span>
                      </div>
                      {v.description && (
                        <div className="text-xs text-zinc-500 mt-0.5 line-clamp-1 max-w-[200px]">
                          {v.description}
                        </div>
                      )}
                    </td>
                    <td className="p-4 font-mono font-semibold text-zinc-950">{v.discountPct}%</td>
                    <td className="p-4 font-mono text-zinc-600">
                      {v.maxDiscount ? formatRupiah(v.maxDiscount) : "-"}
                    </td>
                    <td className="p-4 font-mono text-zinc-600">{formatRupiah(v.minSpend)}</td>
                    <td className="p-4 font-mono text-zinc-600 text-xs">
                      {new Date(v.expiresAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="p-4 font-mono text-zinc-600">{v.maxUses}x</td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          v.isActive
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-zinc-100 text-zinc-600 border border-zinc-200"
                        }`}
                      >
                        {v.isActive ? t("active") : t("inactive")}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={async () => {
                            await adminToggleVoucherActive(v.id, !v.isActive);
                            queryClient.invalidateQueries({ queryKey: ["admin", "vouchers"] });
                          }}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            v.isActive
                              ? "text-emerald-600 hover:bg-emerald-50 border-emerald-200"
                              : "text-zinc-400 hover:bg-zinc-100 border-zinc-200"
                          }`}
                          title={v.isActive ? t("inactive") : t("active")}
                        >
                          <Power className="size-4" />
                        </button>
                        <button
                          onClick={() => openEdit(v)}
                          className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-600 transition-colors"
                          title={t("editTitle")}
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          onClick={() => {
                            setPendingDelete(v);
                            setIsDeleteOpen(true);
                          }}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                          title={t("deleteTitle")}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>

      <VoucherFormDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        voucherToEdit={editing}
        initialExpiresAt={initialExpiresAt}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ["admin", "vouchers"] })}
      />

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("deleteDesc", { code: pendingDelete?.code || "" })}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancelBtn")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (pendingDelete) {
                  const res = await adminDeleteVoucher(pendingDelete.id);
                  if (res.success) {
                    toast.success(t("deletedToast"));
                    queryClient.invalidateQueries({ queryKey: ["admin", "vouchers"] });
                  } else toast.error(res.error || t("errorToast"));
                }
                setIsDeleteOpen(false);
              }}
            >
              {t("deleteConfirmBtn")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
