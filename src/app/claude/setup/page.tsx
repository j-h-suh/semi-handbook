import { getMiniClaudeSetupData } from '@/lib/markdown';
import MarkdownViewer from '@/components/MarkdownViewer';

export default async function ClaudeSetupPage() {
    const data = await getMiniClaudeSetupData();

    return (
        <main className="flex-1 w-full flex overflow-hidden relative">
            <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 w-full">
                <MarkdownViewer
                    title={data.title}
                    content={data.content}
                    lastUpdated={data.lastUpdated}
                    commitHistory={data.commitHistory}
                />
            </div>

            <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        </main>
    );
}
