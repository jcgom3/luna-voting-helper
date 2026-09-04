import {
  generateIcsFile,
  getCalendarFilename,
} from "@/lib/reminder/ics";
import type { Language } from "@/lib/types/language";

const SAFE_UID_PATTERN =
  /^[A-Za-z0-9][A-Za-z0-9._@-]{0,199}$/;

function isLanguage(
  value: string | null,
): value is Language {
  return value === "en" || value === "es";
}

export async function GET(
  request: Request,
): Promise<Response> {
  const { searchParams } = new URL(
    request.url,
  );

  const start = searchParams.get("start");
  const uid = searchParams.get("uid");
  const language =
    searchParams.get("language");

  const firstReminderAt = start
    ? new Date(start)
    : null;

  if (
    !firstReminderAt ||
    Number.isNaN(firstReminderAt.getTime()) ||
    !uid ||
    !SAFE_UID_PATTERN.test(uid) ||
    !isLanguage(language)
  ) {
    return Response.json(
      {
        error:
          "Invalid calendar reminder parameters.",
      },
      {
        status: 400,
      },
    );
  }

  const calendar = generateIcsFile({
    firstReminderAt,
    uid,
    language,
  });

  const filename =
    getCalendarFilename(language);

  return new Response(calendar, {
    status: 200,
    headers: {
      "Cache-Control":
        "private, no-store, max-age=0",
      "Content-Disposition":
        `inline; filename="${filename}"`,
      "Content-Type":
        "text/calendar; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}