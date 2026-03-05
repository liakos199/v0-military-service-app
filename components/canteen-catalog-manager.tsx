'use client'

import { useState } from 'react'
import { Plus, Trash2, Edit2, X, ChevronDown, Check } from 'lucide-react'
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
  const [expandedCategory, setExpandedCategory] = useState<'food' | 'beverage' | 'snack' | 'other' | null>('food')

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
        Προσθέστε και διαχειρίστε τα προϊόντα του Κ.Ψ.Μ. που θα εμφανίζονται ως επιλογές κατά την καταχώρηση εξόδων.
      </p>

      {/* Add new item - Prominent section */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-foreground">Προσθήκη νέου προϊόντος</h3>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="Όνομα προϊόντος"
            className="flex-1 px-3 py-2.5 rounded-lg bg-background text-foreground text-sm min-h-[44px] border border-border placeholder:text-muted-foreground"
          />
          <div className="relative w-28">
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2.5 rounded-lg bg-background text-foreground text-sm min-h-[44px] border border-border placeholder:text-muted-foreground pr-8"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">€</span>
          </div>
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
                'flex-1 px-2 py-2 rounded-lg text-[11px] font-medium min-h-[36px] transition-colors border',
                newCategory === cat
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-foreground border-border'
              )}
            >
              {CANTEEN_CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        <button
          onClick={handleAdd}
          disabled={!newLabel.trim() || !newPrice || isNaN(parseFloat(newPrice)) || parseFloat(newPrice) <= 0}
          className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Προσθήκη στη λίστα
        </button>
      </div>

      {/* Categories with items */}
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-foreground">Προϊόντα κατά κατηγορία</h3>
        
        {(Object.keys(itemsByCategory) as Array<'food' | 'beverage' | 'snack' | 'other'>).map((category) => {
          const categoryItems = itemsByCategory[category]
          const isExpanded = expandedCategory === category
          
          return (
            <div key={category} className="glass-card rounded-xl overflow-hidden">
              <button
                onClick={() => {
                  hapticFeedback('light')
                  setExpandedCategory(isExpanded ? null : category)
                }}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{CANTEEN_CATEGORY_LABELS[category]}</span>
                  <span className="text-xs text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded">
                    {categoryItems.length}
                  </span>
                </div>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 text-muted-foreground transition-transform',
                    isExpanded && 'rotate-180'
                  )}
                />
              </button>

              {isExpanded && (
                <div className="border-t border-border/50 px-4 py-3 flex flex-col gap-2 bg-secondary/20">
                  {categoryItems.length > 0 ? (
                    categoryItems.map((item) => (
                      <div key={item.id}>
                        {editingId === item.id && editData ? (
                          <div className="flex flex-col gap-2 p-3 bg-background rounded-lg border border-border">
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={editData.name}
                                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                placeholder="Όνομα"
                                className="flex-1 px-3 py-2.5 rounded-lg bg-secondary text-foreground text-sm min-h-[40px] border border-border placeholder:text-muted-foreground"
                              />
                              <div className="relative w-20">
                                <input
                                  type="number"
                                  inputMode="decimal"
                                  step="0.01"
                                  value={editData.price}
                                  onChange={(e) => setEditData({ ...editData, price: parseFloat(e.target.value) || 0 })}
                                  placeholder="0.00"
                                  className="w-full px-3 py-2.5 rounded-lg bg-secondary text-foreground text-sm min-h-[40px] border border-border placeholder:text-muted-foreground pr-6"
                                />
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">€</span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={cancelEdit}
                                className="flex-1 py-2 rounded-lg bg-secondary text-foreground text-xs font-medium min-h-[36px] hover:bg-secondary/80 transition-colors"
                              >
                                Ακύρωση
                              </button>
                              <button
                                onClick={saveEdit}
                                disabled={!editData.name.trim() || editData.price <= 0}
                                className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold min-h-[36px] disabled:opacity-50 transition-opacity"
                              >
                                Αποθήκευση
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border/50 hover:border-border transition-colors">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground">{item.name}</p>
                              <p className="text-xs text-muted-foreground">{item.price.toFixed(2)}€</p>
                            </div>
                            <button
                              onClick={() => startEdit(item)}
                              className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground"
                              aria-label={`Επεξεργασία ${item.name}`}
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-2 rounded-lg hover:bg-destructive/10 transition-colors text-destructive"
                              aria-label={`Διαγραφή ${item.name}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground text-center py-2">Δεν υπάρχουν προϊόντα</p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 pt-4 border-t border-border/50">
        <button
          onClick={onCancel}
          className="flex-1 py-3 rounded-lg bg-secondary text-foreground font-medium text-sm min-h-[48px] hover:bg-secondary/80 transition-colors"
        >
          Ακύρωση
        </button>
        <button
          onClick={handleSave}
          className="flex-1 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm min-h-[48px] hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
        >
          <Check className="h-4 w-4" />
          Αποθήκευση
        </button>
      </div>
    </div>
  )
}

