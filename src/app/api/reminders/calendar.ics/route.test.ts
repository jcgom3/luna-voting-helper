import {
  describe,
  expect,
  it,
} from "vitest";

import { GET } from "@/app/api/reminders/calendar.ics/route";

function calendarRequest(
  query: string,
): Request {
  return new Request(
    `https://voteforluna.test/api/reminders/calendar.ics?${query}`,
  );
}

describe("calendar reminder route", () => {
  it("returns an inline English calendar with eight alerts", async () => {
    const response = await GET(
      calendarRequest(
        new URLSearchParams({
          start:
            "2026-09-03T21:00:00.000Z",
          uid:
            "luna-test@voteforluna.local",
          language: "en",
        }).toString(),
      ),
    );

    const calendar =
      await response.text();

    expect(response.status).toBe(200);

    expect(
      response.headers.get(
        "content-type",
      ),
    ).toBe(
      "text/calendar; charset=utf-8",
    );

    expect(
      response.headers.get(
        "content-disposition",
      ),
    ).toBe(
      'inline; filename="vote-for-luna-reminders.ics"',
    );

    expect(
      response.headers.get(
        "cache-control",
      ),
    ).toContain("no-store");

    expect(calendar).toContain(
      "DTSTART:20260903T210000Z",
    );

    expect(calendar).toContain(
      "RRULE:FREQ=DAILY;INTERVAL=1;COUNT=8",
    );

    expect(calendar).toContain(
      "BEGIN:VALARM",
    );

    expect(calendar).toContain(
      "ACTION:DISPLAY",
    );

    expect(calendar).toContain(
      "SUMMARY:Vote for Luna Love",
    );
  });

  it("uses Spanish calendar content and filename", async () => {
    const response = await GET(
      calendarRequest(
        new URLSearchParams({
          start:
            "2026-09-03T21:00:00.000Z",
          uid:
            "luna-test@voteforluna.local",
          language: "es",
        }).toString(),
      ),
    );

    const calendar =
      await response.text();

    expect(
      response.headers.get(
        "content-disposition",
      ),
    ).toBe(
      'inline; filename="vota-por-luna-recordatorios.ics"',
    );

    expect(calendar).toContain(
      "SUMMARY:Vota por Luna Love",
    );
  });

  it.each([
    "start=not-a-date&uid=luna-test%40voteforluna.local&language=en",
    "start=2026-09-03T21%3A00%3A00.000Z&uid=bad%0Auid&language=en",
    "start=2026-09-03T21%3A00%3A00.000Z&uid=luna-test%40voteforluna.local&language=fr",
  ])(
    "rejects invalid reminder parameters",
    async (query) => {
      const response = await GET(
        calendarRequest(query),
      );

      expect(response.status).toBe(400);
    },
  );
});