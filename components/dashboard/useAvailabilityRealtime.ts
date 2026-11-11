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
 * Subscribes to Supabase Realtime changes on `public.slot_change`, which stores only
 * court_id and date_key without PII. When a reservation changes, the DB trigger writes
 * a signal row and this hook invalidates the TanStack Query availability cache.
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