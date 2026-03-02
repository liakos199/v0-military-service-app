'use client'

import { useState } from 'react'
import { Plus, Trash2, Receipt, ShoppingCart, Store } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { GreekDatePicker } from '@/components/greek-date-picker'
import { BottomSheet } from '@/components/bottom-sheet'
import { hapticFeedback, formatGreekDate, generateId, toLocalDateString } from '@/lib/helpers'
import type { ExpenseEntry } from '@/lib/types'
import { EXPENSE_CATEGORY_LABELS, EXPENSE_PRESETS } from '@/lib/types'

export function ExpensesTab() {
  const [expenses, setExpenses] = useLocalStorage<ExpenseEntry[]>('fantaros-expenses', [])
  const [showAdd, setShowAdd] = useState(false)

  const canteenTotal = expenses
    .filter((e) => e.category === 'canteen')
    .reduce((sum, e) => sum + e.amount, 0)
  const otherTotal = expenses
    .filter((e) => e.category === 'other')
    .reduce((sum, e) => sum + e.amount, 0)
  const grandTotal = canteenTotal + otherTotal

  return (
    <div className="flex flex-col gap-5 pb-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground text-balance">Έξοδα</h1>
          <p className="text-xs text-muted-foreground">Παρακολούθηση δαπανών</p>
        </div>
        <button
          onClick={() => {
            hapticFeedback('light')
            setShowAdd(true)
          }}
          className="p-3 rounded-xl glass-card min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95 transition-transform"
          aria-label="Προσθήκη εξόδου"
        >
          <Plus className="h-5 w-5 text-primary" />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-2.5">
        <SummaryCard
          icon={Store}
          label="ΚΨΜ"
          value={canteenTotal.toFixed(2)}
          color="text-primary"
          bgColor="bg-primary/10 border-primary/20"
        />
        <SummaryCard
          icon={ShoppingCart}
          label="Γενικά"
          value={otherTotal.toFixed(2)}
          color="text-chart-2"
          bgColor="bg-chart-2/10 border-chart-2/20"
        />
        <SummaryCard
          icon={Receipt}
          label="Σύνολο"
          value={grandTotal.toFixed(2)}
          color="text-primary"
          bgColor="bg-primary/10 border-primary/20"
          highlight
        />
      </div>

      {/* Add Expense Bottom Sheet */}
      <BottomSheet
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        title="Νέο Έξοδο"
        size="full"
      >
        <AddExpenseForm
          onAdd={(expense) => {
            setExpenses([expense, ...expenses])
            setShowAdd(false)
          }}
          onCancel={() => setShowAdd(false)}
        />
      </BottomSheet>

      {/* Expense List */}
      {expenses.length === 0 ? (
        <div className="glass-card rounded-2xl p-8 text-center">
          <Receipt className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-medium text-muted-foreground/70">Δεν υπάρχουν έξοδα</p>
          <p className="text-xs text-muted-foreground/50 mt-1">Πάτησε + για καταχώρηση</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {expenses
            .sort((a, b) => b.date.localeCompare(a.date))
            .map((expense) => (
              <div key={expense.id} className="glass-card rounded-2xl p-3.5 flex items-center gap-3">
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                  expense.category === 'canteen' ? 'bg-primary/15' : 'bg-chart-2/15'
                )}>
                  {expense.category === 'canteen' ? (
                    <Store className="h-5 w-5 text-primary" />
                  ) : (
                    <ShoppingCart className="h-5 w-5 text-chart-2" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-bold text-foreground truncate block">
                    {expense.description || EXPENSE_CATEGORY_LABELS[expense.category]}
                  </span>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {formatGreekDate(expense.date)}
                  </p>
                </div>
                <span className="text-sm font-black text-foreground tabular-nums flex-shrink-0">
                  {expense.amount.toFixed(2)}{'€'}
                </span>
                <button
                  onClick={() => {
                    hapticFeedback('medium')
                    setExpenses(expenses.filter((e) => e.id !== expense.id))
                  }}
                  className="p-2.5 rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center text-destructive/70 active:text-destructive active:bg-destructive/10 transition-colors flex-shrink-0"
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

function SummaryCard({ icon: Icon, label, value, color, bgColor, highlight }: {
  icon: typeof Store
  label: string
  value: string
  color: string
  bgColor: string
  highlight?: boolean
}) {
  return (
    <div className={cn('glass-card rounded-2xl p-3 flex flex-col items-center gap-1.5 border', bgColor)}>
      <Icon className={cn('h-4 w-4', color)} />
      <span className="text-[10px] text-muted-foreground font-medium">{label}</span>
      <span className={cn('text-base font-black tabular-nums', highlight ? color : 'text-foreground')}>{value}</span>
    </div>
  )
}

function AddExpenseForm({ onAdd, onCancel }: {
  onAdd: (expense: ExpenseEntry) => void
  onCancel: () => void
}) {
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
        <label className="block text-[11px] text-muted-foreground font-medium mb-2 uppercase tracking-wider">Κατηγορία</label>
        <div className="flex gap-2">
          {(['canteen', 'other'] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => {
                hapticFeedback('light')
                setCategory(c)
              }}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 px-3.5 py-3 rounded-xl text-xs font-semibold min-h-[48px] transition-all border',
                category === c
                  ? 'bg-primary text-primary-foreground border-primary scale-[1.02]'
                  : 'bg-secondary text-secondary-foreground border-border active:scale-95'
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
        <label className="block text-[11px] text-muted-foreground font-medium mb-2 uppercase tracking-wider">Γρήγορη επιλογή</label>
        <div className="flex flex-wrap gap-2">
          {EXPENSE_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                hapticFeedback('light')
                setAmount(preset.amount.toFixed(2))
                setDescription(preset.label)
              }}
              className={cn(
                'px-3.5 py-2.5 rounded-xl text-xs font-semibold min-h-[44px] transition-all border',
                description === preset.label && amount === preset.amount.toFixed(2)
                  ? 'bg-primary text-primary-foreground border-primary scale-105'
                  : 'bg-secondary text-secondary-foreground border-border active:scale-95'
              )}
            >
              {preset.label} {preset.amount.toFixed(2)}{'€'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-[11px] text-muted-foreground font-medium mb-1.5 uppercase tracking-wider">{'Ποσό (€)'}</label>
        <input
          type="number"
          inputMode="decimal"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          className="w-full px-3 py-3 rounded-xl bg-secondary text-secondary-foreground text-sm min-h-[48px] border border-border placeholder:text-muted-foreground tabular-nums"
        />
      </div>

      <GreekDatePicker value={date} onChange={setDate} label="Ημερομηνία" />

      <div>
        <label className="block text-[11px] text-muted-foreground font-medium mb-1.5 uppercase tracking-wider">Περιγραφή</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Π.χ. Καφές, Σνακ..."
          className="w-full px-3 py-3 rounded-xl bg-secondary text-secondary-foreground text-sm min-h-[48px] border border-border placeholder:text-muted-foreground"
        />
      </div>

      <div className="flex gap-2.5 pt-2">
        <button
          onClick={onCancel}
          className="flex-1 py-3.5 rounded-xl bg-secondary text-secondary-foreground font-semibold text-sm min-h-[52px] active:scale-[0.97] transition-transform"
        >
          Ακύρωση
        </button>
        <button
          onClick={handleSubmit}
          disabled={!amount || !date}
          className="flex-1 py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm min-h-[52px] disabled:opacity-40 active:scale-[0.97] transition-transform"
        >
          Προσθήκη
        </button>
      </div>
    </div>
  )
}
