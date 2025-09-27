// components/LanguageSwitcher.tsx
"use client";

import React from "react";
import { useLocale } from "@/context/LocaleProvider";

export const LanguageSwitcher: React.FC = () => {
  const { lang, setLang } = useLocale();
  const langs: Array<{ code: string; label: string }> = [
    { code: "en", label: "English" },
    { code: "pt", label: "Português" },
    { code: "es", label: "Español" },
    { code: "it", label: "Italiano" },
  ];

  return (
    <div style={{ display: "flex", gap: 8 }}>
      {langs.map((l) => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          style={{
            fontWeight: lang === l.code ? 700 : 400,
            border: "1px solid #ddd",
            borderRadius: 6,
            padding: "6px 10px",
            background: lang === l.code ? "#f5f5f5" : "white",
          }}
          aria-pressed={lang === l.code}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
};
