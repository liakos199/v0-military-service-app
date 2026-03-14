'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
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
      className="fixed inset-0 z-[90] bg-black backdrop-blur-sm animate-fade-in flex flex-col"
      onClick={() => {
        hapticFeedback('light')
        onClose()
      }}
    >
      <div
        className="flex-1 flex flex-col w-full h-full safe-top safe-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-zinc-800/80 shrink-0">
          <div className="flex-1">
            {title && (
              <h2 className="text-[20px] font-bold text-white">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-[13px] text-zinc-500 font-bold tracking-[0.1em] uppercase mt-1">
                {subtitle}
              </p>
            )}
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
        <div className="flex-1 overflow-y-auto px-6 py-5 hide-scrollbar">
          <div className="flex flex-col gap-3">
            {children}
          </div>
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
      className={`flex items-center gap-4 p-4 rounded-[1.25rem] min-h-[60px] transition-all active:scale-[0.98] border ${
        variant === 'destructive'
          ? 'bg-red-500/10 border-red-500/20 hover:bg-red-500/20 text-red-400'
          : 'bg-gradient-to-br from-zinc-800 to-zinc-900/90 border-zinc-700/40 hover:border-[#34d399]/30 text-white'
      }`}
    >
      {icon && (
        <div className={`flex-shrink-0 ${variant === 'destructive' ? 'text-red-400' : 'text-[#34d399]'}`}>
          {icon}
        </div>
      )}
      <div className="flex-1 text-left">
        <p className="text-[15px] font-bold">{title}</p>
        {subtitle && (
          <p className="text-[11px] text-zinc-500 mt-0.5 font-medium">{subtitle}</p>
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
      className="py-4 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 font-bold text-[12px] min-h-[48px] mt-2 hover:bg-zinc-800 hover:text-white transition-colors uppercase tracking-widest"
    >
      Ακύρωση
    </button>
  )
}
