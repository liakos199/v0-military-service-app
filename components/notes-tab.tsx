'use client'

import { useState, useMemo, useCallback } from 'react'
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
  GraduationCap,
  RotateCcw,
  ChevronRight,
  CircleCheck,
  CircleX,
  Search,
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
          'Α - Αστήρ',
          'Β - Βύρων',
          'Γ - Γαλή',
          'Δ - Δόξα',
          'Ε - Ερμής',
          'Ζ - Ζεύς',
          'Η - Ηρώ',
          'Θ - Θεά',
          'Ι - Ίσκιος',
          'Κ - Κενόν',
          'Λ - Λάμα',
          'Μ - Μέλι',
          'Ν - Ναός',
          'Ξ - Ξέρξης',
          'Ο - Οσμή',
          'Π - Πέτρος',
          'Ρ - Ρήγας',
          'Σ - Σοφός',
          'Τ - Τίγρης',
          'Υ - Ύμνος',
          'Φ - Φωφώ',
          'Χ - Χαρά',
          'Ψ - Ψυχή',
          'Ω - Ωμέγα',
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
          'Άσκηση άμεσης και σταθερής πίεσης στο τραύμα με καθαρή γάζα, επίδεσμο ή καθαρό ύφασμα.',
          'Διατήρηση της πίεσης συνεχόμενα για τουλάχιστον 5-10 λεπτά.',
          'Ανύψωση του τραυματισμένου μέλους πάνω από το επίπεδο της καρδιάς (εφόσον δεν υπάρχει κάταγμα).',
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
          'Μην βγάλεις το άρβυλο αμέσως αν πρέπει να περπατήσει ο τραυματίας, καθώς το πόδι θα πρηστεί.',
        ],
      },
      {
        heading: 'Τσίμπημα από έντομο/μέλισσα/σφήκα',
        items: [
          'Αφαίρεση του κεντριού ξύνοντας απαλά (π.χ. με ταυτότητα), όχι ζουλώντας.',
          'Πλύσιμο της περιοχής με άφθονο νερό (και σαπούνι αν υπάρχει).',
          'Τοποθέτηση κρύου επιθέματος/πάγου για μείωση του πρηξίματος.',
          'Παρακολούθηση για αλλεργική αντίδραση. Αν εμφανιστούν συμπτώματα, άμεση ιατρική βοήθεια.',
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

/* ========== QUIZ DATA ========== */
interface QuizQuestion {
  question: string
  options: string[]
  correctIndex: number
}

const GUIDE_QUIZZES: Record<string, QuizQuestion[]> = {
  ranks: [
    {
      question: 'Πόσα γαλόνια έχει ο Λοχίας;',
      options: ['1 γαλόνι', '2 γαλόνια', '3 γαλόνια', '4 γαλόνια'],
      correctIndex: 1,
    },
    {
      question: 'Τι διακριτικό φέρει ο Λοχαγός;',
      options: ['2 ασημένια αστέρια', '1 ασημένιο αστέρι', '3 ασημένια αστέρια', '1 χρυσή φλογοφόρος'],
      correctIndex: 2,
    },
    {
      question: 'Ποιος βαθμός έχει 1 χρυσή φλογοφόρο ροιά;',
      options: ['Λοχαγός', 'Ταγματάρχης', 'Συνταγματάρχης', 'Αντισυνταγματάρχης'],
      correctIndex: 1,
    },
    {
      question: 'Τι κάνουμε όταν συναντάμε Υπαξιωματικό;',
      options: ['Χαιρετάμε', 'Στεκόμαστε προσοχή', 'Χαιρετάμε & προσοχή', 'Τίποτα'],
      correctIndex: 1,
    },
    {
      question: 'Ποιος βαθμός είναι συνήθως Διοικητής Μονάδας;',
      options: ['Ταγματάρχης', 'Λοχαγός', 'Συνταγματάρχης', 'Ταξίαρχος'],
      correctIndex: 2,
    },
    {
      question: 'Πόσα γαλόνια έχει ο Αρχιλοχίας;',
      options: ['2 γαλόνια', '3 γαλόνια', '4 γαλόνια', '5 γαλόνια'],
      correctIndex: 2,
    },
    {
      question: 'Τι διακριτικό φέρει ο Ανθυπολοχαγός;',
      options: ['1 ασημένιο αστέρι', '2 ασημένια αστέρια', '1 γαλόνι', '1 χρυσό αστέρι'],
      correctIndex: 0,
    },
    {
      question: 'Πόσα χρυσά αστέρια έχει ο Αντιστράτηγος;',
      options: ['1', '2', '3', '4'],
      correctIndex: 2,
    },
  ],
  phonetic: [
    {
      question: 'Ποιο γράμμα αντιστοιχεί στο «Ερμής»;',
      options: ['Η', 'Ε', 'Ι', 'Α'],
      correctIndex: 1,
    },
    {
      question: 'Πώς λέμε το Κ στο φωνητικό αλφάβητο;',
      options: ['Κλειώ', 'Κενόν', 'Κόσμος', 'Κάρμα'],
      correctIndex: 1,
    },
    {
      question: 'Τι σημαίνει «Ορθόν» στον ασύρματο;',
      options: ['Με ακούς;', 'Σωστά / Κατανοητό', 'Ξεκίνα να μιλάς', 'Αγνόησε το μήνυμα'],
      correctIndex: 1,
    },
    {
      question: 'Πώς λέμε το Ψ στο φωνητικό αλφάβητο;',
      options: ['Ψαράς', 'Ψήφος', 'Ψυχή', 'Ψίθυρος'],
      correctIndex: 2,
    },
    {
      question: 'Τι σημαίνει «Άκυρον» στον ασύρματο;',
      options: ['Σωστά', 'Αγνόησε το μήνυμα', 'Ξεκίνα να μιλάς', 'Με ακούς;'],
      correctIndex: 1,
    },
    {
      question: 'Ποιο γράμμα αντιστοιχεί στο «Τίγρης»;',
      options: ['Θ', 'Ρ', 'Τ', 'Σ'],
      correctIndex: 2,
    },
    {
      question: 'Πώς λέμε το Ξ στο φωνητικό αλφάβητο;',
      options: ['Ξένος', 'Ξέρξης', 'Ξύλο', 'Ξενοφών'],
      correctIndex: 1,
    },
    {
      question: 'Τι σημαίνει «Λήψη;» στον ασύρματο;',
      options: ['Σωστά', 'Ξεκίνα', 'Με ακούς;', 'Τέλος'],
      correctIndex: 2,
    },
  ],
  'first-aid': [
    {
      question: 'Τι κάνεις ΠΡΩΤΑ σε θερμική εξάντληση;',
      options: ['Ενυδάτωση με πολύ νερό', 'Μεταφορά σε σκιερό μέρος', 'Αφαίρεση ρούχων', 'Κλήση ασθενοφόρου'],
      correctIndex: 1,
    },
    {
      question: 'Πόση ώρα ασκούμε πίεση σε αιμορραγία;',
      options: ['1-2 λεπτά', '5-10 λεπτά', '15-20 λεπτά', '30 δευτερόλεπτα'],
      correctIndex: 1,
    },
    {
      question: 'Τι σημαίνει Κ.Π.Α.Α.;',
      options: [
        'Κατάκλιση, Πάγος, Ανύψωση, Ανάπαυση',
        'Κράτημα, Πίεση, Αφαίρεση, Αντιμετώπιση',
        'Κρύο, Πανί, Αναμονή, Ακινησία',
        'Κατάκλιση, Πίεση, Αντιβιοτικά, Αναμονή',
      ],
      correctIndex: 0,
    },
    {
      question: 'Πώς αφαιρούμε κεντρί μέλισσας;',
      options: ['Τραβώντας με δάχτυλα', 'Ζουλώντας', 'Ξύνοντας απαλά (π.χ. ταυτότητα)', 'Με λαβίδα'],
      correctIndex: 2,
    },
    {
      question: 'Γιατί ΔΕΝ βγάζουμε άρβυλο σε διάστρεμμα;',
      options: ['Θα αιμορραγήσει', 'Θα πρηστεί το πόδι', 'Θα σπάσει', 'Θα κρυώσει'],
      correctIndex: 1,
    },
    {
      question: 'Πώς ενυδατώνουμε σε θερμοπληξία;',
      options: ['Μεγάλες γουλιές γρήγορα', 'Μικρές, συχνές γουλιές', 'Μόνο αναψυκτικά', 'Δεν δίνουμε νερό'],
      correctIndex: 1,
    },
  ],
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function NotesTab() {
  const [activeSection, setActiveSection] = useState<'notes' | 'guides'>('notes')

  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="flex flex-col h-full">
      {/* HEADER - Always Visible */}
      <div className="flex-shrink-0 bg-background px-4 pt-4 pb-3 border-b border-border/50 safe-top">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold text-foreground">Σημειώσεις</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Προσωπικές σημειώσεις & εγχειρίδια</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeSection === 'notes' ? "Αναζήτηση σημειώσεων..." : "Αναζήτηση εγχειριδίων..."}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-secondary/50 border border-white/5 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="h-3 w-3 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Section Toggle */}
        <div className="flex gap-1 p-1 rounded-xl bg-secondary/50 border border-white/5 mt-3">
          <button
            onClick={() => {
              hapticFeedback('light')
              setActiveSection('notes')
            }}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-300',
              activeSection === 'notes'
                ? 'bg-primary text-primary-foreground '
                : 'text-muted-foreground/60'
            )}
          >
            <FileText className="h-3 w-3" />
            Σημειώσεις
          </button>
          <button
            onClick={() => {
              hapticFeedback('light')
              setActiveSection('guides')
            }}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-300',
              activeSection === 'guides'
                ? 'bg-primary text-primary-foreground '
                : 'text-muted-foreground/60'
            )}
          >
            <BookOpen className="h-3 w-3" />
            Εγχειρίδια
          </button>
        </div>
      </div>

      {/* CONTENT - Scrollable */}
      <div className="flex-1 overflow-y-auto px-4 py-4 no-scrollbar">
        {activeSection === 'notes' && <NotesSection searchQuery={searchQuery} />}
        {activeSection === 'guides' && <GuidesSection searchQuery={searchQuery} />}
      </div>
    </div>
  )
}

