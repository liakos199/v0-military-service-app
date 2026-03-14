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
    <div className="fixed inset-0 z-[200] bg-black backdrop-blur-sm animate-fade-in flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-zinc-800/80 shrink-0 safe-top">
        <div className="flex items-center gap-3 flex-1">
          {showBackButton && onBack && (
            <button
              onClick={() => {
                hapticFeedback('light')
                onBack()
              }}
              className="p-2 rounded-full bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center text-zinc-400 hover:text-[#34d399] transition-colors active:scale-95"
              aria-label="Πίσω"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          <h2 className="text-[20px] font-bold text-white truncate">{title}</h2>
        </div>
        <button
          onClick={() => {
            hapticFeedback('light')
            onClose()
          }}
          className="p-2 rounded-full bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center text-zinc-400 hover:text-[#34d399] transition-colors active:scale-95 flex-shrink-0 ml-2"
          aria-label="Κλείσιμο"
        >
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-5 hide-scrollbar safe-bottom">
        {children}
      </div>
    </div>
  )
}
