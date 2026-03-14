'use client'

import { useState } from 'react'
import { 
  User, ChevronDown, ChevronUp, Edit3, Shield, MapPin, Hash, Droplet, 
  MessageSquare, Save, X, Palette, RotateCcw, Users, Pencil, ShieldAlert, 
  ShieldCheck, SlidersHorizontal, Plus
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { FullscreenModal } from '@/components/fullscreen-modal'
import { hapticFeedback } from '@/lib/helpers'
import type { ProfileData, SuperiorEntry, FriendEntry } from '@/lib/types'
import { RANKS, BLOOD_TYPES } from '@/lib/types'

const DEFAULT_PROFILE: ProfileData = {
  fullName: '',
  company: '',
  barracks: '',
  bloodType: '',
  reportingPhrase: '',
  rank: 'ΣΤΡΑΤΙΩΤΗΣ',
  serviceNumber: '',
  weaponCode: '',
  weaponCell: '',
}

export function ProfileTab() {
  const [activeSection, setActiveSection] = useState<'profile' | 'superiors' | 'friends' | 'settings'>('profile')

  return (
    <div className="flex-1 flex flex-col relative z-10 w-full h-full animate-fade-in overflow-hidden bg-black">
      {/* HEADER */}
      <header className="px-6 pt-14 pb-2 relative flex justify-between items-start shrink-0">
        <div>
          <h1 className="text-[32px] font-bold tracking-tight text-white leading-none mb-1">Άτομα</h1>
          <p className="text-[13px] font-bold tracking-[0.1em] text-zinc-500 uppercase">Στοιχεια & Επαφες</p>
        </div>
        <button className="w-10 h-10 mt-1 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700/50 flex items-center justify-center text-zinc-400 hover:text-[#34d399] hover:border-[#34d399]/30 transition-all active:scale-95 shadow-md">
          <SlidersHorizontal size={20} />
        </button>
      </header>

      {/* SECTION TOGGLE */}
      <div className="px-5 pt-4 pb-2">
        <div className="flex gap-1.5 p-1.5 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm overflow-x-auto hide-scrollbar">
          {[
            { id: 'profile', label: 'ΣΤΟΙΧΕΙΑ' },
            { id: 'superiors', label: 'ΑΝΩΤΕΡΟΙ' },
            { id: 'friends', label: 'ΦΙΛΟΙ' },
            { id: 'settings', label: 'ΡΥΘΜΙΣΕΙΣ' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                hapticFeedback('light')
                setActiveSection(tab.id as any)
              }}
              className={cn(
                'flex-1 py-2.5 px-4 rounded-xl text-[11px] font-bold tracking-wider transition-all duration-300 whitespace-nowrap',
                activeSection === tab.id
                  ? 'bg-gradient-to-r from-[#34d399] to-[#10b981] text-black shadow-md shadow-emerald-500/10'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto px-5 pb-32 pt-4 hide-scrollbar">
        {activeSection === 'profile' && <ProfileSection />}
        {activeSection === 'superiors' && <SuperiorsSection />}
        {activeSection === 'friends' && <FriendsSection />}
        {activeSection === 'settings' && <SettingsSection />}
      </main>
    </div>
  )
}

function ProfileSection() {
  const [profile, setProfile] = useLocalStorage<ProfileData>('fantaros-profile', DEFAULT_PROFILE)
  const [isEditing, setIsEditing] = useState(false)

  const handleSave = (form: ProfileData) => {
    hapticFeedback('heavy')
    setProfile(form)
    setIsEditing(false)
  }

  const startEdit = () => {
    hapticFeedback('light')
    setIsEditing(true)
  }

  return (
    <div className="animate-fade-in space-y-3">
      {/* Identity Card */}
      <div className="bg-gradient-to-br from-zinc-800 to-zinc-900/90 border border-zinc-700/40 rounded-[1.5rem] p-5 relative shadow-xl shadow-black/20 overflow-hidden">
        <ShieldAlert size={140} className="absolute -bottom-6 -right-6 text-zinc-700/10 pointer-events-none fill-current" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-16 h-16 rounded-[1.25rem] bg-zinc-800 border border-zinc-700/50 text-[#34d399] flex items-center justify-center shrink-0">
            <Users size={32} />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start mb-1.5">
              <h2 className="text-[20px] font-bold text-white leading-tight">
                {profile.fullName || 'Ονοματεπώνυμο'}
              </h2>
              <button 
                onClick={startEdit}
                className="w-8 h-8 rounded-full bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center text-zinc-400 hover:text-[#34d399] transition-colors active:scale-95 shrink-0 ml-2"
              >
                <Pencil size={14} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="bg-gradient-to-r from-[#34d399] to-[#10b981] text-black text-[10px] font-extrabold tracking-widest px-2.5 py-1 rounded-md shadow-sm uppercase">
                {profile.rank}
              </span>
              {profile.serviceNumber && (
                <span className="bg-zinc-800 border border-zinc-700 text-zinc-400 text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-md">
                  #{profile.serviceNumber}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-zinc-800 to-zinc-900/90 border border-zinc-700/40 rounded-[1.25rem] p-4 flex flex-col shadow-lg shadow-black/10">
          <div className="flex items-center gap-2 mb-2">
            <MapPin size={18} className="text-[#34d399]" />
            <span className="text-[10px] font-bold tracking-[0.15em] text-zinc-500 uppercase">Λοχος</span>
          </div>
          <span className="text-[22px] font-extrabold text-white">
            {profile.company || '-'}
          </span>
        </div>
        <div className="bg-gradient-to-br from-zinc-800 to-zinc-900/90 border border-zinc-700/40 rounded-[1.25rem] p-4 flex flex-col shadow-lg shadow-black/10">
          <div className="flex items-center gap-2 mb-2">
            <Hash size={18} className="text-[#34d399]" />
            <span className="text-[10px] font-bold tracking-[0.15em] text-zinc-500 uppercase">Θαλαμος</span>
          </div>
          <span className="text-[22px] font-extrabold text-white">
            {profile.barracks || '-'}
          </span>
        </div>
        <div className="bg-gradient-to-br from-zinc-800 to-zinc-900/90 border border-zinc-700/40 rounded-[1.25rem] p-4 flex flex-col shadow-lg shadow-black/10">
          <div className="flex items-center gap-2 mb-2">
            <Droplet size={18} className="text-[#34d399]" />
            <span className="text-[10px] font-bold tracking-[0.15em] text-zinc-500 uppercase">Ομαδα Αιματος</span>
          </div>
          <span className="text-[22px] font-extrabold text-white">
            {profile.bloodType || '-'}
          </span>
        </div>
        <div className="bg-gradient-to-br from-zinc-800 to-zinc-900/90 border border-zinc-700/40 rounded-[1.25rem] p-4 flex flex-col shadow-lg shadow-black/10">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck size={18} className="text-[#34d399]" />
            <span className="text-[10px] font-bold tracking-[0.15em] text-zinc-500 uppercase">Σειρα / ΕΣΣΟ</span>
          </div>
          <span className="text-[20px] font-extrabold text-white truncate">
            {profile.weaponCode || '-'}
          </span>
        </div>
      </div>

      {/* Reporting Phrase */}
      <div className="bg-gradient-to-br from-zinc-800 to-zinc-900/90 border border-zinc-700/40 rounded-[1.5rem] p-5 shadow-lg shadow-black/10">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare size={18} className="text-[#34d399]" />
          <span className="text-[10px] font-bold tracking-[0.15em] text-zinc-500 uppercase">Φραση Αναφορας</span>
        </div>
        <p className={cn(
          "text-[16px] font-medium italic leading-relaxed",
          profile.reportingPhrase ? "text-zinc-300" : "text-zinc-500"
        )}>
          {profile.reportingPhrase ? `"${profile.reportingPhrase}"` : "Προσθέστε τη φράση αναφοράς σας..."}
        </p>
      </div>

      {/* Edit Modal */}
      <FullscreenModal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        title="Επεξεργασία Προφίλ"
      >
        <EditProfileForm
          profile={profile}
          onSave={handleSave}
          onCancel={() => setIsEditing(false)}
        />
      </FullscreenModal>
    </div>
  )
}

function SuperiorsSection() {
  const [superiors, setSuperiors] = useLocalStorage<SuperiorEntry[]>('fantaros-superiors', [])
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const handleAdd = (entry: SuperiorEntry) => {
    hapticFeedback('medium')
    setSuperiors([...superiors, { ...entry, id: Date.now().toString() }])
    setIsAdding(false)
  }

  const handleDelete = (id: string) => {
    hapticFeedback('light')
    setSuperiors(superiors.filter(s => s.id !== id))
  }

  return (
    <div className="animate-fade-in space-y-3">
      <div className="flex items-center justify-between mb-1 px-1">
        <h2 className="text-[11px] font-bold tracking-[0.2em] text-zinc-500 uppercase">Ιεραρχια</h2>
        <button 
          onClick={() => setIsAdding(true)}
          className="px-3 py-1.5 rounded-lg bg-[#10b981]/10 border border-[#10b981]/20 text-[#34d399] text-[10px] font-extrabold tracking-widest uppercase hover:bg-[#10b981]/20 transition-colors active:scale-95"
        >
          Προσθηκη
        </button>
      </div>

      {superiors.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center opacity-40">
          <Shield size={48} className="text-zinc-500 mb-4" />
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Δεν υπαρχουν καταχωρησεις</p>
        </div>
      ) : (
        superiors.map((sup) => (
          <div key={sup.id} className="bg-gradient-to-br from-zinc-800 to-zinc-900/90 border border-zinc-700/40 rounded-[1.25rem] p-4 flex items-center justify-between shadow-lg shadow-black/10 transition active:scale-[0.98]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700 text-[#34d399] flex items-center justify-center shrink-0">
                <ShieldAlert size={24} />
              </div>
              <div className="flex flex-col">
                <h3 className="text-[15px] font-bold text-white mb-0.5">{sup.name}</h3>
                <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
                  {sup.rank}{sup.role ? ` • ${sup.role}` : ''}
                </span>
              </div>
            </div>
            <button 
              onClick={() => handleDelete(sup.id)}
              className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-red-400 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ))
      )}

      <FullscreenModal
        isOpen={isAdding}
        onClose={() => setIsAdding(false)}
        title="Προσθήκη Ανωτέρου"
      >
        <AddSuperiorForm
          onAdd={handleAdd}
          onCancel={() => setIsAdding(false)}
        />
      </FullscreenModal>
    </div>
  )
}

function FriendsSection() {
  const [friends, setFriends] = useLocalStorage<FriendEntry[]>('fantaros-friends', [])
  const [isAdding, setIsAdding] = useState(false)

  const handleAdd = (entry: FriendEntry) => {
    hapticFeedback('medium')
    setFriends([...friends, { ...entry, id: Date.now().toString() }])
    setIsAdding(false)
  }

  const handleDelete = (id: string) => {
    hapticFeedback('light')
    setFriends(friends.filter(f => f.id !== id))
  }

  return (
    <div className="animate-fade-in space-y-3">
      <div className="flex items-center justify-between mb-1 px-1">
        <h2 className="text-[11px] font-bold tracking-[0.2em] text-zinc-500 uppercase">Συναδελφοι</h2>
        <button 
          onClick={() => setIsAdding(true)}
          className="px-3 py-1.5 rounded-lg bg-[#10b981]/10 border border-[#10b981]/20 text-[#34d399] text-[10px] font-extrabold tracking-widest uppercase hover:bg-[#10b981]/20 transition-colors active:scale-95"
        >
          Προσθηκη
        </button>
      </div>

      {friends.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center opacity-40">
          <Users size={48} className="text-zinc-500 mb-4" />
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Δεν υπαρχουν συναδελφοι</p>
        </div>
      ) : (
        friends.map((friend) => (
          <div key={friend.id} className="bg-gradient-to-br from-zinc-800 to-zinc-900/90 border border-zinc-700/40 rounded-[1.25rem] p-4 flex items-center justify-between shadow-lg shadow-black/10 transition active:scale-[0.98]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700 text-[#34d399] flex items-center justify-center shrink-0">
                <Users size={24} />
              </div>
              <div className="flex flex-col">
                <h3 className="text-[15px] font-bold text-white mb-0.5">{friend.name}</h3>
                <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
                  {friend.unit || 'Χωρις Μοναδα'}{friend.phone ? ` • ${friend.phone}` : ''}
                </span>
              </div>
            </div>
            <button 
              onClick={() => handleDelete(friend.id)}
              className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-red-400 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ))
      )}

      <FullscreenModal
        isOpen={isAdding}
        onClose={() => setIsAdding(false)}
        title="Προσθήκη Συναδέλφου"
      >
        <AddFriendForm
          onAdd={handleAdd}
          onCancel={() => setIsAdding(false)}
        />
      </FullscreenModal>
    </div>
  )
}

function SettingsSection() {
  const [primaryColor, setPrimaryColor] = useLocalStorage('fantaros-primary-color', '#10b981')

  const resetColor = () => {
    hapticFeedback('medium')
    setPrimaryColor('#10b981')
    document.documentElement.style.setProperty('--primary', '#10b981')
  }

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center justify-between mb-1 px-1">
        <h2 className="text-[11px] font-bold tracking-[0.2em] text-zinc-500 uppercase">Εμφανιση</h2>
      </div>
      <div className="bg-gradient-to-br from-zinc-800 to-zinc-900/90 border border-zinc-700/40 rounded-[1.5rem] p-5 shadow-lg shadow-black/10">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-[14px] bg-[#10b981]/10 border border-[#10b981]/20 text-[#34d399] flex items-center justify-center shrink-0 shadow-inner">
            <Palette size={24} className="fill-[#34d399]" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-[16px] font-bold text-white leading-tight">Χρώμα Εφαρμογής</h3>
            <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase mt-0.5">Επιλεξτε το Κυριο Χρωμα (RGB)</span>
          </div>
        </div>
        <div className="flex items-center gap-4 mb-6">
          <div 
            className="w-16 h-16 rounded-2xl shrink-0 shadow-[0_0_15px_rgba(52,211,153,0.3)] border border-emerald-500/50"
            style={{ backgroundColor: primaryColor }}
          ></div>
          <div className="flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-1.5 px-1">
              <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">Επιλεγμενο:</span>
              <span className="text-[10px] font-bold tracking-widest text-[#34d399] uppercase">{primaryColor.toUpperCase()}</span>
            </div>
            <input 
              type="color" 
              value={primaryColor}
              onChange={(e) => {
                setPrimaryColor(e.target.value)
                document.documentElement.style.setProperty('--primary', e.target.value)
              }}
              className="w-full h-10 rounded-xl bg-zinc-900 border border-zinc-700/50 cursor-pointer"
            />
          </div>
        </div>
        <button 
          onClick={resetColor}
          className="w-full py-3.5 rounded-xl bg-zinc-800/80 border border-zinc-700 flex items-center justify-center gap-2 text-[12px] font-bold tracking-widest text-zinc-300 hover:text-white hover:bg-zinc-700/50 transition-colors active:scale-[0.98]"
        >
          <RotateCcw size={16} />
          ΕΠΑΝΑΦΟΡΑ ΠΡΟΕΠΙΛΟΓΗΣ
        </button>
      </div>
    </div>
  )
}

function EditProfileForm({ profile, onSave, onCancel }: { profile: ProfileData; onSave: (form: ProfileData) => void; onCancel: () => void }) {
  const [form, setForm] = useState<ProfileData>(profile)
  const [showRanks, setShowRanks] = useState(false)
  const [showBloodTypes, setShowBloodTypes] = useState(false)

  const handleSubmit = () => {
    onSave(form)
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      <FormField
        label="Ονοματεπώνυμο"
        value={form.fullName}
        onChange={(v) => setForm({ ...form, fullName: v })}
        placeholder="π.χ. Ιωάννης Παπαδόπουλος"
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="Αριθμός Μητρώου (ΑΣΜ)"
          value={form.serviceNumber}
          onChange={(v) => setForm({ ...form, serviceNumber: v })}
          placeholder="123/4567/24"
        />
        
        <div className="relative">
          <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-500 mb-1.5 ml-1">Βαθμός</label>
          <button
            type="button"
            onClick={() => {
              hapticFeedback('light')
              setShowRanks(!showRanks)
              setShowBloodTypes(false)
            }}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-zinc-800 text-white text-xs border border-zinc-700/50 font-bold min-h-[46px] hover:bg-zinc-700 transition-colors"
          >
            <span className="truncate">{form.rank}</span>
            {showRanks ? <ChevronUp className="h-4 w-4 text-[#34d399]" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {showRanks && (
            <div className="absolute z-50 bottom-full mb-2 w-full max-h-48 overflow-y-auto rounded-xl bg-zinc-900 border border-zinc-700/50 no-scrollbar animate-in fade-in slide-in-from-bottom-2">
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
                    'w-full text-left px-4 py-3 text-[11px] font-bold border-b border-zinc-700/30 last:border-0 transition-colors',
                    form.rank === r ? 'text-[#34d399] bg-[#34d399]/5' : 'text-zinc-400 hover:bg-zinc-800'
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="Λόχος"
          value={form.company}
          onChange={(v) => setForm({ ...form, company: v })}
          placeholder="π.χ. 3ος Λόχος"
        />
        <FormField
          label="Θάλαμος"
          value={form.barracks}
          onChange={(v) => setForm({ ...form, barracks: v })}
          placeholder="π.χ. 7"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="relative">
          <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-500 mb-1.5 ml-1">Ομάδα Αίματος</label>
          <button
            type="button"
            onClick={() => {
              hapticFeedback('light')
              setShowBloodTypes(!showBloodTypes)
              setShowRanks(false)
            }}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-zinc-800 text-white text-xs border border-zinc-700/50 font-bold min-h-[46px] hover:bg-zinc-700 transition-colors"
          >
            <span className="truncate">{form.bloodType || 'Επιλογή'}</span>
            {showBloodTypes ? <ChevronUp className="h-4 w-4 text-[#34d399]" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {showBloodTypes && (
            <div className="absolute z-50 bottom-full mb-2 w-full max-h-48 overflow-y-auto rounded-xl bg-zinc-900 border border-zinc-700/50 no-scrollbar animate-in fade-in slide-in-from-bottom-2">
              {BLOOD_TYPES.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => {
                    hapticFeedback('light')
                    setForm({ ...form, bloodType: b })
                    setShowBloodTypes(false)
                  }}
                  className={cn(
                    'w-full text-left px-4 py-3 text-[11px] font-bold border-b border-zinc-700/30 last:border-0 transition-colors',
                    form.bloodType === b ? 'text-[#34d399] bg-[#34d399]/5' : 'text-zinc-400 hover:bg-zinc-800'
                  )}
                >
                  {b}
                </button>
              ))}
            </div>
          )}
        </div>
        <FormField
          label="Σειρά / ΕΣΣΟ"
          value={form.weaponCode}
          onChange={(v) => setForm({ ...form, weaponCode: v })}
          placeholder="π.χ. 2024 Α ΕΣΣΟ"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-500 mb-1 ml-1">Φράση Αναφοράς</label>
        <textarea
          value={form.reportingPhrase}
          onChange={(e) => setForm({ ...form, reportingPhrase: e.target.value })}
          className="w-full bg-zinc-800 text-white text-xs border border-zinc-700/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#34d399]/20 focus:border-[#34d399]/50 transition-all min-h-[80px] font-medium placeholder:text-zinc-600"
          placeholder="Η φράση που λες στην αναφορά..."
        />
      </div>

      <div className="flex gap-3 pt-4 mt-auto">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-4 rounded-xl bg-zinc-900 text-zinc-400 text-[11px] font-black uppercase tracking-widest border border-zinc-800 hover:bg-zinc-800 transition-colors"
        >
          Ακυρωση
        </button>
        <button
          onClick={handleSubmit}
          className="flex-[2] px-4 py-4 rounded-xl bg-gradient-to-r from-[#34d399] to-[#10b981] text-black text-[11px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition-transform"
        >
          Αποθηκευση
        </button>
      </div>
    </div>
  )
}

function AddSuperiorForm({ onAdd, onCancel }: { onAdd: (entry: SuperiorEntry) => void; onCancel: () => void }) {
  const [form, setForm] = useState<SuperiorEntry>({ id: '', name: '', rank: '', role: '' })

  const handleSubmit = () => {
    if (!form.name.trim()) return
    hapticFeedback('heavy')
    onAdd(form)
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      <FormField
        label="Ονοματεπώνυμο"
        value={form.name}
        onChange={(v) => setForm({ ...form, name: v })}
        placeholder="π.χ. Λοχαγός Παπαδόπουλος"
      />
      <FormField
        label="Βαθμός"
        value={form.rank}
        onChange={(v) => setForm({ ...form, rank: v })}
        placeholder="π.χ. Λοχαγός"
      />
      <FormField
        label="Ρόλος / Θέση"
        value={form.role}
        onChange={(v) => setForm({ ...form, role: v })}
        placeholder="π.χ. Διοικητής Λόχου"
      />
      <div className="flex gap-3 pt-4 mt-auto">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-4 rounded-xl bg-zinc-900 text-zinc-400 text-[11px] font-black uppercase tracking-widest border border-zinc-800 hover:bg-zinc-800 transition-colors"
        >
          Ακυρωση
        </button>
        <button
          onClick={handleSubmit}
          className="flex-[2] px-4 py-4 rounded-xl bg-gradient-to-r from-[#34d399] to-[#10b981] text-black text-[11px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition-transform"
        >
          Προσθηκη
        </button>
      </div>
    </div>
  )
}

function AddFriendForm({ onAdd, onCancel }: { onAdd: (entry: FriendEntry) => void; onCancel: () => void }) {
  const [form, setForm] = useState<FriendEntry>({ id: '', name: '', unit: '', phone: '' })

  const handleSubmit = () => {
    if (!form.name.trim()) return
    hapticFeedback('heavy')
    onAdd(form)
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      <FormField
        label="Ονοματεπώνυμο"
        value={form.name}
        onChange={(v) => setForm({ ...form, name: v })}
        placeholder="π.χ. Γιώργος Παπαδόπουλος"
      />
      <FormField
        label="Μονάδα / Λόχος"
        value={form.unit}
        onChange={(v) => setForm({ ...form, unit: v })}
        placeholder="π.χ. 123 ΤΠ"
      />
      <FormField
        label="Τηλέφωνο (Προαιρετικό)"
        value={form.phone}
        onChange={(v) => setForm({ ...form, phone: v })}
        placeholder="69XXXXXXXX"
      />
      <div className="flex gap-3 pt-4 mt-auto">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-4 rounded-xl bg-zinc-900 text-zinc-400 text-[11px] font-black uppercase tracking-widest border border-zinc-800 hover:bg-zinc-800 transition-colors"
        >
          Ακυρωση
        </button>
        <button
          onClick={handleSubmit}
          className="flex-[2] px-4 py-4 rounded-xl bg-gradient-to-r from-[#34d399] to-[#10b981] text-black text-[11px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition-transform"
        >
          Προσθηκη
        </button>
      </div>
    </div>
  )
}

function FormField({ label, value, onChange, placeholder, type = 'text' }: { label: string, value: string, onChange: (v: string) => void, placeholder?: string, type?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-500 mb-1 ml-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-zinc-800 text-white text-xs border border-zinc-700/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#34d399]/20 focus:border-[#34d399]/50 transition-all font-bold placeholder:text-zinc-600"
        placeholder={placeholder}
      />
    </div>
  )
}
