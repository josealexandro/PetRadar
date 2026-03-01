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
    <div className="relative overflow-hidden rounded-2xl bg-zinc-800 px-4 py-4 text-white dark:bg-zinc-900">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(34,197,94,0.15),transparent)]" />
      <div className="relative flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-xl">
              🏆
            </span>
            <div>
              <p className="text-sm font-medium text-zinc-300">Você ajudou</p>
              <p className="text-2xl font-bold tabular-nums">
                {animalsHelpedCount} {animalsHelpedCount === 1 ? "animal" : "animais"}
              </p>
            </div>
          </div>
          <div className="rounded-xl bg-amber-500/20 px-3 py-1.5">
            <span className="text-sm font-semibold text-amber-200">{badge}</span>
          </div>
        </div>
        {user.isAnonymous && onCreateAccountClick && (
          <p className="text-xs text-zinc-400">
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
