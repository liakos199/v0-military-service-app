'use client'

import { useState, useMemo, useCallback } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Calendar as CalendarIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { GreekDatePicker } from '@/components/greek-date-picker'
import { InlineDatePicker } from '@/components/inline-date-picker'
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

  const dateEventsMap = useMemo(() => {
    const map: Record<string, { duties: DutyEntry[]; leaves: LeaveEntry[] }> = {}
    duties.forEach((d) => {
      if (!map[d.date]) map[d.date] = { duties: [], leaves: [] }
      map[d.date].duties.push(d)
    })
    leaves.forEach((l) => {
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
    <div className="flex flex-col h-full bg-black relative z-10 animate-fade-in">
      {/* Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-48 bg-[#10b981]/5 blur-[70px] pointer-events-none rounded-full z-0"></div>

      {/* HEADER */}
      <header className="px-6 pt-14 pb-2 relative flex justify-between items-start shrink-0 z-10">
        <div>
          <h1 className="text-[32px] font-bold tracking-tight text-white leading-none mb-1">Ημερολόγιο</h1>
          <p className="text-[13px] font-bold tracking-[0.1em] text-zinc-500 uppercase">Βάρδιες & άδειες</p>
        </div>
        <button
          onClick={() => {
            hapticFeedback('light')
            setSelectedDate(today)
            setShowActionSheet(true)
          }}
          className="w-10 h-10 mt-1 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700/50 flex items-center justify-center text-zinc-400 hover:text-[#34d399] hover:border-[#34d399]/30 transition-all active:scale-95 shadow-md"
        >
          <Plus size={20} />
        </button>
      </header>

      {/* CONTENT */}
      <main className="flex-1 overflow-y-auto px-5 pb-32 pt-4 hide-scrollbar relative z-10">
        <div className="flex flex-col gap-6">
          {/* Calendar Card */}
          <div className="bg-gradient-to-br from-zinc-800 to-zinc-900/90 border border-zinc-700/40 rounded-[2rem] p-5 relative shadow-xl shadow-black/20 overflow-hidden">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={prevMonth}
                className="p-2 rounded-lg bg-zinc-900 border border-zinc-700/50 hover:border-zinc-600 transition-all active:scale-90"
              >
                <ChevronLeft size={18} className="text-zinc-400" />
              </button>
              <span className="text-[13px] font-bold tracking-[0.2em] text-white uppercase">
                {GREEK_MONTHS[viewMonth]} {viewYear}
              </span>
              <button
                onClick={nextMonth}
                className="p-2 rounded-lg bg-zinc-900 border border-zinc-700/50 hover:border-zinc-600 transition-all active:scale-90"
              >
                <ChevronRight size={18} className="text-zinc-400" />
              </button>
            </div>

            {/* Day Names */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {greekDaysStartMonday.map((d) => (
                <div
                  key={d}
                  className="text-center text-[10px] font-bold text-zinc-500 uppercase tracking-wider py-2"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1.5">
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
                      'relative aspect-square w-full rounded-xl text-sm flex flex-col items-center justify-center transition-all duration-300 font-bold',
                      isSelected || isToday
                        ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-900/30'
                        : 'bg-zinc-900/50 text-zinc-300 hover:bg-zinc-800 border border-zinc-700/30'
                    )}
                  >
                    <span className="leading-none">{day}</span>
                    {/* Event dots */}
                    {(hasDuty || hasLeave) && (
                      <div className="flex gap-0.5 mt-1">
                        {hasDuty && (
                          <span className={cn(
                            'w-1 h-1 rounded-full',
                            isSelected || isToday ? 'bg-white' : 'bg-emerald-400'
                          )} />
                        )}
                        {hasLeave && (
                          <span className={cn(
                            'w-1 h-1 rounded-full',
                            isSelected || isToday ? 'bg-white' : 'bg-amber-400'
                          )} />
                        )}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-8 pt-5 mt-5 border-t border-zinc-700/30">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Υπηρεσία</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Άδεια</span>
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
          />

          {/* Monthly Summary */}
          <MonthlySummary
            duties={duties}
            leaves={leaves}
            viewMonth={viewMonth}
            viewYear={viewYear}
          />
        </div>
      </main>

      {/* Action Sheet */}
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

    const monthDuties = duties.filter((d) => d.date.startsWith(monthPrefix))
    const dutyCountByType: Partial<Record<DutyType, number>> = {}
    monthDuties.forEach((d) => {
      const count = d.type === 'prison' ? (d.prisonDays || 1) : 1
      dutyCountByType[d.type] = (dutyCountByType[d.type] || 0) + count
    })

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
      <h3 className="text-[11px] font-bold tracking-[0.2em] text-zinc-500 uppercase px-1">
        {GREEK_MONTHS[viewMonth]} - Σύνοψη
      </h3>

      <div className="flex gap-3">
        {/* Duties summary */}
        {hasDuties && (
          <div className="flex-1 rounded-[1.5rem] bg-emerald-500/10 p-4 border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                {stats.totalDuties} γεγονότ{stats.totalDuties === 1 ? 'α' : 'α'}
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              {(Object.entries(stats.dutyCountByType) as [DutyType, number][]).map(
                ([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-[10px] text-zinc-400">
                      {DUTY_TYPE_LABELS[type]}
                    </span>
                    <span className="text-[10px] font-bold text-white">{count} {type === 'prison' ? 'ημ.' : ''}</span>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* Leave summary */}
        {hasLeaves && (
          <div className="flex-1 rounded-[1.5rem] bg-amber-500/10 p-4 border border-amber-500/20">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                {stats.leaveDays} ημέρ{stats.leaveDays === 1 ? 'α' : 'ες'}
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              {(Object.entries(stats.leaveCountByType) as [LeaveType, number][]).map(
                ([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-[10px] text-zinc-400">
                      {LEAVE_TYPE_LABELS[type]}
                    </span>
                    <span className="text-[10px] font-bold text-white">
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
      <div className="bg-gradient-to-br from-zinc-800 to-zinc-900/90 border border-zinc-700/40 rounded-[2rem] p-8 text-center shadow-xl shadow-black/20">
        <CalendarIcon className="h-12 w-12 text-zinc-600 mx-auto mb-3 opacity-50" />
        <p className="text-[12px] text-zinc-400 font-semibold">Δεν υπάρχουν προσεχή γεγονότα</p>
        <p className="text-[10px] text-zinc-500 mt-1">Πάτησε μια ημερομηνία για να προσθέσεις</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-[11px] font-bold tracking-[0.2em] text-zinc-500 uppercase px-1">Προσεχώς</h2>
      {upcoming.map((item) => {
        const isToday = item.date === today
        if (item.type === 'duty') {
          const duty = item.entry as DutyEntry
          return (
            <div
              key={duty.id}
              className={cn(
                'bg-gradient-to-br from-zinc-800 to-zinc-900/90 border border-zinc-700/40 rounded-[1.5rem] p-4 flex items-center gap-4 shadow-lg shadow-black/10',
                isToday && 'ring-1 ring-emerald-500'
              )}
            >
              <div className={cn('w-1.5 h-12 rounded-full flex-shrink-0', isToday ? 'bg-emerald-500' : 'bg-emerald-400')} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[12px] font-bold text-white">{DUTY_TYPE_LABELS[duty.type]}</span>
                  {isToday && (
                    <span className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-[9px] font-bold uppercase tracking-wider">
                      ΣΗΜΕΡΑ
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-zinc-400 mt-1">
                  {formatGreekDate(duty.date)} • {duty.startTime} - {duty.endTime}
                </p>
              </div>
              <button
                onClick={() => onDeleteDuty(duty.id)}
                className="p-2 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-500/10 transition-colors active:scale-90 flex-shrink-0"
              >
                <Trash2 size={18} />
              </button>
            </div>
          )
        } else {
          const leave = item.entry as LeaveEntry
          return (
            <div
              key={leave.id}
              className="bg-gradient-to-br from-zinc-800 to-zinc-900/90 border border-zinc-700/40 rounded-[1.5rem] p-4 flex items-center gap-4 shadow-lg shadow-black/10"
            >
              <div className="w-1.5 h-12 rounded-full flex-shrink-0 bg-amber-400" />
              <div className="flex-1 min-w-0">
                <span className="text-[12px] font-bold text-white break-words">{LEAVE_TYPE_LABELS[leave.type]}</span>
                <p className="text-[10px] text-zinc-400 mt-1">
                  {formatGreekDate(leave.startDate)} - {formatGreekDate(leave.endDate)} • {leave.days} ημ.
                </p>
              </div>
              <button
                onClick={() => onDeleteLeave(leave.id)}
                className="p-2 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-500/10 transition-colors active:scale-90 flex-shrink-0"
              >
                <Trash2 size={18} />
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
    <div className="flex flex-col gap-6 p-2">
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-3 px-1">
          Τύπος υπηρεσίας
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(['guard', 'barracks', 'officer', 'patrol', 'kitchen', 'other'] as DutyType[]).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={cn(
                'py-3 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all border',
                type === t
                  ? 'bg-emerald-500 text-white border-emerald-500'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
              )}
            >
              {DUTY_TYPE_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      <InlineDatePicker value={date} onChange={setDate} label="Ημερομηνία" />

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Ώρα έναρξης</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full px-2 py-2.5 rounded-xl bg-zinc-900 text-white text-xs border border-zinc-800 focus:border-emerald-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Ώρα λήξης</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full px-2 py-2.5 rounded-xl bg-zinc-900 text-white text-xs border border-zinc-800 focus:border-emerald-500 outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Σημειώσεις</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Προσθήκη σημειώσεων..."
          className="w-full px-3 py-3 rounded-xl bg-zinc-900 text-white text-sm border border-zinc-800 focus:border-emerald-500 outline-none resize-none h-24"
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-3 rounded-xl bg-zinc-900 text-zinc-400 font-bold text-[11px] uppercase tracking-wider border border-zinc-800 hover:border-zinc-700 transition-all"
        >
          Ακύρωση
        </button>
        <button
          onClick={handleSubmit}
          className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-[11px] uppercase tracking-wider shadow-lg shadow-emerald-900/30 active:scale-95 transition-all"
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
    if (!startDate || !endDate) return
    
    const days = daysBetween(startDate, endDate) + 1
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
    <div className="flex flex-col gap-6 p-2">
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-3 px-1">
          Τύπος άδειας
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(['regular', 'student', 'honorary', 'medical', 'emergency', 'other'] as LeaveType[]).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={cn(
                'py-3 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all border',
                type === t
                  ? 'bg-amber-500 text-white border-amber-500'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
              )}
            >
              {LEAVE_TYPE_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      <InlineDatePicker value={startDate} onChange={setStartDate} label="Από" />
      <InlineDatePicker value={endDate} onChange={setEndDate} label="Έως" />

      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Σημειώσεις</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Προσθήκη σημειώσεων..."
          className="w-full px-3 py-3 rounded-xl bg-zinc-900 text-white text-sm border border-zinc-800 focus:border-amber-500 outline-none resize-none h-24"
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-3 rounded-xl bg-zinc-900 text-zinc-400 font-bold text-[11px] uppercase tracking-wider border border-zinc-800 hover:border-zinc-700 transition-all"
        >
          Ακύρωση
        </button>
        <button
          onClick={handleSubmit}
          className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-[11px] uppercase tracking-wider shadow-lg shadow-amber-900/30 active:scale-95 transition-all"
        >
          Προσθήκη
        </button>
      </div>
    </div>
  )
}
