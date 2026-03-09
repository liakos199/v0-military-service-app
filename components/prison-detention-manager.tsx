'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, Lock, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { FullscreenModal } from '@/components/fullscreen-modal'
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

export function PrisonDetentionManager() {
  const [prisons, setPrisons] = useLocalStorage<PrisonEntry[]>('fantaros-prisons', [])
  const [detentions, setDetentions] = useLocalStorage<DetentionEntry[]>('fantaros-detentions', [])
  const [showPrisonModal, setShowPrisonModal] = useState(false)
  const [showDetentionModal, setShowDetentionModal] = useState(false)

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
    setPrisons(prisons.filter((p) => p.id !== id))
  }

  const handleAddDetention = (detention: DetentionEntry) => {
    hapticFeedback('heavy')
    setDetentions([...detentions, detention])
    setShowDetentionModal(false)
  }

  const handleDeleteDetention = (id: string) => {
    hapticFeedback('medium')
    setDetentions(detentions.filter((d) => d.id !== id))
  }

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
        Επεκτάσεις Θητείας
      </h2>

      {/* Prison Card */}
      <motion.div
        className="glass-card rounded-2xl p-4 border border-white/5 flex flex-col gap-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center flex-shrink-0">
              <Lock className="h-5 w-5 text-destructive" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Φυλακές</p>
              <h3 className="text-lg font-black text-foreground">
                <Counter value={totalPrisonDays} duration={1} /> ημ.
              </h3>
            </div>
          </div>
          <button
            onClick={() => {
              hapticFeedback('light')
              setShowPrisonModal(true)
            }}
            className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Προσθήκη φυλακής"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>

        {/* Prison Entries List */}
        {prisons.length > 0 && (
          <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
            {prisons.map((prison) => (
              <div
                key={prison.id}
                className="flex items-center justify-between p-2 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] font-bold text-foreground truncate">{prison.reason || 'Χωρίς αιτιολογία'}</p>
                  <p className="text-[8px] text-muted-foreground">{prison.days} ημ. • {formatGreekDate(prison.addedDate)}</p>
                </div>
                <button
                  onClick={() => handleDeletePrison(prison.id)}
                  className="p-1.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors flex-shrink-0 ml-2"
                  aria-label="Διαγραφή"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Detention Card */}
      <motion.div
        className="glass-card rounded-2xl p-4 border border-white/5 flex flex-col gap-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center flex-shrink-0">
              <Calendar className="h-5 w-5 text-warning" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Κράτηση</p>
              <h3 className="text-lg font-black text-foreground">
                <Counter value={totalDetentionDays} duration={1} /> ημ.
              </h3>
            </div>
          </div>
          <button
            onClick={() => {
              hapticFeedback('light')
              setShowDetentionModal(true)
            }}
            className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Προσθήκη κράτησης"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>

        {/* Detention Entries List */}
        {detentions.length > 0 && (
          <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
            {detentions.map((detention) => {
              const days = daysBetween(detention.startDate, detention.endDate) + 1
              return (
                <div
                  key={detention.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-bold text-foreground truncate">{detention.reason || 'Χωρίς αιτιολογία'}</p>
                    <p className="text-[8px] text-muted-foreground">
                      {formatGreekDate(detention.startDate)} - {formatGreekDate(detention.endDate)} • {days} ημ.
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteDetention(detention.id)}
                    className="p-1.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors flex-shrink-0 ml-2"
                    aria-label="Διαγραφή"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </motion.div>

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
    <div className="flex flex-col gap-3 h-full">
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
          Αιτιολογία (Προαιρετικό)
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Λόγος φυλάκισης..."
          className="w-full px-3 py-2 rounded-lg bg-secondary border border-white/5 text-foreground text-sm resize-none"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
          Αριθμός Ημερών
        </label>
        <input
          type="number"
          inputMode="numeric"
          min="1"
          value={days}
          onChange={(e) => setDays(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-secondary border border-white/5 text-foreground text-sm"
          placeholder="Αριθμός ημερών"
        />
        <p className="text-[9px] text-muted-foreground mt-2">
          Θα προστεθούν <span className="font-bold text-primary">{days}</span> ημέρες στη θητεία σας
        </p>
      </div>

      <div className="flex gap-2 mt-auto pt-4">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-3 rounded-xl bg-secondary text-foreground font-semibold text-sm min-h-[44px] hover:bg-secondary/80 transition-colors"
        >
          Ακύρωση
        </button>
        <button
          onClick={handleSubmit}
          className="flex-1 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm min-h-[44px] hover:bg-primary/90 transition-colors"
        >
          Προσθήκη
        </button>
      </div>
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
    <div className="flex flex-col gap-3 h-full">
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
          Αιτιολογία (Προαιρετικό)
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Λόγος κράτησης..."
          className="w-full px-3 py-2 rounded-lg bg-secondary border border-white/5 text-foreground text-sm resize-none"
          rows={2}
        />
      </div>

      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
          Ημερομηνία Έναρξης
        </label>
        <GreekDatePicker value={startDate} onChange={setStartDate} />
      </div>

      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
          Ημερομηνία Λήξης
        </label>
        <GreekDatePicker value={endDate} onChange={setEndDate} />
      </div>

      {startDate && endDate && startDate <= endDate && (
        <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20">
          <p className="text-[9px] text-muted-foreground">Διάρκεια</p>
          <p className="text-sm font-bold text-primary">{days} ημέρες</p>
        </div>
      )}

      <div className="flex gap-2 mt-auto pt-4">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-3 rounded-xl bg-secondary text-foreground font-semibold text-sm min-h-[44px] hover:bg-secondary/80 transition-colors"
        >
          Ακύρωση
        </button>
        <button
          onClick={handleSubmit}
          className="flex-1 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm min-h-[44px] hover:bg-primary/90 transition-colors"
        >
          Προσθήκη
        </button>
      </div>
    </div>
  )
}
