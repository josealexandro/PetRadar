import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

if (typeof window !== "undefined" && !firebaseConfig.apiKey) {
  console.error(
    "[Firebase] API Key não configurada. Crie o arquivo .env.local com as variáveis NEXT_PUBLIC_FIREBASE_* (veja .env.example)."
  );
}

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

// No browser: Firestore com cache local (IndexedDB) e múltiplas abas.
// No SSR (Node): Firestore padrão, sem persistência.
export const db =
  typeof window !== "undefined"
    ? initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
        }),
      })
    : getFirestore(app);

export const storage = getStorage(app);
