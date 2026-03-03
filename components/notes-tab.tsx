'use client'

import { useState } from 'react'
import {
  Plus,
  Trash2,
  FileText,
  BookOpen,
  Edit3,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Star,
  Radio,
  HeartPulse,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { FullscreenModal } from '@/components/fullscreen-modal'
import { hapticFeedback, formatGreekDate, generateId, toLocalDateString } from '@/lib/helpers'
import type { NoteEntry } from '@/lib/types'

/* ========== GUIDE DATA ========== */
const MILITARY_GUIDES = [
  {
    id: 'ranks',
    title: 'Στρατιωτικοί Βαθμοί',
    icon: 'star',
    sections: [
      {
        heading: 'Υπαξιωματικοί (Δεν χαιρετάμε, στεκόμαστε προσοχή)',
        items: [
          'Δεκανέας: 1 γαλόνι (V)',
          'Λοχίας: 2 γαλόνια',
          'Επιλοχίας: 3 γαλόνια',
          'Αρχιλοχίας: 4 γαλόνια',
        ],
      },
      {
        heading: 'Κατώτεροι Αξιωματικοί (Χαιρετάμε)',
        items: [
          'Ανθυπολοχαγός: 1 ασημένιο αστέρι',
          'Υπολοχαγός: 2 ασημένια αστέρια',
          'Λοχαγός: 3 ασημένια αστέρια (Συνήθως Διοικητής Λόχου)',
        ],
      },
      {
        heading: 'Ανώτεροι Αξιωματικοί (Χαιρετάμε)',
        items: [
          'Ταγματάρχης: 1 χρυσή φλογοφόρος ροιά (κορώνα)',
          'Αντισυνταγματάρχης: 2 χρυσές φλογοφόρες',
          'Συνταγματάρχης: 3 χρυσές φλογοφόρες (Συνήθως Διοικητής Μονάδας/Στρατοπέδου)',
        ],
      },
      {
        heading: 'Ανώτατοι Αξιωματικοί (Χαιρετάμε)',
        items: [
          'Ταξίαρχος: 1 χρυσό αστέρι και 1 φλογοφόρος',
          'Υποστράτηγος: 2 χρυσά αστέρια και 1 φλογοφόρος',
          'Αντιστράτηγος: 3 χρυσά αστέρια και 1 φλογοφόρος',
          'Στρατηγός: 4 χρυσά αστέρια και 1 φλογοφόρος',
        ],
      },
    ],
  },
  {
    id: 'phonetic',
    title: 'Φωνητικό Αλφάβητο',
    icon: 'radio',
    sections: [
      {
        heading: 'Ελληνικό Τυποποιημένο Φωνητικό Αλφάβητο',
        items: [
          'Α - Αστήρ', 'Β - Βύρων', 'Γ - Γαλή', 'Δ - Δόξα',
          'Ε - Ερμής', 'Ζ - Ζεύς', 'Η - Ηρώ', 'Θ - Θεά',
          'Ι - Ίσκιος', 'Κ - Κενόν', 'Λ - Λάμα', 'Μ - Μέλι',
          'Ν - Ναός', 'Ξ - Ξέρξης', 'Ο - Οσμή', 'Π - Πέτρος',
          'Ρ - Ρήγας', 'Σ - Σοφός', 'Τ - Τίγρης', 'Υ - Ύμνος',
          'Φ - Φωφώ', 'Χ - Χαρά', 'Ψ - Ψυχή', 'Ω - Ωμέγα',
        ],
      },
      {
        heading: 'Βασική Ορολογία Ασυρμάτου',
        items: [
          '«Λήψη;» : Με ακούς;',
          '«Ορθόν» : Σωστά / Κατανοητό.',
          '«Άκυρον» : Λάθος / Αγνόησε το προηγούμενο μήνυμα.',
          '«Ομιλείτε» : Ξεκίνα να μιλάς / Έχεις τον λόγο.',
        ],
      },
    ],
  },
  {
    id: 'first-aid',
    title: 'Πρώτες Βοήθειες',
    icon: 'health',
    sections: [
      {
        heading: 'Θερμική Εξάντληση / Θερμοπληξία',
        items: [
          'Μεταφορά άμεσα σε σκιερό και δροσερό μέρος.',
          'Αφαίρεση εξάρτυσης, κράνους και χιτωνίου.',
          'Ενυδάτωση με μικρές, συχνές γουλιές νερού (όχι απότομα).',
          'Δροσισμός με βρεγμένο πανί στον αυχένα, το μέτωπο και τις μασχάλες.',
        ],
      },
      {
        heading: 'Αιμορραγία (Από κόψιμο/τραύμα)',
        items: [
          'Άσκηση άμεσης και σταθερής πίεσης στο τραύμα με καθαρή γάζα.',
          'Διατήρηση της πίεσης συνεχόμενα για τουλάχιστον 5-10 λεπτά.',
          'Ανύψωση του τραυματισμένου μέλους πάνω από το επίπεδο της καρδιάς.',
        ],
      },
      {
        heading: 'Διάστρεμμα (Στραμπούληγμα με άρβυλο)',
        items: [
          'Εφαρμογή της μεθόδου Κ.Π.Α.Α.:',
          '  Κατάκλιση (Ακινησία του μέλους).',
          '  Πάγος (ή κρύο νερό παγουριού/βρεγμένο πανί για 15-20 λεπτά).',
          '  Ανύψωση (Τοποθέτηση του ποδιού ψηλά).',
          '  Ανάπαυση.',
        ],
      },
      {
        heading: 'Τσίμπημα από έντομο/μέλισσα/σφήκα',
        items: [
          'Αφαίρεση του κεντριού ξύνοντας απαλά (π.χ. με ταυτότητα), όχι ζουλώντας.',
          'Πλύσιμο της περιοχής με άφθονο νερό (και σαπούνι αν υπάρχει).',
          'Τοποθέτηση κρύου επιθέματος/πάγου για μείωση του πρηξίματος.',
          'Παρακολούθηση για αλλεργική αντίδραση.',
        ],
      },
    ],
  },
]

const GUIDE_ICONS: Record<string, typeof Star> = {
  star: Star,
  radio: Radio,
  health: HeartPulse,
}

const GUIDE_GRADIENTS: Record<string, string> = {
  star: 'var(--gradient-primary)',
  radio: 'var(--gradient-accent-teal)',
  health: 'var(--gradient-accent-warm)',
}

export function NotesTab() {
  const [activeSection, setActiveSection] = useState<'notes' | 'guides'>('notes')

  return (
    <div className="flex flex-col gap-5 pb-4">
      <div>
        <h1 className="text-2xl font-bold text-gradient">Σημειώσεις</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Προσωπικές σημειώσεις & εγχειρίδια</p>
      </div>

      {/* Section Toggle */}
      <div className="flex gap-1.5 p-1 rounded-2xl bg-secondary/80 border border-border/30">
        <button
          onClick={() => { hapticFeedback('light'); setActiveSection('notes') }}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold min-h-[44px] transition-all active:scale-[0.98]',
            activeSection === 'notes'
              ? 'btn-gradient shadow-[0_2px_10px_oklch(0.80_0.14_75/0.3)]'
              : 'text-muted-foreground'
          )}
        >
          <FileText className="h-4 w-4" />
          Σημειώσεις
        </button>
        <button
          onClick={() => { hapticFeedback('light'); setActiveSection('guides') }}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold min-h-[44px] transition-all active:scale-[0.98]',
            activeSection === 'guides'
              ? 'btn-gradient shadow-[0_2px_10px_oklch(0.80_0.14_75/0.3)]'
              : 'text-muted-foreground'
          )}
        >
          <BookOpen className="h-4 w-4" />
          Εγχειρίδια
        </button>
      </div>

      {activeSection === 'notes' ? <NotesSection /> : <GuidesSection />}
    </div>
  )
}

