'use client'

import { Shield, Calendar, FileText, User, Wallet } from 'lucide-react'
import { cn } from '@/lib/utils'
import { hapticFeedback } from '@/lib/helpers'

export type TabId = 'service' | 'duties' | 'notes' | 'profile' | 'expenses'

interface BottomNavProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

const tabs: { id: TabId; label: string; icon: typeof Shield }[] = [
  { id: 'service', label: 'Θητεία', icon: Shield },
  { id: 'duties', label: 'Ημερολόγιο', icon: Calendar },
  { id: 'notes', label: 'Σημειώσεις', icon: FileText },
  { id: 'profile', label: 'Άτομα', icon: User },
  { id: 'expenses', label: 'Έξοδα', icon: Wallet },
]

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav
      className="w-full flex-shrink-0 border-t border-neutral-800 safe-bottom bg-black/90 backdrop-blur-2xl"
      role="tablist"
      aria-label="Κύρια πλοήγηση"
    >
      <div className="flex items-center justify-around px-3 py-2">
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
                'flex flex-col items-center justify-center gap-1 py-1.5 px-3 rounded-xl transition-all duration-300 relative flex-1 min-w-0'
              )}
            >
              <div className={cn(
                "p-1.5 rounded-lg transition-all duration-300",
                isActive ? "bg-primary shadow-lg shadow-primary/20" : "bg-transparent"
              )}>
                <Icon className={cn(
                  'h-4.5 w-4.5 transition-all duration-300',
                  isActive ? 'text-primary-foreground' : 'text-zinc-500',
                  isActive ? 'stroke-[2.5]' : 'stroke-[2]'
                )} />
              </div>
              <span className={cn(
                'text-[9px] font-black uppercase tracking-widest transition-colors duration-300 truncate w-full text-center',
                isActive ? 'text-primary' : 'text-neutral-400'
              )}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
