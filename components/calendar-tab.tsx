'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Shield, Palmtree, X, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { GreekDatePicker } from '@/components/greek-date-picker'
import { FullscreenModal } from '@/components/fullscreen-modal'
import { hapticFeedback, formatGreekDate, generateId, toLocalDateString, daysBetween } from '@/lib/helpers'
import type { DutyEntry, DutyType, LeaveEntry, LeaveType } from '@/lib/types'
import { DUTY_TYPE_LABELS, LEAVE_TYPE_LABELS, GREEK_MONTHS } from '@/lib/types'

interface DayEvents {
  duties: DutyEntry[]
  leaves: LeaveEntry[]
}

const DUTY_COLORS: Record<DutyType, string> = {
  guard: 'bg-red-500/80',
  barracks: 'bg-blue-500/80',
  officer: 'bg-amber-500/80',
  patrol: 'bg-emerald-500/80',
  kitchen: 'bg-orange-500/80',
  other: 'bg-purple-500/80',
}

const LEAVE_COLOR = 'bg-teal-400/80'

export function CalendarTab() {
  const [duties, setDuties] = useLocalStorage<DutyEntry[]>('fantaros-duties', [])
  const [leaves, setLeaves] = useLocalStorage<LeaveEntry[]>('fantaros-leaves', [])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [showAddDuty, setShowAddDuty] = useState(false)
  const [showAddLeave, setShowAddLeave] = useState(false)

  const today = toLocalDateString()
  const todayDate = new Date(today)
  const [viewMonth, setViewMonth] = useState(todayDate.getMonth())
  const [viewYear, setViewYear] = useState(todayDate.getFullYear())

  // Build a map of date -> events for the current month view
  const eventsMap = useMemo(() => {
    const map: Record<string, DayEvents> = {}

    duties.forEach((duty) => {
      if (!map[duty.date]) map[duty.date] = { duties: [], leaves: [] }
      map[duty.date].duties.push(duty)
    })

    leaves.forEach((leave) => {
      // A leave spans multiple days, add it to each day
      const start = new Date(leave.startDate)
      const end = new Date(leave.endDate)
      const cursor = new Date(start)
      while (cursor <= end) {
        const dateStr = toLocalDateString(cursor)
        if (!map[dateStr]) map[dateStr] = { duties: [], leaves: [] }
        map[dateStr].leaves.push(leave)
        cursor.setDate(cursor.getDate() + 1)
      }
    })

    return map
  }, [duties, leaves])

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay()
  // Monday-start: 0=Mon, 6=Sun
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

  const goToToday = () => {
    hapticFeedback('medium')
    const now = new Date()
    setViewMonth(now.getMonth())
    setViewYear(now.getFullYear())
  }

  const handleDayPress = (day: number) => {
    hapticFeedback('light')
    const m = String(viewMonth + 1).padStart(2, '0')
    const d = String(day).padStart(2, '0')
    setSelectedDate(`${viewYear}-${m}-${d}`)
  }

  const selectedDateEvents = selectedDate ? eventsMap[selectedDate] : null

  const greekDaysStartMonday = ['Δε', 'Τρ', 'Τε', 'Πε', 'Πα', 'Σα', 'Κυ']

  // Check if current view is today's month
  const isCurrentMonth = viewMonth === todayDate.getMonth() && viewYear === todayDate.getFullYear()

  return (
    <div className="flex flex-col gap-4 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Ημερολόγιο</h1>
          <p className="text-xs text-muted-foreground">Βάρδιες, άδειες & πρόγραμμα</p>
        </div>
        {!isCurrentMonth && (
          <button
            onClick={goToToday}
            className="px-3 py-2 rounded-xl glass-card min-h-[44px] flex items-center justify-center text-xs font-medium text-primary"
          >
            Σήμερα
          </button>
        )}
      </div>

      {/* Calendar Card */}
      <div className="glass-card rounded-2xl p-4">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
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
            type="button"
            onClick={nextMonth}
            className="p-2 rounded-xl bg-secondary min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Επόμενος μήνας"
          >
            <ChevronRight className="h-5 w-5 text-foreground" />
          </button>
        </div>

        {/* Day names */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {greekDaysStartMonday.map((d) => (
            <div key={d} className="text-center text-[10px] text-muted-foreground font-medium py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startDay }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const isToday = dateStr === today
            const isSelected = dateStr === selectedDate
            const dayEvents = eventsMap[dateStr]
            const hasDuty = dayEvents?.duties.length > 0
            const hasLeave = dayEvents?.leaves.length > 0

            return (
              <button
                key={day}
                type="button"
                onClick={() => handleDayPress(day)}
                className={cn(
                  'aspect-square w-full rounded-xl text-sm flex flex-col items-center justify-center gap-0.5 transition-all relative',
                  isSelected
                    ? 'bg-primary text-primary-foreground font-bold ring-2 ring-primary ring-offset-2 ring-offset-background'
                    : isToday
                      ? 'bg-secondary text-primary font-semibold ring-1 ring-primary'
                      : 'text-foreground active:bg-secondary'
                )}
              >
                <span className="text-[13px] leading-none">{day}</span>
                {/* Event indicators */}
                {(hasDuty || hasLeave) && (
                  <div className="flex items-center gap-0.5">
                    {hasDuty && (
                      <div className={cn(
                        'w-1.5 h-1.5 rounded-full',
                        isSelected ? 'bg-primary-foreground' : 'bg-red-400'
                      )} />
                    )}
                    {hasLeave && (
                      <div className={cn(
                        'w-1.5 h-1.5 rounded-full',
                        isSelected ? 'bg-primary-foreground' : 'bg-teal-400'
                      )} />
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
            <div className="w-2 h-2 rounded-full bg-red-400" />
            <span className="text-[10px] text-muted-foreground">Βάρδια</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-teal-400" />
            <span className="text-[10px] text-muted-foreground">Άδεια</span>
          </div>
        </div>
      </div>

      {/* Selected Day Panel */}
      {selectedDate && (
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground">
              {formatGreekDate(selectedDate)}
              {selectedDate === today && (
                <span className="ml-2 px-1.5 py-0.5 rounded-md bg-primary/20 text-primary text-[10px] font-bold align-middle">
                  ΣΗΜΕΡΑ
                </span>
              )}
            </h2>
            <button
              onClick={() => {
                hapticFeedback('light')
                setSelectedDate(null)
              }}
              className="p-2 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center text-muted-foreground"
              aria-label="Κλείσιμο"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Existing events for this day */}
          {selectedDateEvents && (selectedDateEvents.duties.length > 0 || selectedDateEvents.leaves.length > 0) && (
            <div className="flex flex-col gap-2 mb-4">
              {selectedDateEvents.duties.map((duty) => (
                <div key={duty.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-secondary/60">
                  <div className={cn('w-1 h-8 rounded-full flex-shrink-0', DUTY_COLORS[duty.type])} />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold text-foreground">{DUTY_TYPE_LABELS[duty.type]}</span>
                    <p className="text-[10px] text-muted-foreground">{duty.startTime} - {duty.endTime}</p>
                    {duty.notes && <p className="text-[10px] text-muted-foreground truncate">{duty.notes}</p>}
                  </div>
                  <button
                    onClick={() => {
                      hapticFeedback('medium')
                      setDuties(duties.filter((d) => d.id !== duty.id))
                    }}
                    className="p-2 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center text-destructive"
                    aria-label="Διαγραφή"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {selectedDateEvents.leaves.map((leave) => (
                <div key={leave.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-secondary/60">
                  <div className={cn('w-1 h-8 rounded-full flex-shrink-0', LEAVE_COLOR)} />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold text-foreground">{LEAVE_TYPE_LABELS[leave.type]}</span>
                    <p className="text-[10px] text-muted-foreground">
                      {formatGreekDate(leave.startDate)} - {formatGreekDate(leave.endDate)} ({leave.days} ημ.)
                    </p>
                    {leave.notes && <p className="text-[10px] text-muted-foreground truncate">{leave.notes}</p>}
                  </div>
                  <button
                    onClick={() => {
                      hapticFeedback('medium')
                      setLeaves(leaves.filter((l) => l.id !== leave.id))
                    }}
                    className="p-2 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center text-destructive"
                    aria-label="Διαγραφή"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col gap-2">
            <h3 className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Προσθήκη</h3>
            <div className="grid grid-cols-2 gap-2">
              <ActionButton
                icon={Shield}
                label="Βάρδια"
                description="Σκοπιά, θαλαμοφύλακας..."
                onClick={() => {
                  hapticFeedback('medium')
                  setShowAddDuty(true)
                }}
              />
              <ActionButton
                icon={Palmtree}
                label="Άδεια"
                description="Κανονική, αναρρωτική..."
                onClick={() => {
                  hapticFeedback('medium')
                  setShowAddLeave(true)
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Prompt to select a date if nothing is selected */}
      {!selectedDate && (
        <div className="glass-card rounded-xl p-6 text-center">
          <p className="text-sm text-muted-foreground">Πάτησε μια ημέρα για να δεις ή να προσθέσεις</p>
        </div>
      )}

      {/* Add Duty Modal */}
      <FullscreenModal
        isOpen={showAddDuty}
        onClose={() => setShowAddDuty(false)}
        title="Νέα Βάρδια"
      >
        <AddDutyForm
          initialDate={selectedDate || today}
          onAdd={(duty) => {
            setDuties([...duties, duty])
            setShowAddDuty(false)
          }}
          onCancel={() => setShowAddDuty(false)}
        />
      </FullscreenModal>

      {/* Add Leave Modal */}
      <FullscreenModal
        isOpen={showAddLeave}
        onClose={() => setShowAddLeave(false)}
        title="Νέα Άδεια"
      >
        <AddLeaveForm
          initialDate={selectedDate || today}
          onAdd={(leave) => {
            setLeaves([leave, ...leaves])
            setShowAddLeave(false)
          }}
          onCancel={() => setShowAddLeave(false)}
        />
      </FullscreenModal>

      {/* Upcoming events section */}
      <UpcomingEvents duties={duties} leaves={leaves} today={today} onDateSelect={(date) => {
        const d = new Date(date)
        setViewMonth(d.getMonth())
        setViewYear(d.getFullYear())
        setSelectedDate(date)
      }} />
    </div>
  )
}

function ActionButton({ icon: Icon, label, description, onClick }: {
  icon: typeof Shield
  label: string
  description: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-start gap-1 p-3 rounded-xl bg-secondary/60 min-h-[64px] active:scale-[0.97] transition-transform text-left"
    >
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <span className="text-xs font-semibold text-foreground">{label}</span>
      </div>
      <span className="text-[10px] text-muted-foreground leading-tight">{description}</span>
    </button>
  )
}

function UpcomingEvents({ duties, leaves, today, onDateSelect }: {
  duties: DutyEntry[]
  leaves: LeaveEntry[]
  today: string
  onDateSelect: (date: string) => void
}) {
  // Get next 5 upcoming duties
  const upcomingDuties = duties
    .filter((d) => d.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
    .slice(0, 5)

  // Get active/upcoming leaves
  const upcomingLeaves = leaves
    .filter((l) => l.endDate >= today)
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .slice(0, 3)

  if (upcomingDuties.length === 0 && upcomingLeaves.length === 0) return null

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-sm font-semibold text-foreground">Επερχόμενα</h2>
      {upcomingDuties.map((duty) => (
        <button
          key={duty.id}
          onClick={() => {
            hapticFeedback('light')
            onDateSelect(duty.date)
          }}
          className="glass-card rounded-xl p-3 flex items-center gap-3 text-left active:scale-[0.98] transition-transform"
        >
          <div className={cn('w-1 h-10 rounded-full flex-shrink-0', DUTY_COLORS[duty.type])} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-foreground">{DUTY_TYPE_LABELS[duty.type]}</span>
              {duty.date === today && (
                <span className="px-1.5 py-0.5 rounded-md bg-primary/20 text-primary text-[10px] font-bold">
                  ΣΗΜΕΡΑ
                </span>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {formatGreekDate(duty.date)} | {duty.startTime} - {duty.endTime}
            </p>
          </div>
        </button>
      ))}
      {upcomingLeaves.map((leave) => (
        <button
          key={leave.id}
          onClick={() => {
            hapticFeedback('light')
            onDateSelect(leave.startDate)
          }}
          className="glass-card rounded-xl p-3 flex items-center gap-3 text-left active:scale-[0.98] transition-transform"
        >
          <div className={cn('w-1 h-10 rounded-full flex-shrink-0', LEAVE_COLOR)} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-foreground">{LEAVE_TYPE_LABELS[leave.type]}</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {formatGreekDate(leave.startDate)} - {formatGreekDate(leave.endDate)} ({leave.days} ημ.)
            </p>
          </div>
        </button>
      ))}
    </div>
  )
}

function AddDutyForm({ initialDate, onAdd, onCancel }: {
  initialDate: string
  onAdd: (duty: DutyEntry) => void
  onCancel: () => void
}) {
  const [type, setType] = useState<DutyType>('guard')
  const [date, setDate] = useState(initialDate)
  const [startTime, setStartTime] = useState('08:00')
  const [endTime, setEndTime] = useState('08:00')
  const [notes, setNotes] = useState('')

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

function AddLeaveForm({ initialDate, onAdd, onCancel }: {
  initialDate: string
  onAdd: (leave: LeaveEntry) => void
  onCancel: () => void
}) {
  const [type, setType] = useState<LeaveType>('regular')
  const [startDate, setStartDate] = useState(initialDate)
  const [endDate, setEndDate] = useState(initialDate)
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
