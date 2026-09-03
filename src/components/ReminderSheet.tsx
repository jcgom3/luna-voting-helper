"use client";

import { CalendarPlus, ExternalLink, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { formatLocalizedDateTime } from "@/lib/dates/format";
import { downloadCalendarFile, getFirstReminderTime } from "@/lib/reminder/download";
import { navigateToOfficialVoting } from "@/lib/reminder/navigation";
import {
  clearReminderState,
  isActiveReminderSchedule,
  readReminderState,
  saveReminderSchedule,
  type ReminderState,
} from "@/lib/reminder/storage";
import { generateReminderUid } from "@/lib/reminder/uid";
import type { TranslationDictionary } from "@/lib/translations/en";
import type { Language } from "@/lib/types/language";
import type { VotingMethod } from "@/lib/types/voting-method";

interface ReminderSheetProps {
  open: boolean;
  language: Language;
  method: VotingMethod | null;
  clickedAt: Date | null;
  reminderState: ReminderState | null;
  copy: TranslationDictionary["reminderSheet"];
  onClose: () => void;
  onStateChange: (state: ReminderState) => void;
}

export function ReminderSheet({
  open,
  language,
  method,
  clickedAt,
  reminderState,
  copy,
  onClose,
  onStateChange,
}: ReminderSheetProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [working, setWorking] = useState(false);
  const [status, setStatus] = useState<"idle" | "error" | "cleared">("idle");

  const activeSchedule = Boolean(
    reminderState?.reminderCreated &&
      reminderState.firstReminderAt &&
      reminderState.reminderUid &&
      isActiveReminderSchedule(reminderState.firstReminderAt),
  );

  const close = useCallback(() => {
    if (!working) onClose();
  }, [onClose, working]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusable = () =>
      Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );
    window.requestAnimationFrame(() => focusable()[0]?.focus());

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusable();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [close, open]);

  if (!open || !method || !clickedAt) return null;

  const existingFirst = activeSchedule && reminderState?.firstReminderAt
    ? new Date(reminderState.firstReminderAt)
    : null;
  const existingMessage = existingFirst && !Number.isNaN(existingFirst.getTime())
    ? copy.existingSchedule.replace(
        "{time}",
        formatLocalizedDateTime(existingFirst, language),
      )
    : null;

  async function createOrDownloadReminder() {
    if (!method || !clickedAt) return;
    setWorking(true);
    setStatus("idle");

    const firstReminderAt = existingFirst ?? getFirstReminderTime(clickedAt);
    const uid = activeSchedule && reminderState?.reminderUid
      ? reminderState.reminderUid
      : generateReminderUid(firstReminderAt);
    const result = await downloadCalendarFile({ firstReminderAt, uid, language });

    if (!result.success) {
      setWorking(false);
      setStatus("error");
      return;
    }

    saveReminderSchedule({ language });
    onStateChange(readReminderState());
    window.setTimeout(() => navigateToOfficialVoting(method), 700);
  }

  function continueWithoutReminder() {
    navigateToOfficialVoting(method!);
  }

  function clearLocalReminder() {
    clearReminderState();
    onStateChange(readReminderState());
    setStatus("cleared");
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-[#17243d]/65 p-0 backdrop-blur-sm sm:place-items-center sm:p-6" onMouseDown={(event) => event.target === event.currentTarget && close()}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reminder-title"
        aria-describedby="reminder-description"
        className="max-h-[92vh] w-full overflow-y-auto rounded-t-[1.75rem] bg-white p-6 shadow-2xl sm:max-w-xl sm:rounded-[1.75rem] sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#eee5f5] text-[#5f3d88]">
            <CalendarPlus aria-hidden="true" size={25} />
          </span>
          <button type="button" className="grid size-11 place-items-center rounded-full text-[#566078] hover:bg-[#f5f1f7]" onClick={close} disabled={working} aria-label={copy.close}>
            <X aria-hidden="true" size={22} />
          </button>
        </div>
        <h2 id="reminder-title" className="mt-5 text-3xl font-black tracking-tight">{copy.heading}</h2>
        <p id="reminder-description" className="mt-3 text-lg leading-7 text-[#566078]">{copy.text}</p>

        {existingMessage ? (
          <div className="mt-5 rounded-2xl border border-[#cdbfd7] bg-[#f7f2fa] p-4 font-semibold leading-7 text-[#4e3a65]">
            {existingMessage}
          </div>
        ) : null}

        <p className="mt-5 rounded-2xl bg-[#fff5d9] p-4 text-sm leading-6 text-[#5c4c2f]">{copy.accuracyNotice}</p>
        <p className="mt-4 text-sm leading-6 text-[#566078]">{copy.helper}</p>

        <div className="mt-6 grid gap-3">
          <button type="button" className="primary-button w-full" onClick={createOrDownloadReminder} disabled={working}>
            <CalendarPlus aria-hidden="true" size={20} />
            {activeSchedule ? copy.downloadAgain : copy.addAndContinue}
          </button>
          <button type="button" className="secondary-button w-full" onClick={continueWithoutReminder} disabled={working}>
            {copy.continueWithout}
            <ExternalLink aria-hidden="true" size={18} />
          </button>
          {activeSchedule ? (
            <button type="button" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 font-semibold text-[#7b334d] hover:bg-[#fff0f4]" onClick={clearLocalReminder} disabled={working}>
              <Trash2 aria-hidden="true" size={18} />
              {copy.clearLocal}
            </button>
          ) : null}
        </div>
        <p className={`mt-4 min-h-6 text-sm font-semibold ${status === "error" ? "text-[#a12643]" : "text-[#3c6b4d]"}`} role="status" aria-live="polite">
          {status === "error" ? copy.calendarError : status === "cleared" ? copy.clearLocalSuccess : ""}
        </p>
        {status === "error" ? (
          <button type="button" className="secondary-button w-full" onClick={createOrDownloadReminder}>{copy.tryAgain}</button>
        ) : null}
      </div>
    </div>
  );
}
