export function hapticFeedback(type: 'light' | 'medium' | 'heavy' = 'light') {
  if (typeof window === 'undefined') return
  if (!('vibrate' in navigator)) return

  const durations = {
    light: 10,
    medium: 20,
    heavy: 40,
  }

  try {
    navigator.vibrate(durations[type])
  } catch {
    // Vibration not supported
  }
}

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
  const diff = d2.getTime() - d1.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

export function toLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
