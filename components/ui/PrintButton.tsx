"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

export default function PrintButton() {
  const handlePrint = () => {
    // Small delay to ensure any pending state updates are rendered
    setTimeout(() => {
      window.print();
    }, 100);
  };

  return (
    <Button
      variant="outline"
      onClick={handlePrint}
      leftIcon={<Printer className="w-4 h-4" />}
      className="!print:hidden"
    >
      Cetak / Download PDF
    </Button>
  );
}
