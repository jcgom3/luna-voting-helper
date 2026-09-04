import type { Language } from "@/lib/types/language";

export type DownloadCalendarResult =
  | {
      success: true;
      delivery: "calendar-preview";
    }
  | {
      success: false;
      error:
        | "calendar-generation-failed"
        | "download-unsupported"
        | "download-failed"
        | "forced-failure";
    };

export async function downloadCalendarFile(options: {
  firstReminderAt: Date;
  uid: string;
  language: Language;
  forceFailure?: boolean;
}): Promise<DownloadCalendarResult> {
  if (options.forceFailure) {
    return {
      success: false,
      error: "forced-failure",
    };
  }

  if (
    Number.isNaN(
      options.firstReminderAt.getTime(),
    )
  ) {
    return {
      success: false,
      error: "calendar-generation-failed",
    };
  }

  if (
    typeof document === "undefined" ||
    typeof window === "undefined"
  ) {
    return {
      success: false,
      error: "download-unsupported",
    };
  }

  let anchor: HTMLAnchorElement | null = null;

  try {
    const calendarUrl = new URL(
      "/api/reminders/calendar.ics",
      window.location.origin,
    );

    calendarUrl.searchParams.set(
      "start",
      options.firstReminderAt.toISOString(),
    );

    calendarUrl.searchParams.set(
      "uid",
      options.uid,
    );

    calendarUrl.searchParams.set(
      "language",
      options.language,
    );

    anchor = document.createElement("a");
    anchor.href = calendarUrl.toString();
    anchor.style.display = "none";

    /*
     * Do not add anchor.download.
     * Do not call navigator.share().
     *
     * Opening an HTTPS text/calendar response allows
     * iPhone Safari to display the Calendar preview
     * directly instead of showing the Share Sheet.
     */
    document.body.appendChild(anchor);
    anchor.click();

    return {
      success: true,
      delivery: "calendar-preview",
    };
  } catch {
    return {
      success: false,
      error: "download-failed",
    };
  } finally {
    anchor?.remove();
  }
}

export function getFirstReminderTime(
  clickedAt: Date,
): Date {
  return new Date(
    clickedAt.getTime() +
      24 * 60 * 60 * 1000,
  );
}