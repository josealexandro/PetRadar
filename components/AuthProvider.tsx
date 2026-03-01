"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User } from "firebase/auth";
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInAnonymously,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  linkWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

/** Mensagem amigável para erros de auth (e-mail/senha). */
export function getAuthErrorMessage(code: string): string {
  const messages: Record<string, string> = {
    "auth/email-already-in-use": "Este e-mail já está em uso. Tente entrar ou use outro e-mail.",
    "auth/invalid-email": "E-mail inválido.",
    "auth/operation-not-allowed": "Login por e-mail não está habilitado no app.",
    "auth/weak-password": "Use uma senha com pelo menos 6 caracteres.",
    "auth/user-disabled": "Esta conta foi desativada.",
    "auth/user-not-found": "E-mail ou senha incorretos.",
    "auth/wrong-password": "E-mail ou senha incorretos.",
    "auth/invalid-credential": "E-mail ou senha incorretos.",
    "auth/credential-already-in-use": "Este e-mail já está vinculado a outra conta.",
    "auth/too-many-requests": "Muitas tentativas. Tente de novo mais tarde.",
  };
  return messages[code] ?? "Ocorreu um erro. Tente novamente.";
}

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInAnonymously: () => Promise<void>;
  /** Cria sessão anônima só quando necessário (ex.: ao postar pet, ajudar, marcar resolvido). Não cria usuário fantasma ao abrir o app. */
  ensureAnonymousUser: () => Promise<User>;
  /** Criar conta com e-mail/senha. Se já estiver anônimo, vincula e mantém o histórico. */
  createAccountWithEmail: (email: string, password: string) => Promise<void>;
  /** Entrar com e-mail e senha. */
  signInWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u ?? null);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  }, []);

  const signInAnonymouslyGuest = useCallback(async () => {
    await signInAnonymously(auth);
  }, []);

  const ensureAnonymousUser = useCallback(async (): Promise<User> => {
    if (auth.currentUser) return auth.currentUser;
    await signInAnonymously(auth);
    const u = auth.currentUser;
    if (!u) throw new Error("Falha ao criar sessão");
    return u;
  }, []);

  const createAccountWithEmail = useCallback(
    async (email: string, password: string) => {
      const currentUser = auth.currentUser;
      if (currentUser?.isAnonymous) {
        const credential = EmailAuthProvider.credential(email, password);
        await linkWithCredential(currentUser, credential);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    },
    []
  );

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const logout = useCallback(async () => {
    await firebaseSignOut(auth);
  }, []);

  const value: AuthContextValue = {
    user,
    loading,
    signInWithGoogle,
    signInAnonymously: signInAnonymouslyGuest,
    ensureAnonymousUser,
    createAccountWithEmail,
    signInWithEmail,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (ctx == null) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return ctx;
}
