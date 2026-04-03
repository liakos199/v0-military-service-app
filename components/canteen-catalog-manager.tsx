'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { hapticFeedback, generateId } from '@/lib/helpers'
import type { CanteenCatalogItem } from '@/lib/types'
import { CANTEEN_CATEGORY_LABELS } from '@/lib/types'
import { ChevronDown, Pencil, X } from 'lucide-react'
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog'

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
  const [expandedCategory, setExpandedCategory] = useState<'food' | 'beverage' | 'snack' | 'other' | null>(null)
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
  }

  // Group items by category
  const itemsByCategory = {
    food: items.filter((item) => item.category === 'food'),
    beverage: items.filter((item) => item.category === 'beverage'),
    snack: items.filter((item) => item.category === 'snack'),
    other: items.filter((item) => item.category === 'other'),
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-[10px] text-zinc-400 font-medium leading-relaxed">
        Διαχειρίστε τα προϊόντα του καταλόγου που θα εμφανίζονται ως επιλογές κατά την καταχώρηση εξόδων.
      </p>

      {/* Add new item */}
      <div className="bg-gradient-to-br from-zinc-800 to-zinc-900/90 border border-zinc-700/40 rounded-[1.5rem] p-5 shadow-lg shadow-black/20">
        <h3 className="text-[14px] font-bold text-white mb-4">Νέο Προϊόν</h3>
        
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="Όνομα"
            className="flex-1 bg-zinc-900/80 border border-zinc-700/80 rounded-xl px-4 py-3 text-[13px] text-white placeholder-zinc-500 focus:outline-none focus:border-[#34d399]/50 transition-colors"
          />
          <div className="relative w-28">
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              placeholder="0.00"
              className="w-full bg-zinc-900/80 border border-zinc-700/80 rounded-xl px-4 py-3 text-[12px] text-white placeholder-zinc-500 focus:outline-none focus:border-[#34d399]/50 transition-colors text-right pr-8"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 font-medium">€</span>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4 overflow-x-auto hide-scrollbar">
          {(['food', 'beverage', 'snack', 'other'] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                hapticFeedback('light')
                setNewCategory(cat)
              }}
              className={cn(
                'flex-1 py-2.5 rounded-lg text-[10px] font-bold tracking-wider transition-all min-w-[70px]',
                newCategory === cat
                  ? 'bg-gradient-to-r from-[#34d399] to-[#10b981] text-black shadow-sm'
                  : 'bg-zinc-800/80 border border-zinc-700/50 text-zinc-400 hover:text-white hover:bg-zinc-700'
              )}
            >
              {CANTEEN_CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        <button
          onClick={handleAdd}
          disabled={!newLabel.trim() || !newPrice || isNaN(parseFloat(newPrice)) || parseFloat(newPrice) <= 0}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#34d399] to-[#10b981] text-black font-bold text-[11px] tracking-widest uppercase shadow-lg shadow-emerald-500/20 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Προσθηκη
        </button>
      </div>

      {/* Categories with items */}
      <div className="flex flex-col gap-3">
        <h3 className="text-[10px] font-bold tracking-[0.2em] text-zinc-500 uppercase px-1">Υπάρχοντα Προϊόντα</h3>
        
        {(Object.keys(itemsByCategory) as Array<'food' | 'beverage' | 'snack' | 'other'>).map((category) => {
          const categoryItems = itemsByCategory[category]
          const isExpanded = expandedCategory === category
          
          return (
            <div key={category} className="bg-gradient-to-br from-zinc-800 to-zinc-900/90 border border-zinc-700/40 rounded-[1.25rem] overflow-hidden shadow-lg shadow-black/10">
              <button
                onClick={() => {
                  hapticFeedback('light')
                  setExpandedCategory(isExpanded ? null : category)
                }}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-zinc-700/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[14px] font-bold text-white">{CANTEEN_CATEGORY_LABELS[category]}</span>
                  <span className="text-[9px] text-zinc-400 bg-zinc-900/50 px-2.5 py-1 rounded-lg font-bold">
                    {categoryItems.length}
                  </span>
                </div>
                <ChevronDown 
                  size={20} 
                  className={cn(
                    'text-zinc-500 transition-transform',
                    isExpanded && 'rotate-180'
                  )}
                />
              </button>

              {isExpanded && (
                <div className="border-t border-zinc-700/40 px-5 py-3 flex flex-col gap-2 bg-zinc-900/50">
                  {categoryItems.length > 0 ? (
                    categoryItems.map((item) => (
                      <div key={item.id}>
                        {editingId === item.id && editData ? (
                          <div className="flex flex-col gap-3 p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/40">
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={editData.name}
                                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                placeholder="Όνομα"
                                className="flex-1 bg-zinc-900/80 border border-zinc-700/80 rounded-lg px-3 py-2 text-[12px] text-white placeholder-zinc-600 focus:outline-none focus:border-[#34d399]/50 transition-colors"
                              />
                              <div className="relative w-24">
                                <input
                                  type="number"
                                  inputMode="decimal"
                                  step="0.01"
                                  value={editData.price}
                                  onChange={(e) => setEditData({ ...editData, price: parseFloat(e.target.value) || 0 })}
                                  placeholder="0.00"
                                  className="w-full bg-zinc-900/80 border border-zinc-700/80 rounded-lg px-3 py-2 text-[12px] text-white placeholder-zinc-600 focus:outline-none focus:border-[#34d399]/50 transition-colors text-right pr-6"
                                />
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-zinc-600">€</span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={cancelEdit}
                                className="flex-1 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors"
                              >
                                Ακυρωση
                              </button>
                              <button
                                onClick={saveEdit}
                                disabled={!editData.name.trim() || editData.price <= 0}
                                className="flex-1 py-2 rounded-lg bg-gradient-to-r from-[#34d399] to-[#10b981] text-black text-[10px] font-bold uppercase tracking-widest disabled:opacity-50 transition-opacity"
                              >
                                Αποθηκευση
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 p-3 bg-zinc-800/30 rounded-lg border border-zinc-700/30 hover:border-[#34d399]/20 transition-colors">
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-bold text-white">{item.name}</p>
                              <p className="text-[10px] text-zinc-500 font-medium">{item.price.toFixed(2)}€</p>
                            </div>
                            <button
                              onClick={() => startEdit(item)}
                              className="p-2 rounded-lg text-[#34d399] hover:bg-[#34d399]/10 transition-colors flex-shrink-0"
                              aria-label={`Επεξεργασία ${item.name}`}
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id, item.name)}
                              className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors flex-shrink-0"
                              aria-label={`Διαγραφή ${item.name}`}
                            >
                              <X size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-[10px] text-zinc-600 text-center py-3 font-medium">Δεν υπάρχουν προϊόντα</p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="flex gap-3 pt-4">
        <button
          onClick={onCancel}
          className="flex-1 py-4 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 font-bold text-[11px] tracking-widest uppercase hover:bg-zinc-800 hover:text-white transition-colors"
        >
          Κλεισιμο
        </button>
      </div>

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
