'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { GreekDatePicker } from '@/components/greek-date-picker'
import { FullscreenModal } from '@/components/fullscreen-modal'
import { CanteenCatalogManager } from '@/components/canteen-catalog-manager'
import { hapticFeedback, formatGreekDate, generateId, toLocalDateString } from '@/lib/helpers'
import type { ExpenseEntry, CanteenCatalogItem } from '@/lib/types'
import { CANTEEN_CATEGORY_LABELS } from '@/lib/types'

export function ExpensesTab() {
  const [expenses, setExpenses] = useLocalStorage<ExpenseEntry[]>('fantaros-expenses', [])
  const [canteenCatalog, setCanteenCatalog] = useLocalStorage<CanteenCatalogItem[]>('fantaros-canteen-catalog', [])
  const [showAdd, setShowAdd] = useState(false)
  const [showCatalogManager, setShowCatalogManager] = useState(false)

  const grandTotal = expenses.reduce((sum, e) => sum + e.amount, 0)

  return (
    <div className="flex flex-col h-full">
      {/* HEADER - Always Visible */}
      <div className="flex-shrink-0 bg-background px-4 pt-4 pb-3 border-b border-border/50 safe-top">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Έξοδα</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Δαπάνες & καταλόγου</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                hapticFeedback('light')
                setShowCatalogManager(true)
              }}
              className="px-3 py-2 rounded-lg glass-card border border-white/5 text-foreground text-[10px] font-black min-h-[40px] uppercase tracking-wider hover:border-primary transition-colors"
              aria-label="Διαχείριση καταλόγου Κ.Ψ.Μ."
            >
              Κατάλογος
            </button>
            <button
              onClick={() => {
                hapticFeedback('light')
                setShowAdd(true)
              }}
              className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-[10px] font-black min-h-[40px] uppercase tracking-wider hover:bg-primary transition-colors"
              aria-label="Προσθήκη εξόδου"
            >
              + Νέο
            </button>
          </div>
        </div>
      </div>

      {/* CONTENT - Scrollable */}
      <div className="flex-1 overflow-y-auto px-4 py-4 no-scrollbar">
        <div className="flex flex-col gap-3">

          {/* Summary Card - Simplified to only show Grand Total */}
          <div className="glass-card rounded-2xl p-4 flex flex-col items-center justify-center gap-1 border border-primary/20 bg-primary/5">
            <span className="text-[10px] font-black text-primary uppercase tracking-widest">Συνολικά Έξοδα</span>
            <span className="text-3xl font-black text-foreground tracking-tighter">{grandTotal.toFixed(2)}€</span>
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
            showBackButton={true}
            onBack={() => setShowAdd(false)}
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
            <div className="glass-card rounded-2xl p-6 text-center flex flex-col items-center gap-2 border border-white/5">
              <p className="text-sm text-muted-foreground">Δεν υπάρχουν έξοδα</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1 mt-1">
                Ιστορικό ({expenses.length})
              </h2>
              <div className="flex flex-col gap-1.5">
                {expenses
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .map((expense) => (
                    <div key={expense.id} className="glass-card rounded-xl p-2.5 flex items-center justify-between border border-white/5 hover:border-primary/30 transition-colors group">
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-bold text-foreground truncate block">
                          {expense.description || 'Έξοδο'}
                        </span>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {formatGreekDate(expense.date)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        <span className="text-sm font-black text-primary whitespace-nowrap">
                          {expense.amount.toFixed(2)}€
                        </span>
                        <button
                          onClick={() => {
                            hapticFeedback('medium')
                            setExpenses(expenses.filter((e) => e.id !== expense.id))
                          }}
                          className="p-1.5 rounded-lg text-destructive/70 hover:text-destructive hover:bg-destructive/10 transition-all"
                          aria-label="Διαγραφή"
                        >
                          <span className="text-xs">✕</span>
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
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
      category: 'other', // Default to other since categories are removed from UI
    })
  }

  const handleSelectCatalogItem = (item: CanteenCatalogItem) => {
    hapticFeedback('light')
    setAmount(item.price.toFixed(2))
    setDescription(item.name)
    setSelectedCatalogCategory(null)
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Canteen Catalog Selection */}
      {canteenCatalog.length > 0 && (
        <div className="glass-card rounded-xl p-3 border border-primary/20 flex flex-col gap-2">
          <h3 className="text-[10px] font-black text-primary uppercase tracking-widest">Κατάλογος Κ.Ψ.Μ.</h3>
          
          {selectedCatalogCategory === null ? (
            // Show categories
            <div className="flex flex-col gap-1.5">
              {(Object.keys(CANTEEN_CATEGORY_LABELS) as Array<'food' | 'beverage' | 'snack' | 'other'>).map((cat) => {
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
                    className="bg-secondary/50 border border-white/5 rounded-lg p-2 flex items-center justify-between hover:border-primary transition-colors text-sm"
                  >
                    <span className="text-foreground font-bold text-xs">{CANTEEN_CATEGORY_LABELS[cat]}</span>
                    <span className="text-muted-foreground text-[10px] font-black">
                      {itemsInCat.length}
                    </span>
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
                className="text-primary text-[10px] font-black uppercase tracking-widest hover:text-primary/80 transition-colors py-1 w-fit text-left"
              >
                ← Πίσω
              </button>
              <div className="flex flex-col gap-1.5">
                {catalogItemsInCategory.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectCatalogItem(item)}
                    className={cn(
                      'bg-secondary/50 border rounded-lg p-2 flex items-center justify-between hover:border-primary transition-all text-sm',
                      description === item.name && amount === item.price.toFixed(2)
                        ? 'border-primary bg-primary/10 ring-1 ring-primary'
                        : 'border-white/5'
                    )}
                  >
                    <span className="font-bold text-foreground text-xs tracking-tight">{item.name}</span>
                    <span className="font-black text-primary text-xs">{item.price.toFixed(2)}€</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Name Input */}
      <div>
        <label className="block text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-widest">Όνομα</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Π.χ. Καφές, Σνακ..."
          className="w-full px-3 py-2 rounded-lg bg-secondary text-foreground text-sm min-h-[40px] border border-border placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none transition-colors"
        />
      </div>

      {/* Amount Input */}
      <div>
        <label className="block text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-widest">Ποσό (€)</label>
        <input
          type="number"
          inputMode="decimal"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          className="w-full px-3 py-2 rounded-lg bg-secondary text-foreground text-sm font-bold min-h-[40px] border border-border placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none transition-colors"
        />
      </div>

      {/* Date Picker */}
      <GreekDatePicker value={date} onChange={setDate} label="Ημερομηνία" compact />

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2 border-t border-border/50">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-lg bg-secondary/50 border border-white/5 text-foreground font-bold text-[10px] uppercase tracking-wider min-h-[44px] hover:bg-secondary transition-colors"
        >
          Ακύρωση
        </button>
        <button
          onClick={handleSubmit}
          disabled={!amount || !date}
          className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground font-bold text-[10px] uppercase tracking-wider min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary transition-colors"
        >
          Προσθήκη
        </button>
      </div>
    </div>
  )
}
