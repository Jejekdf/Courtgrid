"use client";

import { motion } from "motion/react";
import { CheckCircle2, XCircle } from "lucide-react";

export interface RequirementItem {
  label: string;
  met: boolean;
}

interface PasswordRequirementsProps {
  requirements: RequirementItem[];
}

export function PasswordRequirements({ requirements }: PasswordRequirementsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-1.5 mt-2 bg-zinc-50 p-3 rounded-lg border border-zinc-200/60"
    >
      {requirements.map((req) => (
        <div
          key={req.label}
          className={`flex items-center gap-2 text-sm font-mono transition-colors duration-200 ${
            req.met ? "text-emerald-600 font-semibold" : "text-zinc-400"
          }`}
        >
          {req.met ? (
            <CheckCircle2 className="size-3.5 shrink-0" />
          ) : (
            <XCircle className="size-3.5 shrink-0" />
          )}
          <span>{req.label}</span>
        </div>
      ))}
    </motion.div>
  );
}
