import type { ReactNode } from 'react'
import { Space_Grotesk } from 'next/font/google'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata = {
  title: 'MirrorMind',
  description: 'AI-powered interview coach — practice with real-time feedback',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.className} bg-[#070B14] text-white antialiased`}>
        {children}
      </body>
    </html>
  )
}