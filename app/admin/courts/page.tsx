"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { adminGetCourts, adminCreateCourt, adminUpdateCourt, adminDeleteCourt, adminToggleCourtActive } from "@/actions/admin";
import { courtKeys } from "@/lib/query-keys";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Plus, Pencil, Trash2, CheckCircle2, Power, Search } from "lucide-react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";

type Court = {
  id: string;
  name: string;
  type: "FUTSAL" | "BADMINTON";
  pricePerHour: number;
  isActive: boolean;
  imageUrl?: string | null;
};

type TabFilter = "all" | "active" | "inactive";

export default function AdminCourtsPage() {
  const queryClient = useQueryClient();
  const [courts, setCourts] = useState<Court[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [tab, setTab] = useState<TabFilter>("all");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [type, setType] = useState<"FUTSAL" | "BADMINTON">("FUTSAL");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    loadCourts();
  }, []);

  async function loadCourts() {
    setIsLoading(true);
    const data = await adminGetCourts();
    setCourts(data as Court[]);
    setIsLoading(false);
  }

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
    setIsActive(court.isActive);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", name);
    formData.append("type", type);
    formData.append("pricePerHour", price);
    formData.append("isActive", isActive.toString());
    formData.append("imageUrl", imageUrl);

    if (isEditing && currentId) {
      await adminUpdateCourt(currentId, formData);
    } else {
      await adminCreateCourt(formData);
    }

    setIsDialogOpen(false);
    loadCourts();
    queryClient.invalidateQueries({ queryKey: courtKeys.all });
    toast.success(isEditing ? "Lapangan berhasil diperbarui." : "Lapangan berhasil ditambahkan.");
  };

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus lapangan ini?")) {
      const result = await adminDeleteCourt(id);
      if (result.success) {
        loadCourts();
        queryClient.invalidateQueries({ queryKey: courtKeys.all });
        toast.success("Lapangan berhasil dihapus.");
      } else {
        toast.error(result.error || "Gagal menghapus lapangan.");
      }
    }
  };

  const handleToggleActive = async (court: Court) => {
    const formData = new FormData();
    formData.append("isActive", (!court.isActive).toString());
    await adminToggleCourtActive(court.id, formData);
    loadCourts();
    queryClient.invalidateQueries({ queryKey: courtKeys.all });
    toast.success(`Lapangan ${court.name} berhasil ${court.isActive ? "dinonaktifkan" : "diaktifkan"}.`);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-950 flex items-center gap-2">
            Manajemen Lapangan
          </h1>
          <p className="text-zinc-500 mt-1">
            Tambah, ubah, atau hapus data lapangan yang tersedia untuk disewa di platform CourtGrid.
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={
            <Button onClick={openAdd} leftIcon={<Plus className="h-4 w-4" />}>
              Tambah Lapangan
            </Button>
          } />
          <DialogContent className="sm:max-w-106.25">
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit Lapangan" : "Tambah Lapangan Baru"}</DialogTitle>
              <DialogDescription>
                Isi form di bawah ini untuk menyimpan data lapangan ke dalam sistem.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-5 mt-4">
              <Input
                label="Nama Lapangan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Cth: Lapangan Futsal A"
                required
              />

              <div className="space-y-1.5 w-full text-left">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Tipe Lapangan
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as "FUTSAL" | "BADMINTON")}
                  className="flex h-10 w-full rounded-lg border border-zinc-200 bg-zinc-50/50 px-3 text-sm text-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-950/20 focus:border-zinc-950"
                >
                  <option value="FUTSAL">FUTSAL</option>
                  <option value="BADMINTON">BADMINTON</option>
                </select>
              </div>

              <Input
                label="Harga Per Jam (Rp)"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Cth: 150000"
                required
              />

              <Input
                label="URL Gambar (opsional)"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/court.jpg"
              />

              <div className="flex items-center space-x-3 pt-2 pb-2">
                <div className="flex items-center justify-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                </div>
                <label htmlFor="isActive" className="text-sm font-medium text-zinc-700 cursor-pointer">
                  Lapangan Aktif (Tersedia untuk disewa)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100">
                <DialogClose render={<Button type="button" variant="outline">Batal</Button>} />
                <Button type="submit" leftIcon={isEditing ? <CheckCircle2 className="h-4 w-4"/> : <Plus className="h-4 w-4"/>}>
                  {isEditing ? "Simpan Perubahan" : "Simpan Lapangan"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-white border border-zinc-200 rounded-lg p-1 shadow-xs">
          <button onClick={() => setTab("all")} className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${tab === "all" ? "bg-zinc-950 text-white" : "text-zinc-600 hover:bg-zinc-100"}`}>
            Semua ({courts.length})
          </button>
          <button onClick={() => setTab("active")} className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${tab === "active" ? "bg-emerald-600 text-white" : "text-emerald-700 hover:bg-emerald-50"}`}>
            Aktif
          </button>
          <button onClick={() => setTab("inactive")} className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${tab === "inactive" ? "bg-red-600 text-white" : "text-red-700 hover:bg-red-50"}`}>
            Nonaktif
          </button>
        </div>
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama lapangan..."
            containerClassName="w-full sm:w-64"
            leftIcon={<Search className="w-4 h-4 text-zinc-400" />}
          />
        </div>
      </div>

      {/* Card Layout (Mobile + Desktop) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full text-center text-sm text-zinc-500">Memuat data lapangan...</div>
        ) : filteredCourts.length === 0 ? (
          <div className="col-span-full text-center text-sm text-zinc-500 bg-zinc-50/50 border border-dashed border-zinc-200 rounded-xl py-12">
            Belum ada data lapangan. Klik tombol <strong>Tambah Lapangan</strong> untuk memulai.
          </div>
        ) : (
          filteredCourts
            .filter((court) => court.name.toLowerCase().includes(search.toLowerCase()))
            .map((court) => (
              <div key={court.id} className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
                <div className="h-36 bg-zinc-100 border-b border-zinc-200 flex items-center justify-center overflow-hidden">
                  {court.imageUrl ? (
                    <Image src={court.imageUrl} alt={court.name} fill className="object-cover" sizes="(min-width: 1024px) 33vw,(min-width: 640px) 50vw,100vw" />
                  ) : (
                    <div className="text-xs text-zinc-400">Tidak ada gambar</div>
                  )}
                </div>
                <div className="p-4 space-y-3 flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-zinc-950">{court.name}</h3>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-600 border border-zinc-200">
                        {court.type}
                      </span>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${court.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${court.isActive ? "bg-emerald-500" : "bg-red-500"}`}></span>
                      {court.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>
                  <div className="text-xs text-zinc-600">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Harga/jam</span>
                      <span className="font-semibold text-zinc-950">Rp {court.pricePerHour.toLocaleString("id-ID")}</span>
                    </div>
                  </div>
                  <div className="mt-auto flex items-center justify-between gap-2 pt-3 border-t border-zinc-100">
                    <button
                      onClick={() => handleToggleActive(court)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-[11px] font-semibold transition-colors"
                    >
                      <Power className={`w-3.5 h-3.5 ${court.isActive ? "text-red-600" : "text-emerald-600"}`} />
                      {court.isActive ? "Nonaktifkan" : "Aktifkan"}
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(court)}
                        className="p-1.5 text-zinc-400 hover:text-zinc-950 transition-colors border border-zinc-200 rounded-md"
                        title="Edit Lapangan"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(court.id)}
                        className="p-1.5 text-red-400 hover:text-red-600 transition-colors border border-red-100 hover:bg-red-50 rounded-md"
                        title="Hapus Lapangan"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
