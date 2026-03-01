"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import type { Animal, AnimalNeed } from "@/types";
import { formatDistance } from "@/lib/geo";
import { registerHelp } from "@/lib/helps";
import { NEEDS_LABELS } from "@/lib/constants";
import { useAuth } from "@/components/AuthProvider";
import { ReportModal } from "@/components/ReportModal";

type AnimalCardProps = {
  animal: Animal;
  distanceKm: number | null;
  hasHelped?: boolean;
  onHelped?: () => void;
  onReportSubmitted?: (hidden: boolean) => void;
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
}: AnimalCardProps) {
  const { user } = useAuth();
  const [helping, setHelping] = useState(false);
  const [justHelped, setJustHelped] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

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
    function handleClickOutside(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleQueroAjudar = async () => {
    if (!user || helping || showAjudado) return;
    setHelping(true);
    const { success, alreadyHelped } = await registerHelp(user.uid, animal.id);
    setHelping(false);
    if (success && !alreadyHelped) {
      setJustHelped(true);
      onHelped?.();
    }
    if (whatsappLink) window.open(whatsappLink, "_blank");
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
              disabled={helping || !user}
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
          <button
            type="button"
            onClick={() => setReportModalOpen(true)}
            className="inline-flex items-center rounded-lg bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50"
          >
            Reportar
          </button>
          <div className="relative ml-auto" ref={moreRef}>
            <button
              type="button"
              onClick={() => setMoreOpen((o) => !o)}
              className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-700 dark:hover:text-zinc-300"
              aria-label="Mais opções"
            >
              ⋯
            </button>
            {moreOpen && (
              <div className="absolute right-0 top-full z-10 mt-1 w-40 rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    setReportModalOpen(true);
                    setMoreOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-700"
                >
                  Reportar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {reportModalOpen && (
        <ReportModal
          animalId={animal.id}
          onClose={() => setReportModalOpen(false)}
          onSubmitted={(hidden) => onReportSubmitted?.(hidden)}
        />
      )}
    </article>
  );
}
