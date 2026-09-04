import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { downloadCalendarFile } from "@/lib/reminder/download";

const reminderOptions = {
  firstReminderAt: new Date(
    "2026-09-03T21:00:00.000Z",
  ),
  uid: "luna-test@voteforluna.local",
  language: "en" as const,
};

describe("calendar delivery", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("opens the HTTPS calendar endpoint without invoking the Share Sheet", async () => {
    const anchorClick = vi
      .spyOn(
        HTMLAnchorElement.prototype,
        "click",
      )
      .mockImplementation(() => undefined);

    const navigatorShare = vi.fn();

    Object.defineProperty(
      navigator,
      "share",
      {
        configurable: true,
        value: navigatorShare,
      },
    );

    const result =
      await downloadCalendarFile(
        reminderOptions,
      );

    expect(result).toEqual({
      success: true,
      delivery: "calendar-preview",
    });

    expect(
      anchorClick,
    ).toHaveBeenCalledOnce();

    expect(
      navigatorShare,
    ).not.toHaveBeenCalled();

    const clickedAnchor =
      anchorClick.mock
        .instances[0] as HTMLAnchorElement;

    const calendarUrl = new URL(
      clickedAnchor.href,
    );

    expect(calendarUrl.pathname).toBe(
      "/api/reminders/calendar.ics",
    );

    expect(
      calendarUrl.searchParams.get("start"),
    ).toBe("2026-09-03T21:00:00.000Z");

    expect(
      calendarUrl.searchParams.get("uid"),
    ).toBe(
      "luna-test@voteforluna.local",
    );

    expect(
      calendarUrl.searchParams.get(
        "language",
      ),
    ).toBe("en");

    expect(
      clickedAnchor.hasAttribute("download"),
    ).toBe(false);

    expect(
      document.body.contains(clickedAnchor),
    ).toBe(false);
  });

  it("reports invalid reminder time without opening anything", async () => {
    const anchorClick = vi
      .spyOn(
        HTMLAnchorElement.prototype,
        "click",
      )
      .mockImplementation(() => undefined);

    const result =
      await downloadCalendarFile({
        ...reminderOptions,
        firstReminderAt: new Date(
          Number.NaN,
        ),
      });

    expect(result).toEqual({
      success: false,
      error: "calendar-generation-failed",
    });

    expect(
      anchorClick,
    ).not.toHaveBeenCalled();
  });

  it("reports a forced failure for deterministic UI testing", async () => {
    await expect(
      downloadCalendarFile({
        ...reminderOptions,
        forceFailure: true,
      }),
    ).resolves.toEqual({
      success: false,
      error: "forced-failure",
    });
  });

  it("removes the temporary link if opening the calendar fails", async () => {
    const anchorClick = vi
      .spyOn(
        HTMLAnchorElement.prototype,
        "click",
      )
      .mockImplementation(() => {
        throw new Error(
          "navigation blocked",
        );
      });

    const result =
      await downloadCalendarFile(
        reminderOptions,
      );

    expect(result).toEqual({
      success: false,
      error: "download-failed",
    });

    expect(
      anchorClick,
    ).toHaveBeenCalledOnce();

    expect(
      document.querySelector(
        'a[href*="calendar.ics"]',
      ),
    ).toBeNull();
  });
});