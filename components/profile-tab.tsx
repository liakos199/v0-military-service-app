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
    <div className="flex flex-col h-full bg-black">
      {/* HEADER - Always Visible */}
      <div className="flex-shrink-0 px-4 pt-6 pb-4 border-b border-white/10 safe-top">
        <div className="mb-5">
          <h1 className="text-2xl font-black text-white tracking-tight">Άτομα</h1>
          <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold mt-1">Στοιχεία, ιεραρχία & φίλοι</p>
        </div>

        {/* Section Toggle - 3 tabs with consistent coloring */}
        <div className="flex gap-1 p-1 rounded-xl bg-gray-900 border border-white/10">
          <button
            onClick={() => {
              hapticFeedback('light')
              setActiveSection('profile')
            }}
            className={cn(
              'flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-200',
              activeSection === 'profile'
                ? 'bg-green-500 text-black shadow-lg shadow-green-500/30'
                : 'text-gray-400 hover:text-white'
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
                ? 'bg-green-500 text-black shadow-lg shadow-green-500/30'
                : 'text-gray-400 hover:text-white'
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
                ? 'bg-green-500 text-black shadow-lg shadow-green-500/30'
                : 'text-gray-400 hover:text-white'
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
      <div className="space-y-4 pb-8">
        {/* Main Profile Card - Slate Background */}
        <div className="bg-slate-800 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-700 border border-white/10 flex items-center justify-center flex-shrink-0">
              <User className="h-8 w-8 text-green-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-black text-white tracking-tight truncate leading-tight">
                {profile.fullName || 'Ονοματεπώνυμο'}
              </h2>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="px-2.5 py-1 rounded-lg bg-green-500 text-black text-[10px] font-black uppercase tracking-widest">
                  {profile.rank}
                </span>
                {profile.serviceNumber && (
                  <span className="text-[10px] text-gray-400 font-bold">
                    #{profile.serviceNumber}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={startEdit}
              className="p-2.5 rounded-xl bg-slate-700 border border-white/10 hover:bg-slate-600 transition-colors"
            >
              <Edit3 className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>

        {/* Info Grid - Alternating Colors */}
        <div className="space-y-3">
          {profile.company && (
            <div className="bg-blue-900 border border-white/10 rounded-2xl p-4">
              <span className="text-[10px] font-black text-blue-200 uppercase tracking-widest leading-none">Λόχος</span>
              <p className="text-base font-black text-white leading-tight mt-1.5">{profile.company}</p>
            </div>
          )}
          
          {profile.barracks && (
            <div className="bg-emerald-900 border border-white/10 rounded-2xl p-4">
              <span className="text-[10px] font-black text-emerald-200 uppercase tracking-widest leading-none">Θάλαμος</span>
              <p className="text-base font-black text-white leading-tight mt-1.5">{profile.barracks}</p>
            </div>
          )}
          
          {profile.bloodType && (
            <div className="bg-rose-900 border border-white/10 rounded-2xl p-4">
              <span className="text-[10px] font-black text-rose-200 uppercase tracking-widest leading-none">Ομάδα Αίματος</span>
              <p className="text-base font-black text-white leading-tight mt-1.5">{profile.bloodType}</p>
            </div>
          )}
          
          {profile.weaponCode && (
            <div className="bg-amber-900 border border-white/10 rounded-2xl p-4">
              <span className="text-[10px] font-black text-amber-200 uppercase tracking-widest leading-none">Κωδικός Όπλου</span>
              <p className="text-base font-black text-white leading-tight mt-1.5">{profile.weaponCode}</p>
            </div>
          )}
          
          {profile.weaponCell && (
            <div className="bg-purple-900 border border-white/10 rounded-2xl p-4">
              <span className="text-[10px] font-black text-purple-200 uppercase tracking-widest leading-none">Κελί Όπλου</span>
              <p className="text-base font-black text-white leading-tight mt-1.5">{profile.weaponCell}</p>
            </div>
          )}
        </div>

        {/* Reporting Phrase */}
        {profile.reportingPhrase && (
          <div className="bg-indigo-900 border border-white/10 rounded-2xl p-5">
            <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-2">Φράση Αναφοράς</p>
            <p className="text-sm text-white font-bold leading-relaxed italic">
              "{profile.reportingPhrase}"
            </p>
          </div>
        )}

        {/* Empty State */}
        {!profile.fullName && (
          <div className="py-12 text-center border-2 border-dashed border-white/20 rounded-2xl">
            <p className="text-xs text-gray-400 font-bold mb-4">Δεν έχουν προστεθεί στοιχεία</p>
            <button
              onClick={startEdit}
              className="px-5 py-2.5 rounded-xl bg-green-500 text-black text-[10px] font-black uppercase tracking-widest hover:bg-green-400 transition-colors"
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
          <label className="block text-[10px] font-black uppercase tracking-wider text-gray-300 mb-1.5">Βαθμός</label>
          <button
            type="button"
            onClick={() => {
              hapticFeedback('light')
              setShowRanks(!showRanks)
            }}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-gray-800 text-white text-sm border border-white/10 font-bold"
          >
            <span>{form.rank}</span>
            {showRanks ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {showRanks && (
            <div className="mt-2 max-h-40 overflow-y-auto rounded-xl bg-gray-900 border border-white/10 no-scrollbar shadow-2xl">
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
                    'w-full text-left px-4 py-2.5 text-sm font-bold border-b border-white/5 last:border-0',
                    form.rank === r ? 'text-green-400 bg-gray-800' : 'text-gray-300 hover:bg-gray-800'
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
          <label className="block text-[10px] font-black uppercase tracking-wider text-gray-300 mb-1.5">Ομάδα Αίματος</label>
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
                    ? 'bg-green-500 text-black border-green-400'
                    : 'bg-gray-800 text-gray-300 border-white/10'
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
            className="flex-1 py-3.5 rounded-2xl bg-gray-800 text-white font-black text-[10px] uppercase tracking-widest border border-white/10"
          >
            Ακύρωση
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3.5 rounded-2xl bg-green-500 text-black font-black text-[10px] uppercase tracking-widest shadow-lg shadow-green-500/30"
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
        className="w-full py-3.5 rounded-2xl border-2 border-dashed border-white/20 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-green-400 hover:border-green-500/40 transition-all"
      >
        + Προσθήκη Ανώτερου
      </button>

      {superiors.length === 0 ? (
        <div className="py-12 text-center border-2 border-dashed border-white/20 rounded-2xl">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Δεν έχουν προστεθεί ανώτεροι</p>
        </div>
      ) : (
        <div className="space-y-3">
          {superiors.map((superior, idx) => (
            <div
              key={superior.id}
              className={cn(
                'border border-white/10 rounded-2xl p-4',
                idx % 3 === 0 ? 'bg-blue-900' : idx % 3 === 1 ? 'bg-emerald-900' : 'bg-amber-900'
              )}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-black/30 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="h-5 w-5 text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-black text-white leading-none">{superior.name}</h3>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[9px] font-black text-green-300 uppercase tracking-widest">{superior.rank}</span>
                    {superior.role && (
                      <span className="text-[9px] text-gray-300 font-bold uppercase tracking-widest">{superior.role}</span>
                    )}
                  </div>
                  {superior.phone && (
                    <a href={`tel:${superior.phone}`} className="block text-[10px] font-bold text-gray-300 hover:text-green-400 transition-colors mt-1.5">
                      {superior.phone}
                    </a>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(superior.id)}
                  className="p-2.5 rounded-xl bg-black/30 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
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
        className="w-full py-3.5 rounded-2xl border-2 border-dashed border-white/20 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-green-400 hover:border-green-500/40 transition-all"
      >
        + Προσθήκη Φίλου
      </button>

      {friends.length === 0 ? (
        <div className="py-12 text-center border-2 border-dashed border-white/20 rounded-2xl">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Δεν έχουν προστεθεί φίλοι</p>
        </div>
      ) : (
        <div className="space-y-3">
          {friends.map((friend, idx) => (
            <div
              key={friend.id}
              className={cn(
                'border border-white/10 rounded-2xl p-4',
                idx % 3 === 0 ? 'bg-rose-900' : idx % 3 === 1 ? 'bg-purple-900' : 'bg-indigo-900'
              )}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-black/30 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <UserPlus className="h-5 w-5 text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-black text-white leading-none">{friend.name}</h3>
                  {friend.unit && (
                    <p className="text-[9px] text-gray-300 font-black uppercase tracking-widest mt-1.5">{friend.unit}</p>
                  )}
                  {friend.phone && (
                    <a href={`tel:${friend.phone}`} className="block text-[10px] font-bold text-gray-300 hover:text-green-400 transition-colors mt-1.5">
                      {friend.phone}
                    </a>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(friend.id)}
                  className="p-2.5 rounded-xl bg-black/30 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
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
    <div className="flex flex-col gap-4">
      <FormField label="Ονοματεπώνυμο" value={name} onChange={setName} />
      <FormField label="Τηλέφωνο" value={phone} onChange={setPhone} placeholder="69XXXXXXXX" />
      <FormField label="Μονάδα / Λόχος" value={unit} onChange={setUnit} />
      <FormField label="Σημειώσεις" value={notes} onChange={setNotes} placeholder="Προαιρετικό..." />

      <div className="flex gap-2 pt-4">
        <button onClick={onCancel} className="flex-1 py-3.5 rounded-2xl bg-gray-800 text-white font-black text-[10px] uppercase tracking-widest border border-white/10">
          Ακύρωση
        </button>
        <button onClick={handleSubmit} disabled={!name.trim()} className="flex-1 py-3.5 rounded-2xl bg-green-500 text-black font-black text-[10px] uppercase tracking-widest disabled:opacity-40">
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
        <label className="block text-[10px] font-black uppercase tracking-wider text-gray-300 mb-1.5">Βαθμός</label>
        <button
          type="button"
          onClick={() => {
            hapticFeedback('light')
            setShowRanks(!showRanks)
          }}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-gray-800 text-white text-sm border border-white/10 font-bold"
        >
          <span>{rank}</span>
          {showRanks ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {showRanks && (
          <div className="mt-2 max-h-40 overflow-y-auto rounded-xl bg-gray-900 border border-white/10 no-scrollbar shadow-2xl">
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
                  'w-full text-left px-4 py-2.5 text-sm font-bold border-b border-white/5 last:border-0',
                  rank === r ? 'text-green-400 bg-gray-800' : 'text-gray-300 hover:bg-gray-800'
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
        <button onClick={onCancel} className="flex-1 py-3.5 rounded-2xl bg-gray-800 text-white font-black text-[10px] uppercase tracking-widest border border-white/10">
          Ακύρωση
        </button>
        <button onClick={handleSubmit} disabled={!name.trim()} className="flex-1 py-3.5 rounded-2xl bg-green-500 text-black font-black text-[10px] uppercase tracking-widest disabled:opacity-40">
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
      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-300 mb-1.5">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white text-sm border border-white/10 focus:border-green-500/50 focus:outline-none transition-all font-bold placeholder:text-gray-500"
      />
    </div>
  )
}
