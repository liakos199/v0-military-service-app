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
      className="w-full flex-shrink-0 z-50 safe-bottom border-t border-border"
      style={{ background: 'linear-gradient(180deg, rgba(15, 18, 16, 0.95), rgba(10, 12, 10, 0.98))', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
      role="tablist"
      aria-label="Κύρια πλοήγηση"
    >
      <div className="flex items-center justify-around px-2 pt-2 pb-2">
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
                'flex flex-col items-center justify-center gap-0.5 py-1.5 px-3 rounded-xl min-h-[48px] min-w-[48px] transition-all duration-200',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground active:scale-95'
              )}
            >
              <Icon className={cn('h-5 w-5', isActive && 'drop-shadow-[0_0_10px_rgba(74,222,128,0.6)]')} strokeWidth={isActive ? 2.5 : 1.5} />
              <span className={cn('text-[10px] leading-tight', isActive ? 'font-semibold' : 'font-normal')}>
                {tab.label}
              </span>
              {isActive && (
                <div className="h-0.5 w-4 rounded-full bg-primary mt-0.5" />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
