'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GREEK_MONTHS } from '@/lib/types'
import { hapticFeedback } from '@/lib/helpers'

interface InlineDatePickerProps {
  value: string
  onChange: (date: string) => void
  label?: string
  minDate?: string
}

export function InlineDatePicker({ value, onChange, label, minDate }: InlineDatePickerProps) {
  const parsed = value ? new Date(value + 'T00:00:00') : new Date()
  const [viewMonth, setViewMonth] = useState(parsed.getMonth())
  const [viewYear, setViewYear] = useState(parsed.getFullYear())
  const [isOpen, setIsOpen] = useState(false)

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay()
  const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1

  const prevMonth = () => {
    hapticFeedback('light')
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }

  const nextMonth = () => {
    hapticFeedback('light')
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  const handleSelectDay = (day: number) => {
    hapticFeedback('medium')
    const m = String(viewMonth + 1).padStart(2, '0')
    const d = String(day).padStart(2, '0')
    onChange(`${viewYear}-${m}-${d}`)
    setIsOpen(false)
  }

  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  const displayText = value
    ? (() => {
        const d = new Date(value + 'T00:00:00')
        return `${d.getDate()} ${GREEK_MONTHS[d.getMonth()].substring(0, 3)} ${d.getFullYear()}`
      })()
    : 'Επίλεξε ημερομηνία'

  const greekDays = ['Δε', 'Τρ', 'Τε', 'Πε', 'Πα', 'Σα', 'Κυ']

  return (
    <div className="w-full">
      {label && (
        <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
          {label}
        </label>
      )}

      {/* Trigger */}
      <button
        type="button"
        onClick={() => { hapticFeedback('light'); setIsOpen(o => !o) }}
        className={cn(
          'w-full flex items-center justify-between rounded-lg bg-zinc-900 border px-4 py-3.5 text-sm min-h-[48px] transition-colors',
          isOpen ? 'border-emerald-500' : 'border-zinc-800 hover:border-zinc-700'
        )}
      >
        <span className={cn('font-semibold', !value ? 'text-zinc-500' : 'text-white')}>
          {displayText}
        </span>
        {isOpen
          ? <X size={15} className="text-zinc-400 shrink-0" />
          : <CalendarDays size={15} className="text-zinc-500 shrink-0" />
        }
      </button>

      {/* Inline calendar — no fixed/absolute, renders in flow */}
      {isOpen && (
        <div className="mt-2 bg-zinc-900 border border-zinc-700/60 rounded-lg overflow-hidden">
          {/* Month nav */}
          <div className="flex items-center justify-between px-3 pt-3 pb-2">
            <button
              type="button"
              onClick={prevMonth}
              className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700/50 flex items-center justify-center active:scale-90 transition-transform"
            >
              <ChevronLeft size={14} className="text-zinc-400" />
            </button>
            <span className="text-[11px] font-bold tracking-[0.15em] text-white uppercase">
              {GREEK_MONTHS[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700/50 flex items-center justify-center active:scale-90 transition-transform"
            >
              <ChevronRight size={14} className="text-zinc-400" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-0.5 px-2 pb-1">
            {greekDays.map(d => (
              <div key={d} className="text-center text-[9px] font-bold text-zinc-600 uppercase tracking-wide py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-0.5 px-2 pb-3">
            {Array.from({ length: startDay }).map((_, i) => <div key={`e-${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              const isSelected = dateStr === value
              const isToday = dateStr === todayStr
              const isDisabled = minDate ? dateStr < minDate : false

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => !isDisabled && handleSelectDay(day)}
                  disabled={isDisabled}
                  className={cn(
                    'aspect-square w-full rounded-lg text-[11px] font-bold flex items-center justify-center transition-all duration-150',
                    isDisabled
                      ? 'text-zinc-700 cursor-not-allowed'
                      : isSelected
                        ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-900/40'
                        : isToday
                          ? 'bg-zinc-800 text-emerald-400 ring-1 ring-emerald-500/50'
                          : 'text-zinc-300 hover:bg-zinc-800 active:scale-90'
                  )}
                >
                  {day}
                </button>
              )
            })}
          </div>

          {/* Today shortcut */}
          <div className="px-2 pb-2">
            <button
              type="button"
              onClick={() => {
                hapticFeedback('light')
                setViewMonth(today.getMonth())
                setViewYear(today.getFullYear())
                handleSelectDay(today.getDate())
              }}
              className="w-full py-2 rounded-lg bg-zinc-800 border border-zinc-700/50 text-[10px] font-bold uppercase tracking-widest text-zinc-300 hover:border-zinc-600 transition-colors active:scale-95"
            >
              Σήμερα
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
