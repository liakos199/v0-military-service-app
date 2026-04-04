'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GREEK_MONTHS } from '@/lib/types'
import { hapticFeedback } from '@/lib/helpers'

interface GreekDatePickerProps {
  value: string
  onChange: (date: string) => void
  label?: string
  minDate?: string
  compact?: boolean
}

export function GreekDatePicker({ value, onChange, label, minDate, compact = false }: GreekDatePickerProps) {
  const selectedDate = value ? new Date(value) : new Date()
  const [viewMonth, setViewMonth] = useState(selectedDate.getMonth())
  const [viewYear, setViewYear] = useState(selectedDate.getFullYear())
  const [isOpen, setIsOpen] = useState(false)

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay()
  const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1

  const prevMonth = () => {
    hapticFeedback('light')
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1) }
    else setViewMonth(viewMonth - 1)
  }

  const nextMonth = () => {
    hapticFeedback('light')
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1) }
    else setViewMonth(viewMonth + 1)
  }

  const handleSelectDay = (day: number) => {
    hapticFeedback('medium')
    const m = String(viewMonth + 1).padStart(2, '0')
    const d = String(day).padStart(2, '0')
    onChange(`${viewYear}-${m}-${d}`)
    setIsOpen(false)
  }

  const displayText = value
    ? `${new Date(value).getDate()} ${GREEK_MONTHS[new Date(value).getMonth()].substring(0, 3)} ${new Date(value).getFullYear()}`
    : 'Επίλεξε ημερομηνία'

  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  const greekDaysStartMonday = ['Δε', 'Τρ', 'Τε', 'Πε', 'Πα', 'Σα', 'Κυ']

  return (
    <div>
      {label && (
        <label className={cn(
          'block font-bold uppercase tracking-wider text-zinc-400 mb-2',
          compact ? 'text-[10px]' : 'text-[11px]'
        )}>{label}</label>
      )}
      <button
        type="button"
        onClick={() => { hapticFeedback('light'); setIsOpen(true) }}
        className={cn(
          'w-full flex items-center justify-between rounded-lg bg-zinc-900 border border-zinc-800 text-white transition-colors hover:border-zinc-700 focus:border-emerald-500',
          compact ? 'px-3 py-2 text-xs min-h-[36px]' : 'px-4 py-3.5 text-sm min-h-[48px]'
        )}
      >
        <span className={cn('font-semibold', !value && 'text-zinc-500')}>{displayText}</span>
        <CalendarDays className={cn('text-zinc-500', compact ? 'h-3.5 w-3.5' : 'h-4 w-4')} />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[300] bg-black/70 flex items-end justify-center pb-8 px-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-zinc-900 border border-zinc-700/50 rounded-lg w-full max-w-sm shadow-2xl shadow-black/60 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-5 pt-5 pb-4">
              <p className="text-[11px] font-bold tracking-[0.2em] text-zinc-500 uppercase mb-4">Επιλογή Ημερομηνίας</p>

              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-5">
                <button
                  type="button"
                  onClick={prevMonth}
                  className="p-2 rounded-lg bg-zinc-800 border border-zinc-700/50 hover:border-zinc-600 transition-all active:scale-90"
                >
                  <ChevronLeft size={18} className="text-zinc-400" />
                </button>
                <span className="text-[13px] font-bold tracking-[0.2em] text-white uppercase">
                  {GREEK_MONTHS[viewMonth]} {viewYear}
                </span>
                <button
                  type="button"
                  onClick={nextMonth}
                  className="p-2 rounded-lg bg-zinc-800 border border-zinc-700/50 hover:border-zinc-600 transition-all active:scale-90"
                >
                  <ChevronRight size={18} className="text-zinc-400" />
                </button>
              </div>

              {/* Day Names */}
              <div className="grid grid-cols-7 gap-1 mb-3">
                {greekDaysStartMonday.map((d) => (
                  <div key={d} className="text-center text-[10px] font-bold text-zinc-500 uppercase tracking-wider py-1">
                    {d}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1.5">
                {Array.from({ length: startDay }).map((_, i) => <div key={`empty-${i}`} />)}
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
                        'aspect-square w-full rounded-lg text-sm flex items-center justify-center transition-all duration-200 font-bold',
                        isDisabled
                          ? 'text-zinc-700 cursor-not-allowed'
                          : isSelected
                            ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-900/30'
                            : isToday
                              ? 'bg-zinc-800 text-emerald-400 ring-1 ring-emerald-500/50'
                              : 'bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700 border border-zinc-700/30 active:scale-90'
                      )}
                    >
                      {day}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 pb-5 flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => {
                  hapticFeedback('medium')
                  setViewMonth(today.getMonth())
                  setViewYear(today.getFullYear())
                  handleSelectDay(today.getDate())
                }}
                className="flex-1 py-3 rounded-lg bg-zinc-800 border border-zinc-700/50 text-zinc-300 font-bold text-[11px] uppercase tracking-wider hover:border-zinc-600 transition-colors active:scale-95"
              >
                Σήμερα
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex-1 py-3 rounded-lg bg-zinc-800 border border-zinc-700/50 text-zinc-400 font-bold text-[11px] uppercase tracking-wider hover:border-zinc-600 transition-colors active:scale-95"
              >
                Κλείσιμο
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
