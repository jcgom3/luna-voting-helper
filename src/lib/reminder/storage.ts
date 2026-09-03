import type { Language } from "@/lib/types/language";
import type { VotingMethod } from "@/lib/types/voting-method";
import { generateReminderUid } from "@/lib/reminder/uid";

export const REMINDER_KEYS = {
  lastMethodClick: "lunaVote.lastMethodClick",
  selectedMethod: "lunaVote.selectedMethod",
  reminderCreated: "lunaVote.reminderCreated",
  reminderLanguage: "lunaVote.reminderLanguage",
} as const;

export interface ReminderState {
  lastMethodClick: string | null;
  selectedMethod: VotingMethod | null;
  reminderCreated: boolean;
  reminderLanguage: Language | null;
  firstReminderAt: string | null;
  reminderUid: string | null;
}

const EMPTY_STATE: ReminderState = {
  lastMethodClick: null,
  selectedMethod: null,
  reminderCreated: false,
  reminderLanguage: null,
  firstReminderAt: null,
  reminderUid: null,
};

function isVotingMethod(value: string | null): value is VotingMethod {
  return value === "facebook" || value === "text";
}

function isLanguage(value: string | null): value is Language {
  return value === "en" || value === "es";
}

export function readReminderState(): ReminderState {
  if (typeof window === "undefined") {
    return EMPTY_STATE;
  }

  const selectedMethod = localStorage.getItem(REMINDER_KEYS.selectedMethod);
  const reminderLanguage = localStorage.getItem(REMINDER_KEYS.reminderLanguage);
  const lastMethodClick = localStorage.getItem(REMINDER_KEYS.lastMethodClick);
  const derivedFirstReminder = lastMethodClick
    ? getEstimatedNextVoteTime(lastMethodClick)
    : null;
  const validFirstReminder =
    derivedFirstReminder && !Number.isNaN(derivedFirstReminder.getTime())
      ? derivedFirstReminder
      : null;

  return {
    lastMethodClick,
    selectedMethod: isVotingMethod(selectedMethod) ? selectedMethod : null,
    reminderCreated: localStorage.getItem(REMINDER_KEYS.reminderCreated) === "true",
    reminderLanguage: isLanguage(reminderLanguage) ? reminderLanguage : null,
    firstReminderAt: validFirstReminder?.toISOString() ?? null,
    reminderUid: validFirstReminder ? generateReminderUid(validFirstReminder) : null,
  };
}

export function recordVotingMethodClick(
  method: VotingMethod,
  clickedAt: Date,
): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(REMINDER_KEYS.lastMethodClick, clickedAt.toISOString());
  localStorage.setItem(REMINDER_KEYS.selectedMethod, method);
}

export function saveReminderSchedule(options: {
  language: Language;
}): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(REMINDER_KEYS.reminderLanguage, options.language);
  localStorage.setItem(REMINDER_KEYS.reminderCreated, "true");
}

export function clearReminderState(): void {
  if (typeof window === "undefined") {
    return;
  }

  Object.values(REMINDER_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
}

export function getEstimatedNextVoteTime(lastMethodClick: string): Date {
  return new Date(new Date(lastMethodClick).getTime() + 24 * 60 * 60 * 1000);
}

const OCCURRENCE_COUNT = 8;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function isActiveReminderSchedule(firstReminderAt: string): boolean {
  const first = new Date(firstReminderAt);
  const lastOccurrenceStart = new Date(
    first.getTime() + (OCCURRENCE_COUNT - 1) * MS_PER_DAY,
  );
  return Date.now() <= lastOccurrenceStart.getTime() + MS_PER_DAY;
}
