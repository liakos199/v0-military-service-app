'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Bell, BellOff, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { GreekDatePicker } from '@/components/greek-date-picker'
import { FullscreenModal } from '@/components/fullscreen-modal'
import { hapticFeedback, formatGreekDate, generateId, toLocalDateString } from '@/lib/helpers'
import type { DutyEntry, DutyType } from '@/lib/types'
import { DUTY_TYPE_LABELS } from '@/lib/types'

export function DutiesTab() {
  const [duties, setDuties] = useLocalStorage<DutyEntry[]>('fantaros-duties', [])
  const [showAdd, setShowAdd] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)

  const today = toLocalDateString()

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
          new Notification('ΑΠΟΛΕΛΕ PRO - Υπηρεσία', {
            body: `${DUTY_TYPE_LABELS[duty.type]} σε 30 λεπτά (${duty.startTime})`,
            icon: '/icon-192.png',
          })
        }, notifyTime.getTime() - now.getTime())
        timers.push(timeout)
      }
    })

    return () => timers.forEach(clearTimeout)
  }, [duties, notificationsEnabled])

  const groupedDuties = duties
    .sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date)
      if (dateCompare !== 0) return dateCompare
      return a.startTime.localeCompare(b.startTime)
    })
    .reduce<Record<string, DutyEntry[]>>((groups, duty) => {
      if (!groups[duty.date]) groups[duty.date] = []
      groups[duty.date].push(duty)
      return groups
    }, {})

  const sortedDates = Object.keys(groupedDuties).sort()

  return (
    <div className="flex flex-col h-full">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-background px-4 pt-4 pb-3 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Πρόγραμμα</h1>
            <p className="text-xs text-muted-foreground">Καταγραφή υπηρεσιών</p>
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

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-28">
      <div className="flex flex-col gap-4 pt-4">

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
        />
      </FullscreenModal>

      {/* Duties List */}
      {sortedDates.length === 0 ? (
        <div className="glass-card rounded-xl p-6 text-center">
          <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Δεν υπάρχουν υπηρεσίες</p>
          <p className="text-xs text-muted-foreground mt-1">Πάτησε + για να προσθέσεις</p>
        </div>
      ) : (
        sortedDates.map((date) => {
          const isToday = date === today
          const isPast = date < today
          return (
            <div key={date} className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <h3
                  className={cn(
                    'text-xs font-semibold uppercase tracking-wider',
                    isToday ? 'text-primary' : isPast ? 'text-muted-foreground' : 'text-foreground'
                  )}
                >
                  {isToday ? 'Σήμερα' : formatGreekDate(date)}
                </h3>
                {isToday && (
                  <span className="px-1.5 py-0.5 rounded-md bg-primary text-primary-foreground text-[10px] font-bold">
                    ΕΝΕΡΓΗ
                  </span>
                )}
              </div>

              {groupedDuties[date].map((duty) => (
                <div
                  key={duty.id}
                  className={cn(
                    'glass-card rounded-xl p-3 flex items-center gap-3',
                    isToday && 'ring-1 ring-primary'
                  )}
                >
                  <div className={cn(
                    'w-1 h-10 rounded-full flex-shrink-0',
                    isToday ? 'bg-primary' : isPast ? 'bg-muted-foreground/30' : 'bg-primary'
                  )} />
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
                      setDuties(duties.filter((d) => d.id !== duty.id))
                    }}
                    className="p-2 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center text-destructive"
                    aria-label="Διαγραφή υπηρεσίας"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )
        })
      )}
    </div>
    </div>
    </div>
  )
}

function AddDutyForm({ onAdd, onCancel }: {
  onAdd: (duty: DutyEntry) => void
  onCancel: () => void
}) {
  const [type, setType] = useState<DutyType>('guard')
  const [date, setDate] = useState(toLocalDateString())
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

      <GreekDatePicker value={date} onChange={setDate} label="Ημερομηνία" compact />

      <div className="grid grid-cols-2 gap-2">
        <div className="min-w-0">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Αρχή</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full px-2 py-2 rounded-md bg-secondary text-secondary-foreground text-xs min-h-[36px] border border-border focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="min-w-0">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Τέλος</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full px-2 py-2 rounded-md bg-secondary text-secondary-foreground text-xs min-h-[36px] border border-border focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Σημειώσεις</label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Προαιρετικό..."
          className="w-full px-2 py-2 rounded-md bg-secondary text-secondary-foreground text-xs min-h-[36px] border border-border placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <div className="mt-auto flex gap-2 pt-4">
        <button
          onClick={onCancel}
          className="flex-1 py-3 rounded-md bg-secondary text-secondary-foreground font-bold text-[10px] uppercase tracking-wider min-h-[44px] hover:bg-secondary/80 transition-colors"
        >
          Ακύρωση
        </button>
        <button
          onClick={handleSubmit}
          disabled={!date}
          className="flex-1 py-3 rounded-md bg-primary text-primary-foreground font-bold text-[10px] uppercase tracking-wider min-h-[44px] disabled:opacity-40 hover:bg-primary transition-colors"
        >
          Προσθήκη
        </button>
      </div>
    </div>
  )
}
