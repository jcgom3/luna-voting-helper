import {
  generateIcsFile,
  getCalendarFilename,
} from "@/lib/reminder/ics";
import type { Language } from "@/lib/types/language";

export interface DownloadCalendarResult {
  success: boolean;
  error?: string;
}

export async function downloadCalendarFile(options: {
  firstReminderAt: Date;
  uid: string;
  language: Language;
  forceFailure?: boolean;
}): Promise<DownloadCalendarResult> {
  if (options.forceFailure) {
    return { success: false, error: "forced-failure" };
  }

  try {
    const icsContent = generateIcsFile({
      firstReminderAt: options.firstReminderAt,
      uid: options.uid,
      language: options.language,
    });

    const blob = new Blob([icsContent], {
      type: "text/calendar;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = getCalendarFilename(options.language);
    anchor.style.display = "none";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    window.setTimeout(() => URL.revokeObjectURL(url), 1_000);

    return { success: true };
  } catch {
    return { success: false, error: "download-failed" };
  }
}

export function getFirstReminderTime(clickedAt: Date): Date {
  return new Date(clickedAt.getTime() + 24 * 60 * 60 * 1000);
}
