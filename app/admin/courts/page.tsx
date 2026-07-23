"use client";

import { useEffect, useState } from "react";
import { adminGetCourts, adminCreateCourt, adminUpdateCourt, adminDeleteCourt } from "@/actions/admin";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Plus, Pencil, Trash2, CheckCircle2, X } from "lucide-react";

type Court = {
  id: string;
  name: string;
  type: "FUTSAL" | "BADMINTON";
  pricePerHour: number;
  isActive: boolean;
};

export default function AdminCourtsPage() {
  const [courts, setCourts] = useState<Court[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState<"FUTSAL" | "BADMINTON">("FUTSAL");
  const [price, setPrice] = useState("");
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

  const handleEdit = (court: Court) => {
    setIsEditing(true);
    setCurrentId(court.id);
    setName(court.name);
    setType(court.type);
    setPrice(court.pricePerHour.toString());
    setIsActive(court.isActive);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setCurrentId(null);
    setName("");
    setType("FUTSAL");
    setPrice("");
    setIsActive(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", name);
    formData.append("type", type);
    formData.append("pricePerHour", price);
    formData.append("isActive", isActive.toString());

    if (isEditing && currentId) {
      await adminUpdateCourt(currentId, formData);
    } else {
      await adminCreateCourt(formData);
    }
    
    handleCancel();
    loadCourts();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus lapangan ini?")) {
      await adminDeleteCourt(id);
      loadCourts();
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-950">
          Manajemen Lapangan
        </h1>
        <p className="text-zinc-500 mt-1">
          Tambah, ubah, atau hapus data lapangan (Futsal & Badminton).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form Section */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-zinc-200 shadow-sm h-fit">
          <div className="flex items-center justify-between mb-6 border-b border-zinc-200 pb-4">
            <h2 className="text-lg font-semibold text-zinc-950">
              {isEditing ? "Edit Lapangan" : "Tambah Lapangan"}
            </h2>
            {isEditing && (
              <button onClick={handleCancel} className="text-zinc-400 hover:text-zinc-950">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nama Lapangan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Cth: Lapangan Futsal A"
              required
            />
            
            <div className="space-y-1.5 w-full text-left">
              <label className="block text-xs font-medium uppercase tracking-wider text-zinc-500">
                Tipe Lapangan
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
              label="Harga Per Jam (Rp)"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Cth: 150000"
              required
            />

            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-300 text-zinc-950 focus:ring-zinc-950"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-zinc-700">
                Status Aktif
              </label>
            </div>

            <Button type="submit" className="w-full mt-4" leftIcon={isEditing ? <CheckCircle2 className="h-4 w-4"/> : <Plus className="h-4 w-4"/>}>
              {isEditing ? "Simpan Perubahan" : "Tambah Lapangan"}
            </Button>
          </form>
        </div>

        {/* List Section */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-xs uppercase font-medium text-zinc-500">
                <tr>
                  <th className="px-6 py-3">Nama Lapangan</th>
                  <th className="px-6 py-3">Tipe</th>
                  <th className="px-6 py-3">Harga/Jam</th>
                  <th className="px-6 py-3 text-center">Status</th>
                  <th className="px-6 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                      Memuat data...
                    </td>
                  </tr>
                ) : courts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                      Belum ada data lapangan.
                    </td>
                  </tr>
                ) : (
                  courts.map((court) => (
                    <tr key={court.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-zinc-950">
                        {court.name}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-zinc-100 text-zinc-600 text-[10px] rounded-md uppercase font-semibold">
                          {court.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-zinc-700">
                        Rp {court.pricePerHour.toLocaleString("id-ID")}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {court.isActive ? (
                          <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                        ) : (
                          <span className="inline-flex h-2 w-2 rounded-full bg-red-500"></span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleEdit(court)}
                          className="p-1.5 text-zinc-400 hover:text-zinc-950 transition-colors bg-white border border-zinc-200 rounded-md shadow-sm"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(court.id)}
                          className="p-1.5 text-red-400 hover:text-red-600 transition-colors bg-white border border-red-100 hover:bg-red-50 rounded-md shadow-sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
