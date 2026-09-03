import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ReminderSheet } from "@/components/ReminderSheet";
import { downloadCalendarFile } from "@/lib/reminder/download";
import { navigateToOfficialVoting } from "@/lib/reminder/navigation";
import { en } from "@/lib/translations/en";

vi.mock("@/lib/reminder/download", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/reminder/download")>();
  return { ...actual, downloadCalendarFile: vi.fn() };
});

vi.mock("@/lib/reminder/navigation", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/reminder/navigation")>();
  return { ...actual, navigateToOfficialVoting: vi.fn() };
});

const emptyState = {
  lastMethodClick: null,
  selectedMethod: null,
  reminderCreated: false,
  reminderLanguage: null,
  firstReminderAt: null,
  reminderUid: null,
};

describe("ReminderSheet", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.mocked(downloadCalendarFile).mockResolvedValue({ success: true });
  });

  it("creates the first reminder 24 hours after the click and continues", async () => {
    const clickedAt = new Date("2026-09-02T21:00:00.000Z");
    render(
      <ReminderSheet
        open
        language="en"
        method="facebook"
        clickedAt={clickedAt}
        reminderState={emptyState}
        copy={en.reminderSheet}
        onClose={vi.fn()}
        onStateChange={vi.fn()}
      />,
    );

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: "Add Reminders and Continue" }),
      );
    });
    expect(downloadCalendarFile).toHaveBeenCalledWith(
      expect.objectContaining({
        firstReminderAt: new Date("2026-09-03T21:00:00.000Z"),
        language: "en",
      }),
    );
    act(() => vi.advanceTimersByTime(700));
    expect(navigateToOfficialVoting).toHaveBeenCalledWith("facebook");
  });

  it("continues without generating a reminder", () => {
    render(
      <ReminderSheet
        open
        language="en"
        method="text"
        clickedAt={new Date("2026-09-02T21:00:00.000Z")}
        reminderState={emptyState}
        copy={en.reminderSheet}
        onClose={vi.fn()}
        onStateChange={vi.fn()}
      />,
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Continue Without Reminders" }),
    );
    expect(downloadCalendarFile).not.toHaveBeenCalled();
    expect(navigateToOfficialVoting).toHaveBeenCalledWith("text");
  });

  it("closes with Escape", () => {
    const onClose = vi.fn();
    render(
      <ReminderSheet
        open
        language="en"
        method="text"
        clickedAt={new Date("2026-09-02T21:00:00.000Z")}
        reminderState={emptyState}
        copy={en.reminderSheet}
        onClose={onClose}
        onStateChange={vi.fn()}
      />,
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
  });
});
