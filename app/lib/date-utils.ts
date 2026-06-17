export type DateLikeEvent = {
  startDate?: string | null;
  endDate?: string | null;
  date?: string | null;
};

const MONTHS: Record<string, number> = {
  jan: 0,
  january: 0,
  feb: 1,
  february: 1,
  mar: 2,
  march: 2,
  apr: 3,
  april: 3,
  may: 4,
  jun: 5,
  june: 5,
  jul: 6,
  july: 6,
  aug: 7,
  august: 7,
  sep: 8,
  sept: 8,
  september: 8,
  oct: 9,
  october: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11,
};

function startOfToday() {
  const now = new Date();

  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function isValidDate(date: Date) {
  return !Number.isNaN(date.getTime());
}

export function parseLooseDate(value?: string | null): Date | null {
  if (!value) return null;

  const raw = value.trim();

  if (!raw) return null;

  const ymd = raw.match(/\b(20\d{2})[./-](\d{1,2})[./-](\d{1,2})\b/);

  if (ymd) {
    const year = Number(ymd[1]);
    const month = Number(ymd[2]) - 1;
    const day = Number(ymd[3]);
    const date = new Date(year, month, day);

    return isValidDate(date) ? date : null;
  }

  const monthDayYear = raw.match(
    /\b(Jan|January|Feb|February|Mar|March|Apr|April|May|Jun|June|Jul|July|Aug|August|Sep|Sept|September|Oct|October|Nov|November|Dec|December)[a-z]*\.?\s+(\d{1,2})(?:st|nd|rd|th)?[,]?\s+(20\d{2})\b/i
  );

  if (monthDayYear) {
    const month = MONTHS[monthDayYear[1].toLowerCase()];
    const day = Number(monthDayYear[2]);
    const year = Number(monthDayYear[3]);
    const date = new Date(year, month, day);

    return isValidDate(date) ? date : null;
  }

  const dayMonthYear = raw.match(
    /\b(\d{1,2})(?:st|nd|rd|th)?\s+(Jan|January|Feb|February|Mar|March|Apr|April|May|Jun|June|Jul|July|Aug|August|Sep|Sept|September|Oct|October|Nov|November|Dec|December)[a-z]*\.?\s+(20\d{2})\b/i
  );

  if (dayMonthYear) {
    const day = Number(dayMonthYear[1]);
    const month = MONTHS[dayMonthYear[2].toLowerCase()];
    const year = Number(dayMonthYear[3]);
    const date = new Date(year, month, day);

    return isValidDate(date) ? date : null;
  }

  const parsed = new Date(raw);

  if (isValidDate(parsed)) {
    return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
  }

  return null;
}

export function getEventEndDate(event: DateLikeEvent) {
  return (
    parseLooseDate(event.endDate) ||
    parseLooseDate(event.startDate) ||
    parseLooseDate(event.date)
  );
}

export function isUpcomingOrActive(event: DateLikeEvent) {
  const endDate = getEventEndDate(event);

  // Discovery sources and continuously updated directories do not have a fixed
  // event date, so they should remain visible.
  if (!endDate) {
    return true;
  }

  return endDate >= startOfToday();
}

export function getTodayLabel() {
  const today = startOfToday();

  return today.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
