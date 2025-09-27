// app/layout.tsx
import type { Metadata } from "next";
import { Cal_Sans } from "next/font/google";
import "@/styles/globals.css";
import { LocaleProvider } from "@/context/LocaleProvider";
import { cookies } from "next/headers";

const cal_sans = Cal_Sans({
  subsets: ["latin"],
  variable: "--font-cal-sans",
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "My Site",
  description: "Region + Language without locale routes",
};

// helper: derive currency from region (SSR, fonte da verdade)
function mapRegionToCurrency(region: string): "BRL" | "USD" | "EUR" {
  const r = region.toUpperCase();
  if (r === "BR") return "BRL";
  if (r === "EU") return "EUR";
  // países da UE individuais (se chegar um desses como region)
  const eu = [
    "FR",
    "DE",
    "IT",
    "ES",
    "PT",
    "NL",
    "BE",
    "IE",
    "AT",
    "FI",
    "GR",
    "LU",
    "MT",
    "SI",
    "SK",
    "EE",
    "LV",
    "LT",
  ];
  if (eu.includes(r)) return "EUR";
  return "USD";
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Next 15: cookies() é assíncrono
  const c = await cookies();

  const lang = (c.get("lang")?.value ?? "en").toLowerCase();
  const region = (c.get("region")?.value ?? "US").toUpperCase();

  // NÃO confiar em cookie de currency; derive pela região
  const currency = mapRegionToCurrency(region);

  return (
    <html lang={lang} className={cal_sans.variable}>
      <body className={`${cal_sans.className} antialiased`}>
        {/* valores já vem do SSR ⇒ sem “piscar” */}
        <LocaleProvider initial={{ lang, region, currency }}>
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}
