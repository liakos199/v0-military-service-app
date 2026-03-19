'use client'

import { useState, useMemo, useCallback } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Calendar as CalendarIcon,
  Edit2,
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
  formatGreekDateFull,
} from '@/lib/helpers'
import type { DutyEntry, DutyType, LeaveEntry, LeaveType } from '@/lib/types'
import { DUTY_TYPE_LABELS, LEAVE_TYPE_LABELS, GREEK_MONTHS } from '@/lib/types'

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
  const [initialDutyType, setInitialDutyType] = useState<DutyType>('guard')
  const [editingDutyId, setEditingDutyId] = useState<string | null>(null)
  const [editingLeaveId, setEditingLeaveId] = useState<string | null>(null)
  const [dutyModalMode, setDutyModalMode] = useState<ModalMode>('add')
  const [leaveModalMode, setLeaveModalMode] = useState<ModalMode>('add')

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
    },
    [leaves, setLeaves, leaveModalMode, editingLeaveId]
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

  const handleEditDuty = (dutyId: string) => {
    setEditingDutyId(dutyId)
    setDutyModalMode('edit')
    setShowAddDuty(true)
    setShowDateDetails(false)
  }

  const handleEditLeave = (leaveId: string) => {
    setEditingLeaveId(leaveId)
    setLeaveModalMode('edit')
    setShowAddLeave(true)
    setShowDateDetails(false)
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
                                isSelected || isToday ? 'bg-white' : 'bg-amber-400'
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
            onEditDuty={handleEditDuty}
            onEditLeave={handleEditLeave}
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

      {/* Action Sheet - for adding entries to empty dates or today */}
      <ActionSheet
        isOpen={showActionSheet}
        onClose={() => setShowActionSheet(false)}
        title={selectedDate ? formatGreekDateFull(selectedDate) : ''}
        subtitle="Διαχείριση"
      >
        <ActionSheetItem
          title="Προσθήκη Υπηρεσίας"
          subtitle="Σκοπιά, Θαλαμοφύλακας, κ.ά."
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
          onClick={() => {
            setLeaveModalMode('add')
            setEditingLeaveId(null)
            setShowAddLeave(true)
          }}
        />
        <ActionSheetCancel onClick={() => setShowActionSheet(false)} />
      </ActionSheet>

      {/* Date Details Modal - for viewing and managing entries on a specific date */}
      <DateDetailsModal
        isOpen={showDateDetails}
        selectedDate={selectedDate}
        dateEventsMap={dateEventsMap}
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

      {/* Add Duty Modal */}
      <FullscreenModal
        isOpen={showAddDuty}
        onClose={handleCloseModals}
        title={dutyModalMode === 'edit' ? 'Επεξεργασία Υπηρεσίας' : 'Νέα Υπηρεσία'}
      >
        <AddDutyForm
          initialDate={selectedDate || today}
          initialType={initialDutyType}
          onAdd={handleAddDuty}
          onCancel={handleCloseModals}
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
    </div>
  )
}

