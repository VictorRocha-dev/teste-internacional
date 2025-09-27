// app/page.tsx
"use client";

import React from "react";
import { useLocale } from "@/context/LocaleProvider";
import { t } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { PricingCard } from "@/components/common/PricingCard";

export default function HomePage() {
  const { lang } = useLocale();

  return (
    <main style={{ padding: 24, maxWidth: 960, margin: "0 auto" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <h1 style={{ margin: 0 }}>{t("hero.title", lang)}</h1>
        <LanguageSwitcher />
      </header>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>{t("pricing.title", lang)}</h2>
        <p style={{ marginTop: 8, color: "#6b7280" }}>
          {t("pricing.subtitle", lang)}
        </p>
        <PricingCard />
      </section>
    </main>
  );
}
