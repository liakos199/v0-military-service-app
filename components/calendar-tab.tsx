'use client'

import { useState, useMemo, useCallback } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { GreekDatePicker } from '@/components/greek-date-picker'
import { FullscreenModal } from '@/components/fullscreen-modal'
import { ActionSheet, ActionSheetItem, ActionSheetCancel } from '@/components/action-sheet'
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

// Icons removed for professional appearance - using text labels instead

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
  const [initialDutyType, setInitialDutyType] = useState<DutyType>('guard')

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
    setShowActionSheet(true)
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

  return (
    <div className="flex flex-col h-full">
      {/* HEADER - Always Visible */}
      <div className="flex-shrink-0 bg-background/90 backdrop-blur-xl px-4 pt-4 pb-3 border-b border-neutral-800 safe-top sticky top-0 z-30">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-foreground tracking-tight">Ημερολόγιο</h1>
            <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Βάρδιες & άδειες</p>
          </div>
          <button
            onClick={() => {
              hapticFeedback('light')
              setSelectedDate(today)
              setShowActionSheet(true)
            }}
            className="p-2.5 rounded-xl zinc-card-hover bg-zinc-900/50 border border-zinc-800/50 flex items-center justify-center transition-all"
            aria-label="Προσθήκη"
          >
            <Plus className="h-4 w-4 text-primary" />
          </button>
        </div>
      </div>

      {/* CONTENT - Scrollable */}
      <div className="flex-1 overflow-y-auto px-4 py-4 no-scrollbar">
      <div className="flex flex-col gap-4">

      {/* Calendar Card */}
      <div className="zinc-card p-4 flex flex-col gap-4 shadow-xl shadow-black/20">
        {/* Month Navigation */}
        <div className="flex items-center justify-between px-1">
          <button
            onClick={prevMonth}
            className="p-2 rounded-xl bg-zinc-800/50 border border-zinc-700/30 hover:bg-zinc-800 transition-all"
            aria-label="Προηγούμενος μήνας"
          >
            <ChevronLeft className="h-3.5 w-3.5 text-zinc-400" />
          </button>
          <span className="text-xs font-black text-foreground uppercase tracking-[0.2em]">
            {GREEK_MONTHS[viewMonth]} {viewYear}
          </span>
          <button
            onClick={nextMonth}
            className="p-2 rounded-xl bg-zinc-800/50 border border-zinc-700/30 hover:bg-zinc-800 transition-all"
            aria-label="Επόμενος μήνας"
          >
            <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
          </button>
        </div>

        {/* Day Names */}
        <div className="grid grid-cols-7 gap-1 mb-3">
          {greekDaysStartMonday.map((d) => (
            <div
              key={d}
              className="text-center text-[9px] text-muted-foreground font-black uppercase tracking-tighter py-1"
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
                  'relative aspect-square w-full rounded-2xl text-sm flex flex-col items-center justify-center transition-all duration-300',
                  isSelected
                    ? 'bg-primary text-primary-foreground font-black shadow-xl shadow-primary/40'
                    : isToday
                      ? 'bg-neutral-800 text-primary font-black border border-primary/60'
                      : 'text-neutral-200 hover:bg-neutral-800'
                )}
              >
                <span className="leading-none">{day}</span>
                {/* Event dots */}
                {(hasDuty || hasLeave) && (
                  <div className="flex gap-0.5 mt-1">
                    {hasDuty && (
                      <span
                        className={cn(
                          'w-1 h-1 rounded-full',
                          isSelected ? 'bg-primary-foreground' : 'bg-chart-3'
                        )}
                      />
                    )}
                    {hasLeave && (
                      <span
                        className={cn(
                          'w-1 h-1 rounded-full',
                          isSelected ? 'bg-primary-foreground' : 'bg-accent'
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
        <div className="flex items-center justify-center gap-6 pt-3 border-t border-white/5">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-chart-3 shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Υπηρεσία</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(56,189,248,0.5)]" />
            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Άδεια</span>
          </div>
        </div>
      </div>

      {/* Upcoming Events - MOVED ABOVE SUMMARY */}
      <UpcomingEvents
        duties={duties}
        leaves={leaves}
        today={today}
        onDeleteDuty={handleDeleteDuty}
        onDeleteLeave={handleDeleteLeave}
      />

      {/* Monthly Summary */}
      <div className="glass-card rounded-2xl p-4 border border-white/5">
        <MonthlySummary
        duties={duties}
        leaves={leaves}
        viewMonth={viewMonth}
        viewYear={viewYear}
      />

      </div>

      {/* Action Sheet - Choose what to add */}
      </div>
      </div>
      <ActionSheet
        isOpen={showActionSheet}
        onClose={() => setShowActionSheet(false)}
        title={selectedDate ? formatGreekDate(selectedDate) : ''}
        subtitle="Τι θέλεις να προσθέσεις;"
      >
        <ActionSheetItem
          title="Προσθήκη Υπηρεσίας"
          subtitle="Σκοπιά, Θαλαμοφύλακας, κ.ά."
          onClick={() => {
            setInitialDutyType('guard')
            setShowAddDuty(true)
          }}
        />
        <ActionSheetItem
          title="Προσθήκη Άδειας"
          subtitle="Κανονική, Σπουδαστική, κ.ά."
          onClick={() => setShowAddLeave(true)}
        />
        <ActionSheetCancel onClick={() => setShowActionSheet(false)} />
      </ActionSheet>

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
          initialType={initialDutyType}
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
    </div>
  )
}

/* ---------- Upcoming Events ---------- */
/* ---------- Monthly Summary ---------- */
function MonthlySummary({
  duties,
  leaves,
  viewMonth,
  viewYear,
}: {
  duties: DutyEntry[]
  leaves: LeaveEntry[]
  viewMonth: number
  viewYear: number
}) {
  const stats = useMemo(() => {
    const monthPrefix = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
    const monthStart = `${monthPrefix}-01`
    const monthEnd = `${monthPrefix}-${String(daysInMonth).padStart(2, '0')}`

    // Count duties by type for this month
    const monthDuties = duties.filter((d) => d.date.startsWith(monthPrefix))
    const dutyCountByType: Partial<Record<DutyType, number>> = {}
    monthDuties.forEach((d) => {
      const count = d.type === 'prison' ? (d.prisonDays || 1) : 1
      dutyCountByType[d.type] = (dutyCountByType[d.type] || 0) + count
    })

    // Count leave days that fall within this month
    let leaveDays = 0
    const leaveCountByType: Partial<Record<LeaveType, number>> = {}
    leaves.forEach((l) => {
      const lStart = l.startDate < monthStart ? monthStart : l.startDate
      const lEnd = l.endDate > monthEnd ? monthEnd : l.endDate
      if (lStart <= lEnd) {
        const days = daysBetween(lStart, lEnd) + 1
        leaveDays += days
        leaveCountByType[l.type] = (leaveCountByType[l.type] || 0) + days
      }
    })

    return {
      totalDuties: monthDuties.length,
      dutyCountByType,
      leaveDays,
      leaveCountByType,
    }
  }, [duties, leaves, viewMonth, viewYear])

  const hasDuties = stats.totalDuties > 0
  const hasLeaves = stats.leaveDays > 0

  if (!hasDuties && !hasLeaves) return null

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest">
        {GREEK_MONTHS[viewMonth]} - Σύνοψη
      </h3>

      <div className="flex gap-3">
        {/* Duties summary */}
        {hasDuties && (
          <div className="flex-1 rounded-xl bg-chart-3/10 p-3 border border-chart-3/20">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-black text-chart-3 uppercase tracking-wider">
                {stats.totalDuties} γεγονότ{stats.totalDuties === 1 ? 'α' : 'α'}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              {(Object.entries(stats.dutyCountByType) as [DutyType, number][]).map(
                ([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">
                      {DUTY_TYPE_LABELS[type]}
                    </span>
                    <span className="text-[11px] font-medium text-foreground">{count} {type === 'prison' ? 'ημ.' : ''}</span>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* Leave summary */}
        {hasLeaves && (
          <div className="flex-1 rounded-xl bg-chart-2/10 p-3 border border-chart-2/20">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-black text-chart-2 uppercase tracking-wider">
                {stats.leaveDays} ημέρ{stats.leaveDays === 1 ? 'α' : 'ες'}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              {(Object.entries(stats.leaveCountByType) as [LeaveType, number][]).map(
                ([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">
                      {LEAVE_TYPE_LABELS[type]}
                    </span>
                    <span className="text-[11px] font-medium text-foreground">
                      {count} ημ.
                    </span>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function UpcomingEvents({
  duties,
  leaves,
  today,
  onDeleteDuty,
  onDeleteLeave,
}: {
  duties: DutyEntry[]
  leaves: LeaveEntry[]
  today: string
  onDeleteDuty: (id: string) => void
  onDeleteLeave: (id: string) => void
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
      <div className="glass-card rounded-2xl p-6 text-center border border-white/5">
        <p className="text-sm text-muted-foreground">Δεν υπάρχουν προσεχή γεγονότα</p>
        <p className="text-xs text-muted-foreground mt-1">Πάτησε μια ημερομηνία για να προσθέσεις</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-xs font-black text-muted-foreground uppercase tracking-widest">Προσεχώς</h2>
      {upcoming.map((item) => {
        const isToday = item.date === today
        if (item.type === 'duty') {
          const duty = item.entry as DutyEntry
          return (
            <div
              key={duty.id}
              className={cn(
                'glass-card rounded-xl p-3 flex items-center gap-3 text-left w-full border border-white/5',
                isToday && 'ring-1 ring-primary'
              )}
            >
              <div className={cn('w-1 h-10 rounded-full flex-shrink-0', isToday ? 'bg-primary' : 'bg-chart-3')} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-foreground">{DUTY_TYPE_LABELS[duty.type]}</span>
                  {isToday && (
                     <span className="px-1.5 py-0.5 rounded-md bg-primary text-primary-foreground text-[10px] font-bold">
                      ΣΗΜΕΡΑ
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatGreekDate(duty.date)} &middot; {duty.startTime} - {duty.endTime}
                </p>
              </div>
              <button
                onClick={() => onDeleteDuty(duty.id)}
                className="p-2 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center text-destructive flex-shrink-0 hover:bg-destructive/10 transition-colors"
                aria-label="Διαγραφή"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )
        } else {
          const leave = item.entry as LeaveEntry
          return (
            <div
              key={leave.id}
              className="glass-card rounded-xl p-3 flex items-center gap-3 text-left w-full border border-white/5"
            >
              <div className="w-1 h-10 rounded-full flex-shrink-0 bg-chart-2" />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-semibold text-foreground break-words">{LEAVE_TYPE_LABELS[leave.type]}</span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatGreekDate(leave.startDate)} - {formatGreekDate(leave.endDate)} &middot; {leave.days} ημ.
                </p>
              </div>
              <button
                onClick={() => onDeleteLeave(leave.id)}
                className="p-2 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center text-destructive flex-shrink-0 hover:bg-destructive/10 transition-colors"
                aria-label="Διαγραφή"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )
        }
      })}
    </div>
  )
}

/* ---------- Add Duty Form ---------- */
function AddDutyForm({
  initialDate,
  initialType = 'guard',
  onAdd,
  onCancel,
}: {
  initialDate: string
  initialType?: DutyType
  onAdd: (duty: DutyEntry) => void
  onCancel: () => void
}) {
  const [type, setType] = useState<DutyType>(initialType)
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
      password,
      countersign,
    })
  }

  return (
    <div className="flex flex-col gap-3 h-full">
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Τύπος</label>
        <div className="flex overflow-x-auto gap-1.5 no-scrollbar pb-1 -mx-1 px-1">
          <div className="flex gap-1.5 flex-nowrap">
            {(Object.keys(DUTY_TYPE_LABELS) as DutyType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  hapticFeedback('light')
                  setType(t)
                }}
                className={cn(
                  'px-2.5 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-tight transition-colors whitespace-nowrap',
                  type === t
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                )}
              >
                {DUTY_TYPE_LABELS[t]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
          Ημερομηνία
        </label>
        <GreekDatePicker value={date} onChange={setDate} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
            Ύρα Έναρξης
          </label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-secondary border border-white/5 text-foreground text-sm"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
            Ύρα Λήξης
          </label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-secondary border border-white/5 text-foreground text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
          Σημειώσεις
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Προσθήκη σημειώσεων..."
          className="w-full px-3 py-2 rounded-lg bg-secondary border border-white/5 text-foreground text-sm resize-none"
          rows={3}
        />
      </div>

      {type === 'guard' && (
        <>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
              Σύνθημα
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Σύνθημα"
              className="w-full px-3 py-2 rounded-lg bg-secondary border border-white/5 text-foreground text-sm"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
              Παρασύνθημα
            </label>
            <input
              type="password"
              value={countersign}
              onChange={(e) => setCountersign(e.target.value)}
              placeholder="Παρασύνθημα"
              className="w-full px-3 py-2 rounded-lg bg-secondary border border-white/5 text-foreground text-sm"
            />
          </div>
        </>
      )}

      <div className="flex gap-2 mt-auto pt-4">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-3 rounded-xl bg-secondary text-foreground font-semibold text-sm min-h-[44px] hover:bg-secondary/80 transition-colors"
        >
          Ακύρωση
        </button>
        <button
          onClick={handleSubmit}
          className="flex-1 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm min-h-[44px] hover:bg-primary/90 transition-colors"
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
  const [endDate, setEndDate] = useState(initialDate)
  const [notes, setNotes] = useState('')

  const handleSubmit = () => {
    if (!startDate || !endDate || startDate > endDate) return
    hapticFeedback('heavy')
    const days = daysBetween(startDate, endDate) + 1
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
    <div className="flex flex-col gap-3 h-full">
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Τύπος</label>
        <div className="flex overflow-x-auto gap-1.5 no-scrollbar pb-1 -mx-1 px-1">
          <div className="flex gap-1.5 flex-nowrap">
            {(Object.keys(LEAVE_TYPE_LABELS) as LeaveType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  hapticFeedback('light')
                  setType(t)
                }}
                className={cn(
                  'px-2.5 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-tight transition-colors whitespace-nowrap',
                  type === t
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                )}
              >
                {LEAVE_TYPE_LABELS[t]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
          Ημερομηνία Έναρξης
        </label>
        <GreekDatePicker value={startDate} onChange={setStartDate} />
      </div>

      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
          Ημερομηνία Λήξης
        </label>
        <GreekDatePicker value={endDate} onChange={setEndDate} />
      </div>

      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
          Σημειώσεις
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Προσθήκη σημειώσεων..."
          className="w-full px-3 py-2 rounded-lg bg-secondary border border-white/5 text-foreground text-sm resize-none"
          rows={3}
        />
      </div>

      <div className="flex gap-2 mt-auto pt-4">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-3 rounded-xl bg-secondary text-foreground font-semibold text-sm min-h-[44px] hover:bg-secondary/80 transition-colors"
        >
          Ακύρωση
        </button>
        <button
          onClick={handleSubmit}
          className="flex-1 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm min-h-[44px] hover:bg-primary/90 transition-colors"
        >
          Προσθήκη
        </button>
      </div>
    </div>
  )
}
