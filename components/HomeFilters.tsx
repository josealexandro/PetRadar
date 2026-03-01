"use client";

import { useState } from "react";
import {
  NEEDS_LABELS,
  TYPE_OPTIONS,
  SORT_OPTIONS,
  type SortValue,
} from "@/lib/constants";
import type { AnimalNeed } from "@/types";

type HomeFiltersProps = {
  typeFilter: "all" | "dog" | "cat";
  onTypeChange: (v: "all" | "dog" | "cat") => void;
  needsFilter: AnimalNeed[];
  onNeedsChange: (needs: AnimalNeed[]) => void;
  citySearch: string;
  onCityChange: (v: string) => void;
  sortBy: SortValue;
  onSortChange: (v: SortValue) => void;
  resultCount: number;
};

const NEEDS_LIST: AnimalNeed[] = [
  "food",
  "water",
  "vet",
  "adoption",
  "temporary_home",
];

export function HomeFilters({
  typeFilter,
  onTypeChange,
  needsFilter,
  onNeedsChange,
  citySearch,
  onCityChange,
  sortBy,
  onSortChange,
  resultCount,
}: HomeFiltersProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleNeed = (need: AnimalNeed) => {
    if (needsFilter.includes(need)) {
      onNeedsChange(needsFilter.filter((n) => n !== need));
    } else {
      onNeedsChange([...needsFilter, need]);
    }
  };

  const FiltersContent = () => (
    <>
      {/* Tipo */}
      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Tipo
        </label>
        <div className="flex flex-wrap gap-2">
          {TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onTypeChange(opt.value as "all" | "dog" | "cat")}
              className={`rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                typeFilter === opt.value
                  ? "bg-emerald-600 text-white shadow-sm dark:bg-emerald-500"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Necessidades */}
      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Necessidades
        </label>
        <div className="flex flex-wrap gap-2">
          {NEEDS_LIST.map((need) => (
            <button
              key={need}
              type="button"
              onClick={() => toggleNeed(need)}
              className={`rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                needsFilter.includes(need)
                  ? "bg-amber-500/20 text-amber-800 ring-1 ring-amber-500/40 dark:text-amber-200 dark:ring-amber-400/30"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-600"
              }`}
            >
              {NEEDS_LABELS[need]}
            </button>
          ))}
        </div>
      </div>

      {/* Cidade */}
      <div>
        <label
          htmlFor="filter-city"
          className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
        >
          Cidade
        </label>
        <input
          id="filter-city"
          type="text"
          value={citySearch}
          onChange={(e) => onCityChange(e.target.value)}
          placeholder="Buscar por cidade..."
          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
        />
      </div>

      {/* Ordenação */}
      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Ordenar
        </label>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortValue)}
          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </>
  );

  return (
    <div className="space-y-4">
      {/* Mobile: botão para abrir painel de filtros */}
      <div className="flex items-center justify-between gap-3 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen((o) => !o)}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white py-3 text-sm font-medium text-zinc-700 shadow-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
        >
          <span className="text-lg" aria-hidden>⚙</span>
          {mobileOpen ? "Fechar filtros" : "Filtros e ordenação"}
        </button>
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          {resultCount} {resultCount === 1 ? "resultado" : "resultados"}
        </span>
      </div>

      {/* Mobile: painel colapsável */}
      {mobileOpen && (
        <div className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800/80 lg:hidden">
          <FiltersContent />
        </div>
      )}

      {/* Desktop: filtros sempre visíveis */}
      <div className="hidden space-y-4 lg:block">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Filtros
          </span>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            {resultCount} {resultCount === 1 ? "resultado" : "resultados"}
          </span>
        </div>
        <FiltersContent />
      </div>
    </div>
  );
}
