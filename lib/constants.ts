import type { AnimalNeed, AnimalType } from "@/types";

export const NEEDS_LABELS: Record<AnimalNeed, string> = {
  food: "Comida",
  water: "Água",
  vet: "Veterinário",
  adoption: "Adoção",
  temporary_home: "Lar temporário",
};

export const TYPE_OPTIONS: { value: AnimalType | "all"; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "dog", label: "Cachorro" },
  { value: "cat", label: "Gato" },
];

export const SORT_OPTIONS = [
  { value: "recent", label: "Mais recentes" },
  { value: "distance", label: "Mais perto" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];
