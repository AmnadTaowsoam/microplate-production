//src/app/layout.tsx
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import '@/styles/globals.css';
import ThemeRegistry from '@/components/providers/ThemeRegistry';
import Layout from '@/components/layout/Layout';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  weight: ['400'],
});

export const metadata: Metadata = {
  title: 'Microplate AI System',
  description: 'Microplate AI System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ThemeRegistry>
          <Layout>{children}</Layout>
        </ThemeRegistry>
      </body>
    </html>
  );
}
