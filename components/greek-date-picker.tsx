'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GREEK_MONTHS } from '@/lib/types'
import { hapticFeedback } from '@/lib/helpers'
import { FullscreenModal } from '@/components/fullscreen-modal'

interface GreekDatePickerProps {
  value: string
  onChange: (date: string) => void
  label?: string
  minDate?: string
}

export function GreekDatePicker({ value, onChange, label, minDate }: GreekDatePickerProps) {
  const selectedDate = value ? new Date(value) : new Date()
  const [viewMonth, setViewMonth] = useState(selectedDate.getMonth())
  const [viewYear, setViewYear] = useState(selectedDate.getFullYear())
  const [isOpen, setIsOpen] = useState(false)

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay()
  const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1

  const prevMonth = () => {
    hapticFeedback('light')
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear(viewYear - 1)
    } else {
      setViewMonth(viewMonth - 1)
    }
  }

  const nextMonth = () => {
    hapticFeedback('light')
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear(viewYear + 1)
    } else {
      setViewMonth(viewMonth + 1)
    }
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
        <label className="block text-xs text-muted-foreground mb-1.5">{label}</label>
      )}
      <button
        type="button"
        onClick={() => {
          hapticFeedback('light')
          setIsOpen(true)
        }}
        className="w-full flex items-center justify-between px-3 py-3 rounded-lg bg-secondary text-secondary-foreground text-sm min-h-[48px] border border-border"
      >
        <span className={cn(!value && 'text-muted-foreground')}>{displayText}</span>
        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
      </button>

      <FullscreenModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Επιλογή Ημερομηνίας"
      >
        <div className="flex flex-col gap-4">
          {/* Month navigation */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={prevMonth}
              className="p-3 rounded-xl bg-secondary min-h-[48px] min-w-[48px] flex items-center justify-center"
              aria-label="Προηγούμενος μήνας"
            >
              <ChevronLeft className="h-5 w-5 text-foreground" />
            </button>
            <span className="text-lg font-semibold text-foreground">
              {GREEK_MONTHS[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="p-3 rounded-xl bg-secondary min-h-[48px] min-w-[48px] flex items-center justify-center"
              aria-label="Επόμενος μήνας"
            >
              <ChevronRight className="h-5 w-5 text-foreground" />
            </button>
          </div>

          {/* Day names */}
          <div className="grid grid-cols-7 gap-1">
            {greekDaysStartMonday.map((d) => (
              <div key={d} className="text-center text-xs text-muted-foreground font-medium py-2">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
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
                    'aspect-square w-full rounded-xl text-sm flex items-center justify-center transition-colors min-h-[44px]',
                    isDisabled
                      ? 'text-muted-foreground/30 cursor-not-allowed'
                      : isSelected
                        ? 'bg-primary text-primary-foreground font-bold'
                        : isToday
                          ? 'bg-secondary text-primary font-semibold ring-1 ring-primary'
                          : 'text-foreground active:bg-secondary'
                  )}
                >
                  {day}
                </button>
              )
            })}
          </div>

          {/* Today shortcut */}
          <button
            type="button"
            onClick={() => {
              hapticFeedback('medium')
              const now = new Date()
              setViewMonth(now.getMonth())
              setViewYear(now.getFullYear())
              handleSelectDay(now.getDate())
            }}
            className="w-full py-3 rounded-xl bg-secondary text-foreground font-medium text-sm min-h-[48px]"
          >
            Σήμερα
          </button>
        </div>
      </FullscreenModal>
    </div>
  )
}

function CalendarIcon(props: React.SVGProps<SVGSVGElement> & { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  )
}
