'use client'

import { useEffect, useState } from 'react'
import { useMotionValue, useTransform, motion } from 'framer-motion'

interface CounterProps {
  value: number
  duration?: number
}

export function Counter({ value, duration = 1.5 }: CounterProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const motionValue = useMotionValue(0)
  const rounded = useTransform(motionValue, (latest) => Math.round(latest))

  useEffect(() => {
    const controls = motionValue.animate(value, {
      duration,
      ease: 'easeOut',
    })

    return () => controls.stop()
  }, [value, motionValue, duration])

  useEffect(() => {
    const unsubscribe = rounded.onChange((latest) => {
      setDisplayValue(latest)
    })

    return () => unsubscribe()
  }, [rounded])

  return <span>{displayValue}</span>
}
