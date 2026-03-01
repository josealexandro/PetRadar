"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function ReportarContent() {
  const searchParams = useSearchParams();
  const animalId = searchParams.get("animalId");

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        Reportar
      </h1>
      {animalId ? (
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Reportar animal: <code className="rounded bg-zinc-200 px-1 dark:bg-zinc-700">{animalId}</code>
        </p>
      ) : (
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Nenhum animal informado.
        </p>
      )}
      <p className="mt-4 text-sm text-zinc-500">
        Formulário de reporte em breve.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block text-sm font-medium text-zinc-700 underline dark:text-zinc-300"
      >
        ← Voltar
      </Link>
    </div>
  );
}

export default function ReportarPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-md px-4 py-12 text-zinc-500">Carregando...</div>}>
      <ReportarContent />
    </Suspense>
  );
}
