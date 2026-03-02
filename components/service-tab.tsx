'use client'

import { useState } from 'react'
import { Settings, Plus, Trash2, Clock, CalendarDays, Percent, Eye, EyeOff, Edit3, Check, X, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { GreekDatePicker } from '@/components/greek-date-picker'
import { BottomSheet } from '@/components/bottom-sheet'
import { hapticFeedback, formatGreekDate, generateId, daysBetween, toLocalDateString } from '@/lib/helpers'
import type { ServiceConfig, LeaveEntry, LeaveType, DailyPassword } from '@/lib/types'
import { LEAVE_TYPE_LABELS, SERVICE_DURATION_PRESETS } from '@/lib/types'

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

  const circumference = 2 * Math.PI * 70

  return (
    <div className="flex flex-col gap-5 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground text-balance">Θητεία</h1>
          <p className="text-xs text-muted-foreground">Αντίστροφη μέτρηση & σύνθημα</p>
        </div>
        <button
          onClick={() => {
            hapticFeedback('light')
            setShowConfig(true)
          }}
          className="p-3 rounded-xl glass-card min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95 transition-transform"
          aria-label="Ρυθμίσεις θητείας"
        >
          <Settings className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      {/* Config Bottom Sheet */}
      <BottomSheet
        isOpen={showConfig}
        onClose={() => setShowConfig(false)}
        title="Ρυθμίσεις Θητείας"
        size="full"
      >
        <div className="flex flex-col gap-4">
          <GreekDatePicker
            value={config.enlistmentDate}
            onChange={(d) => setConfig({ ...config, enlistmentDate: d })}
            label="Ημερομηνία κατάταξης"
          />
          <div>
            <label className="block text-[11px] text-muted-foreground font-medium mb-2 uppercase tracking-wider">Διάρκεια θητείας</label>
            <div className="flex gap-2 mb-3">
              {SERVICE_DURATION_PRESETS.map((preset) => (
                <button
                  key={preset.days}
                  type="button"
                  onClick={() => {
                    hapticFeedback('light')
                    setConfig({ ...config, totalDays: preset.days })
                  }}
                  className={cn(
                    'flex-1 py-3 rounded-xl text-xs font-semibold min-h-[48px] transition-all border',
                    config.totalDays === preset.days
                      ? 'bg-primary text-primary-foreground border-primary scale-105'
                      : 'bg-secondary text-secondary-foreground border-border active:scale-95'
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <label className="block text-[10px] text-muted-foreground mb-1.5">{'Ή εισάγετε ημέρες χειροκίνητα'}</label>
            <input
              type="number"
              inputMode="numeric"
              value={config.totalDays}
              onChange={(e) => setConfig({ ...config, totalDays: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-3 rounded-xl bg-secondary text-secondary-foreground text-sm min-h-[48px] border border-border"
            />
          </div>
          <button
            onClick={() => {
              hapticFeedback('medium')
              setShowConfig(false)
            }}
            className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm min-h-[52px] active:scale-[0.97] transition-transform"
          >
            Αποθήκευση
          </button>
        </div>
      </BottomSheet>

      {/* Daily Password Section */}
      <PasswordSection />

      {/* Main Progress Ring */}
      <div className="glass-card rounded-2xl p-6 flex flex-col items-center gap-5">
        <div className="relative w-48 h-48">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
            <circle
              cx="80" cy="80" r="70"
              fill="none"
              stroke="oklch(0.21 0.003 250)"
              strokeWidth="8"
            />
            <circle
              cx="80" cy="80" r="70"
              fill="none"
              stroke="oklch(0.78 0.12 80)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${(percentage / 100) * circumference} ${circumference}`}
              className="transition-all duration-1000 ease-out"
              style={{
                filter: 'drop-shadow(0 0 10px oklch(0.78 0.12 80 / 0.4))',
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-black text-foreground tabular-nums">{percentage.toFixed(1)}%</span>
            <span className="text-[11px] text-muted-foreground mt-1 font-medium">ολοκληρώθηκε</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2.5 w-full">
          <StatCard icon={Clock} label="Υπηρέτησες" value={`${daysServed}`} unit="ημέρες" />
          <StatCard icon={CalendarDays} label="Απομένουν" value={`${effectiveDaysRemaining}`} unit="ημέρες" accent />
          <StatCard icon={Percent} label="Άδειες" value={`${totalLeaveDays}`} unit="ημέρες" />
        </div>

        {dischargeDate && (
          <div className="w-full text-center py-3 px-4 rounded-xl bg-primary/10 border border-primary/20">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Ημερομηνία απόλυσης</p>
            <p className="text-sm font-bold text-primary mt-1">{formatGreekDate(dischargeDate)}</p>
          </div>
        )}
      </div>

      {/* Leave Section */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-foreground">Άδειες</h2>
        <button
          onClick={() => {
            hapticFeedback('light')
            setShowAddLeave(true)
          }}
          className="p-2.5 rounded-xl glass-card min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95 transition-transform"
          aria-label="Προσθήκη άδειας"
        >
          <Plus className="h-5 w-5 text-primary" />
        </button>
      </div>

      {/* Add Leave Bottom Sheet */}
      <BottomSheet
        isOpen={showAddLeave}
        onClose={() => setShowAddLeave(false)}
        title="Νέα Άδεια"
        size="full"
      >
        <AddLeaveForm
          onAdd={(leave) => {
            setLeaves([leave, ...leaves])
            setShowAddLeave(false)
          }}
          onCancel={() => setShowAddLeave(false)}
        />
      </BottomSheet>

      {leaves.length === 0 ? (
        <div className="glass-card rounded-2xl p-8 text-center">
          <p className="text-sm text-muted-foreground/60">Δεν έχεις καταχωρήσει άδειες</p>
          <p className="text-xs text-muted-foreground/40 mt-1">Πάτησε + για να προσθέσεις</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {leaves.map((leave) => (
            <div key={leave.id} className="glass-card rounded-2xl p-3.5 flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-lg bg-primary/15 text-primary font-bold">
                    {LEAVE_TYPE_LABELS[leave.type]}
                  </span>
                  <span className="text-xs font-bold text-foreground">{leave.days} ημ.</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1.5">
                  {formatGreekDate(leave.startDate)} - {formatGreekDate(leave.endDate)}
                </p>
                {leave.notes && (
                  <p className="text-[10px] text-muted-foreground/70 mt-0.5 truncate">{leave.notes}</p>
                )}
              </div>
              <button
                onClick={() => {
                  hapticFeedback('medium')
                  setLeaves(leaves.filter((l) => l.id !== leave.id))
                }}
                className="p-2.5 rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center text-destructive/70 active:text-destructive active:bg-destructive/10 transition-colors"
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

/* ────────────────────────────────────────────
   Password / Σύνθημα Section (moved from notes)
   ──────────────────────────────────────────── */

function PasswordSection() {
  const today = toLocalDateString()
  const [passwords, setPasswords] = useLocalStorage<DailyPassword[]>('fantaros-passwords', [])
  const [showPassword, setShowPassword] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  const todayPassword = passwords.find((p) => p.date === today)
  const [password, setPassword] = useState(todayPassword?.password || '')
  const [countersign, setCountersign] = useState(todayPassword?.countersign || '')
  const [isEditing, setIsEditing] = useState(!todayPassword)

  const handleSave = () => {
    hapticFeedback('heavy')
    const updated = passwords.filter((p) => p.date !== today)
    updated.push({ date: today, password, countersign })
    setPasswords(updated)
    setIsEditing(false)
  }

  const previousPasswords = passwords
    .filter((p) => p.date !== today)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 7)

  return (
    <>
      <div className="glass-card rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center">
              <Lock className="h-4 w-4 text-amber-500" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">Σύνθημα Ημέρας</h2>
              <p className="text-[10px] text-muted-foreground">{formatGreekDate(today)}</p>
            </div>
          </div>
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => {
                hapticFeedback('light')
                setShowPassword(!showPassword)
              }}
              className="p-2.5 rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center active:bg-secondary transition-colors"
              aria-label={showPassword ? 'Απόκρυψη' : 'Εμφάνιση'}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
            {!isEditing && (
              <button
                onClick={() => {
                  hapticFeedback('light')
                  setIsEditing(true)
                }}
                className="p-2.5 rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center active:bg-secondary transition-colors"
                aria-label="Επεξεργασία"
              >
                <Edit3 className="h-4 w-4 text-primary" />
              </button>
            )}
          </div>
        </div>

        {isEditing ? (
          <div className="flex flex-col gap-3">
            <div>
              <label className="block text-[11px] text-muted-foreground font-medium mb-1.5 uppercase tracking-wider">Σύνθημα</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Εισαγωγή συνθήματος..."
                className="w-full px-3 py-3 rounded-xl bg-secondary text-secondary-foreground text-sm min-h-[48px] border border-border font-mono placeholder:text-muted-foreground placeholder:font-sans"
              />
            </div>
            <div>
              <label className="block text-[11px] text-muted-foreground font-medium mb-1.5 uppercase tracking-wider">Παρασύνθημα</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={countersign}
                onChange={(e) => setCountersign(e.target.value)}
                placeholder="Εισαγωγή παρασυνθήματος..."
                className="w-full px-3 py-3 rounded-xl bg-secondary text-secondary-foreground text-sm min-h-[48px] border border-border font-mono placeholder:text-muted-foreground placeholder:font-sans"
              />
            </div>
            <div className="flex gap-2.5 pt-1">
              <button
                onClick={() => {
                  setIsEditing(false)
                  setPassword(todayPassword?.password || '')
                  setCountersign(todayPassword?.countersign || '')
                }}
                className="flex-1 py-3 rounded-xl bg-secondary text-secondary-foreground font-semibold text-sm min-h-[48px] flex items-center justify-center gap-1.5 active:scale-[0.97] transition-transform"
              >
                <X className="h-4 w-4" />
                Ακύρωση
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm min-h-[48px] flex items-center justify-center gap-1.5 active:scale-[0.97] transition-transform"
              >
                <Check className="h-4 w-4" />
                Αποθήκευση
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2.5">
            <div className="flex-1 p-3 rounded-xl bg-secondary/80">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1">Σύνθημα</p>
              <p className={cn('text-sm font-mono font-bold', showPassword ? 'text-foreground' : 'text-foreground blur-sm select-none')}>
                {password || '---'}
              </p>
            </div>
            <div className="flex-1 p-3 rounded-xl bg-secondary/80">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1">Παρασύνθημα</p>
              <p className={cn('text-sm font-mono font-bold', showPassword ? 'text-foreground' : 'text-foreground blur-sm select-none')}>
                {countersign || '---'}
              </p>
            </div>
          </div>
        )}

        {/* Show history toggle */}
        {previousPasswords.length > 0 && !isEditing && (
          <button
            onClick={() => {
              hapticFeedback('light')
              setShowHistory(!showHistory)
            }}
            className="w-full mt-3 py-2 text-[11px] text-muted-foreground font-medium active:text-foreground transition-colors text-center"
          >
            {showHistory ? 'Απόκρυψη ιστορικού' : `Ιστορικό (${previousPasswords.length})`}
          </button>
        )}

        {showHistory && previousPasswords.length > 0 && (
          <div className="flex flex-col gap-1.5 mt-2 pt-3 border-t border-border/50">
            {previousPasswords.map((p) => (
              <div key={p.date} className="flex items-center justify-between py-2 px-2.5 rounded-lg bg-secondary/40">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-muted-foreground">{formatGreekDate(p.date)}</p>
                  <p className="text-xs font-mono font-semibold text-foreground mt-0.5 truncate">
                    {showPassword ? p.password : '****'} / {showPassword ? p.countersign : '****'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    hapticFeedback('medium')
                    setPasswords(passwords.filter((pw) => pw.date !== p.date))
                  }}
                  className="p-2 rounded-xl min-h-[40px] min-w-[40px] flex items-center justify-center text-destructive/60 active:text-destructive transition-colors"
                  aria-label="Διαγραφή"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

/* ────────────────────────────────────────────
   Stat Card
   ──────────────────────────────────────────── */

function StatCard({ icon: Icon, label, value, unit, accent }: {
  icon: typeof Clock
  label: string
  value: string
  unit: string
  accent?: boolean
}) {
  return (
    <div className={cn(
      'flex flex-col items-center gap-1.5 p-3 rounded-xl',
      accent ? 'bg-primary/10 border border-primary/20' : 'bg-secondary/60'
    )}>
      <Icon className={cn('h-3.5 w-3.5', accent ? 'text-primary' : 'text-muted-foreground')} />
      <span className={cn('text-lg font-black leading-none tabular-nums', accent ? 'text-primary' : 'text-foreground')}>{value}</span>
      <span className="text-[9px] text-muted-foreground leading-none font-medium">{unit}</span>
    </div>
  )
}

/* ────────────────────────────────────────────
   Add Leave Form
   ──────────────────────────────────────────── */

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
    <div className="flex flex-col gap-4">
      <div>
        <label className="block text-[11px] text-muted-foreground font-medium mb-2 uppercase tracking-wider">Τύπος</label>
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
                'px-3.5 py-2.5 rounded-xl text-xs font-semibold min-h-[44px] transition-all border',
                type === t
                  ? 'bg-primary text-primary-foreground border-primary scale-105'
                  : 'bg-secondary text-secondary-foreground border-border active:scale-95'
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
        <div className="text-center py-3 rounded-xl bg-primary/10 border border-primary/20">
          <span className="text-sm font-bold text-primary">{days} ημέρες</span>
        </div>
      )}

      <div>
        <label className="block text-[11px] text-muted-foreground font-medium mb-1.5 uppercase tracking-wider">Σημειώσεις</label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Προαιρετικό..."
          className="w-full px-3 py-3 rounded-xl bg-secondary text-secondary-foreground text-sm min-h-[48px] border border-border placeholder:text-muted-foreground"
        />
      </div>

      <div className="flex gap-2.5 pt-2">
        <button
          onClick={onCancel}
          className="flex-1 py-3.5 rounded-xl bg-secondary text-secondary-foreground font-semibold text-sm min-h-[52px] active:scale-[0.97] transition-transform"
        >
          Ακύρωση
        </button>
        <button
          onClick={handleSubmit}
          disabled={!startDate || !endDate}
          className="flex-1 py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm min-h-[52px] disabled:opacity-40 active:scale-[0.97] transition-transform"
        >
          Προσθήκη
        </button>
      </div>
    </div>
  )
}
