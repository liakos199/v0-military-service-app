'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GREEK_MONTHS, GREEK_DAYS_SHORT } from '@/lib/types'
import { hapticFeedback } from '@/lib/helpers'

interface GreekDatePickerProps {
  value: string
  onChange: (date: string) => void
  label?: string
}

export function GreekDatePicker({ value, onChange, label }: GreekDatePickerProps) {
  const selectedDate = value ? new Date(value) : new Date()
  const [viewMonth, setViewMonth] = useState(selectedDate.getMonth())
  const [viewYear, setViewYear] = useState(selectedDate.getFullYear())
  const [isOpen, setIsOpen] = useState(false)

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay()
  // Adjust for Monday start: Monday=0, ..., Sunday=6
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
  
  // Greek days start with Monday
  const greekDaysStartMonday = ['Δε', 'Τρ', 'Τε', 'Πε', 'Πα', 'Σα', 'Κυ']

  return (
    <div className="relative">
      {label && (
        <label className="block text-xs text-muted-foreground mb-1.5">{label}</label>
      )}
      <button
        type="button"
        onClick={() => {
          hapticFeedback('light')
          setIsOpen(!isOpen)
        }}
        className="w-full flex items-center justify-between px-3 py-3 rounded-lg bg-secondary text-secondary-foreground text-sm min-h-[48px] border border-border"
      >
        <span className={cn(!value && 'text-muted-foreground')}>{displayText}</span>
        <Calendar className="h-4 w-4 text-muted-foreground" />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 left-0 right-0 glass-card rounded-xl p-3 shadow-xl border border-glass-border">
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={prevMonth}
              className="p-2 rounded-lg hover:bg-secondary min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Προηγούμενος μήνας"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-semibold">
              {GREEK_MONTHS[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="p-2 rounded-lg hover:bg-secondary min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Επόμενος μήνας"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {greekDaysStartMonday.map((d) => (
              <div key={d} className="text-center text-[10px] text-muted-foreground font-medium py-1">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              const isSelected = dateStr === value
              const isToday = dateStr === todayStr

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={cn(
                    'h-9 w-full rounded-lg text-xs flex items-center justify-center transition-colors',
                    isSelected
                      ? 'bg-primary text-primary-foreground font-bold'
                      : isToday
                        ? 'bg-secondary text-primary font-semibold ring-1 ring-primary'
                        : 'hover:bg-secondary text-foreground'
                  )}
                >
                  {day}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function Calendar(props: React.SVGProps<SVGSVGElement> & { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  )
}
