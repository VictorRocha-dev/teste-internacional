// components/PricingCard.tsx
"use client";

import React from "react";
import { usePrice } from "@/hooks/usePrice";
import { useLocale } from "@/context/LocaleProvider";
import { regionToLocale } from "@/lib/region";

export const PricingCard: React.FC = () => {
  const price = usePrice();
  const { region } = useLocale();

  const formatted = new Intl.NumberFormat(regionToLocale(region), {
    style: "currency",
    currency: price.currency,
    maximumFractionDigits: 2,
  }).format(price.amount);

  return (
    <div style={{ border: "1px solid #e5e7eb", padding: 16, borderRadius: 8 }}>
      <h3 style={{ margin: 0 }}>Plan — {price.label ?? price.region}</h3>
      <p style={{ fontSize: 24, margin: "8px 0" }}>{formatted}</p>
      <small>Detected region: {region.toUpperCase()}</small>
    </div>
  );
};
