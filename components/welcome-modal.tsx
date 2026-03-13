'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Share, PlusSquare, MoreVertical, Menu, Download, Check, Calendar, Clock, Zap, FileText, Users } from 'lucide-react'
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

  const renderInstructions = () => {
    if (device === 'ios') {
      return (
        <div className="space-y-4 mt-6">
          <div className="bg-secondary/30 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 flex-shrink-0 mt-0.5">
                <span className="text-sm font-semibold text-primary">1</span>
              </div>
              <div>
                <p className="text-sm font-medium">Πάτησε το κουμπί Κοινοποίηση</p>
                <p className="text-xs text-muted-foreground mt-1">Βρίσκεται στο κάτω ή πάνω μέρος του browser</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 flex-shrink-0 mt-0.5">
                <span className="text-sm font-semibold text-primary">2</span>
              </div>
              <div>
                <p className="text-sm font-medium">Επίλεξε «Προσθήκη στην οθόνη αφετηρίας»</p>
                <p className="text-xs text-muted-foreground mt-1">Ίσως χρειαστεί να σύρεις προς τα κάτω</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 flex-shrink-0 mt-0.5">
                <span className="text-sm font-semibold text-primary">3</span>
              </div>
              <div>
                <p className="text-sm font-medium">Πάτησε «Προσθήκη»</p>
                <p className="text-xs text-muted-foreground mt-1">Στην πάνω δεξιά γωνία της οθόνης</p>
              </div>
            </div>
          </div>
        </div>
      )
    }

    if (device === 'android') {
      if (browser === 'samsung') {
        return (
          <div className="space-y-4 mt-6">
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
        <div className="space-y-4 mt-6">
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
      <div className="space-y-4 mt-6">
        <div className="bg-secondary/30 rounded-lg p-4">
          <p className="text-sm">Αναζήτησε την επιλογή «Προσθήκη στην αρχική οθόνη» στο μενού του browser σου για γρήγορη πρόσβαση.</p>
        </div>
      </div>
    )
  }

  const renderFeatures = () => {
    return (
      <div className="space-y-3 mt-6">
        {FEATURES.map((feature, index) => {
          const Icon = feature.icon
          return (
            <div key={index} className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/20 border border-white/5">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                <Check className="w-3.5 h-3.5 text-green-400" strokeWidth={3} />
              </div>
              <span className="text-sm font-medium text-foreground">{feature.label}</span>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md border-primary/20 bg-zinc-950 text-zinc-100" showCloseButton={false}>
        <DialogHeader className="items-center text-center">
          <div className="mb-4 p-3 bg-primary/10 rounded-2xl w-fit mx-auto">
            <Image
              src="/icon-192.png"
              alt="ΑΠΟΛΕΛΕ PRO"
              width={64}
              height={64}
              className="rounded-xl shadow-lg"
            />
          </div>
          <DialogTitle className="text-2xl font-bold">
            {step === 'install' ? 'Καλώς ήρθες!' : 'Δυνατότητες'}
          </DialogTitle>
          <DialogDescription className="text-zinc-400 text-sm mt-2">
            {step === 'install' 
              ? 'Πρόσθεσε την εφαρμογή στην αρχική σου οθόνη για γρήγορη πρόσβαση'
              : 'Όλα όσα χρειάζεσαι για τη θητεία σου'
            }
          </DialogDescription>
        </DialogHeader>
        
        {step === 'install' ? renderInstructions() : renderFeatures()}

        <DialogFooter className="sm:justify-center mt-6 gap-2">
          {step === 'features' && (
            <Button 
              type="button" 
              variant="secondary"
              className="flex-1 font-bold py-6 rounded-lg"
              onClick={() => setStep('install')}
            >
              Πίσω
            </Button>
          )}
          <Button 
            type="button" 
            variant="default" 
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-6 rounded-lg"
            onClick={step === 'install' ? handleNextStep : handleClose}
          >
            {step === 'install' ? 'Επόμενο' : 'Κατανοητό'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
