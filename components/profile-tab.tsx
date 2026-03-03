'use client'

import { useState } from 'react'
import { Plus, Trash2, User, Users, ChevronDown, ChevronUp, Edit3, Check, X, Phone, UserPlus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { FullscreenModal } from '@/components/fullscreen-modal'
import { hapticFeedback, generateId } from '@/lib/helpers'
import type { ProfileData, SuperiorEntry, FriendEntry } from '@/lib/types'
import { RANKS, BLOOD_TYPES } from '@/lib/types'

const DEFAULT_PROFILE: ProfileData = {
  fullName: '',
  company: '',
  barracks: '',
  bloodType: '',
  reportingPhrase: '',
  rank: 'Στρατιώτης',
  serviceNumber: '',
}

export function ProfileTab() {
  const [activeSection, setActiveSection] = useState<'profile' | 'superiors' | 'friends'>('profile')

  return (
    <div className="flex flex-col h-full">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 px-4 pt-4 pb-3" style={{ background: 'linear-gradient(180deg, oklch(0.14 0.002 250) 0%, oklch(0.06 0.001 250) 100%)' }}>
        <div>
          <h1 className="text-xl font-bold text-foreground">Προφίλ</h1>
          <p className="text-xs text-muted-foreground">Στοιχεία, ιεραρχία & φίλοι</p>
        </div>

        {/* Section Toggle - 3 tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-secondary mt-3">
          <button
            onClick={() => {
              hapticFeedback('light')
              setActiveSection('profile')
            }}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium min-h-[44px] transition-colors',
              activeSection === 'profile'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground'
            )}
          >
            <User className="h-4 w-4" />
            Στοιχεία
          </button>
          <button
            onClick={() => {
              hapticFeedback('light')
              setActiveSection('superiors')
            }}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium min-h-[44px] transition-colors',
              activeSection === 'superiors'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground'
            )}
          >
            <Users className="h-4 w-4" />
            Ιεραρχία
          </button>
          <button
            onClick={() => {
              hapticFeedback('light')
              setActiveSection('friends')
            }}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium min-h-[44px] transition-colors',
              activeSection === 'friends'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground'
            )}
          >
            <UserPlus className="h-4 w-4" />
            Φίλοι
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-28 pt-4">
        {activeSection === 'profile' && <ProfileSection />}
        {activeSection === 'superiors' && <SuperiorsSection />}
        {activeSection === 'friends' && <FriendsSection />}
      </div>
    </div>
  )
}

function ProfileSection() {
  const [profile, setProfile] = useLocalStorage<ProfileData>('fantaros-profile', DEFAULT_PROFILE)
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState<ProfileData>(profile)
  const [showRanks, setShowRanks] = useState(false)
  const [showBlood, setShowBlood] = useState(false)

  const handleSave = () => {
    hapticFeedback('heavy')
    setProfile(form)
    setIsEditing(false)
  }

  const startEdit = () => {
    hapticFeedback('light')
    setForm(profile)
    setIsEditing(true)
  }

  if (!isEditing) {
    return (
      <div className="glass-card rounded-2xl p-5 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <User className="h-8 w-8 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-foreground truncate">
              {profile.fullName || 'Ονοματεπώνυμο'}
            </h2>
            <p className="text-xs text-primary">{profile.rank}</p>
            {profile.serviceNumber && (
              <p className="text-[10px] text-muted-foreground font-mono mt-0.5">ΑΜ: {profile.serviceNumber}</p>
            )}
          </div>
          <button
            onClick={startEdit}
            className="p-2 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Επεξεργασία"
          >
            <Edit3 className="h-5 w-5 text-primary" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <InfoField label="Λόχος" value={profile.company} />
          <InfoField label="Θάλαμος" value={profile.barracks} />
          <InfoField label="Ομάδα Αίματος" value={profile.bloodType} />
          <InfoField label="Βαθμός" value={profile.rank} />
        </div>

        {profile.reportingPhrase && (
          <div className="p-3 rounded-lg bg-secondary">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Φράση Αναφοράς</p>
            <p className="text-sm text-foreground italic">{`"${profile.reportingPhrase}"`}</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <FullscreenModal
      isOpen={isEditing}
      onClose={() => setIsEditing(false)}
      title="Επεξεργασία Προφίλ"
    >
      <div className="flex flex-col gap-4">
        <FormField
          label="Ονοματεπώνυμο"
          value={form.fullName}
          onChange={(v) => setForm({ ...form, fullName: v })}
        />

        <FormField
          label="Αριθμός Μητρώου"
          value={form.serviceNumber}
          onChange={(v) => setForm({ ...form, serviceNumber: v })}
        />

        <div className="grid grid-cols-2 gap-3">
          <FormField
            label="Λόχος"
            value={form.company}
            onChange={(v) => setForm({ ...form, company: v })}
          />
          <FormField
            label="Θάλαμος"
            value={form.barracks}
            onChange={(v) => setForm({ ...form, barracks: v })}
          />
        </div>

        {/* Rank Selector */}
        <div>
          <label className="block text-xs text-muted-foreground mb-1.5">Βαθμός</label>
          <button
            type="button"
            onClick={() => {
              hapticFeedback('light')
              setShowRanks(!showRanks)
            }}
            className="w-full flex items-center justify-between px-3 py-3 rounded-lg bg-secondary text-secondary-foreground text-sm min-h-[48px] border border-border"
          >
            <span>{form.rank}</span>
            {showRanks ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {showRanks && (
            <div className="mt-1 max-h-48 overflow-y-auto rounded-lg bg-secondary border border-border">
              {RANKS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    hapticFeedback('light')
                    setForm({ ...form, rank: r })
                    setShowRanks(false)
                  }}
                  className={cn(
                    'w-full text-left px-3 py-2.5 text-sm min-h-[44px]',
                    form.rank === r ? 'text-primary font-semibold bg-primary/10' : 'text-foreground'
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Blood Type Selector */}
        <div>
          <label className="block text-xs text-muted-foreground mb-1.5">Ομάδα Αίματος</label>
          <button
            type="button"
            onClick={() => {
              hapticFeedback('light')
              setShowBlood(!showBlood)
            }}
            className="w-full flex items-center justify-between px-3 py-3 rounded-lg bg-secondary text-secondary-foreground text-sm min-h-[48px] border border-border"
          >
            <span className={cn(!form.bloodType && 'text-muted-foreground')}>
              {form.bloodType || 'Επίλεξε'}
            </span>
            {showBlood ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {showBlood && (
            <div className="mt-1 grid grid-cols-4 gap-1 p-2 rounded-lg bg-secondary border border-border">
              {BLOOD_TYPES.map((bt) => (
                <button
                  key={bt}
                  type="button"
                  onClick={() => {
                    hapticFeedback('light')
                    setForm({ ...form, bloodType: bt })
                    setShowBlood(false)
                  }}
                  className={cn(
                    'py-2.5 rounded-lg text-sm font-medium min-h-[44px]',
                    form.bloodType === bt
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground'
                  )}
                >
                  {bt}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs text-muted-foreground mb-1.5">Φράση Αναφοράς</label>
          <textarea
            value={form.reportingPhrase}
            onChange={(e) => setForm({ ...form, reportingPhrase: e.target.value })}
            placeholder="Π.χ. Στρατιώτης Παπαδόπουλος αναφέρομαι..."
            className="w-full px-3 py-3 rounded-lg bg-secondary text-secondary-foreground text-sm min-h-[80px] border border-border resize-none placeholder:text-muted-foreground"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={() => setIsEditing(false)}
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
    </FullscreenModal>
  )
}

function SuperiorsSection() {
  const [superiors, setSuperiors] = useLocalStorage<SuperiorEntry[]>('fantaros-superiors', [])
  const [showAdd, setShowAdd] = useState(false)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Ανώτεροι</h2>
        <button
          onClick={() => {
            hapticFeedback('light')
            setShowAdd(true)
          }}
          className="p-2 rounded-xl glass-card min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Προσθήκη ανωτέρου"
        >
          <Plus className="h-5 w-5 text-primary" />
        </button>
      </div>

      <FullscreenModal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        title="Νέος Ανώτερος"
      >
        <AddSuperiorForm
          onAdd={(sup) => {
            setSuperiors([...superiors, sup])
            setShowAdd(false)
          }}
          onCancel={() => setShowAdd(false)}
        />
      </FullscreenModal>

      {superiors.length === 0 ? (
        <div className="glass-card rounded-xl p-6 text-center">
          <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Δεν έχεις καταχωρήσει ανωτέρους</p>
        </div>
      ) : (
        superiors.map((sup) => (
          <div key={sup.id} className="glass-card rounded-xl p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{sup.name}</p>
              <p className="text-xs text-primary">{sup.rank}</p>
              {sup.role && (
                <p className="text-[10px] text-muted-foreground">{sup.role}</p>
              )}
            </div>
            <button
              onClick={() => {
                hapticFeedback('medium')
                setSuperiors(superiors.filter((s) => s.id !== sup.id))
              }}
              className="p-2 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center text-destructive flex-shrink-0"
              aria-label="Διαγραφή"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))
      )}
    </div>
  )
}

function FriendsSection() {
  const [friends, setFriends] = useLocalStorage<FriendEntry[]>('fantaros-friends', [])
  const [showAdd, setShowAdd] = useState(false)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Φίλοι</h2>
        <button
          onClick={() => {
            hapticFeedback('light')
            setShowAdd(true)
          }}
          className="p-2 rounded-xl glass-card min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Προσθήκη φίλου"
        >
          <Plus className="h-5 w-5 text-primary" />
        </button>
      </div>

      <FullscreenModal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        title="Νέος Φίλος"
      >
        <AddFriendForm
          onAdd={(friend) => {
            setFriends([...friends, friend])
            setShowAdd(false)
          }}
          onCancel={() => setShowAdd(false)}
        />
      </FullscreenModal>

      {friends.length === 0 ? (
        <div className="glass-card rounded-xl p-6 text-center">
          <UserPlus className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Δεν έχεις προσθέσει φίλους</p>
          <p className="text-xs text-muted-foreground mt-1">Πάτησε + για να προσθέσεις</p>
        </div>
      ) : (
        friends.map((friend) => (
          <div key={friend.id} className="glass-card rounded-xl p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{friend.name}</p>
              {friend.unit && (
                <p className="text-xs text-primary">{friend.unit}</p>
              )}
              {friend.phone && (
                <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{friend.phone}</p>
              )}
              {friend.notes && (
                <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{friend.notes}</p>
              )}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {friend.phone && (
                <a
                  href={`tel:${friend.phone}`}
                  onClick={() => hapticFeedback('medium')}
                  className="p-2 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center bg-primary/15"
                  aria-label={`Κλήση ${friend.name}`}
                >
                  <Phone className="h-4.5 w-4.5 text-primary" />
                </a>
              )}
              <button
                onClick={() => {
                  hapticFeedback('medium')
                  setFriends(friends.filter((f) => f.id !== friend.id))
                }}
                className="p-2 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center text-destructive"
                aria-label="Διαγραφή"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

function AddFriendForm({ onAdd, onCancel }: {
  onAdd: (friend: FriendEntry) => void
  onCancel: () => void
}) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [unit, setUnit] = useState('')
  const [notes, setNotes] = useState('')

  const handleSubmit = () => {
    if (!name.trim()) return
    hapticFeedback('heavy')
    onAdd({
      id: generateId(),
      name: name.trim(),
      phone: phone.trim(),
      unit: unit.trim(),
      notes: notes.trim(),
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <FormField label="Ονοματεπώνυμο" value={name} onChange={setName} />

      <div>
        <label className="block text-xs text-muted-foreground mb-1.5">Τηλέφωνο</label>
        <input
          type="tel"
          inputMode="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Π.χ. 69XXXXXXXX"
          className="w-full px-3 py-3 rounded-lg bg-secondary text-secondary-foreground text-sm min-h-[48px] border border-border placeholder:text-muted-foreground"
        />
      </div>

      <FormField
        label="Μονάδα / Λόχος"
        value={unit}
        onChange={setUnit}
        placeholder="Π.χ. Α' Λόχος, 71 Ταξιαρχία"
      />

      <div>
        <label className="block text-xs text-muted-foreground mb-1.5">Σημειώσεις</label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Προαιρετικό..."
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
          disabled={!name.trim()}
          className="flex-1 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm min-h-[48px] disabled:opacity-40"
        >
          Προσθήκη
        </button>
      </div>
    </div>
  )
}

function AddSuperiorForm({ onAdd, onCancel }: {
  onAdd: (sup: SuperiorEntry) => void
  onCancel: () => void
}) {
  const [name, setName] = useState('')
  const [rank, setRank] = useState('Λοχαγός')
  const [role, setRole] = useState('')
  const [showRanks, setShowRanks] = useState(false)

  const handleSubmit = () => {
    if (!name.trim()) return
    hapticFeedback('heavy')
    onAdd({ id: generateId(), name: name.trim(), rank, role: role.trim() })
  }

  return (
    <div className="flex flex-col gap-4">
      <FormField label="Ονοματεπώνυμο" value={name} onChange={setName} />

      <div>
        <label className="block text-xs text-muted-foreground mb-1.5">Βαθμός</label>
        <button
          type="button"
          onClick={() => {
            hapticFeedback('light')
            setShowRanks(!showRanks)
          }}
          className="w-full flex items-center justify-between px-3 py-3 rounded-lg bg-secondary text-secondary-foreground text-sm min-h-[48px] border border-border"
        >
          <span>{rank}</span>
          {showRanks ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {showRanks && (
          <div className="mt-1 max-h-48 overflow-y-auto rounded-lg bg-secondary border border-border">
            {RANKS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  hapticFeedback('light')
                  setRank(r)
                  setShowRanks(false)
                }}
                className={cn(
                  'w-full text-left px-3 py-2.5 text-sm min-h-[44px]',
                  rank === r ? 'text-primary font-semibold bg-primary/10' : 'text-foreground'
                )}
              >
                {r}
              </button>
            ))}
          </div>
        )}
      </div>

      <FormField
        label="Θέση / Ρόλος"
        value={role}
        onChange={setRole}
        placeholder="Π.χ. Διοικητής Λόχου"
      />

      <div className="flex gap-2 pt-2">
        <button
          onClick={onCancel}
          className="flex-1 py-3 rounded-lg bg-secondary text-secondary-foreground font-medium text-sm min-h-[48px]"
        >
          Ακύρωση
        </button>
        <button
          onClick={handleSubmit}
          disabled={!name.trim()}
          className="flex-1 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm min-h-[48px] disabled:opacity-40"
        >
          Προσθήκη
        </button>
      </div>
    </div>
  )
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-2.5 rounded-lg bg-secondary">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="text-sm font-medium text-foreground mt-0.5">{value || '---'}</p>
    </div>
  )
}

function FormField({ label, value, onChange, placeholder }: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div>
      <label className="block text-xs text-muted-foreground mb-1.5">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || label}
        className="w-full px-3 py-3 rounded-lg bg-secondary text-secondary-foreground text-sm min-h-[48px] border border-border placeholder:text-muted-foreground"
      />
    </div>
  )
}
