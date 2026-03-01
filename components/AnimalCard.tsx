"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import type { Animal } from "@/types";
import { formatDistance } from "@/lib/geo";
import { registerHelp } from "@/lib/helps";
import { markAnimalResolved, markAnimalReopen } from "@/lib/animals";
import { NEEDS_LABELS } from "@/lib/constants";
import { useAuth } from "@/components/AuthProvider";
import { ReportModal } from "@/components/ReportModal";

type AnimalCardProps = {
  animal: Animal;
  distanceKm: number | null;
  hasHelped?: boolean;
  onHelped?: () => void;
  onReportSubmitted?: (hidden: boolean) => void;
  onResolved?: () => void;
};

function truncate(str: string, max: number) {
  if (str.length <= max) return str;
  return str.slice(0, max).trim() + "…";
}

export function AnimalCard({
  animal,
  distanceKm,
  hasHelped = false,
  onHelped,
  onReportSubmitted,
  onResolved,
}: AnimalCardProps) {
  const { user, ensureAnonymousUser } = useAuth();
  const [helping, setHelping] = useState(false);
  const [justHelped, setJustHelped] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [justResolved, setJustResolved] = useState(false);
  const [reopening, setReopening] = useState(false);
  const resolveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [resolveConfirmOpen, setResolveConfirmOpen] = useState(false);

  const photo = animal.thumbnails?.[0] ?? animal.photos[0];
  const whatsappNumber = animal.whatsapp?.replace(/\D/g, "");
  const whatsappLink =
    whatsappNumber &&
    `https://wa.me/55${whatsappNumber}?text=Olá! Vi o animal que você cadastrou no PetRadar e quero ajudar.`;

  const showAjudado = hasHelped || justHelped;
  const isUrgent = animal.needs.includes("vet");
  const needsText = animal.needs.length
    ? "Precisa de: " + animal.needs.map((n) => NEEDS_LABELS[n]).join(", ")
    : "";
  const title = truncate(animal.description, 45);

  useEffect(() => {
    return () => {
      if (resolveTimeoutRef.current) clearTimeout(resolveTimeoutRef.current);
    };
  }, []);

  const handleQueroAjudar = async () => {
    if (helping || showAjudado) return;
    let uid = user?.uid;
    if (!uid) {
      try {
        const u = await ensureAnonymousUser();
        uid = u.uid;
      } catch {
        return;
      }
    }
    setHelping(true);
    const { success, alreadyHelped } = await registerHelp(uid, animal.id);
    setHelping(false);
    if (success && !alreadyHelped) {
      setJustHelped(true);
      onHelped?.();
    }
    if (whatsappLink) window.open(whatsappLink, "_blank");
  };

  const DESFAZER_SECONDS = 5;

  const handleMarcarResolvidoClick = () => {
    if (resolving) return;
    setResolveConfirmOpen(true);
  };

  const handleResolveConfirm = async () => {
    if (resolving) return;
    setResolveConfirmOpen(false);
    let uid = user?.uid;
    if (!uid) {
      try {
        const u = await ensureAnonymousUser();
        uid = u.uid;
      } catch {
        return;
      }
    }
    setResolving(true);
    const ok = await markAnimalResolved(animal.id, uid);
    setResolving(false);
    if (!ok) return;
    setJustResolved(true);
    resolveTimeoutRef.current = setTimeout(() => {
      resolveTimeoutRef.current = null;
      setJustResolved(false);
      onResolved?.();
    }, DESFAZER_SECONDS * 1000);
  };

  const handleDesfazerResolvido = async () => {
    if (reopening || !justResolved) return;
    const uid = user?.uid;
    if (!uid) return;
    if (resolveTimeoutRef.current) {
      clearTimeout(resolveTimeoutRef.current);
      resolveTimeoutRef.current = null;
    }
    setReopening(true);
    const ok = await markAnimalReopen(animal.id);
    setReopening(false);
    setJustResolved(false);
    if (!ok) setJustResolved(true);
  };

  return (
    <article className="flex gap-3 rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-700 dark:bg-zinc-800/95">
      {/* Imagem + badge URGENTE */}
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-700">
        {photo ? (
          <Image
            src={photo}
            alt=""
            fill
            className="object-cover"
            sizes="96px"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-2xl text-zinc-400">
            {animal.type === "dog" ? "🐕" : "🐈"}
          </div>
        )}
        {isUrgent && (
          <span className="absolute left-1 top-1 rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
            Urgente
          </span>
        )}
      </div>

      {/* Conteúdo */}
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
          {title}
        </h3>
        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
          <span>{animal.city}</span>
          {distanceKm != null && (
            <>
              <span>·</span>
              <span className="text-emerald-600 dark:text-emerald-400">
                {formatDistance(distanceKm)}
              </span>
              <span aria-hidden>✓</span>
            </>
          )}
        </p>
        {needsText && (
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">
            {needsText}
          </p>
        )}

        {/* Estado "acabou de marcar resolvido" — 5s para desfazer */}
        {justResolved && (
          <div className="mt-2 flex items-center justify-between gap-2 rounded-lg bg-emerald-50 py-2 pl-3 pr-2 dark:bg-emerald-900/30">
            <span className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
              Resolvido. Desfazer?
            </span>
            <button
              type="button"
              onClick={handleDesfazerResolvido}
              disabled={reopening}
              className="shrink-0 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 dark:bg-emerald-500 dark:hover:bg-emerald-600"
            >
              {reopening ? "Abrindo…" : "Desfazer"}
            </button>
          </div>
        )}

        {/* Botões */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {showAjudado ? (
            <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-100 px-3 py-1.5 text-xs font-medium text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
              ✓ Ajudado
            </span>
          ) : whatsappLink ? (
            <button
              type="button"
              onClick={handleQueroAjudar}
              disabled={helping}
              className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <span aria-hidden>❤️</span>
              Quero Ajudar
            </button>
          ) : (
            <span className="rounded-lg bg-zinc-100 px-3 py-1.5 text-xs text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400">
              Quero Ajudar
            </span>
          )}
          {animal.whatsapp && (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
            >
              WhatsApp
            </a>
          )}
          {!justResolved && (
            <button
              type="button"
              onClick={handleMarcarResolvidoClick}
              disabled={resolving}
              className="inline-flex items-center gap-1 rounded-lg bg-emerald-100 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-200 disabled:opacity-50 dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-900/50"
            >
              <span aria-hidden>✓</span>
              Marcar como resolvido
            </button>
          )}
          <button
            type="button"
            onClick={() => setReportModalOpen(true)}
            className="inline-flex items-center rounded-lg bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50"
          >
            Reportar
          </button>
        </div>
      </div>

      {reportModalOpen && (
        <ReportModal
          animalId={animal.id}
          onClose={() => setReportModalOpen(false)}
          onSubmitted={(hidden) => onReportSubmitted?.(hidden)}
        />
      )}

      {/* Modal de confirmação: marcar como resolvido (portal no body para não ser cortado) */}
      {resolveConfirmOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="resolve-confirm-title"
          >
            <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
              <div className="flex flex-col items-center text-center">
                <span
                  className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-3xl dark:bg-emerald-900/40"
                  aria-hidden
                >
                  ✓
                </span>
                <h3
                  id="resolve-confirm-title"
                  className="text-lg font-bold text-zinc-900 dark:text-zinc-50"
                >
                  Marcar como resolvido?
                </h3>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  O animal sairá da lista. Quem postou pode ter sido anônimo e não voltar ao app. Você pode desfazer nos próximos segundos.
                </p>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setResolveConfirmOpen(false)}
                  className="flex-1 rounded-xl border border-zinc-300 bg-white py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleResolveConfirm}
                  disabled={resolving}
                  className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 dark:bg-emerald-500 dark:hover:bg-emerald-600"
                >
                  {resolving ? "Salvando…" : "Sim, marcar"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </article>
  );
}
