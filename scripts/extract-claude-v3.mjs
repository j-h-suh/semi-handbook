#!/usr/bin/env node
// v3 — claude 자리 자리 **영어** 단독 패턴 자리 추가 추출
import fs from 'fs';
import path from 'path';

const ROOT = '/Users/jenghun.suh/projects/semi-handbook/.claude/worktrees/phase-44-claude-expand';

// **한국어(영어)** 패턴 (v2 와 동일)
const PATTERN_KR = /\*\*([가-힣A-Za-z0-9·\- ]+?)\s*\(([A-Za-z][A-Za-z0-9 \-,·\/.]*?)\)\*\*/g;

// **영어** 단독 패턴 — 이미 () 자리 자리 자리 제외
const PATTERN_ENG = /(?<!\()\*\*([A-Za-z][A-Za-z0-9 \-_/.]+?)\*\*(?!\s*\()/g;

// 일반 영어 단어 / 키워드 자리 자리 stopwords
const STOPWORDS = new Set([
    // JS/TS 자리
    'true', 'false', 'null', 'undefined', 'void', 'any', 'unknown',
    'string', 'number', 'boolean', 'object', 'array', 'function',
    'const', 'let', 'var', 'class', 'this', 'super', 'new', 'return',
    'await', 'async', 'throw', 'try', 'catch', 'finally',
    // 일반 영어
    'Stop', 'stop', 'Continue', 'continue', 'Error', 'error', 'Warning', 'warning',
    'Yes', 'yes', 'No', 'no', 'OK', 'ok', 'TODO', 'FIXME',
    'IMPORTANT', 'NOTE', 'WARNING', 'ERROR',
    // 자리 자리 자리 자리 일반 동사
    'add', 'remove', 'delete', 'update', 'create', 'get', 'set', 'find',
    // 색
    'red', 'green', 'blue', 'gray', 'grey',
    // 자리 자리
    'Tab', 'tab', 'Enter', 'enter', 'Space', 'space',
    // 자리 자리 자리 자리
    'A', 'B', 'C', 'D', 'E', 'F',
]);

function isValidEng(term) {
    if (term.length < 2) return false;
    if (term.length === 2 && term !== term.toUpperCase()) return false; // 2자리 자리 자리 대문자 약어만 (AI, ML)
    if (STOPWORDS.has(term)) return false;
    if (STOPWORDS.has(term.toLowerCase())) return false;
    // 자리 자리 자리 자리 - 길이 12+ 인 영어 자리 자리 자리 자리 자리 문장 자리 가능성 자리
    if (term.length > 30) return false;
    return true;
}

// definition 자리 자리 자리 비움 — Vertex Opus 결로 일괄 생성
function extractDef() {
    return '';
}

function extract() {
    const dir = path.join(ROOT, 'content/claude_code');
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'));
    const entries = new Map();

    for (const file of files) {
        const m = file.match(/^(\d+)_(\d+)_/);
        if (!m) continue;
        const chapterId = `${parseInt(m[1])}.${parseInt(m[2])}`;
        const txt = fs.readFileSync(path.join(dir, file), 'utf-8');

        // 1. **한국어(영어)** 자리
        const reKr = new RegExp(PATTERN_KR.source, 'g');
        let match;
        while ((match = reKr.exec(txt)) !== null) {
            const term = match[1].trim();
            const abbr = match[2].trim();
            if (term.length < 2 || term.length > 18) continue;
            const key = `kr::${term}`;
            if (!entries.has(key)) {
                const tail = txt.slice(match.index + match[0].length, match.index + match[0].length + 300);
                entries.set(key, { term, abbr, definition: extractDef(tail), chapters: new Set([chapterId]) });
            } else {
                entries.get(key).chapters.add(chapterId);
            }
        }

        // 2. **영어** 단독 자리
        const reEng = new RegExp(PATTERN_ENG.source, 'g');
        while ((match = reEng.exec(txt)) !== null) {
            const term = match[1].trim();
            if (!isValidEng(term)) continue;
            const key = `eng::${term}`;
            if (!entries.has(key)) {
                const tail = txt.slice(match.index + match[0].length, match.index + match[0].length + 300);
                entries.set(key, { term, abbr: null, definition: extractDef(tail), chapters: new Set([chapterId]) });
            } else {
                entries.get(key).chapters.add(chapterId);
            }
        }
    }

    return Array.from(entries.values())
        .map((e) => ({
            ...e,
            chapters: Array.from(e.chapters).sort((a, b) => {
                const [a1, a2] = a.split('.').map(Number);
                const [b1, b2] = b.split('.').map(Number);
                return a1 - b1 || a2 - b2;
            }),
        }))
        .sort((a, b) => a.chapters[0].localeCompare(b.chapters[0]) || a.term.localeCompare(b.term));
}

const entries = extract();
console.error(`claude v3: ${entries.length} entries`);

const esc = (s) => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
for (const e of entries) {
    const abbr = e.abbr ? `, abbr: '${esc(e.abbr)}'` : '';
    const def = `'${esc(e.definition || '')}'`;
    const chapters = e.chapters.map((c) => `'${c}'`).join(', ');
    console.log(`    { book: 'claude', term: '${esc(e.term)}'${abbr}, definition: ${def}, chapters: [${chapters}], category: '기타' },`);
}
