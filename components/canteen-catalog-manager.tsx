'use client'

import { useState } from 'react'
import { Plus, Trash2, Coffee, Edit2, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { hapticFeedback, generateId } from '@/lib/helpers'
import type { CanteenCatalogItem } from '@/lib/types'
import { CANTEEN_CATEGORY_LABELS } from '@/lib/types'

interface CanteenCatalogManagerProps {
  items: CanteenCatalogItem[]
  onSave: (items: CanteenCatalogItem[]) => void
  onCancel: () => void
}

export function CanteenCatalogManager({ items, onSave, onCancel }: CanteenCatalogManagerProps) {
  const [catalogItems, setCatalogItems] = useState<CanteenCatalogItem[]>(items)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<CanteenCatalogItem | null>(null)
  const [newLabel, setNewLabel] = useState('')
  const [newPrice, setNewPrice] = useState('')
  const [newCategory, setNewCategory] = useState<'food' | 'beverage' | 'snack' | 'other'>('food')

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
    setCatalogItems(catalogItems.map((item) =>
      item.id === editingId ? editData : item
    ))
    setEditingId(null)
    setEditData(null)
  }

  const handleDelete = (id: string) => {
    hapticFeedback('medium')
    setCatalogItems(catalogItems.filter((item) => item.id !== id))
  }

  const handleAdd = () => {
    const parsedPrice = parseFloat(newPrice)
    // Validate both name and price are provided and valid
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
    setCatalogItems([...catalogItems, newItem])
    setNewLabel('')
    setNewPrice('')
    setNewCategory('food')
  }

  const handleSave = () => {
    hapticFeedback('heavy')
    onSave(catalogItems)
  }

  // Group items by category
  const itemsByCategory = {
    food: catalogItems.filter((item) => item.category === 'food'),
    beverage: catalogItems.filter((item) => item.category === 'beverage'),
    snack: catalogItems.filter((item) => item.category === 'snack'),
    other: catalogItems.filter((item) => item.category === 'other'),
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-muted-foreground">
        Διαχειρίστε τα προϊόντα του Κ.Ψ.Μ. που θα εμφανίζονται ως γρήγορες επιλογές.
      </p>

      {/* Categories with items */}
      <div className="flex flex-col gap-4">
        {(Object.keys(itemsByCategory) as Array<'food' | 'beverage' | 'snack' | 'other'>).map((category) => {
          const categoryItems = itemsByCategory[category]
          return (
            <div key={category}>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {CANTEEN_CATEGORY_LABELS[category]} ({categoryItems.length})
              </h3>
              {categoryItems.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {categoryItems.map((item) => (
                    <div key={item.id}>
                      {editingId === item.id && editData ? (
                        <div className="glass-card rounded-xl p-3 flex flex-col gap-2">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={editData.name}
                              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                              placeholder="Όνομα"
                              className="flex-1 px-3 py-2.5 rounded-lg bg-secondary text-secondary-foreground text-sm min-h-[44px] border border-border placeholder:text-muted-foreground"
                            />
                            <div className="relative w-24">
                              <input
                                type="number"
                                inputMode="decimal"
                                step="0.01"
                                value={editData.price}
                                onChange={(e) => setEditData({ ...editData, price: parseFloat(e.target.value) || 0 })}
                                placeholder="0.00"
                                className="w-full px-3 py-2.5 rounded-lg bg-secondary text-secondary-foreground text-sm min-h-[44px] border border-border placeholder:text-muted-foreground pr-8"
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">€</span>
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
                              onClick={saveEdit}
                              disabled={!editData.name.trim() || editData.price <= 0}
                              className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold min-h-[40px] disabled:opacity-40"
                            >
                              Ενημέρωση
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="glass-card rounded-xl p-3 flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium text-foreground">{item.name}</span>
                            <span className="text-xs text-muted-foreground ml-2">{item.price.toFixed(2)}€</span>
                          </div>
                          <button
                            onClick={() => startEdit(item)}
                            className="p-2 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center text-muted-foreground"
                            aria-label={`Επεξεργασία ${item.name}`}
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center text-destructive"
                            aria-label={`Διαγραφή ${item.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="glass-card rounded-xl p-3 text-center">
                  <p className="text-xs text-muted-foreground">Δεν υπάρχουν προϊόντα</p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Add new item */}
      <div className="glass-card rounded-xl p-3">
        <label className="block text-xs text-muted-foreground mb-2">Προσθήκη νέου προϊόντος</label>
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Όνομα"
              className="flex-1 px-3 py-2.5 rounded-lg bg-secondary text-secondary-foreground text-sm min-h-[44px] border border-border placeholder:text-muted-foreground"
            />
            <div className="relative w-24">
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2.5 rounded-lg bg-secondary text-secondary-foreground text-sm min-h-[44px] border border-border placeholder:text-muted-foreground pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">€</span>
            </div>
            <button
              onClick={handleAdd}
              disabled={!newLabel.trim() || !newPrice || isNaN(parseFloat(newPrice)) || parseFloat(newPrice) <= 0}
              className="p-2.5 rounded-lg bg-primary text-primary-foreground min-h-[44px] min-w-[44px] flex items-center justify-center disabled:opacity-40"
              aria-label="Προσθήκη"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
          <div className="flex gap-2">
            {(['food', 'beverage', 'snack', 'other'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  hapticFeedback('light')
                  setNewCategory(cat)
                }}
                className={cn(
                  'flex-1 px-2 py-1.5 rounded-lg text-[10px] font-medium min-h-[36px] transition-colors',
                  newCategory === cat
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground'
                )}
              >
                {CANTEEN_CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Save / Cancel */}
      <div className="flex gap-2 pt-2">
        <button
          onClick={onCancel}
          className="flex-1 py-3 rounded-lg bg-secondary text-secondary-foreground font-medium text-sm min-h-[48px]"
        >
          Ακύρωση
        </button>
        <button
          onClick={handleSave}
          className="flex-1 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm min-h-[48px]"
        >
          Αποθήκευση
        </button>
      </div>
    </div>
  )
}
