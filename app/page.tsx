'use client'

import { useState } from 'react'
import { BottomNav, type TabId } from '@/components/bottom-nav'
import { ServiceTab } from '@/components/service-tab'
import { DutiesTab } from '@/components/duties-tab'
import { NotesTab } from '@/components/notes-tab'
import { ProfileTab } from '@/components/profile-tab'
import { ExpensesTab } from '@/components/expenses-tab'

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>('service')

  return (
    <main className="min-h-dvh bg-background safe-top">
      <div className="max-w-lg mx-auto px-4 pt-4 pb-28">
        {activeTab === 'service' && <ServiceTab />}
        {activeTab === 'duties' && <DutiesTab />}
        {activeTab === 'notes' && <NotesTab />}
        {activeTab === 'profile' && <ProfileTab />}
        {activeTab === 'expenses' && <ExpensesTab />}
      </div>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </main>
  )
}
