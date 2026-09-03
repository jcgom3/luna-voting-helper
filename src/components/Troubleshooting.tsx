import {
  ExternalLink,
  HelpCircle,
} from "lucide-react";

import { officialLinks } from "@/config/officialLinks";
import type { TranslationDictionary } from "@/lib/translations/en";

interface TroubleshootingProps {
  copy: TranslationDictionary["troubleshooting"];
}

export function Troubleshooting({
  copy,
}: TroubleshootingProps) {
  return (
    <section
      className="section-wrap py-10"
      aria-labelledby="troubleshooting-heading"
    >
      <div className="flex items-center justify-center gap-3">
        <HelpCircle
          aria-hidden="true"
          className="text-[#7d5ba6]"
          size={30}
        />

        <h2
          id="troubleshooting-heading"
          className="section-title text-center"
        >
          {copy.heading}
        </h2>
      </div>

      <div className="mx-auto mt-7 max-w-3xl space-y-3">
        {copy.items.map((item) => {
          const supportButton =
            "supportButton" in item &&
            typeof item.supportButton === "string"
              ? item.supportButton
              : null;

          return (
            <details
              key={item.question}
              className="section-card group overflow-hidden"
            >
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-bold marker:hidden">
                {item.question}

                <span
                  aria-hidden="true"
                  className="text-2xl font-light text-[#7d5ba6] transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>

              <div className="border-t border-[#eee7f1] px-5 py-5 leading-7 text-[#566078]">
                <p>{item.answer}</p>

                {supportButton ? (
                  <a
                    className="secondary-button mt-4"
                    href={officialLinks.support}
                  >
                    {supportButton}

                    <ExternalLink
                      aria-hidden="true"
                      size={17}
                    />
                  </a>
                ) : null}
              </div>
            </details>
          );
        })}
      </div>
    </section>
  );
}