'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Shield, Palmtree, Trash2, CalendarPlus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { GreekDatePicker } from '@/components/greek-date-picker'
import { BottomSheet } from '@/components/bottom-sheet'
import { hapticFeedback, formatGreekDate, generateId, toLocalDateString, daysBetween } from '@/lib/helpers'
import type { DutyEntry, DutyType, LeaveEntry, LeaveType } from '@/lib/types'
import { DUTY_TYPE_LABELS, LEAVE_TYPE_LABELS, GREEK_MONTHS } from '@/lib/types'

interface DayEvents {
  duties: DutyEntry[]
  leaves: LeaveEntry[]
}

const DUTY_COLORS: Record<DutyType, string> = {
  guard: 'bg-red-500',
  barracks: 'bg-blue-500',
  officer: 'bg-amber-500',
  patrol: 'bg-emerald-500',
  kitchen: 'bg-orange-500',
  other: 'bg-purple-500',
}

const DUTY_COLORS_SOFT: Record<DutyType, string> = {
  guard: 'bg-red-500/15 text-red-400',
  barracks: 'bg-blue-500/15 text-blue-400',
  officer: 'bg-amber-500/15 text-amber-400',
  patrol: 'bg-emerald-500/15 text-emerald-400',
  kitchen: 'bg-orange-500/15 text-orange-400',
  other: 'bg-purple-500/15 text-purple-400',
}

