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
import { Input } from '@/components/ui/input'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { hapticFeedback } from '@/lib/helpers'
import { GreekDatePicker } from '@/components/greek-date-picker'
import { ChevronRight, ChevronLeft, User, Calendar, Shield, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ProfileData, ServiceConfig } from '@/lib/types'
import { RANKS, SERVICE_DURATION_PRESETS } from '@/lib/types'

const DEFAULT_PROFILE: ProfileData = {
  fullName: '',
  company: '',
  barracks: '',
  bloodType: '',
  reportingPhrase: '',
  rank: 'Στρατιώτης',
  serviceNumber: '',
  weaponCode: '',
  weaponCell: '',
}

const DEFAULT_CONFIG: ServiceConfig = {
  enlistmentDate: new Date().toISOString().split('T')[0],
  totalDays: 365,
}

export function OnboardingFlow({ isOpen, onComplete }: { isOpen: boolean; onComplete: () => void }) {
  const [step, setStep] = useState(1)
  const [profile, setProfile] = useLocalStorage<ProfileData>('fantaros-profile', DEFAULT_PROFILE)
  const [config, setConfig] = useLocalStorage<ServiceConfig>('fantaros-config', DEFAULT_CONFIG)
  
  const [formData, setFormData] = useState<ProfileData>(profile)
  const [configData, setConfigData] = useState<ServiceConfig>(config)

  const totalSteps = 3

  const handleNext = () => {
    hapticFeedback('light')
    if (step < totalSteps) {
      setStep(step + 1)
    } else {
      // Final save
      setProfile(formData)
      setConfig(configData)
      localStorage.setItem('onboarding-completed', 'true')
      hapticFeedback('heavy')
      onComplete()
    }
  }

  const handleBack = () => {
    hapticFeedback('light')
    if (step > 1) {
      setStep(step - 1)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md border-primary/20 bg-zinc-950 text-zinc-100 p-0 overflow-hidden" showCloseButton={false}>
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-zinc-900">
          <div 
            className="h-full bg-primary transition-all duration-300 ease-out" 
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>

        <div className="p-6 pt-8">
          <DialogHeader className="items-center text-center mb-6">
            <div className="mb-2 flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
              {step === 1 && <User className="w-6 h-6" />}
              {step === 2 && <Calendar className="w-6 h-6" />}
              {step === 3 && <Shield className="w-6 h-6" />}
            </div>
            <DialogTitle className="text-xl font-bold">
              {step === 1 && 'Προσωπικά Στοιχεία'}
              {step === 2 && 'Στοιχεία Θητείας'}
              {step === 3 && 'Στρατιωτικά Στοιχεία'}
            </DialogTitle>
            <DialogDescription className="text-zinc-400 text-xs">
              Βήμα {step} από {totalSteps}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 min-h-[280px]">
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Ονοματεπώνυμο</label>
                  <Input 
                    placeholder="π.χ. Ιωάννης Παπαδόπουλος" 
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="bg-zinc-900 border-zinc-800 h-12 rounded-xl focus:ring-primary/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Αριθμός Μητρώου (ΑΣΜ)</label>
                  <Input 
                    placeholder="π.χ. 123/4567/24" 
                    value={formData.serviceNumber}
                    onChange={(e) => setFormData({ ...formData, serviceNumber: e.target.value })}
                    className="bg-zinc-900 border-zinc-800 h-12 rounded-xl focus:ring-primary/50"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Ημερομηνία Κατάταξης</label>
                  <GreekDatePicker
                    value={configData.enlistmentDate}
                    onChange={(d) => setConfigData({ ...configData, enlistmentDate: d })}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Διάρκεια Θητείας</label>
                  <div className="grid grid-cols-3 gap-2">
                    {SERVICE_DURATION_PRESETS.map((preset) => (
                      <button
                        key={preset.days}
                        onClick={() => {
                          hapticFeedback('light')
                          setConfigData({ ...configData, totalDays: preset.days })
                        }}
                        className={cn(
                          "py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border",
                          configData.totalDays === preset.days
                            ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                            : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700"
                        )}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Λόχος</label>
                    <Input 
                      placeholder="π.χ. 1ος" 
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="bg-zinc-900 border-zinc-800 h-12 rounded-xl focus:ring-primary/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Θάλαμος</label>
                    <Input 
                      placeholder="π.χ. 102" 
                      value={formData.barracks}
                      onChange={(e) => setFormData({ ...formData, barracks: e.target.value })}
                      className="bg-zinc-900 border-zinc-800 h-12 rounded-xl focus:ring-primary/50"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Βαθμός</label>
                  <select 
                    className="w-full bg-zinc-900 border-zinc-800 h-12 rounded-xl px-3 text-sm focus:ring-primary/50 outline-none border"
                    value={formData.rank}
                    onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                  >
                    {RANKS.map(rank => (
                      <option key={rank} value={rank}>{rank}</option>
                    ))}
                  </select>
                </div>
                <div className="bg-primary/5 border border-primary/10 rounded-xl p-3 flex items-start gap-3 mt-2">
                  <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-[10px] text-zinc-400 leading-relaxed">
                    Μπορείτε να επεξεργαστείτε αυτά τα στοιχεία ανά πάσα στιγμή από την καρτέλα "Προφίλ".
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex-row gap-3 mt-8">
            {step > 1 && (
              <Button 
                variant="outline" 
                onClick={handleBack}
                className="flex-1 bg-transparent border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100 h-12 rounded-xl"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Πίσω
              </Button>
            )}
            <Button 
              onClick={handleNext}
              className="flex-[2] bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-12 rounded-xl shadow-lg shadow-primary/20"
            >
              {step === totalSteps ? 'Ολοκλήρωση' : 'Επόμενο'}
              {step < totalSteps && <ChevronRight className="w-4 h-4 ml-2" />}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
