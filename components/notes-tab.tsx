'use client'

import { useState } from 'react'
import { Plus, Trash2, Lock, FileText, Eye, EyeOff, Edit3, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { BottomSheet } from '@/components/bottom-sheet'
import { hapticFeedback, formatGreekDate, generateId, toLocalDateString } from '@/lib/helpers'
import type { NoteEntry, DailyPassword } from '@/lib/types'

export function NotesTab() {
  const [activeSection, setActiveSection] = useState<'password' | 'notes'>('password')

  return (
    <div className="flex flex-col gap-5 pb-4">
      <div>
        <h1 className="text-xl font-bold text-foreground text-balance">Σημειώσεις</h1>
        <p className="text-xs text-muted-foreground">Κωδικοί & προσωπικά σημειώματα</p>
      </div>

      {/* Section Toggle */}
      <div className="flex gap-1.5 p-1 rounded-2xl bg-secondary/80">
        <button
          onClick={() => {
            hapticFeedback('light')
            setActiveSection('password')
          }}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold min-h-[44px] transition-all',
            activeSection === 'password'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground active:bg-secondary'
          )}
        >
          <Lock className="h-4 w-4" />
          Σύνθημα
        </button>
        <button
          onClick={() => {
            hapticFeedback('light')
            setActiveSection('notes')
          }}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold min-h-[44px] transition-all',
            activeSection === 'notes'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground active:bg-secondary'
          )}
        >
          <FileText className="h-4 w-4" />
          Σημειώσεις
        </button>
      </div>

      {activeSection === 'password' ? <PasswordSection /> : <NotesSection />}
    </div>
  )
}

