"use client";

import { useState, useEffect } from "react";
import { SessionProvider } from "next-auth/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { MotionConfig } from "motion/react";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { makeQueryClient } from "@/lib/react-query";
import { usePathname } from "@/i18n/navigation";

function ScrollReset() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== "undefined" && !window.location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [pathname]);

  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => makeQueryClient());

  return (
    <NuqsAdapter>
      <MotionConfig reducedMotion="user">
        <QueryClientProvider client={queryClient}>
          <SessionProvider>
            <ScrollReset />
            {children}
          </SessionProvider>
          {process.env.NODE_ENV === "development" && <ReactQueryDevtools />}
        </QueryClientProvider>
      </MotionConfig>
    </NuqsAdapter>
  );
}
