'use client'

import { useState, useEffect } from 'react'
import { FullscreenModal } from '@/components/fullscreen-modal'
import { Check } from 'lucide-react'
import Image from 'next/image'

type DeviceType = 'ios' | 'android' | 'other'
type BrowserType = 'safari' | 'chrome' | 'samsung' | 'firefox' | 'other'
type ModalStep = 'install' | 'features'

const FEATURES = [
  { label: 'Λελέμετρο - Αντίστροφη μέτρηση' },
  { label: 'Ημερολόγιο & Υπηρεσίες' },
  { label: 'Σημειώσεις & Εγχειρίδια' },
  { label: 'Διαχείριση Ατόμων' },
  { label: 'Έξοδα & Ανάλυση' },
  { label: 'Θέμα & Προσαρμογή' },
]

export function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState<ModalStep>('install')
  const [device, setDevice] = useState<DeviceType>('other')
  const [browser, setBrowser] = useState<BrowserType>('other')

  useEffect(() => {
    // Check if already in standalone mode
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone || 
      document.referrer.includes('android-app://');

    // If already installed, don't show the install modal
    const welcomeSeen = localStorage.getItem('welcome-modal-seen') === 'true'

    if (isStandalone) {
      return;
    }

    // Check if first visit
    if (!welcomeSeen) {
      const ua = navigator.userAgent
      
      // Device detection
      if (/iPhone|iPad|iPod/.test(ua)) {
        setDevice('ios')
      } else if (/Android/.test(ua)) {
        setDevice('android')
      }

      // Browser detection
      if (/SamsungBrowser/.test(ua)) {
        setBrowser('samsung')
      } else if (/Chrome/.test(ua) && !/Edge/.test(ua)) {
        setBrowser('chrome')
      } else if (/Safari/.test(ua) && !/Chrome/.test(ua)) {
        setBrowser('safari')
      } else if (/Firefox/.test(ua)) {
        setBrowser('firefox')
      }

      setIsOpen(true)
    }
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
    if (device === 'ios') {
      return (
        <div className="space-y-4">
          {[
            { num: 1, title: 'Πάτησε το κουμπί Κοινοποίηση', subtitle: 'Βρίσκεται στο κάτω ή πάνω μέρος του browser' },
            { num: 2, title: 'Επίλεξε «Προσθήκη στην οθόνη αφετηρίας»', subtitle: 'Ίσως χρειαστεί να σύρεις προς τα κάτω' },
            { num: 3, title: 'Πάτησε «Προσθήκη»', subtitle: 'Στην πάνω δεξιά γωνία της οθόνης' },
          ].map((step) => (
            <div key={step.num} className="flex items-start gap-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-[#34d399] to-[#10b981] text-black flex-shrink-0 font-bold text-[12px]">
                {step.num}
              </div>
              <div className="flex-1">
                <p className="text-[14px] font-bold text-white">{step.title}</p>
                <p className="text-[12px] text-zinc-500 mt-1 font-medium">{step.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      )
    }

    if (device === 'android') {
      const steps = browser === 'samsung'
        ? [
            { num: 1, title: 'Πάτησε το μενού (3 γραμμές)', subtitle: 'Βρίσκεται κάτω δεξιά' },
            { num: 2, title: 'Επίλεξε «Προσθήκη σελίδας σε»', subtitle: 'Θα εμφανιστεί στο μενού' },
            { num: 3, title: 'Επίλεξε «Οθόνη αφετηρίας»', subtitle: 'Και επιβεβαίωσε την προσθήκη' },
          ]
        : [
            { num: 1, title: 'Πάτησε το μενού (3 τελείες)', subtitle: 'Βρίσκεται πάνω δεξιά' },
            { num: 2, title: 'Επίλεξε «Εγκατάσταση εφαρμογής»', subtitle: 'Ή «Προσθήκη στην αρχική οθόνη»' },
            { num: 3, title: 'Ακολούθησε τις οδηγίες', subtitle: 'Και επιβεβαίωσε την εγκατάσταση' },
          ]
      
      return (
        <div className="space-y-4">
          {steps.map((step) => (
            <div key={step.num} className="flex items-start gap-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-[#34d399] to-[#10b981] text-black flex-shrink-0 font-bold text-[12px]">
                {step.num}
              </div>
              <div className="flex-1">
                <p className="text-[14px] font-bold text-white">{step.title}</p>
                <p className="text-[12px] text-zinc-500 mt-1 font-medium">{step.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      )
    }

    return (
      <div className="bg-gradient-to-br from-zinc-800 to-zinc-900/90 border border-zinc-700/40 rounded-[1.5rem] p-5 shadow-lg shadow-black/10">
        <p className="text-[14px] text-zinc-300 font-medium leading-relaxed">
          Αναζήτησε την επιλογή «Προσθήκη στην αρχική οθόνη» στο μενού του browser σου για γρήγορη πρόσβαση.
        </p>
      </div>
    )
  }

  const renderFeatures = () => {
    return (
      <div className="grid grid-cols-1 gap-3">
        {FEATURES.map((feature, index) => {
          return (
            <div key={index} className="flex items-center gap-4 p-4 rounded-[1.25rem] bg-gradient-to-br from-zinc-800 to-zinc-900/90 border border-zinc-700/40 shadow-lg shadow-black/10">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#34d399]/20 flex items-center justify-center">
                <Check className="w-4 h-4 text-[#34d399] font-bold" strokeWidth={3} />
              </div>
              <span className="text-[14px] font-bold text-white">{feature.label}</span>
            </div>
          )
        })}
      </div>
    )
  }

  const renderContent = () => {
    return (
      <div className="flex flex-col h-full gap-6">
        {/* Icon and Title */}
        <div className="text-center">
          <div className="mb-6 p-4 bg-gradient-to-br from-zinc-800 to-zinc-900/90 border border-zinc-700/40 rounded-3xl w-fit mx-auto shadow-2xl">
            <Image
              src="/icon-192.png"
              alt="ΑΠΟΛΕΛΕ PRO"
              width={72}
              height={72}
              className="rounded-2xl shadow-xl"
            />
          </div>
          <p className="text-[13px] text-zinc-500 font-bold tracking-[0.1em] uppercase">
            {step === 'install' 
              ? 'Προσθεσε την εφαρμογη στην αρχικη σου οθονη'
              : 'Ολα οσα χρειαζεσαι για τη θητεια σου'
            }
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto hide-scrollbar">
          {step === 'install' ? renderInstructions() : renderFeatures()}
        </div>

        {/* Footer Buttons */}
        <div className="flex gap-3 pt-4">
          {step === 'features' && (
            <button 
              type="button" 
              onClick={handleBack}
              className="flex-1 py-4 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 font-bold text-[12px] tracking-widest uppercase hover:bg-zinc-800 hover:text-white transition-colors"
            >
              Πισω
            </button>
          )}
          <button 
            type="button" 
            onClick={step === 'install' ? handleNextStep : handleClose}
            className="flex-1 py-4 rounded-xl bg-gradient-to-r from-[#34d399] to-[#10b981] text-black font-bold text-[12px] tracking-widest uppercase shadow-lg shadow-emerald-500/20 active:scale-95 transition-transform"
          >
            {step === 'install' ? 'Επομενο' : 'Ξεκιναμε'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <FullscreenModal 
      isOpen={isOpen} 
      onClose={handleClose}
      title={step === 'install' ? 'Καλώς ήρθες!' : 'Δυνατότητες'}
      showBackButton={step === 'features'}
      onBack={handleBack}
    >
      {renderContent()}
    </FullscreenModal>
  )
}
