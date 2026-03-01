import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Criar conta | PetRadar",
};

export default function CriarContaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
