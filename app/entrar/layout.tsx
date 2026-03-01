import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Entrar | PetRadar",
};

export default function EntrarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
