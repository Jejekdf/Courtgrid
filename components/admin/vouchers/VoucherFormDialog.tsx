"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { adminCreateVoucher, adminUpdateVoucher } from "@/features/vouchers/actions";
import { voucherSchema, type VoucherInput } from "@/features/vouchers/schemas";

export type AdminVoucher = {
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

interface VoucherFormContentProps {
  editing: AdminVoucher | null;
  initialExpiresAt: string;
  onClose: () => void;
  onSuccess: () => void;
}

function VoucherFormContent({ editing, initialExpiresAt, onClose, onSuccess }: VoucherFormContentProps) {
  const t = useTranslations("admin.vouchers");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof voucherSchema>, unknown, VoucherInput>({
    resolver: zodResolver(voucherSchema),
    mode: "onChange",
    defaultValues: {
      code: editing?.code ?? "",
      discountPct: editing?.discountPct ?? 10,
      maxDiscount: editing?.maxDiscount ?? "",
      minSpend: editing?.minSpend ?? 0,
      expiresAt: initialExpiresAt,
      maxUses: editing?.maxUses ?? 1,
      description: editing?.description ?? "",
      isActive: editing?.isActive ?? true,
    },
  });

  const onSubmit = async (data: VoucherInput) => {
    const fd = new FormData();
    fd.append("code", data.code);
    fd.append("discountPct", String(data.discountPct));
    fd.append("maxDiscount", data.maxDiscount != null ? String(data.maxDiscount) : "");
    fd.append("minSpend", String(data.minSpend));
    fd.append("expiresAt", data.expiresAt.toISOString().slice(0, 10));
    fd.append("maxUses", String(data.maxUses));
    fd.append("description", data.description || "");
    fd.append("isActive", String(data.isActive));

    const res = editing
      ? await adminUpdateVoucher(editing.id, fd)
      : await adminCreateVoucher(fd);

    if (res.success) {
      toast.success(editing ? t("updatedToast") : t("createdToast"));
      onClose();
      onSuccess();
    } else {
      toast.error(res.error || t("errorToast"));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
      <Input
        label={t("codeLabel")}
        {...register("code")}
        placeholder={t("codePlaceholder")}
        error={errors.code?.message}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label={t("discountLabel")}
          type="number"
          {...register("discountPct")}
          min={1}
          max={100}
          error={errors.discountPct?.message}
        />
        <Input
          label={t("maxDiscountLabel")}
          type="number"
          {...register("maxDiscount")}
          placeholder={t("maxDiscountPlaceholder")}
          error={errors.maxDiscount?.message}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input
          label={t("minSpendLabel")}
          type="number"
          {...register("minSpend")}
          min={0}
          error={errors.minSpend?.message}
        />
        <Input
          label={t("expiresLabel")}
          type="date"
          {...register("expiresAt")}
          error={errors.expiresAt?.message}
        />
      </div>
      <Input
        label={t("maxUsesLabel")}
        type="number"
        {...register("maxUses")}
        min={1}
        max={100}
        error={errors.maxUses?.message}
      />
      <p className="text-xs text-zinc-500 -mt-2">{t("maxUsesHint")}</p>
      <div className="space-y-1.5">
        <label className="text-sm font-medium">{t("descriptionLabel")}</label>
        <textarea
          {...register("description")}
          placeholder={t("descriptionPlaceholder")}
          maxLength={200}
          rows={2}
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-zinc-950/20"
        />
        {errors.description?.message && (
          <p className="text-sm font-medium text-red-500">{errors.description.message}</p>
        )}
      </div>
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          {...register("isActive")}
          className="size-4 rounded border-zinc-300"
        />
        {t("activeLabel")}
      </label>
      <div className="flex justify-end gap-2 pt-2 border-t">
        <DialogClose
          render={
            <Button type="button" variant="outline" size="sm" className="text-sm">
              {t("cancelBtn")}
            </Button>
          }
        />
        <Button
          type="submit"
          disabled={isSubmitting}
          isLoading={isSubmitting}
          className="bg-zinc-950 text-white"
        >
          {editing ? t("editTitle") : t("addTitle")}
        </Button>
      </div>
    </form>
  );
}

interface VoucherFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  voucherToEdit: AdminVoucher | null;
  initialExpiresAt: string;
  onSuccess: () => void;
}

export function VoucherFormDialog({
  isOpen,
  onOpenChange,
  voucherToEdit,
  initialExpiresAt,
  onSuccess,
}: VoucherFormDialogProps) {
  const t = useTranslations("admin.vouchers");

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90svh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{voucherToEdit ? t("editTitle") : t("addTitle")}</DialogTitle>
          <DialogDescription>{t("formDesc")}</DialogDescription>
        </DialogHeader>
        {isOpen && (
          <VoucherFormContent
            key={voucherToEdit ? voucherToEdit.id : "new-voucher"}
            editing={voucherToEdit}
            initialExpiresAt={initialExpiresAt}
            onClose={() => onOpenChange(false)}
            onSuccess={onSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
