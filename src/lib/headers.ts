// lib/headers.ts
export type RegionCode = "US" | "BR" | "EU" | string;

export function countryToRegion(country: string | undefined): RegionCode {
  if (!country) return "US";
  const cc = country.toUpperCase();

  if (cc === "BR") return "BR";

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
  if (eu.includes(cc)) return "EU";

  return "US";
}

/**
 * Mapeia o idioma principal para um "país padrão" (para fallback de região).
 * Ex.: "pt" => "BR", "es" => "ES", "it" => "IT", "en" => "US"
 * Isso só roda quando NÃO temos header de país.
 */
export function languageToDefaultCountry(
  lang: string | undefined
): string | undefined {
  if (!lang) return undefined;
  const l = lang.toLowerCase();
  if (l.startsWith("pt")) return "BR";
  if (l.startsWith("es")) return "ES";
  if (l.startsWith("it")) return "IT";
  if (l.startsWith("en")) return "US";
  return undefined;
}
