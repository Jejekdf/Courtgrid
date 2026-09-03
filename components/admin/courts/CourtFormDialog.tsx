"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, CheckCircle2, Upload } from "lucide-react";
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
import { adminCreateCourt, adminUpdateCourt } from "@/features/admin/actions";
import { uploadCourtImageAction } from "@/features/courts/actions";
import type { AdminCourt } from "./CourtCard";

interface CourtFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  courtToEdit: AdminCourt | null;
  onSuccess: () => void;
}

function CourtFormContent({
  courtToEdit,
  onClose,
  onSuccess,
}: {
  courtToEdit: AdminCourt | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const t = useTranslations("admin.courts");
  const tv = useTranslations("validation");
  const isEditing = Boolean(courtToEdit);

  const [name, setName] = useState(courtToEdit?.name ?? "");
  const [type, setType] = useState<"FUTSAL" | "BADMINTON">(courtToEdit?.type ?? "FUTSAL");
  const [price, setPrice] = useState(courtToEdit ? courtToEdit.pricePerHour.toString() : "");
  const [imageUrl, setImageUrl] = useState(courtToEdit?.imageUrl ?? "");
  const [isActive, setIsActive] = useState(courtToEdit?.isActive ?? true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith("image/")) {
        toast.error(t("imageInvalidToast"));
        return;
      }
      if (file.size > 3 * 1024 * 1024) {
        toast.error(t("imageTooLargeToast"));
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let finalImageUrl = imageUrl;

      if (selectedFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", selectedFile);
        const uploadRes = await uploadCourtImageAction(uploadFormData);

        if (uploadRes.success && uploadRes.url) {
          finalImageUrl = uploadRes.url;
        } else {
          toast.error(uploadRes.error || t("uploadFailToast"));
          setIsSubmitting(false);
          return;
        }
      }

      const formData = new FormData();
      formData.append("name", name);
      formData.append("type", type);
      formData.append("pricePerHour", price);
      formData.append("isActive", isActive.toString());
      formData.append("imageUrl", finalImageUrl);

      let res;
      if (isEditing && courtToEdit) {
        res = await adminUpdateCourt(courtToEdit.id, formData);
      } else {
        res = await adminCreateCourt(formData);
      }

      if (res && "success" in res && !res.success) {
        toast.error(res.error || tv(isEditing ? "courtUpdateFailed" : "courtCreateFailed"));
        setIsSubmitting(false);
        return;
      }

      toast.success(isEditing ? t("updatedToast") : t("addedToast"));
      onClose();
      onSuccess();
    } catch {
      toast.error(tv(isEditing ? "courtUpdateFailed" : "courtCreateFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-2">
      <Input
        label={t("nameLabel")}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t("namePlaceholder")}
        required
      />

      <div className="space-y-1.5 w-full text-left">
        <label className="block text-xs font-medium uppercase tracking-wider text-zinc-500">
          {t("typeLabel")}
        </label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as "FUTSAL" | "BADMINTON")}
          className="flex h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-950/20 focus:border-zinc-950"
        >
          <option value="FUTSAL">FUTSAL</option>
          <option value="BADMINTON">BADMINTON</option>
        </select>
      </div>

      <Input
        label={t("priceLabel")}
        type="number"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        placeholder={t("pricePlaceholder")}
        required
      />

      <div className="space-y-1.5 w-full text-left">
        <label className="block text-xs font-medium uppercase tracking-wider text-zinc-500">
          {t("uploadLabel")}
        </label>
        <div className="flex items-center gap-2">
          <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-zinc-200 rounded-lg bg-zinc-50 hover:bg-zinc-100 transition-colors cursor-pointer text-sm font-medium text-zinc-700">
            <Upload className="size-4 text-zinc-500" />
            <span>{selectedFile ? selectedFile.name : t("chooseFile")}</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <Input
        label={t("urlLabel")}
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        placeholder={t("urlPlaceholder")}
      />

      <div className="flex items-center space-x-2 pt-1 pb-1">
        <input
          type="checkbox"
          id="isActive"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="h-4 w-4 rounded border-zinc-300 text-zinc-950 focus:ring-zinc-950 cursor-pointer"
        />
        <label htmlFor="isActive" className="text-sm font-medium text-zinc-700 cursor-pointer">
          {t("activeCheckbox")}
        </label>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t border-zinc-100">
        <DialogClose
          render={
            <Button type="button" variant="outline" size="sm" className="text-sm">
              {t("cancelBtn")}
            </Button>
          }
        />
        <Button
          type="submit"
          size="sm"
          isLoading={isSubmitting}
          disabled={isSubmitting}
          className="bg-zinc-950 text-white text-sm font-semibold"
          leftIcon={
            isEditing ? (
              <CheckCircle2 className="h-3.5 w-3.5" />
            ) : (
              <Plus className="h-3.5 w-3.5" />
            )
          }
        >
          {isSubmitting
            ? t("uploadingBtn")
            : isEditing
            ? t("saveChangesBtn")
            : t("saveCourtBtn")}
        </Button>
      </div>
    </form>
  );
}

export function CourtFormDialog({
  isOpen,
  onOpenChange,
  courtToEdit,
  onSuccess,
}: CourtFormDialogProps) {
  const t = useTranslations("admin.courts");
  const isEditing = Boolean(courtToEdit);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-zinc-950">
            {isEditing ? t("editDialogTitle") : t("addDialogTitle")}
          </DialogTitle>
          <DialogDescription className="text-sm text-zinc-500">
            {t("formDesc")}
          </DialogDescription>
        </DialogHeader>

        {isOpen && (
          <CourtFormContent
            key={courtToEdit ? courtToEdit.id : "create-court"}
            courtToEdit={courtToEdit}
            onClose={() => onOpenChange(false)}
            onSuccess={onSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
