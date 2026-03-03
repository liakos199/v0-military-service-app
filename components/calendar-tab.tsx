'use client'

import { useState, useMemo, useCallback } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Shield,
  Home,
  Eye,
  EyeOff,
  Palmtree,
  UtensilsCrossed,
  Footprints,
  HelpCircle,
  Clock,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { GreekDatePicker } from '@/components/greek-date-picker'
import { FullscreenModal } from '@/components/fullscreen-modal'
import {
  hapticFeedback,
  formatGreekDate,
  generateId,
  toLocalDateString,
  daysBetween,
} from '@/lib/helpers'
import type { DutyEntry, DutyType, LeaveEntry, LeaveType } from '@/lib/types'
import { DUTY_TYPE_LABELS, LEAVE_TYPE_LABELS, GREEK_MONTHS } from '@/lib/types'

type ActionType = 'duty' | 'leave'

const DUTY_ICONS: Record<DutyType, typeof Shield> = {
  guard: Shield,
  barracks: Home,
  officer: Shield,
  patrol: Footprints,
  kitchen: UtensilsCrossed,
  other: HelpCircle,
}

export function CalendarTab() {
  const [duties, setDuties] = useLocalStorage<DutyEntry[]>('fantaros-duties', [])
  const [leaves, setLeaves] = useLocalStorage<LeaveEntry[]>('fantaros-leaves', [])
  const today = toLocalDateString()
  const todayDate = new Date()

  const [viewMonth, setViewMonth] = useState(todayDate.getMonth())
  const [viewYear, setViewYear] = useState(todayDate.getFullYear())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [showActionSheet, setShowActionSheet] = useState(false)
  const [showAddDuty, setShowAddDuty] = useState(false)
  const [showAddLeave, setShowAddLeave] = useState(false)
  const [showDayDetail, setShowDayDetail] = useState(false)

  // Build a map of date -> events for quick lookup
  const dateEventsMap = useMemo(() => {
    const map: Record<string, { duties: DutyEntry[]; leaves: LeaveEntry[] }> = {}
    duties.forEach((d) => {
      if (!map[d.date]) map[d.date] = { duties: [], leaves: [] }
      map[d.date].duties.push(d)
    })
    leaves.forEach((l) => {
      // Mark all days in the leave range
      const start = new Date(l.startDate)
      const end = new Date(l.endDate)
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const key = toLocalDateString(d)
        if (!map[key]) map[key] = { duties: [], leaves: [] }
        if (!map[key].leaves.find((le) => le.id === l.id)) {
          map[key].leaves.push(l)
        }
      }
    })
    return map
  }, [duties, leaves])

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay()
  const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1

  const prevMonth = () => {
    hapticFeedback('light')
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear(viewYear - 1)
    } else {
      setViewMonth(viewMonth - 1)
    }
  }

  const nextMonth = () => {
    hapticFeedback('light')
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear(viewYear + 1)
    } else {
      setViewMonth(viewMonth + 1)
    }
  }

  const handleDayPress = (day: number) => {
    hapticFeedback('medium')
    const m = String(viewMonth + 1).padStart(2, '0')
    const d = String(day).padStart(2, '0')
    const dateStr = `${viewYear}-${m}-${d}`
    setSelectedDate(dateStr)

    const events = dateEventsMap[dateStr]
    if (events && (events.duties.length > 0 || events.leaves.length > 0)) {
      setShowDayDetail(true)
    } else {
      setShowActionSheet(true)
    }
  }

  const handleAddDuty = useCallback(
    (duty: DutyEntry) => {
      setDuties([...duties, duty])
      setShowAddDuty(false)
      setShowActionSheet(false)
    },
    [duties, setDuties]
  )

  const handleAddLeave = useCallback(
    (leave: LeaveEntry) => {
      setLeaves([leave, ...leaves])
      setShowAddLeave(false)
      setShowActionSheet(false)
    },
    [leaves, setLeaves]
  )

  const handleDeleteDuty = useCallback(
    (id: string) => {
      hapticFeedback('medium')
      setDuties(duties.filter((d) => d.id !== id))
    },
    [duties, setDuties]
  )

  const handleDeleteLeave = useCallback(
    (id: string) => {
      hapticFeedback('medium')
      setLeaves(leaves.filter((l) => l.id !== id))
    },
    [leaves, setLeaves]
  )

  const greekDaysStartMonday = ['Δε', 'Τρ', 'Τε', 'Πε', 'Πα', 'Σα', 'Κυ']

  const selectedEvents = selectedDate ? dateEventsMap[selectedDate] : null

  return (
    <div className="flex flex-col gap-4 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Ημερολόγιο</h1>
          <p className="text-xs text-muted-foreground">Βάρδιες, άδειες & υπηρεσίες</p>
        </div>
        <button
          onClick={() => {
            hapticFeedback('light')
            setSelectedDate(today)
            setShowActionSheet(true)
          }}
          className="p-3 rounded-xl glass-card min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Προσθήκη"
        >
          <Plus className="h-5 w-5 text-primary" />
        </button>
      </div>

      {/* Calendar Card */}
      <div className="glass-card rounded-2xl p-4">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={prevMonth}
            className="p-2 rounded-xl bg-secondary min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Προηγούμενος μήνας"
          >
            <ChevronLeft className="h-5 w-5 text-foreground" />
          </button>
          <span className="text-base font-semibold text-foreground">
            {GREEK_MONTHS[viewMonth]} {viewYear}
          </span>
          <button
            onClick={nextMonth}
            className="p-2 rounded-xl bg-secondary min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Επόμενος μήνας"
          >
            <ChevronRight className="h-5 w-5 text-foreground" />
          </button>
        </div>

        {/* Day Names */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {greekDaysStartMonday.map((d) => (
            <div
              key={d}
              className="text-center text-[10px] text-muted-foreground font-medium py-1"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const isToday = dateStr === today
            const isSelected = dateStr === selectedDate
            const events = dateEventsMap[dateStr]
            const hasDuty = events?.duties && events.duties.length > 0
            const hasLeave = events?.leaves && events.leaves.length > 0

            return (
              <button
                key={day}
                onClick={() => handleDayPress(day)}
                className={cn(
                  'relative aspect-square w-full rounded-xl text-sm flex flex-col items-center justify-center transition-colors min-h-[44px]',
                  isSelected
                    ? 'bg-primary text-primary-foreground font-bold'
                    : isToday
                      ? 'bg-secondary text-primary font-semibold ring-1 ring-primary'
                      : 'text-foreground active:bg-secondary'
                )}
              >
                <span className="text-xs leading-none">{day}</span>
                {/* Event dots */}
                {(hasDuty || hasLeave) && (
                  <div className="flex gap-0.5 mt-0.5">
                    {hasDuty && (
                      <span
                        className={cn(
                          'w-1.5 h-1.5 rounded-full',
                          isSelected ? 'bg-primary-foreground' : 'bg-chart-3'
                        )}
                      />
                    )}
                    {hasLeave && (
                      <span
                        className={cn(
                          'w-1.5 h-1.5 rounded-full',
                          isSelected ? 'bg-primary-foreground' : 'bg-chart-2'
                        )}
                      />
                    )}
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-border">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-chart-3" />
            <span className="text-[10px] text-muted-foreground">Υπηρεσία</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-chart-2" />
            <span className="text-[10px] text-muted-foreground">Άδεια</span>
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      <UpcomingEvents
        duties={duties}
        leaves={leaves}
        today={today}
        onDeleteDuty={handleDeleteDuty}
        onDeleteLeave={handleDeleteLeave}
        onSelectDate={(date) => {
          setSelectedDate(date)
          setShowDayDetail(true)
        }}
      />

      {/* Action Sheet - Choose what to add */}
      {showActionSheet && selectedDate && (
        <div
          className="fixed inset-0 z-[90] flex items-end justify-center bg-background/80 backdrop-blur-sm"
          onClick={() => setShowActionSheet(false)}
        >
          <div
            className="w-full max-w-lg bg-card rounded-t-2xl p-4 pb-8 border-t border-glass-border safe-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full bg-muted-foreground/30 mx-auto mb-4" />
            <p className="text-sm font-semibold text-foreground text-center mb-1">
              {formatGreekDate(selectedDate)}
            </p>
            <p className="text-xs text-muted-foreground text-center mb-4">
              Τι θέλεις να προσθέσεις;
            </p>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  hapticFeedback('light')
                  setShowAddDuty(true)
                }}
                className="flex items-center gap-3 p-4 rounded-xl bg-secondary min-h-[56px] active:scale-[0.98] transition-transform"
              >
                <div className="w-10 h-10 rounded-lg bg-chart-3/20 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-chart-3" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-foreground">Προσθήκη Υπηρεσίας</p>
                  <p className="text-[10px] text-muted-foreground">Σκοπιά, Θαλαμοφύλακας, κ.ά.</p>
                </div>
              </button>

              <button
                onClick={() => {
                  hapticFeedback('light')
                  setShowAddLeave(true)
                }}
                className="flex items-center gap-3 p-4 rounded-xl bg-secondary min-h-[56px] active:scale-[0.98] transition-transform"
              >
                <div className="w-10 h-10 rounded-lg bg-chart-2/20 flex items-center justify-center">
                  <Palmtree className="h-5 w-5 text-chart-2" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-foreground">Προσθήκη Άδειας</p>
                  <p className="text-[10px] text-muted-foreground">Κανονική, Σπουδαστική, κ.ά.</p>
                </div>
              </button>

              <button
                onClick={() => setShowActionSheet(false)}
                className="py-3 rounded-xl bg-secondary text-muted-foreground font-medium text-sm min-h-[48px] mt-1"
              >
                Ακύρωση
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Duty Modal */}
      <FullscreenModal
        isOpen={showAddDuty}
        onClose={() => {
          setShowAddDuty(false)
          setShowActionSheet(false)
        }}
        title="Νέα Υπηρεσία"
      >
        <AddDutyForm
          initialDate={selectedDate || today}
          onAdd={handleAddDuty}
          onCancel={() => {
            setShowAddDuty(false)
            setShowActionSheet(false)
          }}
        />
      </FullscreenModal>

      {/* Add Leave Modal */}
      <FullscreenModal
        isOpen={showAddLeave}
        onClose={() => {
          setShowAddLeave(false)
          setShowActionSheet(false)
        }}
        title="Νέα Άδεια"
      >
        <AddLeaveForm
          initialDate={selectedDate || today}
          onAdd={handleAddLeave}
          onCancel={() => {
            setShowAddLeave(false)
            setShowActionSheet(false)
          }}
        />
      </FullscreenModal>

      {/* Day Detail Modal */}
      <FullscreenModal
        isOpen={showDayDetail}
        onClose={() => setShowDayDetail(false)}
        title={selectedDate ? formatGreekDate(selectedDate) : ''}
      >
        {selectedDate && (
          <DayDetailView
            date={selectedDate}
            events={selectedEvents}
            onDeleteDuty={handleDeleteDuty}
            onDeleteLeave={handleDeleteLeave}
            onAddNew={() => {
              setShowDayDetail(false)
              setShowActionSheet(true)
            }}
          />
        )}
      </FullscreenModal>
    </div>
  )
}

/* ---------- Upcoming Events ---------- */
function UpcomingEvents({
  duties,
  leaves,
  today,
  onDeleteDuty,
  onDeleteLeave,
  onSelectDate,
}: {
  duties: DutyEntry[]
  leaves: LeaveEntry[]
  today: string
  onDeleteDuty: (id: string) => void
  onDeleteLeave: (id: string) => void
  onSelectDate: (date: string) => void
}) {
  const upcoming = useMemo(() => {
    const items: { type: 'duty' | 'leave'; date: string; entry: DutyEntry | LeaveEntry }[] = []
    duties
      .filter((d) => d.date >= today)
      .forEach((d) => items.push({ type: 'duty', date: d.date, entry: d }))
    leaves
      .filter((l) => l.endDate >= today)
      .forEach((l) => items.push({ type: 'leave', date: l.startDate, entry: l }))
    return items.sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5)
  }, [duties, leaves, today])

  if (upcoming.length === 0) {
    return (
      <div className="glass-card rounded-xl p-6 text-center">
        <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Δεν υπάρχουν προσεχή γεγονότα</p>
        <p className="text-xs text-muted-foreground mt-1">Πάτησε μια ημερομηνία για να προσθέσεις</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-sm font-semibold text-foreground">Προσεχώς</h2>
      {upcoming.map((item) => {
        const isToday = item.date === today
        if (item.type === 'duty') {
          const duty = item.entry as DutyEntry
          const Icon = DUTY_ICONS[duty.type]
          return (
            <button
              key={duty.id}
              onClick={() => onSelectDate(duty.date)}
              className={cn(
                'glass-card rounded-xl p-3 flex items-center gap-3 text-left w-full',
                isToday && 'ring-1 ring-primary/30'
              )}
            >
              <div className={cn('w-1 h-10 rounded-full flex-shrink-0', isToday ? 'bg-primary' : 'bg-chart-3')} />
              <div className="w-9 h-9 rounded-lg bg-chart-3/20 flex items-center justify-center flex-shrink-0">
                <Icon className="h-4 w-4 text-chart-3" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">{DUTY_TYPE_LABELS[duty.type]}</span>
                  {isToday && (
                    <span className="px-1.5 py-0.5 rounded-md bg-primary/20 text-primary text-[10px] font-bold">
                      ΣΗΜΕΡΑ
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatGreekDate(duty.date)} &middot; {duty.startTime} - {duty.endTime}
                </p>
              </div>
            </button>
          )
        } else {
          const leave = item.entry as LeaveEntry
          return (
            <button
              key={leave.id}
              onClick={() => onSelectDate(leave.startDate)}
              className="glass-card rounded-xl p-3 flex items-center gap-3 text-left w-full"
            >
              <div className="w-1 h-10 rounded-full flex-shrink-0 bg-chart-2" />
              <div className="w-9 h-9 rounded-lg bg-chart-2/20 flex items-center justify-center flex-shrink-0">
                <Palmtree className="h-4 w-4 text-chart-2" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-semibold text-foreground">{LEAVE_TYPE_LABELS[leave.type]}</span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatGreekDate(leave.startDate)} - {formatGreekDate(leave.endDate)} &middot; {leave.days} ημ.
                </p>
              </div>
            </button>
          )
        }
      })}
    </div>
  )
}

/* ---------- Day Detail View ---------- */
function DayDetailView({
  date,
  events,
  onDeleteDuty,
  onDeleteLeave,
  onAddNew,
}: {
  date: string
  events: { duties: DutyEntry[]; leaves: LeaveEntry[] } | null | undefined
  onDeleteDuty: (id: string) => void
  onDeleteLeave: (id: string) => void
  onAddNew: () => void
}) {
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({})

  const togglePassword = (id: string) => {
    hapticFeedback('light')
    setShowPasswords((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const hasDuties = events?.duties && events.duties.length > 0
  const hasLeaves = events?.leaves && events.leaves.length > 0

  return (
    <div className="flex flex-col gap-4">
      {/* Duties */}
      {hasDuties && (
        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Υπηρεσίες
          </h3>
          {events!.duties.map((duty) => {
            const Icon = DUTY_ICONS[duty.type]
            const isGuard = duty.type === 'guard'
            const hasPassword = isGuard && (duty.password || duty.countersign)
            const visible = showPasswords[duty.id]

            return (
              <div key={duty.id} className="glass-card rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-chart-3/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-5 w-5 text-chart-3" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{DUTY_TYPE_LABELS[duty.type]}</p>
                    <p className="text-xs text-muted-foreground">{duty.startTime} - {duty.endTime}</p>
                    {duty.notes && (
                      <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{duty.notes}</p>
                    )}
                  </div>
                  <button
                    onClick={() => onDeleteDuty(duty.id)}
                    className="p-2 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center text-destructive flex-shrink-0"
                    aria-label="Διαγραφή"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Password display for guard duty */}
                {isGuard && hasPassword && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                        Σύνθημα / Παρασύνθημα
                      </p>
                      <button
                        onClick={() => togglePassword(duty.id)}
                        className="p-1.5 rounded-lg min-h-[36px] min-w-[36px] flex items-center justify-center"
                        aria-label={visible ? 'Απόκρυψη' : 'Εμφάνιση'}
                      >
                        {visible ? (
                          <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                        ) : (
                          <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 rounded-lg bg-secondary">
                        <p className="text-[9px] text-muted-foreground uppercase mb-0.5">Σύνθημα</p>
                        <p className={cn('text-sm font-mono font-bold', visible ? 'text-foreground' : 'text-foreground blur-sm select-none')}>
                          {duty.password || '---'}
                        </p>
                      </div>
                      <div className="p-2 rounded-lg bg-secondary">
                        <p className="text-[9px] text-muted-foreground uppercase mb-0.5">Παρασύνθημα</p>
                        <p className={cn('text-sm font-mono font-bold', visible ? 'text-foreground' : 'text-foreground blur-sm select-none')}>
                          {duty.countersign || '---'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Leaves */}
      {hasLeaves && (
        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Άδειες
          </h3>
          {events!.leaves.map((leave) => (
            <div key={leave.id} className="glass-card rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-chart-2/20 flex items-center justify-center flex-shrink-0">
                <Palmtree className="h-5 w-5 text-chart-2" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{LEAVE_TYPE_LABELS[leave.type]}</p>
                <p className="text-xs text-muted-foreground">
                  {formatGreekDate(leave.startDate)} - {formatGreekDate(leave.endDate)} &middot; {leave.days} ημ.
                </p>
                {leave.notes && (
                  <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{leave.notes}</p>
                )}
              </div>
              <button
                onClick={() => onDeleteLeave(leave.id)}
                className="p-2 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center text-destructive flex-shrink-0"
                aria-label="Διαγραφή"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add New Button */}
      <button
        onClick={onAddNew}
        className="flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm min-h-[48px]"
      >
        <Plus className="h-4 w-4" />
        Προσθήκη
      </button>
    </div>
  )
}

/* ---------- Add Duty Form ---------- */
function AddDutyForm({
  initialDate,
  onAdd,
  onCancel,
}: {
  initialDate: string
  onAdd: (duty: DutyEntry) => void
  onCancel: () => void
}) {
  const [type, setType] = useState<DutyType>('guard')
  const [date, setDate] = useState(initialDate)
  const [startTime, setStartTime] = useState('08:00')
  const [endTime, setEndTime] = useState('08:00')
  const [notes, setNotes] = useState('')
  const [password, setPassword] = useState('')
  const [countersign, setCountersign] = useState('')

  const handleSubmit = () => {
    if (!date || !startTime || !endTime) return
    hapticFeedback('heavy')
    onAdd({
      id: generateId(),
      type,
      date,
      startTime,
      endTime,
      notes,
      ...(type === 'guard' ? { password, countersign } : {}),
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="block text-xs text-muted-foreground mb-1.5">Τύπος</label>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(DUTY_TYPE_LABELS) as DutyType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                hapticFeedback('light')
                setType(t)
              }}
              className={cn(
                'px-3 py-2 rounded-lg text-xs font-medium min-h-[40px] transition-colors',
                type === t
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground'
              )}
            >
              {DUTY_TYPE_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      <GreekDatePicker value={date} onChange={setDate} label="Ημερομηνία" />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-muted-foreground mb-1.5">Αρχή</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full px-3 py-3 rounded-lg bg-secondary text-secondary-foreground text-sm min-h-[48px] border border-border"
          />
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1.5">Τέλος</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full px-3 py-3 rounded-lg bg-secondary text-secondary-foreground text-sm min-h-[48px] border border-border"
          />
        </div>
      </div>

      {/* Password fields for guard duty */}
      {type === 'guard' && (
        <div className="p-3 rounded-xl bg-secondary/50 border border-border flex flex-col gap-3">
          <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-primary" />
            Σύνθημα & Παρασύνθημα
          </p>
          <div>
            <label className="block text-[10px] text-muted-foreground mb-1">Σύνθημα</label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Εισαγωγή συνθήματος..."
              className="w-full px-3 py-3 rounded-lg bg-secondary text-secondary-foreground text-sm min-h-[48px] border border-border font-mono placeholder:text-muted-foreground placeholder:font-sans"
            />
          </div>
          <div>
            <label className="block text-[10px] text-muted-foreground mb-1">Παρασύνθημα</label>
            <input
              type="text"
              value={countersign}
              onChange={(e) => setCountersign(e.target.value)}
              placeholder="Εισαγωγή παρασυνθήματος..."
              className="w-full px-3 py-3 rounded-lg bg-secondary text-secondary-foreground text-sm min-h-[48px] border border-border font-mono placeholder:text-muted-foreground placeholder:font-sans"
            />
          </div>
        </div>
      )}

      <div>
        <label className="block text-xs text-muted-foreground mb-1.5">Σημειώσεις</label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Προαιρετικό..."
          className="w-full px-3 py-3 rounded-lg bg-secondary text-secondary-foreground text-sm min-h-[48px] border border-border placeholder:text-muted-foreground"
        />
      </div>

      <div className="flex gap-2 pt-2">
        <button
          onClick={onCancel}
          className="flex-1 py-3 rounded-lg bg-secondary text-secondary-foreground font-medium text-sm min-h-[48px]"
        >
          Ακύρωση
        </button>
        <button
          onClick={handleSubmit}
          disabled={!date}
          className="flex-1 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm min-h-[48px] disabled:opacity-40"
        >
          Προσθήκη
        </button>
      </div>
    </div>
  )
}

/* ---------- Add Leave Form ---------- */
function AddLeaveForm({
  initialDate,
  onAdd,
  onCancel,
}: {
  initialDate: string
  onAdd: (leave: LeaveEntry) => void
  onCancel: () => void
}) {
  const [type, setType] = useState<LeaveType>('regular')
  const [startDate, setStartDate] = useState(initialDate)
  const [endDate, setEndDate] = useState('')
  const [notes, setNotes] = useState('')

  const days = startDate && endDate ? Math.max(0, daysBetween(startDate, endDate) + 1) : 0

  const handleSubmit = () => {
    if (!startDate || !endDate) return
    hapticFeedback('heavy')
    onAdd({
      id: generateId(),
      type,
      startDate,
      endDate,
      days,
      notes,
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="block text-xs text-muted-foreground mb-1.5">Τύπος</label>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(LEAVE_TYPE_LABELS) as LeaveType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                hapticFeedback('light')
                setType(t)
              }}
              className={cn(
                'px-3 py-2 rounded-lg text-xs font-medium min-h-[40px] transition-colors',
                type === t
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground'
              )}
            >
              {LEAVE_TYPE_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      <GreekDatePicker value={startDate} onChange={setStartDate} label="Από" />
      <GreekDatePicker value={endDate} onChange={setEndDate} label="Έως" />

      {days > 0 && (
        <div className="text-center py-2 rounded-lg bg-primary/10">
          <span className="text-sm font-semibold text-primary">{days} ημέρες</span>
        </div>
      )}

      <div>
        <label className="block text-xs text-muted-foreground mb-1.5">Σημειώσεις</label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Προαιρετικό..."
          className="w-full px-3 py-3 rounded-lg bg-secondary text-secondary-foreground text-sm min-h-[48px] border border-border placeholder:text-muted-foreground"
        />
      </div>

      <div className="flex gap-2 pt-2">
        <button
          onClick={onCancel}
          className="flex-1 py-3 rounded-lg bg-secondary text-secondary-foreground font-medium text-sm min-h-[48px]"
        >
          Ακύρωση
        </button>
        <button
          onClick={handleSubmit}
          disabled={!startDate || !endDate}
          className="flex-1 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm min-h-[48px] disabled:opacity-40"
        >
          Προσθήκη
        </button>
      </div>
    </div>
  )
}
