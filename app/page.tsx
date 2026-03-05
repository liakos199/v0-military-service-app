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
    const fadeTimer = setTimeout(() => setSplashFading(true), 1800)
    const hideTimer = setTimeout(() => setShowSplash(false), 2200)
    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(hideTimer)
    }
  }, [])

  if (showSplash) {
    return (
      <div
        className={`fixed inset-0 flex flex-col items-center justify-center bg-background z-50 ${splashFading ? 'splash-out' : ''}`}
        style={{ background: 'linear-gradient(180deg, #0A0C0A 0%, #0F1210 50%, #161A16 100%)' }}
      >
        <div className="splash-icon flex flex-col items-center gap-5">
          <Image
            src="/icon-512.png"
            alt="ΑΠΟΛΕΛΕ PRO"
            width={140}
            height={140}
            className="rounded-3xl"
            priority
          />
          <h1 className="text-2xl font-bold tracking-wide text-foreground font-sans">
            {'ΑΠΟΛΕΛΕ PRO'}
          </h1>
          <p className="text-xs text-muted-foreground tracking-widest uppercase font-sans">
            {'Στρατιωτική Εφαρμογή'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <main className="h-dvh bg-background safe-top flex flex-col overflow-hidden" style={{ background: 'linear-gradient(180deg, #0A0C0A 0%, #0F1210 30%, #161A16 100%)' }}>
      <div className="flex-1 max-w-lg mx-auto w-full flex flex-col overflow-hidden relative">
        {activeTab === 'service' && <ServiceTab />}
        {activeTab === 'duties' && <CalendarTab />}
        {activeTab === 'notes' && <NotesTab />}
        {activeTab === 'profile' && <ProfileTab />}
        {activeTab === 'expenses' && <ExpensesTab />}
      </div>
      <div className="h-20 flex-shrink-0">
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </main>
  )
}
