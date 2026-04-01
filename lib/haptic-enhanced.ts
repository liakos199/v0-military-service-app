/**
 * Enhanced Haptic Feedback System for iOS Safari 18+ and Android
 * 
 * This module provides reliable haptic feedback across platforms:
 * - iOS Safari 18+: Uses input[type=checkbox switch] with label click
 * - Android: Uses navigator.vibrate() API
 * - Fallback: Silent fail for unsupported devices
 */

export type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error'

/**
 * Vibration patterns for Android devices (in milliseconds)
 * Format: [vibrate, pause, vibrate, pause, ...]
 */
export const hapticPatterns: Record<HapticType, number | number[]> = {
  light: 10,
  medium: 20,
  heavy: 40,
  success: [10, 50, 10],
  warning: [30, 50, 30],
  error: [50, 50, 50, 50, 50],
}

/**
 * Singleton instance to manage hidden switch inputs
 * This ensures we don't create multiple DOM elements
 */
class HapticManager {
  private static instance: HapticManager
  private switchInput: HTMLInputElement | null = null
  private switchLabel: HTMLLabelElement | null = null
  private isInitialized = false
  private isiOS = false

  private constructor() {
    this.detectPlatform()
  }

  static getInstance(): HapticManager {
    if (!HapticManager.instance) {
      HapticManager.instance = new HapticManager()
    }
    return HapticManager.instance
  }

  private detectPlatform(): void {
    if (typeof window === 'undefined') return
    
    const userAgent = navigator.userAgent.toLowerCase()
    this.isiOS = /iphone|ipad|ipod/.test(userAgent)
  }

  /**
   * Initialize the hidden switch input and label elements
   * These are required for iOS Safari 18+ haptic feedback
   */
  private initialize(): void {
    if (this.isInitialized || typeof document === 'undefined') return

    try {
      // Create hidden checkbox switch input
      this.switchInput = document.createElement('input')
      this.switchInput.type = 'checkbox'
      this.switchInput.id = 'haptic-switch-' + Date.now()
      this.switchInput.setAttribute('switch', '')
      this.switchInput.style.display = 'none'
      this.switchInput.style.visibility = 'hidden'
      this.switchInput.style.position = 'absolute'
      this.switchInput.style.pointerEvents = 'none'
      document.body.appendChild(this.switchInput)

      // Create associated label
      this.switchLabel = document.createElement('label')
      this.switchLabel.htmlFor = this.switchInput.id
      this.switchLabel.style.display = 'none'
      this.switchLabel.style.visibility = 'hidden'
      this.switchLabel.style.position = 'absolute'
      this.switchLabel.style.pointerEvents = 'none'
      document.body.appendChild(this.switchLabel)

      this.isInitialized = true
    } catch (error) {
      console.warn('Failed to initialize haptic feedback elements:', error)
    }
  }

  /**
   * Trigger haptic feedback using the appropriate method for the platform
   */
  trigger(type: HapticType = 'light'): void {
    if (typeof window === 'undefined') return

    try {
      if (this.isiOS) {
        // iOS Safari 18+: Use switch input click
        this.initialize()
        if (this.switchLabel) {
          this.switchLabel.click()
        }
      } else if ('vibrate' in navigator) {
        // Android and other devices: Use Vibration API
        const pattern = hapticPatterns[type]
        navigator.vibrate(pattern)
      }
    } catch (error) {
      // Silently fail - haptic feedback is not critical
      console.debug('Haptic feedback failed:', error)
    }
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.switchInput && this.switchInput.parentNode) {
      this.switchInput.parentNode.removeChild(this.switchInput)
    }
    if (this.switchLabel && this.switchLabel.parentNode) {
      this.switchLabel.parentNode.removeChild(this.switchLabel)
    }
    this.switchInput = null
    this.switchLabel = null
    this.isInitialized = false
  }
}

/**
 * Main function to trigger haptic feedback
 * This replaces the original hapticFeedback function with enhanced capabilities
 */
export function hapticFeedback(type: HapticType = 'light'): void {
  if (typeof window === 'undefined') return
  
  const manager = HapticManager.getInstance()
  manager.trigger(type)
}

/**
 * Alias for backward compatibility
 */
export const triggerHaptic = hapticFeedback

/**
 * React Hook for haptic feedback (optional, for components that need it)
 */
export function useHapticFeedback() {
  return {
    trigger: hapticFeedback,
    triggerHaptic: hapticFeedback,
  }
}

/**
 * Cleanup function to be called when the app unmounts
 */
export function cleanupHapticFeedback(): void {
  const manager = HapticManager.getInstance()
  manager.destroy()
}
