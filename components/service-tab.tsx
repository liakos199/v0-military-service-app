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
  TrendingUp,
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

  const circumference = 2 * Math.PI * 62

  const todayDuties = useMemo(
    () =>
      duties
        .filter((d) => d.date === today)
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [duties, today]
  )

  const todayLeave = useMemo(
    () => leaves.find((l) => l.startDate <= today && l.endDate >= today),
    [leaves, today]
  )

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="sticky top-0 z-20 px-5 pt-4 pb-3 border-b border-border/40 bg-background">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-foreground tracking-tight">
              {'Θητεία'}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {'Αντίστροφη μέτρηση & σήμερα'}
            </p>
          </div>
          <button
            onClick={() => {
              hapticFeedback('light')
              setShowConfig(true)
            }}
            className="p-3 rounded-2xl bg-secondary/80 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors active:bg-secondary"
            aria-label="Ρυθμίσεις θητείας"
          >
            <Settings className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="flex flex-col gap-5 px-5 pt-5 pb-28">
          {/* Config Modal */}
          <FullscreenModal
            isOpen={showConfig}
            onClose={() => setShowConfig(false)}
            title="Ρυθμίσεις Θητείας"
          >
            <div className="flex flex-col gap-5">
              <GreekDatePicker
                value={config.enlistmentDate}
                onChange={(d) => setConfig({ ...config, enlistmentDate: d })}
                label="Ημερομηνία κατάταξης"
              />
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-2">
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
                        'flex-1 py-3 rounded-xl text-xs font-semibold min-h-[44px] transition-all border',
                        config.totalDays === preset.days
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-secondary text-secondary-foreground border-border hover:border-primary/30'
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
                  className="w-full px-4 py-3 rounded-xl bg-secondary text-secondary-foreground text-sm min-h-[48px] border border-border focus:border-primary/50 focus:outline-none transition-colors"
                />
              </div>
              <button
                onClick={() => {
                  hapticFeedback('medium')
                  setShowConfig(false)
                }}
                className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm min-h-[48px] transition-all active:scale-[0.98]"
              >
                Αποθήκευση
              </button>
            </div>
          </FullscreenModal>

          {/* Progress Ring Card */}
          <div className="glass-card rounded-2xl p-6 flex flex-col items-center gap-5">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.15em]">
                Λελέμετρο
              </p>
            </div>

            <div className="relative w-40 h-40">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
                {/* Background track */}
                <circle
                  cx="70"
                  cy="70"
                  r="62"
                  fill="none"
                  stroke="oklch(0.22 0.004 260)"
                  strokeWidth="8"
                />
                {/* Progress arc */}
                <circle
                  cx="70"
                  cy="70"
                  r="62"
                  fill="none"
                  stroke="url(#progressGradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(percentage / 100) * circumference} ${circumference}`}
                  className="transition-all duration-1000 ease-out"
                  style={{
                    filter: 'drop-shadow(0 0 6px oklch(0.75 0.15 75 / 0.35))',
                  }}
                />
                <defs>
                  <linearGradient id="progressGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="oklch(0.80 0.14 75)" />
                    <stop offset="100%" stopColor="oklch(0.65 0.16 50)" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-foreground tracking-tight">
                  {percentage.toFixed(1)}%
                </span>
                <span className="text-[10px] text-muted-foreground mt-1">
                  {'ολοκληρώθηκε'}
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 w-full">
              <StatCard
                icon={Clock}
                label="Υπηρέτησες"
                value={`${daysServed}`}
                unit="ημέρες"
              />
              <StatCard
                icon={CalendarDays}
                label="Απομένουν"
                value={`${effectiveDaysRemaining}`}
                unit="ημέρες"
                highlight
              />
              <StatCard
                icon={Percent}
                label="Άδειες"
                value={`${totalLeaveDays}`}
                unit="ημέρες"
              />
            </div>

            {dischargeDate && (
              <div className="w-full text-center py-3 px-4 rounded-xl bg-secondary/80">
                <p className="text-[10px] text-muted-foreground uppercase tracking-[0.15em] mb-1">
                  Ημερομηνία απόλυσης
                </p>
                <p className="text-sm font-bold text-primary">
                  {formatGreekDate(dischargeDate)}
                </p>
              </div>
            )}
          </div>

          {/* Today's Status */}
          <TodayStatus duties={todayDuties} leave={todayLeave} />
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  unit,
  highlight,
}: {
  icon: typeof Clock
  label: string
  value: string
  unit: string
  highlight?: boolean
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-1.5 p-3 rounded-xl transition-colors',
        highlight ? 'bg-primary/10' : 'bg-secondary/60'
      )}
    >
      <Icon
        className={cn('h-3.5 w-3.5', highlight ? 'text-primary' : 'text-muted-foreground')}
      />
      <span
        className={cn(
          'text-lg font-bold leading-none tracking-tight',
          highlight ? 'text-primary' : 'text-foreground'
        )}
      >
        {value}
      </span>
      <span className="text-[9px] text-muted-foreground leading-none">{unit}</span>
    </div>
  )
}

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
      <h2 className="text-sm font-semibold text-foreground tracking-tight">
        Σήμερα
      </h2>

      {leave && (
        <div className="glass-card rounded-2xl p-4 flex items-center gap-3 ring-1 ring-success/20">
          <div className="w-10 h-10 rounded-xl bg-success/15 flex items-center justify-center flex-shrink-0">
            <Palmtree className="h-5 w-5 text-success" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">
                {LEAVE_TYPE_LABELS[leave.type]}
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-success/15 text-success text-[10px] font-bold tracking-wide">
                ΑΔΕΙΑ
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {formatGreekDate(leave.startDate)} - {formatGreekDate(leave.endDate)}{' '}
              &middot; {leave.days} ημ.
            </p>
          </div>
        </div>
      )}

      {duties.length > 0 ? (
        duties.map((duty) => {
          const Icon = DUTY_ICONS[duty.type]
          const isGuard = duty.type === 'guard'
          const hasPassword = isGuard && (duty.password || duty.countersign)
          const visible = showPasswords[duty.id]

          return (
            <div
              key={duty.id}
              className="glass-card rounded-2xl p-4 ring-1 ring-primary/15"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-chart-3/15 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-5 w-5 text-chart-3" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {DUTY_TYPE_LABELS[duty.type]}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-primary/15 text-primary text-[10px] font-bold tracking-wide">
                      ΕΝΕΡΓΗ
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

              {isGuard && hasPassword && (
                <div className="mt-3 pt-3 border-t border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-[0.1em] font-semibold">
                      Σύνθημα / Παρασύνθημα
                    </p>
                    <button
                      onClick={() => togglePassword(duty.id)}
                      className="p-1.5 rounded-lg min-h-[36px] min-w-[36px] flex items-center justify-center"
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
                    <div className="p-2.5 rounded-xl bg-secondary/80">
                      <p className="text-[9px] text-muted-foreground uppercase mb-1">
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
                    <div className="p-2.5 rounded-xl bg-secondary/80">
                      <p className="text-[9px] text-muted-foreground uppercase mb-1">
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
          <div className="glass-card rounded-2xl p-6 text-center">
            <div className="w-10 h-10 rounded-xl bg-secondary mx-auto mb-3 flex items-center justify-center">
              <Shield className="h-5 w-5 text-muted-foreground" />
            </div>
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
