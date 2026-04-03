'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { BottomNav, type TabId } from '@/components/bottom-nav'
import { ServiceTab } from '@/components/service-tab'
import { CalendarTab } from '@/components/calendar-tab'
import { NotesTab } from '@/components/notes-tab'
import { ProfileTab } from '@/components/profile-tab'
import { ExpensesTab } from '@/components/expenses-tab'
import { WelcomeModal } from '@/components/welcome-modal'

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
        className={`fixed inset-0 flex flex-col items-center justify-center bg-black z-50 ${splashFading ? 'opacity-0 transition-opacity duration-400' : ''}`}
      >
        <div className="flex flex-col items-center gap-5 animate-fade-in">
          <Image
            src="/icon-512.png"
            alt="ΑΠΟΛΕΛΕ PRO"
            width={140}
            height={140}
            className="rounded-[2.5rem] shadow-2xl shadow-emerald-900/20"
            priority
          />
          <div className="text-center space-y-1">
            <h1 className="text-xl font-bold tracking-tight text-white font-sans">
              ΑΠΟΛΕΛΕ PRO
            </h1>
            <p className="text-[9px] text-zinc-500 tracking-[0.3em] uppercase font-bold">
              ΣΤΡΑΤΙΩΤΙΚΗ ΕΦΑΡΜΟΓΗ
            </p>
          </div>
        </div>
        <div className="absolute bottom-12 left-0 right-0 text-center">
          <p className="text-[10px] font-bold tracking-[0.2em] text-emerald-500/80 uppercase">
            Made by Η.Π.
          </p>
        </div>
      </div>
    )
  }

  return (
    <main className="h-screen w-full bg-black flex flex-col overflow-hidden text-zinc-100 selection:bg-[#34d399] selection:text-black">
      {/* Content Area */}
      <div className="flex-1 w-full max-w-lg mx-auto flex flex-col overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, scale: 0.98, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.02, y: -8 }}
            transition={{ 
              duration: 0.25, 
              ease: [0.32, 0.72, 0, 1] 
            }}
            className="flex-1 w-full overflow-hidden"
          >
            {activeTab === 'service' && <ServiceTab />}
            {activeTab === 'duties' && <CalendarTab />}
            {activeTab === 'notes' && <NotesTab />}
            {activeTab === 'profile' && <ProfileTab />}
            {activeTab === 'expenses' && <ExpensesTab />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* Welcome Modal */}
      <WelcomeModal />
    </main>
  )
}
