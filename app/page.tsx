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
        className={`fixed inset-0 flex flex-col items-center justify-center z-50 bg-background ${splashFading ? 'splash-out' : ''}`}
      >
        {/* Subtle radial glow */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 50% 45%, oklch(0.75 0.15 75 / 0.08) 0%, transparent 60%)',
          }}
        />
        <div className="splash-icon flex flex-col items-center gap-6 relative z-10">
          <div className="glow-primary rounded-3xl">
            <Image
              src="/icon-512.png"
              alt="APOLELE PRO"
              width={120}
              height={120}
              className="rounded-3xl"
              priority
            />
          </div>
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-sans">
              APOLELE PRO
            </h1>
            <div className="h-px w-12 bg-primary/40" />
            <p className="text-xs text-muted-foreground tracking-[0.2em] uppercase font-sans">
              {'Military Service App'}
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
