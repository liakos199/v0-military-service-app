'use client'

import { useEffect, useState, createContext, useContext } from 'react'
import { createPortal } from 'react-dom'
import { X, ChevronLeft } from 'lucide-react'
import { hapticFeedback } from '@/lib/helpers'
import { ModalLayout } from '@/components/modal-layout'

export const ModalFooterContext = createContext<HTMLDivElement | null>(null)

export function ModalFooter({ children }: { children: React.ReactNode }) {
  const footerNode = useContext(ModalFooterContext)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !footerNode) return null
  return createPortal(children, footerNode)
}

interface FullscreenModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
  showBackButton?: boolean
  onBack?: () => void
  contentClassName?: string
}

export function FullscreenModal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer, 
  showBackButton = false, 
  onBack,
  contentClassName = "px-6 py-5 pb-safe"
}: FullscreenModalProps) {
  const [mounted, setMounted] = useState(false)
  const [footerNode, setFooterNode] = useState<HTMLDivElement | null>(null)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

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

  if (!isOpen || !mounted) return null

  const header = (
    <div className="flex items-center justify-between px-6 py-6 border-b border-zinc-800/80 bg-zinc-950">
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
        <h2 className="text-[18px] font-bold text-white truncate">{title}</h2>
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
  )

  return createPortal(
    <div className="fixed inset-0 z-[400] bg-black flex flex-col">
      <ModalLayout
        header={header}
        footer={
          <div className="w-full relative">
            {footer}
            <div ref={setFooterNode} />
          </div>
        }
        contentClassName={contentClassName}
      >
        <ModalFooterContext.Provider value={footerNode} >
          {children}
        </ModalFooterContext.Provider>
      </ModalLayout>
    </div>,
    document.body
  )
}
