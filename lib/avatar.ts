import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

const AVATAR_MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB
const AVATAR_PATH = (userId: string) => `users/${userId}/avatar`;

/**
 * Faz upload da foto de perfil e retorna a URL pública.
 * Redimensiona no client se passar de 2 MB (opcional, mantém simples por enquanto).
 */
export async function uploadAvatar(
  userId: string,
  file: File
): Promise<string> {
  if (file.size > AVATAR_MAX_SIZE_BYTES) {
    throw new Error("A imagem deve ter no máximo 2 MB. Escolha uma foto menor.");
  }
  const storageRef = ref(storage, AVATAR_PATH(userId));
  await uploadBytes(storageRef, file, { contentType: file.type });
  return getDownloadURL(storageRef);
}
