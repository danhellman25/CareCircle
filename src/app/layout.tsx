import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'CareCircle - Family Care Coordination Made Simple',
  description: 'The simple, affordable way for families to coordinate care for aging parents. Medication tracking, schedules, and care logs—all in one place.',
  keywords: 'caregiving, family care, medication tracking, caregiver schedule, elderly care',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
