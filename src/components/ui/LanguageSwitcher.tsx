"use client";

import { useLanguageStore } from "@/i18n";

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguageStore();

  return (
    <button
      onClick={() => setLocale(locale === "en" ? "hi" : "en")}
      className="flex items-center gap-1.5 rounded-md border border-blue-700 bg-blue-800 px-3 py-1.5 text-sm font-medium text-blue-100 transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      aria-label={locale === "en" ? "Switch to Hindi" : "Switch to English"}
      title={locale === "en" ? "हिंदी में बदलें" : "Switch to English"}
    >
      {locale === "en" ? (
        <>
          <span className="text-base">अ</span>
          <span>हिंदी</span>
        </>
      ) : (
        <>
          <span className="text-base font-semibold">A</span>
          <span>English</span>
        </>
      )}
    </button>
  );
}
