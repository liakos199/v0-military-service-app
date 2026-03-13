'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [primaryColor, setPrimaryColor] = React.useState<string | null>(null)

  React.useEffect(() => {
    // Load saved color from localStorage
    const savedColor = localStorage.getItem('app-primary-color')
    if (savedColor) {
      setPrimaryColor(savedColor)
      document.documentElement.style.setProperty('--primary', savedColor)
      document.documentElement.style.setProperty('--ring', savedColor)
      document.documentElement.style.setProperty('--glass-highlight', savedColor)
      
      // Update sidebar and other related variables if they use the primary color
      document.documentElement.style.setProperty('--sidebar-primary', savedColor)
      document.documentElement.style.setProperty('--sidebar-ring', savedColor)
    }

    // Listen for custom events to update the color dynamically
    const handleColorChange = (e: CustomEvent<string>) => {
      const newColor = e.detail
      setPrimaryColor(newColor)
      document.documentElement.style.setProperty('--primary', newColor)
      document.documentElement.style.setProperty('--ring', newColor)
      document.documentElement.style.setProperty('--glass-highlight', newColor)
      document.documentElement.style.setProperty('--sidebar-primary', newColor)
      document.documentElement.style.setProperty('--sidebar-ring', newColor)
      localStorage.setItem('app-primary-color', newColor)
    }

    window.addEventListener('app-color-change' as any, handleColorChange as any)
    return () => {
      window.removeEventListener('app-color-change' as any, handleColorChange as any)
    }
  }, [])

  return (
    <NextThemesProvider {...props}>
      {children}
    </NextThemesProvider>
  )
}
