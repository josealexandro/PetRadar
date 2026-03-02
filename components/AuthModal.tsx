"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { updateProfile } from "firebase/auth";
import { useAuth, getAuthErrorMessage } from "@/components/AuthProvider";
import { auth } from "@/lib/firebase";
import { uploadAvatar } from "@/lib/avatar";

type Mode = "signup" | "signin";

type AuthModalProps = {
  initialMode: Mode;
  onClose: () => void;
  onSuccess?: () => void;
  /** Se true, renderiza como página (sem overlay, com link Voltar). */
  asPage?: boolean;
};

const MIN_PASSWORD_LENGTH = 6;

export function AuthModal({
  initialMode,
  onClose,
  onSuccess,
  asPage = false,
}: AuthModalProps) {
  const { user, createAccountWithEmail, signInWithEmail } = useAuth();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isAnonymous = user?.isAnonymous ?? false;

  const resetForm = useCallback(() => {
    setError(null);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setDisplayName("");
    setPhotoFile(null);
    setPhotoPreview(null);
  }, []);

  const handlePhotoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setPhotoFile(null);
      setPhotoPreview(null);
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Escolha uma imagem (JPG, PNG, etc.).");
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setError(null);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Digite seu e-mail.");
      return;
    }
    if (!password) {
      setError("Digite a senha.");
      return;
    }
    if (mode === "signup") {
      if (password.length < MIN_PASSWORD_LENGTH) {
        setError("Use uma senha com pelo menos 6 caracteres.");
        return;
      }
      if (password !== confirmPassword) {
        setError("As senhas não coincidem.");
        return;
      }
    }
    setLoading(true);
    const AUTH_TIMEOUT_MS = 30000;
    const withTimeout = <T,>(p: Promise<T>, ms: number): Promise<T> =>
      Promise.race([
        p,
        new Promise<never>((_, reject) =>
          setTimeout(
            () =>
              reject(
                new Error(
                  "Demorou muito. Em Firebase Console → Authentication → Domínios autorizados, adicione peteradar.com.br"
                )
              ),
            ms
          )
        ),
      ]);
    try {
      if (mode === "signup") {
        await withTimeout(createAccountWithEmail(trimmedEmail, password), AUTH_TIMEOUT_MS);
        const currentUser = auth.currentUser;
        if (currentUser) {
          let photoURL: string | null = null;
          if (photoFile) {
            try {
              photoURL = await uploadAvatar(currentUser.uid, photoFile);
            } catch (uploadErr) {
              console.error("Upload da foto:", uploadErr);
              setError(uploadErr instanceof Error ? uploadErr.message : "Erro ao enviar a foto.");
              setLoading(false);
              return;
            }
          }
          const name = displayName.trim() || null;
          if (name || photoURL) {
            await updateProfile(currentUser, {
              displayName: name ?? undefined,
              photoURL: photoURL ?? undefined,
            });
          }
        }
      } else {
        await withTimeout(signInWithEmail(trimmedEmail, password), AUTH_TIMEOUT_MS);
      }
      resetForm();
      onSuccess?.();
      if (!asPage) onClose();
    } catch (err: unknown) {
      const code =
        err && typeof err === "object" && "code" in err
          ? String((err as { code: string }).code)
          : "";
      setError(getAuthErrorMessage(code));
    } finally {
      setLoading(false);
    }
  };

  const switchMode = useCallback(() => {
    setMode((m) => (m === "signup" ? "signin" : "signup"));
    setError(null);
    setConfirmPassword("");
    setDisplayName("");
    setPhotoFile(null);
    setPhotoPreview(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
  }, []);

  const content = (
    <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
      <div className="mb-4 flex items-center justify-between">
        <h2 id="auth-modal-title" className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
          {mode === "signup" ? "Criar conta" : "Entrar"}
        </h2>
        {asPage ? (
          <Link
            href="/"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Voltar
          </Link>
        ) : (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-700 dark:hover:text-zinc-300"
            aria-label="Fechar"
          >
            ✕
          </button>
        )}
      </div>

        {isAnonymous && mode === "signup" && (
          <p className="mb-3 text-xs text-zinc-600 dark:text-zinc-400">
            Sua conta será vinculada ao uso atual. Seu histórico de animais ajudados será mantido.
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {mode === "signup" && (
            <>
              <div>
                <label htmlFor="auth-name" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Nome ou apelido
                </label>
                <input
                  id="auth-name"
                  type="text"
                  autoComplete="name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-zinc-900 placeholder-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
                  placeholder="Como quer ser chamado?"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Foto de perfil
                </label>
                <div className="flex items-center gap-3">
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                    aria-label="Escolher foto de perfil"
                  />
                  {photoPreview ? (
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-zinc-200 dark:border-zinc-600">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photoPreview}
                        alt="Preview da foto"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div
                      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-zinc-300 bg-zinc-50 text-2xl dark:border-zinc-600 dark:bg-zinc-800"
                      aria-hidden
                    >
                      📷
                    </div>
                  )}
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      className="text-sm font-medium text-emerald-600 hover:underline dark:text-emerald-400"
                    >
                      {photoPreview ? "Trocar foto" : "Escolher foto"}
                    </button>
                    {photoPreview && (
                      <button
                        type="button"
                        onClick={() => {
                          setPhotoFile(null);
                          setPhotoPreview(null);
                          if (photoInputRef.current) photoInputRef.current.value = "";
                        }}
                        className="text-left text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
                      >
                        Remover
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
          <div>
            <label htmlFor="auth-email" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              E-mail
            </label>
            <input
              id="auth-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-zinc-900 placeholder-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label htmlFor="auth-password" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Senha
            </label>
            <div className="relative">
              <input
                id="auth-password"
                type={showPassword ? "text" : "password"}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 bg-white py-2.5 pl-3 pr-10 text-zinc-900 placeholder-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
                placeholder={mode === "signup" ? "Mín. 6 caracteres" : "Sua senha"}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-600 dark:hover:text-zinc-200"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          {mode === "signup" && (
            <div>
              <label htmlFor="auth-confirm" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Confirmar senha
              </label>
              <div className="relative">
                <input
                  id="auth-confirm"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 bg-white py-2.5 pl-3 pr-10 text-zinc-900 placeholder-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
                  placeholder="Repita a senha"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-600 dark:hover:text-zinc-200"
                  aria-label={showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          )}
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="mt-1 w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 dark:bg-emerald-500 dark:hover:bg-emerald-600"
          >
            {loading
              ? "Aguarde…"
              : mode === "signup"
                ? "Criar conta"
                : "Entrar"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-zinc-600 dark:text-zinc-400">
          {mode === "signup" ? "Já tem conta?" : "Ainda não tem conta?"}{" "}
          <button
            type="button"
            onClick={switchMode}
            className="font-medium text-emerald-600 hover:underline dark:text-emerald-400"
          >
            {mode === "signup" ? "Entrar" : "Criar conta"}
          </button>
        </p>
      </div>
  );

  if (asPage) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-8">
        {content}
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      {content}
    </div>
  );
}
