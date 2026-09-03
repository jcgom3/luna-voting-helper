"use client";

import { CalendarClock, X } from "lucide-react";
import { useState } from "react";

import { formatLocalizedDateTime } from "@/lib/dates/format";
import { getEstimatedNextVoteTime, type ReminderState } from "@/lib/reminder/storage";
import type { TranslationDictionary } from "@/lib/translations/en";
import type { Language } from "@/lib/types/language";

interface EstimatedNextVoteProps {
  language: Language;
  copy: TranslationDictionary["estimatedNextVote"];
  reminderState: ReminderState | null;
}

export function EstimatedNextVote({ language, copy, reminderState }: EstimatedNextVoteProps) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed || !reminderState?.lastMethodClick) return null;

  const estimate = getEstimatedNextVoteTime(reminderState.lastMethodClick);
  if (Number.isNaN(estimate.getTime())) return null;
  const message = copy.message.replace("{time}", formatLocalizedDateTime(estimate, language));

  return (
    <aside className="section-wrap pt-3" aria-label={copy.estimateLabel}>
      <div className="relative rounded-2xl border border-[#d9c8a8] bg-[#fff5d9] p-5 pr-12 shadow-sm">
        <button
          type="button"
          className="absolute right-3 top-3 grid size-11 place-items-center rounded-full text-[#5c4c2f] hover:bg-white/70"
          onClick={() => setDismissed(true)}
          aria-label={copy.dismiss}
        >
          <X aria-hidden="true" size={20} />
        </button>
        <div className="flex items-start gap-3">
          <CalendarClock aria-hidden="true" className="mt-1 shrink-0 text-[#7b5b22]" size={24} />
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-[#7b5b22]">{copy.estimateLabel}</p>
            <p className="mt-1 font-bold leading-7 text-[#3d321f]">{message}</p>
            <p className="mt-1 text-sm leading-6 text-[#665637]">{copy.estimateExplanation}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
