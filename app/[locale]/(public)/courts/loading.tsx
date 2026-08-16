import { Loader2 } from "lucide-react";

export default function CourtsLoading() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      <p className="text-sm text-zinc-500">Memuat data lapangan...</p>
    </div>
  );
}