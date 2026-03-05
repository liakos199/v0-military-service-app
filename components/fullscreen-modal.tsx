'use client'

import { useEffect, useRef } from 'react'
import { X, ChevronLeft } from 'lucide-react'
import { hapticFeedback } from '@/lib/helpers'

interface FullscreenModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  showBackButton?: boolean
  onBack?: () => void
}

export function FullscreenModal({ isOpen, onClose, title, children, showBackButton = false, onBack }: FullscreenModalProps) {
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
    <div className="fixed inset-0 z-[100]" style={{ background: 'linear-gradient(180deg, #0A0C0A, #0F1210 40%)' }}>
      <div className="flex flex-col h-full safe-top">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border" style={{ background: 'linear-gradient(90deg, rgba(22, 26, 22, 0.5), rgba(15, 18, 16, 0.3))' }}>
          <div className="flex items-center gap-2">
            {showBackButton && onBack && (
              <button
                onClick={() => {
                  hapticFeedback('light')
                  onBack()
                }}
                className="p-2 rounded-lg min-h-[40px] min-w-[40px] flex items-center justify-center bg-white text-foreground hover:bg-white/90 transition-colors"
                aria-label="Πίσω"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
            <h2 className="text-base font-semibold text-foreground">{title}</h2>
          </div>
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
