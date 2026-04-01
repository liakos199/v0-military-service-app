export type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error'

export const hapticPatterns: Record<HapticType, number | number[]> = {
  light: 10,
  medium: 20,
  heavy: 40,
  success: [10, 50, 10],
  warning: [30, 50, 30],
  error: [50, 50, 50, 50, 50],
}

export function hapticFeedback(type: HapticType = 'light') {
  if (typeof window === 'undefined') return
  if (!('vibrate' in navigator)) return

  try {
    navigator.vibrate(hapticPatterns[type])
  } catch {
    // Vibration not supported
  }
}

export const triggerHaptic = hapticFeedback

export function formatGreekDate(dateStr: string): string {
  const date = new Date(dateStr)
  const months = [
    'Ιαν', 'Φεβ', 'Μαρ', 'Απρ', 'Μαι', 'Ιουν',
    'Ιουλ', 'Αυγ', 'Σεπ', 'Οκτ', 'Νοε', 'Δεκ',
  ]
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
}

export function formatGreekDateFull(dateStr: string): string {
  const date = new Date(dateStr)
  const days = ['Κυριακή', 'Δευτέρα', 'Τρίτη', 'Τετάρτη', 'Πέμπτη', 'Παρασκευή', 'Σάββατο']
  const months = [
    'Ιανουαρίου', 'Φεβρουαρίου', 'Μαρτίου', 'Απριλίου',
    'Μαΐου', 'Ιουνίου', 'Ιουλίου', 'Αυγούστου',
    'Σεπτεμβρίου', 'Οκτωβρίου', 'Νοεμβρίου', 'Δεκεμβρίου',
  ]
  return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

export function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  // Set to midnight to avoid DST issues
  d1.setHours(0, 0, 0, 0)
  d2.setHours(0, 0, 0, 0)
  const diff = d2.getTime() - d1.getTime()
  return Math.round(diff / (1000 * 60 * 60 * 24))
}

export function toLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Generate an .ics calendar file with an alarm/reminder
 * Works on both iOS and Android to add events to native calendar
 */
export function generateIcsFile(options: {
  title: string
  description: string
  startDate: string // YYYY-MM-DD
  startTime: string // HH:MM
  endDate: string   // YYYY-MM-DD
  endTime: string   // HH:MM
  reminderMinutes: number
}): string {
  const { title, description, startDate, startTime, endDate, endTime, reminderMinutes } = options

  // Format dates for ICS (YYYYMMDDTHHMMSS in local time)
  const formatIcsDate = (date: string, time: string) => {
    return `${date.replace(/-/g, '')}T${time.replace(/:/g, '')}00`
  }

  const dtStart = formatIcsDate(startDate, startTime)
  const dtEnd = formatIcsDate(endDate, endTime)
  const now = new Date()
  const dtStamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`
  const uid = `apolele-pro-${Date.now()}-${Math.random().toString(36).substring(2, 9)}@app`

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ΑΠΟΛΕΛΕ PRO//Military Service App//EL',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${title} - Υπενθύμιση`,
    `TRIGGER:-PT${reminderMinutes}M`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ]

  return lines.join('\r\n')
}

/**
 * Download an .ics file, triggering the native calendar app
 */
export function downloadIcsFile(icsContent: string, filename: string) {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
