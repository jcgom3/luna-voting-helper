import {
  act,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { ReminderSheet } from "@/components/ReminderSheet";
import { downloadCalendarFile } from "@/lib/reminder/download";
import { navigateToOfficialVoting } from "@/lib/reminder/navigation";
import { en } from "@/lib/translations/en";
import { es } from "@/lib/translations/es";

vi.mock(
  "@/lib/reminder/download",
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import("@/lib/reminder/download")
      >();

    return {
      ...actual,
      downloadCalendarFile: vi.fn(),
    };
  },
);

vi.mock(
  "@/lib/reminder/navigation",
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import("@/lib/reminder/navigation")
      >();

    return {
      ...actual,
      navigateToOfficialVoting: vi.fn(),
    };
  },
);

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

    vi.spyOn(
      console,
      "error",
    ).mockImplementation(() => undefined);

    vi.mocked(
      downloadCalendarFile,
    ).mockResolvedValue({
      success: true,
      delivery: "calendar-preview",
    });

    vi.mocked(
      navigateToOfficialVoting,
    ).mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("creates the first reminder 24 hours after the click and continues", async () => {
    const clickedAt = new Date(
      "2026-09-02T21:00:00.000Z",
    );

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
        screen.getByRole("button", {
          name: "Add Reminders and Continue",
        }),
      );
    });

    expect(
      downloadCalendarFile,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        firstReminderAt: new Date(
          "2026-09-03T21:00:00.000Z",
        ),
        language: "en",
      }),
    );

    act(() => {
      vi.advanceTimersByTime(1_499);
    });

    expect(
      navigateToOfficialVoting,
    ).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(
      navigateToOfficialVoting,
    ).toHaveBeenCalledWith("facebook");
  });

  it("continues after the calendar preview opens", async () => {
    vi.mocked(
      downloadCalendarFile,
    ).mockResolvedValue({
      success: true,
      delivery: "calendar-preview",
    });

    render(
      <ReminderSheet
        open
        language="en"
        method="facebook"
        clickedAt={
          new Date("2026-09-02T21:00:00.000Z")
        }
        reminderState={emptyState}
        copy={en.reminderSheet}
        onClose={vi.fn()}
        onStateChange={vi.fn()}
      />,
    );

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", {
          name: "Add Reminders and Continue",
        }),
      );
    });

    act(() => {
      vi.advanceTimersByTime(1_500);
    });

    expect(
      navigateToOfficialVoting,
    ).toHaveBeenCalledWith("facebook");
  });

  it("preserves the text-voting destination after calendar delivery", async () => {
    render(
      <ReminderSheet
        open
        language="en"
        method="text"
        clickedAt={
          new Date("2026-09-02T21:00:00.000Z")
        }
        reminderState={emptyState}
        copy={en.reminderSheet}
        onClose={vi.fn()}
        onStateChange={vi.fn()}
      />,
    );

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", {
          name: "Add Reminders and Continue",
        }),
      );
    });

    act(() => {
      vi.advanceTimersByTime(1_500);
    });

    expect(
      navigateToOfficialVoting,
    ).toHaveBeenCalledWith("text");
  });

  it("continues without generating a reminder", () => {
    render(
      <ReminderSheet
        open
        language="en"
        method="text"
        clickedAt={
          new Date("2026-09-02T21:00:00.000Z")
        }
        reminderState={emptyState}
        copy={en.reminderSheet}
        onClose={vi.fn()}
        onStateChange={vi.fn()}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Continue Without Reminders",
      }),
    );

    expect(
      downloadCalendarFile,
    ).not.toHaveBeenCalled();

    expect(
      navigateToOfficialVoting,
    ).toHaveBeenCalledWith("text");
  });

  it("keeps voting available when calendar delivery fails", async () => {
    vi.mocked(
      downloadCalendarFile,
    ).mockResolvedValue({
      success: false,
      error: "download-unsupported",
    });

    render(
      <ReminderSheet
        open
        language="en"
        method="facebook"
        clickedAt={
          new Date("2026-09-02T21:00:00.000Z")
        }
        reminderState={emptyState}
        copy={en.reminderSheet}
        onClose={vi.fn()}
        onStateChange={vi.fn()}
      />,
    );

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", {
          name: "Add Reminders and Continue",
        }),
      );
    });

    expect(
      screen.getByRole("status"),
    ).toHaveTextContent(
      "We could not create the calendar file",
    );

    expect(
      screen.getByRole("button", {
        name: "Continue Without Reminders",
      }),
    ).toBeEnabled();

    expect(
      screen.getByRole("button", {
        name: "Try Again",
      }),
    ).toBeEnabled();

    expect(
      navigateToOfficialVoting,
    ).not.toHaveBeenCalled();
  });

  it("allows voting while a browser calendar handoff is still pending", async () => {
    let resolveDownload:
      | ((value: {
          success: true;
          delivery: "calendar-preview";
        }) => void)
      | undefined;

    vi.mocked(
      downloadCalendarFile,
    ).mockReturnValue(
      new Promise((resolve) => {
        resolveDownload = resolve;
      }),
    );

    render(
      <ReminderSheet
        open
        language="en"
        method="facebook"
        clickedAt={
          new Date("2026-09-02T21:00:00.000Z")
        }
        reminderState={emptyState}
        copy={en.reminderSheet}
        onClose={vi.fn()}
        onStateChange={vi.fn()}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Add Reminders and Continue",
      }),
    );

    const continueButton = screen.getByRole(
      "button",
      {
        name: "Continue Without Reminders",
      },
    );

    expect(continueButton).toBeEnabled();

    fireEvent.click(continueButton);

    expect(
      navigateToOfficialVoting,
    ).toHaveBeenCalledWith("facebook");

    await act(async () => {
      resolveDownload?.({
        success: true,
        delivery: "calendar-preview",
      });
    });

    act(() => {
      vi.runAllTimers();
    });

    expect(
      navigateToOfficialVoting,
    ).toHaveBeenCalledTimes(1);
  });

  it("retries calendar delivery after a recoverable failure", async () => {
    vi.mocked(downloadCalendarFile)
      .mockResolvedValueOnce({
        success: false,
        error: "download-failed",
      })
      .mockResolvedValueOnce({
        success: true,
        delivery: "calendar-preview",
      });

    render(
      <ReminderSheet
        open
        language="en"
        method="facebook"
        clickedAt={
          new Date("2026-09-02T21:00:00.000Z")
        }
        reminderState={emptyState}
        copy={en.reminderSheet}
        onClose={vi.fn()}
        onStateChange={vi.fn()}
      />,
    );

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", {
          name: "Add Reminders and Continue",
        }),
      );
    });

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", {
          name: "Try Again",
        }),
      );
    });

    act(() => {
      vi.advanceTimersByTime(1_500);
    });

    expect(
      downloadCalendarFile,
    ).toHaveBeenCalledTimes(2);

    expect(
      navigateToOfficialVoting,
    ).toHaveBeenCalledWith("facebook");
  });

  it("recovers from an unexpected calendar-delivery rejection", async () => {
    vi.mocked(
      downloadCalendarFile,
    ).mockRejectedValue(
      new Error("embedded-browser-failure"),
    );

    render(
      <ReminderSheet
        open
        language="en"
        method="facebook"
        clickedAt={
          new Date("2026-09-02T21:00:00.000Z")
        }
        reminderState={emptyState}
        copy={en.reminderSheet}
        onClose={vi.fn()}
        onStateChange={vi.fn()}
      />,
    );

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", {
          name: "Add Reminders and Continue",
        }),
      );
    });

    expect(
      screen.getByRole("status"),
    ).toHaveTextContent(
      "We could not create the calendar file",
    );

    expect(
      screen.getByRole("button", {
        name: "Continue Without Reminders",
      }),
    ).toBeEnabled();
  });

  it("uses the active language for calendar delivery", async () => {
    render(
      <ReminderSheet
        open
        language="es"
        method="facebook"
        clickedAt={
          new Date("2026-09-02T21:00:00.000Z")
        }
        reminderState={emptyState}
        copy={es.reminderSheet}
        onClose={vi.fn()}
        onStateChange={vi.fn()}
      />,
    );

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", {
          name: "Agregar recordatorios y continuar",
        }),
      );
    });

    expect(
      downloadCalendarFile,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        language: "es",
      }),
    );
  });

  it("continues to vote when localStorage rejects reminder persistence", async () => {
    vi.spyOn(
      localStorage,
      "setItem",
    ).mockImplementation(() => {
      throw new DOMException(
        "Storage is blocked",
        "SecurityError",
      );
    });

    render(
      <ReminderSheet
        open
        language="en"
        method="facebook"
        clickedAt={
          new Date("2026-09-02T21:00:00.000Z")
        }
        reminderState={emptyState}
        copy={en.reminderSheet}
        onClose={vi.fn()}
        onStateChange={vi.fn()}
      />,
    );

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", {
          name: "Add Reminders and Continue",
        }),
      );
    });

    act(() => {
      vi.advanceTimersByTime(1_500);
    });

    expect(
      navigateToOfficialVoting,
    ).toHaveBeenCalledWith("facebook");
  });

  it("uses the saved first occurrence and UID for a duplicate download", async () => {
    vi.setSystemTime(
      new Date("2026-09-04T21:00:00.000Z"),
    );

    const savedState = {
      lastMethodClick:
        "2026-09-02T21:00:00.000Z",
      selectedMethod: "facebook" as const,
      reminderCreated: true,
      reminderLanguage: "en" as const,
      firstReminderAt:
        "2026-09-03T21:00:00.000Z",
      reminderUid:
        "existing-reminder@voteforluna.local",
    };

    render(
      <ReminderSheet
        open
        language="en"
        method="facebook"
        clickedAt={
          new Date("2026-09-04T21:00:00.000Z")
        }
        reminderState={savedState}
        copy={en.reminderSheet}
        onClose={vi.fn()}
        onStateChange={vi.fn()}
      />,
    );

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", {
          name: "Download Reminders Again",
        }),
      );
    });

    expect(
      downloadCalendarFile,
    ).toHaveBeenCalledWith({
      firstReminderAt: new Date(
        "2026-09-03T21:00:00.000Z",
      ),
      uid: "existing-reminder@voteforluna.local",
      language: "en",
    });
  });

  it("cancels delayed navigation when the visitor continues manually", async () => {
    render(
      <ReminderSheet
        open
        language="en"
        method="facebook"
        clickedAt={
          new Date("2026-09-02T21:00:00.000Z")
        }
        reminderState={emptyState}
        copy={en.reminderSheet}
        onClose={vi.fn()}
        onStateChange={vi.fn()}
      />,
    );

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", {
          name: "Add Reminders and Continue",
        }),
      );
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Continue Without Reminders",
      }),
    );

    act(() => {
      vi.advanceTimersByTime(1_500);
    });

    expect(
      navigateToOfficialVoting,
    ).toHaveBeenCalledTimes(1);

    expect(
      navigateToOfficialVoting,
    ).toHaveBeenCalledWith("facebook");
  });

  it("recovers when automatic voting navigation throws", async () => {
    vi.mocked(
      navigateToOfficialVoting,
    ).mockImplementation(() => {
      throw new Error("navigation blocked");
    });

    render(
      <ReminderSheet
        open
        language="en"
        method="facebook"
        clickedAt={
          new Date("2026-09-02T21:00:00.000Z")
        }
        reminderState={emptyState}
        copy={en.reminderSheet}
        onClose={vi.fn()}
        onStateChange={vi.fn()}
      />,
    );

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", {
          name: "Add Reminders and Continue",
        }),
      );
    });

    act(() => {
      vi.advanceTimersByTime(1_500);
    });

    expect(
      screen.getByRole("status"),
    ).toHaveTextContent(
      "We could not open the official voting page automatically",
    );

    expect(
  screen.getByRole("button", {
        name: "Continue Without Reminders",
      }),
    ).toBeEnabled();
  });

  it("closes with Escape", () => {
    const onClose = vi.fn();

    render(
      <ReminderSheet
        open
        language="en"
        method="text"
        clickedAt={
          new Date("2026-09-02T21:00:00.000Z")
        }
        reminderState={emptyState}
        copy={en.reminderSheet}
        onClose={onClose}
        onStateChange={vi.fn()}
      />,
    );

    fireEvent.keyDown(document, {
      key: "Escape",
    });

    expect(onClose).toHaveBeenCalledOnce();
  });
});