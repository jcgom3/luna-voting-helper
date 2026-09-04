import { generateReminderUid } from "@/lib/reminder/uid";
import type { Language } from "@/lib/types/language";
import type { VotingMethod } from "@/lib/types/voting-method";

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

function getLocalStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function isVotingMethod(
  value: string | null,
): value is VotingMethod {
  return value === "facebook" || value === "text";
}

function isLanguage(
  value: string | null,
): value is Language {
  return value === "en" || value === "es";
}

export function readReminderState(): ReminderState {
  const storage = getLocalStorage();

  if (!storage) {
    return { ...EMPTY_STATE };
  }

  let selectedMethod: string | null;
  let reminderLanguage: string | null;
  let lastMethodClick: string | null;
  let reminderCreated: boolean;

  try {
    selectedMethod = storage.getItem(
      REMINDER_KEYS.selectedMethod,
    );

    reminderLanguage = storage.getItem(
      REMINDER_KEYS.reminderLanguage,
    );

    lastMethodClick = storage.getItem(
      REMINDER_KEYS.lastMethodClick,
    );

    reminderCreated =
      storage.getItem(REMINDER_KEYS.reminderCreated) ===
      "true";
  } catch {
    return { ...EMPTY_STATE };
  }

  const derivedFirstReminder = lastMethodClick
    ? getEstimatedNextVoteTime(lastMethodClick)
    : null;

  const validFirstReminder =
    derivedFirstReminder &&
    !Number.isNaN(derivedFirstReminder.getTime())
      ? derivedFirstReminder
      : null;

  return {
    lastMethodClick,
    selectedMethod: isVotingMethod(selectedMethod)
      ? selectedMethod
      : null,
    reminderCreated,
    reminderLanguage: isLanguage(reminderLanguage)
      ? reminderLanguage
      : null,
    firstReminderAt:
      validFirstReminder?.toISOString() ?? null,
    reminderUid: validFirstReminder
      ? generateReminderUid(validFirstReminder)
      : null,
  };
}

export function recordVotingMethodClick(
  method: VotingMethod,
  clickedAt: Date,
): boolean {
  const storage = getLocalStorage();

  if (!storage) {
    return false;
  }

  try {
    storage.setItem(
      REMINDER_KEYS.lastMethodClick,
      clickedAt.toISOString(),
    );

    storage.setItem(
      REMINDER_KEYS.selectedMethod,
      method,
    );

    return true;
  } catch {
    return false;
  }
}

export function saveReminderSchedule(options: {
  language: Language;
}): boolean {
  const storage = getLocalStorage();

  if (!storage) {
    return false;
  }

  try {
    storage.setItem(
      REMINDER_KEYS.reminderLanguage,
      options.language,
    );

    storage.setItem(
      REMINDER_KEYS.reminderCreated,
      "true",
    );

    return true;
  } catch {
    return false;
  }
}

export function clearReminderState(): boolean {
  const storage = getLocalStorage();

  if (!storage) {
    return false;
  }

  try {
    Object.values(REMINDER_KEYS).forEach((key) => {
      storage.removeItem(key);
    });

    return true;
  } catch {
    return false;
  }
}

export function getEstimatedNextVoteTime(
  lastMethodClick: string,
): Date {
  return new Date(
    new Date(lastMethodClick).getTime() +
      24 * 60 * 60 * 1000,
  );
}

const OCCURRENCE_COUNT = 8;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function isActiveReminderSchedule(
  firstReminderAt: string,
): boolean {
  const first = new Date(firstReminderAt);

  const lastOccurrenceStart = new Date(
    first.getTime() +
      (OCCURRENCE_COUNT - 1) * MS_PER_DAY,
  );

  return (
    Date.now() <=
    lastOccurrenceStart.getTime() + MS_PER_DAY
  );
}