'use client'

import { useState } from 'react'
import { Plus, Trash2, Receipt, ShoppingCart, Store, Settings, Pencil, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { GreekDatePicker } from '@/components/greek-date-picker'
import { FullscreenModal } from '@/components/fullscreen-modal'
import { CanteenCatalogManager } from '@/components/canteen-catalog-manager'
import { hapticFeedback, formatGreekDate, generateId, toLocalDateString } from '@/lib/helpers'
import type { ExpenseEntry, CanteenCatalogItem } from '@/lib/types'
import { EXPENSE_CATEGORY_LABELS, CANTEEN_CATEGORY_LABELS } from '@/lib/types'

export function ExpensesTab() {
  const [expenses, setExpenses] = useLocalStorage<ExpenseEntry[]>('fantaros-expenses', [])
  const [canteenCatalog, setCanteenCatalog] = useLocalStorage<CanteenCatalogItem[]>('fantaros-canteen-catalog', [])
  const [showAdd, setShowAdd] = useState(false)
  const [showCatalogManager, setShowCatalogManager] = useState(false)

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
                setShowCatalogManager(true)
              }}
              className="p-3 rounded-xl glass-card min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Διαχείριση καταλόγου Κ.Ψ.Μ."
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

          {/* Catalog Manager Modal */}
          <FullscreenModal
            isOpen={showCatalogManager}
            onClose={() => setShowCatalogManager(false)}
            title="Κ.Ψ.Μ. Κατάλογος"
          >
            <CanteenCatalogManager
              items={canteenCatalog}
              onSave={(updated) => {
                setCanteenCatalog(updated)
                setShowCatalogManager(false)
              }}
              onCancel={() => setShowCatalogManager(false)}
            />
          </FullscreenModal>

          {/* Add Expense Modal */}
          <FullscreenModal
            isOpen={showAdd}
            onClose={() => setShowAdd(false)}
            title="Νέο Έξοδο"
          >
            <AddExpenseForm
              canteenCatalog={canteenCatalog}
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

interface AddExpenseFormProps {
  canteenCatalog: CanteenCatalogItem[]
  onAdd: (expense: ExpenseEntry) => void
  onCancel: () => void
}

function AddExpenseForm({ canteenCatalog, onAdd, onCancel }: AddExpenseFormProps) {
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(toLocalDateString())
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<'canteen' | 'other'>('canteen')
  const [selectedCatalogCategory, setSelectedCatalogCategory] = useState<'food' | 'beverage' | 'snack' | 'other' | null>(null)

  // Filter catalog items by selected category
  const catalogItemsInCategory = selectedCatalogCategory
    ? canteenCatalog.filter((item) => item.category === selectedCatalogCategory)
    : []

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

  const handleSelectCatalogItem = (item: CanteenCatalogItem) => {
    hapticFeedback('light')
    setAmount(item.price.toFixed(2))
    setDescription(item.name)
    setSelectedCatalogCategory(null)
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="block text-xs text-muted-foreground mb-1.5">Κατηγορία Εξόδου</label>
        <div className="flex gap-2">
          {(['canteen', 'other'] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => {
                hapticFeedback('light')
                setCategory(c)
                setSelectedCatalogCategory(null)
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

      {/* Canteen Catalog Selection */}
      {category === 'canteen' && canteenCatalog.length > 0 && (
        <div>
          <label className="block text-xs text-muted-foreground mb-1.5">Κατάλογος Κ.Ψ.Μ.</label>
          
          {selectedCatalogCategory === null ? (
            // Show categories
            <div className="flex flex-col gap-2">
              {(['food', 'beverage', 'snack', 'other'] as const).map((cat) => {
                const itemsInCat = canteenCatalog.filter((item) => item.category === cat)
                if (itemsInCat.length === 0) return null
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      hapticFeedback('light')
                      setSelectedCatalogCategory(cat)
                    }}
                    className="glass-card rounded-xl p-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{CANTEEN_CATEGORY_LABELS[cat]}</span>
                      <span className="text-xs text-muted-foreground">({itemsInCat.length})</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                )
              })}
            </div>
          ) : (
            // Show items in selected category
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  hapticFeedback('light')
                  setSelectedCatalogCategory(null)
                }}
                className="text-xs text-primary underline underline-offset-2 text-left py-2"
              >
                ← Επιστροφή στις κατηγορίες
              </button>
              {catalogItemsInCategory.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectCatalogItem(item)}
                  className={cn(
                    'glass-card rounded-xl p-3 flex items-center justify-between',
                    description === item.name && amount === item.price.toFixed(2)
                      ? 'ring-2 ring-primary'
                      : ''
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold text-foreground">{item.price.toFixed(2)}€</span>
                </button>
              ))}
            </div>
          )}
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