/* ========== NOTES SECTION ========== */
function NotesSection() {
  const [notes, setNotes] = useLocalStorage<NoteEntry[]>('fantaros-notes', [])
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')

  const handleAdd = (content: string) => {
    hapticFeedback('heavy')
    setNotes([{ id: generateId(), date: toLocalDateString(), content }, ...notes])
    setShowAdd(false)
  }

  const handleUpdate = (id: string) => {
    hapticFeedback('medium')
    setNotes(notes.map((n) => (n.id === id ? { ...n, content: editContent } : n)))
    setEditingId(null)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-foreground">Προσωπικές Σημειώσεις</h2>
        <button
          onClick={() => { hapticFeedback('light'); setShowAdd(true) }}
          className="p-2.5 rounded-2xl glass-card min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95 transition-transform"
          aria-label="Νέα σημείωση"
        >
          <Plus className="h-5 w-5 text-primary" />
        </button>
      </div>

      <FullscreenModal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Νέα Σημείωση">
        <AddNoteForm onAdd={handleAdd} onCancel={() => setShowAdd(false)} />
      </FullscreenModal>

      {notes.length === 0 ? (
        <div className="glass-card rounded-2xl p-6 text-center">
          <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
          <p className="text-sm text-muted-foreground">Δεν υπάρχουν σημειώσεις</p>
        </div>
      ) : (
        notes.map((note) => (
          <div key={note.id} className="glass-card rounded-2xl p-3.5">
            <div className="flex items-start justify-between">
              <p className="text-[10px] text-muted-foreground font-medium">{formatGreekDate(note.date)}</p>
              <div className="flex items-center gap-0.5">
                {editingId === note.id ? (
                  <>
                    <button onClick={() => setEditingId(null)} className="p-1.5 rounded-xl min-h-[36px] min-w-[36px] flex items-center justify-center" aria-label="Ακύρωση">
                      <X className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                    <button onClick={() => handleUpdate(note.id)} className="p-1.5 rounded-xl min-h-[36px] min-w-[36px] flex items-center justify-center" aria-label="Αποθήκευση">
                      <Check className="h-3.5 w-3.5 text-primary" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => { hapticFeedback('light'); setEditingId(note.id); setEditContent(note.content) }}
                      className="p-1.5 rounded-xl min-h-[36px] min-w-[36px] flex items-center justify-center"
                      aria-label="Επεξεργασία"
                    >
                      <Edit3 className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => { hapticFeedback('medium'); setNotes(notes.filter((n) => n.id !== note.id)) }}
                      className="p-1.5 rounded-xl min-h-[36px] min-w-[36px] flex items-center justify-center"
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
                className="w-full mt-2 px-3 py-2 rounded-xl bg-secondary text-secondary-foreground text-sm min-h-[80px] border border-border/50 resize-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                autoFocus
              />
            ) : (
              <p className="text-sm text-foreground mt-1.5 whitespace-pre-wrap leading-relaxed">{note.content}</p>
            )}
          </div>
        ))
      )}
    </div>
  )
}

