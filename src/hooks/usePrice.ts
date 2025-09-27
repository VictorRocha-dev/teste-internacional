// hooks/usePrice.ts
import { useMemo } from "react";
import { getPriceForRegion, type PriceInfo } from "@/lib/region";

function readCookie(name: string) {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}

export function usePrice(): PriceInfo {
  const region =
    typeof window !== "undefined"
      ? readCookie("region") ?? undefined
      : undefined;
  return useMemo(() => getPriceForRegion(region ?? undefined), [region]);
}
