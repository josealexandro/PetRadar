"use client";

import { useAuth } from "@/components/AuthProvider";
import { useUserStats } from "@/hooks/useUserStats";

type UserStatsCardProps = {
  onCreateAccountClick?: () => void;
};

export function UserStatsCard({ onCreateAccountClick }: UserStatsCardProps) {
  const { user } = useAuth();
  const { animalsHelpedCount, badge } = useUserStats(user?.uid ?? null);

  if (!user) return null;

  return (
    <div className="relative overflow-hidden rounded-xl bg-[#1b1b1b] px-4 py-3 text-white shadow-sm">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(34,197,94,0.12),transparent)]" />
      <div className="relative flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-lg">
              🏆
            </span>
            <div className="min-w-0">
              <p className="text-xs font-medium text-zinc-300">Você ajudou</p>
              <p className="text-xl font-bold tabular-nums leading-tight">
                {animalsHelpedCount} {animalsHelpedCount === 1 ? "animal" : "animais"}
              </p>
            </div>
          </div>
          <div className="shrink-0 rounded-lg bg-amber-500/20 px-2.5 py-1">
            <span className="text-xs font-semibold text-amber-200">{badge}</span>
          </div>
        </div>
        {user.isAnonymous && onCreateAccountClick && (
          <p className="text-xs leading-snug text-zinc-400">
            <button
              type="button"
              onClick={onCreateAccountClick}
              className="font-medium text-emerald-300 underline hover:text-emerald-200"
            >
              Criar conta
            </button>{" "}
            para manter seu histórico em qualquer dispositivo.
          </p>
        )}
      </div>
    </div>
  );
}
