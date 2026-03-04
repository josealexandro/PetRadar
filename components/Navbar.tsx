"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/components/AuthProvider";
import { useTheme } from "@/components/ThemeProvider";
import { useUserStats } from "@/hooks/useUserStats";
import { useRef, useEffect, useState } from "react";

export function Navbar() {
  const { user, loading, signInWithGoogle, signInAnonymously, logout } =
    useAuth();
  const { animalsHelpedCount } = useUserStats(user?.uid ?? null);
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <header className="border-b border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <nav className="safe-area-top mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50"
        >
          <span className="text-2xl" aria-hidden>🐾</span>
          PetRadar
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
            aria-label={theme === "dark" ? "Usar tema claro" : "Usar tema escuro"}
            title={theme === "dark" ? "Tema claro" : "Tema escuro"}
          >
            {theme === "dark" ? (
              <span className="text-lg" aria-hidden>☀️</span>
            ) : (
              <span className="text-lg" aria-hidden>🌙</span>
            )}
          </button>
          <Link
            href="/novo"
            className="whitespace-nowrap rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
          >
            Adicionar pet
          </Link>
          {loading ? (
            <span className="h-9 w-20 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-700" />
          ) : user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="hidden text-sm text-zinc-600 dark:text-zinc-400 sm:inline">
                <span className="font-medium tabular-nums text-zinc-900 dark:text-zinc-100">
                  {animalsHelpedCount}
                </span>{" "}
                {animalsHelpedCount === 1 ? "animal ajudado" : "animais ajudados"}
              </span>
              <span className="hidden max-w-[120px] truncate text-sm text-zinc-700 dark:text-zinc-300 md:inline">
                Bem-vindo{user.displayName || user.email ? ", " : ""}
                {user.displayName
                  ? user.displayName
                  : user.email
                    ? user.email.split("@")[0]
                    : " visitante"}
              </span>
              {user.isAnonymous && (
                <Link
                  href="/criar-conta"
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-900/30"
                >
                  Criar conta
                </Link>
              )}
              {user.photoURL ? (
                <span className="flex h-9 w-9 shrink-0 overflow-hidden rounded-full">
                  <Image
                    src={user.photoURL}
                    alt={user.displayName ?? "Avatar"}
                    width={36}
                    height={36}
                    className="h-full w-full object-cover"
                  />
                </span>
              ) : (
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-600 text-sm font-medium text-white"
                  aria-hidden
                >
                  {user.displayName?.charAt(0) ?? user.email?.charAt(0) ?? "?"}
                </span>
              )}
              <button
                type="button"
                onClick={() => logout()}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
              >
                Sair
              </button>
            </div>
          ) : (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                className="rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Entrar
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full z-10 mt-1 w-56 rounded-xl border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
                  <button
                    type="button"
                    onClick={() => {
                      signInWithGoogle();
                      setMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    <span className="text-lg">G</span>
                    Entrar com Google
                  </button>
                  <Link
                    href="/criar-conta"
                    onClick={() => setMenuOpen(false)}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    Criar conta (e-mail)
                  </Link>
                  <Link
                    href="/entrar"
                    onClick={() => setMenuOpen(false)}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    Entrar com e-mail
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      signInAnonymously();
                      setMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    Continuar como visitante
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
