'use client'

import { useEffect, useState } from 'react'
import { useMotionValue, useTransform, motion } from 'framer-motion'

interface CounterProps {
  value: number
  duration?: number
}

export function Counter({ value, duration = 1.5 }: CounterProps) {
  const [isVisible, setIsVisible] = useState(false)
  const motionValue = useMotionValue(0)
  const rounded = useTransform(motionValue, (latest) => Math.round(latest))

  useEffect(() => {
    setIsVisible(true)
  }, [])

  useEffect(() => {
    if (!isVisible) return

    const controls = motionValue.animate(value, {
      duration,
      ease: 'easeOut',
    })

    return () => controls.stop()
  }, [value, isVisible, motionValue, duration])

  return <motion.span>{rounded}</motion.span>
}
