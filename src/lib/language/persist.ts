import {
  LANGUAGE_COOKIE,
  LANGUAGE_MANUAL_COOKIE,
  type Language,
} from "@/lib/types/language";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export function persistLanguagePreference(
  language: Language,
  manual: boolean,
): void {
  document.cookie = `${LANGUAGE_COOKIE}=${language}; path=/; max-age=${ONE_YEAR_SECONDS}; SameSite=Lax`;
  document.cookie = `${LANGUAGE_MANUAL_COOKIE}=${manual ? "true" : "false"}; path=/; max-age=${ONE_YEAR_SECONDS}; SameSite=Lax`;
}
