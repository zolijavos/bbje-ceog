import { EVENT_CONFIG } from '@/lib/config/event';

// Generate ICS file content
export function generateICSContent(): string {
  const eventDate = new Date(EVENT_CONFIG.date + 'T' + EVENT_CONFIG.startTime);
  const eventEndDate = new Date(eventDate.getTime() + 5 * 60 * 60 * 1000); // 5 hours duration

  // Format dates for ICS (UTC format)
  const formatICSDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CEO Gala 2026//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `DTSTART:${formatICSDate(eventDate)}`,
    `DTEND:${formatICSDate(eventEndDate)}`,
    `SUMMARY:${EVENT_CONFIG.name}`,
    `DESCRIPTION:${EVENT_CONFIG.name} - The most prestigious business event of the year.`,
    `LOCATION:${EVENT_CONFIG.venue.name}, ${EVENT_CONFIG.venue.address}`,
    `URL:https://ceogala.hu`,
    'STATUS:CONFIRMED',
    `UID:ceog2026-${Date.now()}@ceogala.hu`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  return icsContent;
}

// Download ICS file (Apple Calendar, Outlook)
export function downloadICS(): void {
  const icsContent = generateICSContent();
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = 'ceo-gala-2026.ics';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Generate Google Calendar URL
export function getGoogleCalendarUrl(): string {
  const eventDate = new Date(EVENT_CONFIG.date + 'T' + EVENT_CONFIG.startTime);
  const eventEndDate = new Date(eventDate.getTime() + 5 * 60 * 60 * 1000);

  // Format for Google Calendar (YYYYMMDDTHHMMSS)
  const formatGoogleDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: EVENT_CONFIG.name,
    dates: `${formatGoogleDate(eventDate)}/${formatGoogleDate(eventEndDate)}`,
    details: `${EVENT_CONFIG.name} - The most prestigious business event of the year.\n\nDress code: ${EVENT_CONFIG.dressCode}`,
    location: `${EVENT_CONFIG.venue.name}, ${EVENT_CONFIG.venue.address}`,
    sf: 'true',
    output: 'xml',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// Generate Outlook.com Calendar URL
export function getOutlookCalendarUrl(): string {
  const eventDate = new Date(EVENT_CONFIG.date + 'T' + EVENT_CONFIG.startTime);
  const eventEndDate = new Date(eventDate.getTime() + 5 * 60 * 60 * 1000);

  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    startdt: eventDate.toISOString(),
    enddt: eventEndDate.toISOString(),
    subject: EVENT_CONFIG.name,
    body: `${EVENT_CONFIG.name} - The most prestigious business event of the year.\n\nDress code: ${EVENT_CONFIG.dressCode}`,
    location: `${EVENT_CONFIG.venue.name}, ${EVENT_CONFIG.venue.address}`,
  });

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

// Open calendar based on type
export function addToCalendar(type: 'google' | 'apple' | 'outlook' | 'ics'): void {
  switch (type) {
    case 'google':
      window.open(getGoogleCalendarUrl(), '_blank');
      break;
    case 'apple':
    case 'ics':
      downloadICS();
      break;
    case 'outlook':
      // Check if user might want web or desktop
      // For mobile, download ICS is more reliable
      if (/mobile|android|iphone/i.test(navigator.userAgent)) {
        downloadICS();
      } else {
        window.open(getOutlookCalendarUrl(), '_blank');
      }
      break;
  }
}
