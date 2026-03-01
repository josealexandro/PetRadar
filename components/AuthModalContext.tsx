"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { AuthModal } from "@/components/AuthModal";

type AuthModalMode = "signup" | "signin";

type AuthModalContextValue = {
  openAuthModal: (mode: AuthModalMode) => void;
};

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<AuthModalMode | null>(null);
  const openAuthModal = useCallback((m: AuthModalMode) => setMode(m), []);
  const closeModal = useCallback(() => setMode(null), []);

  return (
    <AuthModalContext.Provider value={{ openAuthModal }}>
      {children}
      {mode && (
        <AuthModal
          initialMode={mode}
          onClose={closeModal}
          onSuccess={closeModal}
        />
      )}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal(): AuthModalContextValue {
  const ctx = useContext(AuthModalContext);
  if (ctx == null) {
    throw new Error("useAuthModal deve ser usado dentro de AuthModalProvider");
  }
  return ctx;
}
