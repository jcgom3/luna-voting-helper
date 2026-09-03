import { en, type TranslationDictionary } from "@/lib/translations/en";
import { es } from "@/lib/translations/es";
import type { Language } from "@/lib/types/language";

export const translations: Record<Language, TranslationDictionary> = {
  en,
  es,
};

export type TranslationKey = keyof TranslationDictionary;

export function getTranslations(language: Language): TranslationDictionary {
  return translations[language];
}

type NestedKeys<T, Prefix extends string = ""> = T extends string
  ? Prefix extends ""
    ? never
    : Prefix
  : {
      [K in keyof T & string]: T[K] extends string
        ? `${Prefix}${K}`
        : NestedKeys<T[K], `${Prefix}${K}.`>;
    }[keyof T & string];

export type FlatTranslationKey = NestedKeys<TranslationDictionary>;

function flattenKeys(
  obj: Record<string, unknown>,
  prefix = "",
): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const next = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return flattenKeys(value as Record<string, unknown>, next);
    }
    return [next];
  });
}

export function getAllTranslationKeys(): string[] {
  return flattenKeys(en as unknown as Record<string, unknown>);
}

export function validateTranslationParity(): string[] {
  const enKeys = new Set(getAllTranslationKeys());
  const esKeys = new Set(
    flattenKeys(es as unknown as Record<string, unknown>),
  );
  const missingInEs = [...enKeys].filter((key) => !esKeys.has(key));
  const missingInEn = [...esKeys].filter((key) => !enKeys.has(key));
  return [...missingInEs, ...missingInEn];
}

export { en, es };
