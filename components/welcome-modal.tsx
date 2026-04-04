'use client'

import { useState, useEffect } from 'react'
import { FullscreenModal } from '@/components/fullscreen-modal'
import { ModalLayout } from '@/components/modal-layout'
import { Check, Share2, PlusSquare, ArrowRight, Zap, BookOpen, Users, Wallet, Calendar, ArrowLeft, Plane, Key, ShieldAlert, Edit3, GraduationCap } from 'lucide-react'
import Image from 'next/image'
import { motion } from 'framer-motion'

type DeviceType = 'ios' | 'android' | 'other'
type BrowserType = 'safari' | 'chrome' | 'samsung' | 'firefox' | 'other'
type ModalStep = 'install' | 'features'

const FEATURES = [
  { label: 'Λελέμετρο', icon: Zap, sub: 'Αντίστροφη μέτρηση απόλυσης' },
  { label: 'Υπηρεσίες & Βάρδιες', icon: Calendar, sub: 'Πλήρες πρόγραμμα υπηρεσιών' },
  { label: 'Έξοδα & Καντίνα', icon: Wallet, sub: 'Διαχείριση χρημάτων & τιμοκατάλογος' },
  { label: 'Άδειες & Έξοδοι', icon: Plane, sub: 'Καταγραφή και στατιστικά αδειών' },
  { label: 'Συνθηματικά Ημέρας', icon: Key, sub: 'Για την σκοπιά' },
  { label: 'Ποινές & Φυλακές', icon: ShieldAlert, sub: 'Προσθήκη & Παρακολούθηση' },
  { label: 'Προσωπικές Σημειώσεις', icon: Edit3, sub: 'Ψηφιακό σημειωματάριο' },
  { label: 'Στρατιωτικοί Οδηγοί', icon: BookOpen, sub: 'Εγχειρίδια & φωνητικό αλφάβητο' },
  { label: 'Τεστ Γνώσεων', icon: GraduationCap, sub: 'Ερωτήσεις & Απαντήσεις σε Quiz' },
  { label: 'Βιβλίο Στελεχών', icon: Users, sub: 'Τηλέφωνα ανωτέρων & φίλων' },
  
]

export function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState<ModalStep>('install')
  const [device, setDevice] = useState<DeviceType>('ios')
  const [browser, setBrowser] = useState<BrowserType>('safari')

  useEffect(() => {
    const hasSeen = localStorage.getItem('welcome-modal-seen')
    if (!hasSeen) {
      setIsOpen(true)
    }
    
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
      <div className="flex flex-col gap-3.5 py-4">
        {FEATURES.map((feature, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.08 * idx + 0.1, duration: 0.4 }}
            className="relative flex items-center p-0.5 overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/[0.04] via-transparent to-transparent" />
            <div className="w-[2px] h-6 bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.7)] shrink-0 rounded-full" />
            
            <div className="w-8 h-8 ml-3 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 group-hover:border-emerald-500/30 transition-colors">
              <feature.icon className="w-3.5 h-3.5 text-emerald-500/80" />
            </div>

            <div className="flex-1 text-left pl-3 space-y-0">
              <h4 className="text-[12px] font-black text-white/95 uppercase tracking-wider leading-tight">{feature.label}</h4>
              <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.05em] leading-tight">{feature.sub}</p>
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
          <div className="flex gap-3">
            {step === 'features' && (
              <button 
                type="button" 
                onClick={handleBack}
                className="flex-1 py-3.5 rounded-sm bg-zinc-900 border border-zinc-800 text-zinc-500 font-bold text-[9px] tracking-widest uppercase transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-3 h-3" strokeWidth={3} />
                Πίσω
              </button>
            )}
            
            <button 
              type="button" 
              onClick={step === 'install' ? handleNextStep : handleClose}
              className="flex-[2] py-3.5 rounded-sm bg-emerald-500 text-black font-black text-[9px] tracking-widest uppercase shadow-[0_0_15px_rgba(16,185,129,0.2)] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {step === 'install' ? 'Κατάλαβα' : 'Είσοδος'}
              <ArrowRight className="w-3 h-3" strokeWidth={3} />
            </button>
          </div>
        }
      >
        <div className="flex flex-col items-center px-4 py-8">
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
                alt="ΑΠΟΛΕΛΕ"
                width={64}
                height={64}
                className="object-contain scale-90"
              />
            </div>
          </div>
          
          <div className="text-center space-y-0.5">
            <h2 className="text-xl font-black text-white tracking-tighter uppercase leading-none">
              {step === 'install' ? 'ΟΔΗΓΟΣ ΕΓΚΑΤΑΣΤΑΣΗΣ' : 'Λειτουργίες Εφαρμογής'}
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

        <div className="min-h-[260px] px-2">
          {step === 'install' ? renderInstructions() : renderFeatures()}
        </div>
      </ModalLayout>
    )
  }

  return (
    <FullscreenModal 
      isOpen={isOpen} 
      onClose={handleClose}
      title={step === 'install' ? 'ΟΔΗΓΙΕΣ' : ''}
      showBackButton={false}
    >
      <div className="h-full bg-black relative">
        {renderContent()}
      </div>
    </FullscreenModal>
  )
}
