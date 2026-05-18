import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { Providers } from '@/components/Providers';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: {
    default: 'Skinlar Bozori SB — CS2 skinlari bozori',
    template: '%s — Skinlar Bozori SB',
  },
  description:
    'CS2 skinlari uchun premium bozor: qidiruv, filtrlar, savat va buyurtmalar. Skinlar Bozori SB.',
  icons: {
    icon: '/logo.jpg',
    apple: '/logo.jpg',
  },
  openGraph: {
    title: 'Skinlar Bozori SB',
    description: 'Premium CS2 skins marketplace — Oʻzbekcha interfeys.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" className={inter.variable}>
      <body className="flex min-h-screen flex-col font-sans">
        <Providers>
          <SiteHeader />
          <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">{children}</main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
