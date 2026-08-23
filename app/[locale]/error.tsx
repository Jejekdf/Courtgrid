"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-xl font-semibold text-zinc-950">Terjadi kesalahan</h1>
      <p className="text-sm text-zinc-500">
        Silakan coba lagi. Jika terus terjadi, hubungi tim kami.
      </p>
      <Button onClick={() => reset()}>Coba Lagi</Button>
    </div>
  );
}