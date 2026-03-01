"use client";

import { useRouter } from "next/navigation";
import { AuthModal } from "@/components/AuthModal";

export default function CriarContaPage() {
  const router = useRouter();
  return (
    <AuthModal
      initialMode="signup"
      onClose={() => {}}
      onSuccess={() => router.push("/")}
      asPage
    />
  );
}
