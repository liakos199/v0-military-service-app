'use client'

import { useState, useMemo } from 'react'
import { Search, X, Filter, SlidersHorizontal, Plus, Box } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { GreekDatePicker } from '@/components/greek-date-picker'
import { FullscreenModal } from '@/components/fullscreen-modal'
import { CanteenCatalogManager } from '@/components/canteen-catalog-manager'
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog'
import { hapticFeedback, formatGreekDate, generateId, toLocalDateString } from '@/lib/helpers'
import type { CanteenCatalogItem, ExpenseEntry } from '@/lib/types'
import { CANTEEN_CATEGORY_LABELS, EXPENSE_CATEGORY_LABELS } from '@/lib/types'

export function ExpensesTab() {
  const [expenses, setExpenses] = useLocalStorage<ExpenseEntry[]>('fantaros-expenses', [])
  const [canteenCatalog, setCanteenCatalog] = useLocalStorage<CanteenCatalogItem[]>('fantaros-canteen-catalog', [])
  const [showAdd, setShowAdd] = useState(false)
  const [showCatalogManager, setShowCatalogManager] = useState(false)
  const [deletePendingId, setDeletePendingId] = useState<string | null>(null)
  
  const [searchQuery, setSearchQuery] = useState('')
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
    <div className="flex-1 flex flex-col relative z-10 w-full h-full animate-fade-in overflow-hidden bg-black">
      {/* HEADER */}
      <header className="px-6 pt-14 pb-2 z-10 relative flex justify-between items-start shrink-0">
        <div>
          <h1 className="text-[32px] font-bold tracking-tight text-white leading-none mb-1">Έξοδα</h1>
          <p className="text-[13px] font-bold tracking-[0.1em] text-zinc-500 uppercase">Δαπανες & Καταλογος</p>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <button 
            onClick={() => {
              hapticFeedback('light')
              setShowCatalogManager(true)
            }}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-blue-700 border border-blue-700 text-[10px] font-extrabold tracking-widest text-white uppercase hover:text-white hover:bg-blue-700 transition-colors shadow-sm active:scale-95"
          >
            <Box size={14} className="font-bold" /> ΚΑΤΑΛΟΓΟΣ
          </button>
          <button 
            onClick={() => {
              hapticFeedback('light')
              setShowAdd(true)
            }}
            className="px-3 py-2 rounded-xl bg-gradient-to-r from-[#34d399] to-[#10b981] text-[10px] font-extrabold tracking-widest text-black uppercase hover:opacity-90 transition-opacity active:scale-95 flex items-center gap-1"
          >
            <Plus size={14} className="font-bold" /> ΝΕΟ
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto px-5 pb-32 pt-4 relative hide-scrollbar">
        {/* Sticky Search & Filter Bar */}
        <div className="sticky top-0 pt-2 pb-5 z-20 before:absolute before:inset-0 before:-z-10 before:backdrop-blur-md">
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1 group">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-[#34d399] transition-colors" />
              <input 
                type="text" 
                placeholder="Αναζήτηση εξόδων..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gradient-to-b from-zinc-800 to-zinc-800/80 border border-zinc-700/50 rounded-[1.25rem] py-3.5 pl-11 pr-4 text-[14px] text-white placeholder-zinc-500 focus:outline-none focus:border-[#34d399]/50 focus:ring-1 focus:ring-[#34d399]/20 transition-all shadow-lg" 
              />
            </div>
          </div>
          
          {/* Category Filter */}
          <div>
            <h3 className="text-[9px] font-bold tracking-[0.15em] text-zinc-500 uppercase mb-2 px-1">Φιλτραρισμα Ανα Κατηγορια</h3>
            <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1">
              <button 
                onClick={() => setFilterCategory('all')}
                className={cn(
                  "px-5 py-2 rounded-full text-[9px] font-extrabold tracking-wider shrink-0 active:scale-95",
                  filterCategory === 'all'
                    ? 'bg-gradient-to-r from-[#34d399] to-[#10b981] text-black shadow-[0_0_10px_rgba(52,211,153,0.2)]'
                    : 'bg-zinc-800/80 border border-zinc-700/50 text-zinc-400 hover:text-white hover:bg-zinc-700'
                )}
              >
                ΟΛΑ
              </button>
              {['food', 'beverage', 'snack', 'other'].map((cat) => (
                <button 
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={cn(
                    "px-5 py-2 rounded-full font-bold tracking-wider shrink-0 active:scale-95 text-[9px]",
                    filterCategory === cat
                      ? 'bg-gradient-to-r from-[#34d399] to-[#10b981] text-black shadow-[0_0_10px_rgba(52,211,153,0.2)]'
                      : 'bg-zinc-800/80 border border-zinc-700/50 text-zinc-400 hover:text-white hover:bg-zinc-700'
                  )}
                >
                  {EXPENSE_CATEGORY_LABELS[cat as keyof typeof EXPENSE_CATEGORY_LABELS]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Total Expenses Card */}
        <div className="bg-gradient-to-br from-zinc-800 to-zinc-900/90 border border-zinc-700/40 rounded-[1.5rem] p-6 flex flex-col items-center justify-center shadow-xl shadow-black/20 mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[#10b981]/5"></div>
          <span className="text-[11px] font-extrabold tracking-[0.2em] text-[#34d399] uppercase mb-1 relative z-10">Συνολικα Εξοδα</span>
          <div className="flex items-baseline gap-1 relative z-10">
            <span className="text-[38px] font-black tracking-tight text-white leading-none">{grandTotal.toFixed(2)}</span>
            <span className="text-[24px] font-bold text-[#34d399]">€</span>
          </div>
        </div>

        {/* Expense List */}
        <div className="space-y-3">
          <h3 className="text-[11px] font-bold tracking-[0.2em] text-zinc-500 uppercase px-1 mb-1">
            Ιστορικο ({filteredExpenses.length})
          </h3>
          
          {filteredExpenses.length === 0 ? (
            <div className="bg-gradient-to-br from-zinc-800 to-zinc-900/90 border border-zinc-700/40 rounded-[1.5rem] p-8 flex flex-col items-center justify-center text-center shadow-lg shadow-black/10">
              <p className="text-[13px] text-zinc-500 font-medium">
                {searchQuery || filterCategory !== 'all' ? 'Δεν βρέθηκαν έξοδα' : 'Δεν υπάρχουν έξοδα'}
              </p>
            </div>
          ) : (
            filteredExpenses.map((item) => (
              <div key={item.id} className="bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 border border-zinc-700/40 rounded-[1.25rem] p-4 flex items-center justify-between shadow-md transition active:scale-[0.98]">
                <div className="flex flex-col">
                  <span className="text-[16px] font-bold text-white leading-tight">{item.description || 'Έξοδο'}</span>
                  <span className="text-[11px] text-zinc-500 font-medium">{formatGreekDate(item.date)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[18px] font-bold text-[#34d399] tracking-tight">{item.amount.toFixed(2)}€</span>
	                  <button 
	                    onClick={() => {
	                      hapticFeedback('medium')
	                      setDeletePendingId(item.id)
	                    }}
	                    className="w-7 h-7 rounded-full text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors flex justify-center items-center"
	                  >
	                    <X size={16}/>
	                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Catalog Manager Modal */}
      <FullscreenModal
        isOpen={showCatalogManager}
        onClose={() => setShowCatalogManager(false)}
        title="Διαχείριση Καταλόγου"
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
        footer={<AddExpenseFormFooter />}
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

      {deletePendingId && (
        <DeleteConfirmDialog
          onConfirm={() => {
            setExpenses(expenses.filter((e) => e.id !== deletePendingId))
            setDeletePendingId(null)
          }}
          onCancel={() => setDeletePendingId(null)}
        />
      )}
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
        <div className="bg-gradient-to-br from-zinc-800 to-zinc-900/90 border border-zinc-700/40 rounded-[1.5rem] p-5 shadow-lg shadow-black/20">
          <h3 className="text-[15px] font-bold text-white mb-4">Προσθήκη προϊόντος</h3>
          
          {selectedCatalogCategory === null ? (
            // Show categories
            <div className="flex flex-col gap-2">
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
                    className="bg-zinc-900/80 border border-zinc-700/80 rounded-xl p-3 flex items-center justify-between hover:border-[#34d399]/50 transition-colors text-sm"
                  >
                    <span className="text-white font-bold text-xs">{CANTEEN_CATEGORY_LABELS[cat]}</span>
                    <span className="text-zinc-500 text-[10px] font-black">
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
                className="text-[#34d399] text-[10px] font-black uppercase tracking-widest hover:text-[#34d399]/80 transition-colors py-1 w-fit text-left"
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
                      'bg-zinc-900/80 border rounded-xl p-3 flex items-center justify-between hover:border-[#34d399]/50 transition-all text-sm',
                      description === item.name && amount === item.price.toFixed(2)
                        ? 'border-[#34d399]/50 bg-[#34d399]/10'
                        : 'border-zinc-700/80'
                    )}
                  >
                    <span className="font-bold text-white text-xs tracking-tight">{item.name}</span>
                    <span className="font-black text-[#34d399] text-xs">{item.price.toFixed(2)}€</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Name Input */}
      <div>
        <label className="block text-[10px] font-bold text-zinc-500 mb-1 uppercase tracking-widest">Όνομα</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Π.χ. Καφές, Σνακ..."
          className="w-full px-4 py-3 rounded-xl bg-zinc-800 text-white text-sm border border-zinc-700/50 placeholder:text-zinc-600 focus:border-[#34d399]/50 focus:outline-none focus:ring-1 focus:ring-[#34d399]/20 transition-all font-bold"
        />
      </div>

      {/* Amount Input */}
      <div>
        <label className="block text-[10px] font-bold text-zinc-500 mb-1 uppercase tracking-widest">Ποσό (€)</label>
        <input
          type="number"
          inputMode="decimal"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          className="w-full px-4 py-3 rounded-xl bg-zinc-800 text-white text-sm font-bold border border-zinc-700/50 placeholder:text-zinc-600 focus:border-[#34d399]/50 focus:outline-none focus:ring-1 focus:ring-[#34d399]/20 transition-all"
        />
      </div>

      {/* Category Selection */}
      <div>
        <label className="block text-[10px] font-bold text-zinc-500 mb-1 uppercase tracking-widest">Κατηγορία</label>
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
                'flex-1 px-3 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all min-h-[40px]',
                expenseCategory === cat
                  ? 'bg-gradient-to-r from-[#34d399] to-[#10b981] text-black shadow-[0_0_10px_rgba(52,211,153,0.2)]'
                  : 'bg-zinc-800 border border-zinc-700/50 text-zinc-400 hover:text-white hover:bg-zinc-700'
              )}
            >
              {EXPENSE_CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Date Picker */}
      <GreekDatePicker value={date} onChange={setDate} label="Ημερομηνία" compact />
    </div>
  )
}

function AddExpenseFormFooter() {
  return <></>
}

