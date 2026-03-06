'use client'

import { useEffect } from 'react'
import { hapticFeedback } from '@/lib/helpers'

interface ActionSheetProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  subtitle?: string
  children: React.ReactNode
}

export function ActionSheet({ isOpen, onClose, title, subtitle, children }: ActionSheetProps) {
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
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-black/50 backdrop-blur-sm"
      onClick={() => {
        hapticFeedback('light')
        onClose()
      }}
    >
      <div
        className="w-full max-w-lg rounded-t-2xl border-t border-border p-4 pb-6 safe-bottom"
        style={{ background: 'var(--card)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Handle */}
        <div className="flex justify-center mb-3">
          <div className="w-8 h-1 rounded-full bg-muted-foreground/30" />
        </div>

        {/* Header */}
        {(title || subtitle) && (
          <div className="text-center mb-4">
            {title && (
              <p className="text-sm font-semibold text-foreground">
                {title}
              </p>
            )}
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex flex-col gap-2">
          {children}
        </div>
      </div>
    </div>
  )
}

interface ActionSheetItemProps {
  icon?: React.ReactNode
  title: string
  subtitle?: string
  onClick: () => void
  variant?: 'default' | 'destructive'
}

export function ActionSheetItem({ icon, title, subtitle, onClick, variant = 'default' }: ActionSheetItemProps) {
  return (
    <button
      onClick={() => {
        hapticFeedback('light')
        onClick()
      }}
      className={`flex items-center gap-3 p-3 rounded-lg min-h-[48px] transition-colors active:scale-[0.98] ${
        variant === 'destructive'
          ? 'bg-destructive/10 hover:bg-destructive/20 text-destructive'
          : 'bg-secondary hover:bg-secondary/80 text-foreground'
      }`}
    >
      {icon && (
        <div className={`flex-shrink-0 ${variant === 'destructive' ? 'text-destructive' : 'text-muted-foreground'}`}>
          {icon}
        </div>
      )}
      <div className="flex-1 text-left">
        <p className="text-sm font-medium">{title}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>
    </button>
  )
}

export function ActionSheetCancel({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={() => {
        hapticFeedback('light')
        onClick()
      }}
      className="py-2.5 rounded-lg bg-secondary text-muted-foreground font-medium text-sm min-h-[44px] mt-2 hover:bg-secondary/80 transition-colors"
    >
      Ακύρωση
    </button>
  )
}
