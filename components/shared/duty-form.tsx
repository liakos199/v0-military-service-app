'use client'

import { useState, useEffect, useMemo } from 'react'
import { Settings, Info, AlertTriangle, Clock, Calendar as CalendarIcon, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'
import { 
  hapticFeedback, 
  generateId, 
  toLocalDateString, 
  generateIcsFile, 
  downloadIcsFile,
  toast
} from '@/lib/helpers'
import { FullscreenModal, ModalFooter } from '@/components/fullscreen-modal'
import { calculateDutyDuration, checkDutyConflicts } from '@/lib/duty-utils'
import { Switch } from '@/components/ui/switch'
import { InlineDatePicker } from '@/components/inline-date-picker'
import { GreekDatePicker } from '@/components/greek-date-picker'
import type { DutyEntry, DutyType, LeaveEntry } from '@/lib/types'
import { DUTY_TYPE_LABELS } from '@/lib/types'

interface DutyFormProps {
  initialDate: string
  initialType?: DutyType
  dutyLabels: Record<string, string>
  onAdd: (duty: DutyEntry) => void
  onCancel: () => void
  onManageTypes?: () => void
  mode?: 'add' | 'edit'
  editingDuty?: DutyEntry
  existingDuties?: DutyEntry[]
  existingLeaves?: LeaveEntry[]
  compact?: boolean
}

export function DutyForm({
  initialDate,
  initialType = 'guard',
  dutyLabels,
  onAdd,
  onCancel,
  onManageTypes,
  mode = 'add',
  editingDuty,
  existingDuties = [],
  existingLeaves = [],
  compact = false
}: DutyFormProps) {
  const [type, setType] = useState<DutyType>((editingDuty?.type as DutyType) || initialType)
  const [date, setDate] = useState(editingDuty?.date || initialDate)
  const [endDate, setEndDate] = useState(editingDuty?.endDate || editingDuty?.date || initialDate)
  const [startTime, setStartTime] = useState(editingDuty?.startTime || '08:00')
  const [endTime, setEndTime] = useState(editingDuty?.endTime || '08:00')
  const [notes, setNotes] = useState(editingDuty?.notes || '')
  const [password, setPassword] = useState(editingDuty?.password || '')
  const [countersign, setCountersign] = useState(editingDuty?.countersign || '')
  const [addToCalendar, setAddToCalendar] = useState(true)

  // Sync endDate with date if not multi-day and just starting
  useEffect(() => {
    if (mode === 'add' && !editingDuty?.endDate) {
      setEndDate(date)
    }
  }, [date, mode, editingDuty])

  const duration = useMemo(() => {
    return calculateDutyDuration({ date, endDate, startTime, endTime })
  }, [date, endDate, startTime, endTime])

  const conflicts = useMemo(() => {
    return checkDutyConflicts(
      { id: editingDuty?.id, date, endDate, startTime, endTime },
      existingDuties,
      existingLeaves
    )
  }, [date, endDate, startTime, endTime, existingDuties, existingLeaves, editingDuty])

  const handleSubmit = () => {
    if (!date || !startTime || !endTime) {
      toast('Παρακαλώ συμπληρώστε όλα τα απαραίτητα πεδία', 'error')
      return
    }
    
    hapticFeedback('heavy')

    if (addToCalendar) {
      const ics = generateIcsFile({
        title: dutyLabels[type] || type,
        description: notes || `Υπηρεσία: ${dutyLabels[type] || type}`,
        startDate: date,
        startTime: startTime,
        endDate: endDate || date,
        endTime: endTime,
        reminderMinutes: 30,
      })
      downloadIcsFile(ics, `apolele-duty-${date}.ics`)
    }

    onAdd({
      id: editingDuty?.id || generateId(),
      type,
      date,
      endDate: endDate !== date ? endDate : undefined,
      startTime,
      endTime,
      durationMinutes: duration,
      notes,
      password: type === 'guard' ? password : '',
      countersign: type === 'guard' ? countersign : '',
    })
  }

  const formatDuration = (mins: number) => {
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return `${h}ώ ${m}λ`
  }

  return (
    <div className={cn("flex flex-col gap-6", compact ? "gap-4" : "p-2")}>
      {/* Type Selection */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Τύπος υπηρεσίας
          </label>
          {onManageTypes && (
            <button
              onClick={onManageTypes}
              className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-[#34d399] transition-colors"
            >
              <Settings size={14} />
            </button>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(dutyLabels).map(([t, label]) => (
            <button
              key={t}
              onClick={() => setType(t as DutyType)}
              className={cn(
                'py-2.5 rounded-lg text-[8px] font-bold uppercase tracking-wider transition-all border shrink-0 min-h-[44px] flex items-center justify-center text-center px-1 leading-tight',
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

      {/* Date & Time Picker */}
      <div className="space-y-4">
        {compact ? (
          <GreekDatePicker value={date} onChange={setDate} label="Ημερομηνία" compact />
        ) : (
          <InlineDatePicker value={date} onChange={setDate} label="Ημερομηνία Έναρξης" />
        )}
        
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
              <Clock size={10} className="text-emerald-500" />
              Έναρξη
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-3 rounded-lg bg-zinc-900 text-white text-xs border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
              <CalendarIcon size={10} className="text-emerald-500" />
              Λήξη (Ώρα)
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-3 py-3 rounded-lg bg-zinc-900 text-white text-xs border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all"
            />
          </div>
        </div>

        {/* Duration Info */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Διάρκεια</span>
          </div>
          <span className="text-sm font-bold text-white">{formatDuration(duration)}</span>
        </div>
      </div>

      {/* Conflicts Warning */}
      {conflicts.length > 0 && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
          <AlertTriangle className="text-red-500 shrink-0" size={18} />
          <div className="flex-1">
            <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider mb-1">Προσοχή: Επικάλυψη</p>
            <p className="text-[9px] text-zinc-400 leading-relaxed uppercase">
              Υπάρχει επικάλυψη με {conflicts.length} {conflicts.length === 1 ? 'γειτονικό γεγονός' : 'γειτονικά γεγονότα'}.
            </p>
          </div>
        </div>
      )}

      {/* Guard-specific fields */}
      {type === 'guard' && (
        <div className="space-y-3 p-4 rounded-lg bg-indigo-500/5 border border-indigo-500/10">
           <div className="flex items-center gap-2 mb-1">
            <Shield size={14} className="text-indigo-400" />
            <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Στοιχεία Σκοπιάς</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-indigo-400/70 mb-1.5">Σύνθημα</label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value.toUpperCase())}
                placeholder="π.χ. ΑΕΤΟΣ"
                className="w-full px-3 py-2.5 rounded-lg bg-zinc-900 text-white text-xs border border-zinc-800 focus:border-indigo-500 outline-none uppercase tracking-widest placeholder:text-zinc-700"
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-indigo-400/70 mb-1.5">Παρασύνθημα</label>
              <input
                type="text"
                value={countersign}
                onChange={(e) => setCountersign(e.target.value.toUpperCase())}
                placeholder="π.χ. ΒΟΥΝΟ"
                className="w-full px-3 py-2.5 rounded-lg bg-zinc-900 text-[#34d399] text-xs border border-zinc-800 focus:border-indigo-500 outline-none uppercase tracking-widest placeholder:text-zinc-700"
              />
            </div>
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="space-y-2">
        <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400 px-1">Πρόσθετες Σημειώσεις</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Π.χ. Τοποθεσία, Συνοδός κλπ..."
          className="w-full px-4 py-3 rounded-lg bg-zinc-900 text-white text-sm border border-zinc-800 focus:border-emerald-500 outline-none resize-none h-24 transition-all placeholder:text-zinc-600"
        />
      </div>

      {/* Calendar Toggle */}
      <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-900 border border-zinc-800/50">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-white tracking-widest uppercase">Προσθήκη στο Ημερολόγιο</span>
          <span className="text-[8px] text-zinc-500 mt-0.5">Θα προστεθεί στο ημερολόγιο του κινητού σου για να λάβεις ειδοποίηση</span>
        </div>
        <Switch checked={addToCalendar} onCheckedChange={setAddToCalendar} />
      </div>

      <ModalFooter>
        <div className="flex gap-3 px-6 py-5">
          <button
            onClick={onCancel}
            className="flex-1 py-4 rounded-lg bg-zinc-900 text-zinc-400 font-bold text-[10px] uppercase tracking-widest border border-zinc-800 hover:border-zinc-700 transition-all active:scale-95"
          >
            Ακύρωση
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-4 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-900/30 active:scale-95 transition-all"
          >
            {mode === 'edit' ? 'Ενημέρωση' : 'Προσθήκη'}
          </button>
        </div>
      </ModalFooter>
    </div>
  )
}
