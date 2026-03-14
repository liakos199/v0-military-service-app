'use client'

import { useState, useEffect } from 'react'
import {
  Settings,
  Calendar as CalendarIcon,
  Plus,
  Lock,
  CalendarX,
  Trash2,
  Edit3,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { InlineDatePicker } from '@/components/inline-date-picker'
import { FullscreenModal } from '@/components/fullscreen-modal'
import {
  hapticFeedback,
  formatGreekDate,
  daysBetween,
  toLocalDateString,
  generateId,
} from '@/lib/helpers'
import type { ServiceConfig, LeaveEntry, PrisonEntry, DetentionEntry } from '@/lib/types'
import { SERVICE_DURATION_PRESETS } from '@/lib/types'

export function ServiceTab() {
  const [config, setConfig] = useLocalStorage<ServiceConfig>('fantaros-config', {
    enlistmentDate: '',
    totalDays: 365,
  })
  const [leaves] = useLocalStorage<LeaveEntry[]>('fantaros-leaves', [])
  const [prisons, setPrisons] = useLocalStorage<PrisonEntry[]>('fantaros-prisons', [])
  const [detentions, setDetentions] = useLocalStorage<DetentionEntry[]>('fantaros-detentions', [])
  const [showConfig, setShowConfig] = useState(false)
  const [showPrison, setShowPrison] = useState(false)
  const [showDetention, setShowDetention] = useState(false)
  const [ringOffset, setRingOffset] = useState(276.46)

  const today = toLocalDateString()
  const daysServed = config.enlistmentDate
    ? Math.max(0, daysBetween(config.enlistmentDate, today))
    : 0
  const totalLeaveDays = leaves.reduce((sum, l) => sum + l.days, 0)
  const totalPrisonDays = prisons.reduce((sum, p) => sum + p.days, 0)
  const totalDetentionDays = detentions.reduce((sum, d) => {
    const days = daysBetween(d.startDate, d.endDate) + 1
    return sum + Math.max(0, days)
  }, 0)

  const effectiveTotalDays = config.totalDays + totalPrisonDays + totalDetentionDays
  const effectiveDaysRemaining = Math.max(0, effectiveTotalDays - daysServed)
  const percentage = config.enlistmentDate
    ? Math.min(100, Math.max(0, (daysServed / effectiveTotalDays) * 100))
    : 0

  const dischargeDate = config.enlistmentDate
    ? (() => {
        const d = new Date(config.enlistmentDate)
        d.setDate(d.getDate() + effectiveTotalDays)
        return toLocalDateString(d)
      })()
    : ''

  useEffect(() => {
    const fullCircle = 276.46
    const offset = fullCircle - (percentage / 100) * fullCircle
    const timer = setTimeout(() => {
      setRingOffset(offset)
    }, 150)
    return () => clearTimeout(timer)
  }, [percentage])

  return (
    <div className="flex-1 flex flex-col relative z-10 w-full h-full animate-fade-in bg-black">
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="emerald-ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop stopColor="#34d399" offset="0%" />
            <stop stopColor="#10b981" offset="100%" />
          </linearGradient>
        </defs>
      </svg>

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-48 bg-[#10b981]/5 blur-[70px] pointer-events-none rounded-full z-0"></div>

      <header className="px-6 pt-14 pb-2 relative flex justify-between items-start shrink-0">
        <div>
          <h1 className="text-[32px] font-bold tracking-tight text-white leading-none mb-1">Θητεία</h1>
          <p className="text-[13px] font-bold tracking-[0.1em] text-zinc-500 uppercase">Αντιστροφη μετρηση</p>
        </div>
        <button
          onClick={() => { hapticFeedback('light'); setShowConfig(true) }}
          className="w-10 h-10 mt-1 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700/50 flex items-center justify-center text-zinc-400 hover:text-[#34d399] hover:border-[#34d399]/30 transition-all active:scale-95 shadow-md"
        >
          <Settings size={20} />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto px-5 pb-32 pt-4 hide-scrollbar">
        {/* LELEmeter Card */}
        <div className="bg-gradient-to-br from-zinc-800 to-zinc-900/90 border border-zinc-700/40 rounded-[2rem] p-5 relative shadow-xl shadow-black/20 overflow-hidden mb-8">
          <div className="flex justify-between items-center mb-6">
            <span className="text-[11px] font-bold tracking-[0.2em] text-zinc-400 uppercase">Λελεμετρο</span>
            <div className="flex flex-col items-end gap-0.5 bg-zinc-950/50 border border-zinc-700/50 text-zinc-300 px-3 py-1.5 rounded-xl shadow-inner">
              <span className="text-[8px] font-bold tracking-[0.15em] text-[#34d399] uppercase">Απολύεσαι</span>
              <div className="flex items-center gap-1.5">
                <CalendarIcon size={12} className="text-zinc-400" />
                <span className="text-[10px] font-bold tracking-widest">{dischargeDate ? formatGreekDate(dischargeDate).toUpperCase() : '---'}</span>
              </div>
            </div>
          </div>

          {!config.enlistmentDate ? (
            <div className="flex flex-col items-center justify-center py-10 gap-4">
              <div className="w-20 h-20 rounded-full bg-zinc-800 border border-dashed border-zinc-700 flex items-center justify-center">
                <CalendarIcon size={32} className="text-zinc-600" />
              </div>
              <button
                onClick={() => setShowConfig(true)}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-[11px] uppercase tracking-widest active:scale-95 transition-transform"
              >
                ΟΡΙΣΜΟΣ ΗΜΕΡΟΜΗΝΙΑΣ
              </button>
            </div>
          ) : (
            <>
              <div className="flex justify-center my-6 relative">
                <div className="absolute inset-0 m-auto w-[160px] h-[160px] bg-[#10b981]/10 blur-[40px] rounded-full pointer-events-none"></div>
                <div className="relative w-[180px] h-[180px] flex items-center justify-center">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="44" fill="transparent" stroke="#1f1f22" strokeWidth="4.5" />
                    <circle
                      cx="50" cy="50" r="44"
                      fill="transparent"
                      stroke="url(#emerald-ring-grad)"
                      strokeWidth="5"
                      strokeDasharray="276.46"
                      strokeDashoffset={ringOffset}
                      strokeLinecap="round"
                      className="progress-ring__circle filter drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center mt-2">
                    <div className="flex items-baseline">
                      <span className="text-[42px] font-extrabold text-white tracking-tight leading-none">
                        {percentage.toFixed(1).replace('.', ',')}
                      </span>
                      <span className="text-xl text-zinc-500 font-bold ml-1">%</span>
                    </div>
                    <span className="text-[10px] font-bold tracking-[0.2em] text-[#34d399] uppercase mt-1">Προοδος</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="bg-zinc-800/50 border border-zinc-700/30 rounded-[1.25rem] py-3.5 px-2 flex flex-col items-center justify-center shadow-inner">
                  <span className="text-[9px] font-bold tracking-[0.1em] text-zinc-500 uppercase mb-1">Υπηρετησες</span>
                  <span className="text-[22px] font-extrabold text-white leading-none mb-1">{daysServed}</span>
                  <span className="text-[9px] font-semibold text-zinc-600 uppercase tracking-widest">Ημερες</span>
                </div>
                <div className="bg-gradient-to-b from-zinc-700/40 to-zinc-800/40 border border-[#10b981]/20 rounded-[1.25rem] py-3.5 px-2 flex flex-col items-center justify-center shadow-[inset_0_0_15px_rgba(52,211,153,0.05)]">
                  <span className="text-[9px] font-bold tracking-[0.1em] text-[#34d399] uppercase mb-1">Απομενουν</span>
                  <span className="text-[22px] font-extrabold text-white leading-none mb-1">{effectiveDaysRemaining}</span>
                  <span className="text-[9px] font-semibold text-zinc-500 uppercase tracking-widest">Ημερες</span>
                </div>
                <div className="bg-zinc-800/50 border border-zinc-700/30 rounded-[1.25rem] py-3.5 px-2 flex flex-col items-center justify-center shadow-inner">
                  <span className="text-[9px] font-bold tracking-[0.1em] text-zinc-500 uppercase mb-1">Αδειες</span>
                  <span className="text-[22px] font-extrabold text-white leading-none mb-1">{totalLeaveDays}</span>
                  <span className="text-[9px] font-semibold text-zinc-600 uppercase tracking-widest">Ημερες</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Extensions Section */}
        <div className="mb-8">
          <h2 className="text-[11px] font-bold tracking-[0.2em] text-zinc-500 uppercase px-1 mb-3">Επεκτασεις Θητειας</h2>
          <div className="space-y-3">
            {/* Prison Card — entire card is pressable */}
            <button
              onClick={() => { hapticFeedback('light'); setShowPrison(true) }}
              className="w-full bg-gradient-to-br from-zinc-800 to-zinc-900/90 border border-zinc-700/40 rounded-[1.25rem] p-4 flex items-center justify-between shadow-lg shadow-black/10 transition active:scale-[0.98] text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                  <Lock size={24} />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-[10px] font-bold tracking-[0.15em] text-zinc-400 uppercase mb-0.5">Φυλακες</h3>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[24px] font-bold text-white leading-none">{totalPrisonDays}</span>
                    <span className="text-[12px] font-semibold text-zinc-500">ημ.</span>
                  </div>
                </div>
              </div>
              <div className="w-10 h-10 rounded-[12px] bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[#34d399] shrink-0 shadow-sm">
                <Plus size={18} />
              </div>
            </button>

            {/* Detention Card — entire card is pressable */}
            <button
              onClick={() => { hapticFeedback('light'); setShowDetention(true) }}
              className="w-full bg-gradient-to-br from-zinc-800 to-zinc-900/90 border border-zinc-700/40 rounded-[1.25rem] p-4 flex items-center justify-between shadow-lg shadow-black/10 transition active:scale-[0.98] text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700/50 text-zinc-300 flex items-center justify-center shrink-0">
                  <CalendarX size={24} />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-[10px] font-bold tracking-[0.15em] text-zinc-400 uppercase mb-0.5">Κρατηση</h3>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[24px] font-bold text-white leading-none">{totalDetentionDays}</span>
                    <span className="text-[12px] font-semibold text-zinc-500">ημ.</span>
                  </div>
                </div>
              </div>
              <div className="w-10 h-10 rounded-[12px] bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[#34d399] shrink-0 shadow-sm">
                <Plus size={18} />
              </div>
            </button>
          </div>
        </div>

      </main>

      {/* LELEmeter Config Modal */}
      <FullscreenModal
        isOpen={showConfig}
        onClose={() => setShowConfig(false)}
        title="Ρυθμίσεις Θητείας"
      >
        <div className="flex flex-col gap-6 p-2">
          <InlineDatePicker
            value={config.enlistmentDate}
            onChange={(d) => setConfig({ ...config, enlistmentDate: d })}
            label="Ημερομηνία κατάταξης"
          />

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-3 px-1">
              Διάρκεια θητείας
            </label>
            {/* Single row, no wrap */}
            <div className="flex gap-2 mb-4">
              {SERVICE_DURATION_PRESETS.map((preset) => (
                <button
                  key={preset.days}
                  type="button"
                  onClick={() => {
                    hapticFeedback('light')
                    setConfig({ ...config, totalDays: preset.days })
                  }}
                  className={cn(
                    'flex-1 py-3 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all border whitespace-nowrap',
                    config.totalDays === preset.days
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-900/30'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="relative mt-2">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Χειροκινητα:</span>
              <input
                type="number"
                inputMode="numeric"
                value={config.totalDays}
                onChange={(e) =>
                  setConfig({ ...config, totalDays: parseInt(e.target.value) || 0 })
                }
                className="w-full pl-32 pr-4 py-4 rounded-xl bg-zinc-900 text-white text-sm border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
              />
            </div>
          </div>

          <button
            onClick={() => { hapticFeedback('medium'); setShowConfig(false) }}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-[13px] uppercase tracking-[0.2em] shadow-lg shadow-emerald-900/30 active:scale-95 transition-all mt-4"
          >
            Αποθήκευση
          </button>
        </div>
      </FullscreenModal>

      {/* Prison Modal */}
      <FullscreenModal
        isOpen={showPrison}
        onClose={() => setShowPrison(false)}
        title="Φυλακές"
      >
        <PrisonManager prisons={prisons} setPrisons={setPrisons} />
      </FullscreenModal>

      {/* Detention Modal */}
      <FullscreenModal
        isOpen={showDetention}
        onClose={() => setShowDetention(false)}
        title="Κρατήσεις"
      >
        <DetentionManager detentions={detentions} setDetentions={setDetentions} />
      </FullscreenModal>
    </div>
  )
}

/* ========== PRISON MANAGER ========== */
function DeleteConfirmDialog({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 z-[400] bg-black/75 flex items-end justify-center pb-8 px-4">
      <div className="bg-zinc-900 border border-zinc-700/50 rounded-[2rem] w-full max-w-sm shadow-2xl p-6 flex flex-col gap-5">
        <div className="text-center">
          <p className="text-white font-bold text-[16px] mb-1">Διαγραφή καταχώρησης;</p>
          <p className="text-zinc-400 text-[12px]">Αυτή η ενέργεια δεν μπορεί να αναιρεθεί.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3.5 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 font-bold text-[11px] uppercase tracking-widest hover:bg-zinc-700 transition-colors"
          >
            Ακύρωση
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 font-bold text-[11px] uppercase tracking-widest hover:bg-rose-500/30 transition-colors"
          >
            Διαγραφή
          </button>
        </div>
      </div>
    </div>
  )
}

function PrisonManager({
  prisons,
  setPrisons,
}: {
  prisons: PrisonEntry[]
  setPrisons: (v: PrisonEntry[]) => void
}) {
  const [showForm, setShowForm] = useState(false)
  const [editingEntry, setEditingEntry] = useState<PrisonEntry | null>(null)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  const handleSave = (days: number, reason: string) => {
    hapticFeedback('heavy')
    if (editingEntry) {
      setPrisons(prisons.map(p => p.id === editingEntry.id ? { ...editingEntry, days, reason } : p))
      setEditingEntry(null)
    } else {
      setPrisons([...prisons, { id: generateId(), days, reason, addedDate: toLocalDateString() }])
    }
    setShowForm(false)
  }

  const handleDelete = (id: string) => {
    hapticFeedback('medium')
    setPrisons(prisons.filter(p => p.id !== id))
  }

  const handleEdit = (entry: PrisonEntry) => {
    hapticFeedback('light')
    setEditingEntry(entry)
    setShowForm(true)
  }

  const handleCancel = () => {
    setEditingEntry(null)
    setShowForm(false)
  }

  const totalDays = prisons.reduce((sum, p) => sum + p.days, 0)

  if (showForm) {
    return (
      <PrisonForm
        initial={editingEntry}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Summary */}
      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-widest text-red-400 uppercase mb-1">Συνολο Ημερων</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[32px] font-extrabold text-white leading-none">{totalDays}</span>
            <span className="text-[13px] font-semibold text-zinc-400">ημέρες</span>
          </div>
        </div>
        <Lock size={32} className="text-red-400/40" />
      </div>

      <button
        onClick={() => { hapticFeedback('light'); setShowForm(true) }}
        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-[11px] uppercase tracking-wider shadow-lg shadow-emerald-900/30 active:scale-95 transition-all flex items-center justify-center gap-2"
      >
        <Plus size={16} />
        Προσθήκη Καταχώρησης
      </button>

      {prisons.length === 0 ? (
        <div className="py-10 flex flex-col items-center justify-center text-center opacity-40">
          <Lock size={40} className="text-zinc-500 mb-3" />
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Δεν υπάρχουν καταχωρήσεις</p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {prisons.map((p) => (
              <div key={p.id} className="bg-gradient-to-br from-zinc-800 to-zinc-900/90 border border-zinc-700/40 rounded-[1.25rem] p-4 flex items-center justify-between gap-3 shadow-lg shadow-black/10">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex flex-col items-center justify-center shrink-0">
                    <span className="text-[18px] font-extrabold text-red-400 leading-none">{p.days}</span>
                    <span className="text-[8px] font-bold text-red-400/60 uppercase">ημ.</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold text-white break-words">{p.reason || 'Χωρίς αιτία'}</p>
                    <p className="text-[10px] text-zinc-500">{formatGreekDate(p.addedDate)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleEdit(p)}
                    className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-[#34d399] transition-colors"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => setPendingDeleteId(p.id)}
                    className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-rose-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          {pendingDeleteId && (
            <DeleteConfirmDialog
              onConfirm={() => { handleDelete(pendingDeleteId); setPendingDeleteId(null) }}
              onCancel={() => setPendingDeleteId(null)}
            />
          )}
        </>
      )}
    </div>
  )
}

function PrisonForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: PrisonEntry | null
  onSave: (days: number, reason: string) => void
  onCancel: () => void
}) {
  const [days, setDays] = useState(initial?.days ?? 1)
  const [reason, setReason] = useState(initial?.reason ?? '')

  return (
    <div className="flex flex-col gap-5 p-2">
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Ημέρες Φυλακής</label>
        <input
          type="number"
          inputMode="numeric"
          min={1}
          value={days}
          onChange={(e) => setDays(Math.max(1, parseInt(e.target.value) || 1))}
          className="w-full px-4 py-4 rounded-xl bg-zinc-900 text-white text-2xl font-extrabold text-center border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
        />
        <p className="text-[10px] text-zinc-500 text-center mt-1.5">Αυτές οι μέρες προστίθενται στο σύνολο της θητείας</p>
      </div>

      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Αιτία (προαιρετικό)</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="π.χ. Αδικαιολόγητη απουσία..."
          className="w-full px-4 py-3 rounded-xl bg-zinc-900 text-white text-sm border border-zinc-800 focus:border-emerald-500 outline-none resize-none h-24"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={onCancel}
          className="flex-1 py-4 rounded-xl bg-zinc-900 text-zinc-400 font-bold text-[11px] uppercase tracking-widest border border-zinc-800 hover:bg-zinc-800 transition-colors"
        >
          Ακύρωση
        </button>
        <button
          onClick={() => onSave(days, reason)}
          className="flex-[2] py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-[11px] uppercase tracking-widest shadow-lg shadow-emerald-900/30 active:scale-95 transition-transform"
        >
          {initial ? 'Αποθήκευση' : 'Προσθήκη'}
        </button>
      </div>
    </div>
  )
}

/* ========== DETENTION MANAGER ========== */
function DetentionManager({
  detentions,
  setDetentions,
}: {
  detentions: DetentionEntry[]
  setDetentions: (v: DetentionEntry[]) => void
}) {
  const [showForm, setShowForm] = useState(false)
  const [editingEntry, setEditingEntry] = useState<DetentionEntry | null>(null)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  const handleSave = (startDate: string, endDate: string, reason: string) => {
    hapticFeedback('heavy')
    if (editingEntry) {
      setDetentions(detentions.map(d => d.id === editingEntry.id ? { ...editingEntry, startDate, endDate, reason } : d))
      setEditingEntry(null)
    } else {
      setDetentions([...detentions, { id: generateId(), startDate, endDate, reason, createdAt: toLocalDateString() }])
    }
    setShowForm(false)
  }

  const handleDelete = (id: string) => {
    hapticFeedback('medium')
    setDetentions(detentions.filter(d => d.id !== id))
  }

  const handleEdit = (entry: DetentionEntry) => {
    hapticFeedback('light')
    setEditingEntry(entry)
    setShowForm(true)
  }

  const handleCancel = () => {
    setEditingEntry(null)
    setShowForm(false)
  }

  const totalDays = detentions.reduce((sum, d) => sum + Math.max(0, daysBetween(d.startDate, d.endDate) + 1), 0)

  if (showForm) {
    return (
      <DetentionForm
        initial={editingEntry}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Summary */}
      <div className="bg-zinc-800/60 border border-zinc-700/40 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase mb-1">Συνολο Ημερων</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[32px] font-extrabold text-white leading-none">{totalDays}</span>
            <span className="text-[13px] font-semibold text-zinc-400">ημέρες</span>
          </div>
        </div>
        <CalendarX size={32} className="text-zinc-500/40" />
      </div>

      <button
        onClick={() => { hapticFeedback('light'); setShowForm(true) }}
        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-[11px] uppercase tracking-wider shadow-lg shadow-emerald-900/30 active:scale-95 transition-all flex items-center justify-center gap-2"
      >
        <Plus size={16} />
        Προσθήκη Κράτησης
      </button>

      {detentions.length === 0 ? (
        <div className="py-10 flex flex-col items-center justify-center text-center opacity-40">
          <CalendarX size={40} className="text-zinc-500 mb-3" />
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Δεν υπάρχουν κρατήσεις</p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {detentions.map((d) => {
              const days = Math.max(0, daysBetween(d.startDate, d.endDate) + 1)
              return (
                <div key={d.id} className="bg-gradient-to-br from-zinc-800 to-zinc-900/90 border border-zinc-700/40 rounded-[1.25rem] p-4 shadow-lg shadow-black/10">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold text-white mb-1 break-words">{d.reason || 'Χωρίς αιτία'}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] text-zinc-400 font-semibold">{formatGreekDate(d.startDate)}</span>
                        <span className="text-zinc-600">→</span>
                        <span className="text-[10px] text-zinc-400 font-semibold">{formatGreekDate(d.endDate)}</span>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">{days} ημ.</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-2 shrink-0">
                      <button
                        onClick={() => handleEdit(d)}
                        className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-[#34d399] transition-colors"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => setPendingDeleteId(d.id)}
                        className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-rose-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          {pendingDeleteId && (
            <DeleteConfirmDialog
              onConfirm={() => { handleDelete(pendingDeleteId); setPendingDeleteId(null) }}
              onCancel={() => setPendingDeleteId(null)}
            />
          )}
        </>
      )}
    </div>
  )
}

function DetentionForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: DetentionEntry | null
  onSave: (startDate: string, endDate: string, reason: string) => void
  onCancel: () => void
}) {
  const [startDate, setStartDate] = useState(initial?.startDate ?? toLocalDateString())
  const [endDate, setEndDate] = useState(initial?.endDate ?? toLocalDateString())
  const [reason, setReason] = useState(initial?.reason ?? '')

  const days = startDate && endDate ? Math.max(0, daysBetween(startDate, endDate) + 1) : 0

  return (
    <div className="flex flex-col gap-5 p-2">
      <InlineDatePicker
        value={startDate}
        onChange={setStartDate}
        label="Ημερομηνία έναρξης"
      />
      <InlineDatePicker
        value={endDate}
        onChange={setEndDate}
        label="Ημερομηνία λήξης"
        minDate={startDate}
      />

      {days > 0 && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 text-center">
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Διάρκεια: {days} ημέρ{days === 1 ? 'α' : 'ες'}</span>
        </div>
      )}

      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Αιτία</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="π.χ. Απουσία από σκοπιά..."
          className="w-full px-4 py-3 rounded-xl bg-zinc-900 text-white text-sm border border-zinc-800 focus:border-emerald-500 outline-none resize-none h-24"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={onCancel}
          className="flex-1 py-4 rounded-xl bg-zinc-900 text-zinc-400 font-bold text-[11px] uppercase tracking-widest border border-zinc-800 hover:bg-zinc-800 transition-colors"
        >
          Ακύρωση
        </button>
        <button
          onClick={() => onSave(startDate, endDate, reason)}
          disabled={!startDate || !endDate}
          className="flex-[2] py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-[11px] uppercase tracking-widest shadow-lg shadow-emerald-900/30 active:scale-95 transition-transform disabled:opacity-50"
        >
          {initial ? 'Αποθήκευση' : 'Προσθήκη'}
        </button>
      </div>
    </div>
  )
}
