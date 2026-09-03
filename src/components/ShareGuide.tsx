"use client";

import { Check, Share2 } from "lucide-react";
import { useState } from "react";

import type { TranslationDictionary } from "@/lib/translations/en";

interface ShareGuideProps {
  copy: TranslationDictionary["share"];
}

export function ShareGuide({ copy }: ShareGuideProps) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");

  async function shareGuide() {
    try {
      if (navigator.share) {
        await navigator.share({ title: copy.title, text: copy.text, url: window.location.href });
        setStatus("idle");
        return;
      }
      await navigator.clipboard.writeText(window.location.href);
      setStatus("copied");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setStatus("error");
    }
  }

  return (
    <div className="text-center">
      <button type="button" className="secondary-button" onClick={shareGuide}>
        {status === "copied" ? <Check aria-hidden="true" size={19} /> : <Share2 aria-hidden="true" size={19} />}
        {copy.button}
      </button>
      <p className="mt-2 min-h-6 text-sm text-[#566078]" aria-live="polite">
        {status === "copied" ? copy.copied : status === "error" ? copy.error : ""}
      </p>
    </div>
  );
}
