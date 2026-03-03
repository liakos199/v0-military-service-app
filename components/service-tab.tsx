'use client'

import { useState, useMemo } from 'react'
import {
  Settings,
  Clock,
  CalendarDays,
  Percent,
  Shield,
  Home,
  Footprints,
  UtensilsCrossed,
  HelpCircle,
  Palmtree,
  Eye,
  EyeOff,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { GreekDatePicker } from '@/components/greek-date-picker'
import { FullscreenModal } from '@/components/fullscreen-modal'
import {
  hapticFeedback,
  formatGreekDate,
  daysBetween,
  toLocalDateString,
} from '@/lib/helpers'
import type { ServiceConfig, DutyEntry, LeaveEntry, DutyType } from '@/lib/types'
import {
  DUTY_TYPE_LABELS,
  LEAVE_TYPE_LABELS,
  SERVICE_DURATION_PRESETS,
} from '@/lib/types'

const DUTY_ICONS: Record<DutyType, typeof Shield> = {
  guard: Shield,
  barracks: Home,
  officer: Shield,
  patrol: Footprints,
  kitchen: UtensilsCrossed,
  other: HelpCircle,
}

export function ServiceTab() {
  const [config, setConfig] = useLocalStorage<ServiceConfig>('fantaros-config', {
    enlistmentDate: '',
    totalDays: 365,
  })
  const [duties] = useLocalStorage<DutyEntry[]>('fantaros-duties', [])
  const [leaves] = useLocalStorage<LeaveEntry[]>('fantaros-leaves', [])
  const [showConfig, setShowConfig] = useState(false)

  const today = toLocalDateString()
  const daysServed = config.enlistmentDate
    ? Math.max(0, daysBetween(config.enlistmentDate, today))
    : 0
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

  const todayDuties = useMemo(
    () => duties.filter((d) => d.date === today).sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [duties, today]
  )

  const todayLeave = useMemo(
    () => leaves.find((l) => l.startDate <= today && l.endDate >= today),
    [leaves, today]
  )

  return (
    <div className="flex flex-col gap-5 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gradient">Θητεία</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Αντίστροφη μέτρηση & σήμερα</p>
        </div>
        <button
          onClick={() => {
            hapticFeedback('light')
            setShowConfig(true)
          }}
          className="p-3 rounded-2xl glass-card min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95 transition-transform"
          aria-label="Ρυθμίσεις θητείας"
        >
          <Settings className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      {/* Config Modal */}
      <FullscreenModal
        isOpen={showConfig}
        onClose={() => setShowConfig(false)}
        title="Ρυθμίσεις Θητείας"
      >
        <div className="flex flex-col gap-4">
          <GreekDatePicker
            value={config.enlistmentDate}
            onChange={(d) => setConfig({ ...config, enlistmentDate: d })}
            label="Ημερομηνία κατάταξης"
          />
          <div>
            <label className="block text-xs text-muted-foreground mb-2">
              Διάρκεια θητείας
            </label>
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
                    'flex-1 py-2.5 rounded-xl text-xs font-semibold min-h-[44px] transition-all active:scale-95',
                    config.totalDays === preset.days
                      ? 'btn-gradient shadow-[0_4px_16px_oklch(0.80_0.14_75/0.3)]'
                      : 'bg-secondary text-secondary-foreground border border-border'
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <label className="block text-[10px] text-muted-foreground mb-1.5">
              {'Ή εισάγετε ημέρες χειροκίνητα'}
            </label>
            <input
              type="number"
              inputMode="numeric"
              value={config.totalDays}
              onChange={(e) =>
                setConfig({ ...config, totalDays: parseInt(e.target.value) || 0 })
              }
              className="w-full px-4 py-3 rounded-xl bg-secondary text-secondary-foreground text-sm min-h-[48px] border border-border focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
            />
          </div>
          <button
            onClick={() => {
              hapticFeedback('medium')
              setShowConfig(false)
            }}
            className="w-full py-3.5 rounded-xl btn-gradient font-bold text-sm min-h-[48px] shadow-[0_4px_16px_oklch(0.80_0.14_75/0.3)] active:scale-[0.98] transition-transform"
          >
            Αποθήκευση
          </button>
        </div>
      </FullscreenModal>

      {/* Main Progress Ring - LELEmeter */}
      <div className="glass-card rounded-3xl p-6 flex flex-col items-center gap-5">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
          Λελέμετρο
        </p>
        <div className="relative w-48 h-48">
          {/* Outer glow ring */}
          <div className="absolute inset-[-8px] rounded-full opacity-20" style={{ background: 'radial-gradient(circle, oklch(0.80 0.14 75 / 0.4), transparent 70%)' }} />
          <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
            {/* Track */}
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke="oklch(0.18 0.008 260)"
              strokeWidth="8"
            />
            {/* Gradient progress - using stops */}
            <defs>
              <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="oklch(0.80 0.14 75)" />
                <stop offset="50%" stopColor="oklch(0.75 0.16 55)" />
                <stop offset="100%" stopColor="oklch(0.68 0.14 40)" />
              </linearGradient>
            </defs>
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke="url(#ringGradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${(percentage / 100) * circumference} ${circumference}`}
              className="transition-all duration-1000 ease-out"
              style={{
                filter: 'drop-shadow(0 0 12px oklch(0.80 0.14 75 / 0.5))',
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-black text-gradient leading-none">
              {percentage.toFixed(1)}%
            </span>
            <span className="text-[10px] text-muted-foreground mt-1.5 font-medium">ολοκληρώθηκε</span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2.5 w-full">
          <StatCard icon={Clock} label="Υπηρέτησες" value={`${daysServed}`} unit="ημέρες" />
          <StatCard icon={CalendarDays} label="Απομένουν" value={`${effectiveDaysRemaining}`} unit="ημέρες" />
          <StatCard icon={Percent} label="Άδειες" value={`${totalLeaveDays}`} unit="ημέρες" />
        </div>

        {dischargeDate && (
          <div className="w-full text-center py-2.5 px-4 rounded-xl bg-secondary/80 border border-border/50">
            <p className="text-[9px] text-muted-foreground uppercase tracking-[0.15em] font-semibold">
              Ημερομηνία απόλυσης
            </p>
            <p className="text-sm font-bold text-gradient mt-0.5">
              {formatGreekDate(dischargeDate)}
            </p>
          </div>
        )}
      </div>

      {/* Today's Status Section */}
      <TodayStatus duties={todayDuties} leave={todayLeave} />
    </div>
  )
}

/* ---------- Stat Card ---------- */
function StatCard({
  icon: Icon,
  label,
  value,
  unit,
}: {
  icon: typeof Clock
  label: string
  value: string
  unit: string
}) {
  return (
    <div className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-secondary/60 border border-border/30">
      <Icon className="h-3.5 w-3.5 text-primary" />
      <span className="text-xl font-black text-foreground leading-none">{value}</span>
      <span className="text-[8px] text-muted-foreground leading-none uppercase tracking-wider font-semibold">{unit}</span>
    </div>
  )
}

/* ---------- Today's Status ---------- */
function TodayStatus({
  duties,
  leave,
}: {
  duties: DutyEntry[]
  leave: LeaveEntry | undefined
}) {
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({})

  const togglePassword = (id: string) => {
    hapticFeedback('light')
    setShowPasswords((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-bold text-foreground">Σήμερα</h2>

      {/* Active Leave */}
      {leave && (
        <div className="rounded-2xl p-4 flex items-center gap-3 border border-chart-2/20" style={{ background: 'linear-gradient(145deg, oklch(0.72 0.12 175 / 0.08), oklch(0.64 0.10 195 / 0.04))' }}>
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'var(--gradient-accent-teal)' }}>
            <Palmtree className="h-5 w-5 text-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-foreground">
                {LEAVE_TYPE_LABELS[leave.type]}
              </span>
              <span className="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider" style={{ background: 'var(--gradient-accent-teal)', color: 'oklch(0.12 0.02 175)' }}>
                Άδεια
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {formatGreekDate(leave.startDate)} - {formatGreekDate(leave.endDate)} &middot;{' '}
              {leave.days} ημ.
            </p>
          </div>
        </div>
      )}

      {/* Today's Duties */}
      {duties.length > 0 ? (
        duties.map((duty) => {
          const Icon = DUTY_ICONS[duty.type]
          const isGuard = duty.type === 'guard'
          const hasPassword = isGuard && (duty.password || duty.countersign)
          const visible = showPasswords[duty.id]

          return (
            <div
              key={duty.id}
              className="rounded-2xl p-4 border border-primary/15"
              style={{ background: 'linear-gradient(145deg, oklch(0.80 0.14 75 / 0.06), oklch(0.68 0.14 40 / 0.03))' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'var(--gradient-accent-warm)' }}>
                  <Icon className="h-5 w-5 text-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">
                      {DUTY_TYPE_LABELS[duty.type]}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider btn-gradient">
                      Ενεργή
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {duty.startTime} - {duty.endTime}
                  </p>
                  {duty.notes && (
                    <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                      {duty.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Guard duty password */}
              {isGuard && hasPassword && (
                <div className="mt-3 pt-3 border-t border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[9px] text-muted-foreground uppercase tracking-[0.15em] font-bold">
                      Σύνθημα / Παρασύνθημα
                    </p>
                    <button
                      onClick={() => togglePassword(duty.id)}
                      className="p-1.5 rounded-xl bg-secondary/80 min-h-[36px] min-w-[36px] flex items-center justify-center"
                      aria-label={visible ? 'Απόκρυψη' : 'Εμφάνιση'}
                    >
                      {visible ? (
                        <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                      ) : (
                        <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-xl bg-secondary/80 border border-border/30">
                      <p className="text-[8px] text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">
                        Σύνθημα
                      </p>
                      <p
                        className={cn(
                          'text-sm font-mono font-bold',
                          visible
                            ? 'text-foreground'
                            : 'text-foreground blur-sm select-none'
                        )}
                      >
                        {duty.password || '---'}
                      </p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-secondary/80 border border-border/30">
                      <p className="text-[8px] text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">
                        Παρασύνθημα
                      </p>
                      <p
                        className={cn(
                          'text-sm font-mono font-bold',
                          visible
                            ? 'text-foreground'
                            : 'text-foreground blur-sm select-none'
                        )}
                      >
                        {duty.countersign || '---'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })
      ) : (
        !leave && (
          <div className="glass-card rounded-2xl p-5 text-center">
            <p className="text-sm text-muted-foreground">
              Δεν έχεις υπηρεσία ή άδεια σήμερα
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">
              Πρόσθεσε από το Ημερολόγιο
            </p>
          </div>
        )
      )}
    </div>
  )
}
