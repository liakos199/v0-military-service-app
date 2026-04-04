'use client'

import { useState, useEffect } from 'react'
import { BottomNav, type TabId } from '@/components/bottom-nav'
import { ServiceTab } from '@/components/service-tab'
import { CalendarTab } from '@/components/calendar-tab'
import { NotesTab } from '@/components/notes-tab'
import { ProfileTab } from '@/components/profile-tab'
import { ExpensesTab } from '@/components/expenses-tab'
import { WelcomeModal } from '@/components/welcome-modal'
import { SplashAnimation } from '@/components/splash-animation'
import { motion } from 'framer-motion'

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>('service')
  const [showSplash, setShowSplash] = useState(true)
  const [splashFading, setSplashFading] = useState(false)

  useEffect(() => {
    const fadeTimer = setTimeout(() => setSplashFading(true), 2000)
    const hideTimer = setTimeout(() => setShowSplash(false), 2500)
    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(hideTimer)
    }
  }, [])

  if (showSplash) {
    return (
      <div
        className={`fixed inset-0 flex flex-col items-center justify-center bg-black z-50 ${splashFading ? 'opacity-0 transition-opacity duration-500' : ''}`}
      >
        <div className="flex flex-col items-center gap-8">
          <SplashAnimation />
          
          <div className="flex flex-col items-center gap-1">
            <motion.h1 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="text-4xl font-black tracking-tighter text-white"
            >
              ΑΠΟΛΕΛΕ PRO
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-[10px] text-white tracking-[0.3em] uppercase font-bold"
            >
              ΣΤΡΑΤΙΩΤΙΚΗ ΕΦΑΡΜΟΓΗ
            </motion.p>
          </div>
        </div>

        {/* Minimalist Footer Area */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="absolute bottom-12 w-full flex flex-col items-center gap-2"
        >
          <div className="flex items-center gap-3">
             <p className="text-[10px] font-bold tracking-[0.3em] text-zinc-500 uppercase">
               MADE BY <span className="text-zinc-100">Η.Π.</span>
             </p>
          </div>
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 60, opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.6, ease: "easeInOut" }}
            className="h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"
          />
        </motion.div>
      </div>
    )
  }

  return (
    <main className="h-screen w-full bg-black flex flex-col overflow-hidden text-zinc-100 selection:bg-[#34d399] selection:text-black">
      {/* Content Area */}
      <div className="flex-1 w-full max-w-lg mx-auto flex flex-col overflow-hidden relative">
        <div key={activeTab} className="flex-1 w-full overflow-hidden">
          {activeTab === 'service' && <ServiceTab />}
          {activeTab === 'duties' && <CalendarTab />}
          {activeTab === 'notes' && <NotesTab />}
          {activeTab === 'profile' && <ProfileTab />}
          {activeTab === 'expenses' && <ExpensesTab />}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* Welcome Modal */}
      <WelcomeModal />
    </main>
  )
}
