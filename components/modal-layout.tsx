'use client'

import { ReactNode } from 'react'

interface ModalLayoutProps {
  /** Header content (title, back button, close button) */
  header: ReactNode
  /** Middle content (scrollable) */
  children: ReactNode
  /** Bottom action buttons */
  footer?: ReactNode
  /** Additional classes for the root container */
  className?: string
  /** Additional classes for the middle/content section */
  contentClassName?: string
}

/**
 * Standardized Modal Layout Component
 * 
 * Structure:
 * - Header: Fixed at top, non-scrollable
 * - Middle: Scrollable content area with overflow-y-auto
 * - Bottom: Fixed action buttons, non-scrollable
 * 
 * Usage:
 * <ModalLayout
 *   header={<YourHeader />}
 *   footer={<YourFooter />}
 * >
 *   Your scrollable content here
 * </ModalLayout>
 */
export function ModalLayout({
  header,
  children,
  footer,
  className = '',
  contentClassName = '',
}: ModalLayoutProps) {
  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header - Fixed at top */}
      <div className="shrink-0">
        {header}
      </div>

      {/* Middle - Scrollable content */}
      <div className={`flex-1 overflow-y-auto hide-scrollbar ${contentClassName}`}>
        {children}
      </div>

      {/* Bottom - Fixed action buttons */}
      {footer && (
        <div className="shrink-0">
          {footer}
        </div>
      )}
    </div>
  )
}
