'use client'

import { useState } from 'react'
import { Plus, Trash2, FileText, Edit3, Check, X, BookOpen, ChevronDown, Star, Radio, Heart, Award } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { BottomSheet } from '@/components/bottom-sheet'
import { hapticFeedback, formatGreekDate, generateId, toLocalDateString } from '@/lib/helpers'
import type { NoteEntry } from '@/lib/types'

export function NotesTab() {
  const [activeSection, setActiveSection] = useState<'notes' | 'manuals'>('notes')

  return (
    <div className="flex flex-col gap-5 pb-4">
      <div>
        <h1 className="text-xl font-bold text-foreground text-balance">Σημειώσεις</h1>
        <p className="text-xs text-muted-foreground">Σημειώματα & στρατιωτικά εγχειρίδια</p>
      </div>

      {/* Section Toggle */}
      <div className="flex gap-1.5 p-1 rounded-2xl bg-secondary/80">
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
        <button
          onClick={() => {
            hapticFeedback('light')
            setActiveSection('manuals')
          }}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold min-h-[44px] transition-all',
            activeSection === 'manuals'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground active:bg-secondary'
          )}
        >
          <BookOpen className="h-4 w-4" />
          Εγχειρίδια
        </button>
      </div>

      {activeSection === 'notes' ? <NotesSection /> : <ManualsSection />}
    </div>
  )
}

/* ────────────────────────────────────────────
   Personal Notes Section
   ──────────────────────────────────────────── */

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

/* ────────────────────────────────────────────
   Add Note Form
   ──────────────────────────────────────────── */

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

/* ────────────────────────────────────────────
   Military Manuals Section
   ──────────────────────────────────────────── */

interface ManualSection {
  id: string
  title: string
  subtitle: string
  icon: typeof Star
  iconBg: string
  iconColor: string
  content: ManualContentBlock[]
}

interface ManualContentBlock {
  heading?: string
  note?: string
  items: { label: string; detail: string }[]
}

