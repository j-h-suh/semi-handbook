import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import 'katex/dist/katex.min.css';
import ClientLayout from '@/components/ClientLayout';
import { buildSearchData } from '@/lib/searchIndex';
import { BOOKS, getSortedChapters, getSortedClaudeChaptersWithSetup, type Book, type ChapterMeta } from '@/lib/markdown';

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
  // 각 책의 챕터 — claude 만 SETUP.md (9.0) 합류, 나머지는 기본
  const chaptersByBook: Record<Book, ChapterMeta[]> = Object.fromEntries(
    BOOKS.map((b) => [
      b.id,
      b.id === 'claude' ? getSortedClaudeChaptersWithSetup() : getSortedChapters(b.id),
    ]),
  ) as Record<Book, ChapterMeta[]>;

  return (
    <html lang="ko" className="dark">
      <body className={`${inter.className} bg-slate-950 text-slate-200 antialiased overflow-hidden selection:bg-cyan-500/30`}>
        {/* Main Application Container */}
        <div className="flex h-screen w-screen overflow-hidden">
          <ClientLayout searchData={buildSearchData()} chaptersByBook={chaptersByBook}>
            {children}
          </ClientLayout>
        </div>
      </body>
    </html>
  );
}
