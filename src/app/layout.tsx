import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "DonasiKebaikan — Platform Donasi LAZIS NUR",
    template: "%s | DonasiKebaikan",
  },
  description:
    "Platform penghimpunan dana zakat, infaq, qurban, dan program sosial LAZIS NUR. Bersama wujudkan kebaikan nyata.",
  keywords: ["donasi", "zakat", "infaq", "qurban", "LAZIS NUR", "crowdfunding", "sedekah"],
  authors: [{ name: "LAZIS NUR" }],
  openGraph: {
    title: "DonasiKebaikan — Platform Donasi LAZIS NUR",
    description: "Bersama wujudkan kebaikan nyata bersama LAZIS NUR.",
    siteName: "DonasiKebaikan",
    locale: "id_ID",
    type: "website",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DonasiKebaikan",
  },
  icons: {
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#16a34a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${plusJakarta.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased bg-white text-slate-900">
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js')}`,
          }}
        />
      </body>
    </html>
  );
}
