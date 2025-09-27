// src/lib/locale.ts
export function regionToDefaultLang(region: string | undefined): string {
  const r = (region ?? "").toUpperCase();
  if (r === "BR") return "pt";
  if (r === "US") return "en";
  if (r === "EU") return "en"; // neutro p/ UE; ajuste se quiser "es"/"it"/"de" por host/mercado
  // alguns países europeus individuais (opcional)
  const ptCountries = ["PT"];
  if (ptCountries.includes(r)) return "pt";
  return "en";
}
