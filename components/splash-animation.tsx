'use client'

import { motion } from 'framer-motion'

export function SplashAnimation() {
  const logoSize = 180

  return (
    <div className="relative w-80 h-80 flex items-center justify-center">
      {/* God Rays (Rotating soft light beams) */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 z-0 pointer-events-none opacity-40"
      >
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <defs>
            <radialGradient id="rayGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </radialGradient>
          </defs>
          {[...Array(12)].map((_, i) => (
            <path
              key={i}
              d={`M100,100 L${100 + 100 * Math.cos((i * 30 * Math.PI) / 180)},${100 + 100 * Math.sin((i * 30 * Math.PI) / 180)} L${100 + 100 * Math.cos(((i * 30 + 15) * Math.PI) / 180)},${100 + 100 * Math.sin(((i * 30 + 15) * Math.PI) / 180)} Z`}
              fill="url(#rayGradient)"
              className="origin-center"
            />
          ))}
        </svg>
      </motion.div>

      {/* Main Logo & Shine Implementation (SVG based for perfect masking) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10"
      >
        <svg 
          width={logoSize} 
          height={logoSize} 
          viewBox={`0 0 ${logoSize} ${logoSize}`}
          className="drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-visible"
        >
          <defs>
            {/* The primary mask created from the logo alpha */}
            <mask id="logo-shine-mask">
              <image 
                href="/icon-512.png" 
                width={logoSize} 
                height={logoSize} 
                className="brightness-200" 
              />
            </mask>

            <linearGradient id="shine-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="40%" stopColor="#ffffff" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#ffffff" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Base Logo Layer */}
          <image href="/icon-512.png" width={logoSize} height={logoSize} />

          {/* Masked Shine Layer */}
          <g mask="url(#logo-shine-mask)">
            <motion.rect
              width={logoSize * 3}
              height={logoSize * 3}
              fill="url(#shine-gradient)"
              initial={{ x: -logoSize * 2, y: -logoSize, rotate: 35 }}
              animate={{ x: logoSize * 1.5, y: logoSize, rotate: 35 }}
              transition={{
                duration: 1.5,
                delay: 0.5,
                repeat: Infinity,
                repeatDelay: 2,
                ease: "easeInOut"
              }}
              style={{ originX: "50%", originY: "50%" }}
            />
          </g>
        </svg>
      </motion.div>
    </div>
  )
}
