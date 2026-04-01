'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { ModalLayout } from '@/components/modal-layout'

export function DeleteConfirmDialog({
  onConfirm,
  onCancel,
  title = "Διαγραφή καταχώρησης;",
  description = "Αυτή η ενέργεια δεν μπορεί να αναιρεθεί."
}: {
  onConfirm: () => void
  onCancel: () => void
  title?: string
  description?: string
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  if (!mounted) return null

  const header = (
    <div className="text-center px-6 pt-6 pb-4 border-b border-zinc-700/50">
      <p className="text-white font-bold text-[16px] mb-1">{title}</p>
      <p className="text-zinc-400 text-[12px]">{description}</p>
    </div>
  )

  const footer = (
    <div className="flex gap-3 px-6 py-5">
      <button
        onClick={onCancel}
        className="flex-1 py-3.5 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 font-bold text-[11px] uppercase tracking-widest hover:bg-zinc-700 transition-colors active:scale-95"
      >
        Ακύρωση
      </button>
      <button
        onClick={onConfirm}
        className="flex-1 py-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold text-[11px] uppercase tracking-widest hover:bg-red-500/20 transition-colors active:scale-95"
      >
        Διαγραφή
      </button>
    </div>
  )

  return createPortal(
    <div className="fixed inset-0 z-[10000] bg-black/75 flex items-end justify-center pb-8 px-4 animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-700/50 rounded-[2rem] w-full max-w-sm shadow-2xl flex flex-col animate-in slide-in-from-bottom-4 duration-300 max-h-[80vh]">
        <ModalLayout
          header={header}
          footer={footer}
          contentClassName="px-6 py-5"
        >
          {/* Empty content - this is a confirmation dialog */}
          <div />
        </ModalLayout>
      </div>
    </div>,
    document.body
  )
}
