'use client'

import { useState, useMemo, useCallback } from 'react'
import {
  Plus,
  Trash2,
  NotebookText,
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
    <div className="flex flex-col h-full bg-black relative z-10 animate-fade-in">
      {/* Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-48 bg-[#10b981]/5 blur-[70px] pointer-events-none rounded-full z-0"></div>

      {/* HEADER */}
      <header className="px-6 pt-14 pb-4 relative flex flex-col gap-4 shrink-0 z-10">
        <div>
          <h1 className="text-[32px] font-bold tracking-tight text-white leading-none mb-1">Σημειώσεις</h1>
          <p className="text-[13px] font-bold tracking-[0.1em] text-zinc-500 uppercase">Προσωπικές & εγχειρίδια</p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeSection === 'notes' ? "Αναζήτηση σημειώσεων..." : "Αναζήτηση εγχειριδίων..."}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white placeholder:text-zinc-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Section Toggle */}
        <div className="flex gap-2 p-1 rounded-xl bg-zinc-900 border border-zinc-800">
          <button
            onClick={() => {
              hapticFeedback('light')
              setActiveSection('notes')
            }}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all duration-300',
              activeSection === 'notes'
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-900/30'
                : 'text-zinc-400 hover:text-zinc-300'
            )}
          >
            <NotebookText size={16} />
            Σημειώσεις
          </button>
          <button
            onClick={() => {
              hapticFeedback('light')
              setActiveSection('guides')
            }}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all duration-300',
              activeSection === 'guides'
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-900/30'
                : 'text-zinc-400 hover:text-zinc-300'
            )}
          >
            <BookOpen size={16} />
            Εγχειρίδια
          </button>
        </div>
      </header>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto px-5 pb-32 pt-4 hide-scrollbar relative z-10">
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
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-[11px] font-bold tracking-[0.2em] text-zinc-500 uppercase">Προσωπικές Σημειώσεις</h2>
        <button
          onClick={() => {
            hapticFeedback('light')
            setShowAdd(true)
          }}
          className="p-2.5 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-900/30 active:scale-90 transition-all"
          aria-label="Νέα σημείωση"
        >
          <Plus size={18} />
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
        <div className="bg-gradient-to-br from-zinc-800 to-zinc-900/90 border border-zinc-700/40 rounded-[2rem] p-8 text-center shadow-xl shadow-black/20">
          <NotebookText className="h-12 w-12 text-zinc-600 mx-auto mb-3 opacity-50" />
          <p className="text-[12px] text-zinc-400 font-semibold">
            {searchQuery ? 'Δεν βρέθηκαν σημειώσεις' : 'Δεν υπάρχουν σημειώσεις'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredNotes.map((note) => (
            <div key={note.id} className="bg-gradient-to-br from-zinc-800 to-zinc-900/90 border border-zinc-700/40 rounded-[1.5rem] p-4 shadow-lg shadow-black/10">
              <div className="flex items-start justify-between mb-3">
                <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{formatGreekDate(note.date)}</p>
                <div className="flex items-center gap-1">
                  {editingId === note.id ? (
                    <>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-2 rounded-lg text-zinc-500 hover:text-zinc-300 transition-colors"
                        aria-label="Ακύρωση"
                      >
                        <X size={16} />
                      </button>
                      <button
                        onClick={() => handleUpdate(note.id)}
                        className="p-2 rounded-lg text-emerald-400 hover:text-emerald-300 transition-colors"
                        aria-label="Αποθήκευση"
                      >
                        <Check size={16} />
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
                        className="p-2 rounded-lg text-zinc-500 hover:text-zinc-300 transition-colors"
                        aria-label="Επεξεργασία"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => {
                          hapticFeedback('medium')
                          setNotes(notes.filter((n) => n.id !== note.id))
                        }}
                        className="p-2 rounded-lg text-red-400 hover:text-red-300 transition-colors"
                        aria-label="Διαγραφή"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
              {editingId === note.id ? (
                <div className="flex flex-col gap-3">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Τίτλος"
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 text-white text-sm font-bold border border-zinc-700 focus:border-emerald-500 outline-none"
                  />
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 text-white text-sm border border-zinc-700 focus:border-emerald-500 outline-none resize-none h-24"
                  />
                </div>
              ) : (
                <div>
                  {note.title && <p className="text-[12px] font-bold text-white mb-1">{note.title}</p>}
                  <p className="text-[11px] text-zinc-300 whitespace-pre-wrap leading-relaxed">{note.content}</p>
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
    <div className="flex flex-col gap-4">
      <p className="text-[10px] text-zinc-500 leading-relaxed uppercase tracking-wider px-1">
        {searchQuery ? `Αποτελέσματα αναζήτησης (${filteredGuides.length})` : 'Βασικές πληροφορίες & εγχειρίδια'}
      </p>

      <div className="flex flex-col gap-3">
        {filteredGuides.length === 0 ? (
          <div className="bg-gradient-to-br from-zinc-800 to-zinc-900/90 border border-zinc-700/40 rounded-[2rem] p-8 text-center shadow-xl shadow-black/20">
            <BookOpen className="h-12 w-12 text-zinc-600 mx-auto mb-3 opacity-50" />
            <p className="text-[12px] text-zinc-400 font-semibold">Δεν βρέθηκαν εγχειρίδια</p>
          </div>
        ) : filteredGuides.map((guide) => {
          const Icon = GUIDE_ICONS[guide.icon] || BookOpen
          const isExpanded = expandedGuide === guide.id
          const hasQuiz = !!GUIDE_QUIZZES[guide.id]

          return (
            <div key={guide.id} className="bg-gradient-to-br from-zinc-800 to-zinc-900/90 border border-zinc-700/40 rounded-[1.5rem] overflow-hidden shadow-lg shadow-black/10">
              <button
                onClick={() => {
                  hapticFeedback('light')
                  setExpandedGuide(isExpanded ? null : guide.id)
                }}
                className="w-full flex items-center gap-3 p-4 min-h-[56px] text-left hover:bg-zinc-700/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-5 w-5 text-emerald-400" />
                </div>
                <span className="flex-1 text-[13px] font-bold text-white tracking-tight">{guide.title}</span>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-zinc-500 flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-zinc-500 flex-shrink-0" />
                )}
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 flex flex-col gap-4 border-t border-zinc-700/40">
                  {guide.sections.map((section, sIdx) => (
                    <div key={sIdx}>
                      <h4 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-2 px-1">{section.heading}</h4>
                      <div className="flex flex-col gap-1.5">
                        {section.items.map((item, iIdx) => (
                          <div
                            key={iIdx}
                            className="flex items-start gap-2 py-2 px-3 rounded-lg bg-zinc-900/50 border border-zinc-700/30"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                            <p className="text-[11px] text-zinc-300 leading-relaxed">{item}</p>
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
                      className="flex items-center justify-center gap-2 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-[11px] uppercase tracking-wider shadow-lg shadow-emerald-900/30 active:scale-95 transition-all"
                    >
                      <GraduationCap size={16} />
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
          isPerfect ? "bg-emerald-500/20 text-emerald-400" : "bg-zinc-800 text-zinc-500"
        )}>
          {isPerfect ? <CircleCheck className="h-10 w-10" /> : <RotateCcw className="h-8 w-8" />}
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Αποτέλεσμα</h3>
          <p className="text-[12px] text-zinc-400 mt-1">
            Σκορ: <span className="text-emerald-400 font-bold">{score}</span> / {shuffledQuestions.length}
          </p>
        </div>
        <p className="text-[11px] text-zinc-400 max-w-[200px]">
          {isPerfect ? 'Εξαιρετικά! Γνωρίζεις καλά το αντικείμενο.' : 'Μπορείς και καλύτερα. Διάβασε ξανά το εγχειρίδιο.'}
        </p>
        <button
          onClick={onClose}
          className="mt-4 w-full py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-[11px] uppercase tracking-wider shadow-lg shadow-emerald-900/30 active:scale-95 transition-all"
        >
          Κλείσιμο
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-2">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
          Ερώτηση {currentIndex + 1} / {shuffledQuestions.length}
        </span>
        <div className="flex gap-1">
          {shuffledQuestions.map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-1.5 h-1.5 rounded-full transition-colors",
                i === currentIndex ? "bg-emerald-500" : i < currentIndex ? "bg-emerald-500/40" : "bg-zinc-700"
              )}
            />
          ))}
        </div>
      </div>

      <h3 className="text-[15px] font-bold text-white leading-tight px-1">
        {currentQuestion.question}
      </h3>

      <div className="flex flex-col gap-2">
        {currentQuestion.options.map((opt, idx) => {
          const isCorrect = idx === currentQuestion.correctIndex
          const isSelected = idx === selectedOption
          
          let stateClasses = "bg-zinc-900 border-zinc-800 text-white"
          if (isAnswered) {
            if (isCorrect) stateClasses = "bg-emerald-500/20 border-emerald-500 text-emerald-400"
            else if (isSelected) stateClasses = "bg-red-500/20 border-red-500 text-red-400"
            else stateClasses = "bg-zinc-900 border-zinc-800 text-zinc-500"
          }

          return (
            <button
              key={idx}
              onClick={() => handleOptionSelect(idx)}
              disabled={isAnswered}
              className={cn(
                "w-full text-left p-4 rounded-xl border text-[12px] font-medium transition-all flex items-center justify-between min-h-[56px]",
                stateClasses
              )}
            >
              <span>{opt}</span>
              {isAnswered && isCorrect && <CircleCheck className="h-5 w-5" />}
              {isAnswered && isSelected && !isCorrect && <CircleX className="h-5 w-5" />}
            </button>
          )
        })}
      </div>

      {isAnswered && (
        <button
          onClick={handleNext}
          className="mt-2 w-full py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-[11px] uppercase tracking-wider shadow-lg shadow-emerald-900/30 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          {currentIndex < shuffledQuestions.length - 1 ? 'Επόμενη' : 'Τέλος'}
          <ChevronRight size={16} />
        </button>
      )}
    </div>
  )
}

function AddNoteForm({ onAdd, onCancel }: { onAdd: (t: string, c: string) => void; onCancel: () => void }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  return (
    <div className="flex flex-col gap-4 p-2">
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Τίτλος</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Προαιρετικό..."
          className="w-full px-3 py-3 rounded-lg bg-zinc-900 text-white text-sm font-bold border border-zinc-800 focus:border-emerald-500 outline-none"
        />
      </div>
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Περιεχόμενο</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Γράψε εδώ..."
          className="w-full px-3 py-3 rounded-lg bg-zinc-900 text-white text-sm border border-zinc-800 focus:border-emerald-500 outline-none resize-none h-28"
        />
      </div>
      <div className="flex gap-3 pt-2">
        <button
          onClick={onCancel}
          className="flex-1 py-3 rounded-lg bg-zinc-900 text-zinc-400 font-bold text-[11px] uppercase tracking-wider border border-zinc-800 hover:border-zinc-700 transition-all"
        >
          Ακύρωση
        </button>
        <button
          onClick={() => onAdd(title, content)}
          disabled={!content.trim()}
          className="flex-1 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-[11px] uppercase tracking-wider shadow-lg shadow-emerald-900/30 active:scale-95 transition-all disabled:opacity-50"
        >
          Προσθήκη
        </button>
      </div>
    </div>
  )
}
