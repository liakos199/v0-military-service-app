'use client'

import { useState, useEffect } from 'react'
import { FullscreenModal } from '@/components/fullscreen-modal'
import { Button } from '@/components/ui/button'
import { Check, Clock, Calendar, Zap, FileText, Users } from 'lucide-react'
import Image from 'next/image'

type DeviceType = 'ios' | 'android' | 'other'
type BrowserType = 'safari' | 'chrome' | 'samsung' | 'firefox' | 'other'
type ModalStep = 'install' | 'features'

const FEATURES = [
  { icon: Clock, label: 'Λελέμετρο - Αντίστροφη μέτρηση' },
  { icon: Calendar, label: 'Ημερολόγιο & Υπηρεσίες' },
  { icon: FileText, label: 'Σημειώσεις & Εγχειρίδια' },
  { icon: Users, label: 'Διαχείριση Ατόμων' },
  { icon: Zap, label: 'Έξοδα & Ανάλυση' },
  { icon: Zap, label: 'Θέμα & Προσαρμογή' },
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
          <div className="zinc-card p-5 space-y-4 border-zinc-800/50">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground flex-shrink-0 mt-0.5 shadow-lg shadow-primary/20">
                <span className="text-[10px] font-black">1</span>
              </div>
              <div>
                <p className="text-sm font-bold text-white">Πάτησε το κουμπί Κοινοποίηση</p>
                <p className="text-xs text-neutral-400 font-medium mt-1">Βρίσκεται στο κάτω ή πάνω μέρος του browser</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground flex-shrink-0 mt-0.5 shadow-lg shadow-primary/20">
                <span className="text-[10px] font-black">2</span>
              </div>
              <div>
                <p className="text-sm font-bold text-white">Επίλεξε «Προσθήκη στην οθόνη αφετηρίας»</p>
                <p className="text-xs text-neutral-400 font-medium mt-1">Ίσως χρειαστεί να σύρεις προς τα κάτω</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground flex-shrink-0 mt-0.5 shadow-lg shadow-primary/20">
                <span className="text-[10px] font-black">3</span>
              </div>
              <div>
                <p className="text-sm font-bold text-white">Πάτησε «Προσθήκη»</p>
                <p className="text-xs text-neutral-400 font-medium mt-1">Στην πάνω δεξιά γωνία της οθόνης</p>
              </div>
            </div>
          </div>
        </div>
      )
    }

    if (device === 'android') {
      if (browser === 'samsung') {
        return (
          <div className="space-y-4">
            <div className="bg-secondary/30 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 flex-shrink-0 mt-0.5">
                  <span className="text-sm font-semibold text-primary">1</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Πάτησε το μενού (3 γραμμές)</p>
                  <p className="text-xs text-muted-foreground mt-1">Βρίσκεται κάτω δεξιά</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 flex-shrink-0 mt-0.5">
                  <span className="text-sm font-semibold text-primary">2</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Επίλεξε «Προσθήκη σελίδας σε»</p>
                  <p className="text-xs text-muted-foreground mt-1">Θα εμφανιστεί στο μενού</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 flex-shrink-0 mt-0.5">
                  <span className="text-sm font-semibold text-primary">3</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Επίλεξε «Οθόνη αφετηρίας»</p>
                  <p className="text-xs text-muted-foreground mt-1">Και επιβεβαίωσε την προσθήκη</p>
                </div>
              </div>
            </div>
          </div>
        )
      }
      
      return (
        <div className="space-y-4">
          <div className="bg-secondary/30 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 flex-shrink-0 mt-0.5">
                <span className="text-sm font-semibold text-primary">1</span>
              </div>
              <div>
                <p className="text-sm font-medium">Πάτησε το μενού (3 τελείες)</p>
                <p className="text-xs text-muted-foreground mt-1">Βρίσκεται πάνω δεξιά</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 flex-shrink-0 mt-0.5">
                <span className="text-sm font-semibold text-primary">2</span>
              </div>
              <div>
                <p className="text-sm font-medium">Επίλεξε «Εγκατάσταση εφαρμογής»</p>
                <p className="text-xs text-muted-foreground mt-1">Ή «Προσθήκη στην αρχική οθόνη»</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 flex-shrink-0 mt-0.5">
                <span className="text-sm font-semibold text-primary">3</span>
              </div>
              <div>
                <p className="text-sm font-medium">Ακολούθησε τις οδηγίες</p>
                <p className="text-xs text-muted-foreground mt-1">Και επιβεβαίωσε την εγκατάσταση</p>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <div className="bg-secondary/30 rounded-lg p-4">
          <p className="text-sm">Αναζήτησε την επιλογή «Προσθήκη στην αρχική οθόνη» στο μενού του browser σου για γρήγορη πρόσβαση.</p>
        </div>
      </div>
    )
  }

  const renderFeatures = () => {
    return (
      <div className="grid grid-cols-1 gap-2">
        {FEATURES.map((feature, index) => {
          return (
            <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/10 border border-white/5">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                <Check className="w-3.5 h-3.5 text-green-400" strokeWidth={3} />
              </div>
              <span className="text-xs font-medium text-foreground">{feature.label}</span>
            </div>
          )
        })}
      </div>
    )
  }

  const renderContent = () => {
    return (
      <div className="flex flex-col h-full">
        {/* Icon and Title */}
        <div className="text-center mb-6 pb-4 border-b border-border">
          <div className="mb-6 p-4 bg-zinc-900/50 border border-zinc-800/50 rounded-3xl w-fit mx-auto shadow-2xl">
            <Image
              src="/icon-192.png"
              alt="ΑΠΟΛΕΛΕ PRO"
              width={72}
              height={72}
              className="rounded-2xl shadow-xl"
            />
          </div>
          <h1 className="text-2xl font-black text-foreground tracking-tight mb-2">
            {step === 'install' ? 'Καλώς ήρθες!' : 'Δυνατότητες'}
          </h1>
          <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest leading-relaxed px-6">
            {step === 'install' 
              ? 'Πρόσθεσε την εφαρμογή στην αρχική σου οθόνη για γρήγορη πρόσβαση'
              : 'Όλα όσα χρειάζεσαι για τη θητεία σου'
            }
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {step === 'install' ? renderInstructions() : renderFeatures()}
        </div>

        {/* Footer Buttons */}
        <div className="mt-6 pt-4 border-t border-border flex gap-2">
          {step === 'features' && (
            <Button 
              type="button" 
              variant="ghost"
              className="flex-1 font-medium py-4 rounded-lg text-zinc-400 hover:text-zinc-100"
              onClick={handleBack}
            >
              Πίσω
            </Button>
          )}
          <Button 
            type="button" 
            variant="default" 
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-lg"
            onClick={step === 'install' ? handleNextStep : handleClose}
          >
            {step === 'install' ? 'Επόμενο' : 'Ξεκινάμε'}
          </Button>
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