const MANUALS: ManualSection[] = [
  {
    id: 'ranks',
    title: 'Στρατιωτικοί Βαθμοί',
    subtitle: 'Στρατός Ξηράς',
    icon: Award,
    iconBg: 'bg-amber-500/15',
    iconColor: 'text-amber-500',
    content: [
      {
        heading: 'Υπαξιωματικοί',
        note: 'Δεν χαιρετάμε, στεκόμαστε προσοχή',
        items: [
          { label: 'Δεκανέας', detail: '1 γαλόνι (V)' },
          { label: 'Λοχίας', detail: '2 γαλόνια' },
          { label: 'Επιλοχίας', detail: '3 γαλόνια' },
          { label: 'Αρχιλοχίας', detail: '4 γαλόνια' },
        ],
      },
      {
        heading: 'Κατώτεροι Αξιωματικοί',
        note: 'Χαιρετάμε',
        items: [
          { label: 'Ανθυπολοχαγός', detail: '1 ασημένιο αστέρι' },
          { label: 'Υπολοχαγός', detail: '2 ασημένια αστέρια' },
          { label: 'Λοχαγός', detail: '3 ασημένια αστέρια (Διοικητής Λόχου)' },
        ],
      },
      {
        heading: 'Ανώτεροι Αξιωματικοί',
        note: 'Χαιρετάμε',
        items: [
          { label: 'Ταγματάρχης', detail: '1 χρυσή φλογοφόρος ροιά' },
          { label: 'Αντισυνταγματάρχης', detail: '2 χρυσές φλογοφόρες' },
          { label: 'Συνταγματάρχης', detail: '3 χρυσές φλογοφόρες (Διοικητής Μονάδας)' },
        ],
      },
      {
        heading: 'Ανώτατοι Αξιωματικοί',
        note: 'Χαιρετάμε',
        items: [
          { label: 'Ταξίαρχος', detail: '1 χρυσό αστέρι + 1 φλογοφόρος' },
          { label: 'Υποστράτηγος', detail: '2 χρυσά αστέρια + 1 φλογοφόρος' },
          { label: 'Αντιστράτηγος', detail: '3 χρυσά αστέρια + 1 φλογοφόρος' },
          { label: 'Στρατηγός', detail: '4 χρυσά αστέρια + 1 φλογοφόρος' },
        ],
      },
    ],
  },
  {
    id: 'phonetic',
    title: 'Φωνητικό Αλφάβητο',
    subtitle: 'Αλφάβητο & ασύρματος',
    icon: Radio,
    iconBg: 'bg-blue-500/15',
    iconColor: 'text-blue-500',
    content: [
      {
        heading: 'Ελληνικό Τυποποιημένο Φωνητικό Αλφάβητο',
        items: [
          { label: 'Α', detail: 'Αστήρ' },
          { label: 'Β', detail: 'Βύρων' },
          { label: 'Γ', detail: 'Γαλή' },
          { label: 'Δ', detail: 'Δόξα' },
          { label: 'Ε', detail: 'Ερμής' },
          { label: 'Ζ', detail: 'Ζεύς' },
          { label: 'Η', detail: 'Ηρώ' },
          { label: 'Θ', detail: 'Θεά' },
          { label: 'Ι', detail: 'Ίσκιος' },
          { label: 'Κ', detail: 'Κενόν' },
          { label: 'Λ', detail: 'Λάμα' },
          { label: 'Μ', detail: 'Μέλι' },
          { label: 'Ν', detail: 'Ναός' },
          { label: 'Ξ', detail: 'Ξέρξης' },
          { label: 'Ο', detail: 'Οσμή' },
          { label: 'Π', detail: 'Πέτρος' },
          { label: 'Ρ', detail: 'Ρήγας' },
          { label: 'Σ', detail: 'Σοφός' },
          { label: 'Τ', detail: 'Τίγρης' },
          { label: 'Υ', detail: 'Ύμνος' },
          { label: 'Φ', detail: 'Φωφώ' },
          { label: 'Χ', detail: 'Χαρά' },
          { label: 'Ψ', detail: 'Ψυχή' },
          { label: 'Ω', detail: 'Ωμέγα' },
        ],
      },
      {
        heading: 'Βασική Ορολογία Ασυρμάτου',
        items: [
          { label: 'Λήψη;', detail: 'Με ακούς;' },
          { label: 'Ορθόν', detail: 'Σωστά / Κατανοητό' },
          { label: 'Άκυρον', detail: 'Λάθος / Αγνόησε το προηγούμενο' },
          { label: 'Ομιλείτε', detail: 'Ξεκίνα να μιλάς / Έχεις τον λόγο' },
        ],
      },
    ],
  },
  {
    id: 'firstaid',
    title: 'Πρώτες Βοήθειες',
    subtitle: 'Βασικές οδηγίες πεδίου',
    icon: Heart,
    iconBg: 'bg-red-500/15',
    iconColor: 'text-red-500',
    content: [
      {
        heading: 'Θερμική Εξάντληση / Θερμοπληξία',
        items: [
          { label: '1.', detail: 'Μεταφορά άμεσα σε σκιερό και δροσερό μέρος.' },
          { label: '2.', detail: 'Αφαίρεση εξάρτυσης, κράνους και χιτωνίου.' },
          { label: '3.', detail: 'Ενυδάτωση με μικρές, συχνές γουλιές νερού (όχι απότομα).' },
          { label: '4.', detail: 'Δροσισμός με βρεγμένο πανί στον αυχένα, το μέτωπο και τις μασχάλες.' },
        ],
      },
      {
        heading: 'Αιμορραγία (Κόψιμο/Τραύμα)',
        items: [
          { label: '1.', detail: 'Άσκηση άμεσης και σταθερής πίεσης στο τραύμα με καθαρή γάζα ή επίδεσμο.' },
          { label: '2.', detail: 'Διατήρηση πίεσης συνεχόμενα για τουλάχιστον 5-10 λεπτά.' },
          { label: '3.', detail: 'Ανύψωση τραυματισμένου μέλους πάνω από το επίπεδο της καρδιάς (εφόσον δεν υπάρχει κάταγμα).' },
        ],
      },
      {
        heading: 'Διάστρεμμα (Στραμπούληγμα)',
        note: 'Μέθοδος Κ.Π.Α.Α.',
        items: [
          { label: 'Κ', detail: 'Κατάκλιση - Ακινησία του μέλους.' },
          { label: 'Π', detail: 'Πάγος - Κρύο νερό/βρεγμένο πανί για 15-20 λεπτά.' },
          { label: 'Α', detail: 'Ανύψωση - Τοποθέτηση ποδιού ψηλά.' },
          { label: 'Α', detail: 'Ανάπαυση.' },
        ],
      },
      {
        heading: 'Τσίμπημα Εντόμου/Μέλισσας/Σφήκας',
        items: [
          { label: '1.', detail: 'Αφαίρεση κεντριού ξύνοντας απαλά (π.χ. με κάρτα), όχι με τα δάχτυλα.' },
          { label: '2.', detail: 'Πλύσιμο με άφθονο νερό (και σαπούνι αν υπάρχει).' },
          { label: '3.', detail: 'Κρύο επίθεμα/πάγος για μείωση πρηξίματος και πόνου.' },
          { label: '4.', detail: 'Παρακολούθηση για αλλεργική αντίδραση (δυσκολία αναπνοής, πρήξιμο προσώπου). Αν εμφανιστούν, άμεση ιατρική βοήθεια.' },
        ],
      },
    ],
  },
]