/* ========== NOTES SECTION ========== */
function NotesSection({ searchQuery }: { searchQuery: string }) {
  const [notes, setNotes] = useLocalStorage<NoteEntry[]>('fantaros-notes', [])
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')

  const handleAdd = (title: string, content: string) => {
    hapticFeedback('heavy')
    setNotes([
      { id: generateId(), date: toLocalDateString(), title, content },
      ...notes,
    ])
    setShowAdd(false)
  }

  const handleUpdate = (id: string) => {
    hapticFeedback('medium')
    setNotes(notes.map((n) => (n.id === id ? { ...n, title: editTitle, content: editContent } : n)))
    setEditingId(null)
  }

  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes
    const q = searchQuery.toLowerCase()
    return notes.filter(n => 
      n.title?.toLowerCase().includes(q) || 
      n.content.toLowerCase().includes(q)
    )
  }, [notes, searchQuery])

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Προσωπικές Σημειώσεις</h2>
        <button
          onClick={() => {
            hapticFeedback('light')
            setShowAdd(true)
          }}
          className="p-2 rounded-lg glass-card min-h-[40px] min-w-[40px] flex items-center justify-center"
          aria-label="Νέα σημείωση"
        >
          <Plus className="h-4 w-4 text-primary" />
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

      {filteredNotes.length === 0 ? (
        <div className="glass-card rounded-2xl p-6 text-center border border-white/5">
          <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            {searchQuery ? 'Δεν βρέθηκαν σημειώσεις' : 'Δεν υπάρχουν σημειώσεις'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filteredNotes.map((note) => (
            <div key={note.id} className="glass-card rounded-xl p-3 border border-white/5">
              <div className="flex items-start justify-between">
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{formatGreekDate(note.date)}</p>
                <div className="flex items-center gap-1">
                  {editingId === note.id ? (
                    <>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1.5 rounded-lg min-h-[32px] min-w-[32px] flex items-center justify-center"
                        aria-label="Ακύρωση"
                      >
                        <X className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => handleUpdate(note.id)}
                        className="p-1.5 rounded-lg min-h-[32px] min-w-[32px] flex items-center justify-center"
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
                          setEditTitle(note.title || '')
                          setEditContent(note.content)
                        }}
                        className="p-1.5 rounded-lg min-h-[32px] min-w-[32px] flex items-center justify-center"
                        aria-label="Επεξεργασία"
                      >
                        <Edit3 className="h-3.5 w-3.5 text-muted-foreground/60" />
                      </button>
                      <button
                        onClick={() => {
                          hapticFeedback('medium')
                          setNotes(notes.filter((n) => n.id !== note.id))
                        }}
                        className="p-1.5 rounded-lg min-h-[32px] min-w-[32px] flex items-center justify-center"
                        aria-label="Διαγραφή"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive/60" />
                      </button>
                    </>
                  )}
                </div>
              </div>
              {editingId === note.id ? (
                <div className="flex flex-col gap-2 mt-2">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Τίτλος"
                    className="w-full px-3 py-2 rounded-lg bg-secondary text-foreground text-sm font-bold min-h-[40px] border border-border placeholder:text-muted-foreground/50"
                  />
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-secondary text-foreground text-sm min-h-[80px] border border-border resize-none"
                  />
                </div>
              ) : (
                <div className="mt-1">
                  {note.title && <p className="text-sm font-bold text-foreground mb-0.5">{note.title}</p>}
                  <p className="text-xs text-foreground/80 whitespace-pre-wrap leading-relaxed">{note.content}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ========== GUIDES SECTION ========== */
function GuidesSection({ searchQuery }: { searchQuery: string }) {
  const [expandedGuide, setExpandedGuide] = useState<string | null>(null)
  const [activeQuiz, setActiveQuiz] = useState<string | null>(null)

  const filteredGuides = useMemo(() => {
    if (!searchQuery.trim()) return MILITARY_GUIDES
    const q = searchQuery.toLowerCase()
    return MILITARY_GUIDES.filter(guide => 
      guide.title.toLowerCase().includes(q) ||
      guide.sections.some(section => 
        section.heading.toLowerCase().includes(q) ||
        section.items.some(item => item.toLowerCase().includes(q))
      )
    )
  }, [searchQuery])

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[10px] text-muted-foreground/70 leading-relaxed uppercase tracking-wider px-1">
        {searchQuery ? `Αποτελέσματα αναζήτησης (${filteredGuides.length})` : 'Βασικές πληροφορίες & εγχειρίδια'}
      </p>

      <div className="flex flex-col gap-2">
        {filteredGuides.length === 0 ? (
          <div className="glass-card rounded-2xl p-6 text-center border border-white/5">
            <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Δεν βρέθηκαν εγχειρίδια</p>
          </div>
        ) : filteredGuides.map((guide) => {
          const Icon = GUIDE_ICONS[guide.icon] || BookOpen
          const isExpanded = expandedGuide === guide.id
          const hasQuiz = !!GUIDE_QUIZZES[guide.id]

          return (
            <div key={guide.id} className="glass-card rounded-xl overflow-hidden border border-white/5">
              <button
                onClick={() => {
                  hapticFeedback('light')
                  setExpandedGuide(isExpanded ? null : guide.id)
                }}
                className="w-full flex items-center gap-3 p-3 min-h-[48px] text-left hover:bg-white/5 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <span className="flex-1 text-sm font-bold text-foreground tracking-tight">{guide.title}</span>
                {isExpanded ? (
                  <ChevronUp className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                )}
              </button>

              {isExpanded && (
                <div className="px-3 pb-3 flex flex-col gap-3">
                  {guide.sections.map((section, sIdx) => (
                    <div key={sIdx}>
                      <h4 className="text-[9px] font-black text-primary uppercase tracking-widest mb-1.5 px-1">{section.heading}</h4>
                      <div className="flex flex-col gap-1">
                        {section.items.map((item, iIdx) => (
                          <div
                            key={iIdx}
                            className="flex items-start gap-2 py-1.5 px-2.5 rounded-lg bg-secondary/30 border border-white/5"
                          >
                            <span className="w-1 h-1 rounded-full bg-primary/40 mt-1.5 flex-shrink-0" />
                            <p className="text-[11px] text-foreground/90 leading-relaxed">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Quiz button */}
                  {hasQuiz && (
                    <button
                      onClick={() => {
                        hapticFeedback('medium')
                        setActiveQuiz(guide.id)
                      }}
                      className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-primary-foreground font-bold text-[10px] uppercase tracking-wider min-h-[40px] transition-all hover:opacity-90"
                    >
                      <GraduationCap className="h-3.5 w-3.5" />
                      Εξέτασε με
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Quiz Modal */}
      {activeQuiz && (
        <FullscreenModal
          isOpen={true}
          onClose={() => setActiveQuiz(null)}
          title={MILITARY_GUIDES.find((g) => g.id === activeQuiz)?.title || 'Τεστ'}
        >
          <QuizView
            guideId={activeQuiz}
            onClose={() => setActiveQuiz(null)}
          />
        </FullscreenModal>
      )}
    </div>
  )
}

/* ========== QUIZ VIEW ========== */
function QuizView({ guideId, onClose }: { guideId: string; onClose: () => void }) {
  const allQuestions = GUIDE_QUIZZES[guideId] || []

  const shuffledQuestions = useMemo(() => {
    const picked = shuffleArray(allQuestions).slice(0, 5)
    return picked
  }, [allQuestions])

  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [showResult, setShowResult] = useState(false)

  const currentQuestion = shuffledQuestions[currentIndex]

  const handleOptionSelect = (idx: number) => {
    if (isAnswered) return
    hapticFeedback('light')
    setSelectedOption(idx)
    setIsAnswered(true)
    if (idx === currentQuestion.correctIndex) {
      setScore((s) => s + 1)
    }
  }

  const handleNext = () => {
    hapticFeedback('light')
    if (currentIndex < shuffledQuestions.length - 1) {
      setCurrentIndex((i) => i + 1)
      setSelectedOption(null)
      setIsAnswered(false)
    } else {
      setShowResult(true)
    }
  }

  if (showResult) {
    const isPerfect = score === shuffledQuestions.length
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center gap-4">
        <div className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center mb-2",
          isPerfect ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"
        )}>
          {isPerfect ? <CircleCheck className="h-10 w-10" /> : <RotateCcw className="h-8 w-8" />}
        </div>
        <div>
          <h3 className="text-xl font-black text-foreground">Αποτέλεσμα</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Σκορ: <span className="text-primary font-bold">{score}</span> / {shuffledQuestions.length}
          </p>
        </div>
        <p className="text-xs text-muted-foreground max-w-[200px]">
          {isPerfect ? 'Εξαιρετικά! Γνωρίζεις καλά το αντικείμενο.' : 'Μπορείς και καλύτερα. Διάβασε ξανά το εγχειρίδιο.'}
        </p>
        <button
          onClick={onClose}
          className="mt-4 w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold text-[10px] uppercase tracking-wider min-h-[44px]"
        >
          Κλείσιμο
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
          Ερώτηση {currentIndex + 1} / {shuffledQuestions.length}
        </span>
        <div className="flex gap-1">
          {shuffledQuestions.map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-1.5 h-1.5 rounded-full transition-colors",
                i === currentIndex ? "bg-primary" : i < currentIndex ? "bg-primary/40" : "bg-secondary"
              )}
            />
          ))}
        </div>
      </div>

      <h3 className="text-base font-bold text-foreground leading-tight px-1">
        {currentQuestion.question}
      </h3>

      <div className="flex flex-col gap-2">
        {currentQuestion.options.map((opt, idx) => {
          const isCorrect = idx === currentQuestion.correctIndex
          const isSelected = idx === selectedOption
          
          let stateClasses = "bg-secondary/50 border-white/5 text-foreground"
          if (isAnswered) {
            if (isCorrect) stateClasses = "bg-primary/20 border-primary text-primary"
            else if (isSelected) stateClasses = "bg-destructive/20 border-destructive text-destructive"
            else stateClasses = "bg-secondary/30 border-white/5 text-muted-foreground/50"
          }

          return (
            <button
              key={idx}
              onClick={() => handleOptionSelect(idx)}
              disabled={isAnswered}
              className={cn(
                "w-full text-left p-3.5 rounded-xl border text-sm font-medium transition-all flex items-center justify-between min-h-[52px]",
                stateClasses
              )}
            >
              <span>{opt}</span>
              {isAnswered && isCorrect && <CircleCheck className="h-4 w-4" />}
              {isAnswered && isSelected && !isCorrect && <CircleX className="h-4 w-4" />}
            </button>
          )
        })}
      </div>

      {isAnswered && (
        <button
          onClick={handleNext}
          className="mt-2 w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold text-[10px] uppercase tracking-wider min-h-[44px] flex items-center justify-center gap-2"
        >
          {currentIndex < shuffledQuestions.length - 1 ? 'Επόμενη' : 'Τέλος'}
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

function AddNoteForm({ onAdd, onCancel }: { onAdd: (t: string, c: string) => void; onCancel: () => void }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Τίτλος</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Προαιρετικό..."
          className="w-full px-3 py-2 rounded-lg bg-secondary text-foreground text-sm font-bold min-h-[40px] border border-border placeholder:text-muted-foreground/50"
        />
      </div>
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Περιεχόμενο</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Γράψε εδώ..."
          className="w-full px-3 py-2 rounded-lg bg-secondary text-foreground text-sm min-h-[120px] border border-border resize-none placeholder:text-muted-foreground/50"
        />
      </div>
      <div className="flex gap-2 pt-2">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-lg bg-secondary text-secondary-foreground font-bold text-[10px] uppercase tracking-wider min-h-[44px]"
        >
          Ακύρωση
        </button>
        <button
          onClick={() => onAdd(title, content)}
          disabled={!content.trim()}
          className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground font-bold text-[10px] uppercase tracking-wider min-h-[44px] disabled:opacity-40"
        >
          Προσθήκη
        </button>
      </div>
    </div>
  )
}
