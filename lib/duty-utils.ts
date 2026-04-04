import { DutyEntry, LeaveEntry } from './types'
import { daysBetween, toLocalDateString } from './helpers'

/**
 * Calculates the duration of a duty in minutes, correctly handling shifts that cross midnight.
 */
export function calculateDutyDuration(duty: Partial<DutyEntry>): number {
  if (!duty.date || !duty.startTime || !duty.endTime) return 0

  const start = new Date(`${duty.date}T${duty.startTime}`)
  let end = new Date(`${duty.endDate || duty.date}T${duty.endTime}`)

  // If endTime is before startTime and it's supposedly the same day, it crosses midnight
  if (end <= start && (!duty.endDate || duty.endDate === duty.date)) {
    end = new Date(end.getTime() + 24 * 60 * 60 * 1000)
  }

  const diffMs = end.getTime() - start.getTime()
  return Math.max(0, Math.floor(diffMs / (1000 * 60)))
}

/**
 * Checks for conflicts between a duty and existing duties/leaves.
 */
export function checkDutyConflicts(
  newDuty: Partial<DutyEntry>,
  duties: DutyEntry[],
  leaves: LeaveEntry[]
): { type: 'duty' | 'leave'; entry: DutyEntry | LeaveEntry }[] {
  if (!newDuty.date || !newDuty.startTime || !newDuty.endTime) return []

  const conflicts: { type: 'duty' | 'leave'; entry: DutyEntry | LeaveEntry }[] = []
  
  const start = new Date(`${newDuty.date}T${newDuty.startTime}`)
  let end = new Date(`${newDuty.endDate || newDuty.date}T${newDuty.endTime}`)
  if (end <= start && (!newDuty.endDate || newDuty.endDate === newDuty.date)) {
    end = new Date(end.getTime() + 24 * 60 * 60 * 1000)
  }

  // Check against other duties (except itself if editing)
  duties.forEach(d => {
    if (d.id === newDuty.id) return
    const dStart = new Date(`${d.date}T${d.startTime}`)
    let dEnd = new Date(`${d.endDate || d.date}T${d.endTime}`)
    if (dEnd <= dStart && (!d.endDate || d.endDate === d.date)) {
      dEnd = new Date(dEnd.getTime() + 24 * 60 * 60 * 1000)
    }

    if (start < dEnd && end > dStart) {
      conflicts.push({ type: 'duty', entry: d })
    }
  })

  // Check against leaves
  leaves.forEach(l => {
    const lStart = new Date(`${l.startDate}T00:00:00`)
    const lEnd = new Date(`${l.endDate}T23:59:59`)
    
    if (start <= lEnd && end >= lStart) {
      conflicts.push({ type: 'leave', entry: l })
    }
  })

  return conflicts
}

/**
 * Calculates duty statistics for a given set of duties.
 */
export function getDutyStats(duties: DutyEntry[]) {
  let totalMinutes = 0
  let nightMinutes = 0 // 22:00 - 06:00
  const typeCounts: Record<string, number> = {}

  duties.forEach(d => {
    const duration = d.durationMinutes || calculateDutyDuration(d)
    totalMinutes += duration

    const type = d.type
    typeCounts[type] = (typeCounts[type] || 0) + 1

    // Simple night-hour calculation
    // This is approximate but good enough for general stats
    const start = new Date(`${d.date}T${d.startTime}`)
    let end = new Date(`${d.endDate || d.date}T${d.endTime}`)
    if (end <= start) end = new Date(end.getTime() + 24 * 60 * 60 * 1000)

    // Check each hour of the duty
    for (let t = new Date(start); t < end; t.setMinutes(t.getMinutes() + 15)) {
      const hour = t.getHours()
      if (hour >= 22 || hour < 6) {
        nightMinutes += 15
      }
    }
  })

  return {
    totalHours: Math.floor(totalMinutes / 60),
    nightHours: Math.floor(nightMinutes / 60),
    typeCounts,
    totalCount: duties.length,
    averageFrequency: duties.length > 0 ? (totalMinutes / (duties.length * 60)).toFixed(1) : 0
  }
}

/**
 * Returns all dates that a duty covers (important for overnight shifts).
 */
export function getDutyCoveredDates(duty: DutyEntry): string[] {
  const dates = [duty.date]
  if (duty.endDate && duty.endDate !== duty.date) {
    // Add logic to include all dates between if multi-day
    const start = new Date(duty.date)
    const end = new Date(duty.endDate)
    let current = new Date(start)
    current.setDate(current.getDate() + 1)
    while (current <= end) {
      dates.push(toLocalDateString(current))
      current.setDate(current.getDate() + 1)
    }
  } else {
    // Check if it crosses midnight implicitly
    const start = new Date(`${duty.date}T${duty.startTime}`)
    const end = new Date(`${duty.date}T${duty.endTime}`)
    if (end <= start) {
      const nextDay = new Date(start)
      nextDay.setDate(nextDay.getDate() + 1)
      dates.push(toLocalDateString(nextDay))
    }
  }
  return dates
}
