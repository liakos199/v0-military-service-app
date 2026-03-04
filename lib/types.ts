// Types for the Fantaros military service app

export interface ServiceConfig {
  enlistmentDate: string // ISO date string
  totalDays: number
}

export interface LeaveEntry {
  id: string
  type: LeaveType
  startDate: string
  endDate: string
  days: number
  notes: string
}

export type LeaveType =
  | 'regular'
  | 'student'
  | 'honorary'
  | 'medical'
  | 'emergency'
  | 'other'

export const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
  regular: 'Κανονική',
  student: 'Σπουδαστική',
  honorary: 'Τιμητική',
  medical: 'Αναρρωτική',
  emergency: 'Έκτακτη',
  other: 'Άλλη',
}

export interface DutyEntry {
  id: string
  type: DutyType
  date: string
  startTime: string
  endTime: string
  notes: string
  password?: string      // Σύνθημα (for guard duty)
  countersign?: string   // Παρασύνθημα (for guard duty)
}

// Calendar event - union of duties and leaves for calendar display
export type CalendarEvent =
  | { kind: 'duty'; entry: DutyEntry }
  | { kind: 'leave'; entry: LeaveEntry }

export type DutyType = 'guard' | 'barracks' | 'officer' | 'patrol' | 'kitchen' | 'other'

export const DUTY_TYPE_LABELS: Record<DutyType, string> = {
  guard: 'Σκοπιά',
  barracks: 'Θαλαμοφύλακας',
  officer: 'Αξιωματικός Υπηρεσίας',
  patrol: 'Περίπολος',
  kitchen: 'Μαγειρείο',
  other: 'Άλλη',
}

export interface NoteEntry {
  id: string
  date: string
  content: string
}

export interface DailyPassword {
  date: string
  password: string
  countersign: string
}

// Military guide/manual category
export interface GuideSection {
  id: string
  title: string
  icon: string
  content: string
}

export interface ProfileData {
  fullName: string
  company: string  // Λόχος
  barracks: string // Θάλαμος
  bloodType: string
  reportingPhrase: string
  rank: string
  serviceNumber: string
  weaponCode: string   // Κωδικός Όπλου
  weaponCell: string   // Κελί Όπλου
}

export interface SuperiorEntry {
  id: string
  name: string
  rank: string
  role: string
}

export const RANKS = [
  'Στρατιώτης',
  'Υποδεκανέας',
  'Δεκανέας',
  'Λοχίας',
  'Επιλοχίας',
  'Αρχιλοχίας',
  'Ανθυπασπιστής',
  'Ανθυπολοχαγός',
  'Υπολοχαγός',
  'Λοχαγός',
  'Ταγματάρχης',
  'Αντισυνταγματάρχης',
  'Συνταγματάρχης',
  'Ταξίαρχος',
  'Υποστράτηγος',
  'Αντιστράτηγος',
  'Στρατηγός',
]

export const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

export interface FriendEntry {
  id: string
  name: string
  phone: string
  unit: string // Μονάδα
  notes: string
}

export const EXPENSE_PRESETS = [
  { label: 'Καφές', amount: 1.50 },
  { label: 'Νερό', amount: 0.50 },
  { label: 'Φαγητό', amount: 5.00 },
  { label: 'Σνακ', amount: 2.00 },
  { label: 'Αναψυκτικό', amount: 1.00 },
]

export const SERVICE_DURATION_PRESETS = [
  { label: '6 μήνες', days: 183 },
  { label: '9 μήνες', days: 274 },
  { label: '12 μήνες', days: 365 },
]

export interface ExpenseEntry {
  id: string
  amount: number
  date: string
  description: string
  category: 'canteen' | 'other'
}

export const EXPENSE_CATEGORY_LABELS: Record<'canteen' | 'other', string> = {
  canteen: 'ΚΨΜ',
  other: 'Γενικά',
}

// Greek month names
export const GREEK_MONTHS = [
  'Ιανουάριος', 'Φεβρουάριος', 'Μάρτιος', 'Απρίλιος',
  'Μάιος', 'Ιούνιος', 'Ιούλιος', 'Αύγουστος',
  'Σεπτέμβριος', 'Οκτώβριος', 'Νοέμβριος', 'Δεκέμβριος',
]

export const GREEK_MONTHS_SHORT = [
  'Ιαν', 'Φεβ', 'Μαρ', 'Απρ', 'Μαι', 'Ιουν',
  'Ιουλ', 'Αυγ', 'Σεπ', 'Οκτ', 'Νοε', 'Δεκ',
]

export const GREEK_DAYS = [
  'Κυριακή', 'Δευτέρα', 'Τρίτη', 'Τετάρτη',
  'Πέμπτη', 'Παρασκευή', 'Σάββατο',
]

export const GREEK_DAYS_SHORT = ['Κυ', 'Δε', 'Τρ', 'Τε', 'Πε', 'Πα', 'Σα']
