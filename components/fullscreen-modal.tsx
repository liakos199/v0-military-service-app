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
    <div className="fixed inset-0 z-[100] bg-background">
      <div className="flex flex-col h-full safe-top">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          <button
            onClick={() => {
              hapticFeedback('light')
              onClose()
            }}
            className="p-2.5 rounded-xl bg-secondary min-h-[44px] min-w-[44px] flex items-center justify-center text-muted-foreground transition-colors"
            aria-label="Κλείσιμο"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div
          ref={contentRef}
          className="flex-1 overflow-y-auto px-5 py-5 no-scrollbar"
        >
          {children}
        </div>
      </div>
    </div>
  )
}
