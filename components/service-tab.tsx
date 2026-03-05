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

  const circumference = 2 * Math.PI * 58

  const todayDuties = useMemo(
    () => duties.filter((d) => d.date === today).sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [duties, today]
  )

  const todayLeave = useMemo(
    () => leaves.find((l) => l.startDate <= today && l.endDate >= today),
    [leaves, today]
  )

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="px-5 pt-4 pb-3 border-b border-border bg-background">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">Θητεία</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Αντίστροφη μέτρηση</p>
          </div>
          <button
            onClick={() => { hapticFeedback('light'); setShowConfig(true) }}
            className="p-3 rounded-xl bg-secondary min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors active:bg-muted"
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
          <FullscreenModal isOpen={showConfig} onClose={() => setShowConfig(false)} title="Ρυθμίσεις Θητείας">
            <div className="flex flex-col gap-5">
              <GreekDatePicker
                value={config.enlistmentDate}
                onChange={(d) => setConfig({ ...config, enlistmentDate: d })}
                label="Ημερομηνία κατάταξης"
              />
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-2">Διάρκεια θητείας</label>
                <div className="flex gap-2 mb-3">
                  {SERVICE_DURATION_PRESETS.map((preset) => (
                    <button
                      key={preset.days}
                      type="button"
                      onClick={() => { hapticFeedback('light'); setConfig({ ...config, totalDays: preset.days }) }}
                      className={cn(
                        'flex-1 py-3 rounded-xl text-xs font-semibold min-h-[44px] transition-all border',
                        config.totalDays === preset.days
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-secondary text-secondary-foreground border-border'
                      )}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                <label className="block text-[10px] text-muted-foreground mb-1.5">Ή εισάγετε ημέρες</label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={config.totalDays}
                  onChange={(e) => setConfig({ ...config, totalDays: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 rounded-xl bg-secondary text-secondary-foreground text-sm min-h-[48px] border border-border focus:border-primary focus:outline-none transition-colors"
                />
              </div>
              <button
                onClick={() => { hapticFeedback('medium'); setShowConfig(false) }}
                className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm min-h-[48px] transition-all active:scale-[0.98]"
              >
                Αποθήκευση
              </button>
            </div>
          </FullscreenModal>

          {/* Progress Ring */}
          <div className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center gap-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Λελέμετρο</p>

            <div className="relative w-36 h-36">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
                <circle cx="64" cy="64" r="58" fill="none" stroke="oklch(0.18 0.005 285)" strokeWidth="6" />
                <circle
                  cx="64" cy="64" r="58" fill="none"
                  stroke="oklch(0.62 0.19 255)"
                  strokeWidth="6" strokeLinecap="round"
                  strokeDasharray={`${(percentage / 100) * circumference} ${circumference}`}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-foreground tabular-nums">{percentage.toFixed(1)}%</span>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3 w-full">
              <StatCard icon={Clock} label="Υπηρέτησες" value={`${daysServed}`} unit="ημέρες" />
              <StatCard icon={CalendarDays} label="Απομένουν" value={`${effectiveDaysRemaining}`} unit="ημέρες" highlight />
              <StatCard icon={Percent} label="Άδειες" value={`${totalLeaveDays}`} unit="ημέρες" />
            </div>

            {dischargeDate && (
              <div className="w-full text-center py-3 px-4 rounded-xl bg-secondary border border-border">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Απόλυση</p>
                <p className="text-sm font-bold text-primary">{formatGreekDate(dischargeDate)}</p>
              </div>
            )}
          </div>

          {/* Today */}
          <TodayStatus duties={todayDuties} leave={todayLeave} />
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, unit, highlight }: {
  icon: typeof Clock; label: string; value: string; unit: string; highlight?: boolean
}) {
  return (
    <div className={cn(
      'flex flex-col items-center gap-1.5 p-3 rounded-xl border',
      highlight ? 'bg-primary/10 border-primary/20' : 'bg-secondary border-border'
    )}>
      <Icon className={cn('h-3.5 w-3.5', highlight ? 'text-primary' : 'text-muted-foreground')} />
      <span className={cn('text-lg font-bold leading-none tabular-nums', highlight ? 'text-primary' : 'text-foreground')}>{value}</span>
      <span className="text-[9px] text-muted-foreground leading-none">{unit}</span>
    </div>
  )
}

function TodayStatus({ duties, leave }: { duties: DutyEntry[]; leave: LeaveEntry | undefined }) {
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({})
  const togglePassword = (id: string) => { hapticFeedback('light'); setShowPasswords((prev) => ({ ...prev, [id]: !prev[id] })) }

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-foreground">Σήμερα</h2>

      {leave && (
        <div className="bg-card border border-success/20 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-success/15 flex items-center justify-center flex-shrink-0">
            <Palmtree className="h-5 w-5 text-success" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">{LEAVE_TYPE_LABELS[leave.type]}</span>
              <span className="px-2 py-0.5 rounded-md bg-success/15 text-success text-[10px] font-bold">ΑΔΕΙΑ</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {formatGreekDate(leave.startDate)} - {formatGreekDate(leave.endDate)} &middot; {leave.days} ημ.
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
            <div key={duty.id} className="bg-card border border-border rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">{DUTY_TYPE_LABELS[duty.type]}</span>
                    <span className="px-2 py-0.5 rounded-md bg-primary/15 text-primary text-[10px] font-bold">ΕΝΕΡΓΗ</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{duty.startTime} - {duty.endTime}</p>
                  {duty.notes && <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{duty.notes}</p>}
                </div>
              </div>

              {isGuard && hasPassword && (
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Σύνθημα / Παρασύνθημα</p>
                    <button onClick={() => togglePassword(duty.id)} className="p-1.5 rounded-lg min-h-[36px] min-w-[36px] flex items-center justify-center" aria-label={visible ? 'Απόκρυψη' : 'Εμφάνιση'}>
                      {visible ? <EyeOff className="h-3.5 w-3.5 text-muted-foreground" /> : <Eye className="h-3.5 w-3.5 text-muted-foreground" />}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-xl bg-secondary border border-border">
                      <p className="text-[9px] text-muted-foreground uppercase mb-1">Σύνθημα</p>
                      <p className={cn('text-sm font-mono font-bold', visible ? 'text-foreground' : 'text-foreground blur-sm select-none')}>{duty.password || '---'}</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-secondary border border-border">
                      <p className="text-[9px] text-muted-foreground uppercase mb-1">Παρασύνθημα</p>
                      <p className={cn('text-sm font-mono font-bold', visible ? 'text-foreground' : 'text-foreground blur-sm select-none')}>{duty.countersign || '---'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })
      ) : (
        !leave && (
          <div className="bg-card border border-border rounded-2xl p-6 text-center">
            <Shield className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Δεν έχεις υπηρεσία σήμερα</p>
            <p className="text-[10px] text-muted-foreground mt-1">Πρόσθεσε από το Ημερολόγιο</p>
          </div>
        )
      )}
    </div>
  )
}
