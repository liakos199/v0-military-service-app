'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  Settings,
  Calendar as CalendarIcon,
  Plus,
  Lock,
  CalendarX,
  ShieldCheck,
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
import type { ServiceConfig, LeaveEntry, PrisonEntry, DetentionEntry } from '@/lib/types'
import {
  SERVICE_DURATION_PRESETS,
} from '@/lib/types'

export function ServiceTab() {
  const [config, setConfig] = useLocalStorage<ServiceConfig>('fantaros-config', {
    enlistmentDate: '',
    totalDays: 365,
  })
  const [leaves] = useLocalStorage<LeaveEntry[]>('fantaros-leaves', [])
  const [prisons] = useLocalStorage<PrisonEntry[]>('fantaros-prisons', [])
  const [detentions] = useLocalStorage<DetentionEntry[]>('fantaros-detentions', [])
  const [showConfig, setShowConfig] = useState(false)
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
      {/* Global Gradients Definition for SVG Icons */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="emerald-ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop stopColor="#34d399" offset="0%" />
            <stop stopColor="#10b981" offset="100%" />
          </linearGradient>
        </defs>
      </svg>

      {/* Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-48 bg-[#10b981]/5 blur-[70px] pointer-events-none rounded-full z-0"></div>

      <header className="px-6 pt-14 pb-2 relative flex justify-between items-start shrink-0">
        <div>
          <h1 className="text-[32px] font-bold tracking-tight text-white leading-none mb-1">Θητεία</h1>
          <p className="text-[13px] font-bold tracking-[0.1em] text-zinc-500 uppercase">Αντιστροφη μετρηση</p>
        </div>
        <button 
          onClick={() => {
            hapticFeedback('light')
            setShowConfig(true)
          }}
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
            <div className="flex items-center gap-1.5 bg-zinc-950/50 border border-zinc-700/50 text-zinc-300 px-3 py-1.5 rounded-xl text-[10px] font-bold tracking-widest shadow-inner">
              <CalendarIcon size={14} className="text-[#34d399]" />
              {dischargeDate ? formatGreekDate(dischargeDate).toUpperCase() : '---'}
            </div>
          </div>

          {!config.enlistmentDate ? (
            <div className="flex flex-col items-center justify-center py-10 gap-4">
               <div className="w-20 h-20 rounded-full bg-zinc-800 border border-dashed border-zinc-700 flex items-center justify-center">
                <CalendarIcon className="h-8 w-8 text-zinc-600" />
              </div>
              <button
                onClick={() => setShowConfig(true)}
                className="px-6 py-2 rounded-xl bg-primary text-white font-bold text-[11px] uppercase tracking-widest active:scale-95 transition-transform"
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
            <div className="bg-gradient-to-br from-zinc-800 to-zinc-900/90 border border-zinc-700/40 rounded-[1.25rem] p-4 flex items-center justify-between shadow-lg shadow-black/10 transition active:scale-[0.98]">
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
              <button 
                onClick={() => setShowConfig(true)}
                className="w-10 h-10 rounded-[12px] bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[#34d399] hover:bg-zinc-700 transition-colors active:scale-90 shrink-0 shadow-sm"
              >
                <Plus size={18} />
              </button>
            </div>
            
            <div className="bg-gradient-to-br from-zinc-800 to-zinc-900/90 border border-zinc-700/40 rounded-[1.25rem] p-4 flex items-center justify-between shadow-lg shadow-black/10 transition active:scale-[0.98]">
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
              <button 
                onClick={() => setShowConfig(true)}
                className="w-10 h-10 rounded-[12px] bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[#34d399] hover:bg-zinc-700 transition-colors active:scale-90 shrink-0 shadow-sm"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-gradient-to-br from-[#10b981] to-[#059669] rounded-[2rem] p-6 text-white shadow-xl shadow-emerald-900/20 relative overflow-hidden group active:scale-[0.98] transition-all">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 blur-3xl rounded-full group-hover:bg-white/20 transition-all"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
                <ShieldCheck size={32} />
              </div>
              <div>
                <p className="text-[11px] font-bold tracking-[0.2em] text-emerald-100 uppercase mb-0.5">Κατασταση</p>
                <h3 className="text-2xl font-extrabold tracking-tight">Ενεργος</h3>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Config Modal */}
      <FullscreenModal
        isOpen={showConfig}
        onClose={() => setShowConfig(false)}
        title="Ρυθμίσεις Θητείας"
      >
        <div className="flex flex-col gap-6 p-2">
          <GreekDatePicker
            value={config.enlistmentDate}
            onChange={(d) => setConfig({ ...config, enlistmentDate: d })}
            label="Ημερομηνία κατάταξης"
          />
          
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-3 px-1">
              Διάρκεια θητείας
            </label>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {SERVICE_DURATION_PRESETS.map((preset) => (
                <button
                  key={preset.days}
                  type="button"
                  onClick={() => {
                    hapticFeedback('light')
                    setConfig({ ...config, totalDays: preset.days })
                  }}
                  className={cn(
                    'py-3 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all border',
                    config.totalDays === preset.days
                      ? 'bg-primary text-white border-primary shadow-lg shadow-emerald-900/20'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            
            <div className="relative mt-4">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Χειροκινητα:</span>
              <input
                type="number"
                inputMode="numeric"
                value={config.totalDays}
                onChange={(e) =>
                  setConfig({ ...config, totalDays: parseInt(e.target.value) || 0 })
                }
                className="w-full pl-24 pr-4 py-4 rounded-xl bg-zinc-900 text-white text-sm border border-zinc-800 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              />
            </div>
          </div>

          <button
            onClick={() => {
              hapticFeedback('medium')
              setShowConfig(false)
            }}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-[13px] uppercase tracking-[0.2em] shadow-lg shadow-emerald-900/30 active:scale-95 transition-all mt-4"
          >
            Αποθήκευση
          </button>
        </div>
      </FullscreenModal>
    </div>
  )
}
