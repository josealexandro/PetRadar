import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4">
      <div className="max-w-md rounded-2xl border border-zinc-200 bg-zinc-50 p-8 text-center dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="mb-6 text-6xl" aria-hidden>
          📡
        </div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Você está offline
        </h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400">
          Não foi possível carregar esta página. Verifique sua conexão e tente
          novamente.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
