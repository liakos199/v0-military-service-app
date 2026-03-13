'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [primaryColor, setPrimaryColor] = React.useState<string | null>(null)

  const updateColors = (color: string) => {
    const root = document.documentElement
    root.style.setProperty('--primary', color)
    root.style.setProperty('--ring', color)
    root.style.setProperty('--glass-highlight', color)
    root.style.setProperty('--sidebar-primary', color)
    root.style.setProperty('--sidebar-ring', color)
    
    // Also update the glass-card-highlight background if it's used
    const style = document.createElement('style')
    style.id = 'dynamic-primary-color'
    style.innerHTML = `
      .glass-card-highlight {
        background: ${color} !important;
        border-color: ${color} !important;
      }
      .bg-primary {
        background-color: ${color} !important;
      }
      .text-primary {
        color: ${color} !important;
      }
      .border-primary {
        border-color: ${color} !important;
      }
    `
    const existingStyle = document.getElementById('dynamic-primary-color')
    if (existingStyle) {
      existingStyle.remove()
    }
    document.head.appendChild(style)
  }

  React.useEffect(() => {
    // Load saved color from localStorage
    const savedColor = localStorage.getItem('app-primary-color')
    if (savedColor) {
      setPrimaryColor(savedColor)
      updateColors(savedColor)
    }

    // Listen for custom events to update the color dynamically
    const handleColorChange = (e: CustomEvent<string>) => {
      const newColor = e.detail
      setPrimaryColor(newColor)
      updateColors(newColor)
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
