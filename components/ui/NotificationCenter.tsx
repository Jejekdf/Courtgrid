"use client";

import { useState } from "react";
import { Bell, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  time: string;
  link: string;
};

interface NotificationCenterProps {
  notifications: NotificationItem[];
}

export default function NotificationCenter({ notifications }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        className="p-2 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 rounded-lg transition-colors relative cursor-pointer"
        aria-label="Notifikasi"
      >
        <Bell className="size-4" />
        {notifications.length > 0 && (
          <span className="absolute top-1.5 right-1.5 size-2 bg-emerald-500 rounded-full ring-2 ring-white animate-pulse" />
        )}
      </PopoverTrigger>

      <PopoverContent side="bottom" align="end" sideOffset={8} className="w-72 sm:w-80 p-3 space-y-2">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
          <span className="font-bold text-zinc-950">Notifikasi</span>
          <span className="text-[0.6875rem] font-mono bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded font-semibold">
            {notifications.length} BARU
          </span>
        </div>

        <div className="space-y-1.5 max-h-64 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="text-center py-6 text-zinc-400">Tidak ada notifikasi baru.</div>
          ) : (
            notifications.map((notif) => (
              <Link
                key={notif.id}
                href={notif.link}
                onClick={() => setIsOpen(false)}
                className="block p-2.5 hover:bg-zinc-50 rounded-lg border border-zinc-100 transition-colors"
              >
                <div className="flex items-start gap-2">
                  <AlertCircle className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-zinc-950">{notif.title}</div>
                    <div className="text-sm text-zinc-600 mt-0.5">{notif.message}</div>
                    <div className="text-[0.6875rem] text-zinc-400 font-mono mt-1">
                      {new Date(notif.time).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" })} WIB
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
