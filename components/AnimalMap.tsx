"use client";

import { useEffect, useRef, useState } from "react";
import type { Animal } from "@/types";
import { openDirections } from "@/lib/geo";

type AnimalMapProps = {
  animals: Animal[];
  userLocation: { lat: number; lng: number } | null;
  className?: string;
};

export function AnimalMap({ animals, userLocation, className = "" }: AnimalMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !containerRef.current || typeof window === "undefined") return;

    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current) return;

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      const center: [number, number] = userLocation
        ? [userLocation.lat, userLocation.lng]
        : (animals[0] ? [animals[0].lat, animals[0].lng] : [-23.55, -46.63]);
      const map = L.map(containerRef.current).setView(center, 12);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
      }).addTo(map);

      if (userLocation) {
        const userIcon = L.divIcon({
          className: "user-marker",
          html: '<div style="width:14px;height:14px;background:#2563eb;border:2px solid white;border-radius:50%;box-shadow:0 1px 3px rgba(0,0,0,0.3)"></div>',
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });
        L.marker([userLocation.lat, userLocation.lng], { icon: userIcon }).addTo(map);
      }

      animals.forEach((animal) => {
        const photo = animal.thumbnails?.[0] ?? animal.photos[0];
        const name = animal.description.length > 60
          ? animal.description.slice(0, 60).trim() + "…"
          : animal.description;
        const typeLabel = animal.type === "dog" ? "Cachorro" : "Gato";

        const popupEl = document.createElement("div");
        popupEl.className = "min-w-[200px] max-w-[280px]";
        popupEl.innerHTML = `
          ${photo ? `<img src="${photo.replace(/"/g, "&quot;")}" alt="" class="w-full aspect-video object-cover rounded-t mb-2" style="margin: -10px -20px 8px -20px; width: calc(100% + 40px); max-width: none;" />` : ""}
          <p class="text-xs text-zinc-500 mb-1">${typeLabel} · ${animal.city}</p>
          <p class="text-sm font-medium text-zinc-800 mb-3">${name.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
          <button type="button" class="popup-directions-btn w-full rounded-lg bg-emerald-600 py-2 text-xs font-semibold text-white hover:bg-emerald-700">
            Como chegar
          </button>
        `;
        const btn = popupEl.querySelector(".popup-directions-btn");
        if (btn) {
          btn.addEventListener("click", () => openDirections(animal.lat, animal.lng));
        }

        const icon = L.divIcon({
          className: "animal-marker",
          html: '<div style="width:24px;height:24px;background:#16a34a;border:2px solid white;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></div>',
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const marker = L.marker([animal.lat, animal.lng], { icon })
          .addTo(map)
          .bindPopup(popupEl, { maxWidth: 320 });
        markersRef.current.push(marker);
      });

      if (cancelled) {
        map.remove();
        return;
      }
      mapRef.current = map;
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markersRef.current = [];
    };
  }, [mounted, animals, userLocation]);

  if (!mounted) {
    return (
      <div
        className={`flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 ${className}`}
      >
        <span className="text-sm text-zinc-500">Carregando mapa...</span>
      </div>
    );
  }

  return <div ref={containerRef} className={`h-full min-h-[300px] min-w-0 w-full overflow-hidden ${className}`} />;
}
