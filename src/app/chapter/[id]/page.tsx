import { getChapterData, getSortedChaptersData } from '@/lib/markdown';
import Sidebar from '@/components/Sidebar';
import MarkdownViewer from '@/components/MarkdownViewer';
import SetDocumentContext from '@/components/SetDocumentContext';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export async function generateStaticParams() {
    const chapters = getSortedChaptersData();
    return chapters.map(c => ({ id: c.id }));
}

export default async function ChapterPage({ params }: { params: { id: string } }) {
    const { id: rawId } = await params;
    const id = decodeURIComponent(rawId);
    const chapterData = await getChapterData(id);
    const allChapters = getSortedChaptersData();

    const currentIndex = allChapters.findIndex(c => c.id === id);
    const prevChapter = currentIndex > 0 ? allChapters[currentIndex - 1] : null;
    const nextChapter = currentIndex >= 0 && currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : null;

    return (
        <>
            <Sidebar chapters={allChapters} />

            <main className="flex-1 w-full flex overflow-hidden relative">
                {/* Scrollable Document Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 w-full">
                    <MarkdownViewer
                        title={chapterData.title}
                        content={chapterData.content}
                    />

                    {/* Navigation Links */}
                    <div className="max-w-4xl mx-auto w-full px-8 py-12 lg:px-12 flex items-center justify-between border-t border-white/10 mt-8 mb-16">
                        {prevChapter ? (
                            <Link href={`/chapter/${prevChapter.id}`} className="group flex flex-col items-start gap-2 p-4 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all w-[48%] max-w-[320px]">
                                <span className="flex items-center gap-2 text-sm text-slate-400 group-hover:text-cyan-400 transition-colors">
                                    <ArrowLeft size={16} /> 이전 챕터
                                </span>
                                <span className="font-medium text-slate-200 line-clamp-2">{prevChapter.title}</span>
                            </Link>
                        ) : (
                            <div className="w-[48%] max-w-[320px]" />
                        )}

                        {nextChapter ? (
                            <Link href={`/chapter/${nextChapter.id}`} className="group flex flex-col items-end gap-2 p-4 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all w-[48%] max-w-[320px] text-right">
                                <span className="flex items-center gap-2 text-sm text-slate-400 group-hover:text-cyan-400 transition-colors">
                                    다음 챕터 <ArrowRight size={16} />
                                </span>
                                <span className="font-medium text-slate-200 line-clamp-2">{nextChapter.title}</span>
                            </Link>
                        ) : (
                            <div className="w-[48%] max-w-[320px]" />
                        )}
                    </div>
                </div>

                {/* Background glow effects */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            </main>

            {/* Set document context for QnA panel (rendered at layout level) */}
            <SetDocumentContext context={chapterData.content} />
        </>
    );
}
