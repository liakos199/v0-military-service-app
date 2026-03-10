'use client'

import { useState } from 'react'
import { User, Trash2, ChevronDown, ChevronUp, Edit3, Plus, UserPlus, Shield } from 'lucide-react'
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
    <div className="flex flex-col h-full bg-background">
      {/* HEADER - Always Visible */}
      <div className="flex-shrink-0 px-4 pt-6 pb-4 border-b border-border/40 safe-top">
        <div className="mb-5">
          <h1 className="text-2xl font-black text-foreground tracking-tight">Άτομα</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold mt-1">Στοιχεία, ιεραρχία & φίλοι</p>
        </div>

        {/* Section Toggle - 3 tabs with consistent coloring */}
        <div className="flex gap-1 p-1 rounded-xl bg-muted/30 border border-border/40">
          <button
            onClick={() => {
              hapticFeedback('light')
              setActiveSection('profile')
            }}
            className={cn(
              'flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-200',
              activeSection === 'profile'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Στοιχεία
          </button>
          <button
            onClick={() => {
              hapticFeedback('light')
              setActiveSection('superiors')
            }}
            className={cn(
              'flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-200',
              activeSection === 'superiors'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Ανώτεροι
          </button>
          <button
            onClick={() => {
              hapticFeedback('light')
              setActiveSection('friends')
            }}
            className={cn(
              'flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-200',
              activeSection === 'friends'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Φίλοι
          </button>
        </div>
      </div>

      {/* CONTENT - Scrollable */}
      <div className="flex-1 overflow-y-auto px-4 py-6 no-scrollbar">
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
      <div className="space-y-6 pb-8">
        {/* Main Profile Info with User Icon */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-muted/50 border border-border/40 flex items-center justify-center flex-shrink-0">
            <User className="h-8 w-8 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-black text-foreground tracking-tight truncate leading-tight">
              {profile.fullName || 'Ονοματεπώνυμο'}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                {profile.rank}
              </span>
              {profile.serviceNumber && (
                <span className="text-[10px] text-muted-foreground font-bold">
                  #{profile.serviceNumber}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={startEdit}
            className="p-2.5 rounded-xl bg-muted/50 border border-border/40 hover:bg-muted transition-colors"
          >
            <Edit3 className="h-4 w-4 text-foreground" />
          </button>
        </div>

        {/* Info Grid - Clean and Professional */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-5 pt-6 border-t border-border/40">
          <InfoField label="Λόχος" value={profile.company} />
          <InfoField label="Θάλαμος" value={profile.barracks} />
          <InfoField label="Αίμα" value={profile.bloodType} />
          <InfoField label="Κωδ. Όπλου" value={profile.weaponCode} />
          <InfoField label="Κελί Όπλου" value={profile.weaponCell} />
        </div>

        {/* Reporting Phrase */}
        {profile.reportingPhrase && (
          <div className="pt-6 border-t border-border/40">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] mb-1.5">Φράση Αναφοράς</p>
            <p className="text-sm text-foreground/90 font-medium leading-relaxed italic">
              "{profile.reportingPhrase}"
            </p>
          </div>
        )}

        {/* Empty State */}
        {!profile.fullName && (
          <div className="py-12 text-center border-t border-border/40">
            <p className="text-xs text-muted-foreground font-bold mb-4">Δεν έχουν προστεθεί στοιχεία</p>
            <button
              onClick={startEdit}
              className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-opacity"
            >
              Προσθήκη Στοιχείων
            </button>
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

        <div className="grid grid-cols-2 gap-4">
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

        <div className="grid grid-cols-2 gap-4">
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
          <label className="block text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-1.5">Βαθμός</label>
          <button
            type="button"
            onClick={() => {
              hapticFeedback('light')
              setShowRanks(!showRanks)
            }}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-muted/30 text-foreground text-sm border border-border/40 font-bold"
          >
            <span>{form.rank}</span>
            {showRanks ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {showRanks && (
            <div className="mt-2 max-h-40 overflow-y-auto rounded-xl bg-card border border-border no-scrollbar shadow-xl">
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
                    'w-full text-left px-4 py-2.5 text-sm font-bold',
                    form.rank === r ? 'text-primary bg-primary/5' : 'text-foreground/70 hover:bg-muted/30'
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
          <label className="block text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-1.5">Ομάδα Αίματος</label>
          <div className="grid grid-cols-4 gap-1.5">
            {BLOOD_TYPES.map((bt) => (
              <button
                key={bt}
                type="button"
                onClick={() => {
                  hapticFeedback('light')
                  setForm({ ...form, bloodType: bt })
                }}
                className={cn(
                  'py-2 rounded-lg text-[10px] font-black transition-all border',
                  form.bloodType === bt
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-muted/30 text-muted-foreground border-border/40'
                )}
              >
                {bt}
              </button>
            ))}
          </div>
        </div>

        <FormField
          label="Φράση Αναφοράς"
          value={form.reportingPhrase}
          onChange={(v) => setForm({ ...form, reportingPhrase: v })}
          placeholder="Π.χ. Στρατιώτης [Όνομα], Λόχος [Λόχος]"
        />

        <div className="flex gap-2 pt-4">
          <button
            onClick={() => setIsEditing(false)}
            className="flex-1 py-3.5 rounded-2xl bg-muted text-foreground font-black text-[10px] uppercase tracking-widest"
          >
            Ακύρωση
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3.5 rounded-2xl bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/10"
          >
            Αποθήκευση
          </button>
        </div>
      </div>
    </FullscreenModal>
  )
}

function SuperiorsSection() {
  const [superiors, setSuperiors] = useLocalStorage<SuperiorEntry[]>('fantaros-superiors', [])
  const [showAddForm, setShowAddForm] = useState(false)

  const handleAdd = (superior: SuperiorEntry) => {
    hapticFeedback('heavy')
    setSuperiors([...superiors, superior])
    setShowAddForm(false)
  }

  const handleDelete = (id: string) => {
    hapticFeedback('heavy')
    setSuperiors(superiors.filter((s) => s.id !== id))
  }

  if (showAddForm) {
    return (
      <FullscreenModal
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        title="Προσθήκη Ανώτερου"
      >
        <AddSuperiorForm
          onAdd={handleAdd}
          onCancel={() => setShowAddForm(false)}
        />
      </FullscreenModal>
    )
  }

  return (
    <div className="space-y-4 pb-8">
      <button
        onClick={() => {
          hapticFeedback('light')
          setShowAddForm(true)
        }}
        className="w-full py-3.5 rounded-2xl border-2 border-dashed border-border/40 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary hover:border-primary/40 transition-all"
      >
        + Προσθήκη Ανώτερου
      </button>

      {superiors.length === 0 ? (
        <div className="py-12 text-center border-t border-border/40">
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Δεν έχουν προστεθεί ανώτεροι</p>
        </div>
      ) : (
        <div className="divide-y divide-border/30 border-t border-border/40">
          {superiors.map((superior) => (
            <div key={superior.id} className="py-5 flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-xl bg-muted/30 border border-border/40 flex items-center justify-center flex-shrink-0">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-black text-foreground leading-none">{superior.name}</h3>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[9px] font-black text-primary uppercase tracking-widest">{superior.rank}</span>
                  {superior.role && (
                    <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">{superior.role}</span>
                  )}
                </div>
                {superior.phone && (
                  <a href={`tel:${superior.phone}`} className="block text-[10px] font-bold text-foreground/70 hover:text-primary transition-colors mt-1.5">
                    {superior.phone}
                  </a>
                )}
              </div>
              <button
                onClick={() => handleDelete(superior.id)}
                className="p-2.5 rounded-xl bg-destructive/5 text-destructive/40 hover:text-destructive hover:bg-destructive/10 transition-all"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function FriendsSection() {
  const [friends, setFriends] = useLocalStorage<FriendEntry[]>('fantaros-friends', [])
  const [showAddForm, setShowAddForm] = useState(false)

  const handleAdd = (friend: FriendEntry) => {
    hapticFeedback('heavy')
    setFriends([...friends, friend])
    setShowAddForm(false)
  }

  const handleDelete = (id: string) => {
    hapticFeedback('heavy')
    setFriends(friends.filter((f) => f.id !== id))
  }

  if (showAddForm) {
    return (
      <FullscreenModal
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        title="Προσθήκη Φίλου"
      >
        <AddFriendForm
          onAdd={handleAdd}
          onCancel={() => setShowAddForm(false)}
        />
      </FullscreenModal>
    )
  }

  return (
    <div className="space-y-4 pb-8">
      <button
        onClick={() => {
          hapticFeedback('light')
          setShowAddForm(true)
        }}
        className="w-full py-3.5 rounded-2xl border-2 border-dashed border-border/40 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary hover:border-primary/40 transition-all"
      >
        + Προσθήκη Φίλου
      </button>

      {friends.length === 0 ? (
        <div className="py-12 text-center border-t border-border/40">
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Δεν έχουν προστεθεί φίλοι</p>
        </div>
      ) : (
        <div className="divide-y divide-border/30 border-t border-border/40">
          {friends.map((friend) => (
            <div key={friend.id} className="py-5 flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-xl bg-muted/30 border border-border/40 flex items-center justify-center flex-shrink-0">
                <UserPlus className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-black text-foreground leading-none">{friend.name}</h3>
                {friend.unit && (
                  <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mt-1.5">{friend.unit}</p>
                )}
                {friend.phone && (
                  <a href={`tel:${friend.phone}`} className="block text-[10px] font-bold text-foreground/70 hover:text-primary transition-colors mt-1.5">
                    {friend.phone}
                  </a>
                )}
              </div>
              <button
                onClick={() => handleDelete(friend.id)}
                className="p-2.5 rounded-xl bg-destructive/5 text-destructive/40 hover:text-destructive hover:bg-destructive/10 transition-all"
              >
                <Trash2 className="h-4 w-4" />
              </button>
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
    <div className="flex flex-col gap-4">
      <FormField label="Ονοματεπώνυμο" value={name} onChange={setName} />
      <FormField label="Τηλέφωνο" value={phone} onChange={setPhone} placeholder="69XXXXXXXX" />
      <FormField label="Μονάδα / Λόχος" value={unit} onChange={setUnit} />
      <FormField label="Σημειώσεις" value={notes} onChange={setNotes} placeholder="Προαιρετικό..." />

      <div className="flex gap-2 pt-4">
        <button onClick={onCancel} className="flex-1 py-3.5 rounded-2xl bg-muted text-foreground font-black text-[10px] uppercase tracking-widest">
          Ακύρωση
        </button>
        <button onClick={handleSubmit} disabled={!name.trim()} className="flex-1 py-3.5 rounded-2xl bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-widest disabled:opacity-40">
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
    <div className="flex flex-col gap-4">
      <FormField label="Ονοματεπώνυμο" value={name} onChange={setName} />
      
      <div>
        <label className="block text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-1.5">Βαθμός</label>
        <button
          type="button"
          onClick={() => {
            hapticFeedback('light')
            setShowRanks(!showRanks)
          }}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-muted/30 text-foreground text-sm border border-border/40 font-bold"
        >
          <span>{rank}</span>
          {showRanks ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {showRanks && (
          <div className="mt-2 max-h-40 overflow-y-auto rounded-xl bg-card border border-border no-scrollbar shadow-xl">
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
                  'w-full text-left px-4 py-2.5 text-sm font-bold',
                  rank === r ? 'text-primary bg-primary/5' : 'text-foreground/70 hover:bg-muted/30'
                )}
              >
                {r}
              </button>
            ))}
          </div>
        )}
      </div>

      <FormField label="Καθήκοντα / Ρόλος" value={role} onChange={setRole} />
      <FormField label="Τηλέφωνο" value={phone} onChange={setPhone} />

      <div className="flex gap-2 pt-4">
        <button onClick={onCancel} className="flex-1 py-3.5 rounded-2xl bg-muted text-foreground font-black text-[10px] uppercase tracking-widest">
          Ακύρωση
        </button>
        <button onClick={handleSubmit} disabled={!name.trim()} className="flex-1 py-3.5 rounded-2xl bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-widest disabled:opacity-40">
          Προσθήκη
        </button>
      </div>
    </div>
  )
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">{label}</span>
      <p className="text-sm font-black text-foreground leading-tight">{value || '—'}</p>
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
      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl bg-muted/30 text-foreground text-sm border border-border/40 focus:border-primary/50 focus:outline-none transition-all font-bold placeholder:text-muted-foreground/30"
      />
    </div>
  )
}
