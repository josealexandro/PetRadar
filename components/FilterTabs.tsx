"use client";

export type FilterTab = "all" | "dog" | "cat" | "urgent" | "adoption";

const TABS: { value: FilterTab; label: string; icon: string }[] = [
  { value: "all", label: "Todos", icon: "" },
  { value: "dog", label: "Cachorros", icon: "🐕" },
  { value: "cat", label: "Gatos", icon: "🐈" },
  { value: "urgent", label: "Urgente", icon: "❤️" },
  { value: "adoption", label: "Adoção", icon: "🏠" },
];

type FilterTabsProps = {
  value: FilterTab;
  onChange: (v: FilterTab) => void;
  resultCount: number;
};

export function FilterTabs({ value, onChange, resultCount }: FilterTabsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {TABS.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
            value === tab.value
              ? "bg-blue-600 text-white shadow-sm dark:bg-blue-500"
              : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600"
          }`}
        >
          {tab.icon && <span aria-hidden>{tab.icon}</span>}
          {tab.label}
        </button>
      ))}
      <span className="ml-2 text-sm text-zinc-500 dark:text-zinc-400">
        {resultCount} {resultCount === 1 ? "resultado" : "resultados"}
      </span>
    </div>
  );
}
