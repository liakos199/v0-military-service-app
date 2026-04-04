'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { hapticFeedback, generateId } from '@/lib/helpers'
import type { CanteenCatalogItem } from '@/lib/types'
import { CANTEEN_CATEGORY_LABELS } from '@/lib/types'
import { ChevronDown, Pencil, X } from 'lucide-react'
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog'
import { ModalFooter } from '@/components/fullscreen-modal'

interface CanteenCatalogManagerProps {
  items: CanteenCatalogItem[]
  onSave: (items: CanteenCatalogItem[]) => void
  onCancel: () => void
}

export function CanteenCatalogManager({ items, onSave, onCancel }: CanteenCatalogManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<CanteenCatalogItem | null>(null)
  const [newLabel, setNewLabel] = useState('')
  const [newPrice, setNewPrice] = useState('')
  const [newCategory, setNewCategory] = useState<'food' | 'beverage' | 'snack' | 'other'>('food')
  const [activeCategory, setActiveCategory] = useState<'food' | 'beverage' | 'snack' | 'other'>('food')
  const [showAddForm, setShowAddForm] = useState(false)
  const [deletePendingId, setDeletePendingId] = useState<string | null>(null)

  const startEdit = (item: CanteenCatalogItem) => {
    hapticFeedback('light')
    setEditingId(item.id)
    setEditData({ ...item })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditData(null)
  }

  const saveEdit = () => {
    if (!editData || !editData.name.trim() || editData.price <= 0) return
    hapticFeedback('heavy')
    const updatedItems = items.map((item) =>
      item.id === editingId ? editData : item
    )
    onSave(updatedItems)
    setEditingId(null)
    setEditData(null)
  }

  const handleDelete = (id: string, name: string) => {
    hapticFeedback('medium')
    setDeletePendingId(id)
  }

  const handleAdd = () => {
    const parsedPrice = parseFloat(newPrice)
    if (!newLabel.trim() || isNaN(parsedPrice) || parsedPrice <= 0) {
      hapticFeedback('medium')
      return
    }
    hapticFeedback('light')
    const newItem: CanteenCatalogItem = {
      id: generateId(),
      name: newLabel.trim(),
      price: parsedPrice,
      category: newCategory,
      available: true,
    }
    onSave([...items, newItem])
    setNewLabel('')
    setNewPrice('')
    setShowAddForm(false)
  }

  // Group items by category
  const itemsByCategory = {
    food: items.filter((item) => item.category === 'food'),
    beverage: items.filter((item) => item.category === 'beverage'),
    snack: items.filter((item) => item.category === 'snack'),
    other: items.filter((item) => item.category === 'other'),
  }

  return (
      <div className="flex flex-col">
        <h2 className="text-[10px] font-bold tracking-[0.1em] text-zinc-500 uppercase mb-1.5 ml-1">Υπηρεσία Καταλόγου</h2>
        <p className="text-[12px] text-zinc-400 font-medium leading-tight mb-4 ml-1">
          Διαχειριστείτε τα προϊόντα που εμφανίζονται κατά την καταχώρηση εξόδων.
        </p>

        {/* Horizontal Category Switcher */}
        <div className="flex gap-1.5 p-1.5 rounded-lg bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm overflow-x-auto hide-scrollbar mb-6">
          {(['food', 'beverage', 'snack', 'other'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => {
                hapticFeedback('light')
                setActiveCategory(cat)
              }}
              className={cn(
                'flex-1 py-2 px-4 rounded-lg text-[8px] font-black tracking-wider transition-all duration-300 whitespace-nowrap min-w-[70px]',
                activeCategory === cat
                  ? 'bg-gradient-to-r from-[#34d399] to-[#10b981] text-black shadow-md shadow-emerald-500/10'
                  : 'text-zinc-500 hover:text-white hover:bg-zinc-800/50'
              )}
            >
              {CANTEEN_CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {/* Add Section Toggle */}
        <div className="flex items-center justify-between mb-4 px-1">
          <h3 className="text-[10px] font-black tracking-[0.2em] text-zinc-500 uppercase">
            {CANTEEN_CATEGORY_LABELS[activeCategory]} ({itemsByCategory[activeCategory].length})
          </h3>
          <button 
            onClick={() => {
              hapticFeedback('light')
              setShowAddForm(!showAddForm)
              setNewCategory(activeCategory)
            }}
            className={cn(
              "px-3 py-1.5 rounded-lg border text-[9px] font-black tracking-widest uppercase transition-all active:scale-95 flex items-center gap-1.5",
              showAddForm 
                ? "bg-zinc-800 border-zinc-700 text-zinc-400" 
                : "bg-emerald-500/10 border-emerald-500/20 text-[#34d399] hover:bg-emerald-500/20"
            )}
          >
            {showAddForm ? <X size={10} /> : <Pencil size={10} />}
            {showAddForm ? "ΑΚΥΡΩΣΗ" : "ΠΡΟΣΘΗΚΗ"}
          </button>
        </div>
        
        {/* Compact Add Form */}
        {showAddForm && (
          <div className="bg-gradient-to-br from-zinc-800 to-zinc-900/90 border border-zinc-700/40 rounded-lg p-4 shadow-xl shadow-black/20 mb-6 animate-fade-in animate-in slide-in-from-top-2 duration-200">
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                autoFocus
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Όνομα π.χ. Freddo Espresso"
                className="flex-1 bg-zinc-900/80 border border-zinc-700/80 rounded-lg px-3 py-2 text-[13px] text-white placeholder-zinc-600 focus:outline-none focus:border-[#34d399]/50 transition-colors font-bold"
              />
              <div className="relative w-24">
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-zinc-900/80 border border-zinc-700/80 rounded-lg px-3 py-2 text-[13px] text-white placeholder-zinc-600 focus:outline-none focus:border-[#34d399]/50 transition-colors text-right pr-6 font-bold"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-zinc-600">€</span>
              </div>
            </div>
            
            <button
              onClick={handleAdd}
              disabled={!newLabel.trim() || !newPrice || isNaN(parseFloat(newPrice)) || parseFloat(newPrice) <= 0}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#34d399] to-[#10b981] text-black font-black text-[10px] tracking-widest uppercase shadow-lg shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale"
            >
              ΠΡΟΣΘΗΚΗ ΣΤΟΝ ΚΑΤΑΛΟΓΟ
            </button>
          </div>
        )}

        {/* Active Category Items List */}
        <div className="flex flex-col gap-2.5">
          {itemsByCategory[activeCategory].length > 0 ? (
            itemsByCategory[activeCategory].map((item) => (
              <div key={item.id}>
                {editingId === item.id && editData ? (
                  <div className="flex flex-col gap-3 p-4 bg-zinc-800/80 rounded-lg border border-[#34d399]/30 shadow-lg shadow-emerald-900/10 animate-in zoom-in-95 duration-150">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        autoFocus
                        value={editData.name}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        className="flex-1 bg-zinc-900/80 border border-zinc-700/80 rounded-lg px-3 py-2 text-[12px] text-white focus:outline-none focus:border-[#34d399]/50 transition-colors font-bold"
                      />
                      <div className="relative w-24">
                        <input
                          type="number"
                          inputMode="decimal"
                          step="0.01"
                          value={editData.price}
                          onChange={(e) => setEditData({ ...editData, price: parseFloat(e.target.value) || 0 })}
                          className="w-full bg-zinc-900/80 border border-zinc-700/80 rounded-lg px-3 py-2 text-[12px] text-white focus:outline-none focus:border-[#34d399]/50 transition-colors text-right pr-6 font-bold"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-zinc-600">€</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={cancelEdit}
                        className="flex-1 py-2 rounded-lg bg-zinc-900 text-zinc-400 text-[9px] font-black uppercase tracking-widest border border-zinc-800 hover:bg-zinc-800 transition-all font-bold"
                      >
                        ΑΚΥΡΩΣΗ
                      </button>
                      <button
                        onClick={saveEdit}
                        disabled={!editData.name.trim() || editData.price <= 0}
                        className="flex-1 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-[9px] font-black uppercase tracking-widest shadow-lg shadow-emerald-900/20 active:scale-95 disabled:opacity-50 transition-all font-bold"
                      >
                        ΑΠΟΘΗΚΕΥΣΗ
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-lg p-3.5 flex items-center justify-between shadow-sm hover:border-zinc-700/50 transition-all active:scale-[0.99] group">
                    <div className="flex-1 min-w-0 pr-3">
                      <p className="text-[14px] font-bold text-white leading-none mb-1 group-hover:text-emerald-400 transition-colors">{item.name}</p>
                      <div className="flex items-center gap-1.5">
                        <div className="w-1 h-1 rounded-full bg-zinc-700" />
                        <span className="text-[11px] font-black text-emerald-500/80 tracking-tight">{item.price.toFixed(2)}€</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => startEdit(item)}
                        className="w-9 h-9 rounded-full flex items-center justify-center text-zinc-500 hover:text-[#34d399] hover:bg-[#34d399]/10 transition-all"
                        aria-label={`Επεξεργασία ${item.name}`}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.name)}
                        className="w-9 h-9 rounded-full flex items-center justify-center text-zinc-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
                        aria-label={`Διαγραφή ${item.name}`}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-center bg-zinc-900/20 border border-zinc-800/30 border-dashed rounded-lg">
              <Pencil size={32} className="text-zinc-700 mb-3" />
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Κενή κατηγορία</p>
              <button 
                onClick={() => {
                  hapticFeedback('light')
                  setShowAddForm(true)
                  setNewCategory(activeCategory)
                }}
                className="mt-3 text-emerald-500 text-[9px] font-black uppercase tracking-widest"
              >
                ΠΡΟΣΘΗΚΗ ΠΡΩΤΟΥ Προϊόντος
              </button>
            </div>
          )}
        </div>
      
      <ModalFooter>
        <div className="px-6 py-5">
          <button
            onClick={onCancel}
            className="w-full py-3 rounded-lg bg-zinc-900 text-zinc-400 font-bold text-[10px] uppercase tracking-wider border border-zinc-800 hover:border-zinc-700 transition-all active:scale-95"
          >
            Κλεισιμο
          </button>
        </div>
      </ModalFooter>

      {deletePendingId && (
        <DeleteConfirmDialog
          onConfirm={() => {
            const updatedItems = items.filter((item) => item.id !== deletePendingId)
            onSave(updatedItems)
            setDeletePendingId(null)
          }}
          onCancel={() => setDeletePendingId(null)}
        />
      )}
    </div>
  )
}
