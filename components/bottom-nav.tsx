'use client'

import { Shield, Calendar, FileText, User, Wallet, Coffee } from 'lucide-react'
import { cn } from '@/lib/utils'
import { hapticFeedback } from '@/lib/helpers'

export type TabId = 'service' | 'duties' | 'notes' | 'profile' | 'expenses' | 'canteen-catalog'

interface BottomNavProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

const tabs: { id: TabId; label: string; icon: typeof Shield }[] = [
  { id: 'service', label: 'Θητεία', icon: Shield },
  { id: 'duties', label: 'Ημερολόγιο', icon: Calendar },
  { id: 'notes', label: 'Σημειώσεις', icon: FileText },
  { id: 'profile', label: 'Προφίλ', icon: User },
  { id: 'canteen-catalog', label: 'Κ.Ψ.Μ.', icon: Coffee },
  { id: 'expenses', label: 'Έξοδα', icon: Wallet },
]

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 safe-bottom border-t border-glass-border"
      style={{ background: 'linear-gradient(180deg, oklch(0.24 0.008 250 / 0.90), oklch(0.18 0.006 250 / 0.95))', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
      role="tablist"
      aria-label="Κύρια πλοήγηση"
    >
      <div className="flex items-center justify-around px-2 pt-2 pb-1">
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
              <Icon className={cn('h-5 w-5', isActive && 'drop-shadow-[0_0_8px_oklch(0.62_0.17_145)]')} strokeWidth={isActive ? 2.5 : 1.5} />
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
