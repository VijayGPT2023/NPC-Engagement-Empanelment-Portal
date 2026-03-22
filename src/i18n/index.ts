import { create } from "zustand";
import { persist } from "zustand/middleware";
import en from "./en.json";
import hi from "./hi.json";

export type Locale = "en" | "hi";

type Translations = typeof en;

const translations: Record<Locale, Translations> = { en, hi };

interface LanguageState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      locale: "en",
      setLocale: (locale) => set({ locale }),
    }),
    { name: "npc-language" }
  )
);

// Deep access helper: t("home.heroTitle") → translations[locale].home.heroTitle
function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split(".");
  let current: unknown = obj;
  for (const key of keys) {
    if (current && typeof current === "object" && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return path; // fallback to key if not found
    }
  }
  return typeof current === "string" ? current : path;
}

export function useTranslation() {
  const { locale } = useLanguageStore();

  const t = (key: string): string => {
    return getNestedValue(
      translations[locale] as unknown as Record<string, unknown>,
      key
    );
  };

  return { t, locale };
}

// Server-side helper (for non-hook contexts)
export function getTranslation(locale: Locale = "en") {
  return (key: string): string => {
    return getNestedValue(
      translations[locale] as unknown as Record<string, unknown>,
      key
    );
  };
}
