  "use client";

import { useState } from "react";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { MotionConfig } from "framer-motion";
import { makeQueryClient } from "@/lib/react-query";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => makeQueryClient());

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <MotionConfig reducedMotion="user">
        <QueryClientProvider client={queryClient}>
          <SessionProvider>{children}</SessionProvider>
          {process.env.NODE_ENV === "development" && <ReactQueryDevtools />}
        </QueryClientProvider>
      </MotionConfig>
    </ThemeProvider>
  );
}
