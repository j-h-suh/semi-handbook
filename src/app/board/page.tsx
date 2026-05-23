import BoardClient from '@/components/BoardClient';

export default function BoardPage() {
    return (
        <main className="flex-1 w-full flex overflow-hidden relative">
            <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 w-full">
                <BoardClient />
            </div>
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00d4a4]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#7cebcb]/8 rounded-full blur-3xl pointer-events-none" />
        </main>
    );
}
