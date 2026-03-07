'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
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
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Αντίστροφη μέτρηση & σήμερα</p>
          </div>
          <button
            onClick={() => {
              hapticFeedback('light')
              setShowConfig(true)
            }}
            className="p-2 rounded-lg glass-card min-h-[40px] min-w-[40px] flex items-center justify-center"
            aria-label="Ρυθμίσεις θητείας"
          >
            <Settings className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* CONTENT - Scrollable */}
      <div className="flex-1 overflow-y-auto px-4 py-4 no-scrollbar">
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
                <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
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
                        'flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider min-h-[40px] transition-all border',
                        config.totalDays === preset.days
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-secondary text-secondary-foreground border-border'
                      )}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                <label className="block text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1.5">
                  {'Ή εισάγετε ημέρες χειροκίνητα'}
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={config.totalDays}
                  onChange={(e) =>
                    setConfig({ ...config, totalDays: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm min-h-[40px] border border-border"
                />
              </div>
              <button
                onClick={() => {
                  hapticFeedback('medium')
                  setShowConfig(false)
                }}
                className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold text-[10px] uppercase tracking-wider min-h-[44px]"
              >
                Αποθήκευση
              </button>
            </div>
          </FullscreenModal>

          {/* Main Progress Ring - LELEmeter */}
          <motion.div
            className="glass-card rounded-2xl p-4 flex flex-col items-center gap-4 border border-white/5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <div className="flex items-center justify-between w-full">
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                Λελέμετρο
              </p>
              {dischargeDate && (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-primary/10 border border-primary/20">
                  <CalendarDays className="h-3 w-3 text-primary" />
                  <span className="text-[9px] font-black text-primary uppercase tracking-wider">
                    {formatGreekDate(dischargeDate)}
                  </span>
                </div>
              )}
            </div>

            <div className="relative w-32 h-32">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                <circle
                  cx="80"
                  cy="80"
                  r="74"
                  fill="none"
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="8"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="74"
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(percentage / 100) * (2 * Math.PI * 74)} ${(2 * Math.PI * 74)}`}
                  className="transition-all duration-1000 ease-out"
                  style={{
                    filter: 'drop-shadow(0 0 8px var(--primary))',
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-foreground tracking-tighter">
                  {percentage.toFixed(1)}<span className="text-sm text-muted-foreground ml-0.5">%</span>
                </span>
                <span className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-0.5">ΠΡΟΟΔΟΣ</span>
              </div>
            </div>

            <motion.div
              className="grid grid-cols-3 gap-2 w-full"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                    delayChildren: 0.3,
                  },
                },
              }}
            >
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
            </motion.div>
          </motion.div>

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
    <motion.div
      className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-secondary/30 border border-white/5 hover:bg-secondary/50 transition-colors group"
      variants={{
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
      }}
    >
      <div>
        <span className="text-[9px] font-black text-primary">{label}</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-lg font-black text-foreground leading-none tracking-tighter">{value}</span>
        <span className="text-[7px] font-black text-muted-foreground leading-none mt-1 tracking-[0.1em] uppercase">{unit}</span>
      </div>
    </motion.div>
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
    <div className="flex flex-col gap-2.5">
      <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Σήμερα</h2>

      {/* Active Leave */}
      {leave && (
        <div className="glass-card rounded-2xl p-3 flex items-center gap-3 border border-primary/20 bg-primary/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Palmtree className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-black text-primary uppercase tracking-widest">ΣΕ ΑΔΕΙΑ</p>
            <h3 className="text-sm font-bold text-foreground truncate">{LEAVE_TYPE_LABELS[leave.type]}</h3>
            <p className="text-[10px] text-muted-foreground">
              Έως {formatGreekDate(leave.endDate)}
            </p>
          </div>
        </div>
      )}

      {/* Today's Duties */}
      {duties.length > 0 ? (
        <div className="flex flex-col gap-2">
          {duties.map((duty) => {
            const Icon = DUTY_ICONS[duty.type] || Shield
            const hasPasswords = duty.password || duty.countersign

            return (
              <div key={duty.id} className="glass-card rounded-2xl p-3 border border-white/5 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-foreground">{DUTY_TYPE_LABELS[duty.type]}</h3>
                    <p className="text-[10px] text-muted-foreground font-mono">
                      {duty.startTime} - {duty.endTime}
                    </p>
                  </div>
                  {hasPasswords && (
                    <button
                      onClick={() => togglePassword(duty.id)}
                      className="p-2 rounded-lg bg-secondary/50 text-muted-foreground hover:text-primary transition-colors"
                    >
                      {showPasswords[duty.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  )}
                </div>

                {hasPasswords && showPasswords[duty.id] && (
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                    <div className="bg-secondary/50 p-2 rounded-lg">
                      <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Σύνθημα</p>
                      <p className="text-xs font-bold text-primary tracking-wider">{duty.password || '—'}</p>
                    </div>
                    <div className="bg-secondary/50 p-2 rounded-lg">
                      <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Παρασύνθημα</p>
                      <p className="text-xs font-bold text-primary tracking-wider">{duty.countersign || '—'}</p>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        !leave && (
          <div className="glass-card rounded-2xl p-4 text-center border border-white/5">
            <p className="text-xs text-muted-foreground">Καμία υπηρεσία για σήμερα</p>
          </div>
        )
      )}
    </div>
  )
}
