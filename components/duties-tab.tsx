'use client'

import { useState, useEffect, useMemo } from 'react'
import { Plus, Trash2, Bell, BellOff, Clock, Shield, Eye, EyeOff, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { GreekDatePicker } from '@/components/greek-date-picker'
import { FullscreenModal } from '@/components/fullscreen-modal'
import { hapticFeedback, formatGreekDate, generateId, toLocalDateString } from '@/lib/helpers'
import type { DutyEntry, DutyType, LeaveEntry } from '@/lib/types'
import { DUTY_TYPE_LABELS, LEAVE_TYPE_LABELS, GREEK_MONTHS } from '@/lib/types'

const DUTY_COLORS: Record<DutyType, string> = {
  guard: 'bg-red-500',
  barracks: 'bg-blue-500',
  officer: 'bg-amber-500',
  patrol: 'bg-emerald-500',
  kitchen: 'bg-orange-500',
  other: 'bg-muted-foreground',
}

export function DutiesTab() {
  const [duties, setDuties] = useLocalStorage<DutyEntry[]>('fantaros-duties', [])
  const [leaves] = useLocalStorage<LeaveEntry[]>('fantaros-leaves', [])
  const [showAdd, setShowAdd] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [showPasswords, setShowPasswords] = useState(false)

  const today = toLocalDateString()
  const todayDate = new Date()
  const [viewMonth, setViewMonth] = useState(todayDate.getMonth())
  const [viewYear, setViewYear] = useState(todayDate.getFullYear())
  const [selectedDate, setSelectedDate] = useState(today)

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted')
    }
  }, [])

  const requestNotifications = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission()
      setNotificationsEnabled(perm === 'granted')
      hapticFeedback('medium')
    }
  }

  useEffect(() => {
    if (!notificationsEnabled) return
    const timers: NodeJS.Timeout[] = []
    duties.forEach((duty) => {
      const dutyTime = new Date(`${duty.date}T${duty.startTime}`)
      const notifyTime = new Date(dutyTime.getTime() - 30 * 60 * 1000)
      const now = new Date()
      if (notifyTime > now) {
        const timeout = setTimeout(() => {
          new Notification('Fantaros - Υπηρεσία', {
            body: `${DUTY_TYPE_LABELS[duty.type]} σε 30 λεπτά (${duty.startTime})`,
            icon: '/icon-192.png',
          })
        }, notifyTime.getTime() - now.getTime())
        timers.push(timeout)
      }
    })
    return () => timers.forEach(clearTimeout)
  }, [duties, notificationsEnabled])

  // Calendar data
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay()
  const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1
  const greekDaysStartMonday = ['Δε', 'Τρ', 'Τε', 'Πε', 'Πα', 'Σα', 'Κυ']

  // Map of date -> duties for the current view month
  const dutyMap = useMemo(() => {
    const map: Record<string, DutyEntry[]> = {}
    duties.forEach((d) => {
      if (!map[d.date]) map[d.date] = []
      map[d.date].push(d)
    })
    return map
  }, [duties])

  // Check if a date falls within any leave period
  const isDateOnLeave = (dateStr: string) => {
    return leaves.some((l) => dateStr >= l.startDate && dateStr <= l.endDate)
  }

  // Get leave entry for a date
  const getLeaveForDate = (dateStr: string) => {
    return leaves.find((l) => dateStr >= l.startDate && dateStr <= l.endDate)
  }

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
    setViewMonth(todayDate.getMonth())
    setViewYear(todayDate.getFullYear())
    setSelectedDate(today)
  }

  const selectedDuties = dutyMap[selectedDate] || []
  const selectedLeave = getLeaveForDate(selectedDate)
  const isSelectedToday = selectedDate === today
  const hasEvents = selectedDuties.length > 0 || !!selectedLeave

  return (
    <div className="flex flex-col gap-4 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">{'Πρόγραμμα'}</h1>
          <p className="text-xs text-muted-foreground">{'Ημερολόγιο & υπηρεσίες'}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={requestNotifications}
            className={cn(
              'p-3 rounded-xl glass-card min-h-[44px] min-w-[44px] flex items-center justify-center',
              notificationsEnabled && 'ring-1 ring-primary'
            )}
            aria-label={notificationsEnabled ? 'Ειδοποιήσεις ενεργές' : 'Ενεργοποίηση ειδοποιήσεων'}
          >
            {notificationsEnabled ? (
              <Bell className="h-5 w-5 text-primary" />
            ) : (
              <BellOff className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
          <button
            onClick={() => {
              hapticFeedback('light')
              setShowAdd(true)
            }}
            className="p-3 rounded-xl glass-card min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Προσθήκη υπηρεσίας"
          >
            <Plus className="h-5 w-5 text-primary" />
          </button>
        </div>
      </div>

      {/* Add Duty Modal */}
      <FullscreenModal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        title="Νέα Υπηρεσία"
      >
        <AddDutyForm
          onAdd={(duty) => {
            setDuties([...duties, duty])
            setShowAdd(false)
          }}
          onCancel={() => setShowAdd(false)}
          initialDate={selectedDate}
        />
      </FullscreenModal>

      {/* Full Calendar */}
      <div className="glass-card rounded-2xl p-4">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={prevMonth}
            className="p-2 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center active:bg-secondary"
            aria-label="Προηγούμενος μήνας"
          >
            <ChevronLeft className="h-5 w-5 text-foreground" />
          </button>
          <button
            type="button"
            onClick={goToToday}
            className="text-sm font-semibold text-foreground active:text-primary min-h-[44px] flex items-center px-2"
          >
            {GREEK_MONTHS[viewMonth]} {viewYear}
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="p-2 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center active:bg-secondary"
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
            const isTodayDate = dateStr === today
            const dayDuties = dutyMap[dateStr] || []
            const dayOnLeave = isDateOnLeave(dateStr)
            const hasDuties = dayDuties.length > 0

            return (
              <button
                key={day}
                type="button"
                onClick={() => {
                  hapticFeedback('light')
                  setSelectedDate(dateStr)
                }}
                className={cn(
                  'aspect-square w-full rounded-xl text-sm flex flex-col items-center justify-center gap-0.5 transition-colors min-h-[44px] relative',
                  isSelected
                    ? 'bg-primary text-primary-foreground font-bold'
                    : isTodayDate
                      ? 'bg-secondary text-primary font-semibold ring-1 ring-primary'
                      : 'text-foreground active:bg-secondary'
                )}
              >
                <span className="text-xs leading-none">{day}</span>
                {/* Event dots */}
                {(hasDuties || dayOnLeave) && (
                  <div className="flex items-center gap-0.5 absolute bottom-1">
                    {dayOnLeave && (
                      <span className={cn(
                        'w-1 h-1 rounded-full',
                        isSelected ? 'bg-primary-foreground' : 'bg-green-500'
                      )} />
                    )}
                    {dayDuties.slice(0, 3).map((d) => (
                      <span
                        key={d.id}
                        className={cn(
                          'w-1 h-1 rounded-full',
                          isSelected ? 'bg-primary-foreground' : DUTY_COLORS[d.type]
                        )}
                      />
                    ))}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected Day Details */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">
            {isSelectedToday ? 'Σήμερα' : formatGreekDate(selectedDate)}
          </h2>
          {!hasEvents && (
            <span className="text-xs text-muted-foreground">Κενή μέρα</span>
          )}
        </div>

        {/* Leave info for selected day */}
        {selectedLeave && (
          <div className="glass-card rounded-xl p-3 flex items-center gap-3 ring-1 ring-green-500/30">
            <div className="w-1 h-10 rounded-full bg-green-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">
                  {LEAVE_TYPE_LABELS[selectedLeave.type]} Άδεια
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-green-500/20 text-green-500 font-bold">
                  ΑΔΕΙΑ
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatGreekDate(selectedLeave.startDate)} - {formatGreekDate(selectedLeave.endDate)} ({selectedLeave.days} ημ.)
              </p>
              {selectedLeave.notes && (
                <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{selectedLeave.notes}</p>
              )}
            </div>
          </div>
        )}

        {/* Duties for selected day */}
        {selectedDuties.length > 0 ? (
          selectedDuties
            .sort((a, b) => a.startTime.localeCompare(b.startTime))
            .map((duty) => (
              <div
                key={duty.id}
                className={cn(
                  'glass-card rounded-xl p-3 flex items-start gap-3',
                  isSelectedToday && 'ring-1 ring-primary/30'
                )}
              >
                <div className={cn(
                  'w-1 min-h-[40px] rounded-full flex-shrink-0 self-stretch',
                  DUTY_COLORS[duty.type]
                )} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {DUTY_TYPE_LABELS[duty.type]}
                    </span>
                    {isSelectedToday && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-primary/20 text-primary font-bold">
                        ΕΝΕΡΓΗ
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {duty.startTime} - {duty.endTime}
                  </p>

                  {/* Guard Password / Countersign */}
                  {duty.type === 'guard' && (duty.password || duty.countersign) && (
                    <div className="mt-2 p-2.5 rounded-lg bg-primary/5 border border-primary/15">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <Shield className="h-3.5 w-3.5 text-primary" />
                          <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">{'Σύνθημα / Παρασύνθημα'}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            hapticFeedback('light')
                            setShowPasswords(!showPasswords)
                          }}
                          className="p-1 rounded min-h-[28px] min-w-[28px] flex items-center justify-center"
                          aria-label={showPasswords ? 'Απόκρυψη' : 'Εμφάνιση'}
                        >
                          {showPasswords ? (
                            <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                          ) : (
                            <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                        </button>
                      </div>
                      <div className="flex gap-3">
                        {duty.password && (
                          <div className="flex-1">
                            <p className="text-[9px] text-muted-foreground mb-0.5">Σύνθημα</p>
                            <p className={cn(
                              'text-sm font-bold tracking-wider transition-all',
                              showPasswords ? 'text-primary blur-0' : 'text-primary blur-sm select-none'
                            )}>
                              {duty.password}
                            </p>
                          </div>
                        )}
                        {duty.countersign && (
                          <div className="flex-1">
                            <p className="text-[9px] text-muted-foreground mb-0.5">{'Παρασύνθημα'}</p>
                            <p className={cn(
                              'text-sm font-bold tracking-wider transition-all',
                              showPasswords ? 'text-accent blur-0' : 'text-accent blur-sm select-none'
                            )}>
                              {duty.countersign}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {duty.notes && (
                    <p className="text-[10px] text-muted-foreground mt-1.5 truncate">{duty.notes}</p>
                  )}
                </div>
                <button
                  onClick={() => {
                    hapticFeedback('medium')
                    setDuties(duties.filter((d) => d.id !== duty.id))
                  }}
                  className="p-2 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center text-destructive"
                  aria-label="Διαγραφή υπηρεσίας"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
        ) : !selectedLeave ? (
          <div className="glass-card rounded-xl p-5 text-center">
            <Clock className="h-6 w-6 text-muted-foreground mx-auto mb-1.5" />
            <p className="text-xs text-muted-foreground">{'Δεν υπάρχουν υπηρεσίες'}</p>
            <button
              onClick={() => {
                hapticFeedback('light')
                setShowAdd(true)
              }}
              className="mt-2 text-xs text-primary font-medium min-h-[44px] flex items-center justify-center mx-auto"
            >
              {'+ Προσθήκη'}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}

function AddDutyForm({ onAdd, onCancel, initialDate }: {
  onAdd: (duty: DutyEntry) => void
  onCancel: () => void
  initialDate?: string
}) {
  const [type, setType] = useState<DutyType>('guard')
  const [date, setDate] = useState(initialDate || toLocalDateString())
  const [startTime, setStartTime] = useState('08:00')
  const [endTime, setEndTime] = useState('08:00')
  const [notes, setNotes] = useState('')
  const [password, setPassword] = useState('')
  const [countersign, setCountersign] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)

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
      ...(type === 'guard' && password ? { password } : {}),
      ...(type === 'guard' && countersign ? { countersign } : {}),
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="block text-xs text-muted-foreground mb-1.5">{'Τύπος'}</label>
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
          <label className="block text-xs text-muted-foreground mb-1.5">{'Αρχή'}</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full px-3 py-3 rounded-lg bg-secondary text-secondary-foreground text-sm min-h-[48px] border border-border"
          />
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1.5">{'Τέλος'}</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full px-3 py-3 rounded-lg bg-secondary text-secondary-foreground text-sm min-h-[48px] border border-border"
          />
        </div>
      </div>

      {/* Password / Countersign for Guard Duty */}
      {type === 'guard' && (
        <div className="flex flex-col gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-foreground">{'Σύνθημα / Παρασύνθημα'}</span>
            </div>
            <button
              type="button"
              onClick={() => setShowPasswords(!showPasswords)}
              className="p-1.5 rounded-lg min-h-[36px] min-w-[36px] flex items-center justify-center"
              aria-label={showPasswords ? 'Απόκρυψη' : 'Εμφάνιση'}
            >
              {showPasswords ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          </div>
          <div>
            <label className="block text-[10px] text-muted-foreground mb-1">{'Σύνθημα'}</label>
            <input
              type={showPasswords ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Π.χ. ΑΕΤΟΣ"
              className="w-full px-3 py-3 rounded-lg bg-secondary text-secondary-foreground text-sm min-h-[48px] border border-border placeholder:text-muted-foreground uppercase tracking-wider"
            />
          </div>
          <div>
            <label className="block text-[10px] text-muted-foreground mb-1">{'Παρασύνθημα'}</label>
            <input
              type={showPasswords ? 'text' : 'password'}
              value={countersign}
              onChange={(e) => setCountersign(e.target.value)}
              placeholder="Π.χ. ΒΟΥΝΟ"
              className="w-full px-3 py-3 rounded-lg bg-secondary text-secondary-foreground text-sm min-h-[48px] border border-border placeholder:text-muted-foreground uppercase tracking-wider"
            />
          </div>
        </div>
      )}

      <div>
        <label className="block text-xs text-muted-foreground mb-1.5">{'Σημειώσεις'}</label>
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
          {'Ακύρωση'}
        </button>
        <button
          onClick={handleSubmit}
          disabled={!date}
          className="flex-1 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm min-h-[48px] disabled:opacity-40"
        >
          {'Προσθήκη'}
        </button>
      </div>
    </div>
  )
}
