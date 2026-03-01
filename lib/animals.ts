import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  deleteField,
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Animal } from "@/types";

const ANIMALS_COLLECTION = "animals";

function docToAnimal(docSnap: QueryDocumentSnapshot): Animal {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    photos: data.photos ?? [],
    thumbnails: data.thumbnails,
    description: data.description ?? "",
    type: data.type === "cat" ? "cat" : "dog",
    needs: data.needs ?? [],
    lat: data.lat ?? 0,
    lng: data.lng ?? 0,
    city: data.city ?? "",
    createdBy: data.createdBy ?? "",
    whatsapp: data.whatsapp,
    status: data.status ?? "open",
    reportCount: data.reportCount,
    resolvedBy: data.resolvedBy ?? null,
    resolvedAt: data.resolvedAt ?? null,
    createdAt: data.createdAt,
  };
}

/** Tamanho padrão da página para evitar muitas leituras de uma vez. */
export const ANIMALS_PAGE_SIZE = 20;

/**
 * Busca a primeira página de animais (status open, ordenado por createdAt desc).
 * Limita a ANIMALS_PAGE_SIZE para reduzir leituras e tempo de resposta.
 */
export async function fetchAnimalsFirstPage(): Promise<{
  list: Animal[];
  lastDoc: DocumentSnapshot | null;
  hasMore: boolean;
}> {
  const q = query(
    collection(db, ANIMALS_COLLECTION),
    where("status", "==", "open"),
    orderBy("createdAt", "desc"),
    limit(ANIMALS_PAGE_SIZE)
  );
  const snap = await getDocs(q);
  const list = snap.docs.map(docToAnimal);
  const lastDoc = snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null;
  return {
    list,
    lastDoc,
    hasMore: snap.docs.length === ANIMALS_PAGE_SIZE,
  };
}

/**
 * Busca a próxima página após lastDoc (paginação cursor).
 * Só chama quando o usuário pede mais; evita leituras desnecessárias.
 */
export async function fetchAnimalsNextPage(
  lastDoc: DocumentSnapshot
): Promise<{
  list: Animal[];
  lastDoc: DocumentSnapshot | null;
  hasMore: boolean;
}> {
  const q = query(
    collection(db, ANIMALS_COLLECTION),
    where("status", "==", "open"),
    orderBy("createdAt", "desc"),
    startAfter(lastDoc),
    limit(ANIMALS_PAGE_SIZE)
  );
  const snap = await getDocs(q);
  const list = snap.docs.map(docToAnimal);
  const newLastDoc =
    snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null;
  return {
    list,
    lastDoc: newLastDoc,
    hasMore: snap.docs.length === ANIMALS_PAGE_SIZE,
  };
}

/**
 * Marca um animal como resolvido (qualquer usuário autenticado pode marcar).
 * Grava quem resolveu e quando; só esse usuário pode reabrir depois.
 */
export async function markAnimalResolved(
  animalId: string,
  userId: string
): Promise<boolean> {
  try {
    const ref = doc(db, ANIMALS_COLLECTION, animalId);
    await updateDoc(ref, {
      status: "resolved",
      resolvedBy: userId,
      resolvedAt: serverTimestamp(),
    });
    return true;
  } catch (e) {
    console.error("markAnimalResolved", e);
    return false;
  }
}

/**
 * Reabre um animal que você marcou como resolvido (apenas resolvedBy pode reabrir).
 */
export async function markAnimalReopen(animalId: string): Promise<boolean> {
  try {
    const ref = doc(db, ANIMALS_COLLECTION, animalId);
    await updateDoc(ref, {
      status: "open",
      resolvedBy: deleteField(),
      resolvedAt: deleteField(),
    });
    return true;
  } catch (e) {
    console.error("markAnimalReopen", e);
    return false;
  }
}
