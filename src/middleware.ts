import { NextResponse, type NextRequest } from "next/server";
import { countryToRegion, languageToDefaultCountry } from "@/lib/headers";
import { signRegion, verifyRegion } from "@/lib/edgeCrypto"; // Web Crypto (Edge-safe)

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

// quando NÃO existe cookie de lang, usar o idioma padrão pela região
function regionToDefaultLang(region?: string): string {
  const r = (region ?? "").toUpperCase();
  if (r === "BR") return "pt";
  if (r === "US") return "en";
  if (r === "EU") return "en"; // neutro; ajuste se quiser
  if (r === "PT") return "pt";
  return "en";
}

const DEFAULT_REGION = "US";
const DEFAULT_LANG = "en";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const c = req.cookies;
  const isProd = process.env.NODE_ENV === "production";

  const headerCountry = detectCountryFromHeaders(req) || undefined;
  const acceptLang = detectLangFromAcceptLanguage(req) || undefined;

  // token httpOnly (assinado) com Web Crypto
  const token = c.get("region_token")?.value;
  const verified = await verifyRegion(token);

  const regionByHeader = countryToRegion(headerCountry);
  const regionByLang = countryToRegion(languageToDefaultCountry(acceptLang));

  // fonte da verdade: header > token > lang > default
  const serverRegion =
    regionByHeader || verified?.region || regionByLang || DEFAULT_REGION;

  // (re)emite token quando ausente ou divergente
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
      secure: isProd,
      path: "/",
      maxAge: 60 * 60 * 24, // 1 dia
    });
  }

  // espelho legível (UI) — reescrito SEMPRE (ignora edição manual)
  res.cookies.set({
    name: "region",
    value: serverRegion,
    httpOnly: false,
    sameSite: "lax",
    secure: isProd,
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  // se NÃO existir cookie de lang, define pelo serverRegion
  const existingLang = c.get("lang")?.value;
  const lang =
    existingLang ||
    regionToDefaultLang(serverRegion) || // ex.: BR -> pt
    acceptLang ||
    DEFAULT_LANG;

  res.cookies.set({
    name: "lang",
    value: lang,
    httpOnly: false,
    sameSite: "lax",
    secure: isProd,
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  // currency derivada da região (nunca confiar na do cliente)
  const currency = mapRegionToCurrency(serverRegion);
  res.cookies.set({
    name: "currency",
    value: currency,
    httpOnly: false,
    sameSite: "lax",
    secure: isProd,
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  // evita cache cruzado entre regiões/idiomas
  res.headers.set(
    "Vary",
    "x-vercel-ip-country, cf-ipcountry, x-nf-country, fastly-country-code, accept-language, cookie"
  );

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
