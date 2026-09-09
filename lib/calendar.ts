interface CalendarEventParams {
  title: string;
  description: string;
  location: string;
  dateStr: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}

function parseWibToUtcIsoCompact(dateStr: string, timeStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hour, minute] = timeStr.split(":").map(Number);

  const utcMs = Date.UTC(year, month - 1, day, hour, minute) - 7 * 60 * 60 * 1000;
  const d = new Date(utcMs);

  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dt = String(d.getUTCDate()).padStart(2, "0");
  const h = String(d.getUTCHours()).padStart(2, "0");
  const min = String(d.getUTCMinutes()).padStart(2, "0");
  const s = String(d.getUTCSeconds()).padStart(2, "0");

  return `${y}${m}${dt}T${h}${min}${s}Z`;
}

export function generateGoogleCalendarUrl(params: CalendarEventParams): string {
  const startUtc = parseWibToUtcIsoCompact(params.dateStr, params.startTime);
  const endUtc = parseWibToUtcIsoCompact(params.dateStr, params.endTime);

  const url = new URL("https://calendar.google.com/calendar/render");
  url.searchParams.set("action", "TEMPLATE");
  url.searchParams.set("text", params.title);
  url.searchParams.set("dates", `${startUtc}/${endUtc}`);
  url.searchParams.set("details", params.description);
  url.searchParams.set("location", params.location);

  return url.toString();
}

export function downloadIcsFile(params: CalendarEventParams, filename = "courtgrid-booking.ics"): void {
  const startUtc = parseWibToUtcIsoCompact(params.dateStr, params.startTime);
  const endUtc = parseWibToUtcIsoCompact(params.dateStr, params.endTime);

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//CourtGrid//Booking//ID",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${Date.now()}@courtgrid.app`,
    `DTSTAMP:${startUtc}`,
    `DTSTART:${startUtc}`,
    `DTEND:${endUtc}`,
    `SUMMARY:${params.title.replace(/\n/g, " ")}`,
    `DESCRIPTION:${params.description.replace(/\n/g, "\\n")}`,
    `LOCATION:${params.location.replace(/\n/g, " ")}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}