function PasswordSection() {
  const today = toLocalDateString()
  const [passwords, setPasswords] = useLocalStorage<DailyPassword[]>('fantaros-passwords', [])
  const [showPassword, setShowPassword] = useState(false)

  const todayPassword = passwords.find((p) => p.date === today)
  const [password, setPassword] = useState(todayPassword?.password || '')
  const [countersign, setCountersign] = useState(todayPassword?.countersign || '')
  const [isEditing, setIsEditing] = useState(!todayPassword)

  const handleSave = () => {
    hapticFeedback('heavy')
    const updated = passwords.filter((p) => p.date !== today)
    updated.push({ date: today, password, countersign })
    setPasswords(updated)
    setIsEditing(false)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-foreground">Σημερινός Κωδικός</h2>
            <p className="text-[10px] text-muted-foreground mt-0.5">{formatGreekDate(today)}</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                hapticFeedback('light')
                setShowPassword(!showPassword)
              }}
              className="p-2.5 rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center active:bg-secondary transition-colors"
              aria-label={showPassword ? 'Απόκρυψη' : 'Εμφάνιση'}
            >
              {showPassword ? (
                <EyeOff className="h-4.5 w-4.5 text-muted-foreground" />
              ) : (
                <Eye className="h-4.5 w-4.5 text-muted-foreground" />
              )}
            </button>
            {!isEditing && (
              <button
                onClick={() => {
                  hapticFeedback('light')
                  setIsEditing(true)
                }}
                className="p-2.5 rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center active:bg-secondary transition-colors"
                aria-label="Επεξεργασία"
              >
                <Edit3 className="h-4.5 w-4.5 text-primary" />
              </button>
            )}
          </div>
        </div>

        {isEditing ? (
          <div className="flex flex-col gap-3">
            <div>
              <label className="block text-[11px] text-muted-foreground font-medium mb-1.5 uppercase tracking-wider">Σύνθημα</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Εισαγωγή συνθήματος..."
                className="w-full px-3 py-3 rounded-xl bg-secondary text-secondary-foreground text-sm min-h-[48px] border border-border font-mono placeholder:text-muted-foreground placeholder:font-sans"
              />
            </div>
            <div>
              <label className="block text-[11px] text-muted-foreground font-medium mb-1.5 uppercase tracking-wider">Παρασύνθημα</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={countersign}
                onChange={(e) => setCountersign(e.target.value)}
                placeholder="Εισαγωγή παρασυνθήματος..."
                className="w-full px-3 py-3 rounded-xl bg-secondary text-secondary-foreground text-sm min-h-[48px] border border-border font-mono placeholder:text-muted-foreground placeholder:font-sans"
              />
            </div>
            <div className="flex gap-2.5 pt-1">
              <button
                onClick={() => {
                  setIsEditing(false)
                  setPassword(todayPassword?.password || '')
                  setCountersign(todayPassword?.countersign || '')
                }}
                className="flex-1 py-3 rounded-xl bg-secondary text-secondary-foreground font-semibold text-sm min-h-[48px] flex items-center justify-center gap-1.5 active:scale-[0.97] transition-transform"
              >
                <X className="h-4 w-4" />
                Ακύρωση
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm min-h-[48px] flex items-center justify-center gap-1.5 active:scale-[0.97] transition-transform"
              >
                <Check className="h-4 w-4" />
                Αποθήκευση
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            <div className="p-3.5 rounded-xl bg-secondary/80">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1.5">Σύνθημα</p>
              <p className={cn('text-base font-mono font-bold', showPassword ? 'text-foreground' : 'text-foreground blur-sm select-none')}>
                {password || '---'}
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-secondary/80">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1.5">Παρασύνθημα</p>
              <p className={cn('text-base font-mono font-bold', showPassword ? 'text-foreground' : 'text-foreground blur-sm select-none')}>
                {countersign || '---'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Previous Passwords */}
      {passwords.filter((p) => p.date !== today).length > 0 && (
        <div>
          <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2.5">Προηγούμενοι</h3>
          <div className="flex flex-col gap-2">
            {passwords
              .filter((p) => p.date !== today)
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(0, 7)
              .map((p) => (
                <div key={p.date} className="glass-card rounded-2xl p-3.5 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] text-muted-foreground">{formatGreekDate(p.date)}</p>
                    <p className="text-sm font-mono font-semibold text-foreground mt-0.5">
                      {showPassword ? p.password : '****'} / {showPassword ? p.countersign : '****'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      hapticFeedback('medium')
                      setPasswords(passwords.filter((pw) => pw.date !== p.date))
                    }}
                    className="p-2.5 rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center text-destructive/70 active:text-destructive active:bg-destructive/10 transition-colors"
                    aria-label="Διαγραφή"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}

function NotesSection() {
  const [notes, setNotes] = useLocalStorage<NoteEntry[]>('fantaros-notes', [])
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')

  const handleAdd = (content: string) => {
    hapticFeedback('heavy')
    setNotes([
      { id: generateId(), date: toLocalDateString(), content },
      ...notes,
    ])
    setShowAdd(false)
  }

  const handleUpdate = (id: string) => {
    hapticFeedback('medium')
    setNotes(notes.map((n) => n.id === id ? { ...n, content: editContent } : n))
    setEditingId(null)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-foreground">Προσωπικές Σημειώσεις</h2>
        <button
          onClick={() => {
            hapticFeedback('light')
            setShowAdd(true)
          }}
          className="p-2.5 rounded-xl glass-card min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95 transition-transform"
          aria-label="Νέα σημείωση"
        >
          <Plus className="h-5 w-5 text-primary" />
        </button>
      </div>

      {/* Add Note Bottom Sheet */}
      <BottomSheet
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        title="Νέα Σημείωση"
        size="full"
      >
        <AddNoteForm onAdd={handleAdd} onCancel={() => setShowAdd(false)} />
      </BottomSheet>

      {notes.length === 0 ? (
        <div className="glass-card rounded-2xl p-8 text-center">
          <FileText className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-medium text-muted-foreground/70">Δεν υπάρχουν σημειώσεις</p>
          <p className="text-xs text-muted-foreground/50 mt-1">Πάτησε + για να προσθέσεις</p>
        </div>
      ) : (
        notes.map((note) => (
          <div key={note.id} className="glass-card rounded-2xl p-3.5">
            <div className="flex items-start justify-between">
              <p className="text-[10px] text-muted-foreground font-medium">{formatGreekDate(note.date)}</p>
              <div className="flex items-center gap-0.5">
                {editingId === note.id ? (
                  <>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-2 rounded-xl min-h-[40px] min-w-[40px] flex items-center justify-center active:bg-secondary transition-colors"
                      aria-label="Ακύρωση"
                    >
                      <X className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => handleUpdate(note.id)}
                      className="p-2 rounded-xl min-h-[40px] min-w-[40px] flex items-center justify-center active:bg-primary/10 transition-colors"
                      aria-label="Αποθήκευση"
                    >
                      <Check className="h-3.5 w-3.5 text-primary" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        hapticFeedback('light')
                        setEditingId(note.id)
                        setEditContent(note.content)
                      }}
                      className="p-2 rounded-xl min-h-[40px] min-w-[40px] flex items-center justify-center active:bg-secondary transition-colors"
                      aria-label="Επεξεργασία"
                    >
                      <Edit3 className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => {
                        hapticFeedback('medium')
                        setNotes(notes.filter((n) => n.id !== note.id))
                      }}
                      className="p-2 rounded-xl min-h-[40px] min-w-[40px] flex items-center justify-center text-destructive/70 active:text-destructive transition-colors"
                      aria-label="Διαγραφή"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>
            {editingId === note.id ? (
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full mt-2 px-3 py-2.5 rounded-xl bg-secondary text-secondary-foreground text-sm min-h-[80px] border border-border resize-none"
                autoFocus
              />
            ) : (
              <p className="text-sm text-foreground mt-2 whitespace-pre-wrap leading-relaxed">{note.content}</p>
            )}
          </div>
        ))
      )}
    </div>
  )
}

function AddNoteForm({ onAdd, onCancel }: { onAdd: (content: string) => void; onCancel: () => void }) {
  const [content, setContent] = useState('')

  return (
    <div className="flex flex-col gap-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Γράψε εδώ..."
        className="w-full px-3 py-3 rounded-xl bg-secondary text-secondary-foreground text-sm min-h-[200px] border border-border resize-none placeholder:text-muted-foreground leading-relaxed"
        autoFocus
      />
      <div className="flex gap-2.5">
        <button
          onClick={onCancel}
          className="flex-1 py-3.5 rounded-xl bg-secondary text-secondary-foreground font-semibold text-sm min-h-[52px] active:scale-[0.97] transition-transform"
        >
          Ακύρωση
        </button>
        <button
          onClick={() => content.trim() && onAdd(content.trim())}
          disabled={!content.trim()}
          className="flex-1 py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm min-h-[52px] disabled:opacity-40 active:scale-[0.97] transition-transform"
        >
          Προσθήκη
        </button>
      </div>
    </div>
  )
}
