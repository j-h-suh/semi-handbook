import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import 'katex/dist/katex.min.css';
import ClientLayout from '@/components/ClientLayout';
import { buildSearchData } from '@/lib/searchIndex';
import { getSortedChapters } from '@/lib/markdown';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '반도체를 여행하는 세미에이아이를 위한 핸드북 시리즈',
  description: 'Semiconductor & Statistics Handbook for AI/ML Engineers',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const semiChapters = getSortedChapters('semi');
  const statsChapters = getSortedChapters('stats');
  const claudeChapters = getSortedChapters('claude');
  const execChapters = getSortedChapters('exec');

  return (
    <html lang="ko" className="dark">
      <body className={`${inter.className} bg-slate-950 text-slate-200 antialiased overflow-hidden selection:bg-cyan-500/30`}>
        {/* Main Application Container */}
        <div className="flex h-screen w-screen overflow-hidden">
          <ClientLayout searchData={buildSearchData()} semiChapters={semiChapters} statsChapters={statsChapters} claudeChapters={claudeChapters} execChapters={execChapters}>
            {children}
          </ClientLayout>
        </div>
      </body>
    </html>
  );
}
