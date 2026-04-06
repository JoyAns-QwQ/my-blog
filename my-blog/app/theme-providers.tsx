'use client'

import { ThemeProvider } from 'next-themes'
import siteMetadata from '@/data/siteMetadata'
import { LayoutGroup } from 'framer-motion'

export function ThemeProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme={siteMetadata.theme} enableSystem>
      <LayoutGroup>
        {children}
      </LayoutGroup>
    </ThemeProvider>
  )
}