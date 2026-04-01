export function DeleteConfirmDialog({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 z-[9999] bg-black/75 flex items-end justify-center pb-8 px-4">
      <div className="bg-zinc-900 border border-zinc-700/50 rounded-[2rem] w-full max-w-sm shadow-2xl p-6 flex flex-col gap-5">
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
    </div>
  )
}
