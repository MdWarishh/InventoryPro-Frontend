import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { QueryProvider } from '@/components/shared/QueryProvider'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'InvenTrack Pro — Inventory Management System',
  description: 'Multi-branch inventory management system',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Toaster position="top-right" theme="dark" richColors />
            {children}
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  )
}