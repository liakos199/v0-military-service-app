import { DutyEntry, DUTY_TYPE_LABELS } from './types'

// Format date to iCal required format: YYYYMMDDTHHMMSSZ (UTC)
function formatICalDate(dateStr: string, timeStr?: string): string {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''

  if (timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number)
    d.setHours(hours || 0, minutes || 0, 0, 0)
  }

  const yyyy = d.getUTCFullYear()
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(d.getUTCDate()).padStart(2, '0')
  const hh = String(d.getUTCHours()).padStart(2, '0')
  const min = String(d.getUTCMinutes()).padStart(2, '0')
  const ss = String(d.getUTCSeconds()).padStart(2, '0')

  return `${yyyy}${mm}${dd}T${hh}${min}${ss}Z`
}

function formatICalDateAllDay(dateStr: string): string {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''

  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')

  return `${yyyy}${mm}${dd}`
}

function escapeICSString(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
}

// Generate the iCal string
export function generateDutyICal(duty: DutyEntry): string {
  const typeLabel = DUTY_TYPE_LABELS[duty.type] || 'Άλλη'
  const summary = escapeICSString(`Υπηρεσία: ${typeLabel}`)

  const descriptionParts = []
  if (duty.notes) descriptionParts.push(`Σημειώσεις: ${duty.notes}`)
  if (duty.password) descriptionParts.push(`Σύνθημα: ${duty.password}`)
  if (duty.countersign) descriptionParts.push(`Παρασύνθημα: ${duty.countersign}`)
  const description = escapeICSString(descriptionParts.join('\n'))

  const isAllDay = !duty.startTime && !duty.endTime

  let startProp = ''
  let endProp = ''

  if (isAllDay) {
    const startICalDate = formatICalDateAllDay(duty.date)
    const nextDay = new Date(duty.date)
    nextDay.setDate(nextDay.getDate() + 1)
    const endICalDate = formatICalDateAllDay(nextDay.toISOString().split('T')[0])

    startProp = `DTSTART;VALUE=DATE:${startICalDate}`
    endProp = `DTEND;VALUE=DATE:${endICalDate}`
  } else {
    const startTime = duty.startTime || '00:00'
    const startICalDate = formatICalDate(duty.date, startTime)
    startProp = `DTSTART:${startICalDate}`

    let endTimeStr = duty.endTime || '23:59'
    let endBaseDate = new Date(duty.date)

    // Crosses midnight?
    const [startH, startM] = startTime.split(':').map(Number)
    const [endH, endM] = endTimeStr.split(':').map(Number)
    if (endH < startH || (endH === startH && endM < startM)) {
      endBaseDate.setDate(endBaseDate.getDate() + 1)
    }

    const endICalDate = formatICalDate(endBaseDate.toISOString().split('T')[0], endTimeStr)
    endProp = `DTEND:${endICalDate}`
  }

  const uid = `${duty.id || Date.now()}@apolele.pro`
  const now = new Date()
  const dtStamp = formatICalDate(now.toISOString().split('T')[0], now.toTimeString().substring(0, 5))

  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Apolele Pro//Duty Calendar//GR',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    startProp,
    endProp,
    `SUMMARY:${summary}`,
    ...(description ? [`DESCRIPTION:${description}`] : []),
    'END:VEVENT',
    'END:VCALENDAR'
  ]

  return icsLines.join('\r\n')
}

export async function addDutyToNativeCalendar(duty: DutyEntry): Promise<boolean> {
  try {
    const icsContent = generateDutyICal(duty)
    const fileName = `duty-${duty.date}.ics`

    // Attempt Web Share API (Mobile Devices)
    if (typeof navigator !== 'undefined' && navigator.share) {
      const file = new File([icsContent], fileName, { type: 'text/calendar' })
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: 'Προσθήκη στο Ημερολόγιο',
            files: [file]
          })
          return true
        } catch (shareErr: any) {
          // If the user aborted the share, do not fallback to download
          if (shareErr.name === 'AbortError') return false
          console.error('Share failed, falling back to download', shareErr)
        }
      }
    }

    // Fallback: Download via Blob/URL
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    setTimeout(() => {
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }, 100)
    return true
  } catch (error) {
    // Intentionally generic error per project guidelines
    console.error('Failed to export calendar event')
    return false
  }
}
