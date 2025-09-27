"use client";

import React, { createContext, useContext, useState } from "react";

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

type Props = {
  initial: { lang: string; region: string; currency: string };
  children: React.ReactNode;
};

export const LocaleProvider: React.FC<Props> = ({ initial, children }) => {
  // já entra com o valor do SSR → sem flash
  const [lang, setLangState] = useState(initial.lang);
  const region = initial.region;
  const currency = initial.currency;

  const setLang = (l: string) => {
    document.cookie = `lang=${encodeURIComponent(l)}; path=/; max-age=${
      60 * 60 * 24 * 365
    }; samesite=lax`;
    setLangState(l);
  };

  return (
    <LocaleContext.Provider value={{ lang, setLang, region, currency }}>
      {children}
    </LocaleContext.Provider>
  );
};

export const useLocale = () => useContext(LocaleContext);
