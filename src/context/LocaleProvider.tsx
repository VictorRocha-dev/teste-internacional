// context/LocaleProvider.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type LocaleCtx = {
  lang: string;
  setLang: (l: string) => void;
  region: string;
  currency: string;
};

const LocaleContext = createContext<LocaleCtx>({
  lang: "en",
  setLang: () => {},
  region: "US",
  currency: "USD",
});

function readCookie(name: string) {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}

export const LocaleProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [lang, setLangState] = useState("en");
  const [region, setRegion] = useState("US");
  const [currency, setCurrency] = useState("USD");

  useEffect(() => {
    setLangState(readCookie("lang") ?? "en");
    setRegion(readCookie("region") ?? "US");
    setCurrency(readCookie("currency") ?? "USD");
  }, []);

  const setLang = (l: string) => {
    document.cookie = `lang=${encodeURIComponent(l)}; path=/; max-age=${
      60 * 60 * 24 * 365
    }`;
    setLangState(l);
  };

  return (
    <LocaleContext.Provider value={{ lang, setLang, region, currency }}>
      {children}
    </LocaleContext.Provider>
  );
};

export const useLocale = () => useContext(LocaleContext);
