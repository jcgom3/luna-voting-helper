import {
  SPANISH_SPEAKING_COUNTRIES,
  type Language,
} from "@/lib/types/language";

export interface LanguageDetectionInput {
  queryLang?: string | null;
  cookieLang?: string | null;
  cookieManual?: string | null;
  acceptLanguage?: string | null;
  countryCode?: string | null;
}

function isLanguage(value: string | null | undefined): value is Language {
  return value === "en" || value === "es";
}

function parseAcceptLanguage(header: string | null | undefined): Language | null {
  if (!header) {
    return null;
  }

  const primary = header.split(",")[0]?.trim().split(";")[0]?.trim().toLowerCase();
  if (!primary) {
    return null;
  }

  if (primary.startsWith("es")) {
    return "es";
  }

  if (primary.startsWith("en")) {
    return "en";
  }

  return null;
}

export function detectLanguage(input: LanguageDetectionInput): Language {
  if (isLanguage(input.queryLang)) {
    return input.queryLang;
  }

  if (input.cookieManual === "true" && isLanguage(input.cookieLang)) {
    return input.cookieLang;
  }

  const fromAccept = parseAcceptLanguage(input.acceptLanguage);
  if (fromAccept) {
    return fromAccept;
  }

  const country = input.countryCode?.toUpperCase();
  if (country && SPANISH_SPEAKING_COUNTRIES.has(country)) {
    return "es";
  }

  return "en";
}

export function getCountryFromHeaders(
  headers: Headers,
): string | null {
  return (
    headers.get("x-vercel-ip-country") ??
    headers.get("cf-ipcountry") ??
    headers.get("x-country-code") ??
    null
  );
}
