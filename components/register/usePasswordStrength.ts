import { useMemo } from "react";

export function usePasswordStrength(password: string): {
  score: 0 | 1 | 2 | 3;
  label: string;
  labelClass: string;
} {
  return useMemo(() => {
    if (!password) return { score: 0, label: "—", labelClass: "text-slate-400" };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 1) return { score: 1, label: "Lemah", labelClass: "text-rose-600" };
    if (score === 2) return { score: 2, label: "Cukup Kuat", labelClass: "text-amber-600" };
    return { score: 3, label: "Kuat", labelClass: "text-emerald-600" };
  }, [password]);
}
