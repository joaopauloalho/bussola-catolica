import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible, Cormorant_Garamond } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const atkinson = Atkinson_Hyperlegible({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "700"],
  variable: "--font-atkinson",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const url = siteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(url),
  title: {
    default: "Bússola Católica — missas em Londrina",
    template: "%s · Bússola Católica",
  },
  description:
    "Encontre paróquias e capelas em Londrina com missa, confissão e adoração, em ordem do próximo horário e com a distância em quilômetros.",
  applicationName: "Bússola Católica",
  authors: [{ name: "Bússola Católica" }],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Bússola Católica",
    title: "Bússola Católica — missas em Londrina",
    description:
      "Guia gratuito de missas, confissões e adoração nas paróquias de Londrina.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Bússola Católica" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bússola Católica — missas em Londrina",
    description:
      "Guia gratuito de missas, confissões e adoração nas paróquias de Londrina.",
    images: ["/og.png"],
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#10243f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${atkinson.variable} ${cormorant.variable}`}>
      <body>
        <a href="#conteudo" className="skip-link">
          Ir para o conteúdo
        </a>
        <Header />
        <main id="conteudo" className="mx-auto min-h-[70vh] max-w-6xl px-4 py-6 sm:px-6">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
