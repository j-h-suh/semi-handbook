'use client';

import Link from 'next/link';
import { BookOpen, Cpu, TrendingUp, Terminal } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { BOOKS, type Book, type IconName, type AccentName, type BookMeta } from '@/lib/books';

const ICON_MAP: Record<IconName, LucideIcon> = {
    'cpu': Cpu,
    'trending-up': TrendingUp,
    'terminal': Terminal,
};

// Tailwind safelist 회피 — 단일 시그니처 Mintlify brand-green #00d4a4 .
const ACCENT_CLASSES: Record<AccentName, {
    cardBorder: string;
    cardBg: string;
    cardHoverBg: string;
    cardHoverBorder: string;
    iconBg: string;
    iconBorder: string;
    iconText: string;
    linkText: string;
}> = {
    green: {
        cardBorder: 'border-[#00d4a4]/15',
        cardBg: 'bg-[#00d4a4]/[0.03]',
        cardHoverBg: 'hover:bg-[#00d4a4]/[0.06]',
        cardHoverBorder: 'hover:border-[#00d4a4]/30',
        iconBg: 'bg-[#00d4a4]/10',
        iconBorder: 'border-[#00d4a4]/20',
        iconText: 'text-[#00d4a4]',
        linkText: 'text-[#00d4a4]',
    },
};

interface Props {
    bookMetas: Record<Book, string>;  // 각 책별 카드 footer 문자열 (예: "32개 챕터 · 120개 용어")
}

function BookRow({ book, meta }: { book: BookMeta; meta: string }) {
    const Icon = ICON_MAP[book.iconKey];
    const c = ACCENT_CLASSES[book.accent];
    return (
        <Link
            href={book.landingHref}
            className={`group flex items-center gap-4 p-5 rounded-2xl border ${c.cardBorder} ${c.cardBg} ${c.cardHoverBg} ${c.cardHoverBorder} transition-all`}
        >
            <div className={`w-12 h-12 rounded-xl ${c.iconBg} border ${c.iconBorder} flex items-center justify-center ${c.iconText} shrink-0`}>
                <Icon size={24} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-1 flex-wrap">
                    <h2 className="text-lg font-bold text-white">{book.fullLabel}</h2>
                    <p className="text-xs text-zinc-500">{book.subtitle}</p>
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed">
                    {book.description}
                </p>
                <span className="text-xs text-zinc-600">{meta}</span>
            </div>
        </Link>
    );
}

export default function HomeClient({ bookMetas }: Props) {
    return (
        <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 w-full">
            <div className="min-h-full flex flex-col justify-center">
                <div className="max-w-4xl mx-auto w-full px-4 py-8 md:px-8 md:py-16 lg:px-12">

                {/* Hero */}
                <div className="text-center mb-12 md:mb-16">
                    <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-[#00d4a4]/10 border border-[#00d4a4]/20 text-[#00d4a4] mb-6">
                        <BookOpen size={32} className="md:w-9 md:h-9" />
                    </div>
                    <h1 className="text-4xl font-extrabold text-white sm:text-5xl md:text-6xl mb-6 leading-snug">
                        반도체를 여행하는<br />
                        세미에이아이를 위한<br />
                        <span className="bg-gradient-to-r from-[#00d4a4] to-[#7cebcb] bg-clip-text text-transparent">
                            핸드북 시리즈
                        </span>
                    </h1>
                    <p className="text-lg text-zinc-500 max-w-xl mx-auto">
                        기술과 제품을 만드는 모두를 위한 핸드북 시리즈
                    </p>
                </div>

                {/* Book Rows — 세로 리스트, N 핸드북 자연 확장 */}
                <div className="flex flex-col gap-3 mb-12">
                    {BOOKS.map((book) => (
                        <BookRow key={book.id} book={book} meta={bookMetas[book.id]} />
                    ))}
                </div>

                </div>
            </div>
        </div>
    );
}
