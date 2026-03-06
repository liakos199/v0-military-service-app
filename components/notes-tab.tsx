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

  return (
    <div className="flex flex-col h-full">
      {/* HEADER - Always Visible */}
      <div className="flex-shrink-0 bg-background px-4 pt-4 pb-3 border-b border-border/50 safe-top">
        <div>
          <h1 className="text-xl font-bold text-foreground">Σημειώσεις</h1>
          <p className="text-xs text-muted-foreground">Προσωπικές σημειώσεις & εγχειρίδια</p>
        </div>

        {/* Section Toggle */}
        <div className="flex gap-1 p-1 rounded-xl bg-secondary/50 border border-white/5 mt-3">
          <button
            onClick={() => {
              hapticFeedback('light')
              setActiveSection('notes')
            }}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-300',
              activeSection === 'notes'
                ? 'bg-primary text-primary-foreground shadow-[0_0_12px_rgba(163,230,53,0.3)]'
                : 'text-muted-foreground/60'
            )}
          >
            <FileText className="h-3.5 w-3.5" />
            Σημειώσεις
          </button>
          <button
            onClick={() => {
              hapticFeedback('light')
              setActiveSection('guides')
            }}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-300',
              activeSection === 'guides'
                ? 'bg-primary text-primary-foreground shadow-[0_0_12px_rgba(163,230,53,0.3)]'
                : 'text-muted-foreground/60'
            )}
          >
            <BookOpen className="h-3.5 w-3.5" />
            Εγχειρίδια
          </button>
        </div>
      </div>

      {/* CONTENT - Scrollable */}
      <div className="flex-1 overflow-y-auto px-4 py-4 no-scrollbar">
        {activeSection === 'notes' && <NotesSection />}
        {activeSection === 'guides' && <GuidesSection />}
      </div>
    </div>
  )
}

