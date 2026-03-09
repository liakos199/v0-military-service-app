// Types for the ΑΠΟΛΕΛΕ PRO military service app

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
  prison: 'Φυλακή',
  detention: 'Κράτηση',
}

export interface DutyEntry {
  id: string
  type: DutyType
  date: string
  startTime?: string
  endTime?: string
  notes: string
  prisonDays?: number    // For prison entries
  password?: string      // Σύνθημα (for guard duty)
  countersign?: string   // Παρασύνθημα (for guard duty)
}

// Calendar event - union of duties and leaves for calendar display
export type CalendarEvent =
  | { kind: 'duty'; entry: DutyEntry }
  | { kind: 'leave'; entry: LeaveEntry }

export type DutyType = 'guard' | 'barracks' | 'officer' | 'patrol' | 'kitchen' | 'other' | 'prison' | 'detention'

export const DUTY_TYPE_LABELS: Record<DutyType, string> = {
  guard: 'Σκοπιά',
  barracks: 'Θαλαμοφύλακας',
  officer: 'Αξιωματικός Υπηρεσίας',
  patrol: 'Περίπολος',
  kitchen: 'Μαγειρείο',
  other: 'Άλλη',
  prison: 'Φυλακή',
  detention: 'Κράτηση',
}

export interface NoteEntry {
  id: string
  date: string
  title: string
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
  phone?: string
}

export const RANKS = [
  'ΝΕΟΣΥΛΛΕΚΤΟΣ',
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

export interface ExpensePreset {
  id: string
  label: string
  amount: number
}

export const DEFAULT_EXPENSE_PRESETS: ExpensePreset[] = [
  { id: 'default-1', label: 'Καφές', amount: 1.50 },
  { id: 'default-2', label: 'Νερό', amount: 0.50 },
  { id: 'default-3', label: 'Φαγητό', amount: 5.00 },
  { id: 'default-4', label: 'Σνακ', amount: 2.00 },
  { id: 'default-5', label: 'Αναψυκτικό', amount: 1.00 },
]

/** @deprecated Use DEFAULT_EXPENSE_PRESETS instead */
export const EXPENSE_PRESETS = DEFAULT_EXPENSE_PRESETS

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

// Canteen Catalog (Κ.Ψ.Μ. Κατάλογος)
export interface CanteenCatalogItem {
  id: string
  name: string
  price: number
  category: 'food' | 'beverage' | 'snack' | 'other'
  description?: string
  available: boolean
}

export const CANTEEN_CATEGORY_LABELS: Record<'food' | 'beverage' | 'snack' | 'other', string> = {
  food: 'Φαγητό',
  beverage: 'Ποτό',
  snack: 'Σνακ',
  other: 'Άλλο',
}
