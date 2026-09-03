import type { Language } from "@/lib/types/language";

interface LanguageToggleProps {
  language: Language;
  englishLabel: string;
  spanishLabel: string;
  onChange: (language: Language) => void;
}

export function LanguageToggle({
  language,
  englishLabel,
  spanishLabel,
  onChange,
}: LanguageToggleProps) {
  return (
    <div
      className="inline-flex rounded-full border border-[#cdbfd7] bg-white p-1 shadow-sm"
      role="group"
      aria-label="Language / Idioma"
    >
      {([["en", englishLabel], ["es", spanishLabel]] as const).map(
        ([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => onChange(value)}
            aria-pressed={language === value}
            className={`min-h-11 rounded-full px-3 text-sm font-bold transition-colors sm:px-4 ${
              language === value
                ? "bg-[#5f3d88] text-white"
                : "text-[#4e3a65] hover:bg-[#f5eff9]"
            }`}
          >
            {label}
          </button>
        ),
      )}
    </div>
  );
}
