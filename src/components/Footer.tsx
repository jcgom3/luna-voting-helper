import { ExternalLink, Heart } from "lucide-react";

import { officialLinks } from "@/config/officialLinks";
import type { TranslationDictionary } from "@/lib/translations/en";
import type { Language } from "@/lib/types/language";
import { LanguageToggle } from "@/components/LanguageToggle";

interface FooterProps {
  language: Language;
  copy: TranslationDictionary;
  onLanguageChange: (language: Language) => void;
}

export function Footer({ language, copy, onLanguageChange }: FooterProps) {
  const links = [
    [copy.footer.profile, officialLinks.profile],
    [copy.footer.rules, officialLinks.rules],
    [copy.footer.support, officialLinks.support],
  ] as const;

  return (
    <footer className="mt-12 border-t border-[#e2d9e7] bg-white/80 py-10">
      <div className="section-wrap text-center">
        <div className="flex items-center justify-center gap-2 text-lg font-extrabold text-[#5f3d88]">
          <Heart aria-hidden="true" className="fill-[#d45d79] text-[#d45d79]" size={19} />
          {copy.header.logo}
        </div>
        <nav className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-3" aria-label="Official links">
          {links.map(([label, href]) => (
            <a key={href} className="inline-flex min-h-11 items-center gap-1 font-semibold text-[#5f3d88] underline-offset-4 hover:underline" href={href}>
              {label}<ExternalLink aria-hidden="true" size={15} />
            </a>
          ))}
        </nav>
        <div className="mt-6">
          <LanguageToggle
            language={language}
            englishLabel={copy.header.languageEnglish}
            spanishLabel={copy.header.languageSpanish}
            onChange={onLanguageChange}
          />
        </div>
        <p className="mx-auto mt-6 max-w-3xl text-sm leading-6 text-[#697187]">{copy.footer.disclaimer}</p>
      </div>
    </footer>
  );
}
