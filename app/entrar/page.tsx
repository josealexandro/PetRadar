"use client";

import { useRouter } from "next/navigation";
import { AuthModal } from "@/components/AuthModal";

export default function EntrarPage() {
  const router = useRouter();
  return (
    <AuthModal
      initialMode="signin"
      onClose={() => {}}
      onSuccess={() => router.push("/")}
      asPage
    />
  );
}
