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
    <div className="fixed inset-0 z-[100]" style={{ background: 'linear-gradient(180deg, oklch(0.22 0.008 250), oklch(0.16 0.004 250) 40%)' }}>
      <div className="flex flex-col h-full safe-top">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border" style={{ background: 'linear-gradient(90deg, oklch(0.24 0.008 250 / 0.5), oklch(0.20 0.006 250 / 0.3))' }}>
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          <button
            onClick={() => {
              hapticFeedback('light')
              onClose()
            }}
            className="p-2 rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Κλείσιμο"
          >
            <X className="h-5 w-5" />
          </button>
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
