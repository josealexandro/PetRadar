import {
  collection,
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
  increment,
  getDocs,
  query,
  where,
  limit,
} from "firebase/firestore";
import { db } from "./firebase";
import { getBadgeForCount } from "@/types";

const HELPS_COLLECTION = "helps";
const USERS_COLLECTION = "users";

/** Id do documento de ajuda: um usuário só pode registrar uma ajuda por animal. */
function helpDocId(userId: string, animalId: string): string {
  return `${userId}_${animalId}`;
}

/**
 * Registra que o usuário ajudou o animal (uma vez por animal).
 * Cria doc em helps e incrementa animalsHelpedCount no perfil do usuário.
 */
export async function registerHelp(
  userId: string,
  animalId: string
): Promise<{ success: boolean; alreadyHelped?: boolean }> {
  const helpRef = doc(db, HELPS_COLLECTION, helpDocId(userId, animalId));

  try {
    const result = await runTransaction(db, async (tx) => {
      const helpSnap = await tx.get(helpRef);
      if (helpSnap.exists()) {
        return { success: false, alreadyHelped: true };
      }
      tx.set(helpRef, {
        userId,
        animalId,
        createdAt: serverTimestamp(),
      });
      const userRef = doc(db, USERS_COLLECTION, userId);
      const userSnap = await tx.get(userRef);
      if (userSnap.exists()) {
        tx.update(userRef, { animalsHelpedCount: increment(1) });
      } else {
        tx.set(userRef, { animalsHelpedCount: 1 });
      }
      return { success: true };
    });
    return result;
  } catch (e) {
    console.error("registerHelp", e);
    return { success: false };
  }
}

/**
 * Verifica se o usuário já registrou ajuda para este animal.
 */
export async function hasUserHelped(
  userId: string,
  animalId: string
): Promise<boolean> {
  const helpRef = doc(db, HELPS_COLLECTION, helpDocId(userId, animalId));
  const snap = await getDoc(helpRef);
  return snap.exists();
}

/**
 * Retorna o perfil do usuário (contador de ajudas). Cria doc com 0 se não existir.
 */
export async function getUserProfile(
  userId: string
): Promise<{ animalsHelpedCount: number; badge: string }> {
  const userRef = doc(db, USERS_COLLECTION, userId);
  const snap = await getDoc(userRef);
  const count = snap.exists() ? (snap.data().animalsHelpedCount ?? 0) : 0;
  return { animalsHelpedCount: count, badge: getBadgeForCount(count) };
}

/** Limite de ajudas lidas por usuário (evita leituras excessivas). */
const HELPS_READ_LIMIT = 500;

/**
 * Retorna os animalIds que o usuário já ajudou (para marcar "Ajudado" nos cards).
 * Limitado a HELPS_READ_LIMIT para evitar leituras desnecessárias.
 */
export async function getHelpedAnimalIds(userId: string): Promise<Set<string>> {
  const q = query(
    collection(db, HELPS_COLLECTION),
    where("userId", "==", userId),
    limit(HELPS_READ_LIMIT)
  );
  const snap = await getDocs(q);
  const ids = new Set<string>();
  snap.forEach((d) => ids.add(d.data().animalId));
  return ids;
}
