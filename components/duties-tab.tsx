'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Bell, BellOff, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { GreekDatePicker } from '@/components/greek-date-picker'
import { FullscreenModal, ModalFooter } from '@/components/fullscreen-modal'
import { hapticFeedback, formatGreekDate, generateId, toLocalDateString, generateIcsFile, downloadIcsFile } from '@/lib/helpers'
import { Switch } from '@/components/ui/switch'
import type { DutyEntry, DutyType } from '@/lib/types'
import { DUTY_TYPE_LABELS } from '@/lib/types'
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog'

export function DutiesTab() {
  const [duties, setDuties] = useLocalStorage<DutyEntry[]>('fantaros-duties', [])
  const [showAdd, setShowAdd] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [deletePendingId, setDeletePendingId] = useState<string | null>(null)

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
      const aStart = a.startTime || '00:00'
      const bStart = b.startTime || '00:00'
      return aStart.localeCompare(bStart)
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
      <div className="sticky top-0 z-20 bg-background px-4 pt-4 pb-3 border-b border-border/50 safe-top">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[16px] font-bold text-foreground">Πρόγραμμα</h1>
            <p className="text-[8px] text-muted-foreground uppercase tracking-wider">Καταγραφή υπηρεσιών</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={requestNotifications}
              className={cn(
                'p-2 rounded-lg glass-card min-h-[40px] min-w-[40px] flex items-center justify-center transition-all',
                notificationsEnabled && 'ring-1 ring-primary bg-primary/5'
              )}
              aria-label={notificationsEnabled ? 'Ειδοποιήσεις ενεργές' : 'Ενεργοποίηση ειδοποιήσεων'}
            >
              {notificationsEnabled ? (
                <Bell className="h-4 w-4 text-primary" />
              ) : (
                <BellOff className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
            <button
              onClick={() => {
                hapticFeedback('light')
                setShowAdd(true)
              }}
              className="p-2 rounded-lg glass-card min-h-[40px] min-w-[40px] flex items-center justify-center"
              aria-label="Προσθήκη υπηρεσίας"
            >
              <Plus className="h-4 w-4 text-primary" />
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-28 no-scrollbar">
        <div className="flex flex-col gap-4 pt-4">
          {/* Add Duty Modal */}
          <FullscreenModal
            isOpen={showAdd}
            onClose={() => setShowAdd(false)}
            title="Νέα Υπηρεσία"
            contentClassName="px-6 py-5 pb-safe overflow-y-auto"
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
            <div className="glass-card rounded-xl p-6 text-center border border-white/5">
              <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-[13px] text-muted-foreground">Δεν υπάρχουν υπηρεσίες</p>
            </div>
          ) : (
            sortedDates.map((date) => {
              const isToday = date === today
              const isPast = date < today
              return (
                <div key={date} className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 px-1">
                    <h3
                      className={cn(
                        'text-[9px] font-black uppercase tracking-widest',
                        isToday ? 'text-primary' : isPast ? 'text-muted-foreground/60' : 'text-muted-foreground'
                      )}
                    >
                      {isToday ? 'Σήμερα' : formatGreekDate(date)}
                    </h3>
                    {isToday && (
                      <span className="px-1.5 py-0.5 rounded bg-primary text-primary-foreground text-[7.5px] font-black uppercase tracking-tighter">
                        ΕΝΕΡΓΗ
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    {groupedDuties[date].map((duty) => (
                      <div
                        key={duty.id}
                        className={cn(
                          'glass-card rounded-xl p-2.5 flex items-center gap-3 border border-white/5',
                          isToday && 'ring-1 ring-primary/30 bg-primary/5'
                        )}
                      >
                        <div className={cn(
                          'w-1 h-8 rounded-full flex-shrink-0',
                          isToday ? 'bg-primary' : isPast ? 'bg-muted-foreground/20' : 'bg-primary/40'
                        )} />
                        <div className="flex-1 min-w-0">
                          <span className="text-[13px] font-bold text-foreground">
                            {DUTY_TYPE_LABELS[duty.type]}
                          </span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-[9px] text-muted-foreground font-mono">
                              {duty.startTime} - {duty.endTime}
                            </p>
                            {duty.notes && (
                              <>
                                <span className="w-0.5 h-0.5 rounded-full bg-muted-foreground/30" />
                                <p className="text-[9px] text-muted-foreground truncate">{duty.notes}</p>
                              </>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            hapticFeedback('medium')
                            setDeletePendingId(duty.id)
                          }}
                          className="p-2 rounded-lg min-h-[36px] min-w-[36px] flex items-center justify-center text-destructive/70 hover:text-destructive"
                          aria-label="Διαγραφή υπηρεσίας"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {deletePendingId && (
        <DeleteConfirmDialog
          onConfirm={() => {
            setDuties(duties.filter((d) => d.id !== deletePendingId))
            setDeletePendingId(null)
          }}
          onCancel={() => setDeletePendingId(null)}
        />
      )}
    </div>
  )
}

function AddDutyForm({ onAdd, onCancel }: {
  onAdd: (duty: DutyEntry) => void
  onCancel: () => void
}) {
  const [type, setType] = useState<DutyType>('guard')
  const [date, setDate] = useState(toLocalDateString())
  const [startTime, setStartTime] = useState<string | undefined>(undefined)
  const [endTime, setEndTime] = useState<string | undefined>(undefined)
  const [notes, setNotes] = useState('')
  const [addToCalendar, setAddToCalendar] = useState(false)

  const handleSubmit = () => {
    if (!date) return
    hapticFeedback('heavy')

    if (addToCalendar && startTime && endTime) {
      const ics = generateIcsFile({
        title: DUTY_TYPE_LABELS[type],
        description: notes || `Υπηρεσία: ${DUTY_TYPE_LABELS[type]}`,
        startDate: date,
        startTime: startTime,
        endDate: date,
        endTime: endTime,
        reminderMinutes: 30,
      })
      downloadIcsFile(ics, `apolele-duty-${date}.ics`)
    }

    onAdd({
      id: generateId(),
      type,
      date,
      ...(startTime && { startTime }),
      ...(endTime && { endTime }),
      notes,
    })
  }

  const footer = (
    <div className="flex flex-col gap-4 px-6 py-5">
      <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-zinc-800">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-white tracking-wider">Προσθήκη στο Ημερολόγιο</span>
          <span className="text-[8px] text-zinc-500">Λήψη αρχείου .ics για ειδοποιήσεις</span>
        </div>
        <Switch checked={addToCalendar} onCheckedChange={setAddToCalendar} />
      </div>
      <div className="flex gap-3">
      <button
        onClick={onCancel}
        className="flex-1 py-3 rounded-xl bg-zinc-900 text-zinc-400 font-bold text-[10px] uppercase tracking-wider border border-zinc-800 hover:border-zinc-700 transition-all"
      >
        Ακύρωση
      </button>
      <button
        onClick={handleSubmit}
        className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-[10px] uppercase tracking-wider shadow-lg shadow-emerald-900/30 active:scale-95 transition-all"
      >
        Προσθήκη
      </button>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col gap-2.5 h-full">
      <ModalFooter>{footer}</ModalFooter>
      <div>
        <label className="block text-[8px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Τύπος</label>
        <div className="flex overflow-x-auto gap-1 no-scrollbar pb-0.5 -mx-1 px-1">
          <div className="flex gap-1 flex-nowrap">
            {(Object.keys(DUTY_TYPE_LABELS) as DutyType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  hapticFeedback('light')
                  setType(t)
                }}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-[8px] font-bold uppercase tracking-tight transition-all whitespace-nowrap border',
                  type === t
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-secondary text-secondary-foreground border-border hover:bg-secondary/80'
                )}
              >
                {DUTY_TYPE_LABELS[t]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <GreekDatePicker value={date} onChange={setDate} label="Ημερομηνία" compact />

      <div className="flex gap-1.5">
        <div className="flex-1 min-w-0">
            <label className="block text-[8px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Αρχή</label>
            <input
              type="time"
              value={startTime || ''}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-2 py-1 rounded-lg bg-secondary text-secondary-foreground text-[9px] min-h-[32px] border border-border focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        <div className="flex-1 min-w-0">
          <label className="block text-[8px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Τέλος</label>
          <input
            type="time"
            value={endTime || ''}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full px-2 py-1 rounded-lg bg-secondary text-secondary-foreground text-[9px] min-h-[32px] border border-border focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div>
        <label className="block text-[8px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Σημειώσεις</label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Προαιρετικό..."
          className="w-full px-2.5 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-xs min-h-[36px] border border-border placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

    </div>
  )
}


