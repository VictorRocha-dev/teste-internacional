import { NextResponse, type NextRequest } from "next/server";
import { countryToRegion, languageToDefaultCountry } from "@/lib/headers";
import { signRegion, verifyRegion } from "@/lib/edgeCrypto"; // <-- Edge-safe

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};

const COUNTRY_HEADER_CANDIDATES = [
  "x-vercel-ip-country",
  "cf-ipcountry",
  "x-nf-country",
  "fastly-country-code",
  "x-geoip-country",
  "x-country-code",
];

function detectCountryFromHeaders(req: NextRequest): string | null {
  for (const h of COUNTRY_HEADER_CANDIDATES) {
    const v = req.headers.get(h);
    if (v) return v.toUpperCase();
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

export async function middleware(req: NextRequest) {
  // <-- async
  const res = NextResponse.next();
  const c = req.cookies;

  const headerCountry = detectCountryFromHeaders(req) || undefined;
  const acceptLang = detectLangFromAcceptLanguage(req) || undefined;

  // token httpOnly (assinado)
  const token = c.get("region_token")?.value;
  const verified = await verifyRegion(token); // <-- await
  const regionByHeader = countryToRegion(headerCountry);
  const regionByLang = countryToRegion(languageToDefaultCountry(acceptLang));

  const serverRegion =
    regionByHeader || verified?.region || regionByLang || DEFAULT_REGION;

  // reemite token se ausente/divergente
  if (!verified || verified.region !== serverRegion) {
    const newToken = await signRegion({
      region: serverRegion,
      ts: Math.floor(Date.now() / 1000),
    });
    res.cookies.set({
      name: "region_token",
      value: newToken,
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 60 * 60 * 24,
    });
  }

  // espelho legível (UI) — reescrito sempre
  res.cookies.set({
    name: "region",
    value: serverRegion,
    httpOnly: false,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  const existingLang = c.get("lang")?.value;
  const lang = existingLang || acceptLang || DEFAULT_LANG;
  res.cookies.set({
    name: "lang",
    value: lang,
    httpOnly: false,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  const currency = mapRegionToCurrency(serverRegion);
  res.cookies.set({
    name: "currency",
    value: currency,
    httpOnly: false,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  return res;
}

function mapRegionToCurrency(region: string) {
  const r = region.toUpperCase();
  if (r === "BR") return "BRL";
  if (r === "EU") return "EUR";
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
