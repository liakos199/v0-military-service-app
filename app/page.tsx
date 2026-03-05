'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { BottomNav, type TabId } from '@/components/bottom-nav'
import { ServiceTab } from '@/components/service-tab'
import { CalendarTab } from '@/components/calendar-tab'
import { NotesTab } from '@/components/notes-tab'
import { ProfileTab } from '@/components/profile-tab'
import { ExpensesTab } from '@/components/expenses-tab'

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>('service')
  const [showSplash, setShowSplash] = useState(true)
  const [splashFading, setSplashFading] = useState(false)

  useEffect(() => {
    const fadeTimer = setTimeout(() => setSplashFading(true), 1600)
    const hideTimer = setTimeout(() => setShowSplash(false), 1900)
    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(hideTimer)
    }
  }, [])

  if (showSplash) {
    return (
      <div
        className={`fixed inset-0 flex flex-col items-center justify-center z-50 bg-background ${splashFading ? 'splash-out' : ''}`}
      >
        <div className="splash-in flex flex-col items-center gap-5">
          <Image
            src="/icon-512.png"
            alt="APOLELE PRO"
            width={96}
            height={96}
            className="rounded-2xl"
            priority
          />
          <div className="flex flex-col items-center gap-1.5">
            <h1 className="text-xl font-bold tracking-tight text-foreground font-sans">
              APOLELE PRO
            </h1>
            <p className="text-xs text-muted-foreground tracking-widest uppercase font-sans">
              {'Military Service'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-dvh bg-background safe-top">
      <div className="max-w-lg mx-auto h-dvh flex flex-col overflow-hidden">
        <div className="tab-content flex-1 flex flex-col overflow-hidden" key={activeTab}>
          {activeTab === 'service' && <ServiceTab />}
          {activeTab === 'duties' && <CalendarTab />}
          {activeTab === 'notes' && <NotesTab />}
          {activeTab === 'profile' && <ProfileTab />}
          {activeTab === 'expenses' && <ExpensesTab />}
        </div>
      </div>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </main>
  )
}
