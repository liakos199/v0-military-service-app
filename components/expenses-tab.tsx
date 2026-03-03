'use client'

import { useState } from 'react'
import { Plus, Trash2, Receipt, ShoppingCart, Store } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { GreekDatePicker } from '@/components/greek-date-picker'
import { FullscreenModal } from '@/components/fullscreen-modal'
import { hapticFeedback, formatGreekDate, generateId, toLocalDateString } from '@/lib/helpers'
import type { ExpenseEntry } from '@/lib/types'
import { EXPENSE_CATEGORY_LABELS, EXPENSE_PRESETS } from '@/lib/types'

export function ExpensesTab() {
  const [expenses, setExpenses] = useLocalStorage<ExpenseEntry[]>('fantaros-expenses', [])
  const [showAdd, setShowAdd] = useState(false)

  const canteenTotal = expenses.filter((e) => e.category === 'canteen').reduce((sum, e) => sum + e.amount, 0)
  const otherTotal = expenses.filter((e) => e.category === 'other').reduce((sum, e) => sum + e.amount, 0)
  const grandTotal = canteenTotal + otherTotal

  return (
    <div className="flex flex-col gap-5 pb-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gradient">Έξοδα</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Παρακολούθηση δαπανών</p>
        </div>
        <button
          onClick={() => { hapticFeedback('light'); setShowAdd(true) }}
          className="p-3 rounded-2xl glass-card min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95 transition-transform"
          aria-label="Προσθήκη εξόδου"
        >
          <Plus className="h-5 w-5 text-primary" />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="glass-card rounded-2xl p-3.5 flex flex-col items-center gap-1.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--gradient-primary)' }}>
            <Store className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold">ΚΨΜ</span>
          <span className="text-lg font-black text-foreground">{canteenTotal.toFixed(2)}</span>
        </div>
        <div className="glass-card rounded-2xl p-3.5 flex flex-col items-center gap-1.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--gradient-accent-teal)' }}>
            <ShoppingCart className="h-4 w-4 text-foreground" />
          </div>
          <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold">Γενικά</span>
          <span className="text-lg font-black text-foreground">{otherTotal.toFixed(2)}</span>
        </div>
        <div className="glass-card rounded-2xl p-3.5 flex flex-col items-center gap-1.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--gradient-accent-warm)' }}>
            <Receipt className="h-4 w-4 text-foreground" />
          </div>
          <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold">Σύνολο</span>
          <span className="text-lg font-black text-gradient">{grandTotal.toFixed(2)}</span>
        </div>
      </div>

      {/* Add Expense Modal */}
      <FullscreenModal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Νέο Έξοδο">
        <AddExpenseForm
          onAdd={(expense) => { setExpenses([expense, ...expenses]); setShowAdd(false) }}
          onCancel={() => setShowAdd(false)}
        />
      </FullscreenModal>

      {/* Expense List */}
      {expenses.length === 0 ? (
        <div className="glass-card rounded-2xl p-6 text-center">
          <Receipt className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
          <p className="text-sm text-muted-foreground">Δεν υπάρχουν έξοδα</p>
          <p className="text-xs text-muted-foreground mt-1 opacity-60">Πάτησε + για καταχώρηση</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {expenses
            .sort((a, b) => b.date.localeCompare(a.date))
            .map((expense) => (
              <div key={expense.id} className="glass-card rounded-2xl p-3.5 flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: expense.category === 'canteen' ? 'var(--gradient-primary)' : 'var(--gradient-accent-teal)', opacity: 0.8 }}>
                  {expense.category === 'canteen' ? (
                    <Store className="h-5 w-5 text-primary-foreground" />
                  ) : (
                    <ShoppingCart className="h-5 w-5 text-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-bold text-foreground truncate block">
                    {expense.description || EXPENSE_CATEGORY_LABELS[expense.category]}
                  </span>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {formatGreekDate(expense.date)} &middot; {EXPENSE_CATEGORY_LABELS[expense.category]}
                  </p>
                </div>
                <span className="text-sm font-black text-foreground flex-shrink-0">
                  {expense.amount.toFixed(2)} {'€'}
                </span>
                <button
                  onClick={() => { hapticFeedback('medium'); setExpenses(expenses.filter((e) => e.id !== expense.id)) }}
                  className="p-2.5 rounded-xl bg-destructive/10 min-h-[44px] min-w-[44px] flex items-center justify-center text-destructive flex-shrink-0 active:scale-95 transition-transform"
                  aria-label="Διαγραφή"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}

function AddExpenseForm({ onAdd, onCancel }: { onAdd: (expense: ExpenseEntry) => void; onCancel: () => void }) {
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(toLocalDateString())
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<'canteen' | 'other'>('canteen')

  const handleSubmit = () => {
    const parsed = parseFloat(amount)
    if (!parsed || !date) return
    hapticFeedback('heavy')
    onAdd({ id: generateId(), amount: parsed, date, description, category })
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="block text-xs text-muted-foreground mb-2 font-semibold">Κατηγορία</label>
        <div className="flex gap-2.5">
          {(['canteen', 'other'] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => { hapticFeedback('light'); setCategory(c) }}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold min-h-[44px] transition-all active:scale-95',
                category === c
                  ? 'btn-gradient shadow-[0_2px_10px_oklch(0.80_0.14_75/0.3)]'
                  : 'bg-secondary text-secondary-foreground border border-border/50'
              )}
            >
              {c === 'canteen' ? <Store className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
              {EXPENSE_CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Presets */}
      <div>
        <label className="block text-xs text-muted-foreground mb-2 font-semibold">Γρήγορη επιλογή</label>
        <div className="flex flex-wrap gap-2">
          {EXPENSE_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => { hapticFeedback('light'); setAmount(preset.amount.toFixed(2)); setDescription(preset.label) }}
              className={cn(
                'px-3.5 py-2 rounded-xl text-xs font-bold min-h-[40px] transition-all active:scale-95 border',
                description === preset.label && amount === preset.amount.toFixed(2)
                  ? 'btn-gradient border-transparent shadow-[0_2px_8px_oklch(0.80_0.14_75/0.3)]'
                  : 'bg-secondary text-secondary-foreground border-border/50'
              )}
            >
              {preset.label} {preset.amount.toFixed(2)}{'€'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs text-muted-foreground mb-1.5 font-semibold">{'Ποσό (€)'}</label>
        <input type="number" inputMode="decimal" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00"
          className="w-full px-4 py-3 rounded-xl bg-secondary text-secondary-foreground text-sm min-h-[48px] border border-border/50 placeholder:text-muted-foreground focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all" />
      </div>

      <GreekDatePicker value={date} onChange={setDate} label="Ημερομηνία" />

      <div>
        <label className="block text-xs text-muted-foreground mb-1.5 font-semibold">Περιγραφή</label>
        <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Π.χ. Καφές, Σνακ..."
          className="w-full px-4 py-3 rounded-xl bg-secondary text-secondary-foreground text-sm min-h-[48px] border border-border/50 placeholder:text-muted-foreground focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all" />
      </div>

      <div className="flex gap-2.5 pt-2">
        <button onClick={onCancel} className="flex-1 py-3 rounded-xl bg-secondary text-secondary-foreground font-semibold text-sm min-h-[48px] active:scale-[0.98] transition-transform">
          Ακύρωση
        </button>
        <button onClick={handleSubmit} disabled={!amount || !date}
          className="flex-1 py-3 rounded-xl btn-gradient font-bold text-sm min-h-[48px] disabled:opacity-40 shadow-[0_4px_16px_oklch(0.80_0.14_75/0.3)] active:scale-[0.98] transition-transform">
          Προσθήκη
        </button>
      </div>
    </div>
  )
}
