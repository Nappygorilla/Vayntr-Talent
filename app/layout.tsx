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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600;12..96,700;12..96,800&family=DM+Mono:wght@400;500&family=Manrope:wght@400;500;600;700;800&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
