'use client'

import { useEffect, useState, useRef } from 'react'
import { animate } from 'framer-motion'

interface CounterProps {
  value: number
  duration?: number
  decimals?: number
}

export function Counter({ value, duration = 1.5, decimals = 0 }: CounterProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const prevValueRef = useRef(0)

  useEffect(() => {
    const controls = animate(prevValueRef.current, value, {
      duration,
      ease: 'easeOut',
      onUpdate: (latest) => {
        setDisplayValue(Number(latest.toFixed(decimals)))
      },
      onComplete: () => {
        prevValueRef.current = value
      }
    })
    return () => controls.stop()
  }, [value, duration, decimals])

  return <span>{displayValue.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })}</span>
}
