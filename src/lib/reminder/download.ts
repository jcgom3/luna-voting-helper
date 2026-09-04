import {
  generateIcsFile,
  getCalendarFilename,
} from "@/lib/reminder/ics";
import type { Language } from "@/lib/types/language";

export type DownloadCalendarResult =
  | {
    success: true;
    delivery: "file-share" | "download";
  }
  | {
    success: false;
    error:
    | "calendar-generation-failed"
    | "share-cancelled"
    | "download-unsupported"
    | "download-failed"
    | "forced-failure";
  };

const OBJECT_URL_REVOKE_DELAY_MS = 60_000;



function canShareCalendarFile(file: File): boolean {
  if (
    typeof navigator === "undefined" ||
    typeof navigator.share !== "function" ||
    typeof navigator.canShare !== "function"
  ) {
    return false;
  }

  try {
    return navigator.canShare({ files: [file] });
  } catch {
    return false;
  }
}

async function shareCalendarFile(
  file: File,
): Promise<DownloadCalendarResult | null> {
  if (!canShareCalendarFile(file)) {
    return null;
  }

  try {
    await navigator.share({
      files: [file],
    });

    return {
      success: true,
      delivery: "file-share",
    };
  } catch {
    // AbortError can mean the user cancelled, but it can
    // also mean that no compatible share target exists.
    // Allow the regular download fallback to recover.
    return null;
  }
}

function downloadCalendarBlob(
  icsContent: string,
  filename: string,
): DownloadCalendarResult {
  if (
    typeof document === "undefined" ||
    typeof URL === "undefined" ||
    typeof window === "undefined" ||
    typeof URL.createObjectURL !== "function" ||
    typeof URL.revokeObjectURL !== "function"
  ) {
    return {
      success: false,
      error: "download-unsupported",
    };
  }

  let url: string | null = null;
  let anchor: HTMLAnchorElement | null = null;

  try {
    const blob = new Blob([icsContent], {
      type: "text/calendar;charset=utf-8",
    });

    url = URL.createObjectURL(blob);

    anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.style.display = "none";

    document.body.appendChild(anchor);
    anchor.click();

    return {
      success: true,
      delivery: "download",
    };
  } catch {
    return {
      success: false,
      error: "download-failed",
    };
  } finally {
    anchor?.remove();

    if (url) {
      const objectUrl = url;

      window.setTimeout(() => {
        URL.revokeObjectURL(objectUrl);
      }, OBJECT_URL_REVOKE_DELAY_MS);
    }
  }
}

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

  let icsContent: string;

  try {
    icsContent = generateIcsFile({
      firstReminderAt: options.firstReminderAt,
      uid: options.uid,
      language: options.language,
    });
  } catch {
    return {
      success: false,
      error: "calendar-generation-failed",
    };
  }

  const filename = getCalendarFilename(options.language);

  if (typeof File !== "undefined") {
    try {
      const file = new File([icsContent], filename, {
        type: "text/calendar",
      });

      const shareResult = await shareCalendarFile(file);

      if (shareResult) {
        return shareResult;
      }
    } catch {
      // File creation and sharing are best effort.
      // Fall back to the regular Blob download.
    }
  }

  return downloadCalendarBlob(icsContent, filename);
}

export function getFirstReminderTime(clickedAt: Date): Date {
  return new Date(
    clickedAt.getTime() + 24 * 60 * 60 * 1000,
  );
}