import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
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
