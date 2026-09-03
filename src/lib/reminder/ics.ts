import { escapeCalendarText } from "@/lib/reminder/escape";
import type { Language } from "@/lib/types/language";

export interface CalendarEventContent {
  title: string;
  description: string;
  location: string;
  url: string;
}

const EVENT_CONTENT: Record<Language, CalendarEventContent> = {
  en: {
    title: "Vote for Luna Love",
    description:
      "Cast your free daily vote for Luna Love on the official Baby of the Year website.",
    location: "Baby of the Year",
    url: "https://babyoftheyear.org/2026/luna-917f#vote",
  },
  es: {
    title: "Vota por Luna Love",
    description:
      "Emite tu voto gratuito diario por Luna Love en el sitio oficial de Baby of the Year.",
    location: "Baby of the Year",
    url: "https://babyoftheyear.org/2026/luna-917f#vote",
  },
};

const FILENAMES: Record<Language, string> = {
  en: "vote-for-luna-reminders.ics",
  es: "vota-por-luna-recordatorios.ics",
};

function formatIcsUtc(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function foldLine(line: string): string {
  const maxLength = 75;
  if (line.length <= maxLength) {
    return line;
  }

  const parts: string[] = [];
  let remaining = line;

  parts.push(remaining.slice(0, maxLength));
  remaining = remaining.slice(maxLength);

  while (remaining.length > 0) {
    parts.push(` ${remaining.slice(0, maxLength - 1)}`);
    remaining = remaining.slice(maxLength - 1);
  }

  return parts.join("\r\n");
}

export function getCalendarFilename(language: Language): string {
  return FILENAMES[language];
}

export function generateIcsFile(options: {
  firstReminderAt: Date;
  uid: string;
  language: Language;
  dtStamp?: Date;
}): string {
  const content = EVENT_CONTENT[options.language];
  const dtStart = options.firstReminderAt;
  const dtEnd = new Date(dtStart.getTime() + 15 * 60 * 1000);
  const dtStamp = options.dtStamp ?? new Date();

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Vote for Luna Love//Reminder//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${options.uid}`,
    `DTSTAMP:${formatIcsUtc(dtStamp)}`,
    `DTSTART:${formatIcsUtc(dtStart)}`,
    `DTEND:${formatIcsUtc(dtEnd)}`,
    "RRULE:FREQ=DAILY;INTERVAL=1;COUNT=8",
    foldLine(`SUMMARY:${escapeCalendarText(content.title)}`),
    foldLine(`DESCRIPTION:${escapeCalendarText(content.description)}`),
    foldLine(`LOCATION:${escapeCalendarText(content.location)}`),
    foldLine(`URL:${escapeCalendarText(content.url)}`),
    "BEGIN:VALARM",
    "TRIGGER:PT0M",
    "ACTION:DISPLAY",
    foldLine(`DESCRIPTION:${escapeCalendarText(content.title)}`),
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return `${lines.join("\r\n")}\r\n`;
}

export function getCalendarEventContent(language: Language): CalendarEventContent {
  return EVENT_CONTENT[language];
}

export { EVENT_CONTENT };
