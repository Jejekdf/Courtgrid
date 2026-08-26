"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Plus, Pencil, Trash2, Search, Power, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
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
import {
  adminGetVouchers,
  adminCreateVoucher,
  adminUpdateVoucher,
  adminDeleteVoucher,
  adminToggleVoucherActive,
} from "@/features/vouchers/actions";

type Voucher = {
  id: string;
  code: string;
  discountPct: number;
  maxDiscount: number | null;
  minSpend: number;
  expiresAt: string;
  maxUses: number;
  description: string | null;
  isActive: boolean;
};

export default function AdminVouchersPage() {
  const t = useTranslations("admin.vouchers");
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<Voucher | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Voucher | null>(null);

  const [code, setCode] = useState("");
  const [discountPct, setDiscountPct] = useState("10");
  const [maxDiscount, setMaxDiscount] = useState("");
  const [minSpend, setMinSpend] = useState("0");
  const [expiresAt, setExpiresAt] = useState("");
  const [maxUses, setMaxUses] = useState("1");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);

  const { data: vouchers = [], isLoading } = useQuery({
    queryKey: ["admin", "vouchers"],
    queryFn: async () => {
      const data = await adminGetVouchers();
      return data as unknown as Voucher[];
    },
  });

  const openAdd = () => {
    setEditing(null);
    setCode("");
    setDiscountPct("10");
    setMaxDiscount("");
    setMinSpend("0");
    setExpiresAt(new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10));
    setMaxUses("1");
    setDescription("");
    setIsActive(true);
    setIsDialogOpen(true);
  };

  const openEdit = (v: Voucher) => {
    setEditing(v);
    setCode(v.code);
    setDiscountPct(String(v.discountPct));
    setMaxDiscount(v.maxDiscount ? String(v.maxDiscount) : "");
    setMinSpend(String(v.minSpend));
    setExpiresAt(new Date(v.expiresAt).toISOString().slice(0, 10));
    setMaxUses(String(v.maxUses));
    setDescription(v.description || "");
    setIsActive(v.isActive);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("code", code);
    fd.append("discountPct", discountPct);
    fd.append("maxDiscount", maxDiscount);
    fd.append("minSpend", minSpend);
    fd.append("expiresAt", expiresAt);
    fd.append("maxUses", maxUses);
    fd.append("description", description);
    fd.append("isActive", String(isActive));

    const res = editing
      ? await adminUpdateVoucher(editing.id, fd)
      : await adminCreateVoucher(fd);

    if (res.success) {
      toast.success(editing ? t("updatedToast") : t("createdToast"));
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin", "vouchers"] });
    } else {
      toast.error(res.error || t("errorToast"));
    }
  };

  const filtered = vouchers.filter((v) =>
    v.code.toLowerCase().includes(search.toLowerCase()) ||
    (v.description || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl 2xl:max-w-[88rem] mx-auto text-zinc-950">
      <AdminHeader
        title={t("title")}
        description={t("desc")}
        actions={
          <Button onClick={openAdd} className="bg-zinc-950 text-white text-sm font-semibold" leftIcon={<Plus className="size-3.5" />}>
            {t("addVoucher")}
          </Button>
        }
      />

      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="pl-8"
          />
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-xs uppercase font-semibold text-zinc-500">
              <tr>
                <th className="px-4 py-3">{t("colCode")}</th>
                <th className="px-4 py-3">{t("colDiscount")}</th>
                <th className="px-4 py-3 hidden md:table-cell">{t("colMaxDiscount")}</th>
                <th className="px-4 py-3 hidden sm:table-cell">{t("colExpires")}</th>
                <th className="px-4 py-3">{t("colUses")}</th>
                <th className="px-4 py-3">{t("colStatus")}</th>
                <th className="px-4 py-3 text-right">{t("colAction")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-zinc-400">
                    {t("loading")}
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-zinc-400">
                    {t("empty")}
                  </td>
                </tr>
              ) : (
                filtered.map((v) => (
                  <tr key={v.id} className="hover:bg-zinc-50/60">
                    <td className="px-4 py-3 font-mono font-bold text-zinc-950">
                      <span className="inline-flex items-center gap-1">
                        <Tag className="size-3 text-zinc-400" />
                        {v.code}
                      </span>
                      {v.description && (
                        <div className="text-xs font-normal text-zinc-500 truncate max-w-[180px]">{v.description}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">{v.discountPct}%</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {v.maxDiscount ? `Rp ${v.maxDiscount.toLocaleString("id-ID")}` : "-"}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell font-mono text-xs">
                      {new Date(v.expiresAt).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-4 py-3 font-mono">{v.maxUses}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-md text-[0.6875rem] font-bold uppercase border ${
                          v.isActive
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-zinc-100 text-zinc-600 border-zinc-200"
                        }`}
                      >
                        {v.isActive ? t("active") : t("inactive")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEdit(v)}
                          className="p-1.5 border border-zinc-200 rounded-md hover:bg-zinc-50"
                          aria-label="Edit Voucher"
                        >
                          <Pencil className="size-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setPendingDelete(v);
                            setIsDeleteOpen(true);
                          }}
                          className="p-1.5 border border-red-200 text-red-600 rounded-md hover:bg-red-50"
                          aria-label="Hapus Voucher"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                        <button
                          onClick={async () => {
                            await adminToggleVoucherActive(v.id, !v.isActive);
                            queryClient.invalidateQueries({ queryKey: ["admin", "vouchers"] });
                          }}
                          className="p-1.5 border border-zinc-200 rounded-md hover:bg-zinc-50"
                          title={v.isActive ? "Nonaktifkan" : "Aktifkan"}
                        >
                          <Power className={`size-3.5 ${v.isActive ? "text-red-500" : "text-emerald-600"}`} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[520px] max-h-[90svh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? t("editTitle") : t("addTitle")}</DialogTitle>
            <DialogDescription>{t("formDesc")}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <Input label={t("codeLabel")} value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder={t("codePlaceholder")} required />
            <div className="grid grid-cols-2 gap-3">
              <Input label={t("discountLabel")} type="number" value={discountPct} onChange={(e) => setDiscountPct(e.target.value)} min={1} max={100} required />
              <Input label={t("maxDiscountLabel")} type="number" value={maxDiscount} onChange={(e) => setMaxDiscount(e.target.value)} placeholder={t("maxDiscountPlaceholder")} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label={t("minSpendLabel")} type="number" value={minSpend} onChange={(e) => setMinSpend(e.target.value)} min={0} />
              <Input label={t("expiresLabel")} type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} required />
            </div>
            <Input label={t("maxUsesLabel")} type="number" value={maxUses} onChange={(e) => setMaxUses(e.target.value)} min={1} max={100} required />
            <p className="text-xs text-zinc-500 -mt-2">{t("maxUsesHint")}</p>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t("descriptionLabel")}</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("descriptionPlaceholder")}
                maxLength={200}
                rows={2}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950/20"
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="size-4 rounded border-zinc-300" />
              {t("activeLabel")}
            </label>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <DialogClose render={<Button type="button" variant="outline" size="sm" className="text-sm">{t("cancelBtn")}</Button>} />
              <Button type="submit" className="bg-zinc-950 text-white">
                {editing ? t("editTitle") : t("addTitle")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

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
