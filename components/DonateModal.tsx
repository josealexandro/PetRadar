"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

type DonateModalProps = {
  onClose: () => void;
};

export function DonateModal({ onClose }: DonateModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const modalContent = (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="donate-modal-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-800"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="donate-modal-title" className="text-center text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Clique e apoie a causa
        </h2>
        <p className="mt-1 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Escaneie o QR Code para contribuir
        </p>
        <div className="mt-4 flex justify-center rounded-xl bg-zinc-50 p-4 dark:bg-zinc-700/50">
          <Image
            src="/qrcode-apoie-causa.png"
            alt="QR Code para doação"
            width={160}
            height={160}
            className="rounded-lg"
          />
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-xl border border-zinc-200 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700"
        >
          Fechar
        </button>
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(modalContent, document.body);
}
