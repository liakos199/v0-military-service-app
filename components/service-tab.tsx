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

  // Today's duties
  const todayDuties = useMemo(
    () => duties.filter((d) => d.date === today).sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [duties, today]
  )

  // Active leave today
  const todayLeave = useMemo(
    () => leaves.find((l) => l.startDate <= today && l.endDate >= today),
    [leaves, today]
  )

  return (
    <div className="flex flex-col h-full">
      {/* HEADER - Always Visible */}
      <div className="flex-shrink-0 bg-background px-4 pt-4 pb-3 border-b border-border/50 safe-top">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Θητεία</h1>
            <p className="text-xs text-muted-foreground">Αντίστροφη μέτρηση & σήμερα</p>
          </div>
          <button
            onClick={() => {
              hapticFeedback('light')
              setShowConfig(true)
            }}
            className="p-3 rounded-xl glass-card min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Ρυθμίσεις θητείας"
          >
            <Settings className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* CONTENT - Scrollable */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="flex flex-col gap-4">
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
                <label className="block text-xs text-muted-foreground mb-1.5">
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
                        'flex-1 py-2.5 rounded-lg text-xs font-medium min-h-[44px] transition-colors border',
                        config.totalDays === preset.days
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-secondary text-secondary-foreground border-border'
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
          </FullscreenModal>

          {/* Main Progress Ring - LELEmeter */}
          <div className="glass-card rounded-2xl p-5 flex flex-col items-center gap-5">
            <div className="flex items-center justify-between w-full">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                Λελέμετρο
              </p>
              {dischargeDate && (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10 border border-primary/20">
                  <CalendarDays className="h-3 w-3 text-primary" />
                  <span className="text-[10px] font-bold text-primary uppercase">
                    {formatGreekDate(dischargeDate)}
                  </span>
                </div>
              )}
            </div>

            <div className="relative w-40 h-40">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                <circle
                  cx="80"
                  cy="80"
                  r="74"
                  fill="none"
                  stroke="rgba(255,255,255,0.03)"
                  strokeWidth="6"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="74"
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${(percentage / 100) * (2 * Math.PI * 74)} ${(2 * Math.PI * 74)}`}
                  className="transition-all duration-1000 ease-out"
                  style={{
                    filter: 'drop-shadow(0 0 8px var(--primary))',
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-foreground tracking-tighter">
                  {percentage.toFixed(1)}<span className="text-lg text-muted-foreground ml-0.5">%</span>
                </span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Status</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 w-full">
              <StatCard
                icon={Clock}
                label="Υπηρέτησες"
                value={`${daysServed}`}
                unit="ΗΜΕΡΕΣ"
              />
              <StatCard
                icon={CalendarDays}
                label="Απομένουν"
                value={`${effectiveDaysRemaining}`}
                unit="ΗΜΕΡΕΣ"
              />
              <StatCard
                icon={Percent}
                label="Άδειες"
                value={`${totalLeaveDays}`}
                unit="ΗΜΕΡΕΣ"
              />
            </div>
          </div>

          {/* Today's Status Section */}
          <TodayStatus duties={todayDuties} leave={todayLeave} />
        </div>
      </div>
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
    <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-secondary/40 border border-white/5">
      <Icon className="h-4 w-4 text-primary/80" />
      <div className="flex flex-col items-center">
        <span className="text-xl font-black text-foreground leading-none tracking-tight">{value}</span>
        <span className="text-[8px] font-bold text-muted-foreground leading-none mt-1 tracking-widest">{unit}</span>
      </div>
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
      <h2 className="text-sm font-semibold text-foreground">Σήμερα</h2>

      {/* Active Leave */}
      {leave && (
        <div className="glass-card rounded-2xl p-4 flex items-center gap-4 border border-accent/20 bg-accent/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-accent" />
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(56,189,248,0.15)]">
            <Palmtree className="h-6 w-6 text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-foreground uppercase tracking-tight">
                {LEAVE_TYPE_LABELS[leave.type]}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-accent text-accent-foreground text-[8px] font-black uppercase tracking-widest">
                ACTIVE
              </span>
            </div>
            <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-wider">
              {formatGreekDate(leave.startDate)} — {formatGreekDate(leave.endDate)}
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
              className="glass-card rounded-xl p-4 ring-1 ring-primary/30"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-chart-3/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-5 w-5 text-chart-3" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {DUTY_TYPE_LABELS[duty.type]}
                    </span>
                    <span className="px-1.5 py-0.5 rounded-md bg-primary/20 text-primary text-[10px] font-bold">
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

              {/* Guard duty password */}
              {isGuard && hasPassword && (
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
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
                    <div className="p-2 rounded-lg bg-secondary">
                      <p className="text-[9px] text-muted-foreground uppercase mb-0.5">
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
                    <div className="p-2 rounded-lg bg-secondary">
                      <p className="text-[9px] text-muted-foreground uppercase mb-0.5">
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
          <div className="glass-card rounded-xl p-4 text-center">
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
