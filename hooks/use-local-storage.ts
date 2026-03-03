'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Custom event name used to sync localStorage changes across
 * multiple hook instances within the *same* browser tab.
 * The native `storage` event only fires in *other* tabs.
 */
const LOCAL_STORAGE_SYNC_EVENT = 'fantaros-ls-sync'

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue)
  const [isLoaded, setIsLoaded] = useState(false)
  // Track our own writes so we can ignore our own sync events
  const selfWrite = useRef(false)

  // Initial read
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (item) {
        setStoredValue(JSON.parse(item))
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
    }
    setIsLoaded(true)
  }, [key])

  // Listen for changes from other hook instances (same tab) and other tabs
  useEffect(() => {
    const handleSync = (e: Event) => {
      if (selfWrite.current) {
        selfWrite.current = false
        return
      }
      const detail = (e as CustomEvent).detail
      if (detail?.key !== key) return
      try {
        const item = window.localStorage.getItem(key)
        if (item) {
          setStoredValue(JSON.parse(item))
        }
      } catch (error) {
        console.error(`Error syncing localStorage key "${key}":`, error)
      }
    }

    // Other-tab sync
    const handleStorage = (e: StorageEvent) => {
      if (e.key !== key || e.newValue === null) return
      try {
        setStoredValue(JSON.parse(e.newValue))
      } catch (error) {
        console.error(`Error syncing localStorage key "${key}":`, error)
      }
    }

    window.addEventListener(LOCAL_STORAGE_SYNC_EVENT, handleSync)
    window.addEventListener('storage', handleStorage)
    return () => {
      window.removeEventListener(LOCAL_STORAGE_SYNC_EVENT, handleSync)
      window.removeEventListener('storage', handleStorage)
    }
  }, [key])

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        setStoredValue((prev) => {
          const valueToStore = value instanceof Function ? value(prev) : value
          window.localStorage.setItem(key, JSON.stringify(valueToStore))
          // Notify other hook instances in the same tab
          selfWrite.current = true
          window.dispatchEvent(
            new CustomEvent(LOCAL_STORAGE_SYNC_EVENT, { detail: { key } })
          )
          return valueToStore
        })
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error)
      }
    },
    [key]
  )

  return [storedValue, setValue, isLoaded] as const
}
