'use client'

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { hapticFeedback } from '@/lib/helpers'

interface FullscreenModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function FullscreenModal({ isOpen, onClose, title, children }: FullscreenModalProps) {
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100]" style={{ background: 'var(--gradient-surface)' }}>
      <div className="flex flex-col h-full safe-top">
        {/* Header with gradient border */}
        <div className="relative px-4 py-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground">{title}</h2>
            <button
              onClick={() => {
                hapticFeedback('light')
                onClose()
              }}
              className="p-2 rounded-2xl bg-secondary/80 min-h-[44px] min-w-[44px] flex items-center justify-center text-muted-foreground transition-colors active:scale-95"
              aria-label="Κλείσιμο"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="absolute bottom-0 left-4 right-4 h-px" style={{ background: 'linear-gradient(90deg, transparent, oklch(0.80 0.14 75 / 0.2), transparent)' }} />
        </div>

        {/* Content */}
        <div
          ref={contentRef}
          className="flex-1 overflow-y-auto px-4 py-4 no-scrollbar"
        >
          {children}
        </div>
      </div>
    </div>
  )
}
