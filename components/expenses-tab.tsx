'use client'

import { useState } from 'react'
import { Plus, Trash2, Receipt, ShoppingCart, Store, Settings, Pencil } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { GreekDatePicker } from '@/components/greek-date-picker'
import { FullscreenModal } from '@/components/fullscreen-modal'
import { hapticFeedback, formatGreekDate, generateId, toLocalDateString } from '@/lib/helpers'
import type { ExpenseEntry, ExpensePreset } from '@/lib/types'
import { EXPENSE_CATEGORY_LABELS, DEFAULT_EXPENSE_PRESETS } from '@/lib/types'

export function ExpensesTab() {
  const [expenses, setExpenses] = useLocalStorage<ExpenseEntry[]>('fantaros-expenses', [])
  const [presets, setPresets] = useLocalStorage<ExpensePreset[]>('fantaros-expense-presets', DEFAULT_EXPENSE_PRESETS)
  const [showAdd, setShowAdd] = useState(false)
  const [showPresets, setShowPresets] = useState(false)

  const canteenTotal = expenses
    .filter((e) => e.category === 'canteen')
    .reduce((sum, e) => sum + e.amount, 0)
  const otherTotal = expenses
    .filter((e) => e.category === 'other')
    .reduce((sum, e) => sum + e.amount, 0)
  const grandTotal = canteenTotal + otherTotal

  return (
    <div className="flex flex-col h-full">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-background px-4 pt-4 pb-3 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Έξοδα</h1>
            <p className="text-xs text-muted-foreground">Παρακολούθηση δαπανών</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                hapticFeedback('light')
                setShowPresets(true)
              }}
              className="p-3 rounded-xl glass-card min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Ρυθμίσεις γρήγορων επιλογών"
            >
              <Settings className="h-5 w-5 text-muted-foreground" />
            </button>
            <button
              onClick={() => {
                hapticFeedback('light')
                setShowAdd(true)
              }}
              className="p-3 rounded-xl glass-card min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Προσθήκη εξόδου"
            >
              <Plus className="h-5 w-5 text-primary" />
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-28">
      <div className="flex flex-col gap-4 pt-4">

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card rounded-xl p-3 flex flex-col items-center gap-1">
          <Store className="h-4 w-4 text-primary" />
          <span className="text-[10px] text-muted-foreground">ΚΨΜ</span>
          <span className="text-base font-bold text-foreground">{canteenTotal.toFixed(2)}</span>
        </div>
        <div className="glass-card rounded-xl p-3 flex flex-col items-center gap-1">
          <ShoppingCart className="h-4 w-4 text-chart-2" />
          <span className="text-[10px] text-muted-foreground">Γενικά</span>
          <span className="text-base font-bold text-foreground">{otherTotal.toFixed(2)}</span>
        </div>
        <div className="glass-card rounded-xl p-3 flex flex-col items-center gap-1">
          <Receipt className="h-4 w-4 text-chart-3" />
          <span className="text-[10px] text-muted-foreground">Σύνολο</span>
          <span className="text-base font-bold text-primary">{grandTotal.toFixed(2)}</span>
        </div>
      </div>

      {/* Presets Management Modal */}
      <FullscreenModal
        isOpen={showPresets}
        onClose={() => setShowPresets(false)}
        title="Γρήγορες Επιλογές"
      >
        <ManagePresetsForm
          presets={presets}
          onSave={(updated) => {
            setPresets(updated)
            setShowPresets(false)
          }}
          onCancel={() => setShowPresets(false)}
        />
      </FullscreenModal>

      {/* Add Expense Modal */}
      <FullscreenModal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        title="Νέο Έξοδο"
      >
        <AddExpenseForm
          presets={presets}
          onAdd={(expense) => {
            setExpenses([expense, ...expenses])
            setShowAdd(false)
          }}
          onCancel={() => setShowAdd(false)}
        />
      </FullscreenModal>

      {/* Expense List */}
      {expenses.length === 0 ? (
        <div className="glass-card rounded-xl p-6 text-center">
          <Receipt className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Δεν υπάρχουν έξοδα</p>
          <p className="text-xs text-muted-foreground mt-1">Πάτησε + για καταχώρηση</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {expenses
            .sort((a, b) => b.date.localeCompare(a.date))
            .map((expense) => (
              <div key={expense.id} className="glass-card rounded-xl p-3 flex items-center gap-3">
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                  expense.category === 'canteen' ? 'bg-primary/20' : 'bg-chart-2/20'
                )}>
                  {expense.category === 'canteen' ? (
                    <Store className="h-5 w-5 text-primary" />
                  ) : (
                    <ShoppingCart className="h-5 w-5 text-chart-2" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground truncate">
                      {expense.description || EXPENSE_CATEGORY_LABELS[expense.category]}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {formatGreekDate(expense.date)} &middot; {EXPENSE_CATEGORY_LABELS[expense.category]}
                  </p>
                </div>
                <span className="text-sm font-bold text-foreground flex-shrink-0">
                  {expense.amount.toFixed(2)} {'€'}
                </span>
                <button
                  onClick={() => {
                    hapticFeedback('medium')
                    setExpenses(expenses.filter((e) => e.id !== expense.id))
                  }}
                  className="p-2 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center text-destructive flex-shrink-0"
                  aria-label="Διαγραφή"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
        </div>
      )}
    </div>
    </div>
    </div>
  )
}

function AddExpenseForm({ presets, onAdd, onCancel }: {
  presets: ExpensePreset[]
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
    onAdd({
      id: generateId(),
      amount: parsed,
      date,
      description,
      category,
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="block text-xs text-muted-foreground mb-1.5">Κατηγορία</label>
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
                'flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium min-h-[44px] transition-colors',
                category === c
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground'
              )}
            >
              {c === 'canteen' ? <Store className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
              {EXPENSE_CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Presets */}
      {presets.length > 0 && (
        <div>
          <label className="block text-xs text-muted-foreground mb-1.5">Γρήγορη επιλογή</label>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  hapticFeedback('light')
                  setAmount(preset.amount.toFixed(2))
                  setDescription(preset.label)
                }}
                className={cn(
                  'px-3 py-2 rounded-lg text-xs font-medium min-h-[40px] transition-colors border',
                  description === preset.label && amount === preset.amount.toFixed(2)
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-secondary text-secondary-foreground border-border'
                )}
              >
                {preset.label} {preset.amount.toFixed(2)}{'€'}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="block text-xs text-muted-foreground mb-1.5">{'Ποσό (€)'}</label>
        <input
          type="number"
          inputMode="decimal"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          className="w-full px-3 py-3 rounded-lg bg-secondary text-secondary-foreground text-sm min-h-[48px] border border-border placeholder:text-muted-foreground"
        />
      </div>

      <GreekDatePicker value={date} onChange={setDate} label="Ημερομηνία" />

      <div>
        <label className="block text-xs text-muted-foreground mb-1.5">Περιγραφή</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Π.χ. Καφές, Σνακ..."
          className="w-full px-3 py-3 rounded-lg bg-secondary text-secondary-foreground text-sm min-h-[48px] border border-border placeholder:text-muted-foreground"
        />
      </div>

      <div className="flex gap-2 pt-2">
        <button
          onClick={onCancel}
          className="flex-1 py-3 rounded-lg bg-secondary text-secondary-foreground font-medium text-sm min-h-[48px]"
        >
          Ακύρωση
        </button>
        <button
          onClick={handleSubmit}
          disabled={!amount || !date}
          className="flex-1 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm min-h-[48px] disabled:opacity-40"
        >
          Προσθήκη
        </button>
      </div>
    </div>
  )
}

function ManagePresetsForm({ presets, onSave, onCancel }: {
  presets: ExpensePreset[]
  onSave: (presets: ExpensePreset[]) => void
  onCancel: () => void
}) {
  const [items, setItems] = useState<ExpensePreset[]>(presets)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editLabel, setEditLabel] = useState('')
  const [editAmount, setEditAmount] = useState('')
  const [newLabel, setNewLabel] = useState('')
  const [newAmount, setNewAmount] = useState('')

  const startEdit = (preset: ExpensePreset) => {
    hapticFeedback('light')
    setEditingId(preset.id)
    setEditLabel(preset.label)
    setEditAmount(preset.amount.toFixed(2))
  }

  const confirmEdit = () => {
    const parsed = parseFloat(editAmount)
    if (!editLabel.trim() || isNaN(parsed) || parsed <= 0) return
    setItems(items.map((p) =>
      p.id === editingId ? { ...p, label: editLabel.trim(), amount: parsed } : p
    ))
    setEditingId(null)
    setEditLabel('')
    setEditAmount('')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditLabel('')
    setEditAmount('')
  }

  const handleDelete = (id: string) => {
    hapticFeedback('medium')
    setItems(items.filter((p) => p.id !== id))
  }

  const handleAdd = () => {
    const parsed = parseFloat(newAmount)
    if (!newLabel.trim() || isNaN(parsed) || parsed <= 0) return
    hapticFeedback('light')
    setItems([...items, { id: generateId(), label: newLabel.trim(), amount: parsed }])
    setNewLabel('')
    setNewAmount('')
  }

  const handleReset = () => {
    hapticFeedback('medium')
    setItems(DEFAULT_EXPENSE_PRESETS)
    setEditingId(null)
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-muted-foreground">
        Προσαρμόστε τις γρήγορες επιλογές ανάλογα με τις τιμές της μονάδας σας.
      </p>

      {/* Existing presets list */}
      <div className="flex flex-col gap-2">
        {items.map((preset) => (
          <div key={preset.id} className="glass-card rounded-xl p-3">
            {editingId === preset.id ? (
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    placeholder="Ονομασία"
                    className="flex-1 px-3 py-2.5 rounded-lg bg-secondary text-secondary-foreground text-sm min-h-[44px] border border-border placeholder:text-muted-foreground"
                  />
                  <div className="relative w-28">
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3 py-2.5 rounded-lg bg-secondary text-secondary-foreground text-sm min-h-[44px] border border-border placeholder:text-muted-foreground pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{'€'}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={cancelEdit}
                    className="flex-1 py-2 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium min-h-[40px]"
                  >
                    Ακύρωση
                  </button>
                  <button
                    onClick={confirmEdit}
                    disabled={!editLabel.trim() || !editAmount || parseFloat(editAmount) <= 0}
                    className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold min-h-[40px] disabled:opacity-40"
                  >
                    Ενημέρωση
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-foreground">{preset.label}</span>
                  <span className="text-xs text-muted-foreground ml-2">{preset.amount.toFixed(2)}{'€'}</span>
                </div>
                <button
                  onClick={() => startEdit(preset)}
                  className="p-2 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center text-muted-foreground"
                  aria-label={`Επεξεργασία ${preset.label}`}
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(preset.id)}
                  className="p-2 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center text-destructive"
                  aria-label={`Διαγραφή ${preset.label}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        ))}

        {items.length === 0 && (
          <div className="glass-card rounded-xl p-4 text-center">
            <p className="text-sm text-muted-foreground">Δεν υπάρχουν γρήγορες επιλογές</p>
          </div>
        )}
      </div>

      {/* Add new preset */}
      <div className="glass-card rounded-xl p-3">
        <label className="block text-xs text-muted-foreground mb-2">Προσθήκη νέας επιλογής</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="Ονομασία"
            className="flex-1 px-3 py-2.5 rounded-lg bg-secondary text-secondary-foreground text-sm min-h-[44px] border border-border placeholder:text-muted-foreground"
          />
          <div className="relative w-24">
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2.5 rounded-lg bg-secondary text-secondary-foreground text-sm min-h-[44px] border border-border placeholder:text-muted-foreground pr-8"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{'€'}</span>
          </div>
          <button
            onClick={handleAdd}
            disabled={!newLabel.trim() || !newAmount || parseFloat(newAmount) <= 0}
            className="p-2.5 rounded-lg bg-primary text-primary-foreground min-h-[44px] min-w-[44px] flex items-center justify-center disabled:opacity-40"
            aria-label="Προσθήκη"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Reset to defaults */}
      <button
        onClick={handleReset}
        className="text-xs text-muted-foreground underline underline-offset-2 text-center py-2 min-h-[44px]"
      >
        Επαναφορά προεπιλογών
      </button>

      {/* Save / Cancel */}
      <div className="flex gap-2 pt-2">
        <button
          onClick={onCancel}
          className="flex-1 py-3 rounded-lg bg-secondary text-secondary-foreground font-medium text-sm min-h-[48px]"
        >
          Ακύρωση
        </button>
        <button
          onClick={() => {
            hapticFeedback('heavy')
            onSave(items)
          }}
          className="flex-1 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm min-h-[48px]"
        >
          Αποθήκευση
        </button>
      </div>
    </div>
  )
}
