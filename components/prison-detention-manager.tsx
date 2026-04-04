'use client'

import { useState } from 'react'
import { Plus, X, Lock, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { FullscreenModal, ModalFooter } from '@/components/fullscreen-modal'
import { GreekDatePicker } from '@/components/greek-date-picker'
import { Counter } from '@/components/counter'
import {
  hapticFeedback,
  formatGreekDate,
  generateId,
  toLocalDateString,
  daysBetween,
} from '@/lib/helpers'
import type { PrisonEntry, DetentionEntry } from '@/lib/types'
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog'

export function PrisonDetentionManager() {
  const [prisons, setPrisons] = useLocalStorage<PrisonEntry[]>('fantaros-prisons', [])
  const [detentions, setDetentions] = useLocalStorage<DetentionEntry[]>('fantaros-detentions', [])
  const [showPrisonModal, setShowPrisonModal] = useState(false)
  const [showDetentionModal, setShowDetentionModal] = useState(false)
  const [deletePending, setDeletePending] = useState<{ id: string; type: 'prison' | 'detention' } | null>(null)

  const totalPrisonDays = prisons.reduce((sum, p) => sum + p.days, 0)
  const totalDetentionDays = detentions.reduce((sum, d) => {
    const days = daysBetween(d.startDate, d.endDate) + 1
    return sum + Math.max(0, days)
  }, 0)

  const handleAddPrison = (prison: PrisonEntry) => {
    hapticFeedback('heavy')
    setPrisons([...prisons, prison])
    setShowPrisonModal(false)
  }

  const handleDeletePrison = (id: string) => {
    hapticFeedback('medium')
    setDeletePending({ id, type: 'prison' })
  }

  const handleAddDetention = (detention: DetentionEntry) => {
    hapticFeedback('heavy')
    setDetentions([...detentions, detention])
    setShowDetentionModal(false)
  }

  const handleDeleteDetention = (id: string) => {
    hapticFeedback('medium')
    setDeletePending({ id, type: 'detention' })
  }

  const executeDelete = () => {
    if (!deletePending) return
    if (deletePending.type === 'prison') {
      setPrisons(prisons.filter((p) => p.id !== deletePending.id))
    } else {
      setDetentions(detentions.filter((d) => d.id !== deletePending.id))
    }
    setDeletePending(null)
  }

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-[10px] font-bold tracking-[0.2em] text-zinc-500 uppercase px-1">
        Επεκτάσεις Θητείας
      </h2>

      {/* Prison Card */}
      <div className="bg-gradient-to-br from-zinc-800 to-zinc-900/90 border border-zinc-700/40 rounded-[1.25rem] p-4 flex flex-col gap-3 shadow-lg shadow-black/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center shrink-0">
              <Lock size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-bold tracking-[0.15em] text-zinc-400 uppercase mb-0.5">Φυλακές</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[22px] font-bold text-white leading-none">
                  <Counter value={totalPrisonDays} duration={1} />
                </span>
                <span className="text-[11px] font-semibold text-zinc-500">ημ.</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              hapticFeedback('light')
              setShowPrisonModal(true)
            }}
            className="w-10 h-10 rounded-[12px] bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[#34d399] hover:bg-zinc-700 transition-colors active:scale-90 shrink-0 shadow-sm"
            aria-label="Προσθήκη φυλακής"
          >
            <Plus size={18} />
          </button>
        </div>

        {/* Prison Entries List */}
        {prisons.length > 0 && (
          <div className="flex flex-col gap-2 pt-3 border-t border-zinc-700/40">
            {prisons.map((prison) => (
              <div
                key={prison.id}
                className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/30 border border-zinc-700/20 hover:border-[#34d399]/20 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold text-white truncate">{prison.reason || 'Χωρίς αιτιολογία'}</p>
                  <p className="text-[9px] text-zinc-500 mt-0.5">{prison.days} ημ. • {formatGreekDate(prison.addedDate)}</p>
                </div>
                <button
                  onClick={() => handleDeletePrison(prison.id)}
                  className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors flex-shrink-0 ml-2"
                  aria-label="Διαγραφή"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detention Card */}
      <div className="bg-gradient-to-br from-zinc-800 to-zinc-900/90 border border-zinc-700/40 rounded-[1.25rem] p-4 flex flex-col gap-3 shadow-lg shadow-black/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 flex items-center justify-center shrink-0">
              <Calendar size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-bold tracking-[0.15em] text-zinc-400 uppercase mb-0.5">Κράτηση</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[22px] font-bold text-white leading-none">
                  <Counter value={totalDetentionDays} duration={1} />
                </span>
                <span className="text-[11px] font-semibold text-zinc-500">ημ.</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              hapticFeedback('light')
              setShowDetentionModal(true)
            }}
            className="w-10 h-10 rounded-[12px] bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[#34d399] hover:bg-zinc-700 transition-colors active:scale-90 shrink-0 shadow-sm"
            aria-label="Προσθήκη κράτησης"
          >
            <Plus size={18} />
          </button>
        </div>

        {/* Detention Entries List */}
        {detentions.length > 0 && (
          <div className="flex flex-col gap-2 pt-3 border-t border-zinc-700/40">
            {detentions.map((detention) => {
              const days = daysBetween(detention.startDate, detention.endDate) + 1
              return (
                <div
                  key={detention.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/30 border border-zinc-700/20 hover:border-[#34d399]/20 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold text-white truncate">{detention.reason || 'Χωρίς αιτιολογία'}</p>
                    <p className="text-[9px] text-zinc-500 mt-0.5">
                      {formatGreekDate(detention.startDate)} - {formatGreekDate(detention.endDate)} • {days} ημ.
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteDetention(detention.id)}
                    className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors flex-shrink-0 ml-2"
                    aria-label="Διαγραφή"
                  >
                    <X size={16} />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Prison Modal */}
      <FullscreenModal
        isOpen={showPrisonModal}
        onClose={() => setShowPrisonModal(false)}
        title="Προσθήκη Φυλακής"
      >
        <AddPrisonForm
          onAdd={handleAddPrison}
          onCancel={() => setShowPrisonModal(false)}
        />
      </FullscreenModal>

      {/* Detention Modal */}
      <FullscreenModal
        isOpen={showDetentionModal}
        onClose={() => setShowDetentionModal(false)}
        title="Προσθήκη Κράτησης"
      >
        <AddDetentionForm
          onAdd={handleAddDetention}
          onCancel={() => setShowDetentionModal(false)}
        />
      </FullscreenModal>

      {deletePending && (
        <DeleteConfirmDialog
          onConfirm={executeDelete}
          onCancel={() => setDeletePending(null)}
        />
      )}
    </div>
  )
}

/* ---------- Add Prison Form ---------- */
function AddPrisonForm({
  onAdd,
  onCancel,
}: {
  onAdd: (prison: PrisonEntry) => void
  onCancel: () => void
}) {
  const [reason, setReason] = useState('')
  const [days, setDays] = useState('1')
  const today = toLocalDateString()

  const handleSubmit = () => {
    if (!days || parseInt(days) <= 0) return
    hapticFeedback('heavy')
    onAdd({
      id: generateId(),
      reason,
      days: parseInt(days),
      addedDate: today,
    })
    setReason('')
    setDays('1')
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      <div>
        <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
          Αιτιολογία (Προαιρετικό)
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Λόγος φυλάκισης..."
          className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700/50 text-white text-sm resize-none focus:outline-none focus:border-[#34d399]/50 transition-colors placeholder:text-zinc-600"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
          Αριθμός Ημερών
        </label>
        <input
          type="number"
          inputMode="numeric"
          min="1"
          value={days}
          onChange={(e) => setDays(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700/50 text-white text-sm focus:outline-none focus:border-[#34d399]/50 transition-colors placeholder:text-zinc-600 font-bold"
          placeholder="Αριθμός ημερών"
        />
        <p className="text-[9px] text-zinc-500 mt-2 font-medium">
          Θα προστεθούν <span className="font-bold text-[#34d399]">{days}</span> ημέρες στη θητεία σας
        </p>
      </div>

      <ModalFooter>
        <div className="flex gap-3 px-6 py-5">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl bg-zinc-900 text-zinc-400 font-bold text-[10px] uppercase tracking-wider border border-zinc-800 hover:border-zinc-700 transition-all"
          >
            Ακύρωση
          </button>
          <button
            onClick={handleSubmit}
            disabled={!days || parseInt(days) <= 0}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-[10px] uppercase tracking-wider shadow-lg shadow-emerald-900/30 active:scale-95 transition-all disabled:opacity-50"
          >
            Προσθήκη
          </button>
        </div>
      </ModalFooter>
    </div>
  )
}

/* ---------- Add Detention Form ---------- */
function AddDetentionForm({
  onAdd,
  onCancel,
}: {
  onAdd: (detention: DetentionEntry) => void
  onCancel: () => void
}) {
  const [reason, setReason] = useState('')
  const [startDate, setStartDate] = useState(toLocalDateString())
  const [endDate, setEndDate] = useState(toLocalDateString())
  const today = toLocalDateString()

  const handleSubmit = () => {
    if (!startDate || !endDate || startDate > endDate) return
    hapticFeedback('heavy')
    onAdd({
      id: generateId(),
      reason,
      startDate,
      endDate,
      createdAt: today,
    })
    setReason('')
    setStartDate(today)
    setEndDate(today)
  }

  const days = daysBetween(startDate, endDate) + 1

  return (
    <div className="flex flex-col gap-4 h-full">
      <div>
        <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
          Αιτιολογία (Προαιρετικό)
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Λόγος κράτησης..."
          className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700/50 text-white text-sm resize-none focus:outline-none focus:border-[#34d399]/50 transition-colors placeholder:text-zinc-600"
          rows={2}
        />
      </div>

      <div>
        <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
          Ημερομηνία Έναρξης
        </label>
        <GreekDatePicker value={startDate} onChange={setStartDate} />
      </div>

      <div>
        <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
          Ημερομηνία Λήξης
        </label>
        <GreekDatePicker value={endDate} onChange={setEndDate} />
      </div>

      {startDate && endDate && startDate <= endDate && (
        <div className="p-4 rounded-xl bg-[#10b981]/10 border border-[#10b981]/20 shadow-lg shadow-black/10">
          <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Διάρκεια</p>
          <p className="text-[18px] font-bold text-[#34d399]">{days} ημέρες</p>
        </div>
      )}

      <ModalFooter>
        <div className="flex gap-3 px-6 py-5">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl bg-zinc-900 text-zinc-400 font-bold text-[10px] uppercase tracking-wider border border-zinc-800 hover:border-zinc-700 transition-all font-bold"
          >
            Ακύρωση
          </button>
          <button
            onClick={handleSubmit}
            disabled={!startDate || !endDate || startDate > endDate}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-[10px] uppercase tracking-wider shadow-lg shadow-emerald-900/30 active:scale-95 transition-all disabled:opacity-50 font-bold"
          >
            Προσθήκη
          </button>
        </div>
      </ModalFooter>
    </div>
  )
}
