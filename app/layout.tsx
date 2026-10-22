import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { Bricolage_Grotesque, DM_Mono, Manrope } from 'next/font/google'
import './globals.css'

// Fonts are downloaded at build time and served from this origin, so the page
// makes no request to a third-party font host and no visitor IP is sent there.
const display = Bricolage_Grotesque({ subsets: ['latin'], variable: '--font-display', display: 'swap' })
const body = Manrope({ subsets: ['latin'], variable: '--font-body', display: 'swap' })
const mono = DM_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-mono-brand', display: 'swap' })

export const metadata: Metadata = {
  title: 'VAYNTR Talent — Find your place in the game',
  description:
    'Players looking for an org and organizations looking for players. Every role lists its terms, and each game’s minimum age is checked against competition rules.',
  openGraph: {
    title: 'VAYNTR Talent — Find your place in the game',
    description:
      'A thoughtful way for esports organizations and creator teams to meet the people they need.',
    type: 'website',
  },
  icons: {
    icon: '/favicon.svg',
  },
}

export const viewport: Viewport = {
  themeColor: '#0a0a0c',
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
