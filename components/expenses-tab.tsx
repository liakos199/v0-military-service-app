'use client'

import { useState, useMemo } from 'react'
import { Search, X, Filter, SlidersHorizontal, Plus, Box } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { GreekDatePicker } from '@/components/greek-date-picker'
import { FullscreenModal, ModalFooter } from '@/components/fullscreen-modal'
import { CanteenCatalogManager } from '@/components/canteen-catalog-manager'
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog'
import { hapticFeedback, formatGreekDate, generateId, toLocalDateString, toast } from '@/lib/helpers'
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

  const grandTotal = expenses.reduce((sum, e) => sum + e.amount, 0)

  const { weeklyTotal, monthlyTotal } = useMemo(() => {
    const now = new Date()
    const oneWeekAgo = new Date(now)
    oneWeekAgo.setDate(now.getDate() - 7)
    const oneMonthAgo = new Date(now)
    oneMonthAgo.setMonth(now.getMonth() - 1)
    
    const weekStr = toLocalDateString(oneWeekAgo)
    const monthStr = toLocalDateString(oneMonthAgo)
    
    return {
      weeklyTotal: expenses.filter(e => e.date >= weekStr).reduce((sum, e) => sum + e.amount, 0),
      monthlyTotal: expenses.filter(e => e.date >= monthStr).reduce((sum, e) => sum + e.amount, 0)
    }
  }, [expenses])

  return (
    <div className="flex-1 flex flex-col relative z-10 w-full h-full overflow-hidden bg-black">
      {/* HEADER */}
      <header className="px-6 pt-14 pb-2 z-10 relative flex justify-between items-start shrink-0">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight text-white leading-none mb-1">Έξοδα</h1>
          <p className="text-[10px] font-bold tracking-[0.1em] text-zinc-500 uppercase">Δαπάνες & Κατάλογος</p>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <button 
            onClick={() => {
              hapticFeedback('light')
              setShowCatalogManager(true)
            }}
            className="flex items-center gap-1 px-3 py-2 rounded-lg bg-blue-700 border border-blue-700 text-[10px] font-extrabold tracking-widest text-white uppercase hover:text-white hover:bg-blue-700 transition-colors shadow-sm active:scale-95"
          >
            <Box size={14} className="font-bold" /> ΚΑΤΑΛΟΓΟΣ
          </button>
          <button 
            onClick={() => {
              hapticFeedback('light')
              setShowAdd(true)
            }}
            className="px-3 py-2 rounded-lg bg-gradient-to-r from-[#34d399] to-[#10b981] text-[10px] font-extrabold tracking-widest text-black uppercase hover:opacity-90 transition-opacity active:scale-95 flex items-center gap-1"
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
                className="w-full bg-gradient-to-b from-zinc-800 to-zinc-800/80 border border-zinc-700/50 rounded-lg py-3.5 pl-11 pr-4 text-[14px] text-white placeholder-zinc-500 focus:outline-none focus:border-[#34d399]/50 focus:ring-1 focus:ring-[#34d399]/20 transition-all shadow-lg" 
              />
            </div>
          </div>
          
          {/* Category Filter */}
          <div>
            <h3 className="text-[8px] font-bold tracking-[0.15em] text-zinc-500 uppercase mb-2 px-1">Φιλτραρισμα Ανα Κατηγορια</h3>
            <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1">
              <button 
                onClick={() => setFilterCategory('all')}
                className={cn(
                  "px-5 py-2 rounded-lg text-[8px] font-extrabold tracking-wider shrink-0 active:scale-95",
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
                    "px-5 py-2 rounded-sm font-bold tracking-wider shrink-0 active:scale-95 text-[8px]",
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

        {/* Spending Summaries */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gradient-to-br from-zinc-800 to-zinc-900/90 border border-zinc-700/40 rounded-lg p-4 flex flex-col items-center justify-center shadow-lg shadow-black/10">
            <span className="text-[7.5px] font-black tracking-[0.1em] text-zinc-500 uppercase mb-1">Αυτη την εβδομαδα</span>
            <div className="flex items-baseline gap-1">
              <span className="text-[20px] font-black text-white leading-none">{weeklyTotal.toFixed(2)}</span>
              <span className="text-[12px] font-bold text-emerald-500">€</span>
            </div>
          </div>
          <div className="bg-gradient-to-br from-zinc-800 to-zinc-900/90 border border-zinc-700/40 rounded-lg p-4 flex flex-col items-center justify-center shadow-lg shadow-black/10">
            <span className="text-[7.5px] font-black tracking-[0.1em] text-zinc-500 uppercase mb-1">Αυτο το μηνα</span>
            <div className="flex items-baseline gap-1">
              <span className="text-[20px] font-black text-white leading-none">{monthlyTotal.toFixed(2)}</span>
              <span className="text-[12px] font-bold text-emerald-500">€</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-lg p-5 flex flex-col items-center justify-center shadow-xl mb-6 relative overflow-hidden border-dashed">
          <span className="text-[10px] font-black tracking-[0.2em] text-[#34d399] uppercase mb-1 relative z-10">Συνολικα Εξοδα</span>
          <div className="flex items-baseline gap-1 relative z-10">
            <span className="text-[32px] font-black tracking-tight text-white leading-none">{grandTotal.toFixed(2)}</span>
            <span className="text-[20px] font-bold text-[#34d399]">€</span>
          </div>
        </div>

        {/* Expense List */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-bold tracking-[0.2em] text-zinc-500 uppercase px-1 mb-1">
            Ιστορικο ({filteredExpenses.length})
          </h3>
          
          {filteredExpenses.length === 0 ? (
            <div className="bg-gradient-to-br from-zinc-800 to-zinc-900/90 border border-zinc-700/40 rounded-lg p-8 flex flex-col items-center justify-center text-center shadow-lg shadow-black/10">
              <p className="text-[13px] text-zinc-500 font-medium">
                {searchQuery || filterCategory !== 'all' ? 'Δεν βρέθηκαν έξοδα' : 'Δεν υπάρχουν έξοδα'}
              </p>
            </div>
          ) : (
            filteredExpenses.map((item) => (
              <div key={item.id} className="bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 border border-zinc-700/40 rounded-lg p-4 flex items-center justify-between shadow-md transition active:scale-[0.98]">
                <div className="flex flex-col">
                  <span className="text-[15px] font-bold text-white leading-tight">{item.description || 'Έξοδο'}</span>
                  <span className="text-[10px] text-zinc-500 font-medium">{formatGreekDate(item.date)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[17px] font-bold text-[#34d399] tracking-tight">{item.amount.toFixed(2)}€</span>
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
            toast('Ο κατάλογος ενημερώθηκε')
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
            toast('Το έξοδο προστέθηκε')
          }}
          onCancel={() => setShowAdd(false)}
        />
      </FullscreenModal>

      {deletePendingId && (
        <DeleteConfirmDialog
          onConfirm={() => {
            setExpenses(expenses.filter((e) => e.id !== deletePendingId))
            setDeletePendingId(null)
            toast('Το έξοδο διαγράφηκε')
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
  
  // Find first category with items
  const firstNonEmptyCategory = (['food', 'beverage', 'snack', 'other'] as const).find(cat => 
    canteenCatalog.some(item => item.category === cat)
  ) || 'food'
    
  const [activeCatalogCat, setActiveCatalogCat] = useState<'food' | 'beverage' | 'snack' | 'other'>(firstNonEmptyCategory)

  const catalogItemsInCategory = canteenCatalog.filter((item) => item.category === activeCatalogCat)

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
  }

  return (
    <div className="flex flex-col">
      <h2 className="text-[10px] font-bold tracking-[0.1em] text-zinc-500 uppercase mb-1.5 ml-1">KATAXΩΡΗΣΗ ΕΞΟΔΟΥ</h2>
      <p className="text-[12px] text-zinc-400 font-medium leading-tight mb-6 ml-1">
        Προσθέστε ένα νέο έξοδο χειροκίνητα ή επιλέξτε από τον κατάλογο.
      </p>

      {/* Modern Catalog Quick-Select */}
      {canteenCatalog.length > 0 && (
        <div className="mb-8 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[9px] font-black tracking-widest text-[#34d399] uppercase">ΓΡΗΓΟΡΗ ΕΠΙΛΟΓΗ</h3>
            <span className="text-[8px] font-bold text-zinc-600 tracking-wider">ΑΠΟ ΚΑΤΑΛΟΓΟ</span>
          </div>
          
          <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-xl p-3 shadow-inner">
            {/* Category Sub-tabs */}
            <div className="flex gap-1 mb-4 overflow-x-auto hide-scrollbar pb-1">
              {(['food', 'beverage', 'snack', 'other'] as const).map((cat) => {
                const hasItems = canteenCatalog.some(item => item.category === cat)
                if (!hasItems) return null
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      hapticFeedback('light')
                      setActiveCatalogCat(cat)
                    }}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-[8px] font-black tracking-wider transition-all duration-200 whitespace-nowrap',
                      activeCatalogCat === cat
                        ? 'bg-zinc-800 text-white border border-zinc-700 shadow-lg'
                        : 'text-zinc-500 hover:text-zinc-300'
                    )}
                  >
                    {CANTEEN_CATEGORY_LABELS[cat]}
                  </button>
                )
              })}
            </div>

            {/* Horizontal Product Strip */}
            <div className="flex gap-2 overflow-x-auto hide-scrollbar -mx-1 px-1">
              {catalogItemsInCategory.length > 0 ? (
                catalogItemsInCategory.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectCatalogItem(item)}
                    className={cn(
                      'flex flex-col items-start gap-1 p-3 rounded-lg border transition-all min-w-[120px] max-w-[140px] relative overflow-hidden group',
                      description === item.name && amount === item.price.toFixed(2)
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : 'bg-zinc-900/80 border-zinc-700/50 hover:border-zinc-500/50 active:scale-95'
                    )}
                  >
                    {description === item.name && amount === item.price.toFixed(2) && (
                      <div className="absolute top-0 right-0 w-12 h-12 bg-emerald-500/10 rounded-full -mr-6 -mt-6" />
                    )}
                    <span className="text-[11px] font-bold text-white truncate w-full text-left line-clamp-1">{item.name}</span>
                    <span className="text-[12px] font-black text-[#34d399]">{item.price.toFixed(2)}€</span>
                  </button>
                ))
              ) : (
                <div className="flex-1 py-4 text-center text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
                  Κενη κατηγορια
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Manual Inputs Section */}
      <div className="flex flex-col gap-6">
        <div className="bg-gradient-to-br from-zinc-800/80 to-zinc-900/90 border border-zinc-700/40 rounded-xl p-5 shadow-xl shadow-black/20">
          <div className="space-y-4">
            {/* Description & Amount Grid */}
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Περιγραφη</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="π.χ. Freddo Espresso"
                  className="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg px-4 py-3 text-[14px] font-bold text-white placeholder:text-zinc-700 focus:outline-none focus:border-emerald-500/30 transition-all shadow-inner"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Ποσο</label>
                <div className="relative">
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg px-4 py-3 text-[18px] font-black text-[#34d399] placeholder:text-zinc-800 focus:outline-none focus:border-emerald-500/30 transition-all shadow-inner"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl font-black text-zinc-800 select-none">€</span>
                </div>
              </div>
            </div>

            {/* Category Manual Picker */}
            <div className="pt-2 space-y-2">
              <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Κατηγορια</label>
              <div className="flex gap-1.5 overflow-x-auto hide-scrollbar pb-1">
                {(['food', 'beverage', 'snack', 'other'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      hapticFeedback('light')
                      setExpenseCategory(cat)
                    }}
                    className={cn(
                      'flex-1 py-3 px-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all duration-300 border min-w-[70px]',
                      expenseCategory === cat
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-glow shadow-emerald-500/5'
                        : 'bg-zinc-900/50 border-zinc-800 text-zinc-600 hover:text-zinc-400'
                    )}
                  >
                    {EXPENSE_CATEGORY_LABELS[cat]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Date Picker Section */}
        <div className="px-1">
          <GreekDatePicker value={date} onChange={setDate} label="Ημερομηνια" compact />
        </div>
      </div>

      <ModalFooter>
        <div className="flex gap-3 px-6 py-5">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-lg bg-zinc-900 text-zinc-400 font-bold text-[10px] uppercase tracking-wider border border-zinc-800 hover:border-zinc-700 transition-all active:scale-95"
          >
            Ακύρωση
          </button>
          <button
            onClick={handleSubmit}
            disabled={!amount || !date || !description.trim()}
            className="flex-1 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-[10px] uppercase tracking-wider shadow-lg shadow-emerald-900/30 active:scale-95 transition-all disabled:opacity-50"
          >
            Καταχώρηση
          </button>
        </div>
      </ModalFooter>
    </div>
  )
}


