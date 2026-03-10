'use client'

import { useState } from 'react'
import { Plus, Trash2, User, Users, ChevronDown, ChevronUp, Edit3, Check, X, Phone, UserPlus, Shield, MapPin, Droplet, Zap, Lock } from 'lucide-react'
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
          <h1 className="text-xl font-bold text-foreground">Άτομα</h1>
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
            Ανώτεροι
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
      <div className="space-y-3 pb-4">
        {/* Header Card with Profile Info */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-secondary/80 via-secondary/60 to-secondary/40 backdrop-blur-sm p-4">
          {/* Decorative accent line */}
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-primary/20" />
          
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/40 to-primary/10 border border-primary/30 flex items-center justify-center shadow-[0_0_20px_rgba(74,222,128,0.15)]">
                <User className="h-8 w-8 text-primary" />
              </div>
              {profile.rank && (
                <div className="absolute -bottom-1 -right-1 px-2 py-1 rounded-lg bg-primary text-primary-foreground text-[7px] font-black uppercase tracking-tight whitespace-nowrap shadow-lg">
                  {profile.rank.slice(0, 3)}
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 min-w-0 pt-1">
              <h2 className="text-base font-black text-foreground truncate tracking-tight">
                {profile.fullName || 'Ονοματεπώνυμο'}
              </h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="px-2 py-1 rounded-lg bg-primary/20 text-primary text-[8px] font-bold uppercase tracking-widest border border-primary/30">
                  {profile.rank}
                </span>
                {profile.serviceNumber && (
                  <span className="text-[8px] text-muted-foreground font-bold uppercase tracking-widest">
                    ID: {profile.serviceNumber}
                  </span>
                )}
              </div>
              {profile.company && (
                <p className="text-[10px] text-muted-foreground mt-1.5 font-medium">
                  {profile.company} • {profile.barracks}
                </p>
              )}
            </div>

            {/* Edit Button */}
            <button
              onClick={startEdit}
              className="flex-shrink-0 p-2.5 rounded-xl bg-primary/10 border border-primary/30 hover:bg-primary/20 transition-all duration-200 active:scale-95"
              aria-label="Επεξεργασία"
            >
              <Edit3 className="h-4 w-4 text-primary" />
            </button>
          </div>
        </div>

        {/* Reporting Phrase Card */}
        {profile.reportingPhrase && (
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-secondary/80 via-secondary/60 to-secondary/40 backdrop-blur-sm p-4">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-primary/20" />
            <div className="flex items-start gap-3">
              <Zap className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.15em] mb-1">Φράση Αναφοράς</p>
                <p className="text-xs text-foreground/90 font-medium leading-relaxed italic">{`"${profile.reportingPhrase}"`}</p>
              </div>
            </div>
          </div>
        )}

        {/* Personal Details Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Blood Type */}
          {profile.bloodType && (
            <div className="rounded-xl border border-white/10 bg-gradient-to-br from-secondary/80 via-secondary/60 to-secondary/40 backdrop-blur-sm p-3">
              <div className="flex items-center gap-2 mb-2">
                <Droplet className="h-3.5 w-3.5 text-primary" />
                <span className="text-[8px] font-black text-muted-foreground uppercase tracking-wider">Αίμα</span>
              </div>
              <p className="text-sm font-bold text-foreground">{profile.bloodType}</p>
            </div>
          )}

          {/* Company */}
          {profile.company && (
            <div className="rounded-xl border border-white/10 bg-gradient-to-br from-secondary/80 via-secondary/60 to-secondary/40 backdrop-blur-sm p-3">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-3.5 w-3.5 text-primary" />
                <span className="text-[8px] font-black text-muted-foreground uppercase tracking-wider">Λόχος</span>
              </div>
              <p className="text-sm font-bold text-foreground truncate">{profile.company}</p>
            </div>
          )}

          {/* Barracks */}
          {profile.barracks && (
            <div className="rounded-xl border border-white/10 bg-gradient-to-br from-secondary/80 via-secondary/60 to-secondary/40 backdrop-blur-sm p-3">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                <span className="text-[8px] font-black text-muted-foreground uppercase tracking-wider">Θάλαμος</span>
              </div>
              <p className="text-sm font-bold text-foreground truncate">{profile.barracks}</p>
            </div>
          )}

          {/* Weapon Code */}
          {profile.weaponCode && (
            <div className="rounded-xl border border-white/10 bg-gradient-to-br from-secondary/80 via-secondary/60 to-secondary/40 backdrop-blur-sm p-3">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="h-3.5 w-3.5 text-primary" />
                <span className="text-[8px] font-black text-muted-foreground uppercase tracking-wider">Κωδ. Όπλου</span>
              </div>
              <p className="text-sm font-bold text-foreground">{profile.weaponCode}</p>
            </div>
          )}

          {/* Weapon Cell */}
          {profile.weaponCell && (
            <div className="rounded-xl border border-white/10 bg-gradient-to-br from-secondary/80 via-secondary/60 to-secondary/40 backdrop-blur-sm p-3">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="h-3.5 w-3.5 text-primary" />
                <span className="text-[8px] font-black text-muted-foreground uppercase tracking-wider">Κελί Όπλου</span>
              </div>
              <p className="text-sm font-bold text-foreground">{profile.weaponCell}</p>
            </div>
          )}
        </div>

        {/* Empty State */}
        {!profile.fullName && (
          <div className="rounded-2xl border border-dashed border-white/10 bg-secondary/20 p-6 text-center">
            <User className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground font-medium">Δεν έχουν προστεθεί στοιχεία</p>
            <button
              onClick={startEdit}
              className="mt-3 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider hover:bg-primary/90 transition-colors"
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
                    'py-2 rounded-md text-[10px] font-bold transition-all',
                    form.bloodType === bt
                      ? 'text-primary-foreground font-semibold bg-primary'
                      : 'text-foreground bg-secondary-foreground/10'
                  )}
                >
                  {bt}
                </button>
              ))}
            </div>
          )}
        </div>

        <FormField
          label="Φράση Αναφοράς"
          value={form.reportingPhrase}
          onChange={(v) => setForm({ ...form, reportingPhrase: v })}
          placeholder="Π.χ. Στρατιώτης [Όνομα], Λόχος [Λόχος]"
        />

        <div className="flex gap-2 pt-2">
          <button
            onClick={() => setIsEditing(false)}
            className="flex-1 py-2.5 rounded-lg bg-secondary text-secondary-foreground font-bold text-[10px] uppercase tracking-wider min-h-[44px] hover:bg-secondary/80 transition-colors"
          >
            Ακύρωση
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground font-bold text-[10px] uppercase tracking-wider min-h-[44px] hover:bg-primary/90 transition-colors active:scale-95"
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
    <div className="space-y-3 pb-4">
      <button
        onClick={() => {
          hapticFeedback('light')
          setShowAddForm(true)
        }}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-primary/50 bg-primary/5 hover:bg-primary/10 transition-colors active:scale-95"
      >
        <Plus className="h-4 w-4 text-primary" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Προσθήκη Ανώτερου</span>
      </button>

      {superiors.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-secondary/20 p-6 text-center">
          <Users className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground font-medium">Δεν έχουν προστεθεί ανώτεροι</p>
        </div>
      ) : (
        superiors.map((superior) => (
          <div
            key={superior.id}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-secondary/80 via-secondary/60 to-secondary/40 backdrop-blur-sm p-4"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-primary/20" />
            
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
                <Shield className="h-5 w-5 text-primary" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-foreground truncate">{superior.name}</h3>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="px-2 py-1 rounded-lg bg-primary/20 text-primary text-[8px] font-bold uppercase tracking-widest border border-primary/30">
                    {superior.rank}
                  </span>
                  {superior.role && (
                    <span className="text-[8px] text-muted-foreground font-medium">{superior.role}</span>
                  )}
                </div>
                {superior.phone && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <Phone className="h-3 w-3 text-muted-foreground" />
                    <a
                      href={`tel:${superior.phone}`}
                      className="text-[10px] font-medium text-primary hover:underline"
                    >
                      {superior.phone}
                    </a>
                  </div>
                )}
              </div>

              <button
                onClick={() => handleDelete(superior.id)}
                className="flex-shrink-0 p-2 rounded-lg bg-destructive/10 border border-destructive/30 hover:bg-destructive/20 transition-colors active:scale-95"
                aria-label="Διαγραφή"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </button>
            </div>
          </div>
        ))
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
    <div className="space-y-3 pb-4">
      <button
        onClick={() => {
          hapticFeedback('light')
          setShowAddForm(true)
        }}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-primary/50 bg-primary/5 hover:bg-primary/10 transition-colors active:scale-95"
      >
        <Plus className="h-4 w-4 text-primary" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Προσθήκη Φίλου</span>
      </button>

      {friends.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-secondary/20 p-6 text-center">
          <UserPlus className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground font-medium">Δεν έχουν προστεθεί φίλοι</p>
        </div>
      ) : (
        friends.map((friend) => (
          <div
            key={friend.id}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-secondary/80 via-secondary/60 to-secondary/40 backdrop-blur-sm p-4"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-primary/20" />
            
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
                <UserPlus className="h-5 w-5 text-primary" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-foreground truncate">{friend.name}</h3>
                {friend.unit && (
                  <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{friend.unit}</p>
                )}
                {friend.phone && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <Phone className="h-3 w-3 text-muted-foreground" />
                    <a
                      href={`tel:${friend.phone}`}
                      className="text-[10px] font-medium text-primary hover:underline"
                    >
                      {friend.phone}
                    </a>
                  </div>
                )}
                {friend.notes && (
                  <p className="text-[9px] text-muted-foreground/70 mt-2 italic">{friend.notes}</p>
                )}
              </div>

              <button
                onClick={() => handleDelete(friend.id)}
                className="flex-shrink-0 p-2 rounded-lg bg-destructive/10 border border-destructive/30 hover:bg-destructive/20 transition-colors active:scale-95"
                aria-label="Διαγραφή"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
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
          className="flex-1 py-2.5 rounded-lg bg-secondary text-secondary-foreground font-bold text-[10px] uppercase tracking-wider min-h-[44px] hover:bg-secondary/80 transition-colors"
        >
          Ακύρωση
        </button>
        <button
          onClick={handleSubmit}
          disabled={!name.trim()}
          className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground font-bold text-[10px] uppercase tracking-wider min-h-[44px] disabled:opacity-40 hover:bg-primary/90 transition-colors active:scale-95"
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
          className="flex-1 py-2.5 rounded-lg bg-secondary text-secondary-foreground font-bold text-[10px] uppercase tracking-wider min-h-[44px] hover:bg-secondary/80 transition-colors"
        >
          Ακύρωση
        </button>
        <button
          onClick={handleSubmit}
          disabled={!name.trim()}
          className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground font-bold text-[10px] uppercase tracking-wider min-h-[44px] disabled:opacity-40 hover:bg-primary/90 transition-colors active:scale-95"
        >
          Προσθήκη
        </button>
      </div>
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
        className="w-full px-3 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm min-h-[40px] border border-border placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none transition-colors"
      />
    </div>
  )
}
