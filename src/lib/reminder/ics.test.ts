import { describe, expect, it } from "vitest";

import { escapeCalendarText } from "@/lib/reminder/escape";
import { generateIcsFile, getCalendarFilename } from "@/lib/reminder/ics";

describe("calendar generation", () => {
  it("creates eight 24-hour reminders with an alert", () => {
    const file = generateIcsFile({
      firstReminderAt: new Date("2026-09-03T21:00:00.000Z"),
      dtStamp: new Date("2026-09-02T21:00:00.000Z"),
      uid: "luna-test@example.test",
      language: "en",
    });

    expect(file).toContain("BEGIN:VCALENDAR\r\n");
    expect(file).toContain("DTSTART:20260903T210000Z\r\n");
    expect(file).toContain("DTEND:20260903T211500Z\r\n");
    expect(file).toContain("RRULE:FREQ=DAILY;INTERVAL=1;COUNT=8\r\n");
    expect(file).toContain("BEGIN:VALARM\r\nTRIGGER:PT0M\r\nACTION:DISPLAY\r\n");
    expect(file).toContain("UID:luna-test@example.test\r\n");
    expect(file.replaceAll("\r\n", "")).not.toContain("\n");
  });

  it("localizes the event and filename", () => {
    const file = generateIcsFile({
      firstReminderAt: new Date("2026-09-03T21:00:00.000Z"),
      dtStamp: new Date("2026-09-02T21:00:00.000Z"),
      uid: "luna-spanish@example.test",
      language: "es",
    });
    expect(file).toContain("SUMMARY:Vota por Luna Love");
    expect(file).toContain("DESCRIPTION:Emite tu voto gratuito diario");
    expect(getCalendarFilename("es")).toBe("vota-por-luna-recordatorios.ics");
  });

  it("escapes calendar punctuation and line endings", () => {
    expect(escapeCalendarText("Luna, sí; hoy\\mañana\notra línea")).toBe(
      "Luna\\, sí\\; hoy\\\\mañana\\notra línea",
    );
  });
});
