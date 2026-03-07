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
  rank: 'ΝΕΟΣΥΛΛΕΚΤΟΣ',
  serviceNumber: '',
  weaponCode: '',
  weaponCell: '',
}

export function ProfileTab() {
  const [activeSection, setActiveSection] = useState<'profile' | 'superiors' | 'friends'>('profile')

  return (
    <div className="flex flex-col h-full">
      {/* HEADER - Always Visible */}
      <div className="flex-shrink-0 bg-background px-4 pt-4 pb-3 border-b border-border/50 safe-top">
        <div>
          <h1 className="text-xl font-bold text-foreground">Προφίλ</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Στοιχεία, ιεραρχία & φίλοι</p>
        </div>

        {/* Section Toggle - 3 tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-secondary/50 border border-white/5 mt-3">
          <button
            onClick={() => {
              hapticFeedback('light')
              setActiveSection('profile')
            }}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-300',
              activeSection === 'profile'
                ? 'bg-primary text-primary-foreground shadow-[0_0_12px_rgba(163,230,53,0.3)]'
                : 'text-muted-foreground'
            )}
          >
            <User className="h-3 w-3" />
            Στοιχεία
          </button>
          <button
            onClick={() => {
              hapticFeedback('light')
              setActiveSection('superiors')
            }}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-300',
              activeSection === 'superiors'
                ? 'bg-primary text-primary-foreground shadow-[0_0_12px_rgba(163,230,53,0.3)]'
                : 'text-muted-foreground'
            )}
          >
            <Users className="h-3 w-3" />
            Ιεραρχία
          </button>
          <button
            onClick={() => {
              hapticFeedback('light')
              setActiveSection('friends')
            }}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-300',
              activeSection === 'friends'
                ? 'bg-primary text-primary-foreground shadow-[0_0_12px_rgba(163,230,53,0.3)]'
                : 'text-muted-foreground'
            )}
          >
            <UserPlus className="h-3 w-3" />
            Φίλοι
          </button>
        </div>
      </div>

      {/* CONTENT - Scrollable */}
      <div className="flex-1 overflow-y-auto px-4 py-4 no-scrollbar">
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
      <div className="glass-card rounded-2xl p-4 flex flex-col gap-4 border border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary border border-primary flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(163,230,53,0.1)]">
            <User className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-black text-foreground truncate tracking-tight">
              {profile.fullName || 'Ονοματεπώνυμο'}
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="px-1.5 py-0.5 rounded bg-primary text-primary-foreground text-[8px] font-black uppercase tracking-tight">
                {profile.rank}
              </span>
              {profile.serviceNumber && (
                <span className="text-[8px] text-muted-foreground font-bold uppercase tracking-widest">
                  ID: {profile.serviceNumber}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={startEdit}
            className="p-2 rounded-lg bg-secondary/50 border border-white/5 hover:bg-secondary transition-colors"
            aria-label="Επεξεργασία"
          >
            <Edit3 className="h-3.5 w-3.5 text-primary" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <InfoField label="Λόχος" value={profile.company} />
          <InfoField label="Θάλαμος" value={profile.barracks} />
          <InfoField label="Αίμα" value={profile.bloodType} />
          <InfoField label="Βαθμός" value={profile.rank} />
          <InfoField label="Κωδ. Όπλου" value={profile.weaponCode} />
          <InfoField label="Κελί Όπλου" value={profile.weaponCell} />
        </div>

        {profile.reportingPhrase && (
          <div className="p-3 rounded-xl bg-secondary/30 border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
            <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1.5">Φράση Αναφοράς</p>
            <p className="text-xs text-foreground/90 italic font-medium leading-relaxed">{`"${profile.reportingPhrase}"`}</p>
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
      <div className="flex flex-col gap-3">
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

        <div className="grid grid-cols-2 gap-2">
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

        <div className="grid grid-cols-2 gap-2">
          <FormField
            label="Κωδικός Όπλου"
            value={form.weaponCode}
            onChange={(v) => setForm({ ...form, weaponCode: v })}
          />
          <FormField
            label="Κελί Όπλου"
            value={form.weaponCell}
            onChange={(v) => setForm({ ...form, weaponCell: v })}
          />
        </div>

        {/* Rank Selector */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Βαθμός</label>
          <button
            type="button"
            onClick={() => {
              hapticFeedback('light')
              setShowRanks(!showRanks)
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm min-h-[40px] border border-border"
          >
            <span>{form.rank}</span>
            {showRanks ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {showRanks && (
            <div className="mt-1 max-h-40 overflow-y-auto rounded-lg bg-secondary border border-border no-scrollbar">
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
                    'w-full text-left px-3 py-2 text-sm min-h-[36px]',
                    form.rank === r ? 'text-primary-foreground font-semibold bg-primary' : 'text-foreground'
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
          <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Ομάδα Αίματος</label>
          <button
            type="button"
            onClick={() => {
              hapticFeedback('light')
              setShowBlood(!showBlood)
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm min-h-[40px] border border-border"
          >
            <span className={cn(!form.bloodType && 'text-muted-foreground')}>
              {form.bloodType || 'Επίλεξε'}
            </span>
            {showBlood ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {showBlood && (
            <div className="mt-1 grid grid-cols-4 gap-1 p-1.5 rounded-lg bg-secondary border border-border">
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
                    'py-2 rounded-lg text-sm font-medium min-h-[36px]',
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
          <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Φράση Αναφοράς</label>
          <textarea
            value={form.reportingPhrase}
            onChange={(e) => setForm({ ...form, reportingPhrase: e.target.value })}
            placeholder="Π.χ. Στρατιώτης Παπαδόπουλος αναφέρομαι..."
            className="w-full px-3 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm min-h-[60px] border border-border resize-none placeholder:text-muted-foreground/50"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={() => setIsEditing(false)}
            className="flex-1 py-2.5 rounded-lg bg-secondary text-secondary-foreground font-bold text-[10px] uppercase tracking-wider min-h-[44px] flex items-center justify-center gap-1"
          >
            <X className="h-3.5 w-3.5" />
            Ακύρωση
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground font-bold text-[10px] uppercase tracking-wider min-h-[44px] flex items-center justify-center gap-1"
          >
            <Check className="h-3.5 w-3.5" />
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
        <h2 className="text-xs font-black text-muted-foreground uppercase tracking-widest">Ιεραρχία</h2>
        <button
          onClick={() => {
            hapticFeedback('light')
            setShowAdd(true)
          }}
          className="p-2 rounded-lg glass-card min-h-[40px] min-w-[40px] flex items-center justify-center"
          aria-label="Προσθήκη ανωτέρου"
        >
          <Plus className="h-4 w-4 text-primary" />
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
        <div className="glass-card rounded-xl p-6 text-center border border-white/5">
          <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Δεν έχεις καταχωρήσει ανωτέρους</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {superiors.map((sup) => (
            <div key={sup.id} className="glass-card rounded-xl p-2.5 flex items-center gap-3 border border-white/5">
              <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-bold text-foreground truncate">{sup.name}</p>
                  <span className="text-[8px] font-black text-primary uppercase tracking-tight bg-primary/10 px-1 rounded">
                    {sup.rank}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  {sup.role && (
                    <p className="text-[10px] text-muted-foreground truncate">{sup.role}</p>
                  )}
                  {sup.phone && (
                    <p className="text-[10px] text-primary font-mono">{sup.phone}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                {sup.phone && (
                  <a
                    href={`tel:${sup.phone}`}
                    onClick={() => hapticFeedback('medium')}
                    className="p-2 rounded-lg min-h-[36px] min-w-[36px] flex items-center justify-center bg-primary/10 text-primary"
                    aria-label={`Κλήση ${sup.name}`}
                  >
                    <Phone className="h-3.5 w-3.5" />
                  </a>
                )}
                <button
                  onClick={() => {
                    hapticFeedback('medium')
                    setSuperiors(superiors.filter((s) => s.id !== sup.id))
                  }}
                  className="p-2 rounded-lg min-h-[36px] min-w-[36px] flex items-center justify-center text-destructive/70 hover:text-destructive"
                  aria-label="Διαγραφή"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
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
        <h2 className="text-xs font-black text-muted-foreground uppercase tracking-widest">Φίλοι</h2>
        <button
          onClick={() => {
            hapticFeedback('light')
            setShowAdd(true)
          }}
          className="p-2 rounded-lg glass-card min-h-[40px] min-w-[40px] flex items-center justify-center"
          aria-label="Προσθήκη φίλου"
        >
          <Plus className="h-4 w-4 text-primary" />
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
        <div className="glass-card rounded-xl p-6 text-center border border-white/5">
          <UserPlus className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Δεν έχεις προσθέσει φίλους</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {friends.map((friend) => (
            <div key={friend.id} className="glass-card rounded-xl p-2.5 flex items-center gap-3 border border-white/5">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate">{friend.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {friend.unit && (
                    <p className="text-[10px] text-primary truncate">{friend.unit}</p>
                  )}
                  {friend.phone && (
                    <p className="text-[10px] text-muted-foreground font-mono">{friend.phone}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {friend.phone && (
                  <a
                    href={`tel:${friend.phone}`}
                    onClick={() => hapticFeedback('medium')}
                    className="p-2 rounded-lg min-h-[36px] min-w-[36px] flex items-center justify-center bg-primary/10 text-primary"
                    aria-label={`Κλήση ${friend.name}`}
                  >
                    <Phone className="h-3.5 w-3.5" />
                  </a>
                )}
                <button
                  onClick={() => {
                    hapticFeedback('medium')
                    setFriends(friends.filter((f) => f.id !== friend.id))
                  }}
                  className="p-2 rounded-lg min-h-[36px] min-w-[36px] flex items-center justify-center text-destructive/70 hover:text-destructive"
                  aria-label="Διαγραφή"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
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
    <div className="flex flex-col gap-3">
      <FormField label="Ονοματεπώνυμο" value={name} onChange={setName} />

      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Τηλέφωνο</label>
        <input
          type="tel"
          inputMode="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Π.χ. 69XXXXXXXX"
          className="w-full px-3 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm min-h-[40px] border border-border placeholder:text-muted-foreground/50"
        />
      </div>

      <FormField
        label="Μονάδα / Λόχος"
        value={unit}
        onChange={setUnit}
        placeholder="Π.χ. Α' Λόχος, 71 Ταξιαρχία"
      />

      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Σημειώσεις</label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Προαιρετικό..."
          className="w-full px-3 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm min-h-[40px] border border-border placeholder:text-muted-foreground/50"
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
          onClick={handleSubmit}
          disabled={!name.trim()}
          className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground font-bold text-[10px] uppercase tracking-wider min-h-[44px] disabled:opacity-40"
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
  const [phone, setPhone] = useState('')
  const [showRanks, setShowRanks] = useState(false)

  const handleSubmit = () => {
    if (!name.trim()) return
    hapticFeedback('heavy')
    onAdd({ id: generateId(), name: name.trim(), rank, role: role.trim(), phone: phone.trim() })
  }

  return (
    <div className="flex flex-col gap-3">
      <FormField label="Ονοματεπώνυμο" value={name} onChange={setName} />

      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Βαθμός</label>
        <button
          type="button"
          onClick={() => {
            hapticFeedback('light')
            setShowRanks(!showRanks)
          }}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm min-h-[40px] border border-border"
        >
          <span>{rank}</span>
          {showRanks ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {showRanks && (
          <div className="mt-1 max-h-40 overflow-y-auto rounded-lg bg-secondary border border-border no-scrollbar">
            {RANKS.slice(5).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  hapticFeedback('light')
                  setRank(r)
                  setShowRanks(false)
                }}
                className={cn(
                  'w-full text-left px-3 py-2 text-sm min-h-[36px]',
                  rank === r ? 'text-primary-foreground font-semibold bg-primary' : 'text-foreground'
                )}
              >
                {r}
              </button>
            ))}
          </div>
        )}
      </div>

      <FormField label="Καθήκοντα / Ρόλος" value={role} onChange={setRole} placeholder="Π.χ. Διοικητής Λόχου" />

      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Τηλέφωνο</label>
        <input
          type="tel"
          inputMode="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Προαιρετικό..."
          className="w-full px-3 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm min-h-[40px] border border-border placeholder:text-muted-foreground/50"
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
          onClick={handleSubmit}
          disabled={!name.trim()}
          className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground font-bold text-[10px] uppercase tracking-wider min-h-[44px] disabled:opacity-40"
        >
          Προσθήκη
        </button>
      </div>
    </div>
  )
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">{label}</span>
      <span className="text-xs font-bold text-foreground truncate">{value || '—'}</span>
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
      <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm min-h-[40px] border border-border placeholder:text-muted-foreground/50"
      />
    </div>
  )
}
