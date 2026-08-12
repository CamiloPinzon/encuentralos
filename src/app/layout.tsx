import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://encuentralos-seven.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Encuéntralos - Reporta mascotas y personas",
    template: "%s | Encuéntralos",
  },
  description: "Plataforma comunitaria para reportar personas o mascotas perdidas, encontradas o avistadas en Colombia.",
  keywords: ["mascotas perdidas", "personas desaparecidas", "perros perdidos", "gatos perdidos", "reportar mascota", "colombia", "encontrar mascota"],
  authors: [{ name: "Comunidad Encuéntralos" }],
  creator: "Encuéntralos",
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: SITE_URL,
    title: "Encuéntralos - Reporta mascotas y personas",
    description: "Plataforma comunitaria para reportar personas o mascotas perdidas, encontradas o avistadas en Colombia.",
    siteName: "Encuéntralos",
    images: [
      {
        url: "/og-image.png",
        width: 1024,
        height: 1024,
        alt: "Encuéntralos Logo",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Encuéntralos - Reporta mascotas y personas",
    description: "Plataforma comunitaria para reportar personas o mascotas perdidas en Colombia.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
