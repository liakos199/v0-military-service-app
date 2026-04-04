'use client'

import { motion } from 'framer-motion'

export function FooterSignature() {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] font-bold tracking-[0.2em] text-zinc-600 uppercase">
        MADE BY
      </span>
      
      <div className="relative flex items-center justify-center">
        <svg 
          width="48" 
          height="24" 
          viewBox="0 0 48 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]"
        >
          {/* H */}
          <motion.path
            d="M6 4V20M6 12H16M16 4V20"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.2, delay: 1, ease: "easeInOut" }}
          />
          {/* Dot after H */}
          <motion.circle
            cx="19"
            cy="20"
            r="1.5"
            fill="#10b981"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 2.2, duration: 0.3 }}
          />
          
          {/* Π (Pi) */}
          <motion.path
            d="M26 20V4H38V20"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.2, delay: 1.4, ease: "easeInOut" }}
          />
          {/* Dot after Π */}
          <motion.circle
            cx="41"
            cy="20"
            r="1.5"
            fill="#10b981"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 2.6, duration: 0.3 }}
          />
        </svg>

        {/* Subtle breathing glow behind initials */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full z-[-1]"
        />
      </div>
    </div>
  )
}