/* ---------- Date Details Modal ---------- */
function DateDetailsModal({
  isOpen,
  selectedDate,
  dateEventsMap,
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

  return (
    <div
      className="fixed inset-0 z-[85] bg-black/80 backdrop-blur-sm animate-fade-in flex flex-col"
      onClick={onClose}
    >
      <div
        className="flex-1 flex flex-col w-full h-full safe-top safe-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-zinc-800/80 shrink-0">
          <div className="flex-1">
            <h2 className="text-[20px] font-bold text-white">
              {formatGreekDateFull(selectedDate)}
            </h2>
            <p className="text-[13px] text-zinc-500 font-bold tracking-[0.1em] uppercase mt-1">
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 hide-scrollbar">
          <div className="flex flex-col gap-4">
            {/* Duties */}
            {duties.length > 0 && (
              <div className="flex flex-col gap-2">
                <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Υπηρεσίες ({duties.length})</h3>
                <div className="flex flex-col gap-2">
                  {duties.map((duty) => (
                    <div
                      key={duty.id}
                      className="bg-gradient-to-br from-zinc-800 to-zinc-900/90 border border-zinc-700/40 rounded-[1.25rem] p-3 flex items-start gap-3"
                    >
                      <div className="w-1 h-10 rounded-full bg-emerald-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-bold text-white">{DUTY_TYPE_LABELS[duty.type]}</p>
                        <p className="text-[10px] text-zinc-400 mt-0.5">
                          {duty.startTime && duty.endTime ? `${duty.startTime} - ${duty.endTime}` : 'Χωρίς ώρα'}
                        </p>
                        {duty.notes && (
                          <p className="text-[9px] text-zinc-500 mt-1 line-clamp-2">{duty.notes}</p>
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
                <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Άδειες ({leaves.length})</h3>
                <div className="flex flex-col gap-2">
                  {leaves.map((leave) => (
                    <div
                      key={leave.id}
                      className="bg-gradient-to-br from-zinc-800 to-zinc-900/90 border border-zinc-700/40 rounded-[1.25rem] p-3 flex items-start gap-3"
                    >
                      <div className="w-1 h-10 rounded-full bg-amber-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-bold text-white">{LEAVE_TYPE_LABELS[leave.type]}</p>
                        <p className="text-[10px] text-zinc-400 mt-0.5">
                          {formatGreekDate(leave.startDate)} - {formatGreekDate(leave.endDate)} • {leave.days} ημ.
                        </p>
                        {leave.notes && (
                          <p className="text-[9px] text-zinc-500 mt-1 line-clamp-2">{leave.notes}</p>
                        )}
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button
                          onClick={() => onEditLeave(leave.id)}
                          className="p-2 rounded-lg flex items-center justify-center text-amber-400 hover:bg-amber-500/10 transition-colors active:scale-90"
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
                <p className="text-[12px] text-zinc-400 font-semibold">Δεν υπάρχουν γεγονότα</p>
              </div>
            )}

            {/* Add Buttons */}
            <div className="flex gap-2 pt-4 border-t border-zinc-700/30">
              <button
                onClick={onAddDuty}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-[11px] uppercase tracking-wider shadow-lg shadow-emerald-900/30 active:scale-95 transition-all"
              >
                + Υπηρεσία
              </button>
              <button
                onClick={onAddLeave}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-[11px] uppercase tracking-wider shadow-lg shadow-amber-900/30 active:scale-95 transition-all"
              >
                + Άδεια
              </button>
            </div>
          </div>
        </div>
      </div>
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
  onEditDuty,
  onEditLeave,
}: {
  duties: DutyEntry[]
  leaves: LeaveEntry[]
  today: string
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
              <div className="flex gap-1 flex-shrink-0">
                <button
                  onClick={() => onEditDuty(duty.id)}
                  className="p-2 rounded-lg flex items-center justify-center text-emerald-400 hover:bg-emerald-500/10 transition-colors active:scale-90"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => onDeleteDuty(duty.id)}
                  className="p-2 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-500/10 transition-colors active:scale-90"
                >
                  <Trash2 size={18} />
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
              <div className="w-1.5 h-12 rounded-full flex-shrink-0 bg-amber-400" />
              <div className="flex-1 min-w-0">
                <span className="text-[12px] font-bold text-white break-words">{LEAVE_TYPE_LABELS[leave.type]}</span>
                <p className="text-[10px] text-zinc-400 mt-1">
                  {formatGreekDate(leave.startDate)} - {formatGreekDate(leave.endDate)} • {leave.days} ημ.
                </p>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button
                  onClick={() => onEditLeave(leave.id)}
                  className="p-2 rounded-lg flex items-center justify-center text-amber-400 hover:bg-amber-500/10 transition-colors active:scale-90"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => onDeleteLeave(leave.id)}
                  className="p-2 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-500/10 transition-colors active:scale-90"
                >
                  <Trash2 size={18} />
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
  onAdd,
  onCancel,
  mode = 'add',
  editingDuty,
}: {
  initialDate: string
  initialType?: DutyType
  onAdd: (duty: DutyEntry) => void
  onCancel: () => void
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

  const handleSubmit = () => {
    if (!date || !startTime || !endTime) return
    
    hapticFeedback('heavy')
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
          {mode === 'edit' ? 'Ενημέρωση' : 'Προσθήκη'}
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
          {mode === 'edit' ? 'Ενημέρωση' : 'Προσθήκη'}
        </button>
      </div>
    </div>
  )
}
