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
      className="fixed bottom-0 left-0 right-0 z-50 safe-bottom"
      style={{
        background:
          'linear-gradient(180deg, oklch(0.16 0.006 260 / 0.92), oklch(0.13 0.005 260 / 0.98))',
        backdropFilter: 'blur(24px) saturate(1.4)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
        borderTop: '1px solid oklch(0.30 0.008 260 / 0.25)',
      }}
      role="tablist"
      aria-label="Κύρια πλοήγηση"
    >
      <div className="max-w-lg mx-auto flex items-center justify-around px-2 pt-2 pb-1">
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
                'flex flex-col items-center justify-center gap-0.5 py-2 px-3 rounded-2xl min-h-[48px] min-w-[48px] transition-all duration-200',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground active:scale-95'
              )}
            >
              <div className="relative">
                <Icon
                  className={cn('h-5 w-5 transition-all duration-200')}
                  strokeWidth={isActive ? 2.5 : 1.5}
                />
                {isActive && (
                  <div
                    className="absolute -inset-2 rounded-full"
                    style={{
                      background:
                        'radial-gradient(circle, oklch(0.75 0.15 75 / 0.15) 0%, transparent 70%)',
                    }}
                  />
                )}
              </div>
              <span
                className={cn(
                  'text-[10px] leading-tight transition-all duration-200',
                  isActive ? 'font-semibold' : 'font-normal'
                )}
              >
                {tab.label}
              </span>
              {isActive && (
                <div className="h-0.5 w-5 rounded-full bg-primary mt-0.5" />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
