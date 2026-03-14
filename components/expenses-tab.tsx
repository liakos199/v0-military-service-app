'use client'

import { useState, useMemo } from 'react'
import { Search, X, Filter, SlidersHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { GreekDatePicker } from '@/components/greek-date-picker'
import { FullscreenModal } from '@/components/fullscreen-modal'
import { CanteenCatalogManager } from '@/components/canteen-catalog-manager'
import { hapticFeedback, formatGreekDate, generateId, toLocalDateString } from '@/lib/helpers'
import type { CanteenCatalogItem, ExpenseEntry } from '@/lib/types'
import { CANTEEN_CATEGORY_LABELS, EXPENSE_CATEGORY_LABELS } from '@/lib/types'

export function ExpensesTab() {
  const [expenses, setExpenses] = useLocalStorage<ExpenseEntry[]>('fantaros-expenses', [])
  const [canteenCatalog, setCanteenCatalog] = useLocalStorage<CanteenCatalogItem[]>('fantaros-canteen-catalog', [])
  const [showAdd, setShowAdd] = useState(false)
  const [showCatalogManager, setShowCatalogManager] = useState(false)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filterCategory, setFilterCategory] = useState<string | 'all'>('all')

  const filteredExpenses = useMemo(() => {
    return expenses
      .filter(e => {
        const matchesSearch = !searchQuery || e.description.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = filterCategory === 'all' || e.category === filterCategory
        return matchesSearch && matchesCategory
      })
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [expenses, searchQuery, filterCategory])

  const grandTotal = filteredExpenses.reduce((sum, e) => sum + e.amount, 0)

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
          
          {/* Search and Filter Bar */}
          <div className="flex gap-2 mb-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Αναζήτηση εξόδων..."
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-secondary/50 border border-white/5 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="h-3 w-3 text-muted-foreground" />
                </button>
              )}
            </div>
            <button
              onClick={() => {
                hapticFeedback('light')
                setShowFilters(!showFilters)
              }}
              className={cn(
                "p-2 rounded-xl border transition-all flex items-center justify-center min-w-[40px]",
                showFilters || filterCategory !== 'all' 
                  ? "bg-primary/20 border-primary/30 text-primary" 
                  : "bg-secondary/50 border-white/5 text-muted-foreground"
              )}
            >
              <SlidersHorizontal className="h-4 w-4" />
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="glass-card rounded-xl p-3 border border-white/5 flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest px-1">Φιλτράρισμα ανά κατηγορία</p>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setFilterCategory('all')}
                  className={cn(
                    "px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                    filterCategory === 'all' ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                  )}
                >
                  Όλα
                </button>
                {Object.entries(EXPENSE_CATEGORY_LABELS).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setFilterCategory(key)}
                    className={cn(
                      "px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                      filterCategory === key ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Summary Card - Simplified to only show Grand Total */}
          <div className="glass-card rounded-2xl p-4 flex flex-col items-center justify-center gap-1 border border-primary/40 bg-primary/5">
            <span className="text-[10px] font-black text-primary uppercase tracking-widest">
              {searchQuery || filterCategory !== 'all' ? 'Σύνολο Αναζήτησης' : 'Συνολικά Έξοδα'}
            </span>
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
          {filteredExpenses.length === 0 ? (
            <div className="glass-card rounded-2xl p-6 text-center flex flex-col items-center gap-2 border border-white/5">
              <p className="text-sm text-muted-foreground">
                {searchQuery || filterCategory !== 'all' ? 'Δεν βρέθηκαν έξοδα' : 'Δεν υπάρχουν έξοδα'}
              </p>
              {!searchQuery && filterCategory === 'all' && (
                <button
                  onClick={() => setShowAdd(true)}
                  className="text-[10px] font-black text-primary uppercase tracking-widest mt-1"
                >
                  Προσθήκη πρώτου εξόδου
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between px-1 mt-1">
                <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  {searchQuery || filterCategory !== 'all' ? 'Αποτελέσματα' : 'Ιστορικό'} ({filteredExpenses.length})
                </h2>
              </div>
              <div className="flex flex-col gap-1.5">
                {filteredExpenses.map((expense) => (
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
                            if (window.confirm(`Είστε σίγουροι ότι θέλετε να διαγράψετε το έξοδο "${expense.description || 'Έξοδο'}" ύψους ${expense.amount.toFixed(2)}€;`)) {
                              setExpenses(expenses.filter((e) => e.id !== expense.id))
                            }
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
  const [expenseCategory, setExpenseCategory] = useState<'food' | 'beverage' | 'snack' | 'other'>('other')
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
      category: expenseCategory,
    })
  }

  const handleSelectCatalogItem = (item: CanteenCatalogItem) => {
    hapticFeedback('light')
    setAmount(item.price.toFixed(2))
    setDescription(item.name)
    setExpenseCategory(item.category)
    setSelectedCatalogCategory(null)
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Canteen Catalog Selection */}
      {canteenCatalog.length > 0 && (
        <div className="glass-card rounded-xl p-3 border border-primary/40 flex flex-col gap-2">
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
                        ? 'border-primary bg-primary/20 ring-1 ring-primary'
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

      {/* Category Selection */}
      <div>
        <label className="block text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-widest">Κατηγορία</label>
        <div className="flex gap-1.5">
          {(['food', 'beverage', 'snack', 'other'] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                hapticFeedback('light')
                setExpenseCategory(cat)
              }}
              className={cn(
                'flex-1 px-2 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all min-h-[36px]',
                expenseCategory === cat
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground border border-white/5'
              )}
            >
              {EXPENSE_CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
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
