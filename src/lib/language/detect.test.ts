import { describe, expect, it } from "vitest";

import { detectLanguage } from "@/lib/language/detect";

describe("detectLanguage", () => {
  it("gives an explicit query parameter highest priority", () => {
    expect(detectLanguage({ queryLang: "es", cookieLang: "en", cookieManual: "true" })).toBe("es");
  });

  it("honors a manually selected cookie language", () => {
    expect(detectLanguage({ cookieLang: "es", cookieManual: "true", acceptLanguage: "en-US" })).toBe("es");
  });

  it("detects Spanish from the preferred request language", () => {
    expect(detectLanguage({ acceptLanguage: "es-US,es;q=0.9,en;q=0.8" })).toBe("es");
  });

  it("uses a Spanish-speaking country when no known language is available", () => {
    expect(detectLanguage({ acceptLanguage: "fr-FR", countryCode: "MX" })).toBe("es");
  });

  it("falls back to English", () => {
    expect(detectLanguage({})).toBe("en");
  });
});
