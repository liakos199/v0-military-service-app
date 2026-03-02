'use client'

import { useState } from 'react'
import { Settings, Plus, Trash2, Clock, CalendarDays, Percent } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { GreekDatePicker } from '@/components/greek-date-picker'
import { hapticFeedback, formatGreekDate, generateId, daysBetween, toLocalDateString } from '@/lib/helpers'
import type { ServiceConfig, LeaveEntry, LeaveType } from '@/lib/types'
import { LEAVE_TYPE_LABELS } from '@/lib/types'

export function ServiceTab() {
  const [config, setConfig] = useLocalStorage<ServiceConfig>('fantaros-config', {
    enlistmentDate: '',
    totalDays: 365,
  })
  const [leaves, setLeaves] = useLocalStorage<LeaveEntry[]>('fantaros-leaves', [])
  const [showConfig, setShowConfig] = useState(false)
  const [showAddLeave, setShowAddLeave] = useState(false)

  const today = toLocalDateString()
  const daysServed = config.enlistmentDate ? Math.max(0, daysBetween(config.enlistmentDate, today)) : 0
  const totalLeaveDays = leaves.reduce((sum, l) => sum + l.days, 0)
  const effectiveDaysRemaining = Math.max(0, config.totalDays - daysServed)
  const percentage = config.enlistmentDate
    ? Math.min(100, Math.max(0, (daysServed / config.totalDays) * 100))
    : 0

  const dischargeDate = config.enlistmentDate
    ? (() => {
        const d = new Date(config.enlistmentDate)
        d.setDate(d.getDate() + config.totalDays)
        return toLocalDateString(d)
      })()
    : ''

  return (
    <div className="flex flex-col gap-4 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Λελέμετρο</h1>
          <p className="text-xs text-muted-foreground">Αντίστροφη μέτρηση θητείας</p>
        </div>
        <button
          onClick={() => {
            hapticFeedback('light')
            setShowConfig(!showConfig)
          }}
          className="p-3 rounded-xl glass-card min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Ρυθμίσεις θητείας"
        >
          <Settings className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      {/* Config Panel */}
      {showConfig && (
        <div className="glass-card rounded-xl p-4 flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-foreground">Ρυθμίσεις Θητείας</h2>
          <GreekDatePicker
            value={config.enlistmentDate}
            onChange={(d) => setConfig({ ...config, enlistmentDate: d })}
            label="Ημερομηνία κατάταξης"
          />
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">Συνολική διάρκεια (ημέρες)</label>
            <input
              type="number"
              inputMode="numeric"
              value={config.totalDays}
              onChange={(e) => setConfig({ ...config, totalDays: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-3 rounded-lg bg-secondary text-secondary-foreground text-sm min-h-[48px] border border-border"
            />
          </div>
          <button
            onClick={() => {
              hapticFeedback('medium')
              setShowConfig(false)
            }}
            className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm min-h-[48px]"
          >
            Αποθήκευση
          </button>
        </div>
      )}

      {/* Main Progress Ring */}
      <div className="glass-card rounded-2xl p-6 flex flex-col items-center gap-4">
        <div className="relative w-48 h-48">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
            <circle
              cx="80" cy="80" r="70"
              fill="none"
              stroke="oklch(0.22 0.01 155)"
              strokeWidth="10"
            />
            <circle
              cx="80" cy="80" r="70"
              fill="none"
              stroke="oklch(0.65 0.14 145)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${(percentage / 100) * 2 * Math.PI * 70} ${2 * Math.PI * 70}`}
              className="transition-all duration-1000 ease-out"
              style={{
                filter: 'drop-shadow(0 0 6px oklch(0.65 0.14 145 / 0.5))',
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-foreground">{percentage.toFixed(1)}%</span>
            <span className="text-xs text-muted-foreground mt-1">ολοκληρώθηκε</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 w-full">
          <StatCard icon={Clock} label="Υπηρέτησες" value={`${daysServed}`} unit="ημέρες" />
          <StatCard icon={CalendarDays} label="Απομένουν" value={`${effectiveDaysRemaining}`} unit="ημέρες" />
          <StatCard icon={Percent} label="Άδειες" value={`${totalLeaveDays}`} unit="ημέρες" />
        </div>

        {dischargeDate && (
          <div className="w-full text-center py-2 px-3 rounded-lg bg-secondary">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Ημερομηνία απόλυσης</p>
            <p className="text-sm font-semibold text-primary mt-0.5">{formatGreekDate(dischargeDate)}</p>
          </div>
        )}
      </div>

      {/* Leave Section */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">Άδειες</h2>
        <button
          onClick={() => {
            hapticFeedback('light')
            setShowAddLeave(!showAddLeave)
          }}
          className="p-2.5 rounded-xl glass-card min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Προσθήκη άδειας"
        >
          <Plus className="h-5 w-5 text-primary" />
        </button>
      </div>

      {showAddLeave && (
        <AddLeaveForm
          onAdd={(leave) => {
            setLeaves([leave, ...leaves])
            setShowAddLeave(false)
          }}
          onCancel={() => setShowAddLeave(false)}
        />
      )}

      {leaves.length === 0 ? (
        <div className="glass-card rounded-xl p-6 text-center">
          <p className="text-sm text-muted-foreground">Δεν έχεις καταχωρήσει άδειες</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {leaves.map((leave) => (
            <div key={leave.id} className="glass-card rounded-xl p-3 flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded-md bg-primary/20 text-primary font-medium">
                    {LEAVE_TYPE_LABELS[leave.type]}
                  </span>
                  <span className="text-xs font-semibold text-foreground">{leave.days} ημ.</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1 truncate">
                  {formatGreekDate(leave.startDate)} - {formatGreekDate(leave.endDate)}
                </p>
                {leave.notes && (
                  <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{leave.notes}</p>
                )}
              </div>
              <button
                onClick={() => {
                  hapticFeedback('medium')
                  setLeaves(leaves.filter((l) => l.id !== leave.id))
                }}
                className="p-2 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center text-destructive"
                aria-label="Διαγραφή άδειας"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, unit }: {
  icon: typeof Clock
  label: string
  value: string
  unit: string
}) {
  return (
    <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-secondary/50">
      <Icon className="h-3.5 w-3.5 text-primary" />
      <span className="text-lg font-bold text-foreground leading-none">{value}</span>
      <span className="text-[9px] text-muted-foreground leading-none">{unit}</span>
    </div>
  )
}

function AddLeaveForm({ onAdd, onCancel }: {
  onAdd: (leave: LeaveEntry) => void
  onCancel: () => void
}) {
  const [type, setType] = useState<LeaveType>('regular')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [notes, setNotes] = useState('')

  const days = startDate && endDate ? Math.max(0, daysBetween(startDate, endDate) + 1) : 0

  const handleSubmit = () => {
    if (!startDate || !endDate) return
    hapticFeedback('heavy')
    onAdd({
      id: generateId(),
      type,
      startDate,
      endDate,
      days,
      notes,
    })
  }

  return (
    <div className="glass-card rounded-xl p-4 flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-foreground">Νέα Άδεια</h3>

      <div>
        <label className="block text-xs text-muted-foreground mb-1.5">Τύπος</label>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(LEAVE_TYPE_LABELS) as LeaveType[]).map((t) => (
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
              {LEAVE_TYPE_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      <GreekDatePicker value={startDate} onChange={setStartDate} label="Από" />
      <GreekDatePicker value={endDate} onChange={setEndDate} label="Έως" />

      {days > 0 && (
        <div className="text-center py-1.5 rounded-lg bg-primary/10">
          <span className="text-sm font-semibold text-primary">{days} ημέρες</span>
        </div>
      )}

      <div>
        <label className="block text-xs text-muted-foreground mb-1.5">Σημειώσεις</label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Προαιρετικό..."
          className="w-full px-3 py-3 rounded-lg bg-secondary text-secondary-foreground text-sm min-h-[48px] border border-border placeholder:text-muted-foreground"
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="flex-1 py-3 rounded-lg bg-secondary text-secondary-foreground font-medium text-sm min-h-[48px]"
        >
          Ακύρωση
        </button>
        <button
          onClick={handleSubmit}
          disabled={!startDate || !endDate}
          className="flex-1 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm min-h-[48px] disabled:opacity-40"
        >
          Προσθήκη
        </button>
      </div>
    </div>
  )
}
