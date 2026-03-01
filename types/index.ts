import type { Timestamp } from "firebase/firestore";

// ——— Animals ———

export type AnimalType = "dog" | "cat";

export type AnimalNeed =
  | "food"
  | "water"
  | "vet"
  | "adoption"
  | "temporary_home";

export type AnimalStatus = "open" | "resolved" | "hidden";

export interface Animal {
  id: string;
  photos: string[];
  /** URLs de thumbnails (~300px, ~40KB) para lista/mapa. Opcional (legado). */
  thumbnails?: string[];
  description: string;
  type: AnimalType;
  needs: AnimalNeed[];
  lat: number;
  lng: number;
  city: string;
  createdBy: string;
  whatsapp?: string;
  status: AnimalStatus;
  reportCount?: number;
  createdAt: Timestamp;
}

/** Dados para criar um animal (sem id e sem createdAt; id = doc id, createdAt = serverTimestamp). */
export interface AnimalInput {
  photos: string[];
  thumbnails?: string[];
  description: string;
  type: AnimalType;
  needs: AnimalNeed[];
  lat: number;
  lng: number;
  city: string;
  createdBy: string;
  whatsapp?: string;
  status: AnimalStatus;
}

// ——— Reports ———

export interface Report {
  id: string;
  animalId: string;
  reason: string;
  reportedBy: string;
  createdAt: Timestamp;
}

/** Dados para criar um report (sem id e sem createdAt). */
export interface ReportInput {
  animalId: string;
  reason: string;
  reportedBy: string;
}

/** Número de denúncias a partir do qual o animal é ocultado. */
export const REPORT_HIDE_THRESHOLD = 5;

// ——— Helps ———

export interface Help {
  id: string;
  userId: string;
  animalId: string;
  createdAt: Timestamp;
}

export interface HelpInput {
  userId: string;
  animalId: string;
}

// ——— User profile (contador + badge) ———

export interface UserProfile {
  animalsHelpedCount: number;
}

/** Badge por faixa de animais ajudados. */
export const BADGE_TIERS: { minCount: number; label: string }[] = [
  { minCount: 0, label: "Novato" },
  { minCount: 1, label: "Protetor iniciante" },
  { minCount: 5, label: "Protetor" },
  { minCount: 10, label: "Herói" },
  { minCount: 25, label: "Super Herói" },
  { minCount: 50, label: "Lenda" },
];

export function getBadgeForCount(count: number): string {
  let badge = BADGE_TIERS[0].label;
  for (const tier of BADGE_TIERS) {
    if (count >= tier.minCount) badge = tier.label;
  }
  return badge;
}
