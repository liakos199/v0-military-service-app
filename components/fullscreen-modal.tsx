'use client'

import { useEffect } from 'react'
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
    <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm animate-modal-fade-in">
      <div className="flex flex-col h-full safe-top animate-modal-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2 flex-1">
            {showBackButton && onBack && (
              <button
                onClick={() => {
                  hapticFeedback('light')
                  onBack()
                }}
                className="p-1.5 rounded-md min-h-[36px] min-w-[36px] flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                aria-label="Πίσω"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}
            <h2 className="text-sm font-semibold text-foreground truncate">{title}</h2>
          </div>
          <button
            onClick={() => {
              hapticFeedback('light')
              onClose()
            }}
            className="p-1.5 rounded-md min-h-[36px] min-w-[36px] flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors flex-shrink-0 ml-2"
            aria-label="Κλείσιμο"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-3 no-scrollbar">
          {children}
        </div>
      </div>
    </div>
  )
}
