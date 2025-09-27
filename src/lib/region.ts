// lib/region.ts
export type RegionCode = "BR" | "US" | "EU" | string;
export type Currency = "BRL" | "USD" | "EUR" | string;

export type PriceInfo = {
  region: RegionCode;
  currency: Currency;
  amount: number;
  label?: string;
};

export const PRICE_MAP: PriceInfo[] = [
  { region: "BR", currency: "BRL", amount: 30, label: "Brazil" },
  { region: "US", currency: "USD", amount: 10, label: "United States" },
  { region: "EU", currency: "EUR", amount: 10, label: "Europe" },
];

export function getPriceForRegion(region?: string): PriceInfo {
  if (!region) return PRICE_MAP.find((p) => p.region === "US")!;
  const found = PRICE_MAP.find((p) => p.region === region.toUpperCase());
  if (found) return found;

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
  if (eu.includes(region.toUpperCase()))
    return PRICE_MAP.find((p) => p.region === "EU")!;

  return PRICE_MAP.find((p) => p.region === "US")!;
}

// Locale para formatar moeda por REGIÃO (idioma não afeta valor)
export function regionToLocale(region: string): string {
  const r = region.toUpperCase();
  if (r === "BR") return "pt-BR";
  if (r === "US") return "en-US";
  if (r === "EU") return "de-DE"; // qualquer locale europeu serve para EUR
  return "en-US";
}
