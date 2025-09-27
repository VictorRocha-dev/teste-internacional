// app/layout.tsx
import type { Metadata } from "next";
import { Cal_Sans } from "next/font/google";
import "@/styles/globals.css";
import { LocaleProvider } from "@/context/LocaleProvider";
import { cookies } from "next/headers";

const cal_sans = Cal_Sans({
  subsets: ["latin"],
  variable: "--font-cal-sans",
  weight: ["400"], // ajuste as weights que você realmente usa
});

export const metadata: Metadata = {
  title: "My Site",
  description: "Region + Language without locale routes",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const c = await cookies();

  const lang = (c.get("lang")?.value ?? "en").toLowerCase();
  const region = (c.get("region")?.value ?? "US").toUpperCase();
  const currency = c.get("currency")?.value ?? "USD";

  return (
    <html lang={lang} className={cal_sans.variable}>
      <body className={`${cal_sans.className} antialiased`}>
        {/* Passa valores já do SSR ⇒ sem “piscar” */}
        <LocaleProvider initial={{ lang, region, currency }}>
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}
