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
    <div className="flex flex-col gap-5 pb-4">
      <div>
        <h1 className="text-2xl font-bold text-gradient">Προφίλ</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Στοιχεία, ιεραρχία & φίλοι</p>
      </div>

      {/* Section Toggle - 3 tabs */}
      <div className="flex gap-1 p-1 rounded-2xl bg-secondary/80 border border-border/30">
        {([
          { id: 'profile' as const, label: 'Στοιχεία', icon: User },
          { id: 'superiors' as const, label: 'Ιεραρχία', icon: Users },
          { id: 'friends' as const, label: 'Φίλοι', icon: UserPlus },
        ]).map((tab) => {
          const TabIcon = tab.icon
          const isActive = activeSection === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => { hapticFeedback('light'); setActiveSection(tab.id) }}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold min-h-[44px] transition-all active:scale-[0.98]',
                isActive
                  ? 'btn-gradient shadow-[0_2px_10px_oklch(0.80_0.14_75/0.3)]'
                  : 'text-muted-foreground'
              )}
            >
              <TabIcon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {activeSection === 'profile' && <ProfileSection />}
      {activeSection === 'superiors' && <SuperiorsSection />}
      {activeSection === 'friends' && <FriendsSection />}
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
      <div className="glass-card rounded-3xl p-5 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'var(--gradient-primary)' }}>
            <User className="h-8 w-8 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-black text-foreground truncate">
              {profile.fullName || 'Ονοματεπώνυμο'}
            </h2>
            <p className="text-xs text-primary font-semibold">{profile.rank}</p>
            {profile.serviceNumber && (
              <p className="text-[10px] text-muted-foreground font-mono mt-0.5">ΑΜ: {profile.serviceNumber}</p>
            )}
          </div>
          <button
            onClick={startEdit}
            className="p-2.5 rounded-xl bg-secondary/80 min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95 transition-transform"
            aria-label="Επεξεργασία"
          >
            <Edit3 className="h-5 w-5 text-primary" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <InfoField label="Λόχος" value={profile.company} />
          <InfoField label="Θάλαμος" value={profile.barracks} />
          <InfoField label="Ομάδα Αίματος" value={profile.bloodType} />
          <InfoField label="Βαθμός" value={profile.rank} />
        </div>

        {profile.reportingPhrase && (
          <div className="p-3.5 rounded-xl bg-secondary/60 border border-border/30">
            <p className="text-[9px] text-muted-foreground uppercase tracking-[0.15em] font-bold mb-1">Φράση Αναφοράς</p>
            <p className="text-sm text-foreground italic leading-relaxed">{`"${profile.reportingPhrase}"`}</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <FullscreenModal isOpen={isEditing} onClose={() => setIsEditing(false)} title="Επεξεργασία Προφίλ">
      <div className="flex flex-col gap-4">
        <FormField label="Ονοματεπώνυμο" value={form.fullName} onChange={(v) => setForm({ ...form, fullName: v })} />
        <FormField label="Αριθμός Μητρώου" value={form.serviceNumber} onChange={(v) => setForm({ ...form, serviceNumber: v })} />

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Λόχος" value={form.company} onChange={(v) => setForm({ ...form, company: v })} />
          <FormField label="Θάλαμος" value={form.barracks} onChange={(v) => setForm({ ...form, barracks: v })} />
        </div>

        {/* Rank Selector */}
        <div>
          <label className="block text-xs text-muted-foreground mb-1.5 font-semibold">Βαθμός</label>
          <button
            type="button"
            onClick={() => { hapticFeedback('light'); setShowRanks(!showRanks) }}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-secondary text-secondary-foreground text-sm min-h-[48px] border border-border/50"
          >
            <span>{form.rank}</span>
            {showRanks ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {showRanks && (
            <div className="mt-1.5 max-h-48 overflow-y-auto rounded-xl bg-secondary border border-border/50 no-scrollbar">
              {RANKS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => { hapticFeedback('light'); setForm({ ...form, rank: r }); setShowRanks(false) }}
                  className={cn(
                    'w-full text-left px-4 py-2.5 text-sm min-h-[44px]',
                    form.rank === r ? 'text-primary font-bold bg-primary/10' : 'text-foreground'
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
          <label className="block text-xs text-muted-foreground mb-1.5 font-semibold">Ομάδα Αίματος</label>
          <button
            type="button"
            onClick={() => { hapticFeedback('light'); setShowBlood(!showBlood) }}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-secondary text-secondary-foreground text-sm min-h-[48px] border border-border/50"
          >
            <span className={cn(!form.bloodType && 'text-muted-foreground')}>{form.bloodType || 'Επίλεξε'}</span>
            {showBlood ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {showBlood && (
            <div className="mt-1.5 grid grid-cols-4 gap-1.5 p-2 rounded-xl bg-secondary border border-border/50">
              {BLOOD_TYPES.map((bt) => (
                <button
                  key={bt}
                  type="button"
                  onClick={() => { hapticFeedback('light'); setForm({ ...form, bloodType: bt }); setShowBlood(false) }}
                  className={cn(
                    'py-2.5 rounded-xl text-sm font-bold min-h-[44px] transition-all active:scale-95',
                    form.bloodType === bt
                      ? 'btn-gradient shadow-[0_2px_8px_oklch(0.80_0.14_75/0.3)]'
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
          <label className="block text-xs text-muted-foreground mb-1.5 font-semibold">Φράση Αναφοράς</label>
          <textarea
            value={form.reportingPhrase}
            onChange={(e) => setForm({ ...form, reportingPhrase: e.target.value })}
            placeholder="Π.χ. Στρατιώτης Παπαδόπουλος αναφέρομαι..."
            className="w-full px-4 py-3 rounded-xl bg-secondary text-secondary-foreground text-sm min-h-[80px] border border-border/50 resize-none placeholder:text-muted-foreground focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
          />
        </div>

        <div className="flex gap-2.5 pt-2">
          <button
            onClick={() => setIsEditing(false)}
            className="flex-1 py-3 rounded-xl bg-secondary text-secondary-foreground font-semibold text-sm min-h-[48px] flex items-center justify-center gap-1 active:scale-[0.98] transition-transform"
          >
            <X className="h-4 w-4" />
            Ακύρωση
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 rounded-xl btn-gradient font-bold text-sm min-h-[48px] flex items-center justify-center gap-1 shadow-[0_4px_16px_oklch(0.80_0.14_75/0.3)] active:scale-[0.98] transition-transform"
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
        <h2 className="text-sm font-bold text-foreground">Ανώτεροι</h2>
        <button
          onClick={() => { hapticFeedback('light'); setShowAdd(true) }}
          className="p-2.5 rounded-2xl glass-card min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95 transition-transform"
          aria-label="Προσθήκη ανωτέρου"
        >
          <Plus className="h-5 w-5 text-primary" />
        </button>
      </div>

      <FullscreenModal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Νέος Ανώτερος">
        <AddSuperiorForm
          onAdd={(sup) => { setSuperiors([...superiors, sup]); setShowAdd(false) }}
          onCancel={() => setShowAdd(false)}
        />
      </FullscreenModal>

      {superiors.length === 0 ? (
        <div className="glass-card rounded-2xl p-6 text-center">
          <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
          <p className="text-sm text-muted-foreground">Δεν έχεις καταχωρήσει ανωτέρους</p>
        </div>
      ) : (
        superiors.map((sup) => (
          <div key={sup.id} className="glass-card rounded-2xl p-3.5 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-secondary/80 flex items-center justify-center flex-shrink-0">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground truncate">{sup.name}</p>
              <p className="text-xs text-primary font-semibold">{sup.rank}</p>
              {sup.role && <p className="text-[10px] text-muted-foreground">{sup.role}</p>}
            </div>
            <button
              onClick={() => { hapticFeedback('medium'); setSuperiors(superiors.filter((s) => s.id !== sup.id)) }}
              className="p-2.5 rounded-xl bg-destructive/10 min-h-[44px] min-w-[44px] flex items-center justify-center text-destructive flex-shrink-0 active:scale-95 transition-transform"
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
        <h2 className="text-sm font-bold text-foreground">Φίλοι</h2>
        <button
          onClick={() => { hapticFeedback('light'); setShowAdd(true) }}
          className="p-2.5 rounded-2xl glass-card min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95 transition-transform"
          aria-label="Προσθήκη φίλου"
        >
          <Plus className="h-5 w-5 text-primary" />
        </button>
      </div>

      <FullscreenModal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Νέος Φίλος">
        <AddFriendForm
          onAdd={(friend) => { setFriends([...friends, friend]); setShowAdd(false) }}
          onCancel={() => setShowAdd(false)}
        />
      </FullscreenModal>

      {friends.length === 0 ? (
        <div className="glass-card rounded-2xl p-6 text-center">
          <UserPlus className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
          <p className="text-sm text-muted-foreground">Δεν έχεις προσθέσει φίλους</p>
          <p className="text-xs text-muted-foreground mt-1 opacity-60">Πάτησε + για να προσθέσεις</p>
        </div>
      ) : (
        friends.map((friend) => (
          <div key={friend.id} className="glass-card rounded-2xl p-3.5 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'var(--gradient-primary)', opacity: 0.7 }}>
              <User className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground truncate">{friend.name}</p>
              {friend.unit && <p className="text-xs text-primary font-semibold">{friend.unit}</p>}
              {friend.phone && <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{friend.phone}</p>}
              {friend.notes && <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{friend.notes}</p>}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {friend.phone && (
                <a
                  href={`tel:${friend.phone}`}
                  onClick={() => hapticFeedback('medium')}
                  className="p-2.5 rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95 transition-transform"
                  style={{ background: 'var(--gradient-accent-teal)' }}
                  aria-label={`Κλήση ${friend.name}`}
                >
                  <Phone className="h-4.5 w-4.5 text-foreground" />
                </a>
              )}
              <button
                onClick={() => { hapticFeedback('medium'); setFriends(friends.filter((f) => f.id !== friend.id)) }}
                className="p-2.5 rounded-xl bg-destructive/10 min-h-[44px] min-w-[44px] flex items-center justify-center text-destructive active:scale-95 transition-transform"
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

function AddFriendForm({ onAdd, onCancel }: { onAdd: (friend: FriendEntry) => void; onCancel: () => void }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [unit, setUnit] = useState('')
  const [notes, setNotes] = useState('')

  const handleSubmit = () => {
    if (!name.trim()) return
    hapticFeedback('heavy')
    onAdd({ id: generateId(), name: name.trim(), phone: phone.trim(), unit: unit.trim(), notes: notes.trim() })
  }

  return (
    <div className="flex flex-col gap-4">
      <FormField label="Ονοματεπώνυμο" value={name} onChange={setName} />
      <div>
        <label className="block text-xs text-muted-foreground mb-1.5 font-semibold">Τηλέφωνο</label>
        <input type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Π.χ. 69XXXXXXXX"
          className="w-full px-4 py-3 rounded-xl bg-secondary text-secondary-foreground text-sm min-h-[48px] border border-border/50 placeholder:text-muted-foreground focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all" />
      </div>
      <FormField label="Μονάδα / Λόχος" value={unit} onChange={setUnit} placeholder="Π.χ. Α' Λόχος, 71 Ταξιαρχία" />
      <div>
        <label className="block text-xs text-muted-foreground mb-1.5 font-semibold">Σημειώσεις</label>
        <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Προαιρετικό..."
          className="w-full px-4 py-3 rounded-xl bg-secondary text-secondary-foreground text-sm min-h-[48px] border border-border/50 placeholder:text-muted-foreground focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all" />
      </div>
      <div className="flex gap-2.5 pt-2">
        <button onClick={onCancel} className="flex-1 py-3 rounded-xl bg-secondary text-secondary-foreground font-semibold text-sm min-h-[48px] active:scale-[0.98] transition-transform">Ακύρωση</button>
        <button onClick={handleSubmit} disabled={!name.trim()} className="flex-1 py-3 rounded-xl btn-gradient font-bold text-sm min-h-[48px] disabled:opacity-40 shadow-[0_4px_16px_oklch(0.80_0.14_75/0.3)] active:scale-[0.98] transition-transform">Προσθήκη</button>
      </div>
    </div>
  )
}

function AddSuperiorForm({ onAdd, onCancel }: { onAdd: (sup: SuperiorEntry) => void; onCancel: () => void }) {
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
        <label className="block text-xs text-muted-foreground mb-1.5 font-semibold">Βαθμός</label>
        <button type="button" onClick={() => { hapticFeedback('light'); setShowRanks(!showRanks) }}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-secondary text-secondary-foreground text-sm min-h-[48px] border border-border/50">
          <span>{rank}</span>
          {showRanks ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {showRanks && (
          <div className="mt-1.5 max-h-48 overflow-y-auto rounded-xl bg-secondary border border-border/50 no-scrollbar">
            {RANKS.map((r) => (
              <button key={r} type="button" onClick={() => { hapticFeedback('light'); setRank(r); setShowRanks(false) }}
                className={cn('w-full text-left px-4 py-2.5 text-sm min-h-[44px]', rank === r ? 'text-primary font-bold bg-primary/10' : 'text-foreground')}>
                {r}
              </button>
            ))}
          </div>
        )}
      </div>
      <FormField label="Θέση / Ρόλος" value={role} onChange={setRole} placeholder="Π.χ. Διοικητής Λόχου" />
      <div className="flex gap-2.5 pt-2">
        <button onClick={onCancel} className="flex-1 py-3 rounded-xl bg-secondary text-secondary-foreground font-semibold text-sm min-h-[48px] active:scale-[0.98] transition-transform">Ακύρωση</button>
        <button onClick={handleSubmit} disabled={!name.trim()} className="flex-1 py-3 rounded-xl btn-gradient font-bold text-sm min-h-[48px] disabled:opacity-40 shadow-[0_4px_16px_oklch(0.80_0.14_75/0.3)] active:scale-[0.98] transition-transform">Προσθήκη</button>
      </div>
    </div>
  )
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-xl bg-secondary/60 border border-border/20">
      <p className="text-[9px] text-muted-foreground uppercase tracking-[0.15em] font-bold">{label}</p>
      <p className="text-sm font-semibold text-foreground mt-0.5">{value || '---'}</p>
    </div>
  )
}

function FormField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="block text-xs text-muted-foreground mb-1.5 font-semibold">{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder || label}
        className="w-full px-4 py-3 rounded-xl bg-secondary text-secondary-foreground text-sm min-h-[48px] border border-border/50 placeholder:text-muted-foreground focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all" />
    </div>
  )
}