/* ========== GUIDES SECTION ========== */
function GuidesSection() {
  const [expandedGuide, setExpandedGuide] = useState<string | null>(null)

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-muted-foreground">
        Βασικές πληροφορίες & εγχειρίδια για τη στρατιωτική θητεία
      </p>

      {MILITARY_GUIDES.map((guide) => {
        const Icon = GUIDE_ICONS[guide.icon] || BookOpen
        const gradient = GUIDE_GRADIENTS[guide.icon] || 'var(--gradient-primary)'
        const isExpanded = expandedGuide === guide.id

        return (
          <div key={guide.id} className="glass-card rounded-2xl overflow-hidden">
            <button
              onClick={() => { hapticFeedback('light'); setExpandedGuide(isExpanded ? null : guide.id) }}
              className="w-full flex items-center gap-3 p-4 min-h-[56px] text-left active:scale-[0.99] transition-transform"
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: gradient }}>
                <Icon className="h-5 w-5 text-foreground" />
              </div>
              <span className="flex-1 text-sm font-bold text-foreground">{guide.title}</span>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              )}
            </button>

            {isExpanded && (
              <div className="px-4 pb-4 flex flex-col gap-4">
                {guide.sections.map((section, sIdx) => (
                  <div key={sIdx}>
                    <h4 className="text-xs font-bold text-primary mb-2">{section.heading}</h4>
                    <div className="flex flex-col gap-1.5">
                      {section.items.map((item, iIdx) => (
                        <div key={iIdx} className="flex items-start gap-2 py-2 px-3 rounded-xl bg-secondary/60 border border-border/20">
                          <span className="w-1 h-1 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                          <p className="text-xs text-secondary-foreground leading-relaxed">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ========== ADD NOTE FORM ========== */
function AddNoteForm({ onAdd, onCancel }: { onAdd: (content: string) => void; onCancel: () => void }) {
  const [content, setContent] = useState('')

  return (
    <div className="flex flex-col gap-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Γράψε εδώ..."
        className="w-full px-4 py-3 rounded-xl bg-secondary text-secondary-foreground text-sm min-h-[200px] border border-border/50 resize-none placeholder:text-muted-foreground focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
        autoFocus
      />
      <div className="flex gap-2.5">
        <button onClick={onCancel} className="flex-1 py-3 rounded-xl bg-secondary text-secondary-foreground font-semibold text-sm min-h-[48px] active:scale-[0.98] transition-transform">
          Ακύρωση
        </button>
        <button
          onClick={() => content.trim() && onAdd(content.trim())}
          disabled={!content.trim()}
          className="flex-1 py-3 rounded-xl btn-gradient font-bold text-sm min-h-[48px] disabled:opacity-40 shadow-[0_4px_16px_oklch(0.80_0.14_75/0.3)] active:scale-[0.98] transition-transform"
        >
          Προσθήκη
        </button>
      </div>
    </div>
  )
}
