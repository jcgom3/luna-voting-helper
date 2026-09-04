import {
  afterEach,
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

function setShareApis(options?: {
  canShare?: (data?: ShareData) => boolean;
  share?: (data?: ShareData) => Promise<void>;
}) {
  Object.defineProperty(navigator, "canShare", {
    configurable: true,
    value: options?.canShare,
  });

  Object.defineProperty(navigator, "share", {
    configurable: true,
    value: options?.share,
  });
}

describe("calendar delivery", () => {
  const createObjectUrl = vi.fn(
    () => "blob:luna-reminder",
  );

  const revokeObjectUrl = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    setShareApis();

    createObjectUrl.mockClear();
    revokeObjectUrl.mockClear();

    Object.defineProperty(
      URL,
      "createObjectURL",
      {
        configurable: true,
        value: createObjectUrl,
      },
    );

    Object.defineProperty(
      URL,
      "revokeObjectURL",
      {
        configurable: true,
        value: revokeObjectUrl,
      },
    );
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("prefers native file sharing when the browser supports calendar files", async () => {
    const canShare = vi.fn(() => true);

    const share = vi
      .fn<(data?: ShareData) => Promise<void>>()
      .mockResolvedValue(undefined);

    const anchorClick = vi
      .spyOn(
        HTMLAnchorElement.prototype,
        "click",
      )
      .mockImplementation(() => undefined);

    setShareApis({
      canShare,
      share,
    });

    const result =
      await downloadCalendarFile(
        reminderOptions,
      );

    expect(result).toEqual({
      success: true,
      delivery: "file-share",
    });

    expect(canShare).toHaveBeenCalledOnce();
    expect(share).toHaveBeenCalledOnce();

    const sharedFile =
      share.mock.calls[0][0]?.files?.[0];

    expect(sharedFile).toBeInstanceOf(File);

    expect(sharedFile?.name).toBe(
      "vote-for-luna-reminders.ics",
    );

    expect(sharedFile?.type).toBe(
      "text/calendar;charset=utf-8",
    );

    expect(
      await sharedFile?.text(),
    ).toContain(
      "RRULE:FREQ=DAILY;INTERVAL=1;COUNT=8",
    );

    expect(
      createObjectUrl,
    ).not.toHaveBeenCalled();

    expect(
      anchorClick,
    ).not.toHaveBeenCalled();
  });

  it("uses a Blob download when file sharing is unavailable", async () => {
    const anchorClick = vi
      .spyOn(
        HTMLAnchorElement.prototype,
        "click",
      )
      .mockImplementation(() => undefined);

    const result =
      await downloadCalendarFile(
        reminderOptions,
      );

    expect(result).toEqual({
      success: true,
      delivery: "download",
    });

    expect(
      createObjectUrl,
    ).toHaveBeenCalledOnce();

    expect(
      anchorClick,
    ).toHaveBeenCalledOnce();

    expect(
      document.querySelector(
        'a[download="vote-for-luna-reminders.ics"]',
      ),
    ).not.toBeInTheDocument();

    expect(
      revokeObjectUrl,
    ).not.toHaveBeenCalled();

    vi.advanceTimersByTime(60_000);

    expect(
      revokeObjectUrl,
    ).toHaveBeenCalledWith(
      "blob:luna-reminder",
    );
  });

  it("falls back to download when canShare throws", async () => {
    const anchorClick = vi
      .spyOn(
        HTMLAnchorElement.prototype,
        "click",
      )
      .mockImplementation(() => undefined);

    setShareApis({
      canShare: () => {
        throw new Error(
          "broken capability probe",
        );
      },
      share: vi.fn(
        async () => undefined,
      ),
    });

    const result =
      await downloadCalendarFile(
        reminderOptions,
      );

    expect(result).toEqual({
      success: true,
      delivery: "download",
    });

    expect(
      anchorClick,
    ).toHaveBeenCalledOnce();
  });

  it("falls back to download when an advertised share operation fails", async () => {
    const anchorClick = vi
      .spyOn(
        HTMLAnchorElement.prototype,
        "click",
      )
      .mockImplementation(() => undefined);

    setShareApis({
      canShare: () => true,
      share: vi.fn(async () => {
        throw new Error(
          "embedded browser rejected file sharing",
        );
      }),
    });

    const result =
      await downloadCalendarFile(
        reminderOptions,
      );

    expect(result).toEqual({
      success: true,
      delivery: "download",
    });

    expect(
      anchorClick,
    ).toHaveBeenCalledOnce();
  });

  it("does not download a second copy when the visitor cancels native sharing", async () => {
    const abortError = new Error("cancelled");
    abortError.name = "AbortError";

    const anchorClick = vi
      .spyOn(
        HTMLAnchorElement.prototype,
        "click",
      )
      .mockImplementation(() => undefined);

    setShareApis({
      canShare: () => true,
      share: vi.fn(async () => {
        throw abortError;
      }),
    });

    const result =
      await downloadCalendarFile(
        reminderOptions,
      );

    expect(result).toEqual({
      success: false,
      error: "share-cancelled",
    });

    expect(
      createObjectUrl,
    ).not.toHaveBeenCalled();

    expect(
      anchorClick,
    ).not.toHaveBeenCalled();
  });

  it("reports unsupported delivery APIs without throwing", async () => {
    Object.defineProperty(
      URL,
      "createObjectURL",
      {
        configurable: true,
        value: undefined,
      },
    );

    await expect(
      downloadCalendarFile(reminderOptions),
    ).resolves.toEqual({
      success: false,
      error: "download-unsupported",
    });
  });

  it("cleans up the temporary anchor and URL when the download click throws", async () => {
    vi.spyOn(
      HTMLAnchorElement.prototype,
      "click",
    ).mockImplementation(() => {
      throw new Error("download blocked");
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
      document.querySelector(
        'a[download="vote-for-luna-reminders.ics"]',
      ),
    ).not.toBeInTheDocument();

    vi.advanceTimersByTime(60_000);

    expect(
      revokeObjectUrl,
    ).toHaveBeenCalledWith(
      "blob:luna-reminder",
    );
  });

  it("reports invalid calendar input without touching browser delivery APIs", async () => {
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
      createObjectUrl,
    ).not.toHaveBeenCalled();

    expect(
      anchorClick,
    ).not.toHaveBeenCalled();
  });
});