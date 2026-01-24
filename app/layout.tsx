import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ATS Checker - Premium Resume Analysis',
  description: 'Analyze your resume against job descriptions with AI-powered insights',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
