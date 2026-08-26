"use client";

import { useState } from "react";
import { useQueryState } from "nuqs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminGetCourts, adminCreateCourt, adminUpdateCourt, adminDeleteCourt, adminToggleCourtActive } from "@/features/admin/actions";
import { uploadCourtImageAction } from "@/features/courts/actions";
import { courtKeys } from "@/lib/query-keys";
import { adminCourtsParsers } from "@/lib/search-params";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, CheckCircle2, Power, Search, Upload, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import AdminHeader from "@/components/admin/AdminHeader";
import { useTranslations } from "next-intl";
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

type Court = {
  id: string;
  name: string;
  type: "FUTSAL" | "BADMINTON";
  pricePerHour: number;
  isActive: boolean;
  imageUrl?: string | null;
};

export default function AdminCourtsPage() {
  const t = useTranslations("admin.courts");
  const queryClient = useQueryClient();
  const [tab, setTab] = useQueryState("tab", adminCourtsParsers.tab.withOptions({ shallow: true }));
  const [search, setSearch] = useQueryState("search", adminCourtsParsers.search.withOptions({ shallow: true }));

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [type, setType] = useState<"FUTSAL" | "BADMINTON">("FUTSAL");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Fetch court list for admin management
  const { data: courts = [], isLoading } = useQuery({
    queryKey: courtKeys.all,
    queryFn: async () => {
      const data = await adminGetCourts();
      return Array.isArray(data) ? (data as Court[]) : [];
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
    mutationFn: ({ court, isActive }: { court: Court; isActive: boolean }) => {
      const formData = new FormData();
      formData.append("isActive", isActive.toString());
      return adminToggleCourtActive(court.id, formData);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: courtKeys.all });
      toast.success(variables.isActive ? t("activatedToast", { name: variables.court.name }) : t("deactivatedToast", { name: variables.court.name }));
    },
  });

  const filteredCourts = courts.filter((court) => {
    if (tab === "active") return court.isActive;
    if (tab === "inactive") return !court.isActive;
    return true;
  });

  const openAdd = () => {
    setIsEditing(false);
    setCurrentId(null);
    setName("");
    setType("FUTSAL");
    setPrice("");
    setImageUrl("");
    setSelectedFile(null);
    setIsActive(true);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (court: Court) => {
    setIsEditing(true);
    setCurrentId(court.id);
    setName(court.name);
    setType(court.type);
    setPrice(court.pricePerHour.toString());
    setImageUrl(court.imageUrl || "");
    setSelectedFile(null);
    setIsActive(court.isActive);
    setIsDialogOpen(true);
  };

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
    let finalImageUrl = imageUrl;

    if (selectedFile) {
      setUploadingImage(true);
      const uploadFormData = new FormData();
      uploadFormData.append("file", selectedFile);
      const uploadRes = await uploadCourtImageAction(uploadFormData);
      setUploadingImage(false);

      if (uploadRes.success && uploadRes.url) {
        finalImageUrl = uploadRes.url;
      } else {
        toast.error(uploadRes.error || t("uploadFailToast"));
        return;
      }
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("type", type);
    formData.append("pricePerHour", price);
    formData.append("isActive", isActive.toString());
    formData.append("imageUrl", finalImageUrl);

    if (isEditing && currentId) {
      await adminUpdateCourt(currentId, formData);
    } else {
      await adminCreateCourt(formData);
    }

    setIsDialogOpen(false);
    queryClient.invalidateQueries({ queryKey: courtKeys.all });
    toast.success(isEditing ? t("updatedToast") : t("addedToast"));
  };

  const handleDelete = (id: string) => {
    setCurrentId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleToggleActive = (court: Court) => {
    toggleMutation.mutate({ court, isActive: !court.isActive });
  };

  return (
    <div className="space-y-8 max-w-7xl 2xl:max-w-[88rem] mx-auto text-zinc-950">
      {/* Reusable Admin Header Component */}
      <AdminHeader
        title={t("title")}
        description={t("desc")}
        actions={
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <button
              onClick={openAdd}
              className="px-4 py-2 text-sm font-semibold bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg transition-colors inline-flex items-center gap-1.5 shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>{t("addCourt")}</span>
            </button>
            <DialogContent className="sm:max-w-106.25">
              <DialogHeader>
                <DialogTitle className="text-base font-bold text-zinc-950">{isEditing ? t("editDialogTitle") : t("addDialogTitle")}</DialogTitle>
                <DialogDescription className="text-sm text-zinc-500">
                  {t("formDesc")}
                </DialogDescription>
              </DialogHeader>

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

                {/* Upload File Section */}
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
                  <DialogClose render={<Button type="button" variant="outline" size="sm" className="text-sm">{t("cancelBtn")}</Button>} />
                  <Button type="submit" size="sm" isLoading={uploadingImage} disabled={uploadingImage} className="bg-zinc-950 text-white text-sm font-semibold" leftIcon={isEditing ? <CheckCircle2 className="h-3.5 w-3.5"/> : <Plus className="h-3.5 w-3.5"/>}>
                    {uploadingImage ? t("uploadingBtn") : isEditing ? t("saveChangesBtn") : t("saveCourtBtn")}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 rounded-lg p-1">
          <button onClick={() => setTab("all")} className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${tab === "all" ? "bg-zinc-950 text-white" : "text-zinc-600 hover:bg-zinc-200/50"}`}>
            {t("tabAll", { count: courts.length })}
          </button>
          <button onClick={() => setTab("active")} className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${tab === "active" ? "bg-emerald-600 text-white" : "text-emerald-700 hover:bg-emerald-50"}`}>
            {t("tabActive")}
          </button>
          <button onClick={() => setTab("inactive")} className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${tab === "inactive" ? "bg-red-600 text-white" : "text-red-700 hover:bg-red-50"}`}>
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

      {/* Baseline Grid Layout */}
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
              <div key={court.id} className="bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden flex flex-col hover:border-zinc-950 transition-colors">
                <div className="relative h-36 bg-zinc-100 border-b border-zinc-200 flex items-center justify-center overflow-hidden">
                  {court.imageUrl ? (
                    <Image src={court.imageUrl} alt={court.name} fill className="object-cover" sizes="(min-width: 1024px) 33vw,(min-width: 640px) 50vw,100vw" />
                  ) : (
                    <div className="text-sm text-zinc-400 font-mono flex items-center gap-1">
                      <ImageIcon className="size-3.5" />
                      <span>No Image</span>
                    </div>
                  )}
                </div>
                <div className="p-4 space-y-3 flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-zinc-950">{court.name}</h3>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[0.6875rem] font-mono font-bold uppercase tracking-wider bg-zinc-100 text-zinc-600 border border-zinc-200">
                        {court.type}
                      </span>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[0.6875rem] font-mono font-bold uppercase tracking-wider ${court.isActive ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                      {court.isActive ? t("tabActive") : t("inactiveBadge")}
                    </span>
                  </div>
                  <div className="text-sm text-zinc-600">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">{t("perHour")}</span>
                      <span className="font-bold text-zinc-950">Rp {court.pricePerHour.toLocaleString("id-ID")}</span>
                    </div>
                  </div>
                  <div className="mt-auto flex items-center justify-between gap-2 pt-3 border-t border-zinc-100">
                    <button
                      onClick={() => handleToggleActive(court)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border text-sm font-semibold transition-colors border-zinc-200 text-zinc-700 hover:bg-zinc-100"
                    >
                      <Power className={`size-3.5 ${court.isActive ? "text-red-600" : "text-emerald-600"}`} />
                      <span>{court.isActive ? t("deactivateBtn") : t("activateBtn")}</span>
                    </button>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(court)}
                        className="p-1.5 text-zinc-600 hover:text-zinc-950 transition-colors border border-zinc-200 rounded-md"
                        aria-label={t("editAria")}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(court.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 transition-colors border border-red-200 rounded-md"
                        aria-label={t("deleteAria")}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
        )}
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancelBtn")}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (currentId) deleteMutation.mutate(currentId);
                setIsDeleteDialogOpen(false);
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
