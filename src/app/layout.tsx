import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/Sidebar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Shopify Budget Manager',
  description: 'Control limits and budgets for your Shopify B2B/B2C store',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl" className="h-full antialiased dark">
      <body className={`${inter.className} h-full bg-[#09090b] text-slate-200`}>
        <div className="flex h-full">
          {/* Static sidebar for desktop */}
          <div className="hidden md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 relative z-50">
            <Sidebar />
          </div>

          <main className="md:pl-72 flex-1 relative flex flex-col pt-8 pb-12 overflow-y-auto">
            <div className="px-4 sm:px-6 md:px-8 max-w-7xl mx-auto w-full">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
