'use client'

import { useState } from 'react'
import { User, Trash2, ChevronDown, ChevronUp, Edit3, Plus, UserPlus, Shield, Phone } from 'lucide-react'
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
      {/* HEADER - Compact */}
      <div className="flex-shrink-0 bg-background px-4 pt-3 pb-2 border-b border-border/50 safe-top">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-foreground leading-tight">Άτομα</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Στοιχεία & ιεραρχία</p>
          </div>
        </div>

        {/* Section Toggle - Compact */}
        <div className="flex gap-1 p-0.5 rounded-lg bg-secondary/50 border border-border mt-2">
          <button
            onClick={() => {
              hapticFeedback('light')
              setActiveSection('profile')
            }}
            className={cn(
              'flex-1 py-1.5 rounded-md text-[9px] font-black uppercase tracking-wider transition-all duration-200 min-h-[32px]',
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
              'flex-1 py-1.5 rounded-md text-[9px] font-black uppercase tracking-wider transition-all duration-200 min-h-[32px]',
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
              'flex-1 py-1.5 rounded-md text-[9px] font-black uppercase tracking-wider transition-all duration-200 min-h-[32px]',
              activeSection === 'friends'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Φίλοι
          </button>
        </div>
      </div>

      {/* CONTENT - Compact padding */}
      <div className="flex-1 overflow-y-auto px-3 py-3 no-scrollbar">
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
      <div className="space-y-2.5 pb-6">
        {/* Main Profile Card - Compact */}
        <div className="glass-card rounded-xl p-3 border border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-secondary/50 border border-border flex items-center justify-center flex-shrink-0">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-black text-foreground tracking-tight truncate leading-tight">
                {profile.fullName || 'Ονοματεπώνυμο'}
              </h2>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="px-2 py-0.5 rounded-md bg-primary text-primary-foreground text-[8px] font-black uppercase tracking-widest">
                  {profile.rank}
                </span>
                {profile.serviceNumber && (
                  <span className="text-[8px] text-muted-foreground font-bold">
                    #{profile.serviceNumber}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={startEdit}
              className="p-2 rounded-lg bg-secondary/50 border border-border hover:bg-secondary transition-colors"
            >
              <Edit3 className="h-3.5 w-3.5 text-foreground" />
            </button>
          </div>
        </div>

        {/* Info Grid - Compact */}
        <div className="grid grid-cols-2 gap-2">
          {profile.company && (
            <div className="glass-card rounded-xl p-2.5 border border-white/5">
              <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest leading-none">Λόχος</span>
              <p className="text-sm font-black text-foreground leading-tight mt-1">{profile.company}</p>
            </div>
          )}
          {profile.barracks && (
            <div className="glass-card rounded-xl p-2.5 border border-white/5">
              <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest leading-none">Θάλαμος</span>
              <p className="text-sm font-black text-foreground leading-tight mt-1">{profile.barracks}</p>
            </div>
          )}
          {profile.bloodType && (
            <div className="glass-card rounded-xl p-2.5 border border-white/5">
              <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest leading-none">Αίμα</span>
              <p className="text-sm font-black text-foreground leading-tight mt-1">{profile.bloodType}</p>
            </div>
          )}
          {profile.weaponCode && (
            <div className="glass-card rounded-xl p-2.5 border border-white/5">
              <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest leading-none">Όπλο</span>
              <p className="text-sm font-black text-foreground leading-tight mt-1">{profile.weaponCode}</p>
            </div>
          )}
        </div>

        {/* Reporting Phrase - Compact */}
        {profile.reportingPhrase && (
          <div className="glass-card rounded-xl p-3 border border-white/5">
            <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">Αναφορά</p>
            <p className="text-xs text-foreground font-bold leading-snug">
              "{profile.reportingPhrase}"
            </p>
          </div>
        )}

        {/* Empty State - Compact */}
        {!profile.fullName && (
          <div className="py-8 text-center border-2 border-dashed border-border rounded-xl">
            <p className="text-[10px] text-muted-foreground font-bold mb-3">Κενό προφίλ</p>
            <button
              onClick={startEdit}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-[9px] font-black uppercase tracking-widest hover:opacity-90 transition-opacity"
            >
              Προσθήκη
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
      title="Επεξεργασία"
    >
      <div className="flex flex-col gap-3">
        <FormField
          label="Ονοματεπώνυμο"
          value={form.fullName}
          onChange={(v) => setForm({ ...form, fullName: v })}
        />

        <div className="grid grid-cols-2 gap-3">
          <FormField
            label="Αριθμός Μητρώου"
            value={form.serviceNumber}
            onChange={(v) => setForm({ ...form, serviceNumber: v })}
          />
          <div>
            <label className="block text-[9px] font-black uppercase tracking-wider text-muted-foreground mb-1">Βαθμός</label>
            <button
              type="button"
              onClick={() => {
                hapticFeedback('light')
                setShowRanks(!showRanks)
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-secondary text-foreground text-xs border border-border font-bold min-h-[38px]"
            >
              <span className="truncate">{form.rank}</span>
              {showRanks ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
            {showRanks && (
              <div className="mt-1 max-h-32 overflow-y-auto rounded-lg bg-secondary border border-border no-scrollbar shadow-xl">
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
                      'w-full text-left px-3 py-2 text-[11px] font-bold border-b border-border/50 last:border-0',
                      form.rank === r ? 'text-primary bg-secondary/80' : 'text-foreground/70 hover:bg-secondary/80'
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

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

        <div className="grid grid-cols-2 gap-3">
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

        {/* Blood Type Selector - Compact */}
        <div>
          <label className="block text-[9px] font-black uppercase tracking-wider text-muted-foreground mb-1">Αίμα</label>
          <div className="grid grid-cols-4 gap-1">
            {BLOOD_TYPES.map((bt) => (
              <button
                key={bt}
                type="button"
                onClick={() => {
                  hapticFeedback('light')
                  setForm({ ...form, bloodType: bt })
                }}
                className={cn(
                  'py-1.5 rounded-md text-[9px] font-black transition-all border min-h-[32px]',
                  form.bloodType === bt
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-secondary text-foreground border-border'
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
          placeholder="Στρατιώτης..."
        />

        <div className="flex gap-2 pt-2">
          <button
            onClick={() => setIsEditing(false)}
            className="flex-1 py-2.5 rounded-lg bg-secondary text-foreground font-black text-[9px] uppercase tracking-widest border border-border min-h-[38px]"
          >
            Ακύρωση
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground font-black text-[9px] uppercase tracking-widest shadow-md min-h-[38px]"
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
        title="Προσθήκη"
      >
        <AddSuperiorForm
          onAdd={handleAdd}
          onCancel={() => setShowAddForm(false)}
        />
      </FullscreenModal>
    )
  }

  return (
    <div className="space-y-2.5 pb-6">
      <button
        onClick={() => {
          hapticFeedback('light')
          setShowAddForm(true)
        }}
        className="w-full py-2.5 rounded-xl border-2 border-dashed border-border text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary hover:border-primary/40 transition-all min-h-[38px]"
      >
        + Προσθήκη Ανώτερου
      </button>

      {superiors.length === 0 ? (
        <div className="py-8 text-center border-2 border-dashed border-border rounded-xl">
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Κενό</p>
        </div>
      ) : (
        <div className="space-y-2">
          {superiors.map((superior) => (
            <div
              key={superior.id}
              className="glass-card rounded-xl p-3 border border-white/5"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary/50 border border-border flex items-center justify-center flex-shrink-0">
                  <Shield className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-black text-foreground leading-none truncate">{superior.name}</h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[8px] font-black text-primary uppercase tracking-widest">{superior.rank}</span>
                    {superior.role && (
                      <span className="text-[8px] text-muted-foreground font-bold uppercase tracking-widest truncate">{superior.role}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {superior.phone && (
                    <a href={`tel:${superior.phone}`} className="p-2 rounded-lg bg-secondary/50 border border-border text-muted-foreground hover:text-primary transition-colors">
                      <Phone className="h-3.5 w-3.5" />
                    </a>
                  )}
                  <button
                    onClick={() => handleDelete(superior.id)}
                    className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
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
        title="Προσθήκη"
      >
        <AddFriendForm
          onAdd={handleAdd}
          onCancel={() => setShowAddForm(false)}
        />
      </FullscreenModal>
    )
  }

  return (
    <div className="space-y-2.5 pb-6">
      <button
        onClick={() => {
          hapticFeedback('light')
          setShowAddForm(true)
        }}
        className="w-full py-2.5 rounded-xl border-2 border-dashed border-border text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary hover:border-primary/40 transition-all min-h-[38px]"
      >
        + Προσθήκη Φίλου
      </button>

      {friends.length === 0 ? (
        <div className="py-8 text-center border-2 border-dashed border-border rounded-xl">
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Κενό</p>
        </div>
      ) : (
        <div className="space-y-2">
          {friends.map((friend) => (
            <div
              key={friend.id}
              className="glass-card rounded-xl p-3 border border-white/5"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary/50 border border-border flex items-center justify-center flex-shrink-0">
                  <UserPlus className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-black text-foreground leading-none truncate">{friend.name}</h3>
                  {friend.unit && (
                    <p className="text-[8px] text-muted-foreground font-black uppercase tracking-widest mt-1 truncate">{friend.unit}</p>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  {friend.phone && (
                    <a href={`tel:${friend.phone}`} className="p-2 rounded-lg bg-secondary/50 border border-border text-muted-foreground hover:text-primary transition-colors">
                      <Phone className="h-3.5 w-3.5" />
                    </a>
                  )}
                  <button
                    onClick={() => handleDelete(friend.id)}
                    className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
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
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Τηλέφωνο" value={phone} onChange={setPhone} placeholder="69..." />
        <FormField label="Μονάδα" value={unit} onChange={setUnit} />
      </div>
      <FormField label="Σημειώσεις" value={notes} onChange={setNotes} placeholder="Προαιρετικό..." />

      <div className="flex gap-2 pt-2">
        <button onClick={onCancel} className="flex-1 py-2.5 rounded-lg bg-secondary text-foreground font-black text-[9px] uppercase tracking-widest border border-border min-h-[38px]">
          Ακύρωση
        </button>
        <button onClick={handleSubmit} disabled={!name.trim()} className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground font-black text-[9px] uppercase tracking-widest disabled:opacity-40 min-h-[38px]">
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
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[9px] font-black uppercase tracking-wider text-muted-foreground mb-1">Βαθμός</label>
          <button
            type="button"
            onClick={() => {
              hapticFeedback('light')
              setShowRanks(!showRanks)
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-secondary text-foreground text-xs border border-border font-bold min-h-[38px]"
          >
            <span className="truncate">{rank}</span>
            {showRanks ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
          {showRanks && (
            <div className="mt-1 max-h-32 overflow-y-auto rounded-lg bg-secondary border border-border no-scrollbar shadow-xl">
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
                    'w-full text-left px-3 py-2 text-[11px] font-bold border-b border-border/50 last:border-0',
                    rank === r ? 'text-primary bg-secondary/80' : 'text-foreground/70 hover:bg-secondary/80'
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          )}
        </div>
        <FormField label="Τηλέφωνο" value={phone} onChange={setPhone} placeholder="69..." />
      </div>
      <FormField label="Ρόλος" value={role} onChange={setRole} placeholder="Διοικητής..." />

      <div className="flex gap-2 pt-2">
        <button onClick={onCancel} className="flex-1 py-2.5 rounded-lg bg-secondary text-foreground font-black text-[9px] uppercase tracking-widest border border-border min-h-[38px]">
          Ακύρωση
        </button>
        <button onClick={handleSubmit} disabled={!name.trim()} className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground font-black text-[9px] uppercase tracking-widest disabled:opacity-40 min-h-[38px]">
          Προσθήκη
        </button>
      </div>
    </div>
  )
}

interface FormFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

function FormField({ label, value, onChange, placeholder }: FormFieldProps) {
  return (
    <div>
      <label className="block text-[9px] font-black uppercase tracking-wider text-muted-foreground mb-1">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg bg-secondary text-foreground text-xs border border-border placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50 min-h-[38px]"
      />
    </div>
  )
}
