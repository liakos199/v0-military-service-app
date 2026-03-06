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
  { id: 'profile', label: 'Προφίλ', icon: User },
  { id: 'expenses', label: 'Έξοδα', icon: Wallet },
]

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav
      className="w-full flex-shrink-0 border-t border-white/5 safe-bottom"
      style={{ background: 'rgba(5, 7, 5, 0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
      role="tablist"
      aria-label="Κύρια πλοήγηση"
    >
      <div className="flex items-center justify-around px-4 py-2">
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
                'flex flex-col items-center justify-center gap-1 py-2 px-2 rounded-xl transition-colors duration-300 relative'
              )}
            >
              <div className={cn(
                "p-2 rounded-xl transition-colors duration-300",
                isActive ? "bg-primary/10" : "bg-transparent"
              )}>
                <Icon className={cn(
                  'h-5 w-5 transition-all duration-300',
                  isActive ? 'text-primary drop-shadow-[0_0_8px_var(--primary)]' : 'text-muted-foreground/60',
                  isActive ? 'stroke-[2.5]' : 'stroke-[2]'
                )} />
              </div>
              <span className={cn(
                'text-[9px] font-bold uppercase tracking-tighter transition-colors duration-300',
                isActive ? 'text-primary' : 'text-muted-foreground/60'
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
