"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateAdminSettings, getSettingsAction } from "@/features/settings/actions";
import { toast } from "sonner";
import { Save, CheckCircle2 } from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import { adminKeys } from "@/lib/query-keys";

type Settings = {
  id: number;
  venueName: string;
  operationalHours: string;
  contactPhone: string;
  dpPercentage: number;
  autoCancelTimeout: number;
  notifyEmail: string;
};

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(false);

  const [venueName, setVenueName] = useState("SM Sport Center - CourtGrid");
  const [operationalHours, setOperationalHours] = useState("08:00 - 23:00 WIB");
  const [contactPhone, setContactPhone] = useState("+62 812-3456-7890");
  const [dpPercentage, setDpPercentage] = useState("50");
  const [autoCancelTimeout, setAutoCancelTimeout] = useState("15");
  const [notifyEmail, setNotifyEmail] = useState("admin@courtgrid.com");

  const { data: settings } = useQuery({
    queryKey: adminKeys.settings(),
    queryFn: getSettingsAction,
    select: (res) => (res.success ? (res.data as Settings) : undefined),
  });

  // Hydrate the form once settings load (React "adjusting state during render" pattern —
  // guards against cascading setState-in-effect per react-hooks lint).
  const [loadedId, setLoadedId] = useState<number | null>(null);
  if (settings && settings.id !== loadedId) {
    setLoadedId(settings.id);
    setVenueName(settings.venueName);
    setOperationalHours(settings.operationalHours);
    setContactPhone(settings.contactPhone);
    setDpPercentage(String(settings.dpPercentage));
    setAutoCancelTimeout(String(settings.autoCancelTimeout));
    setNotifyEmail(settings.notifyEmail);
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("venueName", venueName);
    formData.append("operationalHours", operationalHours);
    formData.append("contactPhone", contactPhone);
    formData.append("dpPercentage", dpPercentage);
    formData.append("autoCancelTimeout", autoCancelTimeout);
    formData.append("notifyEmail", notifyEmail);

    const res = await updateAdminSettings(formData);
    setLoading(false);

    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.error || "Gagal menyimpan pengaturan.");
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto text-zinc-950">
      {/* Reusable Admin Header Component */}
      <AdminHeader
        title="Pengaturan"
        description="Konfigurasi parameter operasional arena, minimal uang muka (DP), dan durasi auto-cancel booking."
      />

      <form onSubmit={handleSave} className="space-y-8 divide-y divide-zinc-200">
        {/* Section 1: Profil Venue */}
        <div className="pt-2 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h2 className="text-sm font-bold text-zinc-950">Profil Arena</h2>
            <p className="text-sm text-zinc-500 mt-1 leading-relaxed">
              Nama tempat dan kontak resmi yang ditampilkan pada katalog publik serta e-ticket.
            </p>
          </div>
          <div className="md:col-span-2 space-y-4 bg-white p-5 border border-zinc-200 rounded-xl shadow-xs">
            <Input
              label="Nama Venue / Sports Center"
              value={venueName}
              onChange={(e) => setVenueName(e.target.value)}
              placeholder="Contoh: SM Sport Center - CourtGrid"
              required
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Jam Operasional"
                value={operationalHours}
                onChange={(e) => setOperationalHours(e.target.value)}
                placeholder="08:00 - 23:00 WIB"
                required
              />
              <Input
                label="Kontak Customer Service"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+62 812-3456-7890"
                required
              />
            </div>
          </div>
        </div>

        {/* Section 2: Kebijakan DP & Ghost Booking */}
        <div className="pt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h2 className="text-sm font-bold text-zinc-950">Kebijakan DP & Auto-Cancel</h2>
            <p className="text-sm text-zinc-500 mt-1 leading-relaxed">
              Minimal persentase DP online Stripe dan durasi rilis otomatis slot menggantung (FIX-H4).
            </p>
          </div>
          <div className="md:col-span-2 space-y-4 bg-white p-5 border border-zinc-200 rounded-xl shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Minimal DP (%)"
                type="number"
                value={dpPercentage}
                onChange={(e) => setDpPercentage(e.target.value)}
                min="10"
                max="100"
                required
              />
              <Input
                label="Timeout Auto-Cancel (Menit)"
                type="number"
                value={autoCancelTimeout}
                onChange={(e) => setAutoCancelTimeout(e.target.value)}
                min="1"
                max="120"
                required
              />
            </div>
            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-600 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                Reservasi <code className="font-mono font-semibold text-zinc-900">PENDING</code> tanpa Checkout Stripe yang melewati <strong className="text-zinc-900">{autoCancelTimeout} menit</strong> otomatis dibatalkan sistem.
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Notifikasi Admin */}
        <div className="pt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h2 className="text-sm font-bold text-zinc-950">Notifikasi System</h2>
            <p className="text-sm text-zinc-500 mt-1 leading-relaxed">
              Alamat email penerima konfirmasi transaksi masuk dari sistem.
            </p>
          </div>
          <div className="md:col-span-2 space-y-4 bg-white p-5 border border-zinc-200 rounded-xl shadow-xs">
            <Input
              label="Email Notifikasi Admin"
              type="email"
              value={notifyEmail}
              onChange={(e) => setNotifyEmail(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-6 flex justify-end">
          <Button
            type="submit"
            isLoading={loading}
            disabled={loading}
            className="bg-zinc-950 hover:bg-zinc-800 text-white font-semibold px-5 h-10 text-xs rounded-lg shadow-xs"
            leftIcon={<Save className="w-4 h-4" />}
          >
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </div>
      </form>
    </div>
  );
}
