'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Calendar as CalendarIcon,
  Edit2,
  History,
  ArrowRight,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { GreekDatePicker } from '@/components/greek-date-picker'
import { InlineDatePicker } from '@/components/inline-date-picker'
import { FullscreenModal, ModalFooter } from '@/components/fullscreen-modal'
import { ModalLayout } from '@/components/modal-layout'
import { ActionSheet, ActionSheetItem, ActionSheetCancel } from '@/components/action-sheet'
import {
  hapticFeedback,
  formatGreekDate,
  generateId,
  toLocalDateString,
  daysBetween,
  formatGreekDateFull,
  generateIcsFile,
  downloadIcsFile,
  toast,
} from '@/lib/helpers'
import { Switch } from '@/components/ui/switch'
import type { DutyEntry, DutyType, LeaveEntry, LeaveType } from '@/lib/types'
import { DUTY_TYPE_LABELS, LEAVE_TYPE_LABELS, GREEK_MONTHS } from '@/lib/types'
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog'

type ActionType = 'duty' | 'leave'
type ModalMode = 'add' | 'edit'

export function CalendarTab() {
  const [duties, setDuties] = useLocalStorage<DutyEntry[]>('fantaros-duties', [])
  const [leaves, setLeaves] = useLocalStorage<LeaveEntry[]>('fantaros-leaves', [])
  const today = toLocalDateString()
  const todayDate = new Date()

  const [viewMonth, setViewMonth] = useState(todayDate.getMonth())
  const [viewYear, setViewYear] = useState(todayDate.getFullYear())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [showActionSheet, setShowActionSheet] = useState(false)
  const [showDateDetails, setShowDateDetails] = useState(false)
  const [showAddDuty, setShowAddDuty] = useState(false)
  const [showAddLeave, setShowAddLeave] = useState(false)
  const [showFullHistory, setShowFullHistory] = useState(false)
  const [showSummaryModal, setShowSummaryModal] = useState<{ type: 'duty' | 'leave', isOpen: boolean }>({ type: 'duty', isOpen: false })
  
  const [initialDutyType, setInitialDutyType] = useState<DutyType>('guard')
  const [editingDutyId, setEditingDutyId] = useState<string | null>(null)
  const [editingLeaveId, setEditingLeaveId] = useState<string | null>(null)
  const [dutyModalMode, setDutyModalMode] = useState<ModalMode>('add')
  const [leaveModalMode, setLeaveModalMode] = useState<ModalMode>('add')
  const [deletePending, setDeletePending] = useState<{ id: string; type: 'duty' | 'leave' } | null>(null)

  const [dutyLabels, setDutyLabels] = useLocalStorage<Record<string, string>>('fantaros-duty-labels', DUTY_TYPE_LABELS)
  const [showManageTypes, setShowManageTypes] = useState(false)

  const dateEventsMap = useMemo(() => {
    const map: Record<string, { duties: DutyEntry[]; leaves: LeaveEntry[] }> = {}
    duties.forEach((d) => {
      if (!map[d.date]) map[d.date] = { duties: [], leaves: [] }
      map[d.date].duties.push(d)
    })

    const leavesSet = new Map<string, Set<string>>()

    leaves.forEach((l) => {
      const start = new Date(l.startDate)
      const end = new Date(l.endDate)
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const key = toLocalDateString(d)
        if (!map[key]) {
          map[key] = { duties: [], leaves: [] }
        }

        let set = leavesSet.get(key)
        if (!set) {
          set = new Set(map[key].leaves.map((le) => le.id))
          leavesSet.set(key, set)
        }

        if (!set.has(l.id)) {
          map[key].leaves.push(l)
          set.add(l.id)
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
    const hasEvents = (events?.duties?.length || 0) > 0 || (events?.leaves?.length || 0) > 0
    
    if (hasEvents) {
      setShowDateDetails(true)
    } else {
      setShowActionSheet(true)
    }
  }

  const handleAddDuty = useCallback(
    (duty: DutyEntry) => {
      if (dutyModalMode === 'edit' && editingDutyId) {
        setDuties(duties.map((d) => (d.id === editingDutyId ? duty : d)))
      } else {
        setDuties([...duties, duty])
      }
      setShowAddDuty(false)
      setShowActionSheet(false)
      setShowDateDetails(false)
      setEditingDutyId(null)
      setDutyModalMode('add')
      toast(dutyModalMode === 'edit' ? 'Η υπηρεσία ενημερώθηκε' : 'Η υπηρεσία προστέθηκε')
    },
    [duties, setDuties, dutyModalMode, editingDutyId]
  )

  const handleAddLeave = useCallback(
    (leave: LeaveEntry) => {
      if (leaveModalMode === 'edit' && editingLeaveId) {
        setLeaves(leaves.map((l) => (l.id === editingLeaveId ? leave : l)))
      } else {
        setLeaves([leave, ...leaves])
      }
      setShowAddLeave(false)
      setShowActionSheet(false)
      setShowDateDetails(false)
      setEditingLeaveId(null)
      setLeaveModalMode('add')
      toast(leaveModalMode === 'edit' ? 'Η άδεια ενημερώθηκε' : 'Η άδεια προστέθηκε')
    },
    [leaves, setLeaves, leaveModalMode, editingLeaveId]
  )

  const handleDeleteDuty = useCallback(
    (id: string) => {
      hapticFeedback('medium')
      setDeletePending({ id, type: 'duty' })
    },
    []
  )

  const handleDeleteLeave = useCallback(
    (id: string) => {
      hapticFeedback('medium')
      setDeletePending({ id, type: 'leave' })
    },
    []
  )

  const executeDelete = useCallback(() => {
    if (!deletePending) return
    if (deletePending.type === 'duty') {
      setDuties((prev) => prev.filter((d) => d.id !== deletePending.id))
    } else {
      setLeaves((prev) => prev.filter((l) => l.id !== deletePending.id))
    }
    setDeletePending(null)
    toast('Η καταχώρηση διαγράφηκε')
  }, [deletePending, setDuties, setLeaves])

  const handleEditDuty = (dutyId: string) => {
    setEditingDutyId(dutyId)
    setDutyModalMode('edit')
    setShowAddDuty(true)
    setShowDateDetails(false)
    setShowFullHistory(false)
    setShowSummaryModal({ ...showSummaryModal, isOpen: false })
  }

  const handleEditLeave = (leaveId: string) => {
    setEditingLeaveId(leaveId)
    setLeaveModalMode('edit')
    setShowAddLeave(true)
    setShowDateDetails(false)
    setShowFullHistory(false)
    setShowSummaryModal({ ...showSummaryModal, isOpen: false })
  }

  const handleCloseModals = () => {
    setShowAddDuty(false)
    setShowAddLeave(false)
    setShowDateDetails(false)
    setShowActionSheet(false)
    setEditingDutyId(null)
    setEditingLeaveId(null)
    setDutyModalMode('add')
    setLeaveModalMode('add')
  }

  const greekDaysStartMonday = ['Δε', 'Τρ', 'Τε', 'Πε', 'Πα', 'Σα', 'Κυ']

  return (
    <div className="flex-1 flex flex-col h-full bg-black relative z-10">
      {/* Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-48 bg-[#10b981]/5 blur-[70px] pointer-events-none rounded-full z-0"></div>

      {/* HEADER */}
      <header className="px-6 pt-14 pb-2 relative flex justify-between items-start shrink-0 z-10">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight text-white leading-none mb-1">Ημερολόγιο</h1>
          <p className="text-[10px] font-bold tracking-[0.1em] text-zinc-500 uppercase">Βάρδιες & άδειες</p>
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
              <span className="text-[12px] font-bold tracking-[0.2em] text-white uppercase">
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
                  className="text-center text-[9px] font-bold text-zinc-500 uppercase tracking-wider py-2"
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
                const totalEvents = (events?.duties?.length || 0) + (events?.leaves?.length || 0)

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
                    {/* Event count badge */}
                    {totalEvents > 0 && (
                      <div className="absolute top-1 right-1 flex items-center justify-center">
                        {totalEvents > 2 ? (
                          <span className={cn(
                            'w-4 h-4 rounded-full text-[8px] font-bold flex items-center justify-center',
                            isSelected || isToday ? 'bg-white text-emerald-600' : 'bg-emerald-500 text-white'
                          )}>
                            {totalEvents}
                          </span>
                        ) : (
                          <div className="flex gap-0.5">
                            {hasDuty && (
                              <span className={cn(
                                'w-1.5 h-1.5 rounded-full',
                                isSelected || isToday ? 'bg-white' : 'bg-emerald-400'
                              )} />
                            )}
                            {hasLeave && (
                              <span className={cn(
                                'w-1.5 h-1.5 rounded-full',
                                isSelected || isToday ? 'bg-white' : 'bg-emerald-400'
                              )} />
                            )}
                          </div>
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
                <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Υπηρεσία</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Άδεια</span>
              </div>
            </div>
          </div>
          {/* Upcoming Events */}
          <UpcomingEvents
            duties={duties}
            leaves={leaves}
            today={today}
            dutyLabels={dutyLabels}
            onDeleteDuty={handleDeleteDuty}
            onDeleteLeave={handleDeleteLeave}
            onEditDuty={handleEditDuty}
            onEditLeave={handleEditLeave}
          />

          {/* Monthly Summary */}
          <MonthlySummary
            duties={duties}
            leaves={leaves}
            viewMonth={viewMonth}
            viewYear={viewYear}
            dutyLabels={dutyLabels}
            onShowSummary={(type) => {
              hapticFeedback('medium')
              setShowSummaryModal({ type, isOpen: true })
            }}
          />

          {/* Full History Button */}
          <button
            onClick={() => {
              hapticFeedback('medium')
              setShowFullHistory(true)
            }}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-br from-zinc-700 to-gray-900/90 text-zinc-300 hover:text-white hover:border-zinc-600 transition-all active:scale-95 flex items-center justify-between font-bold text-[10px] uppercase tracking-wider"
          >
            <span className="flex items-center gap-2">
              <History size={16} />
              Πλήρες Ιστορικό
            </span>
            <ArrowRight size={14} />
          </button>

          
        </div>
      </main>

      {/* Action Sheet */}
      <ActionSheet
        isOpen={showActionSheet}
        onClose={() => setShowActionSheet(false)}
        title={selectedDate ? formatGreekDateFull(selectedDate) : ''}
        subtitle="Διαχείριση"
      >
        <ActionSheetItem
          title="Προσθήκη Υπηρεσίας"
          subtitle="Σκοπιά, Θαλαμοφύλακας, κ.ά."
          variant="duty"
          onClick={() => {
            setInitialDutyType('guard')
            setDutyModalMode('add')
            setEditingDutyId(null)
            setShowAddDuty(true)
          }}
        />
        <ActionSheetItem
          title="Προσθήκη Άδειας"
          subtitle="Κανονική, Σπουδαστική, κ.ά."
          variant="leave"
          onClick={() => {
            setLeaveModalMode('add')
            setEditingLeaveId(null)
            setShowAddLeave(true)
          }}
        />
      </ActionSheet>

      {/* Date Details Modal */}
      <DateDetailsModal
        isOpen={showDateDetails}
        selectedDate={selectedDate}
        dateEventsMap={dateEventsMap}
        dutyLabels={dutyLabels}
        onClose={() => setShowDateDetails(false)}
        onAddDuty={() => {
          setDutyModalMode('add')
          setEditingDutyId(null)
          setShowAddDuty(true)
        }}
        onAddLeave={() => {
          setLeaveModalMode('add')
          setEditingLeaveId(null)
          setShowAddLeave(true)
        }}
        onEditDuty={handleEditDuty}
        onEditLeave={handleEditLeave}
        onDeleteDuty={handleDeleteDuty}
        onDeleteLeave={handleDeleteLeave}
      />

      {/* Summary List Modal */}
      <FullscreenModal
        isOpen={showSummaryModal.isOpen}
        onClose={() => setShowSummaryModal({ ...showSummaryModal, isOpen: false })}
        title={showSummaryModal.type === 'duty' ? 'ΥΠΗΡΕΣΙΕΣ ΜΗΝΑ' : 'ΑΔΕΙΕΣ ΜΗΝΑ'}
      >
        <SummaryList
          type={showSummaryModal.type}
          duties={duties.filter(d => d.date.startsWith(`${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`))}
          leaves={leaves.filter(l => {
            const monthPrefix = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`
            return l.startDate.startsWith(monthPrefix) || l.endDate.startsWith(monthPrefix)
          })}
          dutyLabels={dutyLabels}
          onEditDuty={handleEditDuty}
          onEditLeave={handleEditLeave}
          onDeleteDuty={handleDeleteDuty}
          onDeleteLeave={handleDeleteLeave}
        />
      </FullscreenModal>

      {/* Full History Modal */}
      <FullscreenModal
        isOpen={showFullHistory}
        onClose={() => setShowFullHistory(false)}
        title="ΠΛΗΡΕΣ ΙΣΤΟΡΙΚΟ"
      >
        <FullHistoryView
          duties={duties}
          leaves={leaves}
          dutyLabels={dutyLabels}
          onEditDuty={handleEditDuty}
          onEditLeave={handleEditLeave}
          onDeleteDuty={handleDeleteDuty}
          onDeleteLeave={handleDeleteLeave}
        />
      </FullscreenModal>

      {/* Add Duty Modal */}
      <FullscreenModal
        isOpen={showAddDuty}
        onClose={handleCloseModals}
        title={dutyModalMode === 'edit' ? 'Επεξεργασία Υπηρεσίας' : 'Νέα Υπηρεσία'}
        contentClassName="px-6 py-5 pb-safe overflow-y-auto"
      >
        <AddDutyForm
          initialDate={selectedDate || today}
          initialType={initialDutyType}
          dutyLabels={dutyLabels}
          onAdd={handleAddDuty}
          onCancel={handleCloseModals}
          onManageTypes={() => setShowManageTypes(true)}
          mode={dutyModalMode}
          editingDuty={
            editingDutyId
              ? duties.find((d) => d.id === editingDutyId)
              : undefined
          }
        />
      </FullscreenModal>

      {/* Add Leave Modal */}
      <FullscreenModal
        isOpen={showAddLeave}
        onClose={handleCloseModals}
        title={leaveModalMode === 'edit' ? 'Επεξεργασία Άδειας' : 'Νέα Άδεια'}
      >
        <AddLeaveForm
          initialDate={selectedDate || today}
          onAdd={handleAddLeave}
          onCancel={handleCloseModals}
          mode={leaveModalMode}
          editingLeave={
            editingLeaveId
              ? leaves.find((l) => l.id === editingLeaveId)
              : undefined
          }
        />
      </FullscreenModal>

      {/* Manage Duty Types Modal */}
      <ManageDutyTypesModal
        isOpen={showManageTypes}
        onClose={() => setShowManageTypes(false)}
        dutyLabels={dutyLabels}
        setDutyLabels={setDutyLabels}
      />

      {/* Shared Delete Confirmation Dialog */}
      {deletePending && (
        <DeleteConfirmDialog
          onConfirm={executeDelete}
          onCancel={() => setDeletePending(null)}
        />
      )}
    </div>
  )
}

/* ---------- Monthly Summary ---------- */
function MonthlySummary({
  duties,
  leaves,
  viewMonth,
  viewYear,
  dutyLabels,
  onShowSummary,
}: {
  duties: DutyEntry[]
  leaves: LeaveEntry[]
  viewMonth: number
  viewYear: number
  dutyLabels: Record<string, string>
  onShowSummary: (type: 'duty' | 'leave') => void
}) {
  const stats = useMemo(() => {
    const monthPrefix = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
    const monthStart = `${monthPrefix}-01`
    const monthEnd = `${monthPrefix}-${String(daysInMonth).padStart(2, '0')}`

    const monthDuties = duties.filter((d) => d.date.startsWith(monthPrefix))
    
    let leaveDays = 0
    leaves.forEach((l) => {
      const lStart = l.startDate < monthStart ? monthStart : l.startDate
      const lEnd = l.endDate > monthEnd ? monthEnd : l.endDate
      if (lStart <= lEnd) {
        const days = daysBetween(lStart, lEnd) + 1
        leaveDays += days
      }
    })

    return {
      totalDuties: monthDuties.length,
      leaveDays,
    }
  }, [duties, leaves, viewMonth, viewYear])

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-[10px] font-bold tracking-[0.2em] text-zinc-500 uppercase px-1">
        {GREEK_MONTHS[viewMonth]} - Σύνοψη
      </h3>

      <div className="flex gap-3">
        {/* Duties card */}
        <button
          onClick={() => onShowSummary('duty')}
          className="flex-1 rounded-[1.5rem] bg-emerald-500/15 p-4 text-left transition-all active:scale-95 group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
            <ArrowRight size={16} className="text-emerald-400" />
          </div>
          <span className="text-[9px] font-bold text-emerald-400/80 uppercase tracking-widest block mb-1">
            ΥΠΗΡΕΣΙΕΣ
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-white">{stats.totalDuties}</span>
            <span className="text-[9px] text-zinc-400 font-medium uppercase">ΣΥΝΟΛΟ</span>
          </div>
        </button>

        {/* Leave card */}
        <button
          onClick={() => onShowSummary('leave')}
          className="flex-1 rounded-[1.5rem] bg-emerald-500/15 p-4 text-left transition-all active:scale-95 group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
            <ArrowRight size={16} className="text-emerald-400" />
          </div>
          <span className="text-[9px] font-bold text-emerald-400/80 uppercase tracking-widest block mb-1">
            ΑΔΕΙΕΣ
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-white">{stats.leaveDays}</span>
            <span className="text-[9px] text-zinc-400 font-medium uppercase">Ημέρες</span>
          </div>
        </button>
      </div>
    </div>
  )
}

/* ---------- Summary List Component ---------- */
function SummaryList({
  type,
  duties,
  leaves,
  dutyLabels,
  onEditDuty,
  onEditLeave,
  onDeleteDuty,
  onDeleteLeave,
}: {
  type: 'duty' | 'leave'
  duties: DutyEntry[]
  leaves: LeaveEntry[]
  dutyLabels: Record<string, string>
  onEditDuty: (id: string) => void
  onEditLeave: (id: string) => void
  onDeleteDuty: (id: string) => void
  onDeleteLeave: (id: string) => void
}) {
  if (type === 'duty') {
    if (duties.length === 0) {
      return (
        <div className="text-center py-12">
          <CalendarIcon className="h-12 w-12 text-zinc-700 mx-auto mb-4 opacity-30" />
          <p className="text-zinc-500 text-sm font-medium">Καμία υπηρεσία για αυτόν τον μήνα</p>
        </div>
      )
    }
    return (
      <div className="flex flex-col gap-3 p-2">
        {duties.sort((a, b) => a.date.localeCompare(b.date)).map((duty) => (
          <div
            key={duty.id}
            className="bg-gradient-to-br from-zinc-800 to-zinc-900/90 border border-zinc-700/40 rounded-[1.5rem] p-4 flex items-center gap-4"
          >
            <div className="w-1.5 h-10 rounded-full bg-emerald-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-white">{dutyLabels[duty.type] || duty.type}</p>
              <p className="text-[8px] text-zinc-400 mt-0.5">
                {formatGreekDate(duty.date)} • {duty.startTime} - {duty.endTime}
              </p>
            </div>
            <div className="flex gap-1">
              <button onClick={() => onEditDuty(duty.id)} className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors">
                <Edit2 size={16} />
              </button>
              <button onClick={() => onDeleteDuty(duty.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (leaves.length === 0) {
    return (
      <div className="text-center py-12">
        <CalendarIcon className="h-12 w-12 text-zinc-700 mx-auto mb-4 opacity-30" />
        <p className="text-zinc-500 text-sm font-medium">Καμία άδεια για αυτόν τον μήνα</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 p-2">
      {leaves.sort((a, b) => a.startDate.localeCompare(b.startDate)).map((leave) => (
        <div
          key={leave.id}
          className="bg-gradient-to-br from-zinc-800 to-zinc-900/90 border border-zinc-700/40 rounded-[1.5rem] p-4 flex items-center gap-4"
        >
          <div className="w-1.5 h-10 rounded-full bg-emerald-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-white">{LEAVE_TYPE_LABELS[leave.type]}</p>
            <p className="text-[8px] text-zinc-400 mt-0.5">
              {formatGreekDate(leave.startDate)} - {formatGreekDate(leave.endDate)} • {leave.days} ημ.
            </p>
          </div>
          <div className="flex gap-1">
            <button onClick={() => onEditLeave(leave.id)} className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors">
              <Edit2 size={16} />
            </button>
            <button onClick={() => onDeleteLeave(leave.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ---------- Full History View ---------- */
function FullHistoryView({
  duties,
  leaves,
  dutyLabels,
  onEditDuty,
  onEditLeave,
  onDeleteDuty,
  onDeleteLeave,
}: {
  duties: DutyEntry[]
  leaves: LeaveEntry[]
  dutyLabels: Record<string, string>
  onEditDuty: (id: string) => void
  onEditLeave: (id: string) => void
  onDeleteDuty: (id: string) => void
  onDeleteLeave: (id: string) => void
}) {
  const [activeTab, setActiveTab] = useState<'duty' | 'leave'>('duty')

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Tab Switcher */}
      <div className="flex p-1 bg-zinc-900/50 rounded-2xl border border-zinc-800/50 mx-2">
        <button
          onClick={() => { hapticFeedback('light'); setActiveTab('duty'); }}
          className={cn(
            'flex-1 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all',
            activeTab === 'duty' ? 'bg-zinc-800 text-emerald-400 shadow-lg' : 'text-zinc-500'
          )}
        >
          Υπηρεσίες ({duties.length})
        </button>
        <button
          onClick={() => { hapticFeedback('light'); setActiveTab('leave'); }}
          className={cn(
            'flex-1 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all',
            activeTab === 'leave' ? 'bg-zinc-800 text-emerald-400 shadow-lg' : 'text-zinc-500'
          )}
        >
          Άδειες ({leaves.length})
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-10 hide-scrollbar">
        {activeTab === 'duty' ? (
          <div className="flex flex-col gap-3">
            {duties.length === 0 ? (
              <div className="text-center py-20 opacity-30">
                <CalendarIcon className="h-16 w-16 mx-auto mb-4" />
                <p className="text-sm">Δεν υπάρχει ιστορικό υπηρεσιών</p>
              </div>
            ) : (
              duties.sort((a, b) => b.date.localeCompare(a.date)).map(duty => (
                <div key={duty.id} className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-4 flex items-center gap-4">
                  <div className="w-1 h-8 rounded-full bg-emerald-500/50" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-white">{dutyLabels[duty.type] || duty.type}</p>
                    <p className="text-[8px] text-zinc-500">{formatGreekDate(duty.date)}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => onEditDuty(duty.id)} className="p-2 text-emerald-400/70"><Edit2 size={16} /></button>
                    <button onClick={() => onDeleteDuty(duty.id)} className="p-2 text-red-400/70"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {leaves.length === 0 ? (
              <div className="text-center py-20 opacity-30">
                <CalendarIcon className="h-16 w-16 mx-auto mb-4" />
                <p className="text-sm">Δεν υπάρχει ιστορικό αδειών</p>
              </div>
            ) : (
              leaves.sort((a, b) => b.startDate.localeCompare(a.startDate)).map(leave => (
                <div key={leave.id} className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-4 flex items-center gap-4">
                  <div className="w-1 h-8 rounded-full bg-emerald-500/50" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-white">{LEAVE_TYPE_LABELS[leave.type]}</p>
                    <p className="text-[8px] text-zinc-500">{formatGreekDate(leave.startDate)} - {formatGreekDate(leave.endDate)}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => onEditLeave(leave.id)} className="p-2 text-emerald-400/70"><Edit2 size={16} /></button>
                    <button onClick={() => onDeleteLeave(leave.id)} className="p-2 text-red-400/70"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/* ---------- Date Details Modal ---------- */
function DateDetailsModal({
  isOpen,
  selectedDate,
  dateEventsMap,
  dutyLabels,
  onClose,
  onAddDuty,
  onAddLeave,
  onEditDuty,
  onEditLeave,
  onDeleteDuty,
  onDeleteLeave,
}: {
  isOpen: boolean
  selectedDate: string | null
  dateEventsMap: Record<string, { duties: DutyEntry[]; leaves: LeaveEntry[] }>
  dutyLabels: Record<string, string>
  onClose: () => void
  onAddDuty: () => void
  onAddLeave: () => void
  onEditDuty: (id: string) => void
  onEditLeave: (id: string) => void
  onDeleteDuty: (id: string) => void
  onDeleteLeave: (id: string) => void
}) {
  if (!isOpen || !selectedDate) return null

  const events = dateEventsMap[selectedDate]
  const duties = events?.duties || []
  const leaves = events?.leaves || []

  const header = (
    <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-zinc-800/80">
      <div className="flex-1">
        <h2 className="text-[16px] font-bold text-white">
          {formatGreekDateFull(selectedDate)}
        </h2>
        <p className="text-[10px] text-zinc-500 font-bold tracking-[0.1em] uppercase mt-1">
          {duties.length + leaves.length} γεγονότ{duties.length + leaves.length === 1 ? 'α' : 'α'}
        </p>
      </div>
      <button
        onClick={onClose}
        className="p-2 rounded-full bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center text-zinc-400 hover:text-[#34d399] transition-colors active:scale-95 flex-shrink-0 ml-2"
        aria-label="Κλείσιμο"
      >
        <Plus size={20} className="rotate-45" />
      </button>
    </div>
  )

  const footer = (
    <div className="flex gap-2 px-6 py-5 border-t border-zinc-700/30">
      <button
        onClick={onAddDuty}
        className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-[10px] uppercase tracking-wider shadow-lg shadow-emerald-900/30 active:scale-95 transition-all"
      >
        + Υπηρεσία
      </button>
      <button
        onClick={onAddLeave}
        className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-[10px] uppercase tracking-wider shadow-lg shadow-emerald-900/30 active:scale-95 transition-all"
      >
        + Άδεια
      </button>
    </div>
  )

  return (
    <div
      className="fixed inset-0 z-[85] bg-black/80 backdrop-blur-sm flex flex-col"
      onClick={onClose}
    >
      <div
        className="flex-1 flex flex-col w-full h-full safe-top safe-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        <ModalLayout
          header={header}
          footer={footer}
          contentClassName="px-6 py-5"
        >
          <div className="flex flex-col gap-4">
            {/* Duties */}
            {duties.length > 0 && (
              <div className="flex flex-col gap-2">
                <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Υπηρεσίες ({duties.length})</h3>
                <div className="flex flex-col gap-2">
                  {duties.map((duty) => (
                    <div
                      key={duty.id}
                      className="bg-gradient-to-br from-zinc-800 to-zinc-900/90 border border-zinc-700/40 rounded-[1.25rem] p-3 flex items-start gap-3"
                    >
                      <div className="w-1 h-10 rounded-full bg-emerald-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-white">{dutyLabels[duty.type] || duty.type}</p>
                        <p className="text-[8px] text-zinc-400 mt-0.5">
                          {duty.startTime && duty.endTime ? `${duty.startTime} - ${duty.endTime}` : 'Χωρίς ώρα'}
                        </p>
                        {duty.notes && (
                          <p className="text-[8px] text-zinc-500 mt-1 line-clamp-2">{duty.notes}</p>
                        )}
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button
                          onClick={() => onEditDuty(duty.id)}
                          className="p-2 rounded-lg flex items-center justify-center text-emerald-400 hover:bg-emerald-500/10 transition-colors active:scale-90"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => onDeleteDuty(duty.id)}
                          className="p-2 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-500/10 transition-colors active:scale-90"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Leaves */}
            {leaves.length > 0 && (
              <div className="flex flex-col gap-2">
                <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Άδειες ({leaves.length})</h3>
                <div className="flex flex-col gap-2">
                  {leaves.map((leave) => (
                    <div
                      key={leave.id}
                      className="bg-gradient-to-br from-zinc-800 to-zinc-900/90 border border-zinc-700/40 rounded-[1.25rem] p-3 flex items-start gap-3"
                    >
                      <div className="w-1 h-10 rounded-full bg-emerald-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-white">{LEAVE_TYPE_LABELS[leave.type]}</p>
                        <p className="text-[8px] text-zinc-400 mt-0.5">
                          {formatGreekDate(leave.startDate)} - {formatGreekDate(leave.endDate)} • {leave.days} ημ.
                        </p>
                        {leave.notes && (
                          <p className="text-[8px] text-zinc-500 mt-1 line-clamp-2">{leave.notes}</p>
                        )}
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button
                          onClick={() => onEditLeave(leave.id)}
                          className="p-2 rounded-lg flex items-center justify-center text-emerald-400 hover:bg-emerald-500/10 transition-colors active:scale-90"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => onDeleteLeave(leave.id)}
                          className="p-2 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-500/10 transition-colors active:scale-90"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {duties.length === 0 && leaves.length === 0 && (
              <div className="text-center py-8">
                <CalendarIcon className="h-10 w-10 text-zinc-600 mx-auto mb-3 opacity-50" />
                <p className="text-[11px] text-zinc-400 font-semibold">Δεν υπάρχουν γεγονότα</p>
              </div>
            )}
          </div>
        </ModalLayout>
      </div>
    </div>
  )
}

function UpcomingEvents({
  duties,
  leaves,
  today,
  dutyLabels,
  onDeleteDuty,
  onDeleteLeave,
  onEditDuty,
  onEditLeave,
}: {
  duties: DutyEntry[]
  leaves: LeaveEntry[]
  today: string
  dutyLabels: Record<string, string>
  onDeleteDuty: (id: string) => void
  onDeleteLeave: (id: string) => void
  onEditDuty: (id: string) => void
  onEditLeave: (id: string) => void
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
        <p className="text-[11px] text-zinc-400 font-semibold">Δεν υπάρχουν προσεχή γεγονότα</p>
        <p className="text-[9px] text-zinc-500 mt-1">Πάτησε μια ημερομηνία για να προσθέσεις</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-[10px] font-bold tracking-[0.2em] text-zinc-500 uppercase px-1">Προσεχώς</h2>
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
                  <span className="text-[11px] font-bold text-white">{dutyLabels[duty.type] || duty.type}</span>
                  {isToday && (
                    <span className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-[8px] font-bold uppercase tracking-wider">
                      ΣΗΜΕΡΑ
                    </span>
                  )}
                </div>
                <p className="text-[8px] text-zinc-400 mt-1">
                  {formatGreekDate(duty.date)} • {duty.startTime} - {duty.endTime}
                </p>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button
                  onClick={() => onEditDuty(duty.id)}
                  className="p-2 rounded-lg flex items-center justify-center text-emerald-400 hover:bg-emerald-500/10 transition-colors active:scale-90"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => onDeleteDuty(duty.id)}
                  className="p-2 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-500/10 transition-colors active:scale-90"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          )
        } else {
          const leave = item.entry as LeaveEntry
          return (
            <div
              key={leave.id}
              className="bg-gradient-to-br from-zinc-800 to-zinc-900/90 border border-zinc-700/40 rounded-[1.5rem] p-4 flex items-center gap-4 shadow-lg shadow-black/10"
            >
              <div className="w-1.5 h-12 rounded-full flex-shrink-0 bg-emerald-400" />
              <div className="flex-1 min-w-0">
                <span className="text-[11px] font-bold text-white break-words">{LEAVE_TYPE_LABELS[leave.type]}</span>
                <p className="text-[8px] text-zinc-400 mt-1">
                  {formatGreekDate(leave.startDate)} - {formatGreekDate(leave.endDate)} • {leave.days} ημ.
                </p>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button
                  onClick={() => onEditLeave(leave.id)}
                  className="p-2 rounded-lg flex items-center justify-center text-emerald-400 hover:bg-emerald-500/10 transition-colors active:scale-90"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => onDeleteLeave(leave.id)}
                  className="p-2 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-500/10 transition-colors active:scale-90"
                >
                  <Trash2 size={16} />
                </button>
              </div>
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
  dutyLabels,
  onAdd,
  onCancel,
  onManageTypes,
  mode = 'add',
  editingDuty,
}: {
  initialDate: string
  initialType?: DutyType
  dutyLabels: Record<string, string>
  onAdd: (duty: DutyEntry) => void
  onCancel: () => void
  onManageTypes: () => void
  mode?: ModalMode
  editingDuty?: DutyEntry
}) {
  const [type, setType] = useState<DutyType>(editingDuty?.type || initialType)
  const [date, setDate] = useState(editingDuty?.date || initialDate)
  const [startTime, setStartTime] = useState(editingDuty?.startTime || '08:00')
  const [endTime, setEndTime] = useState(editingDuty?.endTime || '08:00')
  const [notes, setNotes] = useState(editingDuty?.notes || '')
  const [password, setPassword] = useState(editingDuty?.password || '')
  const [countersign, setCountersign] = useState(editingDuty?.countersign || '')
  const [addToCalendar, setAddToCalendar] = useState(true)

  const handleSubmit = () => {
    if (!date || !startTime || !endTime) return
    
    hapticFeedback('heavy')

    if (addToCalendar) {
      const ics = generateIcsFile({
        title: dutyLabels[type] || type,
        description: notes || `Υπηρεσία: ${dutyLabels[type] || type}`,
        startDate: date,
        startTime: startTime,
        endDate: date,
        endTime: endTime,
        reminderMinutes: 30,
      })
      downloadIcsFile(ics, `apolele-duty-${date}.ics`)
    }

    onAdd({
      id: editingDuty?.id || generateId(),
      type,
      date,
      startTime,
      endTime,
      notes,
      password,
      countersign,
    })
  }

  const footer = (
    <div className="flex flex-col gap-4 px-6 py-5">
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
        {mode === 'edit' ? 'Ενημέρωση' : 'Προσθήκη'}
      </button>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col gap-6 p-2">
      <ModalFooter>{footer}</ModalFooter>
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Τύπος υπηρεσίας
          </label>
          <button
            onClick={onManageTypes}
            className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-[#34d399] transition-colors"
          >
            <Settings size={14} />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(dutyLabels).map(([t, label]) => (
              <button
                key={t}
                onClick={() => setType(t as DutyType)}
                className={cn(
                  'py-2.5 rounded-xl text-[8px] font-bold uppercase tracking-wider transition-all border shrink-0 min-h-[44px] flex items-center justify-center text-center px-1 leading-tight',
                  type === t
                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <InlineDatePicker value={date} onChange={setDate} label="Ημερομηνία" />

        {type === 'guard' && (
          <div className="grid grid-cols-2 gap-2 bg-indigo-500/5 border border-indigo-500/10 p-3 rounded-2xl">
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-indigo-400 mb-2">Σύνθημα</label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value.toUpperCase())}
                placeholder="π.χ. ΑΕΤΟΣ"
                className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 text-white text-xs border border-zinc-800 focus:border-indigo-500 outline-none uppercase tracking-widest"
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-indigo-400 mb-2">Παρασύνθημα</label>
              <input
                type="text"
                value={countersign}
                onChange={(e) => setCountersign(e.target.value.toUpperCase())}
                placeholder="π.χ. ΒΟΥΝΟ"
                className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 text-[#34d399] text-xs border border-zinc-800 focus:border-indigo-500 outline-none uppercase tracking-widest"
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Ώρα έναρξης</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-2 py-2.5 rounded-xl bg-zinc-900 text-white text-xs border border-zinc-800 focus:border-emerald-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Ώρα λήξης</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-2 py-2.5 rounded-xl bg-zinc-900 text-white text-xs border border-zinc-800 focus:border-emerald-500 outline-none"
            />
          </div>
        </div>

      <div>
        <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Σημειώσεις</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Προσθήκη σημειώσεων..."
          className="w-full px-3 py-3 rounded-xl bg-zinc-900 text-white text-sm border border-zinc-800 focus:border-emerald-500 outline-none resize-none h-24"
        />
      </div>

      <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-white tracking-wider">Προσθήκη στο Ημερολόγιο</span>
          <span className="text-[8px] text-zinc-500">Θα προστεθεί στο ημερολόγιο ως ειδοποίηση</span>
        </div>
        <Switch checked={addToCalendar} onCheckedChange={setAddToCalendar} />
      </div>
    </div>
  )
}

/* ---------- Add Leave Form ---------- */
function AddLeaveForm({
  initialDate,
  onAdd,
  onCancel,
  mode = 'add',
  editingLeave,
}: {
  initialDate: string
  onAdd: (leave: LeaveEntry) => void
  onCancel: () => void
  mode?: ModalMode
  editingLeave?: LeaveEntry
}) {
  const [type, setType] = useState<LeaveType>(editingLeave?.type || 'regular')
  const [startDate, setStartDate] = useState(editingLeave?.startDate || initialDate)
  const [endDate, setEndDate] = useState(editingLeave?.endDate || initialDate)
  const [notes, setNotes] = useState(editingLeave?.notes || '')

  const handleSubmit = () => {
    if (!startDate || !endDate) return
    
    const days = daysBetween(startDate, endDate) + 1
    hapticFeedback('heavy')
    onAdd({
      id: editingLeave?.id || generateId(),
      type,
      startDate,
      endDate,
      days,
      notes,
    })
  }

  const footer = (
    <div className="flex gap-3 px-6 py-5">
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
        {mode === 'edit' ? 'Ενημέρωση' : 'Προσθήκη'}
      </button>
    </div>
  )

  return (
    <div className="flex flex-col gap-6 p-2">
      <ModalFooter>{footer}</ModalFooter>
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-3 px-1">
          Τύπος άδειας
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(['regular', 'student', 'honorary', 'medical', 'emergency', 'other'] as LeaveType[]).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={cn(
                'py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border',
                type === t
                  ? 'bg-emerald-500 text-white border-emerald-500'
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
        <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Σημειώσεις</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Προσθήκη σημειώσεων..."
          className="w-full px-3 py-3 rounded-xl bg-zinc-900 text-white text-sm border border-zinc-800 focus:border-emerald-500 outline-none resize-none h-24"
        />
      </div>
    </div>
  )
}

/* ---------- Manage Duty Types Modal ---------- */
function ManageDutyTypesModal({
  isOpen,
  onClose,
  dutyLabels,
  setDutyLabels,
}: {
  isOpen: boolean
  onClose: () => void
  dutyLabels: Record<string, string>
  setDutyLabels: (labels: Record<string, string>) => void
}) {
  const [localLabels, setLocalLabels] = useState(dutyLabels)
  const [newTypeName, setNewTypeName] = useState('')
  const [mounted, setMounted] = useState(false)

  // Handle mounting for Portal
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // Sync local state when modal opens
  useEffect(() => {
    if (isOpen) setLocalLabels(dutyLabels)
  }, [isOpen, dutyLabels])

  const handleSave = () => {
    setDutyLabels(localLabels)
    hapticFeedback('medium')
    onClose()
  }

  const handleAddType = () => {
    if (!newTypeName.trim()) return
    const id = `custom_${generateId()}`
    setLocalLabels({ ...localLabels, [id]: newTypeName.trim() })
    setNewTypeName('')
    hapticFeedback('light')
  }

  const handleDeleteType = (key: string) => {
    const coreTypes = ['guard', 'barracks', 'officer', 'patrol', 'kitchen', 'other']
    if (coreTypes.includes(key)) return
    
    const { [key]: _, ...rest } = localLabels
    setLocalLabels(rest)
    hapticFeedback('medium')
  }

  if (!isOpen || !mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-[250] bg-black/80 backdrop-blur-sm flex flex-col" onClick={onClose}>
      <div className="flex-1 flex flex-col w-full h-full safe-top safe-bottom" onClick={(e) => e.stopPropagation()}>
        <ModalLayout
          header={
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-zinc-800/80">
              <div>
                <h2 className="text-[16px] font-bold text-white">Τύποι Υπηρεσιών</h2>
                <p className="text-[10px] text-zinc-500 font-bold tracking-wider uppercase mt-1">Διαχείριση ονομάτων</p>
              </div>
              <button onClick={onClose} className="p-2 rounded-full bg-zinc-800/80 text-zinc-400 transition-colors hover:text-white" aria-label="Κλείσιμο">
                <Plus size={20} className="rotate-45" />
              </button>
            </div>
          }
          footer={
            <div className="px-6 py-5 border-t border-zinc-800/50">
               <button
                onClick={handleSave}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-[10px] uppercase tracking-wider shadow-lg shadow-emerald-900/30 active:scale-95 transition-all"
              >
                Αποθήκευση Αλλαγών
              </button>
            </div>
          }
          contentClassName="px-6 py-6"
        >
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-1">Υπάρχοντες Τύποι</label>
              <div className="flex flex-col gap-2">
                {Object.entries(localLabels).map(([key, label]) => (
                  <div key={key} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={label}
                      onChange={(e) => setLocalLabels({ ...localLabels, [key]: e.target.value })}
                      className="flex-1 px-4 py-3 rounded-xl bg-zinc-900 text-white text-sm border border-zinc-800 focus:border-emerald-500 outline-none"
                    />
                    {!['guard', 'barracks', 'officer', 'patrol', 'kitchen', 'other'].includes(key) && (
                      <button 
                        onClick={() => handleDeleteType(key)}
                        className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="h-px bg-zinc-800/50 my-2" />

            <div className="flex flex-col gap-3">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-1">Προσθήκη Νέου</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Όνομα νέου τύπου..."
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-xl bg-zinc-900 text-white text-sm border border-zinc-800 focus:border-emerald-500 outline-none"
                />
                <button 
                  onClick={handleAddType}
                  className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20 active:scale-95 transition-all disabled:opacity-30"
                  disabled={!newTypeName.trim()}
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>
          </div>
        </ModalLayout>
      </div>
    </div>,
    document.body
  )
}


