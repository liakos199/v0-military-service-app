'use client'

import { useState } from 'react'
import { BottomNav, type TabId } from '@/components/bottom-nav'
import { ServiceTab } from '@/components/service-tab'
import { CalendarTab } from '@/components/calendar-tab'
import { NotesTab } from '@/components/notes-tab'
import { ProfileTab } from '@/components/profile-tab'
import { ExpensesTab } from '@/components/expenses-tab'

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>('service')

  return (
    <main className="h-dvh flex flex-col bg-background safe-top overflow-hidden" style={{ background: 'linear-gradient(180deg, oklch(0.14 0.002 250) 0%, oklch(0.0 0.0 0) 30%, oklch(0.0 0.0 0) 100%)' }}>
      <div className="flex-1 overflow-hidden max-w-lg mx-auto w-full">
        {activeTab === 'service' && <ServiceTab />}
        {activeTab === 'duties' && <CalendarTab />}
        {activeTab === 'notes' && <NotesTab />}
        {activeTab === 'profile' && <ProfileTab />}
        {activeTab === 'expenses' && <ExpensesTab />}
      </div>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </main>
  )
}
