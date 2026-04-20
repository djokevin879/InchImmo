import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "INCH'ALLAH IMMOBILIER",
  description: "Gestion immobilière à Bouaké, Côte d'Ivoire",
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: "Inch'Allah Immobilier",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${geistSans.variable} ${inter.variable}`}>
      <body className="antialiased font-sans bg-background text-foreground">
        <Providers>
          {children}
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