/* ========== NOTES SECTION ========== */
function NotesSection() {
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

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-black text-muted-foreground uppercase tracking-widest">Προσωπικές Σημειώσεις</h2>
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
        <div className="glass-card rounded-2xl p-6 text-center border border-white/5">
          <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Δεν υπάρχουν σημειώσεις</p>
        </div>
      ) : (
        notes.map((note) => (
          <div key={note.id} className="glass-card rounded-xl p-3 border border-white/5">
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
                        setEditTitle(note.title || '')
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
              <div className="flex flex-col gap-2 mt-2">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
	                  placeholder="Τίτλος"
	                  className="w-full px-3 py-2.5 rounded-lg bg-secondary text-secondary-foreground text-sm font-semibold min-h-[44px] border border-border placeholder:text-muted-foreground"
	                />
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm min-h-[80px] border border-border resize-none"
                />
              </div>
            ) : (
              <div className="mt-1.5">
                {note.title && <p className="text-sm font-semibold text-foreground">{note.title}</p>}
                <p className="text-sm text-foreground whitespace-pre-wrap">{note.content}</p>
              </div>
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
  const [activeQuiz, setActiveQuiz] = useState<string | null>(null)

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-muted-foreground/70 leading-relaxed">
        Βασικές πληροφορίες & εγχειρίδια για τη στρατιωτική θητεία
      </p>

      {MILITARY_GUIDES.map((guide) => {
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
              className="w-full flex items-center gap-3 p-4 min-h-[56px] text-left hover:bg-white/5 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <span className="flex-1 text-sm font-black text-foreground tracking-tight">{guide.title}</span>
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
                    <h4 className="text-xs font-black text-primary uppercase tracking-wider mb-2">{section.heading}</h4>
                    <div className="flex flex-col gap-1.5">
                      {section.items.map((item, iIdx) => (
                        <div
                          key={iIdx}
                          className="flex items-start gap-2 py-1.5 px-3 rounded-lg bg-secondary"
                        >
                          <span className="w-1 h-1 rounded-full bg-muted-foreground mt-1.5 flex-shrink-0" />
                          <p className="text-xs text-secondary-foreground leading-relaxed">{item}</p>
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
                    className="flex items-center justify-center gap-2 py-3 rounded-xl bg-primary/10 border border-primary/20 text-primary font-black text-sm min-h-[48px] uppercase tracking-wider transition-colors hover:bg-primary/15 active:bg-primary/20"
                  >
                    <GraduationCap className="h-4 w-4" />
                    Εξέτασε με
                  </button>
                )}
              </div>
            )}
          </div>
        )
      })}

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
    return picked.map((q) => {
      const indexed = q.options.map((opt, i) => ({ opt, wasCorrect: i === q.correctIndex }))
      const shuffled = shuffleArray(indexed)
      return {
        question: q.question,
        options: shuffled.map((s) => s.opt),
        correctIndex: shuffled.findIndex((s) => s.wasCorrect),
      }
    })
  }, [guideId]) // eslint-disable-line react-hooks/exhaustive-deps

  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const [answered, setAnswered] = useState(false)

  const total = shuffledQuestions.length
  const current = shuffledQuestions[currentIdx]

  const handleSelect = useCallback(
    (optIdx: number) => {
      if (answered) return
      hapticFeedback('light')
      setSelectedOption(optIdx)
      setAnswered(true)
      if (optIdx === current.correctIndex) {
        setScore((s) => s + 1)
        hapticFeedback('heavy')
      } else {
        hapticFeedback('medium')
      }
    },
    [answered, current]
  )

  const handleNext = useCallback(() => {
    if (currentIdx + 1 >= total) {
      setFinished(true)
      hapticFeedback('heavy')
    } else {
      setCurrentIdx((i) => i + 1)
      setSelectedOption(null)
      setAnswered(false)
      hapticFeedback('light')
    }
  }, [currentIdx, total])

  const handleRetry = useCallback(() => {
    setCurrentIdx(0)
    setSelectedOption(null)
    setScore(0)
    setFinished(false)
    setAnswered(false)
    hapticFeedback('medium')
  }, [])

  if (total === 0) return null

  // Results screen
  if (finished) {
    const pct = Math.round((score / total) * 100)
    const isGreat = pct >= 80
    const isOk = pct >= 50 && pct < 80

    return (
      <div className="flex flex-col items-center justify-center gap-6 py-8">
        <div
          className={cn(
            'w-24 h-24 rounded-full flex items-center justify-center text-3xl font-black border-2',
            isGreat
              ? 'bg-chart-2/10 border-chart-2/40 text-chart-2'
              : isOk
                ? 'bg-chart-4/10 border-chart-4/40 text-chart-4'
                : 'bg-destructive/10 border-destructive/40 text-destructive'
          )}
        >
          {score}/{total}
        </div>

        <div className="text-center">
          <p className="text-lg font-black text-foreground uppercase tracking-tight">
            {isGreat ? 'Εξαιρετικά!' : isOk ? 'Καλή προσπάθεια!' : 'Χρειάζεται διάβασμα'}
          </p>
          <p className="text-xs text-muted-foreground mt-2 font-medium">
            Σωστές: {score}/{total} ({pct}%)
          </p>
        </div>

        <div className="flex gap-3 w-full">
          <button
            onClick={handleRetry}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-secondary/50 border border-white/5 text-foreground font-black text-sm min-h-[48px] uppercase tracking-wider hover:bg-secondary transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            Ξανά
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-black text-sm min-h-[48px] uppercase tracking-wider hover:bg-primary/90 transition-colors"
          >
            Κλείσιμο
          </button>
        </div>
      </div>
    )
  }

  // Question screen
  return (
    <div className="flex flex-col gap-5">
      {/* Progress */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 rounded-full bg-secondary/50 border border-white/5 overflow-hidden">
          <div
            className="h-full rounded-full bg-primary shadow-[0_0_12px_rgba(163,230,53,0.4)] transition-all duration-300"
            style={{ width: `${((currentIdx + (answered ? 1 : 0)) / total) * 100}%` }}
          />
        </div>
        <span className="text-xs font-black text-muted-foreground tabular-nums uppercase tracking-wider">
          {currentIdx + 1}/{total}
        </span>
      </div>

      {/* Question */}
      <p className="text-base font-black text-foreground leading-snug tracking-tight">{current.question}</p>

      {/* Options */}
      <div className="flex flex-col gap-2.5">
        {current.options.map((opt, optIdx) => {
          const isCorrect = optIdx === current.correctIndex
          const isSelected = optIdx === selectedOption
          const showCorrect = answered && isCorrect
          const showWrong = answered && isSelected && !isCorrect

          return (
            <button
              key={optIdx}
              onClick={() => handleSelect(optIdx)}
              disabled={answered}
              className={cn(
                'flex items-center gap-3 w-full text-left px-4 py-3.5 rounded-xl text-sm font-medium transition-all min-h-[52px] border',
                answered
                  ? showCorrect
                    ? 'bg-chart-2/10 border-chart-2/40 text-chart-2 font-black'
                    : showWrong
                      ? 'bg-destructive/10 border-destructive/40 text-destructive font-black'
                      : 'bg-secondary/50 border-border/50 text-muted-foreground'
                  : isSelected
                    ? 'bg-primary/10 border-primary/40 text-foreground font-black'
                    : 'bg-secondary border-border text-foreground hover:border-primary/30 active:bg-secondary/80'
              )}
            >
              <span className="flex-1">{opt}</span>
              {showCorrect && <CircleCheck className="h-5 w-5 flex-shrink-0" />}
              {showWrong && <CircleX className="h-5 w-5 flex-shrink-0" />}
            </button>
          )
        })}
      </div>

      {/* Next button */}
      {answered && (
        <button
          onClick={handleNext}
          className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm min-h-[48px] transition-all"
        >
          {currentIdx + 1 >= total ? 'Αποτελέσματα' : 'Επόμενη'}
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

/* ========== ADD NOTE FORM ========== */
function AddNoteForm({ onAdd, onCancel }: { onAdd: (title: string, content: string) => void; onCancel: () => void }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  return (
    <div className="flex flex-col gap-4">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
	        placeholder="Τίτλος (προαιρετικό)"
	        className="w-full px-3 py-3 rounded-lg bg-secondary text-secondary-foreground text-sm font-semibold min-h-[48px] border border-border placeholder:text-muted-foreground placeholder:font-normal"
	      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Γράψε εδώ..."
        className="w-full px-3 py-3 rounded-lg bg-secondary text-secondary-foreground text-sm min-h-[200px] border border-border resize-none placeholder:text-muted-foreground"
      />
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="flex-1 py-3 rounded-lg bg-secondary text-secondary-foreground font-medium text-sm min-h-[48px]"
        >
          Ακύρωση
        </button>
        <button
          onClick={() => content.trim() && onAdd(title.trim(), content.trim())}
          disabled={!content.trim()}
          className="flex-1 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm min-h-[48px] disabled:opacity-40"
        >
          Προσθήκη
        </button>
      </div>
    </div>
  )
}
