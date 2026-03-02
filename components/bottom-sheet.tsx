'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { cn } from '@/lib/utils'
import { hapticFeedback } from '@/lib/helpers'

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  /** Height of the sheet: 'auto' fits content, 'full' takes ~92vh */
  size?: 'auto' | 'full'
}

export function BottomSheet({ isOpen, onClose, title, children, size = 'auto' }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const startY = useRef(0)
  const currentY = useRef(0)
  const isDragging = useRef(false)

  const open = useCallback(() => {
    setIsVisible(true)
    // Force reflow then animate
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsAnimating(true)
      })
    })
    document.body.style.overflow = 'hidden'
  }, [])

  const close = useCallback(() => {
    setIsAnimating(false)
    const timer = setTimeout(() => {
      setIsVisible(false)
      document.body.style.overflow = ''
      onClose()
    }, 300)
    return () => clearTimeout(timer)
  }, [onClose])

  useEffect(() => {
    if (isOpen) {
      open()
    } else if (isVisible) {
      close()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  useEffect(() => {
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // Only allow drag from the handle area (top 48px of sheet)
    const touch = e.touches[0]
    const sheetTop = sheetRef.current?.getBoundingClientRect().top ?? 0
    if (touch.clientY - sheetTop > 48) return

    startY.current = touch.clientY
    isDragging.current = true
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current || !sheetRef.current) return
    const delta = e.touches[0].clientY - startY.current
    if (delta < 0) return // Don't allow dragging up
    currentY.current = delta
    sheetRef.current.style.transform = `translateY(${delta}px)`
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (!isDragging.current || !sheetRef.current) return
    isDragging.current = false

    if (currentY.current > 100) {
      hapticFeedback('light')
      close()
    } else {
      sheetRef.current.style.transform = ''
    }
    currentY.current = 0
  }, [close])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-[100]" aria-modal="true" role="dialog">
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className={cn(
          'absolute inset-0 bg-black/60 transition-opacity duration-300',
          isAnimating ? 'opacity-100' : 'opacity-0'
        )}
        onClick={() => {
          hapticFeedback('light')
          close()
        }}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={cn(
          'absolute bottom-0 left-0 right-0 bg-card rounded-t-3xl transition-transform duration-300 ease-out will-change-transform',
          size === 'full' ? 'max-h-[92dvh]' : 'max-h-[85dvh]',
          isAnimating ? 'translate-y-0' : 'translate-y-full'
        )}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
        </div>

        {/* Title */}
        {title && (
          <div className="px-5 pb-3 pt-1">
            <h2 className="text-base font-bold text-foreground">{title}</h2>
          </div>
        )}

        {/* Content */}
        <div className={cn(
          'overflow-y-auto overscroll-contain no-scrollbar',
          size === 'full' ? 'max-h-[calc(92dvh-56px)]' : 'max-h-[calc(85dvh-56px)]',
          'px-5 pb-8'
        )}>
          {children}
        </div>
      </div>
    </div>
  )
}
