'use client'

import { useState, useEffect } from 'react'
import { FullscreenModal } from '@/components/fullscreen-modal'
import { ModalLayout } from '@/components/modal-layout'
import { Check, Share2, PlusSquare, ArrowRight, Zap, BookOpen, Users, Wallet, Calendar, Monitor } from 'lucide-react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

type DeviceType = 'ios' | 'android' | 'other'
type BrowserType = 'safari' | 'chrome' | 'samsung' | 'firefox' | 'other'
type ModalStep = 'install' | 'features'

const FEATURES = [
  { label: 'Λελέμετρο', icon: Zap, sub: 'Αντίστροφη μέτρηση' },
  { label: 'Ημερολόγιο', icon: Calendar, sub: 'Πρόγραμμα Υπηρεσιών' },
  { label: 'Σημειωματάριο', icon: BookOpen, sub: 'Σημειώσεις & Πληροφορίες' },
  { label: 'Εγχειρίδια', icon: Monitor, sub: 'Στρατιωτική Μελέτη' },
  { label: 'Στελέχη', icon: Users, sub: 'Βιβλίο Επαφών' },
  { label: 'Έξοδα', icon: Wallet, sub: 'Έλεγχος Εξόδων' },
]

export function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(true)
  const [step, setStep] = useState<ModalStep>('install')
  const [device, setDevice] = useState<DeviceType>('ios')
  const [browser, setBrowser] = useState<BrowserType>('safari')

  useEffect(() => {
    setIsOpen(true)
    
    // Auto-detect device for production logic (currently forced to iOS for design)
    const ua = navigator.userAgent
    if (/iPad|iPhone|iPod/.test(ua)) setDevice('ios')
    else if (/android/i.test(ua)) setDevice('android')
    
    if (/SamsungBrowser/i.test(ua)) setBrowser('samsung')
    else if (/Firefox|FxiOS/i.test(ua)) setBrowser('firefox')
    else if (/Chrome/i.test(ua)) setBrowser('chrome')
  }, [])

  const handleClose = () => {
    localStorage.setItem('welcome-modal-seen', 'true')
    setIsOpen(false)
  }

  const handleNextStep = () => {
    setStep('features')
  }

  const handleBack = () => {
    setStep('install')
  }

  const renderInstructions = () => {
    const steps = device === 'ios' 
      ? [
          { icon: Share2, title: 'Κοινοποίηση', sub: 'Πάτησε το εικονίδιο κοινοποίησης στην μπάρα του Safari' },
          { icon: PlusSquare, title: 'Προσθήκη στην αρχική οθόνη', sub: 'Βρες και επίλεξε «Προσθήκη στην οθόνη αφετηρίας»' },
          { icon: Check, title: 'Επιβεβαίωση', sub: 'Πάτησε «Προσθήκη» στην πάνω δεξιά γωνία' },
        ]
      : browser === 'samsung'
        ? [
            { icon: Share2, title: 'Μενού Επιλογών', sub: 'Πάτησε τις 3 γραμμές κάτω δεξιά ή το βέλος στην μπάρα διευθύνσεων' },
            { icon: PlusSquare, title: 'Προσθήκη σελίδας', sub: 'Επίλεξε «Προσθήκη σελίδας σε» και μετά «Οθόνη αφετηρίας»' },
            { icon: Check, title: 'Εγκατάσταση', sub: 'Επιβεβαίωσε την προσθήκη πατώντας «Προσθήκη»' },
          ]
        : browser === 'firefox'
          ? [
              { icon: Share2, title: 'Μενού Firefox', sub: 'Πάτησε τις 3 τελείες στο κάτω ή πάνω μέρος της οθόνης' },
              { icon: PlusSquare, title: 'Εγκατάσταση', sub: 'Επίλεξε «Εγκατάσταση» από τη λίστα' },
              { icon: Check, title: 'Προσθήκη', sub: 'Επιβεβαίωσε την προσθήκη στην αρχική οθόνη' },
            ]
          : [
              { icon: Share2, title: 'Μενού Chrome', sub: 'Πάτησε τις 3 τελείες (Μενού) στην πάνω δεξιά γωνία' },
              { icon: PlusSquare, title: 'Εγκατάσταση', sub: 'Επίλεξε «Εγκατάσταση εφαρμογής» ή «Προσθήκη στην αρχική οθόνη»' },
              { icon: Check, title: 'Επιβεβαίωση', sub: 'Πάτησε «Εγκατάσταση» στο παράθυρο που θα εμφανιστεί' },
            ]

    return (
      <div className="relative pt-1 pl-4">
        <div className="space-y-5 relative">
          {steps.map((item, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * idx + 0.5, duration: 0.5 }}
              className="flex items-start gap-4 group relative"
            >
              {/* Connector Line (Internal) */}
              {idx < steps.length - 1 && (
                <div className="absolute top-10 left-5 w-px h-5 bg-emerald-500/30 -translate-x-1/2" />
              )}
              
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700/50 shadow-xl flex items-center justify-center group-hover:border-emerald-500/50 transition-colors duration-500">
                  <item.icon className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-[9px] font-black text-black flex items-center justify-center border-2 border-black">
                  {idx + 1}
                </div>
              </div>
              <div className="flex-1 pt-0.5 text-left">
                <h4 className="text-[13px] font-black text-white tracking-tight uppercase leading-none mb-1">{item.title}</h4>
                <p className="text-[10px] text-zinc-500 font-medium leading-tight">{item.sub}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    )
  }

  const renderFeatures = () => {
    return (
      <div className="flex flex-col gap-5 py-6">
        {FEATURES.map((feature, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * idx + 0.2, duration: 0.5 }}
            className="flex gap-4 group"
          >
            <span className="text-[10px] font-mono font-bold text-emerald-500/40 pt-1 shrink-0">
              {(idx + 1).toString().padStart(2, '0')}.
            </span>
            <div className="flex flex-col items-start text-left space-y-1">
              <h4 className="text-[12px] font-black text-white uppercase tracking-wider leading-none">{feature.label}</h4>
              <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.10em] leading-tight">{feature.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>
    )
  }

  const renderContent = () => {
    return (
      <ModalLayout
        header={null}
        contentClassName="px-0 py-0"
        footer={
          <div className="flex gap-3 px-6 py-6 pb-8">
            {step === 'features' && (
              <button 
                type="button" 
                onClick={handleBack}
                className="flex-1 py-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-500 font-bold text-[9px] tracking-widest uppercase transition-all flex items-center justify-center gap-2"
              >
                Πισω
              </button>
            )}
            
            <button 
              type="button" 
              onClick={step === 'install' ? handleNextStep : handleClose}
              className="flex-[2] py-3.5 rounded-xl bg-emerald-500 text-black font-black text-[9px] tracking-widest uppercase shadow-[0_0_15px_rgba(16,185,129,0.2)] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {step === 'install' ? 'Κατάλαβα' : 'Είσοδος'}
              <ArrowRight className="w-3 h-3" strokeWidth={3} />
            </button>
          </div>
        }
      >
        <div className="flex flex-col items-center px-4 py-6 pt-10">
          {step === 'install' && (
            <div className="relative mb-4">
              {/* Outer Pulsing Ring */}
              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-x-[-12px] inset-y-[-12px] rounded-full border border-emerald-500/50 blur-sm"
              />
              {/* Background Glow */}
              <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full" />
              
              <div className="relative w-16 h-16 bg-black rounded-xl border border-zinc-800 shadow-2xl flex items-center justify-center overflow-hidden">
                <Image
                  src="/icon-192.png"
                  alt="ΑΠΟΛΕΛΕ PRO"
                  width={64}
                  height={64}
                  className="object-contain scale-90"
                />
              </div>
            </div>
          )}
          
          <div className="text-center space-y-0.5">
            <h2 className="text-xl font-black text-white tracking-tighter uppercase leading-none">
              {step === 'install' ? 'ΟΔΗΓΟΣ ΕΓΚΑΤΑΣΤΑΣΗΣ' : 'Υπάρχον Λειτουργίες'}
            </h2>
            <p className="text-[9px] text-emerald-500/70 font-bold tracking-[0.2em] uppercase">
              {step === 'install' ? 'Πρώτα Βήματα' : 'Τι περιλαμβάνει η εφαρμογή'}
            </p>
          </div>

          {/* Stylized Border Bottom */}
          <div className="w-full mt-6 relative h-px flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
            <div className="relative w-8 h-[1px] bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          </div>
        </div>

        <div className="min-h-[260px] px-10">
          {step === 'install' ? renderInstructions() : renderFeatures()}
        </div>
      </ModalLayout>
    )
  }

  return (
    <FullscreenModal 
      isOpen={isOpen} 
      onClose={handleClose}
      title={step === 'install' ? 'ΠΡΟΣΘΗΚΗ ΣΤΗΝ ΟΘΟΝΗ' : ''}
      showBackButton={false}
    >
      <div className="h-full bg-black relative overflow-hidden">
        {/* Abstract Background Accents */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />
        
        {renderContent()}
      </div>
    </FullscreenModal>
  )
}
