"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { courtKeys } from "@/lib/query-keys";

type SlotChangeRow = {
  court_id: string;
  date_key: string;
};

/**
 * Live availability via Supabase Realtime (postgres_changes on the
 * public.slot_change signal table — PII-free: only court_id + date_key).
 *
 * Whenever a reservation for this court+date is created, updated, or deleted,
 * the DB trigger inserts a slot_change row; this hook invalidates the
 * TanStack Query availability key so the grid refetches instantly.
 *
 * NOTE: RLS is enabled on `public.slot_change` with a SELECT-only policy for
 * `anon` and `authenticated` roles (see `supabase/realtime.sql`). This allows
 * Realtime subscribers to receive change events while blocking client writes.
 */
export function useAvailabilityRealtime(courtId: string, dateStr: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!courtId || !dateStr) return;

    const supabase = createClient();

    const channel = supabase
      .channel(`availability-${courtId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "slot_change",
          filter: `court_id=eq.${courtId}`,
        },
        (payload) => {
          const row = (payload.new ?? payload.old) as SlotChangeRow | null;
          if (row?.date_key === dateStr) {
            queryClient.invalidateQueries({
              queryKey: courtKeys.availability(courtId, dateStr),
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [courtId, dateStr, queryClient]);
}