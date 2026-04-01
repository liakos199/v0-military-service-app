'use client'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

export function DeleteConfirmDialog({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void
  onCancel: () => void
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return createPortal(
    <div className="fixed inset-0 bg-black/75 flex items-end justify-center pb-8 px-4 pointer-events-auto" style={{ zIndex: 99999 }}>
      <div className="bg-zinc-900 border border-zinc-700/50 rounded-[2rem] w-full max-w-sm shadow-2xl p-6 flex flex-col gap-5 mb-24 relative" style={{ zIndex: 100000 }}>
        <div className="text-center">
          <p className="text-white font-bold text-[16px] mb-1">Διαγραφή καταχώρησης;</p>
          <p className="text-zinc-400 text-[12px]">Αυτή η ενέργεια δεν μπορεί να αναιρεθεί.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3.5 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 font-bold text-[11px] uppercase tracking-widest hover:bg-zinc-700 transition-colors"
          >
            Ακύρωση
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold text-[11px] uppercase tracking-widest hover:bg-red-500/20 transition-colors"
          >
            Διαγραφή
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
