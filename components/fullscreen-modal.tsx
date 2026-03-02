'use client'

import { BottomSheet } from '@/components/bottom-sheet'

interface FullscreenModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

/**
 * FullscreenModal is now a bottom-sheet wrapper for backward compatibility.
 * All existing usages (ServiceTab, NotesTab, ProfileTab, ExpensesTab, CalendarTab, GreekDatePicker)
 * automatically get the new slide-up-from-bottom behavior.
 */
export function FullscreenModal({ isOpen, onClose, title, children }: FullscreenModalProps) {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={title} size="full">
      {children}
    </BottomSheet>
  )
}
