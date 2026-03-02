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
// storageBucket: use .firebasestorage.app (bucket que existe). .appspot.com não existe neste projeto e gera 404.
const storageBucket =
  process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
  (projectId ? `${projectId}.firebasestorage.app` : undefined);

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

// Em produção, .env.local não existe: configure as variáveis no painel do host (Vercel, Netlify, etc.). Veja DEPLOY.md.
const isProd = typeof window !== "undefined" && !/localhost|127\.0\.0\.1/.test(window.location?.host ?? "");
if (typeof window !== "undefined" && !hasConfig) {
  const msg = isProd
    ? "[Firebase] Em produção as variáveis NEXT_PUBLIC_FIREBASE_* precisam ser configuradas no painel do provedor de hospedagem (não use .env.local). Veja DEPLOY.md."
    : "[Firebase] API Key não configurada. Crie o arquivo .env.local com as variáveis NEXT_PUBLIC_FIREBASE_* (veja .env.example).";
  console.error(msg);
}

const app = initializeApp(configToUse);

/** true se as variáveis NEXT_PUBLIC_FIREBASE_* estão definidas (em produção, configure no painel do host — DEPLOY.md). */
export const isFirebaseConfigured = hasConfig;

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
