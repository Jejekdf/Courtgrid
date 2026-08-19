"use client";

import { motion } from "motion/react";
import { Check } from "lucide-react";

export interface PasswordCriterion {
  label: string;
  valid: boolean;
}

export interface PasswordStrength {
  label: string;
  percent: number;
  color: string;
  textColor: string;
}

interface PasswordStrengthIndicatorProps {
  strengthLabel: string;
  strength: PasswordStrength;
  criteria: PasswordCriterion[];
}

export function PasswordStrengthIndicator({
  strengthLabel,
  strength,
  criteria,
}: PasswordStrengthIndicatorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-2 p-3 rounded-lg bg-zinc-50 border border-zinc-200/60"
    >
      <div className="flex items-center justify-between text-sm font-mono">
        <span className="text-zinc-500">{strengthLabel}</span>
        <span className={`font-bold ${strength.textColor}`}>
          {strength.label}
        </span>
      </div>

      {/* Strength Bar */}
      <div className="h-1.5 w-full bg-zinc-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-[width] duration-300 rounded-full ${strength.color}`}
          style={{ width: `${strength.percent}%` }}
        />
      </div>

      {/* Criteria Checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 text-sm font-mono">
        {criteria.map((c, i) => (
          <div
            key={i}
            className={`flex items-center space-x-1.5 transition-colors ${
              c.valid ? "text-emerald-600 font-bold" : "text-zinc-400"
            }`}
          >
            {c.valid ? (
              <Check className="h-3 w-3 shrink-0 text-emerald-600" />
            ) : (
              <div className="h-1.5 w-1.5 rounded-full bg-zinc-300 mx-0.5 shrink-0" />
            )}
            <span>{c.label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