function ManualsSection() {
  const [openManualId, setOpenManualId] = useState<string | null>(null)

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-muted-foreground leading-relaxed">
        Γενικές πληροφορίες και εγχειρίδια για τον στρατιώτη. Πάτησε σε ένα εγχειρίδιο για να δεις τα περιεχόμενα.
      </p>

      {MANUALS.map((manual) => {
        const isOpen = openManualId === manual.id
        const Icon = manual.icon

        return (
          <div key={manual.id} className="glass-card rounded-2xl overflow-hidden">
            {/* Header - always visible */}
            <button
              onClick={() => {
                hapticFeedback('light')
                setOpenManualId(isOpen ? null : manual.id)
              }}
              className="w-full flex items-center gap-3 p-4 active:bg-secondary/60 transition-colors min-h-[60px]"
            >
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', manual.iconBg)}>
                <Icon className={cn('h-5 w-5', manual.iconColor)} />
              </div>
              <div className="flex-1 text-left min-w-0">
                <h3 className="text-sm font-bold text-foreground">{manual.title}</h3>
                <p className="text-[11px] text-muted-foreground">{manual.subtitle}</p>
              </div>
              <ChevronDown
                className={cn(
                  'h-4.5 w-4.5 text-muted-foreground shrink-0 transition-transform duration-200',
                  isOpen && 'rotate-180'
                )}
              />
            </button>

            {/* Expandable content */}
            {isOpen && (
              <div className="px-4 pb-4 pt-0">
                <div className="border-t border-border/50 pt-4 flex flex-col gap-5">
                  {manual.content.map((block, blockIdx) => (
                    <div key={blockIdx}>
                      {block.heading && (
                        <div className="mb-2.5">
                          <h4 className="text-xs font-bold text-foreground">{block.heading}</h4>
                          {block.note && (
                            <p className="text-[10px] text-primary font-medium mt-0.5">{block.note}</p>
                          )}
                        </div>
                      )}
                      <div className="flex flex-col gap-1.5">
                        {block.items.map((item, itemIdx) => (
                          <div key={itemIdx} className="flex gap-2.5 py-1.5 px-3 rounded-lg bg-secondary/50">
                            <span className="text-xs font-bold text-primary shrink-0 min-w-[24px]">{item.label}</span>
                            <span className="text-xs text-foreground leading-relaxed">{item.detail}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
