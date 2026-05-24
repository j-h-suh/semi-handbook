#!/usr/bin/env node
// stats / claude entries 자리 → chapter context + claude-opus-4-7 자리 결로 정의 자동 생성
import fs from 'fs';
import path from 'path';
import { AnthropicVertex } from '@anthropic-ai/vertex-sdk';

const ROOT = '/Users/jenghun.suh/projects/semi-handbook/.claude/worktrees/phase-43-ai-definitions';
const OUT = '/Users/jenghun.suh/.claude/jobs/bfb20354/defs.jsonl';
const CONCURRENCY = 5;

const projectId = process.env.GOOGLE_CLOUD_PROJECT;
if (!projectId) {
    console.error('GOOGLE_CLOUD_PROJECT 자리 미설정');
    process.exit(1);
}

const client = new AnthropicVertex({
    projectId,
    region: 'global',
    baseURL: 'https://aiplatform.googleapis.com/v1',
});

// glossary.ts 자리 자리 entries 추출
const glossaryRaw = fs.readFileSync(path.join(ROOT, 'src/lib/glossary.ts'), 'utf-8');
const ENTRY_RE = /\{ book: '(stats|claude)', term: '([^']+)'(?:, abbr: '([^']+)')?, definition: '[^']*', chapters: \[([^\]]+)\], category: '[^']+' \}/g;

const entries = [];
let m;
while ((m = ENTRY_RE.exec(glossaryRaw)) !== null) {
    const [, book, term, abbr, chaptersRaw] = m;
    const chapters = chaptersRaw.split(',').map((s) => s.trim().replace(/'/g, ''));
    entries.push({ book, term, abbr: abbr || null, chapters });
}

console.error(`총 ${entries.length} entries`);

function findContext(entry) {
    const chapter = entry.chapters[0];
    const [n, mm] = chapter.split('.');
    const dir = path.join(ROOT, entry.book === 'stats' ? 'content/stats' : 'content/claude_code');
    const files = fs.readdirSync(dir);
    const matchFile = files.find((f) => f.startsWith(`${n.padStart(2, '0')}_${mm.padStart(2, '0')}_`));
    if (!matchFile) return '';
    const txt = fs.readFileSync(path.join(dir, matchFile), 'utf-8');
    const idx = txt.indexOf(`**${entry.term}`);
    if (idx >= 0) {
        return txt.slice(Math.max(0, idx - 200), Math.min(txt.length, idx + 800));
    }
    return txt.slice(0, 1200);
}

async function generateDef(entry) {
    const context = findContext(entry);
    const termDisplay = entry.abbr ? `${entry.term} (${entry.abbr})` : entry.term;
    const prompt = `다음은 핸드북 본문의 일부입니다:

\`\`\`
${context}
\`\`\`

위 본문에서 **${termDisplay}** 라는 용어의 정의를 한 문장 (1-2 줄 이내) 으로 작성해주세요. 본문에서 핵심만 추출하고, "~이다." / "~한다." 결로 종결하세요. 마크다운 자리 (**bold**) 자리 사용하지 말고, 평문 결로만 작성. 추가 설명 없이 정의 한 줄만 응답.`;

    const res = await client.messages.create({
        model: 'claude-opus-4-7',
        max_tokens: 200,
        system: '너는 기술 용어 사전을 작성하는 전문가야. 정확하고 간결한 한 줄 정의를 한국어로 작성해.',
        messages: [{ role: 'user', content: prompt }],
    });
    const text = res.content
        .filter((b) => b.type === 'text')
        .map((b) => b.text)
        .join('')
        .trim();
    return text;
}

// 기존 결과 자리 자리 read 결로 재개 가능
let done = new Set();
if (fs.existsSync(OUT)) {
    const lines = fs.readFileSync(OUT, 'utf-8').split('\n').filter(Boolean);
    for (const l of lines) {
        try {
            const obj = JSON.parse(l);
            done.add(`${obj.book}::${obj.term}`);
        } catch { }
    }
    console.error(`기존 ${done.size} entries 자리 자리 완료 자리, 재개`);
}

const todo = entries.filter((e) => !done.has(`${e.book}::${e.term}`));
console.error(`처리 자리 ${todo.length} entries (concurrency=${CONCURRENCY})`);

const out = fs.createWriteStream(OUT, { flags: 'a' });

let processed = 0;
async function worker(slice) {
    for (const entry of slice) {
        try {
            const definition = await generateDef(entry);
            const result = { ...entry, definition };
            out.write(JSON.stringify(result) + '\n');
            processed++;
            console.error(`[${processed}/${todo.length}] ${entry.book} ${entry.term} → ${definition.slice(0, 60)}...`);
        } catch (err) {
            console.error(`[ERR] ${entry.book} ${entry.term}: ${err.message}`);
        }
    }
}

// 자리 자리 자리 자리 자리 _round-robin_ 결로 split
const slices = Array.from({ length: CONCURRENCY }, () => []);
todo.forEach((e, i) => slices[i % CONCURRENCY].push(e));
await Promise.all(slices.map(worker));

out.end();
console.error(`완료 — ${OUT} 자리 자리 저장`);