const LEAVE_COLOR = 'bg-teal-400'

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

  // Build a map of date -> events
  const eventsMap = useMemo(() => {
    const map: Record<string, DayEvents> = {}
    duties.forEach((duty) => {
      if (!map[duty.date]) map[duty.date] = { duties: [], leaves: [] }
      map[duty.date].duties.push(duty)
    })
    leaves.forEach((leave) => {
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
  const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1
  const isCurrentMonth = viewMonth === todayDate.getMonth() && viewYear === todayDate.getFullYear()

  const prevMonth = () => {
    hapticFeedback('light')
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1) }
    else setViewMonth(viewMonth - 1)
  }

  const nextMonth = () => {
    hapticFeedback('light')
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1) }
    else setViewMonth(viewMonth + 1)
  }

  const handleDayPress = (day: number) => {
    hapticFeedback('light')
    const m = String(viewMonth + 1).padStart(2, '0')
    const d = String(day).padStart(2, '0')
    const date = `${viewYear}-${m}-${d}`
    setSelectedDate(date)
  }

  const selectedDateEvents = selectedDate ? eventsMap[selectedDate] : null
  const greekDays = ['Δε', 'Τρ', 'Τε', 'Πε', 'Πα', 'Σα', 'Κυ']

  // Upcoming events
  const upcomingDuties = duties
    .filter((d) => d.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 4)
  const upcomingLeaves = leaves
    .filter((l) => l.endDate >= today)
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .slice(0, 2)

  return (
    <div className="flex flex-col gap-5 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground text-balance">Ημερολόγιο</h1>
          <p className="text-xs text-muted-foreground">Βάρδιες, άδειες & πρόγραμμα</p>
        </div>
        {!isCurrentMonth && (
          <button
            onClick={() => {
              hapticFeedback('medium')
              setViewMonth(todayDate.getMonth())
              setViewYear(todayDate.getFullYear())
            }}
            className="px-3.5 py-2 rounded-xl bg-primary/15 min-h-[44px] flex items-center justify-center text-xs font-semibold text-primary"
          >
            Σήμερα
          </button>
        )}
      </div>

      {/* Calendar Card */}
      <div className="glass-card rounded-2xl overflow-hidden">
        {/* Month nav */}
        <div className="flex items-center justify-between px-4 py-3">
          <button
            type="button"
            onClick={prevMonth}
            className="p-2 rounded-xl bg-secondary/60 min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95 transition-transform"
            aria-label="Προηγούμενος μήνας"
          >
            <ChevronLeft className="h-5 w-5 text-foreground" />
          </button>
          <span className="text-base font-bold text-foreground tracking-tight">
            {GREEK_MONTHS[viewMonth]} {viewYear}
          </span>
          <button
            type="button"
            onClick={nextMonth}
            className="p-2 rounded-xl bg-secondary/60 min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95 transition-transform"
            aria-label="Επόμενος μήνας"
          >
            <ChevronRight className="h-5 w-5 text-foreground" />
          </button>
        </div>

        {/* Day names */}
        <div className="grid grid-cols-7 px-3">
          {greekDays.map((d, i) => (
            <div
              key={d}
              className={cn(
                'text-center text-[10px] font-semibold py-2 uppercase tracking-wider',
                i >= 5 ? 'text-muted-foreground/60' : 'text-muted-foreground'
              )}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 px-3 pb-3 gap-y-0.5">
          {Array.from({ length: startDay }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const isToday = dateStr === today
            const isSelected = dateStr === selectedDate
            const dayEvents = eventsMap[dateStr]
            const hasDuty = dayEvents?.duties && dayEvents.duties.length > 0
            const hasLeave = dayEvents?.leaves && dayEvents.leaves.length > 0
            const dayOfWeek = (startDay + i) % 7 // 0=Mon, 6=Sun

            return (
              <button
                key={day}
                type="button"
                onClick={() => handleDayPress(day)}
                className={cn(
                  'aspect-square w-full rounded-2xl text-sm flex flex-col items-center justify-center gap-[3px] transition-all relative',
                  isSelected
                    ? 'bg-primary text-primary-foreground font-bold scale-105'
                    : isToday
                      ? 'bg-primary/15 text-primary font-bold'
                      : dayOfWeek >= 5
                        ? 'text-muted-foreground/70 active:bg-secondary/60'
                        : 'text-foreground active:bg-secondary/60'
                )}
              >
                <span className="text-[13px] leading-none">{day}</span>
                {(hasDuty || hasLeave) && (
                  <div className="flex items-center gap-[3px]">
                    {hasDuty && (
                      <div className={cn(
                        'w-[5px] h-[5px] rounded-full',
                        isSelected ? 'bg-primary-foreground' : 'bg-red-400'
                      )} />
                    )}
                    {hasLeave && (
                      <div className={cn(
                        'w-[5px] h-[5px] rounded-full',
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
        <div className="flex items-center justify-center gap-5 py-2.5 border-t border-border/50 bg-secondary/30">
          <div className="flex items-center gap-1.5">
            <div className="w-[6px] h-[6px] rounded-full bg-red-400" />
            <span className="text-[10px] text-muted-foreground font-medium">Βάρδια</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-[6px] h-[6px] rounded-full bg-teal-400" />
            <span className="text-[10px] text-muted-foreground font-medium">Άδεια</span>
          </div>
        </div>
      </div>

      {/* Selected Day Bottom Sheet */}
      <BottomSheet
        isOpen={!!selectedDate}
        onClose={() => setSelectedDate(null)}
        title={selectedDate ? formatGreekDate(selectedDate) : ''}
        size="auto"
      >
        {selectedDate && (
          <div className="flex flex-col gap-4">
            {/* Today badge */}
            {selectedDate === today && (
              <div className="inline-flex self-start px-2.5 py-1 rounded-lg bg-primary/15">
                <span className="text-[11px] font-bold text-primary uppercase tracking-wider">Σήμερα</span>
              </div>
            )}

            {/* Existing events */}
            {selectedDateEvents && (selectedDateEvents.duties.length > 0 || selectedDateEvents.leaves.length > 0) ? (
              <div className="flex flex-col gap-2">
                {selectedDateEvents.duties.map((duty) => (
                  <div key={duty.id} className="flex items-center gap-3 p-3 rounded-2xl bg-secondary/60">
                    <div className={cn('w-1 self-stretch rounded-full flex-shrink-0', DUTY_COLORS[duty.type])} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-md', DUTY_COLORS_SOFT[duty.type])}>
                          {DUTY_TYPE_LABELS[duty.type]}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{duty.startTime} - {duty.endTime}</p>
                      {duty.notes && <p className="text-[11px] text-muted-foreground/80 mt-0.5 truncate">{duty.notes}</p>}
                    </div>
                    <button
                      onClick={() => {
                        hapticFeedback('medium')
                        setDuties(duties.filter((d) => d.id !== duty.id))
                      }}
                      className="p-2.5 rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center text-destructive/70 active:text-destructive active:bg-destructive/10 transition-colors"
                      aria-label="Διαγραφή"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {selectedDateEvents.leaves.map((leave) => (
                  <div key={leave.id} className="flex items-center gap-3 p-3 rounded-2xl bg-secondary/60">
                    <div className={cn('w-1 self-stretch rounded-full flex-shrink-0', LEAVE_COLOR)} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-500/15 text-teal-400">
                          {LEAVE_TYPE_LABELS[leave.type]}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatGreekDate(leave.startDate)} - {formatGreekDate(leave.endDate)} ({leave.days} ημ.)
                      </p>
                      {leave.notes && <p className="text-[11px] text-muted-foreground/80 mt-0.5 truncate">{leave.notes}</p>}
                    </div>
                    <button
                      onClick={() => {
                        hapticFeedback('medium')
                        setLeaves(leaves.filter((l) => l.id !== leave.id))
                      }}
                      className="p-2.5 rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center text-destructive/70 active:text-destructive active:bg-destructive/10 transition-colors"
                      aria-label="Διαγραφή"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center">
                <CalendarPlus className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground/60">Κενή ημέρα</p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col gap-2 pt-1">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Προσθήκη</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    hapticFeedback('medium')
                    setShowAddDuty(true)
                  }}
                  className="flex items-center gap-3 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 min-h-[56px] active:scale-[0.97] transition-transform text-left"
                >
                  <Shield className="h-5 w-5 text-red-400 flex-shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-foreground block">Βάρδια</span>
                    <span className="text-[10px] text-muted-foreground leading-tight">Σκοπιά, περίπολος...</span>
                  </div>
                </button>
                <button
                  onClick={() => {
                    hapticFeedback('medium')
                    setShowAddLeave(true)
                  }}
                  className="flex items-center gap-3 p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/20 min-h-[56px] active:scale-[0.97] transition-transform text-left"
                >
                  <Palmtree className="h-5 w-5 text-teal-400 flex-shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-foreground block">Άδεια</span>
                    <span className="text-[10px] text-muted-foreground leading-tight">Κανονική, έκτακτη...</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
      </BottomSheet>

      {/* Add Duty Bottom Sheet */}
      <BottomSheet
        isOpen={showAddDuty}
        onClose={() => setShowAddDuty(false)}
        title="Νέα Βάρδια"
        size="full"
      >
        <AddDutyForm
          initialDate={selectedDate || today}
          onAdd={(duty) => {
            setDuties([...duties, duty])
            setShowAddDuty(false)
          }}
          onCancel={() => setShowAddDuty(false)}
        />
      </BottomSheet>

      {/* Add Leave Bottom Sheet */}
      <BottomSheet
        isOpen={showAddLeave}
        onClose={() => setShowAddLeave(false)}
        title="Νέα Άδεια"
        size="full"
      >
        <AddLeaveForm
          initialDate={selectedDate || today}
          onAdd={(leave) => {
            setLeaves([leave, ...leaves])
            setShowAddLeave(false)
          }}
          onCancel={() => setShowAddLeave(false)}
        />
      </BottomSheet>

      {/* Upcoming Events */}
      {(upcomingDuties.length > 0 || upcomingLeaves.length > 0) && (
        <div className="flex flex-col gap-2.5">
          <h2 className="text-sm font-bold text-foreground">Επερχόμενα</h2>
          {upcomingDuties.map((duty) => (
            <button
              key={duty.id}
              onClick={() => {
                hapticFeedback('light')
                const d = new Date(duty.date)
                setViewMonth(d.getMonth())
                setViewYear(d.getFullYear())
                setSelectedDate(duty.date)
              }}
              className="glass-card rounded-2xl p-3.5 flex items-center gap-3 text-left active:scale-[0.98] transition-transform"
            >
              <div className={cn('w-1 h-10 rounded-full flex-shrink-0', DUTY_COLORS[duty.type])} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-md', DUTY_COLORS_SOFT[duty.type])}>
                    {DUTY_TYPE_LABELS[duty.type]}
                  </span>
                  {duty.date === today && (
                    <span className="px-1.5 py-0.5 rounded-md bg-primary/15 text-primary text-[9px] font-bold uppercase">
                      Σήμερα
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {formatGreekDate(duty.date)} | {duty.startTime} - {duty.endTime}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground/40 flex-shrink-0" />
            </button>
          ))}
          {upcomingLeaves.map((leave) => (
            <button
              key={leave.id}
              onClick={() => {
                hapticFeedback('light')
                const d = new Date(leave.startDate)
                setViewMonth(d.getMonth())
                setViewYear(d.getFullYear())
                setSelectedDate(leave.startDate)
              }}
              className="glass-card rounded-2xl p-3.5 flex items-center gap-3 text-left active:scale-[0.98] transition-transform"
            >
              <div className={cn('w-1 h-10 rounded-full flex-shrink-0', LEAVE_COLOR)} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-500/15 text-teal-400">
                    {LEAVE_TYPE_LABELS[leave.type]}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {formatGreekDate(leave.startDate)} - {formatGreekDate(leave.endDate)} ({leave.days} ημ.)
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground/40 flex-shrink-0" />
            </button>
          ))}
        </div>
      )}

      {/* Empty state when no upcoming + nothing selected */}
      {upcomingDuties.length === 0 && upcomingLeaves.length === 0 && (
        <div className="glass-card rounded-2xl p-8 text-center">
          <CalendarPlus className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-medium text-muted-foreground/70">Πάτησε μια μέρα</p>
          <p className="text-xs text-muted-foreground/50 mt-1">για να προσθέσεις βάρδια ή άδεια</p>
        </div>
      )}
    </div>
  )
}

/* ========== FORMS ========== */

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
    onAdd({ id: generateId(), type, date, startTime, endTime, notes })
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="block text-[11px] text-muted-foreground font-medium mb-2 uppercase tracking-wider">Τύπος βάρδιας</label>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(DUTY_TYPE_LABELS) as DutyType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => { hapticFeedback('light'); setType(t) }}
              className={cn(
                'px-3.5 py-2.5 rounded-xl text-xs font-semibold min-h-[44px] transition-all border',
                type === t
                  ? 'bg-primary text-primary-foreground border-primary scale-105'
                  : 'bg-secondary text-secondary-foreground border-border active:scale-95'
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
          <label className="block text-[11px] text-muted-foreground font-medium mb-1.5 uppercase tracking-wider">Αρχή</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full px-3 py-3 rounded-xl bg-secondary text-secondary-foreground text-sm min-h-[48px] border border-border"
          />
        </div>
        <div>
          <label className="block text-[11px] text-muted-foreground font-medium mb-1.5 uppercase tracking-wider">Τέλος</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full px-3 py-3 rounded-xl bg-secondary text-secondary-foreground text-sm min-h-[48px] border border-border"
          />
        </div>
      </div>

      <div>
        <label className="block text-[11px] text-muted-foreground font-medium mb-1.5 uppercase tracking-wider">Σημειώσεις</label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Προαιρετικό..."
          className="w-full px-3 py-3 rounded-xl bg-secondary text-secondary-foreground text-sm min-h-[48px] border border-border placeholder:text-muted-foreground"
        />
      </div>

      <div className="flex gap-2.5 pt-2">
        <button
          onClick={onCancel}
          className="flex-1 py-3.5 rounded-xl bg-secondary text-secondary-foreground font-semibold text-sm min-h-[52px] active:scale-[0.97] transition-transform"
        >
          Ακύρωση
        </button>
        <button
          onClick={handleSubmit}
          disabled={!date}
          className="flex-1 py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm min-h-[52px] disabled:opacity-40 active:scale-[0.97] transition-transform"
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
    onAdd({ id: generateId(), type, startDate, endDate, days, notes })
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="block text-[11px] text-muted-foreground font-medium mb-2 uppercase tracking-wider">Τύπος άδειας</label>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(LEAVE_TYPE_LABELS) as LeaveType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => { hapticFeedback('light'); setType(t) }}
              className={cn(
                'px-3.5 py-2.5 rounded-xl text-xs font-semibold min-h-[44px] transition-all border',
                type === t
                  ? 'bg-primary text-primary-foreground border-primary scale-105'
                  : 'bg-secondary text-secondary-foreground border-border active:scale-95'
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
        <div className="text-center py-3 rounded-xl bg-primary/10 border border-primary/20">
          <span className="text-sm font-bold text-primary">{days} ημέρες</span>
        </div>
      )}

      <div>
        <label className="block text-[11px] text-muted-foreground font-medium mb-1.5 uppercase tracking-wider">Σημειώσεις</label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Προαιρετικό..."
          className="w-full px-3 py-3 rounded-xl bg-secondary text-secondary-foreground text-sm min-h-[48px] border border-border placeholder:text-muted-foreground"
        />
      </div>

      <div className="flex gap-2.5 pt-2">
        <button
          onClick={onCancel}
          className="flex-1 py-3.5 rounded-xl bg-secondary text-secondary-foreground font-semibold text-sm min-h-[52px] active:scale-[0.97] transition-transform"
        >
          Ακύρωση
        </button>
        <button
          onClick={handleSubmit}
          disabled={!startDate || !endDate}
          className="flex-1 py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm min-h-[52px] disabled:opacity-40 active:scale-[0.97] transition-transform"
        >
          Προσθήκη
        </button>
      </div>
    </div>
  )
}
