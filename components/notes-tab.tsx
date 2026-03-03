'use client'

import { useState } from 'react'
import { Plus, Trash2, FileText, BookOpen, Edit3, Check, X, ChevronDown, ChevronRight, Star, Radio, Heart, Award } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { FullscreenModal } from '@/components/fullscreen-modal'
import { hapticFeedback, formatGreekDate, generateId, toLocalDateString } from '@/lib/helpers'
import type { NoteEntry } from '@/lib/types'

// Military manuals data
const MILITARY_MANUALS = [
  {
    id: 'ranks',
    title: 'Στρατιωτικοί Βαθμοί',
    icon: Award,
    sections: [
      {
        title: 'Υπαξιωματικοί (Στεκόμαστε προσοχή)',
        items: [
          'Δεκανέας: 1 γαλόνι (V)',
          'Λοχίας: 2 γαλόνια',
          'Επιλοχίας: 3 γαλόνια',
          'Αρχιλοχίας: 4 γαλόνια',
        ],
      },
      {
        title: 'Κατώτεροι Αξιωματικοί (Χαιρετάμε)',
        items: [
          'Ανθυπολοχαγός: 1 ασημένιο αστέρι',
          'Υπολοχαγός: 2 ασημένια αστέρια',
          'Λοχαγός: 3 ασημένια αστέρια (Διοικητής Λόχου)',
        ],
      },
      {
        title: 'Ανώτεροι Αξιωματικοί (Χαιρετάμε)',
        items: [
          'Ταγματάρχης: 1 χρυσή φλογοφόρος ροιά',
          'Αντισυνταγματάρχης: 2 χρυσές φλογοφόρες',
          'Συνταγματάρχης: 3 χρυσές φλογοφόρες (Διοικητής Μονάδας)',
        ],
      },
      {
        title: 'Ανώτατοι Αξιωματικοί (Χαιρετάμε)',
        items: [
          'Ταξίαρχος: 1 χρυσό αστέρι + 1 φλογοφόρος',
          'Υποστράτηγος: 2 χρυσά αστέρια + 1 φλογοφόρος',
          'Αντιστράτηγος: 3 χρυσά αστέρια + 1 φλογοφόρος',
          'Στρατηγός: 4 χρυσά αστέρια + 1 φλογοφόρος',
        ],
      },
    ],
  },
  {
    id: 'alphabet',
    title: 'Φωνητικό Αλφάβητο',
    icon: Radio,
    sections: [
      {
        title: 'Ελληνικό Τυποποιημένο Αλφάβητο',
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
        title: 'Βασική Ορολογία Ασυρμάτου',
        items: [
          '«Λήψη;» : Με ακούς;',
          '«Ορθόν» : Σωστά / Κατανοητό',
          '«Άκυρον» : Λάθος / Αγνόησε',
          '«Ομιλείτε» : Ξεκίνα να μιλάς',
        ],
      },
    ],
  },
  {
    id: 'firstaid',
    title: 'Πρώτες Βοήθειες',
    icon: Heart,
    sections: [
      {
        title: 'Θερμική Εξάντληση / Θερμοπληξία',
        items: [
          'Μεταφορά σε σκιερό και δροσερό μέρος',
          'Αφαίρεση εξάρτυσης, κράνους, χιτωνίου',
          'Ενυδάτωση με μικρές, συχνές γουλιές νερού',
          'Δροσισμός με βρεγμένο πανί σε αυχένα, μέτωπο, μασχάλες',
        ],
      },
      {
        title: 'Αιμορραγία (Τραύμα)',
        items: [
          'Άμεση και σταθερή πίεση με καθαρή γάζα/επίδεσμο',
          'Συνεχής πίεση για 5-10 λεπτά',
          'Ανύψωση μέλους πάνω από καρδιά (αν δεν υπάρχει κάταγμα)',
        ],
      },
      {
        title: 'Διάστρεμμα (Μέθοδος Κ.Π.Α.Α.)',
        items: [
          'Κατάκλιση: Ακινησία του μέλους',
          'Πάγος: Κρύο νερό/πανί για 15-20 λεπτά',
          'Ανύψωση: Τοποθέτηση ποδιού ψηλά',
          'Ανάπαυση',
          'Μην βγάλεις το άρβυλο αν πρέπει να περπατήσεις!',
        ],
      },
      {
        title: 'Τσίμπημα Εντόμου',
        items: [
          'Αφαίρεση κεντριού ξύνοντας (με κάρτα, όχι δάχτυλα)',
          'Πλύσιμο με νερό και σαπούνι',
          'Κρύο επίθεμα για μείωση πρηξίματος',
          'Προσοχή σε αλλεργική αντίδραση: δύσπνοια, πρήξιμο',
        ],
      },
    ],
  },
]

export function NotesTab() {
  const [activeSection, setActiveSection] = useState<'notes' | 'manuals'>('notes')

  return (
    <div className="flex flex-col gap-4 pb-4">
      <div>
        <h1 className="text-xl font-bold text-foreground">Σημειώσεις</h1>
        <p className="text-xs text-muted-foreground">Προσωπικές σημειώσεις & εγχειρίδια</p>
      </div>

      {/* Section Toggle */}
      <div className="flex gap-2 p-1 rounded-xl bg-secondary">
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
        <button
          onClick={() => {
            hapticFeedback('light')
            setActiveSection('manuals')
          }}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium min-h-[44px] transition-colors',
            activeSection === 'manuals'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground'
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
          <p className="text-[10px] text-muted-foreground mt-1">Πάτησε + για να προσθέσεις</p>
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

function ManualsSection() {
  const [expandedManual, setExpandedManual] = useState<string | null>(null)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-muted-foreground">
        Γενικές πληροφορίες & εγχειρίδια για τον στρατιώτη
      </p>

      {MILITARY_MANUALS.map((manual) => {
        const Icon = manual.icon
        const isExpanded = expandedManual === manual.id

        return (
          <div key={manual.id} className="glass-card rounded-xl overflow-hidden">
            <button
              onClick={() => {
                hapticFeedback('light')
                setExpandedManual(isExpanded ? null : manual.id)
                setExpandedSection(null)
              }}
              className="w-full flex items-center gap-3 p-4 min-h-[56px]"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <span className="flex-1 text-sm font-semibold text-foreground text-left">{manual.title}</span>
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              )}
            </button>

            {isExpanded && (
              <div className="px-4 pb-4 flex flex-col gap-2">
                {manual.sections.map((section, idx) => {
                  const sectionKey = `${manual.id}-${idx}`
                  const isSectionExpanded = expandedSection === sectionKey

                  return (
                    <div key={sectionKey}>
                      <button
                        onClick={() => {
                          hapticFeedback('light')
                          setExpandedSection(isSectionExpanded ? null : sectionKey)
                        }}
                        className="w-full flex items-center justify-between py-2.5 px-3 rounded-lg bg-secondary min-h-[44px]"
                      >
                        <span className="text-xs font-medium text-foreground text-left flex-1">{section.title}</span>
                        {isSectionExpanded ? (
                          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 ml-2" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 ml-2" />
                        )}
                      </button>
                      {isSectionExpanded && (
                        <div className="mt-1 ml-1 flex flex-col gap-1.5 py-2">
                          {section.items.map((item, itemIdx) => (
                            <div key={itemIdx} className="flex items-start gap-2 px-3">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                              <p className="text-xs text-secondary-foreground leading-relaxed">{item}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
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
