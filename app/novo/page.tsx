"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import imageCompression from "browser-image-compression";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  type UploadMetadata,
} from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { storage, db } from "@/lib/firebase";
import { useAuth } from "@/components/AuthProvider";
import type { AnimalInput, AnimalNeed, AnimalType } from "@/types";

const TYPE_OPTIONS: { value: AnimalType; label: string }[] = [
  { value: "dog", label: "Cachorro" },
  { value: "cat", label: "Gato" },
];

const NEEDS_OPTIONS: { value: AnimalNeed; label: string }[] = [
  { value: "food", label: "Comida" },
  { value: "water", label: "Água" },
  { value: "vet", label: "Veterinário" },
  { value: "adoption", label: "Adoção" },
  { value: "temporary_home", label: "Lar temporário" },
];

export default function NovoPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [description, setDescription] = useState("");
  const [type, setType] = useState<AnimalType>("dog");
  const [needs, setNeeds] = useState<AnimalNeed[]>([]);
  const [city, setCity] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const requestLocation = useCallback(() => {
    setLocationLoading(true);
    setLocationError(null);
    if (!navigator.geolocation) {
      setLocationError("Geolocalização não é suportada no seu navegador.");
      setLocationLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setLocationLoading(false);
      },
      (err) => {
        setLocationError(
          err.message === "User denied the request for Geolocation"
            ? "Permissão de localização negada."
            : "Não foi possível obter a localização."
        );
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
    );
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  const toggleNeed = (need: AnimalNeed) => {
    setNeeds((prev) =>
      prev.includes(need) ? prev.filter((n) => n !== need) : [...prev, need]
    );
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) setPhotos(Array.from(files));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitError(null);

    const hasCoords = lat != null && lng != null;
    if (!description.trim()) {
      setSubmitError("Preencha a descrição.");
      return;
    }
    if (photos.length === 0) {
      setSubmitError("Envie pelo menos uma foto.");
      return;
    }
    if (!city.trim()) {
      setSubmitError("Preencha a cidade.");
      return;
    }
    if (!hasCoords) {
      setSubmitError("Permita a localização ou tente novamente.");
      return;
    }

    setSubmitLoading(true);
    setSubmitError(null);
    try {
      setSubmitStatus("Comprimindo fotos...");
      const basePath = `animals/${user.uid}/${Date.now()}`;

      const results = await Promise.all(
        photos.map(async (file, i) => {
          const [thumbCompressed, fullCompressed] = await Promise.all([
            imageCompression(file, {
              maxWidthOrHeight: 300,
              initialQuality: 0.7,
              maxSizeMB: 0.04,
              fileType: "image/webp",
              preserveExif: false,
              useWebWorker: true,
            }),
            imageCompression(file, {
              maxWidthOrHeight: 1280,
              initialQuality: 0.7,
              maxSizeMB: 0.25,
              fileType: "image/webp",
              preserveExif: false,
              useWebWorker: true,
            }),
          ]);
          return { thumbCompressed, fullCompressed, i };
        })
      );

      setSubmitStatus("Enviando fotos...");
      const uploadResults = await Promise.all(
        results.map(async ({ thumbCompressed, fullCompressed, i }) => {
          const [thumbRef, fullRef] = [
            ref(storage, `${basePath}_${i}_thumb.webp`),
            ref(storage, `${basePath}_${i}.webp`),
          ];
          const meta: UploadMetadata = { contentType: "image/webp" };
          await Promise.all([
            uploadBytes(thumbRef, thumbCompressed, meta),
            uploadBytes(fullRef, fullCompressed, meta),
          ]);
          const [thumbUrl, fullUrl] = await Promise.all([
            getDownloadURL(thumbRef),
            getDownloadURL(fullRef),
          ]);
          return { thumbUrl, fullUrl };
        })
      );

      const photoUrls = uploadResults.map((r) => r.fullUrl);
      const thumbnailUrls = uploadResults.map((r) => r.thumbUrl);

      const data: AnimalInput = {
        photos: photoUrls,
        thumbnails: thumbnailUrls,
        description: description.trim(),
        type,
        needs,
        lat,
        lng,
        city: city.trim(),
        createdBy: user.uid,
        status: "open",
      };
      if (whatsapp.trim()) data.whatsapp = whatsapp.trim();

      setSubmitStatus("Salvando...");
      await addDoc(collection(db, "animals"), {
        ...data,
        createdAt: serverTimestamp(),
      });

      setSubmitStatus(null);
      router.push("/");
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Erro ao salvar. Tente novamente."
      );
      setSubmitStatus(null);
      setSubmitLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <span className="text-zinc-500">Carregando...</span>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex items-center gap-4">
        <Link
          href="/"
          className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          ← Voltar
        </Link>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Novo animal
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Fotos */}
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Fotos *
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotoChange}
            className="block w-full text-sm text-zinc-600 file:mr-4 file:rounded-lg file:border-0 file:bg-zinc-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-zinc-800 dark:file:bg-zinc-700 dark:file:text-zinc-200"
          />
          {photos.length > 0 && (
            <p className="mt-1 text-sm text-zinc-500">
              {photos.length} foto(s) selecionada(s)
            </p>
          )}
        </div>

        {/* Descrição */}
        <div>
          <label
            htmlFor="description"
            className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Descrição *
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
            placeholder="Descreva o animal e a situação..."
          />
        </div>

        {/* Tipo */}
        <div>
          <span className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Tipo *
          </span>
          <div className="flex gap-4">
            {TYPE_OPTIONS.map((opt) => (
              <label key={opt.value} className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="type"
                  value={opt.value}
                  checked={type === opt.value}
                  onChange={() => setType(opt.value)}
                  className="h-4 w-4 border-zinc-300 text-zinc-900 focus:ring-zinc-500"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        {/* Necessidades */}
        <div>
          <span className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Necessidades
          </span>
          <div className="flex flex-wrap gap-3">
            {NEEDS_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-300 px-4 py-2 dark:border-zinc-600"
              >
                <input
                  type="checkbox"
                  checked={needs.includes(opt.value)}
                  onChange={() => toggleNeed(opt.value)}
                  className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        {/* Localização */}
        <div>
          <span className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Localização
          </span>
          {locationLoading ? (
            <p className="text-sm text-zinc-500">Obtendo localização...</p>
          ) : locationError ? (
            <div>
              <p className="text-sm text-amber-600 dark:text-amber-400">
                {locationError}
              </p>
              <button
                type="button"
                onClick={requestLocation}
                className="mt-2 text-sm font-medium text-zinc-700 underline dark:text-zinc-300"
              >
                Tentar novamente
              </button>
            </div>
          ) : (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              ✓ Lat: {lat?.toFixed(5)}, Lng: {lng?.toFixed(5)}
            </p>
          )}
          <label htmlFor="city" className="mt-2 mb-1 block text-sm text-zinc-600 dark:text-zinc-400">
            Cidade *
          </label>
          <input
            id="city"
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            placeholder="Ex: São Paulo"
          />
        </div>

        {/* WhatsApp */}
        <div>
          <label
            htmlFor="whatsapp"
            className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            WhatsApp (opcional)
          </label>
          <input
            id="whatsapp"
            type="tel"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            placeholder="(11) 99999-9999"
          />
        </div>

        {submitError && (
          <p className="text-sm text-red-600 dark:text-red-400">{submitError}</p>
        )}

        <button
          type="submit"
          disabled={submitLoading}
          className="w-full rounded-lg bg-zinc-900 px-4 py-3 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {submitLoading ? (submitStatus ?? "Salvando...") : "Salvar"}
        </button>
      </form>
    </div>
  );
}
