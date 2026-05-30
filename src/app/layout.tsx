import type { Metadata } from 'next';
import { Inter, Geist_Mono } from 'next/font/google';
import './globals.css';
import 'katex/dist/katex.min.css';
import ClientLayout from '@/components/ClientLayout';
import { buildSearchData } from '@/lib/searchIndex';
import { getSortedChapters, type ChapterMeta } from '@/lib/markdown';
import { BOOKS, type Book } from '@/lib/books';

const inter = Inter({ subsets: ['latin'] });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' });

export const metadata: Metadata = {
  title: '반도체를 여행하는 SemiAI를 위한 핸드북 시리즈',
  description: 'Semiconductor & Statistics Handbook for AI/ML Engineers',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 각 책의 챕터 — 09_0 학습자 환경 설정은 일반 챕터로 자동 등록
  const chaptersByBook: Record<Book, ChapterMeta[]> = Object.fromEntries(
    BOOKS.map((b) => [b.id, getSortedChapters(b.id)]),
  ) as Record<Book, ChapterMeta[]>;

  return (
    <html lang="ko" className="dark">
      <body className={`${inter.className} ${geistMono.variable} bg-zinc-950 text-zinc-200 antialiased overflow-hidden selection:bg-[#00d4a4]/30`}>
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
