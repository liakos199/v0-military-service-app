'use client'

import { useState } from 'react'
import { Plus, Trash2, Coffee, Edit2, Check, X, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { FullscreenModal } from '@/components/fullscreen-modal'
import { hapticFeedback, generateId } from '@/lib/helpers'
import type { CanteenCatalogItem } from '@/lib/types'
import { CANTEEN_CATEGORY_LABELS } from '@/lib/types'

export function CanteenCatalogTab() {
  const [items, setItems] = useLocalStorage<CanteenCatalogItem[]>('fantaros-canteen-catalog', [])
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<CanteenCatalogItem | null>(null)

  const availableItems = items.filter((item) => item.available)
  const unavailableItems = items.filter((item) => !item.available)
  const totalValue = items.reduce((sum, item) => sum + (item.price * (item.available ? 1 : 0)), 0)

  const handleDelete = (id: string) => {
    hapticFeedback('medium')
    setItems(items.filter((item) => item.id !== id))
  }

  const handleToggleAvailability = (id: string) => {
    hapticFeedback('light')
    setItems(items.map((item) =>
      item.id === id ? { ...item, available: !item.available } : item
    ))
  }

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
    setItems(items.map((item) =>
      item.id === editingId ? editData : item
    ))
    setEditingId(null)
    setEditData(null)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-background px-4 pt-4 pb-3 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Κ.Ψ.Μ. Κατάλογος</h1>
            <p className="text-xs text-muted-foreground">Διαχείριση καταλόγου εστιατορίου</p>
          </div>
          <button
            onClick={() => {
              hapticFeedback('light')
              setShowAdd(true)
            }}
            className="p-3 rounded-xl glass-card min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Προσθήκη νέου προϊόντος"
          >
            <Plus className="h-5 w-5 text-primary" />
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-28">
        <div className="flex flex-col gap-4 pt-4">
          {/* Summary Card */}
          <div className="glass-card rounded-xl p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Διαθέσιμα προϊόντα</span>
              <span className="text-lg font-bold text-primary">{availableItems.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Συνολική αξία</span>
              <span className="text-lg font-bold text-foreground">{totalValue.toFixed(2)}€</span>
            </div>
          </div>

          {/* Add Item Modal */}
          <FullscreenModal
            isOpen={showAdd}
            onClose={() => setShowAdd(false)}
            title="Νέο Προϊόν"
          >
            <AddItemForm
              onAdd={(item) => {
                setItems([item, ...items])
                setShowAdd(false)
              }}
              onCancel={() => setShowAdd(false)}
            />
          </FullscreenModal>

          {/* Available Items */}
          {availableItems.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Διαθέσιμα ({availableItems.length})
              </h2>
              <div className="flex flex-col gap-2">
                {availableItems.map((item) => (
                  <CatalogItemCard
                    key={item.id}
                    item={item}
                    isEditing={editingId === item.id}
                    editData={editData}
                    onEdit={startEdit}
                    onSaveEdit={saveEdit}
                    onCancelEdit={cancelEdit}
                    onDelete={handleDelete}
                    onToggleAvailability={handleToggleAvailability}
                    onEditDataChange={setEditData}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Unavailable Items */}
          {unavailableItems.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Μη διαθέσιμα ({unavailableItems.length})
              </h2>
              <div className="flex flex-col gap-2">
                {unavailableItems.map((item) => (
                  <CatalogItemCard
                    key={item.id}
                    item={item}
                    isEditing={editingId === item.id}
                    editData={editData}
                    onEdit={startEdit}
                    onSaveEdit={saveEdit}
                    onCancelEdit={cancelEdit}
                    onDelete={handleDelete}
                    onToggleAvailability={handleToggleAvailability}
                    onEditDataChange={setEditData}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {items.length === 0 && (
            <div className="glass-card rounded-xl p-6 text-center">
              <Coffee className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Δεν υπάρχουν προϊόντα</p>
              <p className="text-xs text-muted-foreground mt-1">Πάτησε + για προσθήκη</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface CatalogItemCardProps {
  item: CanteenCatalogItem
  isEditing: boolean
  editData: CanteenCatalogItem | null
  onEdit: (item: CanteenCatalogItem) => void
  onSaveEdit: () => void
  onCancelEdit: () => void
  onDelete: (id: string) => void
  onToggleAvailability: (id: string) => void
  onEditDataChange: (data: CanteenCatalogItem) => void
}

function CatalogItemCard({
  item,
  isEditing,
  editData,
  onEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  onToggleAvailability,
  onEditDataChange,
}: CatalogItemCardProps) {
  if (isEditing && editData) {
    return (
      <div className="glass-card rounded-xl p-4 flex flex-col gap-3">
        <div>
          <label className="block text-xs text-muted-foreground mb-1.5">Όνομα</label>
          <input
            type="text"
            value={editData.name}
            onChange={(e) => onEditDataChange({ ...editData, name: e.target.value })}
            placeholder="Π.χ. Καφές"
            className="w-full px-3 py-2.5 rounded-lg bg-secondary text-secondary-foreground text-sm min-h-[44px] border border-border placeholder:text-muted-foreground"
          />
        </div>

        <div>
          <label className="block text-xs text-muted-foreground mb-1.5">Κατηγορία</label>
          <div className="grid grid-cols-2 gap-2">
            {(['food', 'beverage', 'snack', 'other'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => onEditDataChange({ ...editData, category: cat })}
                className={cn(
                  'px-3 py-2 rounded-lg text-xs font-medium min-h-[40px] transition-colors',
                  editData.category === cat
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground'
                )}
              >
                {CANTEEN_CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs text-muted-foreground mb-1.5">Τιμή (€)</label>
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            value={editData.price}
            onChange={(e) => onEditDataChange({ ...editData, price: parseFloat(e.target.value) || 0 })}
            placeholder="0.00"
            className="w-full px-3 py-2.5 rounded-lg bg-secondary text-secondary-foreground text-sm min-h-[44px] border border-border placeholder:text-muted-foreground"
          />
        </div>

        <div>
          <label className="block text-xs text-muted-foreground mb-1.5">Περιγραφή (προαιρετικό)</label>
          <input
            type="text"
            value={editData.description || ''}
            onChange={(e) => onEditDataChange({ ...editData, description: e.target.value })}
            placeholder="Π.χ. Ελληνικός καφές"
            className="w-full px-3 py-2.5 rounded-lg bg-secondary text-secondary-foreground text-sm min-h-[44px] border border-border placeholder:text-muted-foreground"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={onCancelEdit}
            className="flex-1 py-2.5 rounded-lg bg-secondary text-secondary-foreground font-medium text-sm min-h-[44px] flex items-center justify-center gap-2"
          >
            <X className="h-4 w-4" />
            Ακύρωση
          </button>
          <button
            onClick={onSaveEdit}
            disabled={!editData.name.trim() || editData.price <= 0}
            className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm min-h-[44px] flex items-center justify-center gap-2 disabled:opacity-40"
          >
            <Check className="h-4 w-4" />
            Αποθήκευση
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      'glass-card rounded-xl p-3 flex items-center gap-3',
      !item.available && 'opacity-60'
    )}>
      <div className={cn(
        'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
        item.available ? 'bg-primary/20' : 'bg-muted/20'
      )}>
        <Coffee className={cn(
          'h-5 w-5',
          item.available ? 'text-primary' : 'text-muted-foreground'
        )} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn(
            'text-sm font-semibold truncate',
            item.available ? 'text-foreground' : 'text-muted-foreground line-through'
          )}>
            {item.name}
          </span>
          <span className="text-[10px] text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded">
            {CANTEEN_CATEGORY_LABELS[item.category]}
          </span>
        </div>
        {item.description && (
          <p className="text-[10px] text-muted-foreground mt-0.5">{item.description}</p>
        )}
      </div>

      <span className={cn(
        'text-sm font-bold flex-shrink-0',
        item.available ? 'text-foreground' : 'text-muted-foreground'
      )}>
        {item.price.toFixed(2)}€
      </span>

      <button
        onClick={() => onToggleAvailability(item.id)}
        className="p-2 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center text-muted-foreground hover:bg-secondary/50 transition-colors flex-shrink-0"
        aria-label={item.available ? 'Χαρακτηρισμός ως μη διαθέσιμο' : 'Χαρακτηρισμός ως διαθέσιμο'}
      >
        {item.available ? (
          <Eye className="h-4 w-4" />
        ) : (
          <EyeOff className="h-4 w-4" />
        )}
      </button>

      <button
        onClick={() => onEdit(item)}
        className="p-2 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center text-muted-foreground hover:bg-secondary/50 transition-colors flex-shrink-0"
        aria-label="Επεξεργασία"
      >
        <Edit2 className="h-4 w-4" />
      </button>

      <button
        onClick={() => onDelete(item.id)}
        className="p-2 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center text-destructive hover:bg-destructive/10 transition-colors flex-shrink-0"
        aria-label="Διαγραφή"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
}

interface AddItemFormProps {
  onAdd: (item: CanteenCatalogItem) => void
  onCancel: () => void
}

function AddItemForm({ onAdd, onCancel }: AddItemFormProps) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState<'food' | 'beverage' | 'snack' | 'other'>('food')
  const [description, setDescription] = useState('')

  const handleSubmit = () => {
    const parsedPrice = parseFloat(price)
    if (!name.trim() || !parsedPrice || parsedPrice <= 0) return

    hapticFeedback('heavy')
    onAdd({
      id: generateId(),
      name: name.trim(),
      price: parsedPrice,
      category,
      description: description.trim() || undefined,
      available: true,
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="block text-xs text-muted-foreground mb-1.5">Όνομα προϊόντος</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Π.χ. Καφές, Σάντουιτς..."
          className="w-full px-3 py-3 rounded-lg bg-secondary text-secondary-foreground text-sm min-h-[48px] border border-border placeholder:text-muted-foreground"
        />
      </div>

      <div>
        <label className="block text-xs text-muted-foreground mb-1.5">Κατηγορία</label>
        <div className="grid grid-cols-2 gap-2">
          {(['food', 'beverage', 'snack', 'other'] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                hapticFeedback('light')
                setCategory(cat)
              }}
              className={cn(
                'px-3 py-2.5 rounded-lg text-xs font-medium min-h-[44px] transition-colors',
                category === cat
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground'
              )}
            >
              {CANTEEN_CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs text-muted-foreground mb-1.5">Τιμή (€)</label>
        <input
          type="number"
          inputMode="decimal"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="0.00"
          className="w-full px-3 py-3 rounded-lg bg-secondary text-secondary-foreground text-sm min-h-[48px] border border-border placeholder:text-muted-foreground"
        />
      </div>

      <div>
        <label className="block text-xs text-muted-foreground mb-1.5">Περιγραφή (προαιρετικό)</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Π.χ. Ελληνικός καφές, Φρέσκο"
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
          disabled={!name.trim() || !price || parseFloat(price) <= 0}
          className="flex-1 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm min-h-[48px] disabled:opacity-40"
        >
          Προσθήκη
        </button>
      </div>
    </div>
  )
}
