import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
// storageBucket: se não estiver no .env, usa o padrão do Firebase: <projectId>.appspot.com
const storageBucket =
  process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
  (projectId ? `${projectId}.appspot.com` : undefined);

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId,
  storageBucket,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Durante o build (prerender) as variáveis podem não estar disponíveis; usa placeholder para não quebrar.
const hasConfig =
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId;
const configToUse = hasConfig
  ? firebaseConfig
  : {
      apiKey: "build-placeholder",
      authDomain: "localhost",
      projectId: "build",
      storageBucket: "build",
      messagingSenderId: "0",
      appId: "build",
    };

if (typeof window !== "undefined" && !hasConfig) {
  console.error(
    "[Firebase] API Key não configurada. Crie o arquivo .env.local com as variáveis NEXT_PUBLIC_FIREBASE_* (veja .env.example)."
  );
}

const app = initializeApp(configToUse);

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
