"use client";

import { useState, useEffect, useRef } from "react";
import { submitReport } from "@/lib/reports";
import { useAuth } from "@/components/AuthProvider";

type ReportModalProps = {
  animalId: string;
  onClose: () => void;
  onSubmitted?: (hidden: boolean) => void;
};

export function ReportModal({
  animalId,
  onClose,
  onSubmitted,
}: ReportModalProps) {
  const { user } = useAuth();
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("É preciso estar logado para reportar.");
      return;
    }
    if (!reason.trim()) {
      setError("Descreva o motivo da denúncia.");
      return;
    }
    setError(null);
    setLoading(true);
    const { success, hidden } = await submitReport(animalId, reason.trim(), user.uid);
    setLoading(false);
    if (success) {
      onSubmitted?.(hidden);
      onClose();
    } else {
      setError("Não foi possível enviar. Tente novamente.");
    }
  };

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-800"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="report-modal-title" className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Reportar publicação
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Sua denúncia será analisada. Muitas denúncias podem ocultar a publicação.
        </p>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="report-reason"
              className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Motivo *
            </label>
            <textarea
              id="report-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
              placeholder="Descreva o motivo da denúncia..."
              disabled={loading}
            />
          </div>
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {loading ? "Enviando..." : "Enviar denúncia"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
