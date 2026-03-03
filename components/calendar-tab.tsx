'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Plus, Shield, Palmtree, Lock, Trash2, Eye, EyeOff, Edit3, Check, X, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { GreekDatePicker } from '@/components/greek-date-picker'
import { FullscreenModal } from '@/components/fullscreen-modal'
import { hapticFeedback, formatGreekDate, formatGreekDateFull, generateId, toLocalDateString } from '@/lib/helpers'
import type { DutyEntry, DutyType, LeaveEntry, LeaveType, DailyPassword } from '@/lib/types'
import { DUTY_TYPE_LABELS, LEAVE_TYPE_LABELS, GREEK_MONTHS } from '@/lib/types'

export function CalendarTab() {
  const [duties] = useLocalStorage<DutyEntry[]>('fantaros-duties', [])
  const [leaves] = useLocalStorage<LeaveEntry[]>('fantaros-leaves', [])
  const [passwords] = useLocalStorage<DailyPassword[]>('fantaros-passwords', [])

  const today = new Date()
  const todayStr = toLocalDateString()
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [selectedDate, setSelectedDate] = useState<string>(todayStr)
  const [showAddDuty, setShowAddDuty] = useState(false)
  const [showAddLeave, setShowAddLeave] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay()
  const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1

  const greekDaysStartMonday = ['Δε', 'Τρ', 'Τε', 'Πε', 'Πα', 'Σα', 'Κυ']

  // Build a map of dates -> events for the current month
  const dateEventsMap = useMemo(() => {
    const map: Record<string, { hasDuty: boolean; hasLeave: boolean; hasPassword: boolean; dutyTypes: DutyType[] }> = {}

    duties.forEach((d) => {
      if (!map[d.date]) map[d.date] = { hasDuty: false, hasLeave: false, hasPassword: false, dutyTypes: [] }
      map[d.date].hasDuty = true
      if (!map[d.date].dutyTypes.includes(d.type)) map[d.date].dutyTypes.push(d.type)
    })

    leaves.forEach((l) => {
      // Mark all dates in the leave range
      const start = new Date(l.startDate)
      const end = new Date(l.endDate)
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = toLocalDateString(d)
        if (!map[dateStr]) map[dateStr] = { hasDuty: false, hasLeave: false, hasPassword: false, dutyTypes: [] }
        map[dateStr].hasLeave = true
      }
    })

    passwords.forEach((p) => {
      if (!map[p.date]) map[p.date] = { hasDuty: false, hasLeave: false, hasPassword: false, dutyTypes: [] }
      map[p.date].hasPassword = true
    })

    return map
  }, [duties, leaves, passwords])

  // Events for selected date
  const selectedDuties = duties.filter((d) => d.date === selectedDate)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
  const selectedLeaves = leaves.filter((l) => {
    return selectedDate >= l.startDate && selectedDate <= l.endDate
  })
  const selectedPassword = passwords.find((p) => p.date === selectedDate)
  const hasGuardDuty = selectedDuties.some((d) => d.type === 'guard')

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
    setSelectedDate(toLocalDateString(now))
  }

  return (
    <div className="flex flex-col gap-4 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Ημερολόγιο</h1>
          <p className="text-xs text-muted-foreground">Βάρδιες, άδειες & σύνθημα</p>
        </div>
        <button
          onClick={goToToday}
          className="px-3 py-2 rounded-xl glass-card min-h-[44px] flex items-center justify-center text-xs font-medium text-primary"
        >
          Σήμερα
        </button>
      </div>

      {/* Calendar */}
      <div className="glass-card rounded-2xl p-4">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-3">
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
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const isSelected = dateStr === selectedDate
            const isToday = dateStr === todayStr
            const events = dateEventsMap[dateStr]

            return (
              <button
                key={day}
                type="button"
                onClick={() => {
                  hapticFeedback('light')
                  setSelectedDate(dateStr)
                }}
                className={cn(
                  'relative aspect-square w-full rounded-xl text-sm flex flex-col items-center justify-center transition-colors min-h-[44px]',
                  isSelected
                    ? 'bg-primary text-primary-foreground font-bold'
                    : isToday
                      ? 'bg-secondary text-primary font-semibold ring-1 ring-primary'
                      : 'text-foreground active:bg-secondary'
                )}
              >
                <span className="text-[13px]">{day}</span>
                {events && (
                  <div className="flex items-center gap-0.5 mt-0.5">
                    {events.hasDuty && (
                      <div className={cn(
                        'w-1.5 h-1.5 rounded-full',
                        isSelected ? 'bg-primary-foreground' : 'bg-chart-3'
                      )} />
                    )}
                    {events.hasLeave && (
                      <div className={cn(
                        'w-1.5 h-1.5 rounded-full',
                        isSelected ? 'bg-primary-foreground' : 'bg-chart-2'
                      )} />
                    )}
                    {events.hasPassword && (
                      <div className={cn(
                        'w-1.5 h-1.5 rounded-full',
                        isSelected ? 'bg-primary-foreground' : 'bg-chart-4'
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
            <div className="w-2 h-2 rounded-full bg-chart-3" />
            <span className="text-[10px] text-muted-foreground">Βάρδια</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-chart-2" />
            <span className="text-[10px] text-muted-foreground">Άδεια</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-chart-4" />
            <span className="text-[10px] text-muted-foreground">Σύνθημα</span>
          </div>
        </div>
      </div>

      {/* Selected Date Details */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">
            {selectedDate === todayStr ? 'Σήμερα' : formatGreekDate(selectedDate)}
          </h2>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => {
              hapticFeedback('light')
              setShowAddDuty(true)
            }}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl glass-card min-h-[72px]"
          >
            <Shield className="h-5 w-5 text-chart-3" />
            <span className="text-[10px] text-muted-foreground font-medium leading-tight text-center">Βάρδια</span>
          </button>
          <button
            onClick={() => {
              hapticFeedback('light')
              setShowAddLeave(true)
            }}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl glass-card min-h-[72px]"
          >
            <Palmtree className="h-5 w-5 text-chart-2" />
            <span className="text-[10px] text-muted-foreground font-medium leading-tight text-center">Άδεια</span>
          </button>
          <button
            onClick={() => {
              hapticFeedback('light')
              setShowPassword(true)
            }}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl glass-card min-h-[72px]"
          >
            <Lock className="h-5 w-5 text-chart-4" />
            <span className="text-[10px] text-muted-foreground font-medium leading-tight text-center">Σύνθημα</span>
          </button>
        </div>

        {/* Duty/Leave/Password entries for selected date */}
        <SelectedDateEvents
          duties={selectedDuties}
          leaves={selectedLeaves}
          password={selectedPassword}
          hasGuardDuty={hasGuardDuty}
          date={selectedDate}
        />
      </div>

      {/* Add Duty Modal */}
      <FullscreenModal
        isOpen={showAddDuty}
        onClose={() => setShowAddDuty(false)}
        title="Νέα Βάρδια"
      >
        <AddDutyForm
          initialDate={selectedDate}
          onAdd={() => setShowAddDuty(false)}
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
          initialDate={selectedDate}
          onAdd={() => setShowAddLeave(false)}
          onCancel={() => setShowAddLeave(false)}
        />
      </FullscreenModal>

      {/* Set Password Modal */}
      <FullscreenModal
        isOpen={showPassword}
        onClose={() => setShowPassword(false)}
        title="Σύνθημα / Παρασύνθημα"
      >
        <PasswordForm
          date={selectedDate}
          onSave={() => setShowPassword(false)}
          onCancel={() => setShowPassword(false)}
        />
      </FullscreenModal>
    </div>
  )
}

function SelectedDateEvents({
  duties,
  leaves,
  password,
  hasGuardDuty,
  date,
}: {
  duties: DutyEntry[]
  leaves: LeaveEntry[]
  password: DailyPassword | undefined
  hasGuardDuty: boolean
  date: string
}) {
  const [allDuties, setDuties] = useLocalStorage<DutyEntry[]>('fantaros-duties', [])
  const [allLeaves, setLeaves] = useLocalStorage<LeaveEntry[]>('fantaros-leaves', [])
  const [showPw, setShowPw] = useState(false)

  const hasEvents = duties.length > 0 || leaves.length > 0 || password

  if (!hasEvents) {
    return (
      <div className="glass-card rounded-xl p-5 text-center">
        <p className="text-sm text-muted-foreground">Καμία καταχώρηση</p>
        <p className="text-[10px] text-muted-foreground mt-1">Πρόσθεσε βάρδια, άδεια ή σύνθημα</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Duties */}
      {duties.map((duty) => (
        <div key={duty.id} className="glass-card rounded-xl p-3 flex items-center gap-3">
          <div className="w-1 h-10 rounded-full bg-chart-3 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">
                {DUTY_TYPE_LABELS[duty.type]}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {duty.startTime} - {duty.endTime}
            </p>
            {duty.notes && (
              <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{duty.notes}</p>
            )}
          </div>
          <button
            onClick={() => {
              hapticFeedback('medium')
              setDuties(allDuties.filter((d) => d.id !== duty.id))
            }}
            className="p-2 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center text-destructive"
            aria-label="Διαγραφή"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}

      {/* Leaves */}
      {leaves.map((leave) => (
        <div key={leave.id} className="glass-card rounded-xl p-3 flex items-center gap-3">
          <div className="w-1 h-10 rounded-full bg-chart-2 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">
                {LEAVE_TYPE_LABELS[leave.type]}
              </span>
              <span className="text-xs text-muted-foreground">{leave.days} ημ.</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {formatGreekDate(leave.startDate)} - {formatGreekDate(leave.endDate)}
            </p>
          </div>
          <button
            onClick={() => {
              hapticFeedback('medium')
              setLeaves(allLeaves.filter((l) => l.id !== leave.id))
            }}
            className="p-2 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center text-destructive"
            aria-label="Διαγραφή"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}

      {/* Password (show if guard duty or if password exists) */}
      {(hasGuardDuty || password) && password && (
        <div className="glass-card rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-chart-4" />
              <span className="text-sm font-semibold text-foreground">Σύνθημα</span>
            </div>
            <button
              onClick={() => {
                hapticFeedback('light')
                setShowPw(!showPw)
              }}
              className="p-2 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label={showPw ? 'Απόκρυψη' : 'Εμφάνιση'}
            >
              {showPw ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 rounded-lg bg-secondary">
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Σύνθημα</p>
              <p className={cn('text-sm font-mono font-bold mt-0.5', showPw ? 'text-foreground' : 'text-foreground blur-sm select-none')}>
                {password.password || '---'}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-secondary">
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Παρασύνθημα</p>
              <p className={cn('text-sm font-mono font-bold mt-0.5', showPw ? 'text-foreground' : 'text-foreground blur-sm select-none')}>
                {password.countersign || '---'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function AddDutyForm({ initialDate, onAdd, onCancel }: {
  initialDate: string
  onAdd: () => void
  onCancel: () => void
}) {
  const [duties, setDuties] = useLocalStorage<DutyEntry[]>('fantaros-duties', [])
  const [type, setType] = useState<DutyType>('guard')
  const [date, setDate] = useState(initialDate)
  const [startTime, setStartTime] = useState('08:00')
  const [endTime, setEndTime] = useState('08:00')
  const [notes, setNotes] = useState('')

  const handleSubmit = () => {
    if (!date || !startTime || !endTime) return
    hapticFeedback('heavy')
    setDuties([...duties, {
      id: generateId(),
      type,
      date,
      startTime,
      endTime,
      notes,
    }])
    onAdd()
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
  onAdd: () => void
  onCancel: () => void
}) {
  const [leaves, setLeaves] = useLocalStorage<LeaveEntry[]>('fantaros-leaves', [])
  const [type, setType] = useState<LeaveType>('regular')
  const [startDate, setStartDate] = useState(initialDate)
  const [endDate, setEndDate] = useState(initialDate)
  const [notes, setNotes] = useState('')

  const days = startDate && endDate
    ? Math.max(0, Math.floor((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1)
    : 0

  const handleSubmit = () => {
    if (!startDate || !endDate) return
    hapticFeedback('heavy')
    setLeaves([{
      id: generateId(),
      type,
      startDate,
      endDate,
      days,
      notes,
    }, ...leaves])
    onAdd()
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

function PasswordForm({ date, onSave, onCancel }: {
  date: string
  onSave: () => void
  onCancel: () => void
}) {
  const [passwords, setPasswords] = useLocalStorage<DailyPassword[]>('fantaros-passwords', [])
  const existing = passwords.find((p) => p.date === date)
  const [password, setPassword] = useState(existing?.password || '')
  const [countersign, setCountersign] = useState(existing?.countersign || '')
  const [showPw, setShowPw] = useState(true)

  const handleSave = () => {
    hapticFeedback('heavy')
    const updated = passwords.filter((p) => p.date !== date)
    if (password.trim() || countersign.trim()) {
      updated.push({ date, password: password.trim(), countersign: countersign.trim() })
    }
    setPasswords(updated)
    onSave()
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="text-center py-2 rounded-lg bg-secondary">
        <p className="text-xs text-muted-foreground">{formatGreekDate(date)}</p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs text-muted-foreground">Σύνθημα</label>
          <button
            onClick={() => setShowPw(!showPw)}
            className="p-1 rounded"
            aria-label={showPw ? 'Απόκρυψη' : 'Εμφάνιση'}
          >
            {showPw ? <EyeOff className="h-3.5 w-3.5 text-muted-foreground" /> : <Eye className="h-3.5 w-3.5 text-muted-foreground" />}
          </button>
        </div>
        <input
          type={showPw ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Εισαγωγή συνθήματος..."
          className="w-full px-3 py-3 rounded-lg bg-secondary text-secondary-foreground text-sm min-h-[48px] border border-border font-mono placeholder:text-muted-foreground placeholder:font-sans"
        />
      </div>

      <div>
        <label className="block text-xs text-muted-foreground mb-1.5">Παρασύνθημα</label>
        <input
          type={showPw ? 'text' : 'password'}
          value={countersign}
          onChange={(e) => setCountersign(e.target.value)}
          placeholder="Εισαγωγή παρασυνθήματος..."
          className="w-full px-3 py-3 rounded-lg bg-secondary text-secondary-foreground text-sm min-h-[48px] border border-border font-mono placeholder:text-muted-foreground placeholder:font-sans"
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
          onClick={handleSave}
          className="flex-1 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm min-h-[48px]"
        >
          Αποθήκευση
        </button>
      </div>
    </div>
  )
}
