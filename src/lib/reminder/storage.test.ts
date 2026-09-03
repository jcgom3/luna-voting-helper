import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  clearReminderState,
  getEstimatedNextVoteTime,
  isActiveReminderSchedule,
  readReminderState,
  recordVotingMethodClick,
  saveReminderSchedule,
} from "@/lib/reminder/storage";

describe("reminder storage", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useRealTimers();
  });

  it("stores only the reminder values used by the guide", () => {
    const click = new Date("2026-09-02T21:00:00.000Z");
    const first = new Date("2026-09-03T21:00:00.000Z");
    recordVotingMethodClick("facebook", click);
    saveReminderSchedule({ language: "es" });
    expect(readReminderState()).toEqual({
      lastMethodClick: click.toISOString(),
      selectedMethod: "facebook",
      reminderCreated: true,
      reminderLanguage: "es",
      firstReminderAt: first.toISOString(),
      reminderUid: "luna-vote-reminder-20260903T210000@voteforluna.local",
    });
    expect(Object.keys(localStorage).sort()).toEqual([
      "lunaVote.lastMethodClick",
      "lunaVote.reminderCreated",
      "lunaVote.reminderLanguage",
      "lunaVote.selectedMethod",
    ]);
    expect(getEstimatedNextVoteTime(click.toISOString()).toISOString()).toBe(first.toISOString());
  });

  it("recognizes and clears an active schedule", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-04T21:00:00.000Z"));
    expect(isActiveReminderSchedule("2026-09-03T21:00:00.000Z")).toBe(true);
    recordVotingMethodClick("text", new Date());
    clearReminderState();
    expect(readReminderState().selectedMethod).toBeNull();
  });
});
