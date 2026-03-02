'use client'

import { useState } from 'react'
import { Plus, Trash2, Lock, FileText, Eye, EyeOff, Edit3, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { FullscreenModal } from '@/components/fullscreen-modal'
import { hapticFeedback, formatGreekDate, generateId, toLocalDateString } from '@/lib/helpers'
import type { NoteEntry, DailyPassword } from '@/lib/types'

export function NotesTab() {
  const [activeSection, setActiveSection] = useState<'password' | 'notes'>('password')

  return (
    <div className="flex flex-col gap-4 pb-4">
      <div>
        <h1 className="text-xl font-bold text-foreground">Σημειώσεις</h1>
        <p className="text-xs text-muted-foreground">Κωδικοί & προσωπικά σημειώματα</p>
      </div>

      {/* Section Toggle */}
      <div className="flex gap-2 p-1 rounded-xl bg-secondary">
        <button
          onClick={() => {
            hapticFeedback('light')
            setActiveSection('password')
          }}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium min-h-[44px] transition-colors',
            activeSection === 'password'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground'
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
            'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium min-h-[44px] transition-colors',
            activeSection === 'notes'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground'
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
            <h2 className="text-sm font-semibold text-foreground">Σημερινός Κωδικός</h2>
            <p className="text-[10px] text-muted-foreground">{formatGreekDate(today)}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                hapticFeedback('light')
                setShowPassword(!showPassword)
              }}
              className="p-2 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label={showPassword ? 'Απόκρυψη' : 'Εμφάνιση'}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
            {!isEditing && (
              <button
                onClick={() => {
                  hapticFeedback('light')
                  setIsEditing(true)
                }}
                className="p-2 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Επεξεργασία"
              >
                <Edit3 className="h-4 w-4 text-primary" />
              </button>
            )}
          </div>
        </div>

        {isEditing ? (
          <div className="flex flex-col gap-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Σύνθημα</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Εισαγωγή συνθήματος..."
                className="w-full px-3 py-3 rounded-lg bg-secondary text-secondary-foreground text-sm min-h-[48px] border border-border font-mono placeholder:text-muted-foreground placeholder:font-sans"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Παρασύνθημα</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={countersign}
                onChange={(e) => setCountersign(e.target.value)}
                placeholder="Εισαγωγή παρασυνθήματος..."
                className="w-full px-3 py-3 rounded-lg bg-secondary text-secondary-foreground text-sm min-h-[48px] border border-border font-mono placeholder:text-muted-foreground placeholder:font-sans"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setIsEditing(false)
                  setPassword(todayPassword?.password || '')
                  setCountersign(todayPassword?.countersign || '')
                }}
                className="flex-1 py-3 rounded-lg bg-secondary text-secondary-foreground font-medium text-sm min-h-[48px] flex items-center justify-center gap-1"
              >
                <X className="h-4 w-4" />
                Ακύρωση
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm min-h-[48px] flex items-center justify-center gap-1"
              >
                <Check className="h-4 w-4" />
                Αποθήκευση
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="p-3 rounded-lg bg-secondary">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Σύνθημα</p>
              <p className={cn('text-base font-mono font-bold', showPassword ? 'text-foreground' : 'text-foreground blur-sm select-none')}>
                {password || '---'}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-secondary">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Παρασύνθημα</p>
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
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Προηγούμενοι</h3>
          <div className="flex flex-col gap-2">
            {passwords
              .filter((p) => p.date !== today)
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(0, 7)
              .map((p) => (
                <div key={p.date} className="glass-card rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{formatGreekDate(p.date)}</p>
                    <p className="text-sm font-mono text-foreground mt-0.5">
                      {showPassword ? p.password : '****'} / {showPassword ? p.countersign : '****'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      hapticFeedback('medium')
                      setPasswords(passwords.filter((pw) => pw.date !== p.date))
                    }}
                    className="p-2 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center text-destructive"
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
        <h2 className="text-sm font-semibold text-foreground">Προσωπικές Σημειώσεις</h2>
        <button
          onClick={() => {
            hapticFeedback('light')
            setShowAdd(true)
          }}
          className="p-2 rounded-xl glass-card min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Νέα σημείωση"
        >
          <Plus className="h-5 w-5 text-primary" />
        </button>
      </div>

      {/* Add Note Modal */}
      <FullscreenModal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        title="Νέα Σημείωση"
      >
        <AddNoteForm onAdd={handleAdd} onCancel={() => setShowAdd(false)} />
      </FullscreenModal>

      {notes.length === 0 ? (
        <div className="glass-card rounded-xl p-6 text-center">
          <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Δεν υπάρχουν σημειώσεις</p>
        </div>
      ) : (
        notes.map((note) => (
          <div key={note.id} className="glass-card rounded-xl p-3">
            <div className="flex items-start justify-between">
              <p className="text-[10px] text-muted-foreground">{formatGreekDate(note.date)}</p>
              <div className="flex items-center gap-1">
                {editingId === note.id ? (
                  <>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-1.5 rounded-lg min-h-[36px] min-w-[36px] flex items-center justify-center"
                      aria-label="Ακύρωση"
                    >
                      <X className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => handleUpdate(note.id)}
                      className="p-1.5 rounded-lg min-h-[36px] min-w-[36px] flex items-center justify-center"
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
                      className="p-1.5 rounded-lg min-h-[36px] min-w-[36px] flex items-center justify-center"
                      aria-label="Επεξεργασία"
                    >
                      <Edit3 className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => {
                        hapticFeedback('medium')
                        setNotes(notes.filter((n) => n.id !== note.id))
                      }}
                      className="p-1.5 rounded-lg min-h-[36px] min-w-[36px] flex items-center justify-center"
                      aria-label="Διαγραφή"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </button>
                  </>
                )}
              </div>
            </div>
            {editingId === note.id ? (
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full mt-2 px-3 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm min-h-[80px] border border-border resize-none"
                autoFocus
              />
            ) : (
              <p className="text-sm text-foreground mt-1.5 whitespace-pre-wrap">{note.content}</p>
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
        className="w-full px-3 py-3 rounded-lg bg-secondary text-secondary-foreground text-sm min-h-[200px] border border-border resize-none placeholder:text-muted-foreground"
        autoFocus
      />
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="flex-1 py-3 rounded-lg bg-secondary text-secondary-foreground font-medium text-sm min-h-[48px]"
        >
          Ακύρωση
        </button>
        <button
          onClick={() => content.trim() && onAdd(content.trim())}
          disabled={!content.trim()}
          className="flex-1 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm min-h-[48px] disabled:opacity-40"
        >
          Προσθήκη
        </button>
      </div>
    </div>
  )
}
