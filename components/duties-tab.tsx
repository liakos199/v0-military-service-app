'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Bell, BellOff, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { GreekDatePicker } from '@/components/greek-date-picker'
import { FullscreenModal, ModalFooter } from '@/components/fullscreen-modal'
import { hapticFeedback, formatGreekDate, generateId, toLocalDateString, generateIcsFile, downloadIcsFile } from '@/lib/helpers'
import { getDutyStats, calculateDutyDuration } from '@/lib/duty-utils'
import { Switch } from '@/components/ui/switch'
import { DutyForm } from '@/components/shared/duty-form'
import type { DutyEntry, DutyType, LeaveEntry } from '@/lib/types'
import { DUTY_TYPE_LABELS } from '@/lib/types'
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog'

export function DutiesTab() {
  const [duties, setDuties] = useLocalStorage<DutyEntry[]>('fantaros-duties', [])
  const [leaves] = useLocalStorage<LeaveEntry[]>('fantaros-leaves', [])
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
            <DutyForm
              initialDate={toLocalDateString()}
              dutyLabels={DUTY_TYPE_LABELS}
              onAdd={(duty) => {
                setDuties([...duties, duty])
                setShowAdd(false)
              }}
              onCancel={() => setShowAdd(false)}
              existingDuties={duties}
              existingLeaves={leaves}
              compact
            />
          </FullscreenModal>

          {/* Duties List */}
          {sortedDates.length === 0 ? (
            <div className="glass-card rounded-lg p-6 text-center border border-white/5">
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
                          'glass-card rounded-lg p-2.5 flex items-center gap-3 border border-white/5',
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
                            <p className="text-[9px] text-muted-foreground">
                              {duty.startTime} - {duty.endTime} 
                              {duty.durationMinutes && (
                                <span className="ml-2 text-emerald-500/70">
                                  ({Math.floor(duty.durationMinutes / 60)}ώ {duty.durationMinutes % 60}λ)
                                </span>
                              )}
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



