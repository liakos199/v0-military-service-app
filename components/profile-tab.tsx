'use client'

import { useState } from 'react'
import { User, ChevronDown, ChevronUp, Edit3, Shield, MapPin, Hash, Droplet, MessageSquare, Save, X, Palette, RotateCcw } from 'lucide-react'
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
    <div className="flex flex-col h-full bg-background">
      {/* HEADER */}
      <div className="flex-shrink-0 px-4 pt-6 pb-4 border-b border-border/50 safe-top">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tight">Προφίλ</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">Διαχείριση Στοιχείων</p>
          </div>
        </div>

        {/* Section Toggle */}
        <div className="flex gap-1 p-1 rounded-xl bg-secondary/30 border border-white/5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => {
              hapticFeedback('light')
              setActiveSection('profile')
            }}
            className={cn(
              'flex-1 px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all duration-200 min-h-[36px] whitespace-nowrap',
              activeSection === 'profile'
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
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
              'flex-1 px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all duration-200 min-h-[36px] whitespace-nowrap',
              activeSection === 'superiors'
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
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
              'flex-1 px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all duration-200 min-h-[36px] whitespace-nowrap',
              activeSection === 'friends'
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Φίλοι
          </button>
          <button
            onClick={() => {
              hapticFeedback('light')
              setActiveSection('settings')
            }}
            className={cn(
              'flex-1 px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all duration-200 min-h-[36px] whitespace-nowrap',
              activeSection === 'settings'
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Ρυθμίσεις
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto px-4 py-6 no-scrollbar">
        {activeSection === 'profile' && <ProfileSection />}
        {activeSection === 'superiors' && <SuperiorsSection />}
        {activeSection === 'friends' && <FriendsSection />}
        {activeSection === 'settings' && <SettingsSection />}
      </div>
    </div>
  )
}

function ProfileSection() {
  const [profile, setProfile] = useLocalStorage<ProfileData>('fantaros-profile', DEFAULT_PROFILE)
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState<ProfileData>(profile)
  const [showRanks, setShowRanks] = useState(false)
  const [showBloodTypes, setShowBloodTypes] = useState(false)

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

  return (
    <div className="space-y-6 pb-10">
      {/* Identity Card */}
      <div className="zinc-card p-6 relative overflow-hidden group shadow-2xl shadow-black/40">
        <div className="absolute top-0 right-0 p-8 opacity-[0.05] pointer-events-none group-hover:scale-110 transition-transform duration-700">
          <Shield size={140} />
        </div>
        
        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 shadow-inner">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-black text-foreground tracking-tight truncate leading-tight">
                {profile.fullName || 'Ονοματεπώνυμο'}
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-2.5">
                <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-[8px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">
                  {profile.rank}
                </span>
                {profile.serviceNumber && (
                  <span className="px-2.5 py-1 rounded-full bg-zinc-800/80 text-zinc-400 text-[8px] font-bold border border-zinc-700/30 uppercase tracking-widest">
                    #{profile.serviceNumber}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={startEdit}
            className="p-2.5 rounded-xl bg-zinc-800/50 border border-zinc-700/50 hover:bg-zinc-800 hover:scale-105 active:scale-95 transition-all"
          >
            <Edit3 className="h-4 w-4 text-zinc-300" />
          </button>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-3">
        <InfoTile 
          icon={MapPin} 
          label="Λόχος" 
          value={profile.company} 
          placeholder="Δεν ορίστηκε"
        />
        <InfoTile 
          icon={Hash} 
          label="Θάλαμος" 
          value={profile.barracks} 
          placeholder="Δεν ορίστηκε"
        />
        <InfoTile 
          icon={Droplet} 
          label="Ομάδα Αίματος" 
          value={profile.bloodType} 
          placeholder="Άγνωστο"
        />
        <InfoTile 
          icon={Shield} 
          label="Σειρά / ΕΣΣΟ" 
          value={profile.weaponCode} 
          placeholder="Δεν ορίστηκε"
        />
      </div>

      {/* Reporting Phrase */}
      <div className="zinc-card p-5 border-zinc-800/50">
        <div className="flex items-center gap-2 mb-3.5">
          <MessageSquare size={14} className="text-primary" />
          <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em]">Φράση Αναφοράς</span>
        </div>
        <p className={cn(
          "text-sm font-bold leading-relaxed italic tracking-tight",
          profile.reportingPhrase ? "text-zinc-200" : "text-zinc-700"
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
        <div className="flex flex-col gap-5 py-2">
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
              <label className="block text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-1.5 ml-1">Βαθμός</label>
              <button
                type="button"
                onClick={() => {
                  hapticFeedback('light')
                  setShowRanks(!showRanks)
                  setShowBloodTypes(false)
                }}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-secondary text-foreground text-xs border border-white/5 font-bold min-h-[46px] hover:bg-secondary/80 transition-colors"
              >
                <span className="truncate">{form.rank}</span>
                {showRanks ? <ChevronUp className="h-4 w-4 text-primary" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {showRanks && (
                <div className="absolute z-50 bottom-full mb-2 w-full max-h-48 overflow-y-auto rounded-xl bg-zinc-900 border border-white/10 no-scrollbar shadow-2xl animate-in fade-in slide-in-from-bottom-2">
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
                        'w-full text-left px-4 py-3 text-[11px] font-bold border-b border-white/5 last:border-0 transition-colors',
                        form.rank === r ? 'text-primary bg-primary/5' : 'text-foreground/70 hover:bg-white/5'
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
              placeholder="π.χ. 1ος"
            />
            <FormField
              label="Θάλαμος"
              value={form.barracks}
              onChange={(v) => setForm({ ...form, barracks: v })}
              placeholder="π.χ. 102"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <label className="block text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-1.5 ml-1">Ομάδα Αίματος</label>
              <button
                type="button"
                onClick={() => {
                  hapticFeedback('light')
                  setShowBloodTypes(!showBloodTypes)
                  setShowRanks(false)
                }}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-secondary text-foreground text-xs border border-white/5 font-bold min-h-[46px] hover:bg-secondary/80 transition-colors"
              >
                <span className="truncate">{form.bloodType || "Επιλέξτε"}</span>
                {showBloodTypes ? <ChevronUp className="h-4 w-4 text-primary" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {showBloodTypes && (
                <div className="absolute z-50 bottom-full mb-2 w-full max-h-48 overflow-y-auto rounded-xl bg-zinc-900 border border-white/10 no-scrollbar shadow-2xl animate-in fade-in slide-in-from-bottom-2">
                  {BLOOD_TYPES.map((bt) => (
                    <button
                      key={bt}
                      type="button"
                      onClick={() => {
                        hapticFeedback('light')
                        setForm({ ...form, bloodType: bt })
                        setShowBloodTypes(false)
                      }}
                      className={cn(
                        'w-full text-left px-4 py-3 text-[11px] font-bold border-b border-white/5 last:border-0 transition-colors',
                        form.bloodType === bt ? 'text-primary bg-primary/5' : 'text-foreground/70 hover:bg-white/5'
                      )}
                    >
                      {bt}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <FormField
              label="Σειρά / ΕΣΣΟ"
              value={form.weaponCode}
              onChange={(v) => setForm({ ...form, weaponCode: v })}
              placeholder="π.χ. 2024 Α'"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-1.5 ml-1">Φράση Αναφοράς</label>
            <textarea
              value={form.reportingPhrase}
              onChange={(e) => setForm({ ...form, reportingPhrase: e.target.value })}
              placeholder="π.χ. Στρατιώτης Παπαδόπουλος Ιωάννης, 1ος Λόχος..."
              className="w-full px-4 py-3 rounded-xl bg-secondary text-foreground text-xs border border-white/5 placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[80px] resize-none font-bold"
            />
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={() => setIsEditing(false)}
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-secondary text-foreground font-black text-[10px] uppercase tracking-widest border border-white/5 hover:bg-secondary/80 transition-all"
            >
              <X size={14} />
              Ακύρωση
            </button>
            <button
              onClick={handleSave}
              className="flex-[2] flex items-center justify-center gap-2 py-4 rounded-2xl bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Save size={14} />
              Αποθήκευση
            </button>
          </div>
        </div>
      </FullscreenModal>
    </div>
  )
}

function InfoTile({ icon: Icon, label, value, placeholder }: { icon: any, label: string, value: string, placeholder: string }) {
  return (
    <div className="glass-card rounded-2xl p-4 border border-white/5 flex flex-col gap-2 hover:bg-white/5 transition-colors">
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-secondary/50">
          <Icon size={12} className="text-primary" />
        </div>
        <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest leading-none">{label}</span>
      </div>
      <p className={cn(
        "text-sm font-black leading-none truncate",
        value ? "text-foreground" : "text-muted-foreground/30"
      )}>
        {value || placeholder}
      </p>
    </div>
  )
}

function FormField({ label, value, onChange, placeholder }: { label: string, value: string, onChange: (v: string) => void, placeholder?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-1.5 ml-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl bg-secondary text-foreground text-xs border border-white/5 placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[46px] font-bold"
      />
    </div>
  )
}

function SettingsSection() {
  const [color, setColor] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('app-primary-color') || '#0ea5e9'
    }
    return '#0ea5e9'
  })

  const handleColorChange = (newColor: string) => {
    setColor(newColor)
    const event = new CustomEvent('app-color-change', { detail: newColor })
    window.dispatchEvent(event)
  }

  const resetColor = () => {
    const defaultColor = '#0ea5e9'
    handleColorChange(defaultColor)
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Εμφάνιση</h3>
      </div>

      <div className="glass-card rounded-3xl p-6 border border-white/5 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
            <Palette className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h4 className="text-sm font-black text-foreground leading-tight">Χρώμα Εφαρμογής</h4>
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
              Επιλέξτε το κύριο χρώμα (RGB)
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div 
              className="w-16 h-16 rounded-2xl shadow-inner border border-white/10 flex-shrink-0 transition-colors duration-200"
              style={{ backgroundColor: color }}
            />
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Επιλεγμένο:</span>
                <span className="text-[10px] font-mono font-bold text-primary uppercase">{color}</span>
              </div>
              <input
                type="color"
                value={color}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-full h-10 rounded-xl bg-secondary border border-white/5 cursor-pointer appearance-none [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-xl"
              />
            </div>
          </div>

          <button
            onClick={resetColor}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary border border-white/5 transition-all text-[10px] font-black uppercase tracking-widest"
          >
            <RotateCcw size={14} />
            Επαναφορά Προεπιλογής
          </button>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-5 border border-white/5">
        <p className="text-[9px] text-muted-foreground font-bold leading-relaxed text-center">
          Το επιλεγμένο χρώμα θα αποθηκευτεί στη συσκευή σας και θα εφαρμόζεται αυτόματα κάθε φορά που ανοίγετε την εφαρμογή.
        </p>
      </div>
    </div>
  )
}

/* ---------- SUPERIORS SECTION ---------- */
function SuperiorsSection() {
  const [superiors, setSuperiors] = useLocalStorage<SuperiorEntry[]>('fantaros-superiors', [])
  const [isAdding, setIsAdding] = useState(false)

  const handleAdd = (sup: SuperiorEntry) => {
    setSuperiors([...superiors, sup])
    setIsAdding(false)
  }

  const handleDelete = (id: string) => {
    hapticFeedback('medium')
    setSuperiors(superiors.filter((s) => s.id !== id))
  }

  return (
    <div className="space-y-4 pb-10">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Ιεραρχία</h3>
        <button
          onClick={() => setIsAdding(true)}
          className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest border border-primary/20 hover:bg-primary/20 transition-all"
        >
          Προσθήκη
        </button>
      </div>

      {superiors.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-3xl gap-4">
          <div className="w-16 h-16 rounded-full bg-secondary/30 flex items-center justify-center">
            <Shield className="h-8 w-8 text-muted-foreground/20" />
          </div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Δεν υπάρχουν ανώτεροι</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {superiors.map((sup) => (
            <div key={sup.id} className="glass-card rounded-2xl p-4 border border-white/5 flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center border border-white/5">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-foreground leading-tight">{sup.name}</h4>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                    {sup.rank} {sup.role && `• ${sup.role}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {sup.phone && (
                  <a href={`tel:${sup.phone}`} className="p-2 rounded-lg bg-secondary/50 text-foreground hover:bg-primary hover:text-primary-foreground transition-all">
                    <Edit3 size={14} />
                  </a>
                )}
                <button
                  onClick={() => handleDelete(sup.id)}
                  className="p-2 rounded-lg bg-secondary/50 text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-all"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <FullscreenModal isOpen={isAdding} onClose={() => setIsAdding(false)} title="Προσθήκη Ανωτέρου">
        <AddSuperiorForm onAdd={handleAdd} onCancel={() => setIsAdding(false)} />
      </FullscreenModal>
    </div>
  )
}

/* ---------- FRIENDS SECTION ---------- */
function FriendsSection() {
  const [friends, setFriends] = useLocalStorage<FriendEntry[]>('fantaros-friends', [])
  const [isAdding, setIsAdding] = useState(false)

  const handleAdd = (friend: FriendEntry) => {
    setFriends([...friends, friend])
    setIsAdding(false)
  }

  const handleDelete = (id: string) => {
    hapticFeedback('medium')
    setFriends(friends.filter((f) => f.id !== id))
  }

  return (
    <div className="space-y-4 pb-10">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Συνάδελφοι</h3>
        <button
          onClick={() => setIsAdding(true)}
          className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest border border-primary/20 hover:bg-primary/20 transition-all"
        >
          Προσθήκη
        </button>
      </div>

      {friends.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-3xl gap-4">
          <div className="w-16 h-16 rounded-full bg-secondary/30 flex items-center justify-center">
            <User className="h-8 w-8 text-muted-foreground/20" />
          </div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Δεν υπάρχουν φίλοι</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {friends.map((friend) => (
            <div key={friend.id} className="glass-card rounded-2xl p-4 border border-white/5 flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center border border-white/5">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-foreground leading-tight">{friend.name}</h4>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                    {friend.unit || 'Χωρίς Μονάδα'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {friend.phone && (
                  <a href={`tel:${friend.phone}`} className="p-2 rounded-lg bg-secondary/50 text-foreground hover:bg-primary hover:text-primary-foreground transition-all">
                    <Edit3 size={14} />
                  </a>
                )}
                <button
                  onClick={() => handleDelete(friend.id)}
                  className="p-2 rounded-lg bg-secondary/50 text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-all"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <FullscreenModal isOpen={isAdding} onClose={() => setIsAdding(false)} title="Προσθήκη Φίλου">
        <AddFriendForm onAdd={handleAdd} onCancel={() => setIsAdding(false)} />
      </FullscreenModal>
    </div>
  )
}

function AddFriendForm({ onAdd, onCancel }: { onAdd: (friend: FriendEntry) => void, onCancel: () => void }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [unit, setUnit] = useState('')
  const [notes, setNotes] = useState('')

  const handleSubmit = () => {
    if (!name.trim()) return
    onAdd({ id: Math.random().toString(36).substr(2, 9), name: name.trim(), phone: phone.trim(), unit: unit.trim(), notes: notes.trim() })
  }

  return (
    <div className="flex flex-col gap-4">
      <FormField label="Ονοματεπώνυμο" value={name} onChange={setName} placeholder="π.χ. Κώστας Παππάς" />
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Τηλέφωνο" value={phone} onChange={setPhone} placeholder="69..." />
        <FormField label="Μονάδα" value={unit} onChange={setUnit} placeholder="π.χ. 123 ΤΠ" />
      </div>
      <div className="space-y-1.5">
        <label className="block text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-1.5 ml-1">Σημειώσεις</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Προαιρετικά..."
          className="w-full px-4 py-3 rounded-xl bg-secondary text-foreground text-xs border border-white/5 placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[80px] resize-none font-bold"
        />
      </div>
      <div className="flex gap-3 pt-2">
        <button onClick={onCancel} className="flex-1 py-4 rounded-2xl bg-secondary text-foreground font-black text-[10px] uppercase tracking-widest border border-white/5 transition-all">
          Ακύρωση
        </button>
        <button onClick={handleSubmit} disabled={!name.trim()} className="flex-[2] py-4 rounded-2xl bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-widest disabled:opacity-40 transition-all shadow-lg shadow-primary/20">
          Προσθήκη
        </button>
      </div>
    </div>
  )
}

function AddSuperiorForm({ onAdd, onCancel }: { onAdd: (sup: SuperiorEntry) => void, onCancel: () => void }) {
  const [name, setName] = useState('')
  const [rank, setRank] = useState('ΛΟΧΑΓΟΣ')
  const [role, setRole] = useState('')
  const [phone, setPhone] = useState('')
  const [showRanks, setShowRanks] = useState(false)

  const handleSubmit = () => {
    if (!name.trim()) return
    onAdd({ id: Math.random().toString(36).substr(2, 9), name: name.trim(), rank, role: role.trim(), phone: phone.trim() })
  }

  return (
    <div className="flex flex-col gap-4">
      <FormField label="Ονοματεπώνυμο" value={name} onChange={setName} placeholder="π.χ. Γεώργιος Νικολάου" />
      <div className="grid grid-cols-2 gap-4">
        <div className="relative">
          <label className="block text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-1.5 ml-1">Βαθμός</label>
          <button
            type="button"
            onClick={() => {
              hapticFeedback('light')
              setShowRanks(!showRanks)
            }}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-secondary text-foreground text-xs border border-white/5 font-bold min-h-[46px] hover:bg-secondary/80 transition-colors"
          >
            <span className="truncate">{rank}</span>
            {showRanks ? <ChevronUp className="h-4 w-4 text-primary" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {showRanks && (
            <div className="absolute z-50 bottom-full mb-2 w-full max-h-48 overflow-y-auto rounded-xl bg-zinc-900 border border-white/10 no-scrollbar shadow-2xl animate-in fade-in slide-in-from-bottom-2">
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
                    'w-full text-left px-4 py-3 text-[11px] font-bold border-b border-white/5 last:border-0 transition-colors',
                    rank === r ? 'text-primary bg-primary/5' : 'text-foreground/70 hover:bg-white/5'
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
      <FormField label="Ρόλος" value={role} onChange={setRole} placeholder="π.χ. Διοικητής" />
      <div className="flex gap-3 pt-2">
        <button onClick={onCancel} className="flex-1 py-4 rounded-2xl bg-secondary text-foreground font-black text-[10px] uppercase tracking-widest border border-white/5 transition-all">
          Ακύρωση
        </button>
        <button onClick={handleSubmit} disabled={!name.trim()} className="flex-[2] py-4 rounded-2xl bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-widest disabled:opacity-40 transition-all shadow-lg shadow-primary/20">
          Προσθήκη
        </button>
      </div>
    </div>
  )
}
