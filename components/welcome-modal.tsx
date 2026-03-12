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
import { Share, PlusSquare, MoreVertical, Menu, Download } from 'lucide-react'
import Image from 'next/image'

type DeviceType = 'ios' | 'android' | 'other'
type BrowserType = 'safari' | 'chrome' | 'samsung' | 'firefox' | 'other'

export function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [device, setDevice] = useState<DeviceType>('other')
  const [browser, setBrowser] = useState<BrowserType>('other')

  useEffect(() => {
    // Check if already in standalone mode
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone || 
      document.referrer.includes('android-app://');

    if (isStandalone) return;

    // Check if first visit
    const hasVisited = localStorage.getItem('welcome-modal-seen')
    if (!hasVisited) {
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

  const renderInstructions = () => {
    if (device === 'ios') {
      return (
        <div className="space-y-4 mt-4">
          <p className="text-sm">Για την καλύτερη εμπειρία, πρόσθεσε την εφαρμογή στην αρχική σου οθόνη:</p>
          <ol className="space-y-3 text-sm list-decimal list-inside">
            <li className="flex items-center gap-2 flex-wrap">
              Πάτησε το κουμπί <strong>Κοινοποίηση (Share)</strong> 
              <Share className="w-4 h-4 inline text-blue-500" /> 
              στο κάτω μέρος (ή πάνω μέρος) του browser.
            </li>
            <li className="flex items-center gap-2 flex-wrap">
              Σύρε προς τα κάτω και επίλεξε <strong>Προσθήκη στην οθόνη αφετηρίας</strong>
              <PlusSquare className="w-4 h-4 inline" />.
            </li>
            <li>
              Πάτησε <strong>Προσθήκη</strong> στην πάνω δεξιά γωνία.
            </li>
          </ol>
        </div>
      )
    }

    if (device === 'android') {
      if (browser === 'samsung') {
        return (
          <div className="space-y-4 mt-4">
            <p className="text-sm">Για την καλύτερη εμπειρία, πρόσθεσε την εφαρμογή στην αρχική σου οθόνη:</p>
            <ol className="space-y-3 text-sm list-decimal list-inside">
              <li className="flex items-center gap-2 flex-wrap">
                Πάτησε το <strong>μενού (3 γραμμές)</strong> 
                <Menu className="w-4 h-4 inline" /> κάτω δεξιά.
              </li>
              <li>
                Επίλεξε <strong>Προσθήκη σελίδας σε</strong>.
              </li>
              <li>
                Επίλεξε <strong>Οθόνη αφετηρίας</strong>.
              </li>
            </ol>
          </div>
        )
      }
      
      return (
        <div className="space-y-4 mt-4">
          <p className="text-sm">Για την καλύτερη εμπειρία, πρόσθεσε την εφαρμογή στην αρχική σου οθόνη:</p>
          <ol className="space-y-3 text-sm list-decimal list-inside">
            <li className="flex items-center gap-2 flex-wrap">
              Πάτησε το <strong>μενού (3 τελείες)</strong> 
              <MoreVertical className="w-4 h-4 inline" /> πάνω δεξιά.
            </li>
            <li className="flex items-center gap-2 flex-wrap">
              Επίλεξε <strong>Εγκατάσταση εφαρμογής</strong> ή <strong>Προσθήκη στην αρχική οθόνη</strong>
              <Download className="w-4 h-4 inline" />.
            </li>
            <li>
              Ακολούθησε τις οδηγίες στην οθόνη.
            </li>
          </ol>
        </div>
      )
    }

    return (
      <div className="space-y-4 mt-4">
        <p className="text-sm">Πρόσθεσε την εφαρμογή στην αρχική σου οθόνη για γρήγορη πρόσβαση και καλύτερη εμπειρία χρήσης.</p>
        <p className="text-xs text-muted-foreground italic">
          Αναζήτησε την επιλογή "Προσθήκη στην αρχική οθόνη" στο μενού του browser σου.
        </p>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md border-primary/20 bg-zinc-950 text-zinc-100" showCloseButton={false}>
        <DialogHeader className="items-center text-center">
          <div className="mb-4 p-3 bg-primary/10 rounded-2xl">
            <Image
              src="/icon-192.png"
              alt="ΑΠΟΛΕΛΕ PRO"
              width={64}
              height={64}
              className="rounded-xl shadow-lg"
            />
          </div>
          <DialogTitle className="text-xl font-bold">Καλώς ήρθες στο ΑΠΟΛΕΛΕ PRO!</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Η απόλυτη στρατιωτική εφαρμογή για τη θητεία σου.
          </DialogDescription>
        </DialogHeader>
        
        {renderInstructions()}

        <DialogFooter className="sm:justify-center mt-4">
          <Button 
            type="button" 
            variant="default" 
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-6 rounded-xl"
            onClick={handleClose}
          >
            Εντάξει, το κατάλαβα!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
