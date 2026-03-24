import type { Metadata } from 'next' 
import { DM_Serif_Display, DM_Sans, JetBrains_Mono } from 'next/font/google' 
import { QueryProvider } from '@/components/providers/QueryProvider' 
import { Toaster } from '@/components/ui/sonner'
import './globals.css' 

const dmSerif = DM_Serif_Display({ 
  weight: ['400'], 
  subsets: ['latin'], 
  variable: '--font-display', 
}) 

const dmSans = DM_Sans({ 
  weight: ['400', '500'], 
  subsets: ['latin'], 
  variable: '--font-body', 
}) 

const jetbrainsMono = JetBrains_Mono({ 
  weight: ['400'], 
  subsets: ['latin'], 
  variable: '--font-mono', 
}) 

export const metadata: Metadata = { 
  title: { default: 'Sychar CoPilot', template: '%s — Sychar CoPilot' }, 
  description: 'Nkoroi Mixed Secondary Day School Management System', 
  icons: { 
    icon: '/favicon.svg',
  }, 
} 

export default function RootLayout({ children }: { children: React.ReactNode }) { 
  return ( 
    <html lang="en" className={`${dmSerif.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}> 
      <body className="antialiased"> 
        <QueryProvider>
          {children}
          <Toaster position="top-right" theme="dark" />
        </QueryProvider> 
      </body> 
    </html> 
  ) 
}
