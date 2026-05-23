'use client';

import Link from 'next/link';
import { BookOpen, ArrowRight, Cpu, TrendingUp, Terminal } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { BOOKS, type Book, type IconName, type AccentName, type BookConfig } from '@/lib/markdown';

const ICON_MAP: Record<IconName, LucideIcon> = {
    'cpu': Cpu,
    'trending-up': TrendingUp,
    'terminal': Terminal,
};

// Tailwind safelist 회피 — 모든 클래스 문자열을 _완전한 형태_ 로 명시.
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
    cyan: {
        cardBorder: 'border-cyan-500/10',
        cardBg: 'bg-cyan-500/[0.03]',
        cardHoverBg: 'hover:bg-cyan-500/[0.06]',
        cardHoverBorder: 'hover:border-cyan-500/25',
        iconBg: 'bg-cyan-500/10',
        iconBorder: 'border-cyan-500/20',
        iconText: 'text-cyan-400',
        linkText: 'text-cyan-400',
    },
    emerald: {
        cardBorder: 'border-emerald-500/10',
        cardBg: 'bg-emerald-500/[0.03]',
        cardHoverBg: 'hover:bg-emerald-500/[0.06]',
        cardHoverBorder: 'hover:border-emerald-500/25',
        iconBg: 'bg-emerald-500/10',
        iconBorder: 'border-emerald-500/20',
        iconText: 'text-emerald-400',
        linkText: 'text-emerald-400',
    },
    violet: {
        cardBorder: 'border-violet-500/10',
        cardBg: 'bg-violet-500/[0.03]',
        cardHoverBg: 'hover:bg-violet-500/[0.06]',
        cardHoverBorder: 'hover:border-violet-500/25',
        iconBg: 'bg-violet-500/10',
        iconBorder: 'border-violet-500/20',
        iconText: 'text-violet-400',
        linkText: 'text-violet-400',
    },
};

interface Props {
    bookMetas: Record<Book, string>;  // 각 책별 카드 footer 문자열 (예: "32개 챕터 · 120개 용어")
}

function BookRow({ book, meta }: { book: BookConfig; meta: string }) {
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
                    <p className="text-xs text-slate-500">{book.subtitle}</p>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">
                    {book.description}
                </p>
                <span className="text-xs text-slate-600">{meta}</span>
            </div>
            <span className={`text-sm ${c.linkText} group-hover:translate-x-1 transition-transform flex items-center gap-1 shrink-0`}>
                읽기 <ArrowRight size={14} />
            </span>
        </Link>
    );
}

export default function HomeClient({ bookMetas }: Props) {
    return (
        <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 w-full">
            <div className="min-h-full flex flex-col justify-center">
                <div className="max-w-3xl mx-auto w-full px-4 py-8 md:px-8 md:py-16 lg:px-12">

                {/* Hero */}
                <div className="text-center mb-12 md:mb-16">
                    <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-6">
                        <BookOpen size={32} className="md:w-9 md:h-9" />
                    </div>
                    <h1 className="text-4xl font-extrabold text-white sm:text-5xl md:text-6xl mb-6 leading-snug">
                        반도체를 여행하는<br />
                        세미에이아이를 위한<br />
                        <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                            핸드북 시리즈
                        </span>
                    </h1>
                    <p className="text-lg text-slate-500 max-w-xl mx-auto">
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
