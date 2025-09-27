// middleware.ts
import { NextResponse, type NextRequest } from "next/server";

// NÃO exporte runtime aqui
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};

const COUNTRY_HEADER_CANDIDATES = [
  "x-vercel-ip-country", // Vercel
  "cf-ipcountry", // Cloudflare
  "x-nf-country", // Netlify
  "fastly-country-code", // Fastly
  "x-geoip-country", // genérico
  "x-country-code", // genérico
];

function detectCountryFromHeaders(req: NextRequest): string | null {
  for (const h of COUNTRY_HEADER_CANDIDATES) {
    const val = req.headers.get(h);
    if (val) return val.toUpperCase();
  }
  return null;
}

function detectLangFromAcceptLanguage(req: NextRequest): string | null {
  const al = req.headers.get("accept-language");
  if (!al) return null;
  const first = al.split(",")[0]?.split(";")[0]?.trim();
  if (!first) return null;
  return first.split("-")[0]?.toLowerCase() || null;
}

const DEFAULT_REGION = "US";
const DEFAULT_LANG = "en";

export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const cookies = req.cookies;

  const existingRegion = cookies.get("region")?.value;
  const existingLang = cookies.get("lang")?.value;

  const headerCountry = detectCountryFromHeaders(req) || undefined;
  const acceptLang = detectLangFromAcceptLanguage(req) || undefined;

  const region = existingRegion ?? headerCountry ?? DEFAULT_REGION;
  const lang = existingLang ?? acceptLang ?? DEFAULT_LANG;

  const currency = mapCountryToCurrency(region);

  setCookie(res, "region", region);
  setCookie(res, "lang", lang);
  setCookie(res, "currency", currency);

  return res;
}

function mapCountryToCurrency(countryCode: string) {
  const cc = (countryCode || "").toUpperCase();
  if (cc === "BR") return "BRL";
  if (
    [
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
    ].includes(cc)
  ) {
    return "EUR";
  }
  return "USD";
}

function setCookie(res: NextResponse, name: string, value: string) {
  res.cookies.set({
    name,
    value,
    path: "/",
    httpOnly: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
  });
}
