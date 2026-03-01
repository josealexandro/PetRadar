import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/components/AuthProvider";
import { AuthModalProvider } from "@/components/AuthModalContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeScript } from "@/components/ThemeScript";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

const APP_NAME = "PetRadar";
const APP_DESCRIPTION = "Encontre e ajude animais";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: APP_NAME,
  description: APP_DESCRIPTION,
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192x192.png",
    apple: "/icons/icon-192x192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_NAME,
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0a0a0a",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="flex min-h-screen min-h-[100dvh] flex-col antialiased safe-area-bg">
        <ThemeScript />
        <ThemeProvider>
          <AuthProvider>
            <AuthModalProvider>
              <Navbar />
              <main className="flex-1 min-h-0">{children}</main>
            </AuthModalProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
