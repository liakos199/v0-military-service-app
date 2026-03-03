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
      role="tablist"
      aria-label="Κύρια πλοήγηση"
    >
      {/* Gradient border top */}
      <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, oklch(0.80 0.14 75 / 0.3), oklch(0.72 0.12 175 / 0.3), transparent)' }} />
      <div className="backdrop-blur-2xl bg-background/80" style={{ WebkitBackdropFilter: 'blur(24px)' }}>
        <div className="flex items-center justify-around px-1 pt-1.5 pb-1">
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
                  'relative flex flex-col items-center justify-center gap-0.5 py-1.5 px-2 rounded-2xl min-h-[48px] min-w-[48px] transition-all duration-300',
                  isActive
                    ? 'text-primary-foreground'
                    : 'text-muted-foreground active:scale-95'
                )}
              >
                {/* Active background glow */}
                {isActive && (
                  <div
                    className="absolute inset-0 rounded-2xl opacity-90"
                    style={{ background: 'var(--gradient-primary)' }}
                  />
                )}
                <Icon
                  className={cn(
                    'relative h-5 w-5 transition-all duration-300',
                    isActive && 'drop-shadow-[0_0_6px_oklch(0.80_0.14_75/0.6)]'
                  )}
                  strokeWidth={isActive ? 2.5 : 1.5}
                />
                <span className={cn(
                  'relative text-[10px] leading-tight transition-all duration-300',
                  isActive ? 'font-bold' : 'font-normal'
                )}>
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
