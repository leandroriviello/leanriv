import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "./providers";

export const metadata: Metadata = {
  title: "LeanRiv | Gestor personal de enlaces",
  description:
    "LeanRiv es tu panel privado para crear, buscar y administrar redirecciones cortas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="bg-[#0a0a0a]">
      <body className="font-sans antialiased">
        <AppProviders />
        {children}
      </body>
    </html>
  );
}
