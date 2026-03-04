"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import type { DocumentSnapshot } from "firebase/firestore";
import type { Animal } from "@/types";
import { AnimalCard } from "@/components/AnimalCard";
import { DonateModal } from "@/components/DonateModal";
import { AnimalCardSkeleton } from "@/components/AnimalCardSkeleton";
import { FilterTabs, type FilterTab } from "@/components/FilterTabs";
import { UserStatsCard } from "@/components/UserStatsCard";
import { getDistanceKm } from "@/lib/geo";
import { getHelpedAnimalIds } from "@/lib/helps";
import {
  fetchAnimalsFirstPage,
  fetchAnimalsNextPage,
  ANIMALS_PAGE_SIZE,
} from "@/lib/animals";
import { useAuth } from "@/components/AuthProvider";
import type { SortValue } from "@/lib/constants";
import { useRouter } from "next/navigation";

const AnimalMap = dynamic(
  () => import("@/components/AnimalMap").then((m) => m.AnimalMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[300px] items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-emerald-500" />
      </div>
    ),
  }
);

const SKELETON_COUNT = 4;

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [helpedIds, setHelpedIds] = useState<Set<string>>(new Set());
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [tabFilter, setTabFilter] = useState<FilterTab>("all");
  const [citySearch, setCitySearch] = useState("");
  const [sortBy, setSortBy] = useState<SortValue>("recent");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [donateModalOpen, setDonateModalOpen] = useState(false);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
    );
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  useEffect(() => {
    if (!user) {
      setHelpedIds(new Set());
      return;
    }
    getHelpedAnimalIds(user.uid).then(setHelpedIds);
  }, [user]);

  const prevUidRef = useRef<string | undefined>(undefined);

  const loadAnimals = useCallback(async () => {
    setLoadError(null);
    setLoading(true);
    try {
      const { list, lastDoc: nextLastDoc, hasMore: nextHasMore } = await fetchAnimalsFirstPage();
      setAnimals(list);
      setLastDoc(nextLastDoc);
      setHasMore(nextHasMore);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao carregar animais.";
      setLoadError(msg);
      setAnimals([]);
      setLastDoc(null);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnimals();
  }, [loadAnimals]);

  // Ao trocar de usuário (ex.: Sair → novo anônimo), recarrega a lista no contexto do novo auth para os registros continuarem visíveis.
  useEffect(() => {
    const uid = user?.uid;
    if (prevUidRef.current !== undefined && uid !== undefined && prevUidRef.current !== uid) {
      setLoadError(null);
      fetchAnimalsFirstPage()
        .then(({ list, lastDoc: nextLastDoc, hasMore: nextHasMore }) => {
          setAnimals(list);
          setLastDoc(nextLastDoc);
          setHasMore(nextHasMore);
        })
        .catch((err) => {
          setLoadError(err instanceof Error ? err.message : "Erro ao recarregar.");
        });
    }
    prevUidRef.current = uid;
  }, [user?.uid]);

  const loadMore = useCallback(async () => {
    if (!lastDoc || loadingMore || !hasMore) return;
    setLoadingMore(true);
    const { list: nextList, lastDoc: nextLastDoc, hasMore: nextHasMore } = await fetchAnimalsNextPage(lastDoc);
    setAnimals((prev) => [...prev, ...nextList]);
    setLastDoc(nextLastDoc);
    setHasMore(nextHasMore);
    setLoadingMore(false);
  }, [lastDoc, loadingMore, hasMore]);

  const getDistance = useCallback(
    (animal: Animal) => {
      if (!userLocation) return null;
      return getDistanceKm(
        userLocation.lat,
        userLocation.lng,
        animal.lat,
        animal.lng
      );
    },
    [userLocation]
  );

  const filteredAndSortedAnimals = useMemo(() => {
    let list = [...animals];

    if (tabFilter === "dog" || tabFilter === "cat") {
      list = list.filter((a) => (a.type ?? "dog") === tabFilter);
    } else if (tabFilter === "urgent") {
      list = list.filter((a) => a.needs.includes("vet"));
    } else if (tabFilter === "adoption") {
      list = list.filter((a) => a.needs.includes("adoption"));
    }
    if (citySearch.trim()) {
      const term = citySearch.trim().toLowerCase();
      list = list.filter((a) => a.city.toLowerCase().includes(term));
    }

    if (sortBy === "distance" && userLocation) {
      list.sort((a, b) => {
        const da = getDistanceKm(
          userLocation.lat,
          userLocation.lng,
          a.lat,
          a.lng
        );
        const db_ = getDistanceKm(
          userLocation.lat,
          userLocation.lng,
          b.lat,
          b.lng
        );
        return da - db_;
      });
    }
    return list;
  }, [animals, tabFilter, citySearch, sortBy, userLocation]);

  return (
    <div className="flex h-[calc(100vh-65px)] min-w-0 flex-col overflow-x-hidden lg:flex-row max-md:h-[calc(100dvh-65px-4rem)]">
      {/* Lista — desktop: esquerda | mobile: abaixo do mapa, scroll normal */}
      <aside className="flex w-full flex-col overflow-hidden bg-zinc-100 dark:bg-[#1b1b1b] max-md:order-2 max-md:min-h-0 max-md:flex-1 max-md:overflow-y-auto lg:w-[480px] lg:min-w-[420px] lg:max-w-[50vw] lg:shrink-0 lg:border-r lg:border-zinc-200/80 lg:dark:border-zinc-800/80">
        <div className="sticky top-0 z-20 flex shrink-0 flex-col gap-3 border-b border-zinc-200/80 bg-white px-5 py-4 dark:border-zinc-800/80 dark:bg-zinc-950/80 sm:px-6 max-md:gap-2 max-md:px-4 max-md:py-3">
          <FilterTabs
            value={tabFilter}
            onChange={setTabFilter}
            resultCount={filteredAndSortedAnimals.length}
          />
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="space-y-4 p-5 sm:p-6 max-md:space-y-3 max-md:p-4 max-md:pb-6">
            {!userLocation && (
              <div className="flex items-center justify-between gap-4 rounded-xl bg-[#1b1b1b] px-4 py-4 text-white shadow-sm md:hidden">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="text-2xl" aria-hidden>🐾</span>
                  <div className="min-w-0">
                    <p className="font-semibold truncate text-sm">Animais precisam de você por perto!</p>
                    <p className="text-xs text-zinc-400">Veja os mais próximos e salve uma vida.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={requestLocation}
                  className="shrink-0 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  Permitir localização
                </button>
              </div>
            )}
            <UserStatsCard onCreateAccountClick={() => router.push("/criar-conta")} />
            <button
              type="button"
              onClick={() => setDonateModalOpen(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200/80 bg-white py-2.5 text-sm font-medium text-zinc-600 shadow-sm transition-colors hover:bg-zinc-50 hover:text-zinc-800 dark:border-zinc-700/80 dark:bg-zinc-800/50 dark:text-zinc-400 dark:hover:bg-zinc-700/80 dark:hover:text-zinc-200"
            >
              <span aria-hidden>❤️</span>
              Apoiar causa
            </button>
            {loadError ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center dark:border-amber-800 dark:bg-amber-950/40">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  {loadError}
                </p>
                <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">
                  Se o erro citar &quot;index&quot;, crie o índice no Firestore (link no console do navegador).
                </p>
                <button
                  type="button"
                  onClick={() => loadAnimals()}
                  className="mt-4 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600"
                >
                  Tentar novamente
                </button>
              </div>
            ) : loading ? (
              <>
                {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                  <AnimalCardSkeleton key={i} />
                ))}
              </>
            ) : filteredAndSortedAnimals.length === 0 ? (
              <div className="rounded-xl border border-zinc-200/80 bg-white p-8 text-center shadow-sm dark:border-zinc-700/80 dark:bg-zinc-800/60">
                <p className="text-zinc-600 dark:text-zinc-400">
                  {animals.length === 0
                    ? "Nenhum animal cadastrado no momento."
                    : "Nenhum resultado para os filtros selecionados."}
                </p>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                  {animals.length === 0 && (
                    <Link
                      href="/novo"
                      className="inline-block rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 dark:bg-emerald-500"
                    >
                      Cadastrar o primeiro
                    </Link>
                  )}
                  {animals.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setTabFilter("all");
                        setCitySearch("");
                        setSortBy("recent");
                      }}
                      className="inline-block rounded-xl bg-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-800 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-600"
                    >
                      Limpar filtros
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => loadAnimals()}
                    className="inline-block rounded-xl bg-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-800 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-600"
                  >
                    Atualizar lista
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                {filteredAndSortedAnimals.map((animal) => (
                  <AnimalCard
                    key={animal.id}
                    animal={animal}
                    distanceKm={getDistance(animal)}
                    hasHelped={helpedIds.has(animal.id)}
                    onHelped={() =>
                      setHelpedIds((prev) => new Set([...prev, animal.id]))
                    }
                    onReportSubmitted={(hidden) => {
                      if (hidden)
                        setAnimals((prev) => prev.filter((a) => a.id !== animal.id));
                    }}
                    onResolved={() =>
                      setAnimals((prev) => prev.filter((a) => a.id !== animal.id))
                    }
                  />
                ))}
                {hasMore && (
                  <button
                    type="button"
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="w-full rounded-xl border border-zinc-200/80 bg-white py-3 text-sm font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700/80 dark:bg-zinc-800/60 dark:text-zinc-300 dark:hover:bg-zinc-700/80"
                  >
                    {loadingMore ? "Carregando..." : `Carregar mais (${ANIMALS_PAGE_SIZE})`}
                  </button>
                )}
                </div>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Mapa — desktop: direita | mobile: bloco fixo no topo (40vh), sem sobrepor */}
      <section className="safe-area-bottom relative flex min-h-[280px] min-w-0 flex-1 flex-col gap-4 overflow-hidden p-4 lg:min-h-0 lg:p-5 max-md:order-1 max-md:h-[40vh] max-md:min-h-0 max-md:shrink-0 max-md:gap-3 max-md:p-3 max-md:pb-4">
        <div className="min-h-[240px] flex-1 overflow-hidden rounded-xl border border-zinc-200/80 bg-zinc-100 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-800/40 max-md:h-full max-md:min-h-0 lg:min-h-0">
          <AnimalMap
            animals={filteredAndSortedAnimals}
            userLocation={userLocation}
            className="h-full"
          />
        </div>
        {!userLocation && (
          <div className="hidden items-center justify-between gap-4 rounded-xl bg-[#1b1b1b] px-4 py-4 text-white shadow-sm md:flex">
            <div className="flex min-w-0 items-center gap-3">
              <span className="text-2xl" aria-hidden>🐾</span>
              <div className="min-w-0">
                <p className="font-semibold">Animais precisam de você por perto!</p>
                <p className="text-sm text-zinc-400">Veja os mais próximos e salve uma vida.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={requestLocation}
              className="shrink-0 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Permitir localização
            </button>
          </div>
        )}
      </section>
      {donateModalOpen && (
        <DonateModal onClose={() => setDonateModalOpen(false)} />
      )}
    </div>
  );
}
