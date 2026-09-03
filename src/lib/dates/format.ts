import type { Language } from "@/lib/types/language";

const LOCALE_MAP: Record<Language, string> = {
  en: "en-US",
  es: "es-US",
};

export function formatLocalizedDateTime(date: Date, language: Language): string {
  return new Intl.DateTimeFormat(LOCALE_MAP[language], {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(date);
}

export function getDateLocale(language: Language): string {
  return LOCALE_MAP[language];
}
