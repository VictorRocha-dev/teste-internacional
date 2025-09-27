import en from "../../locales/en.json";
import pt from "../../locales/pt.json";
import es from "../../locales/es.json";
import it from "../../locales/it.json";

type Dict = Record<string, unknown>;
const MAP: Record<string, Dict> = { en, pt, es, it };

export function t(key: string, lang: string) {
  const dict = MAP[lang] ?? MAP["en"];
  return deepGet(dict, key) ?? key;
}

function deepGet(obj: unknown, path: string): string | undefined {
  if (!obj || typeof obj !== "object") return undefined;
  return path
    .split(".")
    .reduce<any>((acc, part) => (acc ? acc[part] : undefined), obj);
}
