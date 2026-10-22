import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import './globals.css'

export const metadata: Metadata = {
  title: 'VAYNTR Talent — Find your place in the game',
  description:
    'Discover esports and creator opportunities with clear terms, candidate control, and safety-first guidance. VAYNTR Talent is currently a demo.',
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
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
