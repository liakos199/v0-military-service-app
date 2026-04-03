'use client'

import { 
  ShieldCheck, 
  Calendar as CalendarIcon, 
  NotebookText, 
  Users, 
  Wallet 
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { hapticFeedback } from '@/lib/helpers'

export type TabId = 'service' | 'duties' | 'notes' | 'profile' | 'expenses'

interface BottomNavProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

const tabs: { id: TabId; label: string; icon: typeof ShieldCheck }[] = [
  { id: 'service', label: 'Θητεία', icon: ShieldCheck },
  { id: 'duties', label: 'Ημερολόγιο', icon: CalendarIcon },
  { id: 'notes', label: 'Σημειώσεις', icon: NotebookText },
  { id: 'profile', label: 'Άτομα', icon: Users },
  { id: 'expenses', label: 'Έξοδα', icon: Wallet },
]

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-8 pt-4 bg-gradient-to-t from-black via-black/95 to-transparent pointer-events-none"
      role="tablist"
      aria-label="Κύρια πλοήγηση"
    >
      <div className="max-w-md mx-auto flex items-center justify-between bg-zinc-900/80 backdrop-blur-2xl border border-zinc-800/50 p-2 rounded-[2.5rem] shadow-2xl pointer-events-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-label={tab.label}
              onClick={() => {
                hapticFeedback('light')
                onTabChange(tab.id)
              }}
              className={cn(
                'relative flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-200 flex-1 min-w-0 group',
                isActive ? 'text-[#34d399]' : 'text-zinc-500'
              )}
            >
              <div className={cn(
                "relative z-10 transition-all duration-200 transform",
                isActive ? "scale-110 -translate-y-1" : "group-hover:scale-105"
              )}>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                {isActive && (
                  <div className="absolute -inset-2 bg-[#34d399]/10 blur-md rounded-full -z-10 animate-pulse"></div>
                )}
              </div>
              <span className={cn(
                'text-[8px] font-bold uppercase tracking-[0.03em] mt-1 transition-all duration-200 truncate w-full text-center',
                isActive ? 'opacity-100' : 'opacity-60'
              )}>
                {tab.label}
              </span>
              {isActive && (
                <div className="absolute -bottom-1 w-1 h-1 bg-[#34d399] rounded-full shadow-[0_0_8px_#34d399]"></div>
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
